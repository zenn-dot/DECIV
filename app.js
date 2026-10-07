import { t, tl, setLang, lang, LANGS } from './i18n.js';
import * as C from './calc.js';
import * as AI from './aiService.js';
import * as ST from './storage.js';
const $ = s => document.querySelector(s), app = $('#app'), sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SY = { KZT: '₸', USD: '$', EUR: '€' }, M = (v, c) => (v < 0 ? '−' : '') + SY[c || 'KZT'] + Math.round(Math.abs(v)).toLocaleString('en-US');
const MM = (v, c = 'KZT') => { const a = Math.abs(v), s = v < 0 ? '−' : ''; return s + SY[c] + (a >= 1e6 ? (a / 1e6).toFixed(2) + 'M' : a >= 1e3 ? Math.round(a / 1e3) + 'K' : Math.round(a)); };
const P = v => v.toFixed(1) + '%', dt = d => new Date(d).toLocaleDateString(lang == 'kz' ? 'kk-KZ' : lang == 'ru' ? 'ru-RU' : 'en-US', { month: 'short', day: 'numeric' });
const ICON = { ACCEPT: '🟢', NEGOTIATE: '🟡', REJECT: '🔴' }, bdg = d => `<span class="bd b-${d}">${t(d)}</span>`;
let UI = ST.ui(), U = ST.session(), D = U && ST.getData(U); if (U && !D) { ST.logout(); U = D = null; }
let page = U ? 'dash' : 'land', authMode = 'login', draft = null, cur = null, flt = 'all', q = '', sim = {}, note = '', authErr = '', opened = false, fromOrders = false, pending = null;
setLang(UI.lang); AI.setAILang(UI.lang);
const S = () => (D ? D.settings : C.DEFAULTS), toast = m => { const e = document.createElement('div'); e.className = 'toast'; e.textContent = m; document.body.append(e); setTimeout(() => e.remove(), 2800); };
const FK = ['customer', 'product', 'qty', 'revenue', 'materials', 'labor', 'logistics', 'overhead', 'tax', 'other', 'payDays', 'deadlineDays', 'target', 'cur'], NUM = new Set(FK.slice(2, 13));
const grab = () => { if ($('#f_customer')) { draft = draft || {}; FK.forEach(k => draft[k] = $('#f_' + k).value); draft.src = $('#src').value; } };
function dealFrom(x) {
  const s = S(), n = k => (x[k] === '' || x[k] == null) ? 0 : Number(x[k]);
  const d = { customer: (x.customer || '').trim(), product: (x.product || '').trim(), qty: n('qty') || 1, revenue: n('revenue'), materials: n('materials'), labor: n('labor'), logistics: n('logistics'), overhead: n('overhead'), other: n('other'), payDays: n('payDays'), deadlineDays: (x.deadlineDays === '' || x.deadlineDays == null) ? 30 : Number(x.deadlineDays), target: n('target') || s.target, cur: x.cur || s.cur, risks: x.risks || [] };
  d.tax = (x.tax === '' || x.tax == null) ? d.revenue * s.taxPct / 100 : n('tax');
  const v = [d.qty, d.revenue, d.materials, d.labor, d.logistics, d.overhead, d.other, d.tax, d.payDays, d.deadlineDays, d.target];
  if (!d.customer && !d.revenue && !d.materials && !d.labor) return { err: 'e_empty' };
  if (v.some(z => !Number.isFinite(z))) return { err: 'e_badNum' };
  if (v.some(z => z < 0)) return { err: 'e_neg' };
  if (d.revenue <= 0 || d.target >= 100) return { err: 'e_badNum' };
  return { d };
}
function showLoad(i) { let o = $('#ov'); if (!o) { o = document.createElement('div'); o.id = 'ov'; o.className = 'ov'; document.body.append(o); } o.innerHTML = `<div class="card"><div class="sp"></div><b>${tl('ld')[i]}</b><div class="mu" style="font-size:12px;margin-top:6px">${t('calcNote')}</div></div>`; }
const hideLoad = () => $('#ov') && $('#ov').remove();
async function readFile(f) {
  const ext = f.name.split('.').pop().toLowerCase();
  if (f.size > 4e6) throw new AI.AIError('badFile');
  if (['txt', 'csv', 'md'].includes(ext)) return { text: await f.text() };
  const mime = { pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' }[ext];
  if (!mime) throw new AI.AIError('badFile');
  const b64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.onerror = rej; r.readAsDataURL(f); });
  return { file: { mime, b64 } };
}
async function extract() {
  grab(); const txt = (draft && draft.src || '').trim(), f = $('#file').files[0];
  if (!txt && !f) return toast(t('e_empty'));
  showLoad(0);
  try {
    const inp = f ? await readFile(f) : { text: txt }; showLoad(1);
    const { deal, missing } = await AI.extractDealData(inp);
    draft = { ...draft, ...deal, src: draft.src, risks: deal.risks }; note = missing.length ? t('missing') : t('extracted'); hideLoad(); render(1);
  } catch (e) { hideLoad(); toast(t(AI.errKey(e))); }
}
async function analyze() {
  grab(); const r = dealFrom(draft || {}); if (r.err) return toast(t(r.err));
  const d = r.d, st = async i => { showLoad(i); await sleep(350); }; let warn = '';
  await st(0); await st(1);
  if (S().ai) { try { const rs = await AI.analyzeRisks(d, (draft.src || '')); const seen = new Set(d.risks.map(x => x.type + x.text)); rs.forEach(x => { if (!seen.has(x.type + x.text)) d.risks.push(x); }); } catch (e) { warn = t(AI.errKey(e)); } }
  await st(2); const res = C.calculateDecision(d, S()); await st(3); await st(4); hideLoad();
  cur = { deal: d, res, id: null }; opened = false; fromOrders = false; page = 'result'; sim = initSim(); render(); if (warn) toast(warn); explain();
}
async function explain() {
  if (!S().ai || !cur) return; const c = cur;
  try { const rc = C.calculateRecommendations(c.deal, c.res), txt = await AI.generateExplanation(c.deal, c.res, rc); if (cur === c && $('#aiex')) $('#aiex').textContent = txt; }
  catch (e) { if ($('#aiex')) $('#aiex').textContent = t(AI.errKey(e)); }
}
const initSim = () => ({ p: 0, m: 0, l: 0, g: 0, q: 100, d: cur ? cur.deal.deadlineDays : 14 });
function saveCur(deal, res) {
  const a = { id: Date.now(), date: new Date().toISOString().slice(0, 10), deal, revenue: res.rev, trueCost: res.adjCost, profit: res.adjProfit, margin: res.adjMargin, decision: res.decision, loss: res.loss, risks: riskKeys(deal, res) };
  D.analyses.unshift(a); ST.saveData(U, D); return a;
}
function riskKeys(d, r) { const k = []; const a = r.adj.a; if (a.materials) k.push(0); if (a.logistics) k.push(1); if (a.payment) k.push(2); if (a.deadline) k.push(3); if ((d.risks || []).some(x => x.type == 'other')) k.push(4); return k; }
function reasons(d, r) {
  const l = (d.risks || []).filter(x => !(x.type == 'payment' && r.adj.a.payment) && !(x.type == 'deadline' && r.adj.a.deadline)).map(x => esc(x.text));
  if (r.adj.a.payment) l.push(t('rkPay').replace('{0}', d.payDays)); if (r.adj.a.deadline) l.push(t('rkDl'));
  return l.length ? l : [t('rkNone')];
}
function recHTML(d, r) {
  const rc = C.calculateRecommendations(d, r); if (!rc.length) return `<p>${t('none')}</p>`;
  const L = tl('rec'), tx = o => o.k == 'price' ? `${L[0]} <b>+${M(o.amt, d.cur)}</b> (${P(o.pct)})` : o.k == 'mat' ? `${L[1]} <b>${P(o.pct)}</b>` : o.k == 'log' ? `${L[2]} <b>${P(o.pct)}</b>` : `${L[3]} <b>+${o.days} ${t('days')}</b>`;
  return rc.map((o, i) => (i ? `<div class="mu" style="text-align:center;font-size:12px">${t('or')}</div>` : '') + `<div class="opt">${tx(o)}</div>`).join('');
}
function resView() {
  const { deal: d, res: r } = cur, L = tl('rm'), m = [M(r.rev, d.cur), M(r.adjCost, d.cur), M(r.adjProfit, d.cur), P(r.margin), P(r.adjMargin), M(r.loss, d.cur)];
  const isSaved = cur.id && D.analyses.some(a => a.id == cur.id);
  return `<div class="card vd ${r.decision}"><div class="mu">${esc(d.customer)} · ${esc(d.product)}</div><h2>${ICON[r.decision]} ${t(r.decision)}</h2><p style="margin:6px 0 0">${t('v_' + r.decision)}</p></div>
<div class="grid">${L.map((x, i) => `<div class="card st"><small>${x}</small><b>${m[i]}</b></div>`).join('')}</div>
<div class="grid g2"><div class="card"><h3>${t('why')}</h3><ul>${reasons(d, r).map(x => `<li>${x}</li>`).join('')}</ul></div><div class="card"><h3>${t('chg')}</h3>${recHTML(d, r)}</div></div>
<div class="card"><h3>${t('aiExp')}</h3><div id="aiex" class="mu">${S().ai ? t('aiLoad') : '—'}</div><div class="mu" style="font-size:12px;margin-top:8px">${t('calcNote')}</div></div>
<div class="row">${isSaved ? `<span class="mu">${t('saved')}</span>` : `<button class="btn" data-a="save">${t('save')}</button>`}<button class="btn sec" data-a="sim">${t('whatif')}</button><button class="btn sec" data-go="${fromOrders ? 'orders' : 'new'}">${t('back')}</button></div>`;
}
function simOut() {
  const g = k => +$('#s_' + k).value; sim = { p: g('p'), m: g('m'), l: g('l'), g: g('g'), q: g('q'), d: g('d') };
  ['p', 'm', 'l', 'g'].forEach(k => $('#v_' + k).textContent = (sim[k] > 0 ? '+' : '') + sim[k] + '%'); $('#v_q').textContent = sim.q + '%'; $('#v_d').textContent = sim.d;
  const { deal, res } = C.calculateScenarios(cur.deal, sim, S()), b = cur.res, c = deal.cur, L = tl('rm');
  $('#so').innerHTML = `<div class="grid">${[[L[0], M(res.rev, c)], [L[1], M(res.adjCost, c)], [L[2], M(res.adjProfit, c)], [L[4], P(res.adjMargin)]].map(x => `<div class="card st"><small>${x[0]}</small><b>${x[1]}</b></div>`).join('')}</div><div class="card vd ${res.decision}"><span class="mu">${t('now')}: ${P(b.adjMargin)} → ${t('aft')}: <b>${P(res.adjMargin)}</b></span><h2>${ICON[res.decision]} ${t(res.decision)}</h2></div>`;
}
const num = (k, i, d) => `<label>${tl('fl')[i]}<input id="f_${k}" type="number" min="0" value="${esc(d[k] ?? '')}"></label>`;
function view() {
  const A = D.analyses, s = S(), c = s.cur;
  if (page == 'dash') {
    const real = A.length > 0, n = A.length, risk = A.filter(a => a.decision != 'ACCEPT').length, avg = n ? A.reduce((x, a) => x + a.margin, 0) / n : 0, prev = A.filter(a => a.decision != 'ACCEPT').reduce((x, a) => x + a.loss, 0);
    const v = real ? [n, risk, MM(prev, c), P(avg)] : [128, 17, '₸2.84M', '18.7%'];
    return `<div class="grid">${tl('k').map((x, i) => `<div class="card st"><small>${x}</small><b>${v[i]}</b></div>`).join('')}</div>${real ? '' : `<p class="mu">${t('demoLbl')}</p>`}<div class="row" style="margin:6px 0 16px"><button class="btn" data-go="new">${tl('nav')[1]}</button><button class="btn sec" data-a="demo">${t('tryDeal')}</button></div><div class="card"><h3>${t('recent')}</h3>${A.length ? tbl(A.slice(0, 5), [0, 1, 2, 6, 5, 7]) : `<p class="mu">${t('noOrd')}</p>`}</div><p class="mu" style="font-size:13px">${t('calcNote')}</p>`;
  }
  if (page == 'new') {
    const d = draft || { cur: c, overhead: s.over, target: s.target, payDays: 30, deadlineDays: 14, qty: 1 };
    return `<div class="card"><h2>${t('newT')}</h2><p class="mu">${t('newS')}</p><label>${t('srcL')}<textarea id="src">${esc(d.src || '')}</textarea></label><div class="row" style="margin-top:10px"><label style="flex:1;min-width:200px">${t('upl')}<input id="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.csv,.md"></label></div><div class="row" style="margin-top:10px"><button class="btn" data-a="extract">${t('extract')}</button><button class="btn sec" data-a="demo">${t('tryDeal')}</button></div>${note ? `<p class="mu">${note}</p>` : ''}</div>
<div class="card"><div class="fg"><label>${tl('fl')[0]}<input id="f_customer" value="${esc(d.customer || '')}"></label><label>${tl('fl')[1]}<input id="f_product" value="${esc(d.product || '')}"></label>${num('qty', 2, d)}${num('revenue', 3, d)}${num('materials', 4, d)}${num('labor', 5, d)}${num('logistics', 6, d)}${num('overhead', 7, d)}${num('tax', 8, d)}${num('other', 9, d)}${num('payDays', 10, d)}${num('deadlineDays', 11, d)}${num('target', 12, d)}<label>${tl('fl')[13]}<select id="f_cur">${Object.keys(SY).map(x => `<option ${(d.cur || c) == x ? 'selected' : ''}>${x}</option>`).join('')}</select></label></div><button class="btn" data-a="analyze" style="margin-top:16px">${t('analyze')}</button></div><p class="mu" style="font-size:13px">${t('calcNote')}</p>`;
  }
  if (page == 'result' && cur) return resView();
  if (page == 'sim' && cur) return `<div class="card"><h2>${t('whatif')}</h2><div class="mu">${esc(cur.deal.customer)} · ${esc(cur.deal.product)}</div><div class="fg" style="margin-top:12px">${[['p', -30, 30, .5], ['m', -30, 30, .5], ['l', -30, 30, .5], ['g', -30, 30, .5], ['q', 50, 200, 5], ['d', 3, 30, 1]].map((x, i) => `<label>${tl('sl')[i]} <b id="v_${x[0]}"></b><input type="range" id="s_${x[0]}" min="${x[1]}" max="${x[2]}" step="${x[3]}" value="${sim[x[0]]}"></label>`).join('')}</div><div class="row" style="margin-top:14px"><button class="btn" data-a="apply">${t('apply')}</button><button class="btn sec" data-a="reset">${t('reset')}</button><button class="btn sec" data-a="savescn">${t('saveScn')}</button><button class="btn sec" data-go="result">${t('back')}</button></div></div><div id="so"></div>`;
  if (page == 'orders') {
    const f = a => (flt == 'all' || (flt == 'risk' ? a.decision != 'ACCEPT' : a.decision == flt.toUpperCase())) && (a.deal.customer + ' ' + a.deal.product).toLowerCase().includes(q.toLowerCase());
    return `<div class="row" style="margin-bottom:14px">${['all', 'accept', 'negotiate', 'reject', 'risk'].map((k, i) => `<button class="chip ${flt == k ? 'on' : ''}" data-flt="${k}">${tl('flt')[i]}</button>`).join('')}<input id="q" placeholder="${t('search')}" value="${esc(q)}" style="max-width:260px;margin:0"></div><div class="card">${A.length ? tbl(A.filter(f), [0, 1, 2, 3, 4, 5, 6, 7, 8]) : `<p class="mu">${t('noOrd')}</p>`}</div>`;
  }
  if (page == 'an') {
    const real = A.length > 0, demo = { n: 128, avg: 18.7, rev: 412e6, loss: 2.84e6, acc: 94, neg: 24, rej: 10, rk: [31, 22, 18, 12, 5], tr: [14.2, 15.8, 16.1, 17.4, 18.1, 18.7] };
    const cnt = k => A.filter(a => a.decision == k).length, rk = [0, 0, 0, 0, 0]; A.forEach(a => a.risks.forEach(i => rk[i]++));
    const v = real ? { avg: A.reduce((x, a) => x + a.margin, 0) / A.length, rev: A.reduce((x, a) => x + a.revenue, 0), loss: A.reduce((x, a) => x + a.loss, 0), acc: cnt('ACCEPT'), neg: cnt('NEGOTIATE'), rej: cnt('REJECT'), rk, tr: [...A].reverse().map(a => a.margin) } : demo;
    const kp = [P(v.avg), MM(v.rev, c), MM(v.loss, c), v.acc, v.neg, v.rej], mx = Math.max(1, ...v.rk), tr = v.tr, lo = Math.min(...tr, 0), hi = Math.max(...tr, 1), X = i => 20 + (tr.length > 1 ? i * 260 / (tr.length - 1) : 130), Y = y => 100 - (y - lo) / (hi - lo || 1) * 80;
    return `${real ? '' : `<p class="mu">${t('demoLbl')}</p>`}<div class="grid">${tl('an').map((x, i) => `<div class="card st"><small>${x}</small><b>${kp[i]}</b></div>`).join('')}</div><div class="grid g2"><div class="card"><h3>${t('trend')}</h3><svg viewBox="0 0 300 120" width="100%"><polyline fill="none" stroke="var(--ac)" stroke-width="3" points="${tr.map((y, i) => X(i) + ',' + Y(y)).join(' ')}"/>${tr.map((y, i) => `<circle cx="${X(i)}" cy="${Y(y)}" r="4" fill="var(--ac)"/>`).join('')}</svg></div><div class="card"><h3>${t('topR')}</h3>${tl('rn').map((x, i) => `<div>${x} <span class="mu">· ${v.rk[i]}</span></div><div class="bar"><i style="width:${v.rk[i] / mx * 100}%"></i></div>`).join('')}</div></div>`;
  }
  if (page == 'pf') {
    const p = D.profile, L = tl('pf'), inp = (g, k, i, ty = 'number', v) => `<label>${L[i]}<input data-${g}="${k}" type="${ty}" value="${esc(v ?? (g == 'p' ? p[k] : s[k]))}"></label>`, sel = (k, i, o) => `<label>${L[i]}<select data-s="${k}">${o.map(x => `<option value="${x[0]}" ${x[2] ? 'selected' : ''}>${x[1]}</option>`).join('')}</select></label>`;
    return `<div class="card"><div class="fg">${inp('p', 'name', 0, 'text')}${inp('p', 'company', 1, 'text')}${inp('p', 'email', 2, 'email')}${inp('p', 'role', 3, 'text')}${sel('cur', 4, Object.keys(SY).map(x => [x, x, s.cur == x]))}${inp('s', 'target', 5)}${inp('s', 'taxPct', 6)}${inp('s', 'over', 7)}${inp('s', 'maxInc', 8)}${inp('s', 'matR', 9)}${inp('s', 'logR', 10)}${inp('s', 'rate', 11)}<label>${L[12]}<select data-ui="lang">${LANGS.map(x => `<option value="${x}" ${lang == x ? 'selected' : ''}>${x.toUpperCase()}</option>`).join('')}</select></label><label>${L[13]}<select data-ui="theme"><option value="light" ${UI.theme == 'light' ? 'selected' : ''}>${L[14]}</option><option value="dark" ${UI.theme == 'dark' ? 'selected' : ''}>${L[15]}</option></select></label><label><input type="checkbox" data-s="ai" ${s.ai ? 'checked' : ''}> ${L[16]}</label></div><button class="btn" data-a="psave" style="margin-top:16px">${t('savech')}</button></div>`;
  }
  return '';
}
function tbl(rows, cols) {
  const c = [a => esc(a.deal.customer), a => esc(a.deal.product), a => M(a.revenue, a.deal.cur), a => M(a.trueCost, a.deal.cur), a => M(a.profit, a.deal.cur), a => P(a.margin), a => bdg(a.decision), a => dt(a.date), a => tl('st')[a.decision == 'ACCEPT' ? 0 : 1]];
  return `<div class="tw"><table><tr>${cols.map(i => `<th>${tl('oh')[i]}</th>`).join('')}</tr>${rows.map(a => `<tr class="cl" data-open="${a.id}">${cols.map(i => `<td>${c[i](a)}</td>`).join('')}</tr>`).join('')}</table></div>`;
}
const topCtl = (x = '') => `<div class="ctl"><div class="seg">${LANGS.map(l => `<button data-lang="${l}" class="${lang == l ? 'on' : ''}">${l.toUpperCase()}</button>`).join('')}</div><button class="ib" data-a="theme" aria-label="theme">${UI.theme == 'dark' ? '☀' : '☾'}</button>${x}</div>`;
function landing() {
  const d = C.DEMO_DEAL, r = C.calculateDecision(d, C.DEFAULTS), L = tl('rm'), pr = (k, cls = '') => { const l = tl(k); return `<div class="card ${cls}"><h3>${l[0]}</h3><ul>${l.slice(1).map(x => `<li>${x}</li>`).join('')}</ul></div>`; };
  return `<div class="wrap"><div class="lt"><div class="logo">DECIV<small>${t('sub')}</small></div>${topCtl(`<button class="btn sec" data-go="auth">${t('login')}</button>`)}</div></div>
<div class="wrap hero"><h1>DECIV</h1><p class="mu">${t('sub')}</p><h2>${t('tag')}</h2><p class="mu">${t('hero')}</p><div class="row"><button class="btn" data-a="guest">${t('demo')}</button><button class="btn sec" data-a="reg">${t('create')}</button></div></div>
<div class="wrap"><div class="card vd ${r.decision}"><div class="mu">${d.customer} · ${d.product}</div><h2>${ICON[r.decision]} ${t(r.decision)}</h2><div class="row mu" style="gap:24px;margin-top:8px">${[0, 2, 4].map(i => `<span>${L[i]}: <b style="color:var(--tx)">${[M(r.rev), '', M(r.adjProfit), '', P(r.adjMargin)][i]}</b></span>`).join('')}</div></div>
<h2>${t('how')}</h2><div class="grid">${tl('h1').map((x, i) => `<div class="card"><b>${i + 1}. ${x}</b><p class="mu">${tl('hs')[i]}</p></div>`).join('')}</div>
<h2>${t('built')}</h2><div class="row" style="margin-bottom:16px">${tl('seg').map(x => `<span class="chip">${x}</span>`).join('')}</div>
<h2>${t('prT')}</h2><div class="grid">${pr('prFree')}${pr('prPro')}${pr('prBiz')}</div><p class="mu" style="text-align:center">DECIV — ${t('tag')}</p></div>`;
}
function authView() {
  const reg = authMode == 'reg', f = (id, l, ty = 'text') => `<label>${l}<input id="a_${id}" type="${ty}"></label>`;
  return `<div class="wrap"><div class="lt"><div class="logo">DECIV</div>${topCtl(`<button class="btn sec" data-go="land">${t('back')}</button>`)}</div><div class="card au"><h2>${reg ? t('reg') : t('login')}</h2>${reg ? f('name', tl('pf')[0]) + f('company', tl('pf')[1]) : ''}${f('email', t('email'), 'email')}${f('pw', t('pw'), 'password')}<div class="err">${authErr ? t(authErr) : ''}</div><button class="btn" data-a="${reg ? 'doreg' : 'dolog'}" style="width:100%">${reg ? t('reg') : t('login')}</button><p class="mu">${reg ? t('haveAcc') : t('noAcc')} <a href="#" data-a="swap" style="color:var(--ac)">${reg ? t('login') : t('create')}</a></p></div></div>`;
}
function render(skip) {
  if (!skip) grab(); document.documentElement.dataset.theme = UI.theme; document.documentElement.lang = lang == 'kz' ? 'kk' : lang;
  if (!U) { app.innerHTML = page == 'auth' ? authView() : landing(); return; }
  const ks = ['dash', 'new', 'orders', 'an', 'pf'], ic = ['▦', '＋', '☰', '◔', '⚙'], on = page == 'result' || page == 'sim' ? (fromOrders ? 'orders' : 'new') : page, p = D.profile, N = tl('nav');
  const title = page == 'dash' ? t('dashT') : page == 'sim' ? t('whatif') : page == 'result' ? t('newT') : N[ks.indexOf(on)];
  app.innerHTML = `<aside class="side"><div class="logo">DECIV<small>${t('sub')}</small></div>${ks.map((k, i) => `<button class="nv ${on == k ? 'on' : ''}" data-go="${k}"><span>${ic[i]}</span>${N[i]}</button>`).join('')}</aside><main><header class="top"><h1>${title}</h1>${topCtl(`<button class="av" data-go="pf"><i>${esc((p.name || '?').slice(0, 2).toUpperCase())}</i><span>${esc(p.name)}</span></button><button class="ib" data-a="logout">${t('logout')}</button>`)}</header><section>${view()}</section></main>`;
  if (page == 'sim' && cur) { document.querySelectorAll('input[type=range]').forEach(e => e.oninput = simOut); simOut(); }
}
function loadDemo() { draft = { ...C.DEMO_DEAL, src: '' }; note = ''; page = 'new'; render(1); toast('✓ ' + C.DEMO_DEAL.customer); }
async function authGo(reg) {
  const v = id => ($('#a_' + id) || {}).value || '', r = reg ? await ST.register({ name: v('name'), company: v('company'), email: v('email'), password: v('pw') }) : await ST.login(v('email'), v('pw'));
  if (r.err) { authErr = r.err; return render(); }
  U = r.email; D = ST.getData(U); authErr = ''; page = 'dash'; render();
}
document.addEventListener('input', e => { if (e.target.id == 'q') { q = e.target.value; const p = e.target.selectionStart; render(); const n = $('#q'); n.focus(); n.setSelectionRange(p, p); } });
document.addEventListener('click', async e => {
  const c = s => e.target.closest(s); let x;
  if ((x = c('[data-lang]'))) { UI.lang = x.dataset.lang; ST.setUi(UI); setLang(UI.lang); AI.setAILang(UI.lang); return render(); }
  if ((x = c('[data-go]'))) { grab(); page = x.dataset.go; if (page == 'new') { fromOrders = false; } authErr = ''; render(); if (page == 'result') explain(); return; }
  if ((x = c('[data-flt]'))) { flt = x.dataset.flt; return render(); }
  if ((x = c('[data-open]'))) { const a = D.analyses.find(z => z.id == x.dataset.open), r = C.calculateDecision(a.deal, S()); cur = { deal: a.deal, res: r, id: a.id }; fromOrders = true; page = 'result'; sim = initSim(); render(); return explain(); }
  if (!(x = c('[data-a]'))) return; const a = x.dataset.a; if (a == 'swap') e.preventDefault();
  if (a == 'theme') { UI.theme = UI.theme == 'dark' ? 'light' : 'dark'; ST.setUi(UI); render(); }
  else if (a == 'guest') { U = ST.guest(); D = ST.getData(U); loadDemo(); }
  else if (a == 'reg') { authMode = 'reg'; page = 'auth'; render(); }
  else if (a == 'swap') { authMode = authMode == 'reg' ? 'login' : 'reg'; authErr = ''; render(); }
  else if (a == 'doreg') authGo(true); else if (a == 'dolog') authGo(false);
  else if (a == 'logout') { ST.logout(); U = D = cur = draft = null; page = 'land'; render(); }
  else if (a == 'demo') loadDemo();
  else if (a == 'extract') extract(); else if (a == 'analyze') analyze();
  else if (a == 'save') { cur.id = saveCur(cur.deal, cur.res).id; render(); explain(); toast(t('saved')); }
  else if (a == 'sim') { sim = initSim(); page = 'sim'; render(); }
  else if (a == 'reset') { sim = initSim(); render(); }
  else if (a == 'apply') { const s = C.recommendedScenario(cur.deal, S(), { q: sim.q, d: sim.d }); if (!s) return toast(t('noRec')); sim = { ...sim, ...s, m: sim.m, l: sim.l, g: sim.g }; render(); }
  else if (a == 'savescn') { const { deal, res } = C.calculateScenarios(cur.deal, sim, S()); saveCur(deal, res); toast(t('saved')); }
  else if (a == 'psave') {
    const nd = JSON.parse(JSON.stringify(D)); document.querySelectorAll('[data-p],[data-s]').forEach(i => { const g = i.dataset.p ? 'p' : 's', k = i.dataset.p || i.dataset.s, v = i.type == 'checkbox' ? i.checked : i.type == 'number' ? Number(i.value) : i.value; if (g == 'p') nd.profile[k] = v; else nd.settings[k] = v; });
    const s = nd.settings; if ([s.target, s.taxPct, s.over, s.maxInc, s.matR, s.logR, s.rate].some(v => !Number.isFinite(v) || v < 0) || s.target >= 100) return toast(t('e_neg'));
    const r = ST.saveAll(U, nd); if (r.err) return toast(t(r.err)); U = r.email; D = nd; toast(t('ok')); render();
  }
});
document.addEventListener('change', e => { const k = e.target.dataset.ui; if (!k) return; UI[k] = e.target.value; ST.setUi(UI); if (k == 'lang') { setLang(UI.lang); AI.setAILang(UI.lang); } render(); });
render();
