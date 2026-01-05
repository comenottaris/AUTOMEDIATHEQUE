// scripts/sync-supabase.js
//
// 1. Lit la dernière date importée (data/supabase-state.json)
// 2. Récupère les lignes Supabase plus récentes
// 3. Les ajoute à data/propositions.json
// 4. Met à jour la date dans supabase-state.json

const fs = require("fs");
const path = require("path");
const https = require("https");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const PROPOS_FILE = path.join(DATA_DIR, "propositions.json");
const STATE_FILE = path.join(DATA_DIR, "supabase-state.json");

function fetchJson(url, headers) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: "GET", headers }, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(
            new Error(`HTTP ${res.statusCode} – ${body.slice(0, 300)}`)
          );
        }
        try {
          const json = JSON.parse(body);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

function readJson(file, def) {
  try {
    if (!fs.existsSync(file)) return def;
    const txt = fs.readFileSync(file, "utf8");
    return JSON.parse(txt || "null") ?? def;
  } catch (e) {
    console.warn("Impossible de lire", file, e);
    return def;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant");
  }

  const state = readJson(STATE_FILE, { lastImportedAt: null });
  const lastImportedAt = state.lastImportedAt
    ? new Date(state.lastImportedAt)
    : null;

  // On récupère toutes les propositions ordonnées par date
  // (tu peux optimiser avec un filtre si besoin)
  const url =
    SUPABASE_URL +
    "/rest/v1/propositions?select=*&order=created_at.asc&limit=10000";

  const headers = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
  };

  const rows = await fetchJson(url, headers);

  const newRows = rows.filter((row) => {
    if (!row.created_at) return false;
    const d = new Date(row.created_at);
    if (Number.isNaN(d.getTime())) return false;
    if (!lastImportedAt) return true;
    return d > lastImportedAt;
  });

  if (newRows.length === 0) {
    console.log("Aucune nouvelle proposition à importer.");
    return;
  }

  console.log(`Nouvelles propositions : ${newRows.length}`);

  const existing = readJson(PROPOS_FILE, []);
  if (!Array.isArray(existing)) {
    throw new Error("data/propositions.json doit contenir un tableau JSON");
  }

  let maxDate = lastImportedAt;

  for (const row of newRows) {
    const languages =
      typeof row.languages === "string"
        ? row.languages
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

    const entry = {
      name: row.name || "(sans titre)",
      url: row.url || "",
      type: row.type || null,
      country: row.country || null,
      languages,
      status: "proposed",
      description: row.description || "",
      notes: row.notes || "",
      source: "supabase",
      createdAt: row.created_at
    };

    existing.push(entry);

    const d = new Date(row.created_at);
    if (!maxDate || d > maxDate) maxDate = d;
  }

  writeJson(PROPOS_FILE, existing);
  writeJson(STATE_FILE, {
    lastImportedAt: maxDate ? maxDate.toISOString() : null
  });

  console.log(
    `Import terminé : ${newRows.length} ajoutées. Dernier import = ${
      maxDate && maxDate.toISOString()
    }`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
