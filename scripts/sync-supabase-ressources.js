// scripts/sync-supabase-ressources.js
// Node 18+ (CommonJS)

const fs = require('fs/promises');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.');
  process.exit(1);
}

const ROOT = path.join(__dirname, '..');
const OUT_FILE = path.join(ROOT, 'data', 'ressources.json');

/**
 * Normalise la colonne links venant de Supabase en :
 *   [ { href: string, title: string }, ... ]
 */
function normalizeLinks(raw) {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((l) => {
        if (!l) return null;
        if (typeof l === 'string') return { href: l, title: l };
        if (typeof l === 'object') {
          const href = l.href || l.url || '';
          const title = l.title || l.label || href;
          return href ? { href, title } : null;
        }
        const s = String(l);
        return s ? { href: s, title: s } : null;
      })
      .filter(Boolean);
  }

  if (typeof raw === 'object') {
    return Object.entries(raw)
      .map(([key, value]) => {
        if (!value) return null;
        if (typeof value === 'string') return { href: value, title: key || value };
        if (typeof value === 'object') {
          const href = value.href || value.url || '';
          const title = value.title || key || href;
          return href ? { href, title } : null;
        }
        const s = String(value);
        return s ? { href: s, title: key || s } : null;
      })
      .filter(Boolean);
  }

  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((p) => ({ href: p, title: p }));
  }

  const s = String(raw);
  return s ? [{ href: s, title: s }] : [];
}

function normalizeRow(row) {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    theme: row.theme || row.category || null,
    type: row.type || null,
    languages: row.languages || [],
    tags: row.tags || [],
    description: row.description || '',
    links: normalizeLinks(row.links),
    status: row.status || null,
    owner: row.owner || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function fetchAllRessources() {
  const url =
    `${SUPABASE_URL}/rest/v1/ressources` +
    '?select=*' +
    '&status=eq.validated' +
    '&order=created_at.asc';

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Supabase error ${res.status} ${res.statusText} – ${txt}`);
  }

  const data = await res.json();
  return data.map(normalizeRow);
}

async function main() {
  console.log('Fetching ressources from Supabase…');
  const ressources = await fetchAllRessources();
  console.log(`Fetched ${ressources.length} rows`);

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(ressources, null, 2), 'utf8');

  console.log(`Wrote ${OUT_FILE}`);
}

main().catch((err) => {
  console.error('Error in sync-supabase-ressources:', err);
  process.exit(1);
});
