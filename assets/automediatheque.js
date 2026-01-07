// assets/automediatheque.js

// Si automedias.json est à la racine à côté de index.html :
const DATA_URL = './data/automedias.json';
const PROPOSALS_URL = './data/propositions.json';
// Si tu les mets dans assets/, utilise :
// const DATA_URL = './assets/automedias.json';
// const PROPOSALS_URL = './assets/propositions.json';

let allMedias = [];

const els = {
  results: null,
  filterType: null,
  filterCountry: null,
  filterOrigin: null, // NEW : filtre "Statut"
  statusText: null,
  refreshBtn: null,
  count: null,
};

function cacheDom() {
  els.results = document.getElementById('am-results');
  els.filterType = document.getElementById('am-filter-type');
  els.filterCountry = document.getElementById('am-filter-country');
  els.filterOrigin = document.getElementById('am-filter-origin'); // NEW
  els.statusText = document.getElementById('am-status-text');
  els.refreshBtn = document.getElementById('am-refresh-db');
  els.count = document.getElementById('am-count');
}

function setStatus(text) {
  if (els.statusText) {
    els.statusText.textContent = `Statut : ${text}`;
  }
}

function setCount(n) {
  if (els.count) {
    els.count.textContent = typeof n === 'number' ? n : '–';
  }
}

// Construit la liste des types à partir de la base JSON
function buildTypeOptions(items) {
  if (!els.filterType) return;

  const select = els.filterType;
  const previousValue = select.value;

  // On garde seulement la première option ("Tous les types")
  while (select.options.length > 1) {
    select.remove(1);
  }

  const types = Array.from(
    new Set(
      items
        .map(m => m.type)
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));

  types.forEach(type => {
    const opt = document.createElement('option');
    opt.value = type;
    opt.textContent = type;
    select.appendChild(opt);
  });

  if (types.includes(previousValue)) {
    select.value = previousValue;
  } else {
    select.value = '';
  }
}

// Construit la liste des pays à partir de la base JSON
function buildCountryOptions(items) {
  if (!els.filterCountry) return;

  const select = els.filterCountry;
  const previousValue = select.value;

  // On garde seulement la première option ("Tous les pays")
  while (select.options.length > 1) {
    select.remove(1);
  }

  const countries = Array.from(
    new Set(
      items
        .map(m => m.country)
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));

  countries.forEach(country => {
    const opt = document.createElement('option');
    opt.value = country;
    opt.textContent = country;
    select.appendChild(opt);
  });

  if (countries.includes(previousValue)) {
    select.value = previousValue;
  } else {
    select.value = '';
  }
}

