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
    console.log('Automédiathèque: Initialisation...');
    
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

    console.log('Automédiathèque: Éléments DOM:', {
      grid: !!elements.grid,
      loadingState: !!elements.loadingState,
      errorState: !!elements.errorState
    });

    bindEvents();
    loadData();
  }

  // =====================
  // Event Binding
  // =====================
  
  function bindEvents() {
    if (elements.reloadBtn) {
      elements.reloadBtn.addEventListener('click', function() {
        loadData();
      });
    }

    if (elements.updateDbBtn) {
      elements.updateDbBtn.addEventListener('click', function() {
        showUpdateModal();
      });
    }

    if (elements.retryBtn) {
      elements.retryBtn.addEventListener('click', function() {
        loadData();
      });
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
  
  function loadData() {
    showLoading();

    console.log('Automédiathèque: Chargement depuis', CONFIG.jsonUrl);

    fetch(CONFIG.jsonUrl, {
      method: 'GET',
      cache: 'no-cache'
    })
    .then(function(response) {
      console.log('Automédiathèque: Réponse HTTP', response.status);
      
      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }
      return response.text();
    })
    .then(function(text) {
      console.log('Automédiathèque: Données reçues, longueur:', text.length);
      console.log('Automédiathèque: Début des données:', text.substring(0, 100));
      
      var data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Automédiathèque: Erreur parsing JSON:', e);
        throw new Error('JSON invalide: ' + e.message);
      }
      
      console.log('Automédiathèque: Type de données:', typeof data, Array.isArray(data));
      
      // Le JSON est un tableau direct
      if (Array.isArray(data)) {
        allAutomedias = data;
      } else if (data && data.automedias && Array.isArray(data.automedias)) {
        allAutomedias = data.automedias;
      } else {
        throw new Error('Format non reconnu');
      }
      
      console.log('Automédiathèque: Nombre d\'automédias:', allAutomedias.length);
      
      if (allAutomedias.length > 0) {
        console.log('Automédiathèque: Premier élément:', allAutomedias[0]);
      }
      
      updateMetadata();
      populateFilters();
      applyFilters();
      showSuccess();
    })
    .catch(function(error) {
      console.error('Automédiathèque: Erreur:', error);
      showError(error.message);
    });
  }

  // =====================
  // Metadata
  // =====================
  
  function updateMetadata() {
    if (elements.dbVersion) {
      elements.dbVersion.textContent = '1.0';
    }

    if (elements.dbDate) {
      var today = new Date();
      var dateStr = today.getFullYear() + '-' + 
                    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(today.getDate()).padStart(2, '0');
      elements.dbDate.textContent = formatDate(dateStr);
    }

    if (elements.metaInfo) {
      elements.metaInfo.textContent = allAutomedias.length + ' automédias référencés';
    }
  }

  // =====================
  // Filters
  // =====================
  
  function populateFilters() {
    var types = {};
    var countries = {};
    var languages = {};
    var statuses = {};

    allAutomedias.forEach(function(item) {
      if (item.type && item.type.trim() !== '') {
        types[item.type] = true;
      }
      if (item.country && item.country.trim() !== '') {
        countries[item.country] = true;
      }
      if (item.status && item.status.trim() !== '') {
        statuses[item.status] = true;
      }
      
      // languages est un tableau
      if (item.languages && Array.isArray(item.languages)) {
        item.languages.forEach(function(lang) {
          if (lang && lang.trim() !== '') {
            languages[lang] = true;
          }
        });
      }
    });

    populateSelect(elements.filterType, Object.keys(types).sort(), 'Tous types');
    populateSelect(elements.filterCountry, Object.keys(countries).sort(), 'Tous pays');
    populateSelect(elements.filterLanguage, Object.keys(languages).sort(), 'Toutes langues');
    populateSelect(elements.filterStatus, Object.keys(statuses).sort(), 'Tous statuts');
  }

  function populateSelect(select, options, defaultLabel) {
    if (!select) return;

    select.innerHTML = '';
    
    var defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = defaultLabel;
    select.appendChild(defaultOpt);

    options.forEach(function(option) {
      var opt = document.createElement('option');
      opt.value = option;
      opt.textContent = formatLabel(option);
      select.appendChild(opt);
    });
  }

  function formatLabel(value) {
    var labels = {
      // Status
      'online': 'En ligne',
      'offline': 'Hors ligne',
      'unknown': 'Inconnu',
      // Languages
      'fr': 'Français',
      'en': 'English',
      'es': 'Español',
      'de': 'Deutsch',
      'it': 'Italiano',
      'pt': 'Português',
      'pt-BR': 'Português (BR)',
      // Types
      'site': 'Site web',
      'blog': 'Blog',
      'noblogs': 'Noblogs',
      'telegram': 'Telegram',
      'Instagram': 'Instagram',
      'radio': 'Radio',
      'video': 'Vidéo',
      'podcast': 'Podcast',
      'other': 'Autre'
    };
    return labels[value] || value;
  }

  function applyFilters() {
    var filtered = allAutomedias.filter(function(item) {
      // Filtre par type
      if (currentFilters.type && item.type !== currentFilters.type) {
        return false;
      }
      
      // Filtre par pays
      if (currentFilters.country && item.country !== currentFilters.country) {
        return false;
      }
      
      // Filtre par statut
      if (currentFilters.status && item.status !== currentFilters.status) {
        return false;
      }
      
      // Filtre par langue (languages est un tableau)
      if (currentFilters.language) {
        if (!item.languages || !Array.isArray(item.languages)) {
          return false;
        }
        if (item.languages.indexOf(currentFilters.language) === -1) {
          return false;
        }
      }
      
      return true;
    });

    console.log('Automédiathèque: Filtrage -', filtered.length, '/', allAutomedias.length);
    
    renderCards(filtered);
    updateStatusText(filtered.length);
  }

  // =====================
  // Rendering
  // =====================
  
  function renderCards(items) {
    if (!elements.grid) {
      console.error('Automédiathèque: Élément grid non trouvé');
      return;
    }

    elements.grid.innerHTML = '';

    if (!items || items.length === 0) {
      showEmpty();
      return;
    }

    hideAllStates();

    items.forEach(function(item) {
      var card = createCard(item);
      elements.grid.appendChild(card);
    });
  }

  function createCard(item) {
    var card = document.createElement('article');
    card.className = 'am-card';

    var name = item.name || 'Sans nom';
    var url = item.url || '#';
    var type = item.type || '';
    var country = item.country || '';
    var status = item.status || '';
    var description = item.description || '';
    var languages = item.languages || [];

    // Construction du HTML de la carte
    var html = '';
    
    // Header avec titre
    html += '<header class="am-card-header">';
    html += '<h2 class="am-card-title">';
    html += '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">';
    html += escapeHtml(name);
    html += '</a>';
    html += '</h2>';
    html += '</header>';
    
    // Meta tags
    html += '<div class="am-card-meta">';
    
    if (type) {
      html += '<span class="am-tag am-tag-type">' + escapeHtml(formatLabel(type)) + '</span>';
    }
    
    if (country) {
      html += '<span class="am-tag am-tag-country">' + escapeHtml(country) + '</span>';
    }
    
    if (languages.length > 0) {
      languages.forEach(function(lang) {
        html += '<span class="am-tag am-tag-language">' + escapeHtml(formatLabel(lang)) + '</span>';
      });
    }
    
    if (status) {
      var statusClass = (status === 'online') ? 'am-tag-active' : 'am-tag-inactive';
      html += '<span class="am-tag ' + statusClass + '">' + escapeHtml(formatLabel(status)) + '</span>';
    }
    
    html += '</div>';
    
    // Body avec description
    html += '<div class="am-card-body">';
    if (description) {
      html += '<p class="am-card-description">' + escapeHtml(description) + '</p>';
    }
    html += '</div>';

    card.innerHTML = html;
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
      var errorP = elements.errorState.querySelector('p');
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
    var msg = 'Pour ajouter ou modifier un automédia :\n\n' +
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
      var parts = dateString.split('-');
      if (parts.length === 3) {
        var months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        var day = parseInt(parts[2], 10);
        var month = months[parseInt(parts[1], 10) - 1];
        var year = parts[0];
        return day + ' ' + month + ' ' + year;
      }
      return dateString;
    } catch (e) {
      return dateString;
    }
  }

  function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    var str = String(text);
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
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
