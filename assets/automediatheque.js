// assets/automediatheque.js

// Si tu déplaces le JSON dans assets/, mets plutôt:
// const DATA_URL = 'assets/automedias.json';
const DATA_URL = 'automedias.json';

let allMedias = [];
let filteredMedias = [];

// Récupération des éléments du DOM
const els = {};

function cacheDom() {
  els.searchInput = document.getElementById('am-search-input');
  els.filterType = document.getElementById('am-filter-type');
  els.filterCountry = document.getElementById('am-filter-country');
  els.filterLanguage = document.getElementById('am-filter-language');
  els.results = document.getElementById('am-results');
  els.emptyMessage = document.getElementById('am-empty-message');
  els.refreshBtn = document.getElementById('am-refresh-db');
}

// Chargement du JSON
async function loadData() {
  const res = await fetch(DATA_URL, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) {
    throw new Error(`Erreur de chargement de ${DATA_URL} : HTTP ${res.status}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error('Le JSON doit être un tableau d’objets.');
  }
  allMedias = data;
  filteredMedias = data.slice();
}

// Création d’une carte HTML pour un automédia
function createCard(media) {
  const {
    name,
    url,
    type,
    languages,
    country,
    status,
    description
  } = media;

  const article = document.createElement('article');
  article.className = 'am-card';

  const langs = Array.isArray(languages) ? languages.join(', ') : (languages || '');

  article.innerHTML = `
    <h3 class="am-card-title">
      ${url ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${name || 'Sans nom'}</a>` : (name || 'Sans nom')}
    </h3>

    <p class="am-card-meta">
      ${type ? `<span class="am-badge am-badge-type">${type}</span>` : ''}
      ${country ? `<span class="am-meta-item">${country}</span>` : ''}
      ${langs ? `<span class="am-meta-item">${langs}</span>` : ''}
    </p>

    ${status ? `<p class="am-card-status"><span class="am-badge am-badge-status am-status-${status}">${status}</span></p>` : ''}

    ${description ? `<p class="am-card-description">${description}</p>` : ''}
  `;

  return article;
}

// Rendu de la liste filtrée
function renderList() {
  if (!els.results) return;

  els.results.innerHTML = '';

  if (!filteredMedias.length) {
    if (els.emptyMessage) els.emptyMessage.hidden = false;
    return;
  }

  if (els.emptyMessage) els.emptyMessage.hidden = true;

  filteredMedias.forEach(media => {
    els.results.appendChild(createCard(media));
  });
}

// Construire les options de filtres en fonction des données
function buildFilters() {
  if (!allMedias.length) return;

  const types = new Set();
  const countries = new Set();
  const languages = new Set();

  allMedias.forEach(m => {
    if (m.type) types.add(m.type);
    if (m.country) countries.add(m.country);
    if (Array.isArray(m.languages)) {
      m.languages.forEach(l => languages.add(l));
    } else if (m.languages) {
      languages.add(m.languages);
    }
  });

  function fillSelect(selectEl, values) {
    if (!selectEl) return;
    // On garde la première option (“Tous…”)
    const first = selectEl.querySelector('option');
    selectEl.innerHTML = '';
    if (first) selectEl.appendChild(first);

    Array.from(values).sort((a, b) => a.localeCompare(b, 'fr'))
      .forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        selectEl.appendChild(opt);
      });
  }

  fillSelect(els.filterType, types);
  fillSelect(els.filterCountry, countries);
  fillSelect(els.filterLanguage, languages);
}

// Appliquer recherche + filtres
function applyFilters() {
  const q = (els.searchInput?.value || '').trim().toLowerCase();
  const type = els.filterType?.value || '';
  const country = els.filterCountry?.value || '';
  const language = els.filterLanguage?.value || '';

  filteredMedias = allMedias.filter(m => {
    // Filtre type
    if (type && m.type !== type) return false;

    // Filtre pays
    if (country && m.country !== country) return false;

    // Filtre langue
    if (language) {
      const langs = Array.isArray(m.languages) ? m.languages : (m.languages ? [m.languages] : []);
      if (!langs.map(l => String(l).toLowerCase()).includes(language.toLowerCase())) {
        return false;
      }
    }

    // Recherche plein texte
    if (q) {
      const haystack = [
        m.name,
        m.description,
        m.country,
        m.type,
        Array.isArray(m.languages) ? m.languages.join(' ') : m.languages
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  renderList();
}

// Petite fonction de debounce pour ne pas filtrer à chaque frapppe trop vite
function debounce(fn, delay = 200) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// Initialisation des listeners
function setupEvents() {
  if (els.searchInput) {
    els.searchInput.addEventListener('input', debounce(applyFilters, 200));
  }
  if (els.filterType) {
    els.filterType.addEventListener('change', applyFilters);
  }
  if (els.filterCountry) {
    els.filterCountry.addEventListener('change', applyFilters);
  }
  if (els.filterLanguage) {
    els.filterLanguage.addEventListener('change', applyFilters);
  }

  if (els.refreshBtn) {
    els.refreshBtn.addEventListener('click', () => {
      // Pour l’instant : simple placeholder
      // Plus tard tu pourras ici :
      //  - appeler une API
      //  - déclencher une GitHub Action
      //  - recharger les données d’une autre source, etc.
      console.log('Bouton "Mettre à jour la base de données" cliqué (non relié pour l’instant).');
      // On peut au moins recharger les données actuelles :
      init(true);
    });
  }
}

// Initialisation globale
async function init(forceReload = false) {
  try {
    cacheDom();
    if (!allMedias.length || forceReload) {
      await loadData();
    }
    buildFilters();
    applyFilters();
  } catch (err) {
    console.error(err);
    if (els.results) {
      els.results.textContent = 'Erreur lors du chargement de la base de données.';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  init(false);
});
