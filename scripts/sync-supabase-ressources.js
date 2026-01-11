// sync-supabase-ressources.js
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node sync-supabase-ressources.js

const fs = require('fs');
const path = require('path');
const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const RESSOURCES_FILE = path.join(DATA_DIR, 'ressources.json');
const PROPOS_FILE = path.join(DATA_DIR, 'propositions.json');
const STATE_FILE = path.join(DATA_DIR, 'supabase-state-ressources.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function fetchJson(url, headers) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'GET', headers }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) return reject(new Error(`HTTP ${res.statusCode} – ${body.slice(0,300)}`));
        try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function readJson(file, def) {
  try { if (!fs.existsSync(file)) return def; return JSON.parse(fs.readFileSync(file,'utf8') || 'null') ?? def; } catch(e) { console.warn('Impossible de lire', file, e); return def; }
}
function writeJson(file, data) { fs.writeFileSync(file, JSON.stringify(data,null,2)+'\n','utf8'); }

function normalizeArrayField(field) {
  // field may be array, string (csv), null/undefined
  if (!field) return [];
  if (Array.isArray(field)) return field.map(s => String(s).trim()).filter(Boolean);
  if (typeof field === 'string') return field.split(',').map(s => s.trim()).filter(Boolean);
  // if it's a JSON representation (object) -> ignore
  return [];
}

function normalizeLinks(raw) {
  // normalize to array of { href, title }
  if (!raw) return [];
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw); } catch(e) { /* leave as string */ }
  }
  if (Array.isArray(raw)) {
    return raw.map(l => {
      if (!l) return null;
      if (typeof l === 'string') return { href: l, title: l };
      return { href: l.href || l.url || l.link || null, title: l.title || l.name || l.href || l.url || null };
    }).filter(Boolean).filter(l => l.href);
  }
  if (typeof raw === 'object') {
    // object map -> convert to array
    return Object.entries(raw).map(([k,v]) => {
      if (typeof v === 'string') return { href: v, title: k };
      if (typeof v === 'object' && v !== null) return { href: v.href || v.url || null, title: v.title || k };
      return null;
    }).filter(Boolean).filter(l => l.href);
  }
  return [];
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant');

  const state = readJson(STATE_FILE, { lastImportedAt: null });
  const lastImportedAt = state.lastImportedAt ? new Date(state.lastImportedAt) : null;

  // get validated ressources (you may adjust filter if needed)
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/ressources?select=*&order=created_at.asc&status=eq.validated&limit=10000`;
  const headers = { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` };

  const rows = await fetchJson(url, headers);

  if (!Array.isArray(rows)) throw new Error('Réponse Supabase inattendue');

  const newRows = rows.filter((row) => {
    if (!row.created_at) return false;
    const d = new Date(row.created_at);
    if (Number.isNaN(d.getTime())) return false;
    if (!lastImportedAt) return true;
    return d > lastImportedAt;
  });

  if (newRows.length === 0) {
    console.log('Aucune nouvelle ressource à importer.');
    return;
  }

  console.log(`Nouvelles ressources : ${newRows.length}`);

  // read existing ressources.json (validated entries)
  const existing = readJson(RESSOURCES_FILE, []);
  if (!Array.isArray(existing)) throw new Error('data/ressources.json doit contenir un tableau JSON');

  let maxDate = lastImportedAt;

  for (const row of newRows) {
    const languages = normalizeArrayField(row.languages);
    const tags = normalizeArrayField(row.tags);
    const links = normalizeLinks(row.links);

    const entry = {
      name: row.name || '(sans titre)',
      url: row.url || null,
      theme: row.theme || row.category || null,
      type: row.type || null,
      country: row.country || null,
      languages,
      tags,
      description: row.description || '',
      links,
      status: row.status || 'validated',
      created_at: row.created_at || new Date().toISOString(),
      source: 'supabase'
    };

    existing.push(entry);

    const d = new Date(row.created_at);
    if (!maxDate || d > maxDate) maxDate = d;
  }

  writeJson(RESSOURCES_FILE, existing);
  writeJson(STATE_FILE, { lastImportedAt: maxDate ? maxDate.toISOString() : null });

  console.log(`Import terminé : ${newRows.length} ajoutées. Dernier import = ${maxDate && maxDate.toISOString()}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
