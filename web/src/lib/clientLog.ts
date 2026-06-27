export function clientLog(level: "info" | "warn" | "error", message: string, context?: unknown) {
  const body = { level, message, context, stack: undefined as string | undefined };
  if (level === "error" && context instanceof Error) {
    body.stack = context.stack;
  }
  fetch("/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {});
}
