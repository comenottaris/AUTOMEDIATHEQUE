/* Automédiathèque - Debug */

(function() {
  'use strict';

  console.log('=== AUTOMEDIATHEQUE DEBUG ===');

  // Essayer plusieurs chemins possibles
  var paths = [
    '../automedias.json',
    './automedias.json',
    '/automedias.json',
    'automedias.json'
  ];

  function tryLoad(index) {
    if (index >= paths.length) {
      console.error('Tous les chemins ont échoué');
      document.getElementById('loading-state').innerHTML = '<p style="color:red">Erreur: Impossible de charger le JSON. Vérifiez la console.</p>';
      return;
    }

    var path = paths[index];
    console.log('Essai ' + (index + 1) + ': ' + path);

    fetch(path)
      .then(function(response) {
        console.log('Réponse pour ' + path + ':', response.status, response.ok);
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }
        return response.json();
      })
      .then(function(data) {
        console.log('SUCCÈS avec ' + path);
        console.log('Type:', typeof data, 'Est tableau:', Array.isArray(data));
        console.log('Nombre éléments:', Array.isArray(data) ? data.length : 'N/A');
        
        if (Array.isArray(data) && data.length > 0) {
          console.log('Premier élément:', data[0]);
          initApp(data, path);
        } else {
          throw new Error('Données vides ou format incorrect');
        }
      })
      .catch(function(err) {
        console.warn('Échec pour ' + path + ':', err.message);
        tryLoad(index + 1);
      });
  }

  function initApp(automedias, successPath) {
    console.log('Initialisation avec ' + automedias.length + ' automédias');
    
    var grid = document.getElementById('automedias-grid');
    var loading = document.getElementById('loading-state');
    var statusText = document.getElementById('status-text');
    var filterType = document.getElementById('filter-type');
    var filterCountry = document.getElementById('filter-country');
    var filterLanguage = document.getElementById('filter-language');
    var filterStatus = document.getElementById('filter-status');

    if (loading) loading.hidden = true;
    if (statusText) statusText.textContent = automedias.length + ' automédias';

    // Collecter les valeurs uniques pour les filtres
    var types = {};
    var countries = {};
    var languages = {};
    var statuses = {};

    automedias.forEach(function(item) {
      if (item.type) types[item.type] = true;
      if (item.country) countries[item.country] = true;
      if (item.status) statuses[item.status] = true;
      if (item.languages && Array.isArray(item.languages)) {
        item.languages.forEach(function(lang) {
          if (lang) languages[lang] = true;
        });
      }
    });

    // Remplir les filtres
    fillSelect(filterType, Object.keys(types).sort(), 'Tous types');
    fillSelect(filterCountry, Object.keys(countries).sort(), 'Tous pays');
    fillSelect(filterLanguage, Object.keys(languages).sort(), 'Toutes langues');
    fillSelect(filterStatus, Object.keys(statuses).sort(), 'Tous statuts');

    // État global
    var state = {
      all: automedias,
      filters: { type: '', country: '', language: '', status: '' }
    };

    // Bindre les filtres
    if (filterType) filterType.onchange = function() { state.filters.type = this.value; render(); };
    if (filterCountry) filterCountry.onchange = function() { state.filters.country = this.value; render(); };
    if (filterLanguage) filterLanguage.onchange = function() { state.filters.language = this.value; render(); };
    if (filterStatus) filterStatus.onchange = function() { state.filters.status = this.value; render(); };

    function render() {
      var filtered = state.all.filter(function(item) {
        if (state.filters.type && item.type !== state.filters.type) return false;
        if (state.filters.country && item.country !== state.filters.country) return false;
        if (state.filters.status && item.status !== state.filters.status) return false;
        if (state.filters.language) {
          if (!item.languages || item.languages.indexOf(state.filters.language) === -1) return false;
        }
        return true;
      });

      if (statusText) statusText.textContent = filtered.length + ' automédia' + (filtered.length > 1 ? 's' : '');

      if (!grid) return;
      grid.innerHTML = '';

      if (filtered.length === 0) {
        grid.innerHTML = '<p class="state-message">Aucun résultat</p>';
        return;
      }

      filtered.forEach(function(item) {
        var card = document.createElement('article');
        card.className = 'am-card';

        var tagsHtml = '';
        if (item.type) tagsHtml += '<span class="am-tag am-tag-type">' + esc(item.type) + '</span>';
        if (item.country) tagsHtml += '<span class="am-tag am-tag-country">' + esc(item.country) + '</span>';
        if (item.languages && item.languages.length > 0) {
          item.languages.forEach(function(l) {
            tagsHtml += '<span class="am-tag am-tag-language">' + esc(l) + '</span>';
          });
        }
        if (item.status) {
          var statusClass = item.status === 'online' ? 'am-tag-active' : 'am-tag-inactive';
          tagsHtml += '<span class="am-tag ' + statusClass + '">' + esc(item.status) + '</span>';
        }

        card.innerHTML = 
          '<header class="am-card-header">' +
            '<h2 class="am-card-title">' +
              '<a href="' + esc(item.url || '#') + '" target="_blank" rel="noopener">' + esc(item.name || 'Sans nom') + '</a>' +
            '</h2>' +
          '</header>' +
          '<div class="am-card-meta">' + tagsHtml + '</div>' +
          '<div class="am-card-body">' +
            (item.description ? '<p class="am-card-description">' + esc(item.description) + '</p>' : '') +
          '</div>';

        grid.appendChild(card);
      });
    }

    render();
  }

  function fillSelect(select, options, defaultLabel) {
    if (!select) return;
    select.innerHTML = '<option value="">' + defaultLabel + '</option>';
    options.forEach(function(opt) {
      var o = document.createElement('option');
      o.value = opt;
      o.textContent = opt;
      select.appendChild(o);
    });
  }

  function esc(text) {
    if (text === null || text === undefined) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(text)));
    return div.innerHTML;
  }

  // Démarrer
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { tryLoad(0); });
  } else {
    tryLoad(0);
  }

})();
