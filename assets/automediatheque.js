/* ================================
   Automédiathèque - Script principal
   ================================ */

(function() {
  'use strict';

  // =====================
  // Configuration
  // =====================
  
  const CONFIG = {
    // Chemin relatif : depuis /assets/ on remonte vers /
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
    active: ''
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
    elements.filterActive = document.getElementById('filter-active');
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

    if (elements.filterActive) {
      elements.filterActive.addEventListener('change', function() {
        currentFilters.active = this.value;
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
      
      if (!data || !Array.isArray(data.automedias)) {
        throw new Error('Structure JSON invalide');
      }

      console.log('Chargement réussi:', data.automedias.length, 'automédias');

      allAutomedias = data.automedias;
      updateMetadata(data);
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
  
  function updateMetadata(data) {
    if (elements.dbVersion && data.version) {
      elements.dbVersion.textContent = data.version;
    }

    if (elements.dbDate && data.date_updated) {
      elements.dbDate.textContent = formatDate(data.date_updated);
    }

    if (elements.metaInfo) {
      const count = data.count || data.automedias.length;
      elements.metaInfo.textContent = count + ' automédias référencés';
    }
  }

  // =====================
  // Filters
  // =====================
  
  function populateFilters() {
    const types = new Set();
    const countries = new Set();
    const languages = new Set();

    allAutomedias.forEach(function(item) {
      if (item.type) types.add(item.type);
      if (item.country) countries.add(item.country);
      if (item.language) languages.add(item.language);
    });

    populateSelect(elements.filterType, Array.from(types).sort(), 'Tous types');
    populateSelect(elements.filterCountry, Array.from(countries).sort(), 'Tous pays');
    populateSelect(elements.filterLanguage, Array.from(languages).sort(), 'Toutes langues');
  }

  function populateSelect(select, options, defaultLabel) {
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '<option value="">' + defaultLabel + '</option>';

    options.forEach(function(option) {
      const opt = document.createElement('option');
      opt.value = option;
      opt.textContent = option;
      select.appendChild(opt);
    });

    if (currentValue && options.includes(currentValue)) {
      select.value = currentValue;
    }
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
        return item.language === currentFilters.language;
      });
    }

    if (currentFilters.active !== '') {
      const isActive = currentFilters.active === 'true';
      filtered = filtered.filter(function(item) {
        return item.active === isActive;
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
      metaHtml += '<span class="am-tag am-tag-type">' + escapeHtml(item.type) + '</span>';
    }
    if (item.country) {
      metaHtml += '<span class="am-tag am-tag-country">' + escapeHtml(item.country) + '</span>';
    }
    if (item.language) {
      metaHtml += '<span class="am-tag am-tag-language">' + escapeHtml(item.language) + '</span>';
    }
    if (item.active === true) {
      metaHtml += '<span class="am-tag am-tag-active">Actif</span>';
    } else if (item.active === false) {
      metaHtml += '<span class="am-tag am-tag-inactive">Inactif</span>';
    }

    // Description
    let descHtml = '';
    if (item.description) {
      descHtml = '<p class="am-card-description">' + escapeHtml(item.description) + '</p>';
    }

    // Extra tags
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
