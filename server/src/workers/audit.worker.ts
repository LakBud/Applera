import { redis } from '../integrations/redis.js';
import auditevent from '../models/AuditEvent.js';

const STREAM_KEY = 'audit:stream';
const GROUP = 'audit-group';
const CONSUMER = 'audit-consumer-1';

const r = redis as unknown as { sendCommand: (args: string[]) => Promise<unknown> };

async function init() {
  try {
    await r.sendCommand(['XGROUP', 'CREATE', STREAM_KEY, GROUP, '0', 'MKSTREAM']);
  } catch (err: unknown) {
    if (err instanceof Error && !err.message.includes('BUSYGROUP')) {
      console.error('[audit worker init error]', err);
    }
  }
}

export async function startAuditWorker() {
  await init();

  console.log('[audit worker] started');

  while (true) {
    try {
      const response = (await r.sendCommand([
        'XREADGROUP',
        'GROUP',
        GROUP,
        CONSUMER,
        'COUNT',
        '10',
        'BLOCK',
        '5000',
        'STREAMS',
        STREAM_KEY,
        '>',
      ])) as unknown[];

      if (!response) {
        continue;
      }

      for (const stream of response) {
        for (const message of (stream as unknown[][])[1] as unknown[][]) {
          const [id, fields] = message as [string, string[]];

          const data = Object.fromEntries(
            (fields as string[]).reduce(
              (acc: [string, string][], val: string, i: number, arr: string[]) => {
                if (i % 2 === 0) {
                  acc.push([val, arr[i + 1]]);
                }
                return acc;
              },
              [],
            ),
          );

          try {
            await auditevent.create({
              event: data.event,
              userId: data.userId,
              userType: data.userType as 'user' | 'guest',
              requestId: data.requestId || undefined,
              resourceId: data.resourceId || undefined,
              ip: data.ip || undefined,
              userAgent: data.userAgent || undefined,
              metadata: data.metadata ? JSON.parse(data.metadata) : undefined,
            });

            await r.sendCommand(['XACK', STREAM_KEY, GROUP, id]);
          } catch (err) {
            console.error('[audit worker failed event]', err);
          }
        }
      }
    } catch (err) {
      console.error('[audit worker loop error]', err);
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
}
