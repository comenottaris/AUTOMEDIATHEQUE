// assets/automediatheque.js

// Si automedias.json est à la racine à côté de index.html :
const DATA_URL = './automedias.json';
// Si tu le mets dans assets/, utilise :
// const DATA_URL = './assets/automedias.json';

let allMedias = [];

const els = {
  results: null,
  filterType: null,
  filterCountry: null,
  statusText: null,
  refreshBtn: null,
  count: null,
};

function cacheDom() {
  els.results = document.getElementById('am-results');
  els.filterType = document.getElementById('am-filter-type');
  els.filterCountry = document.getElementById('am-filter-country');
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

async function loadData(forceReload = false) {
  if (!forceReload && allMedias.length) {
    return allMedias;
  }

  if (els.results) {
    els.results.innerHTML = '<p class="am-message">Chargement des données…</p>';
  }
  setStatus('chargement…');

  const url = forceReload ? `${DATA_URL}?t=${Date.now()}` : DATA_URL;

  const res = await fetch(url, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Erreur HTTP ${res.status}`);
  }

  const data = await res.json();

  if (!Array.isArray(data)) {
    throw new Error('Le JSON doit être un tableau.');
  }

  allMedias = data;
  setCount(allMedias.length);

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

    header.appendChild(title);
    card.appendChild(header);

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

  let list = allMedias.slice();

  if (typeVal) {
    list = list.filter((m) => (m.type || '') === typeVal);
  }

  if (countryVal) {
    list = list.filter((m) => (m.country || '') === countryVal);
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
