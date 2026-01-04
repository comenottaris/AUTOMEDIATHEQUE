// ================================
// Automédiathèque - Script principal
// ================================

const CONFIG = {
  jsonUrl: 'https://raw.githubusercontent.com/comenottaris/AUTOMEDIATHEQUE/main/automedias.json',
  githubRepo: 'https://github.com/comenottaris/AUTOMEDIATHEQUE'
};

let allAutomedias = [];
let filteredAutomedias = [];

// =====================
// Chargement des données
// =====================
async function loadData() {
  const loadingState = document.getElementById('loading-state');
  const errorState = document.getElementById('error-state');
  const statusText = document.getElementById('status-text');

  try {
    loadingState.hidden = false;
    errorState.hidden = true;
    statusText.textContent = 'Chargement...';
    statusText.className = 'status-badge';

    const response = await fetch(CONFIG.jsonUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    allAutomedias = data.automedias || [];
    filteredAutomedias = [...allAutomedias];

    // Mise à jour des métadonnées
    updateMetadata(data);
    
    // Initialisation des filtres
    initFilters();
    
    // Affichage des cartes
    renderCards();

    loadingState.hidden = true;
    statusText.textContent = `${allAutomedias.length} automédias`;
    statusText.className = 'status-badge';

  } catch (error) {
    console.error('Erreur de chargement:', error);
    loadingState.hidden = true;
    errorState.hidden = false;
    statusText.textContent = 'Erreur';
    statusText.className = 'status-badge';
  }
}

// =====================
// Mise à jour des métadonnées
// =====================
function updateMetadata(data) {
  const metaInfo = document.getElementById('meta-info');
  const dbVersion = document.getElementById('db-version');
  const dbDate = document.getElementById('db-date');

  if (data.version) dbVersion.textContent = data.version;
  if (data.date_updated) dbDate.textContent = formatDate(data.date_updated);
  
  if (data.count !== undefined) {
    metaInfo.textContent = `Base de données : ${data.count} entrées`;
  }
}

// =====================
// Initialisation des filtres
// =====================
function initFilters() {
  const typeSelect = document.getElementById('filter-type');
  const countrySelect = document.getElementById('filter-country');
  const languageSelect = document.getElementById('filter-language');

  // Extraction des valeurs uniques
  const types = [...new Set(allAutomedias.map(a => a.type).filter(Boolean))].sort();
  const countries = [...new Set(allAutomedias.map(a => a.country).filter(Boolean))].sort();
  const languages = [...new Set(allAutomedias.map(a => a.language).filter(Boolean))].sort();

  // Peuplement des selects
  populateSelect(typeSelect, types);
  populateSelect(countrySelect, countries);
  populateSelect(languageSelect, languages);

  // Événements de changement
  typeSelect.addEventListener('change', applyFilters);
  countrySelect.addEventListener('change', applyFilters);
  languageSelect.addEventListener('change', applyFilters);
}

function populateSelect(selectElement, options) {
  // Garder l'option "Tous"
  const allOption = selectElement.querySelector('option[value=""]');
  selectElement.innerHTML = '';
  selectElement.appendChild(allOption);

  options.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    selectElement.appendChild(opt);
  });
}

// =====================
// Application des filtres
// =====================
function applyFilters() {
  const typeFilter = document.getElementById('filter-type').value;
  const countryFilter = document.getElementById('filter-country').value;
  const languageFilter = document.getElementById('filter-language').value;

  filteredAutomedias = allAutomedias.filter(automedia => {
    const matchType = !typeFilter || automedia.type === typeFilter;
    const matchCountry = !countryFilter || automedia.country === countryFilter;
    const matchLanguage = !languageFilter || automedia.language === languageFilter;

    return matchType && matchCountry && matchLanguage;
  });

  renderCards();
  
  // Mise à jour du statut
  const statusText = document.getElementById('status-text');
  statusText.textContent = `${filteredAutomedias.length} automédias`;
}

// =====================
// Rendu des cartes
// =====================
function renderCards() {
  const cardsContainer = document.getElementById('cards');
  const emptyState = document.getElementById('empty-state');

  cardsContainer.innerHTML = '';

  if (filteredAutomedias.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  filteredAutomedias.forEach(automedia => {
    const card = createCard(automedia);
    cardsContainer.appendChild(card);
  });
}

// =====================
// Création d'une carte
// =====================
function createCard(automedia) {
  const card = document.createElement('div');
  card.className = 'am-card';

  const title = automedia.title || 'Sans titre';
  const url = automedia.url || '#';
  const type = automedia.type || 'Non spécifié';
  const country = automedia.country || 'Non spécifié';
  const language = automedia.language || 'Non spécifié';
  const active = automedia.active !== false;
  const dateAdded = automedia.date_added ? formatDate(automedia.date_added) : '-';
  const platforms = automedia.platforms || [];
  const tags = automedia.tags || [];
  const description = automedia.description || '';

  card.innerHTML = `
    <div class="am-card-header">
      <h3 class="am-card-title">
        <a href="${escapeHtml(url)}" target="_blank" rel="noopener">
          ${escapeHtml(title)}
        </a>
      </h3>
      <div class="am-card-meta">
        <span class="am-tag am-tag-type">${escapeHtml(type)}</span>
        <span class="am-tag am-tag-country">${escapeHtml(country)}</span>
        <span class="am-tag ${active ? 'am-tag-active' : 'am-tag-inactive'}">
          ${active ? '✓ Actif' : '✗ Inactif'}
        </span>
      </div>
    </div>
    <div class="am-card-body">
      ${description ? `
        <div class="am-card-field">
          <p>${escapeHtml(description)}</p>
        </div>
      ` : ''}
      <div class="am-card-field">
        <strong>Langue :</strong> ${escapeHtml(language)}
      </div>
      <div class="am-card-field">
        <strong>Ajouté le :</strong> ${escapeHtml(dateAdded)}
      </div>
      ${platforms.length > 0 ? `
        <div class="am-card-field">
          <strong>Plateformes :</strong> ${platforms.map(p => escapeHtml(p)).join(', ')}
        </div>
      ` : ''}
      ${tags.length > 0 ? `
        <div class="am-tags">
          ${tags.map(tag => `<span class="am-tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
      ` : ''}
    </div>
  `;

  return card;
}

// =====================
// Utilitaires
// =====================
function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// =====================
// Événements
// =====================
document.addEventListener('DOMContentLoaded', () => {
  // Chargement initial
  loadData();

  // Bouton recharger
  document.getElementById('reload-btn').addEventListener('click', () => {
    loadData();
  });

  // Bouton mise à jour (pour l'instant juste un message)
  document.getElementById('update-db-btn').addEventListener('click', () => {
    alert('Fonctionnalité de mise à jour à venir !\n\nPour l\'instant, vous pouvez contribuer via GitHub:\n' + CONFIG.githubRepo);
  });

  // Bouton réessayer en cas d'erreur
  document.getElementById('retry-btn')?.addEventListener('click', () => {
    loadData();
  });
});