// Charge automedias.json + propositions.json et fusionne
async function loadData(forceReload = false) {
  if (!forceReload && allMedias.length) {
    return allMedias;
  }

  if (els.results) {
    els.results.innerHTML = '<p class="am-message">Chargement des données…</p>';
  }
  setStatus('chargement…');

  const cacheBust = forceReload ? `?t=${Date.now()}` : '';
  const officialUrl = `${DATA_URL}${cacheBust}`;
  const proposalsUrl = `${PROPOSALS_URL}${cacheBust}`;

  // On charge les 2 en parallèle
  const [resOfficial, resProps] = await Promise.all([
    fetch(officialUrl, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    }),
    fetch(proposalsUrl, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    }).catch(() => null), // si le fetch plante complètement
  ]);

  if (!resOfficial.ok) {
    throw new Error(`Erreur HTTP ${resOfficial.status} sur automedias.json`);
  }

  const officialData = await resOfficial.json();

  if (!Array.isArray(officialData)) {
    throw new Error('Le fichier automedias.json doit contenir un tableau.');
  }

  // Traitement des propositions (peut être absent)
  let proposalsData = [];
  if (resProps && resProps.ok) {
    const raw = await resProps.json();
    if (Array.isArray(raw)) {
      proposalsData = raw;
    } else if (raw && typeof raw === 'object') {
      // cas Jekyll : { "entry-xxx": { ... }, ... }
      proposalsData = Object.values(raw);
    } else {
      console.warn('[Automédiathèque] Format inattendu pour propositions.json, ignoré.');
    }
  } else {
    console.info('[Automédiathèque] Aucun fichier propositions.json valable, on continue sans propositions.');
  }

  // On tag l’origine
  const officialTagged = officialData.map(m => ({
    ...m,
    __origin: 'validated',
  }));

  const proposalsTagged = proposalsData.map(m => ({
    ...m,
    __origin: 'proposed',
  }));

  allMedias = [...officialTagged, ...proposalsTagged];

  setCount(allMedias.length);

  // Met à jour les listes de filtres en fonction de la base fusionnée
  buildTypeOptions(allMedias);
  buildCountryOptions(allMedias);

  const now = new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  setStatus(`OK (${allMedias.length} entrées, ${now})`);

  return allMedias;
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

    // Classe spéciale si c'est une proposition
    if (media.__origin === 'proposed') {
      card.classList.add('am-card-proposed');
    }

    // Titre
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

    // Tags / méta
    const meta = document.createElement('div');
    meta.className = 'am-card-meta';

    // TYPE : cliquable si URL dispo
    if (media.type) {
      let typeEl;
      if (media.url) {
        typeEl = document.createElement('a');
        typeEl.href = media.url;
        typeEl.target = '_blank';
        typeEl.rel = 'noopener noreferrer';
        typeEl.className = 'am-pill am-pill-type am-pill-link';
      } else {
        typeEl = document.createElement('span');
        typeEl.className = 'am-pill am-pill-type';
      }
      typeEl.textContent = media.type;
      meta.appendChild(typeEl);
    }

    // PAYS
    if (media.country) {
      const spanCountry = document.createElement('span');
      spanCountry.className = 'am-pill am-pill-country';
      spanCountry.textContent = media.country;
      meta.appendChild(spanCountry);
    }

    // LANGUES
    if (Array.isArray(media.languages) && media.languages.length) {
      const spanLang = document.createElement('span');
      spanLang.className = 'am-pill am-pill-lang';
      spanLang.textContent = media.languages.join(', ');
      meta.appendChild(spanLang);
    }

    card.appendChild(meta);

    // Description
    const desc = document.createElement('p');
    desc.className = 'am-card-desc';
    desc.textContent = media.description || '—';
    card.appendChild(desc);

    els.results.appendChild(card);
  });
}

function applyFilters() {
  if (!allMedias.length) return;

  const typeVal = els.filterType ? els.filterType.value : '';
  const countryVal = els.filterCountry ? els.filterCountry.value : '';
  const originVal = els.filterOrigin ? els.filterOrigin.value : '';

  let list = allMedias.slice();

  if (typeVal) {
    list = list.filter((m) => (m.type || '') === typeVal);
  }

  if (countryVal) {
    list = list.filter((m) => (m.country || '') === countryVal);
  }

  if (originVal) {
    list = list.filter((m) => (m.__origin || '') === originVal);
  }

  renderList(list);
}

// On expose la fonction pour l’utiliser dans le HTML au besoin
window.amApplyFilters = applyFilters;

function setupEvents() {
  if (els.refreshBtn) {
    els.refreshBtn.addEventListener('click', async () => {
      try {
        setStatus('rafraîchissement…');
        await loadData(true);
        // on remet les filtres à "Tous"
        if (els.filterType) els.filterType.value = '';
        if (els.filterCountry) els.filterCountry.value = '';
        if (els.filterOrigin) els.filterOrigin.value = '';
        applyFilters();
      } catch (err) {
        console.error('[Automédiathèque] Erreur rafraîchissement', err);
        if (els.results) {
          els.results.innerHTML =
            '<p class="am-message am-message-error">Erreur lors du rafraîchissement de la base.</p>';
        }
        setStatus('erreur lors du rafraîchissement');
      }
    });
  }

  if (els.filterType) {
    els.filterType.addEventListener('change', applyFilters);
  }
  if (els.filterCountry) {
    els.filterCountry.addEventListener('change', applyFilters);
  }
  if (els.filterOrigin) {
    els.filterOrigin.addEventListener('change', applyFilters);
  }
}

async function init() {
  cacheDom();
  setupEvents();

  try {
    await loadData(false);
    applyFilters(); // affiche la liste complète au début
  } catch (err) {
    console.error('[Automédiathèque] Erreur init', err);
    if (els.results) {
      els.results.innerHTML =
        '<p class="am-message am-message-error">Erreur lors du chargement de la base.</p>';
    }
    setStatus('erreur');
    setCount(null);
  }
}

document.addEventListener('DOMContentLoaded', init);
