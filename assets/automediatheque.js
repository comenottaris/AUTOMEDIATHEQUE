/* ================================
   Automédiathèque - Script principal
   ================================ */

(function() {
  'use strict';

  // =====================
  // Configuration
  // =====================
  
  const CONFIG = {
    jsonUrl: '../automedias.json',
    githubRepo: 'https://github.com/comenottaris/AUTOMEDIATHEQUE',
    githubJson: 'https://github.com/comenottaris/AUTOMEDIATHEQUE/blob/main/automedias.json'
  };

  // =====================
  // State
  // =====================
  
  let allAutomedias = [];
  let currentFilters = {
    type: '',
    country: '',
    language: '',
    status: ''
  };

  // =====================
  // DOM Elements
  // =====================
  
  const elements = {};

  // =====================
  // Initialization
  // =====================
  
  function init() {
    elements.grid = document.getElementById('automedias-grid');
    elements.loadingState = document.getElementById('loading-state');
    elements.errorState = document.getElementById('error-state');
    elements.emptyState = document.getElementById('empty-state');
    elements.statusText = document.getElementById('status-text');
    elements.metaInfo = document.getElementById('meta-info');
    elements.dbVersion = document.getElementById('db-version');
    elements.dbDate = document.getElementById('db-date');
    elements.filterType = document.getElementById('filter-type');
    elements.filterCountry = document.getElementById('filter-country');
    elements.filterLanguage = document.getElementById('filter-language');
    elements.filterStatus = document.getElementById('filter-status');
    elements.reloadBtn = document.getElementById('reload-btn');
    elements.updateDbBtn = document.getElementById('update-db-btn');
    elements.retryBtn = document.getElementById('retry-btn');

    bindEvents();
    loadData();
  }

  // =====================
  // Event Binding
  // =====================
  
  function bindEvents() {
    if (elements.reloadBtn) {
      elements.reloadBtn.addEventListener('click', loadData);
    }

    if (elements.updateDbBtn) {
      elements.updateDbBtn.addEventListener('click', showUpdateModal);
    }

    if (elements.retryBtn) {
      elements.retryBtn.addEventListener('click', loadData);
    }

    if (elements.filterType) {
      elements.filterType.addEventListener('change', function() {
        currentFilters.type = this.value;
        applyFilters();
      });
    }

    if (elements.filterCountry) {
      elements.filterCountry.addEventListener('change', function() {
        currentFilters.country = this.value;
        applyFilters();
      });
    }

    if (elements.filterLanguage) {
      elements.filterLanguage.addEventListener('change', function() {
        currentFilters.language = this.value;
        applyFilters();
      });
    }

    if (elements.filterStatus) {
      elements.filterStatus.addEventListener('change', function() {
        currentFilters.status = this.value;
        applyFilters();
      });
    }
  }

  // =====================
  // Data Loading
  // =====================
  
  async function loadData() {
    showLoading();

    try {
      console.log('Chargement depuis:', CONFIG.jsonUrl);
      
      const response = await fetch(CONFIG.jsonUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error('HTTP ' + response.status + ' - ' + response.statusText);
      }

      const data = await response.json();
      
      // Le JSON est un tableau direct, pas un objet avec "automedias"
      if (Array.isArray(data)) {
        allAutomedias = data;
        console.log('Chargement réussi:', allAutomedias.length, 'automédias');
      } else if (data && Array.isArray(data.automedias)) {
        // Fallback si format objet
        allAutomedias = data.automedias;
        console.log('Chargement réussi (format objet):', allAutomedias.length, 'automédias');
      } else {
        throw new Error('Format JSON non reconnu');
      }

      updateMetadata();
      populateFilters();
      applyFilters();
      showSuccess();

    } catch (error) {
      console.error('Erreur de chargement:', error);
      showError(error.message);
    }
  }

  // =====================
  // Metadata
  // =====================
  
  function updateMetadata() {
    if (elements.dbVersion) {
      elements.dbVersion.textContent = '1.0';
    }

    if (elements.dbDate) {
      const today = new Date();
      elements.dbDate.textContent = formatDate(today.toISOString().split('T')[0]);
    }

    if (elements.metaInfo) {
      elements.metaInfo.textContent = allAutomedias.length + ' automédias référencés';
    }
  }

  // =====================
  // Filters
  // =====================
  
  function populateFilters() {
    const types = new Set();
    const countries = new Set();
    const languages = new Set();
    const statuses = new Set();

    allAutomedias.forEach(function(item) {
      if (item.type) types.add(item.type);
      if (item.country) countries.add(item.country);
      if (item.status) statuses.add(item.status);
      
      // languages est un tableau
      if (item.languages && Array.isArray(item.languages)) {
        item.languages.forEach(function(lang) {
          languages.add(lang);
        });
      }
    });

    populateSelect(elements.filterType, Array.from(types).sort(), 'Tous types');
    populateSelect(elements.filterCountry, Array.from(countries).sort(), 'Tous pays');
    populateSelect(elements.filterLanguage, Array.from(languages).sort(), 'Toutes langues');
    populateSelect(elements.filterStatus, Array.from(statuses).sort(), 'Tous statuts');
  }

  function populateSelect(select, options, defaultLabel) {
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '<option value="">' + defaultLabel + '</option>';

    options.forEach(function(option) {
      const opt = document.createElement('option');
      opt.value = option;
      opt.textContent = formatLabel(option);
      select.appendChild(opt);
    });

    if (currentValue && options.includes(currentValue)) {
      select.value = currentValue;
    }
  }

  function formatLabel(value) {
    // Traductions pour l'affichage
    const labels = {
      'online': 'En ligne',
      'offline': 'Hors ligne',
      'unknown': 'Inconnu',
      'fr': 'Français',
      'en': 'English',
      'es': 'Español',
      'de': 'Deutsch',
      'it': 'Italiano',
      'pt': 'Português',
      'site': 'Site web',
      'blog': 'Blog',
      'radio': 'Radio',
      'video': 'Vidéo',
      'podcast': 'Podcast',
      'journal': 'Journal',
      'magazine': 'Magazine',
      'agence': 'Agence'
    };
    return labels[value] || value;
  }

  function applyFilters() {
    let filtered = allAutomedias.slice();

    if (currentFilters.type) {
      filtered = filtered.filter(function(item) {
        return item.type === currentFilters.type;
      });
    }

    if (currentFilters.country) {
      filtered = filtered.filter(function(item) {
        return item.country === currentFilters.country;
      });
    }

    if (currentFilters.language) {
      filtered = filtered.filter(function(item) {
        // languages est un tableau
        return item.languages && 
               Array.isArray(item.languages) && 
               item.languages.includes(currentFilters.language);
      });
    }

    if (currentFilters.status) {
      filtered = filtered.filter(function(item) {
        return item.status === currentFilters.status;
      });
    }

    renderCards(filtered);
    updateStatusText(filtered.length);
  }

  // =====================
  // Rendering
  // =====================
  
  function renderCards(items) {
    if (!elements.grid) return;

    elements.grid.innerHTML = '';

    if (!items || items.length === 0) {
      showEmpty();
      return;
    }

    hideAllStates();

    items.forEach(function(item) {
      const card = createCard(item);
      elements.grid.appendChild(card);
    });
  }

  function createCard(item) {
    const card = document.createElement('article');
    card.className = 'am-card';

    // Meta tags
    let metaHtml = '';
    
    if (item.type) {
      metaHtml += '<span class="am-tag am-tag-type">' + escapeHtml(formatLabel(item.type)) + '</span>';
    }
    if (item.country) {
      metaHtml += '<span class="am-tag am-tag-country">' + escapeHtml(item.country) + '</span>';
    }
    // Languages (tableau)
    if (item.languages && Array.isArray(item.languages)) {
      item.languages.forEach(function(lang) {
        metaHtml += '<span class="am-tag am-tag-language">' + escapeHtml(formatLabel(lang)) + '</span>';
      });
    }
    // Status
    if (item.status) {
      const statusClass = item.status === 'online' ? 'am-tag-active' : 'am-tag-inactive';
      metaHtml += '<span class="am-tag ' + statusClass + '">' + escapeHtml(formatLabel(item.status)) + '</span>';
    }

    // Description
    let descHtml = '';
    if (item.description) {
      descHtml = '<p class="am-card-description">' + escapeHtml(item.description) + '</p>';
    }

    // Tags additionnels
    let tagsHtml = '';
    if (item.tags && Array.isArray(item.tags) && item.tags.length > 0) {
      tagsHtml = '<div class="am-tags">';
      item.tags.forEach(function(tag) {
        tagsHtml += '<span class="am-tag">' + escapeHtml(tag) + '</span>';
      });
      tagsHtml += '</div>';
    }

    const url = item.url || '#';
    const name = item.name || 'Sans nom';

    card.innerHTML = 
      '<header class="am-card-header">' +
        '<h2 class="am-card-title">' +
          '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">' +
            escapeHtml(name) +
          '</a>' +
        '</h2>' +
      '</header>' +
      '<div class="am-card-meta">' + metaHtml + '</div>' +
      '<div class="am-card-body">' +
        descHtml +
        tagsHtml +
      '</div>';

    return card;
  }

  // =====================
  // UI States
  // =====================
  
  function showLoading() {
    hideAllStates();
    if (elements.loadingState) elements.loadingState.hidden = false;
    if (elements.grid) elements.grid.innerHTML = '';
    if (elements.statusText) elements.statusText.textContent = 'Chargement...';
    if (elements.reloadBtn) elements.reloadBtn.disabled = true;
  }

  function showError(message) {
    hideAllStates();
    if (elements.errorState) {
      elements.errorState.hidden = false;
      const errorP = elements.errorState.querySelector('p');
      if (errorP) {
        errorP.textContent = 'Erreur : ' + message;
      }
    }
    if (elements.statusText) elements.statusText.textContent = 'Erreur';
    if (elements.reloadBtn) elements.reloadBtn.disabled = false;
  }

  function showEmpty() {
    hideAllStates();
    if (elements.emptyState) elements.emptyState.hidden = false;
  }

  function showSuccess() {
    hideAllStates();
    if (elements.reloadBtn) elements.reloadBtn.disabled = false;
  }

  function hideAllStates() {
    if (elements.loadingState) elements.loadingState.hidden = true;
    if (elements.errorState) elements.errorState.hidden = true;
    if (elements.emptyState) elements.emptyState.hidden = true;
  }

  function updateStatusText(count) {
    if (elements.statusText) {
      elements.statusText.textContent = count + ' automédia' + (count > 1 ? 's' : '');
    }
  }

  // =====================
  // Update Modal
  // =====================
  
  function showUpdateModal() {
    const msg = 'Pour ajouter ou modifier un automédia :\n\n' +
      '1. Allez sur GitHub\n' +
      '2. Modifiez le fichier automedias.json\n' +
      '3. Soumettez une Pull Request\n\n' +
      'Ouvrir GitHub ?';

    if (confirm(msg)) {
      window.open(CONFIG.githubJson, '_blank');
    }
  }

  // =====================
  // Utilities
  // =====================
  
  function formatDate(dateString) {
    if (!dateString) return '-';
    
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                        'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        const day = parseInt(parts[2], 10);
        const month = months[parseInt(parts[1], 10) - 1];
        const year = parts[0];
        return day + ' ' + month + ' ' + year;
      }
      return dateString;
    } catch (e) {
      return dateString;
    }
  }

  function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(String(text)));
    return div.innerHTML;
  }

  // =====================
  // Start
  // =====================
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
