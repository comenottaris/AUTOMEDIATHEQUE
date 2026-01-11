// scripts/sync-supabase-ressources.js
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/sync-supabase-ressources.js

const fs = require('fs');
const path = require('path');
const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(2);
}

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data');
const OUT_FILE = path.join(DATA_DIR, 'ressources.json');
const STATE_FILE = path.join(DATA_DIR, 'supabase-state-ressources.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function fetchJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'GET', headers }, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`HTTP ${res.statusCode} - ${body.slice(0,400)}`));
        }
        try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  try {
    console.log('Fetching ressources from Supabase...');
    // Adapt the REST endpoint according to your schema/table name
    const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/ressources?select=*&status=eq.validated&order=created_at.asc`;
    const headers = {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: 'application/json'
    };

    const rows = await fetchJson(url, headers);
    console.log(`Fetched ${Array.isArray(rows) ? rows.length : 0} rows`);

    // Normalize rows into the front-end shape expected
    const normalized = (rows || []).map(r => {
      // copy relevant fields and normalize tags/languages/links
      const norm = { ...r };
      const toArray = v => {
        if (!v && v !== 0) return [];
        if (Array.isArray(v)) return v;
        if (typeof v === 'string') {
          try {
            const parsed = JSON.parse(v);
            if (Array.isArray(parsed)) return parsed;
            if (typeof parsed === 'object') return [parsed];
          } catch (e) {
            // fallback: comma separated
            return v.split(',').map(s => s.trim()).filter(Boolean);
          }
        }
        return Array.isArray(v) ? v : [String(v)];
      };
      norm.tags = toArray(r.tags).map(t => String(t).toLowerCase());
      norm.languages = toArray(r.languages).map(l => String(l).toLowerCase());
      // links: try to produce [{ href, title }]
      const linksRaw = toArray(r.links);
      norm.links = linksRaw.map(li => {
        if (!li) return null;
        if (typeof li === 'string') return { href: li, title: li };
        if (li.href) return { href: li.href, title: li.title || li.href };
        if (li.url) return { href: li.url, title: li.title || li.url };
        return { href: String(li), title: String(li) };
      }).filter(Boolean);

      return norm;
    });

    fs.writeFileSync(OUT_FILE, JSON.stringify(normalized, null, 2), 'utf8');
    console.log('Wrote', OUT_FILE);

    const lastImportedAt = (rows && rows.length) ? rows[rows.length -1].created_at || new Date().toISOString() : new Date().toISOString();
    const state = { lastImportedAt, fetchedAt: new Date().toISOString(), count: rows.length || 0 };
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
    console.log('Wrote', STATE_FILE);

    process.exit(0);
  } catch (err) {
    console.error('Sync error:', err && err.message ? err.message : err);
    process.exit(3);
  }
})();
