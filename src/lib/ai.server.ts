// Server-only helper for the Lovable AI Gateway (Responses API, streamed, strict JSON schema).
const MODEL = "openai/gpt-6-astra";

export class AiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function callJson<T>(opts: {
  system: string;
  user: string;
  schemaName: string;
  schema: Record<string, unknown>;
}): Promise<T> {
  const key = process.env['LOVABLE_API_KEY'];
  if (!key) throw new AiError(500, "AI is not configured.");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      store: false,
      reasoning: { effort: "low" },
      instructions: opts.system,
      input: [{ role: "user", content: opts.user }],
      text: { format: { type: "json_schema", name: opts.schemaName, strict: true, schema: opts.schema } },
    }),
  });
  if (!res.ok || !res.body) {
    let msg = "The AI grader failed. Try again.";
    try {
      const j = (await res.json()) as { message?: string; error?: { message?: string } };
      msg = j.message || j.error?.message || msg;
    } catch {
      /* ignore */
    }
    if (res.status === 402) msg = "AI credits have run out. Add credits in Settings → Plans & credits.";
    if (res.status === 429) msg = "Too many requests right now. Wait a moment and try again.";
    console.error("AI gateway error", res.status, msg);
    throw new AiError(res.status, msg);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let text = "";
  let refused = false;
  let finished = false;
  while (!finished) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf("\n\n")) !== -1) {
      const frame = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      for (const line of frame.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const ev = JSON.parse(data) as { type: string; delta?: string; response?: { error?: { message?: string } } };
          if (ev.type === "response.output_text.delta" && ev.delta) text += ev.delta;
          else if (ev.type === "response.completed" || ev.type === "response.incomplete") finished = true;
          else if (ev.type === "response.refusal.delta") refused = true;
          else if (ev.type === "response.failed" || ev.type === "error")
            throw new AiError(500, ev.response?.error?.message || "The AI grader failed.");
        } catch (e) {
          if (e instanceof AiError) throw e;
        }
      }
    }
  }
  if (finished) await reader.cancel().catch(() => {});
  if (refused || !text) throw new AiError(422, "The AI declined to grade this answer.");
  return JSON.parse(text) as T;
}
