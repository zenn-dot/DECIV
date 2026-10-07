// aiService: extraction + explanation only. Talks to /api/ai (key never in the browser).
export class AIError extends Error { constructor(code) { super(code); this.code = code; } }
export const errKey = e => e.code === 'net' ? 'e_net' : e.code === 'badFile' ? 'e_file' : 'e_ai';
let lang = 'ru'; export const setAILang = l => { lang = l; };
async function call(mode, payload) {
  let r, j;
  try { r = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode, lang, ...payload }) }); } catch { throw new AIError('net'); }
  try { j = await r.json(); } catch { throw new AIError('ai'); }
  if (!j.ok) throw new AIError(j.code || 'ai');
  return j.data;
}
const numOrNull = v => (typeof v === 'number' && Number.isFinite(v) && v >= 0) ? v : null;
const TYPES = ['materials', 'logistics', 'payment', 'deadline', 'other'];
export const cleanRisks = a => (Array.isArray(a) ? a : []).filter(x => x && TYPES.includes(x.type) && typeof x.text === 'string').map(x => ({ type: x.type, text: x.text.slice(0, 200) }));
export async function extractDealData(input) { // input: {text} | {file:{mime,b64}}
  const x = await call('extract', input);
  if (!x || typeof x !== 'object') throw new AIError('ai');
  const map = { customer: x.customer, product: x.product, qty: numOrNull(x.quantity), revenue: numOrNull(x.revenue), materials: numOrNull(x.materials), labor: numOrNull(x.labor), logistics: numOrNull(x.logistics), overhead: numOrNull(x.overhead), tax: numOrNull(x.taxes), other: numOrNull(x.otherCosts), payDays: numOrNull(x.paymentTermsDays), deadlineDays: numOrNull(x.deadlineDays), cur: ['KZT', 'USD', 'EUR'].includes(x.currency) ? x.currency : null };
  const deal = {}; Object.entries(map).forEach(([k, v]) => { if (v !== null && v !== undefined && v !== '') deal[k] = v; });
  deal.risks = cleanRisks(x.risks);
  const missing = ['customer', 'revenue', 'materials', 'labor', 'logistics'].filter(k => deal[k] === undefined);
  return { deal, missing };
}
export async function analyzeRisks(deal, notes) { const x = await call('risks', { data: deal, notes }); return cleanRisks(x && x.risks); }
export async function generateExplanation(deal, result, recs) { const x = await call('explain', { data: { deal, result, recs } }); if (!x || typeof x.text !== 'string') throw new AIError('ai'); return x.text; }
export async function generateRecommendations(deal, result, recs) { const x = await call('recs', { data: { deal, result, recs } }); if (!x || typeof x.text !== 'string') throw new AIError('ai'); return x.text; }
