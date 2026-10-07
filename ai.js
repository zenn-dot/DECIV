// Vercel serverless function. GEMINI_API_KEY lives only in server env vars.
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const SCHEMA = '{"customer":string|null,"product":string|null,"quantity":number|null,"revenue":number|null,"materials":number|null,"labor":number|null,"logistics":number|null,"overhead":number|null,"taxes":number|null,"otherCosts":number|null,"paymentTermsDays":number|null,"paymentTerms":string|null,"deadlineDays":number|null,"currency":"KZT"|"USD"|"EUR"|null,"risks":[{"type":"materials"|"logistics"|"payment"|"deadline"|"other","text":string}]}';
const LN = { en: 'English', ru: 'Russian', kz: 'Kazakh' };
const PROMPT = {
  extract: () => `Extract commercial deal data from the input. Return JSON only: ${SCHEMA}. Use null when a value is not stated; never guess numbers; amounts are totals in the deal currency. Risks only if evidenced in the input. Do NOT calculate profit or margin.`,
  risks: l => `Given a deal (JSON) and optional source notes, list commercial risks that are explicitly supported by the notes or clear signals in the data (type: materials|logistics|payment|deadline|other). Do not invent risks; return an empty list if none. Write texts in ${LN[l]}. Return JSON {"risks":[{"type":string,"text":string}]}. Do not calculate anything.`,
  explain: l => `You receive deal data and RESULTS computed by deterministic code. The numbers are authoritative: never recompute or change them. In ${LN[l]}, explain in 3-4 short sentences why the decision was reached. Return JSON {"text":string}.`,
  recs: l => `You receive computed recommendations (price increase, cost reductions, deadline). In ${LN[l]}, write a short practical negotiation plan (3-4 sentences) using only these numbers. Return JSON {"text":string}.`
};
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, code: 'ai' });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ ok: false, code: 'no_key' });
  const { mode, lang = 'en', text, file, data, notes } = req.body || {};
  if (!PROMPT[mode]) return res.status(400).json({ ok: false, code: 'ai' });
  const parts = [{ text: PROMPT[mode](lang) }];
  if (file && file.b64) parts.push({ inlineData: { mimeType: file.mime, data: file.b64 } });
  else parts.push({ text: 'INPUT:\n' + String(text || JSON.stringify({ deal: data, notes })).slice(0, 30000) });
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseMimeType: 'application/json', temperature: 0.1 } })
    });
    if (!r.ok) return res.status(200).json({ ok: false, code: r.status === 429 ? 'quota' : (r.status === 400 || r.status === 403) ? 'bad_key' : 'ai' });
    const j = await r.json();
    const out = JSON.parse(j.candidates[0].content.parts[0].text);
    return res.status(200).json({ ok: true, data: out });
  } catch (e) { return res.status(200).json({ ok: false, code: 'ai' }); }
};
