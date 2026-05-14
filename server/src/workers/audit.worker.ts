import { redis } from "../integrations/redis.js";
import auditevent from "../models/AuditEvent.js";

const STREAM_KEY = "audit:stream";
const GROUP = "audit-group";
const CONSUMER = "audit-consumer-1";

type StreamMessage = {
  id: string;
  message: Record<string, string>;
};

async function init() {
  try {
    await (redis as any).sendCommand(["XGROUP", "CREATE", STREAM_KEY, GROUP, "0", "MKSTREAM"]);
  } catch (err: any) {
    if (!err.message.includes("BUSYGROUP")) {
      console.error("[audit worker init error]", err);
    }
  }
}

export async function startAuditWorker() {
  await init();

  console.log("[audit worker] started");

  while (true) {
    try {
      const response = (await (redis as any).sendCommand([
        "XREADGROUP",
        "GROUP",
        GROUP,
        CONSUMER,
        "COUNT",
        "10",
        "BLOCK",
        "5000",
        "STREAMS",
        STREAM_KEY,
        ">",
      ])) as any;

      if (!response) continue;

      for (const stream of response) {
        for (const message of stream[1]) {
          const [id, fields] = message;

          const data = Object.fromEntries(
            fields.reduce((acc: any[], val: string, i: number, arr: string[]) => {
              if (i % 2 === 0) acc.push([val, arr[i + 1]]);
              return acc;
            }, []),
          );

          try {
            await auditevent.create({
              event: data.event,
              userId: data.userId,
              userType: data.userType,
              requestId: data.requestId || undefined,
              resourceId: data.resourceId || undefined,
              ip: data.ip || undefined,
              userAgent: data.userAgent || undefined,
              metadata: data.metadata ? JSON.parse(data.metadata) : undefined,
            });

            await (redis as any).sendCommand(["XACK", STREAM_KEY, GROUP, id]);
          } catch (err) {
            console.error("[audit worker failed event]", err);
          }
        }
      }
    } catch (err) {
      console.error("[audit worker loop error]", err);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}
