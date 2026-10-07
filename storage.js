// storageService: localStorage now; swap internals for Supabase/Firebase later.
import { DEFAULTS } from './calc.js';
const g = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, s = (k, v) => localStorage.setItem(k, JSON.stringify(v));
export const ui = () => g('deciv_ui', { lang: 'ru', theme: matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light' });
export const setUi = v => s('deciv_ui', v);
const hash = async p => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('deciv:' + p)))].map(x => x.toString(16).padStart(2, '0')).join('');
const fresh = (name, company, email) => ({ profile: { name, company, email, role: 'Owner' }, settings: { ...DEFAULTS }, analyses: [] });
export const session = () => g('deciv_session', null);
export const getData = e => g('deciv_data_' + e, null);
export const saveData = (e, d) => s('deciv_data_' + e, d);
export const logout = () => localStorage.removeItem('deciv_session');
export async function register({ name, company, email, password }) {
  email = email.trim().toLowerCase(); const u = g('deciv_users', {});
  if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email) || password.length < 6) return { err: 'e_fields' };
  if (u[email]) return { err: 'e_exists' };
  u[email] = { hash: await hash(password) }; s('deciv_users', u); saveData(email, fresh(name.trim(), company.trim(), email)); s('deciv_session', email); return { email };
}
export async function login(email, password) {
  email = email.trim().toLowerCase(); const u = g('deciv_users', {});
  if (!u[email] || u[email].hash !== await hash(password)) return { err: 'e_cred' };
  s('deciv_session', email); return { email };
}
export function guest() { const e = 'demo@deciv.app'; if (!getData(e)) saveData(e, fresh('Dilnaz', 'Demo Company', e)); s('deciv_session', e); return e; }
export function saveAll(old, d) { // handles email change
  const e = d.profile.email.trim().toLowerCase(); d.profile.email = e;
  if (e !== old) { const u = g('deciv_users', {}); if (u[e] || getData(e)) return { err: 'e_exists' }; if (u[old]) { u[e] = u[old]; delete u[old]; s('deciv_users', u); } localStorage.removeItem('deciv_data_' + old); s('deciv_session', e); }
  saveData(e, d); return { email: e };
}
