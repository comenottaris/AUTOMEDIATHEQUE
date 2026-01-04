// assets/automediatheque.js

// Si automedias.json est à la racine à côté de index.html :
const DATA_URL = './automedias.json';
// Si tu le mets dans assets/, utilise plutôt :
// const DATA_URL = './assets/automedias.json';

let allMedias = [];
let lastLoadedAt = null;

const els = {
  results: null,
  filterType: null,
  filterCountry: null,
  statusText: null,
  refreshBtn: null,
};

function cacheDom() {
  els.results = document.getElementById('am-results');
  els.filterType = document.getElementById('am-filter-type');
  els.filterCountry = document.getElementById('am-filter-country');
  els.statusText = document.getElementById('am-status-text');
  els.refreshBtn = document.getElementById('am-refresh-db');
}

function setStatus(text) {
  if (els.statusText) {
    els.statusText.textContent = `Statut : ${text}`;
  }
}

async function loadData(forceReload = false) {
  if (!forceReload && allMedias.length) {
    // On a déjà des données : ne pas recharger inutilement
    return allMedias;
  }

  if (els.results) {
    els.results.innerHTML = '<p class="am-message">Chargement des données…</p>';
  }
  setStatus('chargement…');

  const url = forceReload ? `${DATA_URL}?t=${Date.now()}` : DATA_URL;

  const res = await fetch(url, {
    cache: 'no-store',
    headers: { 'Accept': 'application/json' },
  });

  console.log('[Automédiathèque] HTTP status', res.status);

  if (!res.ok) {
    throw new Error(`Erreur HTTP ${res.status}`);
  }

  const data = await res.json();
  console.log('[Automédiathèque] Données chargées', data);

  if (!Array.isArray(data)) {
    throw new Error('Le JSON doit être un tableau d’objets.');
  }

  allMedias = data;
  lastLoadedAt = new Date();

  const timeStr = lastLoadedAt.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  setStatus(`OK (${allMedias.length} entrées, ${timeStr})`);

  return allMedias;
}

function buildFilters() {
  if (!els.filterType || !els.filterCountry) return;

  // On garde la 1ère option ("Tous les ..."), on efface le reste
  els.filterType.length = 1;
  els.filterCountry.length = 1;

  const types = new Set();
  const countries = new Set();

  allMedias.forEach((m) => {
    if (m.type) types.add(m.type);
    if (m.country) countries.add(m.country);
  });

  Array.from(types)
    .sort((a, b) => a.localeCompare(b))
    .forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      els.filterType.appendChild(opt);
    });

  Array.from(countries)
    .sort((a, b) => a.localeCompare(b))
    .forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      els.filterCountry.appendChild(opt);
    });
}

function applyFilters() {
  if (!allMedias.length) return;

  const typeVal = els.filterType ? els.filterType.value : '';
  const countryVal = els.filterCountry ? els.filterCountry.value : '';

  console.log('[Automédiathèque] Filtres appliqués', {
    type: typeVal,
    country: countryVal,
  });

  let list = allMedias.slice();

  if (typeVal) {
    list = list.filter((m) => (m.type || '') === typeVal);
  }

  if (countryVal) {
    list = list.filter((m) => (m.country || '') === countryVal);
  }

  renderList(list);
}

function renderList(list) {
  if (!els.results) return;

  if (!list.length) {
    els.results.innerHTML =
      '<p class="am-message">Aucun automédia pour ces critères.</p>';
    return;
  }

  els.results.innerHTML = '';

  list.forEach((media) => {
    const card = document.createElement('article');
    card.className = 'am-card';

    // En-tête de carte
    const header = document.createElement('div');
    header.className = 'am-card-header';

    const title = document.createElement('h3');
    title.className = 'am-card-title';

    if (media.url) {
      const a = document.createElement('a');
      a.href = media.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = media.name || 'Sans nom';
      title.appendChild(a);
    } else {
      title.textContent = media.name || 'Sans nom';
    }

    header.appendChild(title);

    // Ligne de tags / méta
    const meta = document.createElement('div');
    meta.className = 'am-card-meta';

    if (media.type) {
      const spanType = document.createElement('span');
      spanType.className = 'am-pill am-pill-type';
      spanType.textContent = media.type;
      meta.appendChild(spanType);
    }

    if (media.country) {
      const spanCountry = document.createElement('span');
      spanCountry.className = 'am-pill am-pill-country';
      spanCountry.textContent = media.country;
      meta.appendChild(spanCountry);
    }

    if (Array.isArray(media.languages) && media.languages.length) {
      const spanLang = document.createElement('span');
      spanLang.className = 'am-pill am-pill-lang';
      spanLang.textContent = media.languages.join(', ');
      meta.appendChild(spanLang);
    }

    // Description
    const desc = document.createElement('p');
    desc.className = 'am-card-desc';
    desc.textContent = media.description || '—';

    card.appendChild(header);
    card.appendChild(meta);
    card.appendChild(desc);

    els.results.appendChild(card);
  });
}

function setupEvents() {
  if (els.filterType) {
    els.filterType.addEventListener('change', applyFilters);
  }
  if (els.filterCountry) {
    els.filterCountry.addEventListener('change', applyFilters);
  }
  if (els.refreshBtn) {
    els.refreshBtn.addEventListener('click', async () => {
      try {
        setStatus('rafraîchissement…');
        await loadData(true); // force reload du JSON
        buildFilters();
        // On remet les filtres à "Tous"
        if (els.filterType) els.filterType.value = '';
        if (els.filterCountry) els.filterCountry.value = '';
        applyFilters();
      } catch (err) {
        console.error('[Automédiathèque] Erreur rafraîchissement', err);
        setStatus('erreur lors du rafraîchissement');
        if (els.results) {
          els.results.innerHTML =
            '<p class="am-message am-message-error">Erreur lors du rafraîchissement de la base.</p>';
        }
      }
    });
  }
}

async function init() {
  cacheDom();
  setupEvents();

  try {
    await loadData(false);
    buildFilters();
    applyFilters();
  } catch (err) {
    console.error('[Automédiathèque] Erreur init', err);
    if (els.results) {
      els.results.innerHTML =
        '<p class="am-message am-message-error">Erreur lors du chargement de la base.</p>';
    }
    setStatus('erreur');
  }
}

document.addEventListener('DOMContentLoaded', init);
