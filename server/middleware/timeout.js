// Enforces a hard deadline on requests and closes hung connections.
//
// Without this, a stalled OpenAI call holds the connection open indefinitely.
// Enough of these will exhaust Node's connection pool and take down the server.
//
// The axios/fetch timeout in the LLM client handles the AI call itself,
// but this middleware catches anything else that might stall (DB writes, etc).

/**
 * @param {number} ms  Timeout in milliseconds
 */
export function timeout(ms) {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      if (res.headersSent) return; // response already started — nothing to do
      res.status(503).json({
        error: "Request timed out. The server took too long to respond.",
      });
    }, ms);

    // Clear the timer as soon as the response finishes
    res.on("finish", () => clearTimeout(timer));
    res.on("close", () => clearTimeout(timer));

    next();
  };
}

// ── Named timeouts ────────────────────────────────────────────────────────────

export const aiTimeout = timeout(90_000); // 90s — LLM calls can be slow
