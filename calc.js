// calculationService: deterministic financial truth. No AI here.
export const DEFAULTS = { cur: 'KZT', target: 15, taxPct: 0, over: 1500000, maxInc: 10, matR: 9, logR: 18, rate: 12, ai: true };
export const DEMO_DEAL = { customer: 'Qazaq Build', product: 'Custom metal structures', qty: 1, revenue: 12500000, materials: 6100000, labor: 2200000, logistics: 800000, overhead: 1500000, tax: 0, other: 0, payDays: 60, deadlineDays: 8, target: 15, cur: 'KZT', risks: [] };
export const calculateTrueCost = d => d.materials + d.labor + d.logistics + d.overhead + d.other + d.tax;
export const calculateProfit = (rev, cost) => rev - cost;
export const calculateMargin = (rev, profit) => rev > 0 ? profit / rev * 100 : -100;
// Risk surcharges: payment/deadline come from inputs; materials/logistics only if a risk of that type was detected.
export function riskAdjust(d, s) {
  const k = new Set((d.risks || []).map(r => r.type));
  const a = { materials: k.has('materials') ? d.materials * s.matR / 100 : 0, logistics: k.has('logistics') ? d.logistics * s.logR / 100 : 0,
    payment: d.payDays > 30 ? d.revenue * (d.payDays - 30) / 365 * s.rate / 100 : 0, deadline: d.deadlineDays < 10 ? d.labor * 0.035 : 0 };
  return { a, total: a.materials + a.logistics + a.payment + a.deadline };
}
export function calculateDecision(d, s) {
  const rev = d.revenue, trueCost = calculateTrueCost(d), profit = calculateProfit(rev, trueCost), margin = calculateMargin(rev, profit);
  const adj = riskAdjust(d, s), adjCost = trueCost + adj.total, adjProfit = rev - adjCost, adjMargin = calculateMargin(rev, adjProfit);
  const q = d.target / 100, inc = Math.max(0, adjCost / (1 - q) - rev), cut = Math.max(0, adjCost - (1 - q) * rev);
  const decision = adjMargin >= d.target ? 'ACCEPT' : (rev > 0 && inc / rev * 100 <= s.maxInc ? 'NEGOTIATE' : 'REJECT');
  return { rev, trueCost, profit, margin, adj, adjCost, adjProfit, adjMargin, loss: adj.total, inc, cut, decision };
}
export function calculateRecommendations(d, r) {
  if (r.decision === 'ACCEPT') return [];
  const o = [{ k: 'price', amt: r.inc, pct: r.inc / r.rev * 100 }], m = d.materials ? r.cut / d.materials * 100 : Infinity, l = d.logistics ? r.cut / d.logistics * 100 : Infinity;
  if (m <= 50) o.push({ k: 'mat', pct: m }); if (l <= 100) o.push({ k: 'log', pct: l });
  if (r.adj.a.deadline > 0) o.push({ k: 'dl', days: Math.ceil(10 - d.deadlineDays) });
  return o;
}
export function applyScenario(d, c) {
  const q = (c.q ?? 100) / 100, f = (v, p) => v * (1 + (p || 0) / 100) * q;
  return { ...d, revenue: f(d.revenue, c.p), materials: f(d.materials, c.m), labor: f(d.labor, c.l), logistics: f(d.logistics, c.g), tax: f(d.tax, c.p), deadlineDays: c.d ?? d.deadlineDays };
}
export const calculateScenarios = (d, c, s) => { const deal = applyScenario(d, c); return { deal, res: calculateDecision(deal, s) }; };
export function recommendedScenario(d, s, c0 = {}) { for (let p = 0; p <= 30; p += 0.5) { const c = { ...c0, p }; if (calculateScenarios(d, c, s).res.decision === 'ACCEPT') return c; } return null; }
