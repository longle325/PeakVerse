/**
 * Minimal Server-Sent Events parser for fetch-based POST streams.
 *
 * The standard `EventSource` API can't do POST, but the backend chat
 * endpoint takes a JSON body, so we read the response as a stream and
 * parse the SSE wire format manually.
 *
 * Wire format recap:
 *   event: <name>\n
 *   data: <text>\n
 *   data: <more text>\n   (multi-line data is concatenated with \n)
 *   \n                    (blank line terminates the event)
 *
 * If `event:` is omitted the event name defaults to `"message"`.
 */

export interface SseEvent {
  event: string;
  data: string;
}

export async function* readSseStream(
  body: ReadableStream<Uint8Array>,
  signal?: AbortSignal,
): AsyncGenerator<SseEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let event = "message";
  let dataParts: string[] = [];

  const flush = (): SseEvent | null => {
    if (dataParts.length === 0 && event === "message") return null;
    const out = { event, data: dataParts.join("\n") };
    event = "message";
    dataParts = [];
    return out;
  };

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel().catch(() => {});
        return;
      }
      const { value, done } = await reader.read();
      if (done) {
        // Emit any final unterminated event before exiting.
        const tail = flush();
        if (tail) yield tail;
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buffer.indexOf("\n")) >= 0) {
        const rawLine = buffer.slice(0, nl);
        buffer = buffer.slice(nl + 1);
        const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;

        if (line === "") {
          const out = flush();
          if (out) yield out;
          continue;
        }
        if (line.startsWith(":")) continue; // SSE comment
        const colon = line.indexOf(":");
        const field = colon === -1 ? line : line.slice(0, colon);
        const rawValue = colon === -1 ? "" : line.slice(colon + 1);
        const value = rawValue.startsWith(" ") ? rawValue.slice(1) : rawValue;
        if (field === "event") {
          event = value;
        } else if (field === "data") {
          dataParts.push(value);
        }
        // `id` and `retry` fields are ignored for our use case.
      }
    }
  } finally {
    reader.releaseLock();
  }
}
