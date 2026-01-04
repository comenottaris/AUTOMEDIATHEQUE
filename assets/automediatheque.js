/* Automédiathèque - Script principal */

(function() {
  'use strict';

  var DEBUG = true;
  
  function log(msg) {
    if (DEBUG) console.log('[Automédiathèque] ' + msg);
  }

  log('Script chargé');

  // Chemins possibles pour le JSON
  var jsonPaths = [
    'automedias.json',
    './automedias.json',
    '../automedias.json',
    '/automedias.json',
    '/main/automedias.json'
  ];

  var allAutomedias = [];
  var currentFilters = { type: '', country: '', language: '', status: '' };

  // Éléments DOM
  var els = {};

  function init() {
    log('Initialisation...');
    
    els.grid = document.getElementById('automedias-grid');
    els.loading = document.getElementById('loading-state');
    els.error = document.getElementById('error-state');
    els.empty = document.getElementById('empty-state');
    els.status = document.getElementById('status-text');
    els.filterType = document.getElementById('filter-type');
    els.filterCountry = document.getElementById('filter-country');
    els.filterLanguage = document.getElementById('filter-language');
    els.filterStatus = document.getElementById('filter-status');
    els.reloadBtn = document.getElementById('reload-btn');
    els.updateDbBtn = document.getElementById('update-db-btn');
    els.retryBtn = document.getElementById('retry-btn');

    log('Grid trouvé: ' + !!els.grid);
    log('Loading trouvé: ' + !!els.loading);

    bindEvents();
    tryLoadJson(0);
  }

  function bindEvents() {
    if (els.filterType) els.filterType.onchange = function() { currentFilters.type = this.value; render(); };
    if (els.filterCountry) els.filterCountry.onchange = function() { currentFilters.country = this.value; render(); };
    if (els.filterLanguage) els.filterLanguage.onchange = function() { currentFilters.language = this.value; render(); };
    if (els.filterStatus) els.filterStatus.onchange = function() { currentFilters.status = this.value; render(); };
    if (els.reloadBtn) els.reloadBtn.onclick = function() { tryLoadJson(0); };
    if (els.retryBtn) els.retryBtn.onclick = function() { tryLoadJson(0); };
    if (els.updateDbBtn) els.updateDbBtn.onclick = function() {
      window.open('https://github.com/comenottaris/AUTOMEDIATHEQUE', '_blank');
    };
  }

  function tryLoadJson(index) {
    if (index >= jsonPaths.length) {
      log('ERREUR: Tous les chemins ont échoué');
      showError('Impossible de charger les données. Chemins testés: ' + jsonPaths.join(', '));
      return;
    }

    var path = jsonPaths[index];
    log('Tentative ' + (index + 1) + '/' + jsonPaths.length + ': ' + path);
    
    showLoading('Chargement... (' + path + ')');

    var xhr = new XMLHttpRequest();
    xhr.open('GET', path, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        log('Réponse pour ' + path + ': HTTP ' + xhr.status);
        
        if (xhr.status === 200) {
          try {
            var data = JSON.parse(xhr.responseText);
            log('JSON parsé, type: ' + typeof data + ', isArray: ' + Array.isArray(data));
            
            if (Array.isArray(data) && data.length > 0) {
              log('SUCCÈS: ' + data.length + ' éléments chargés depuis ' + path);
              allAutomedias = data;
              onDataLoaded();
            } else if (data && data.automedias && Array.isArray(data.automedias)) {
              log('SUCCÈS (format objet): ' + data.automedias.length + ' éléments');
              allAutomedias = data.automedias;
              onDataLoaded();
            } else {
              log('Format invalide, essai suivant...');
              tryLoadJson(index + 1);
            }
          } catch (e) {
            log('Erreur parsing JSON: ' + e.message);
            tryLoadJson(index + 1);
          }
        } else {
          tryLoadJson(index + 1);
        }
      }
    };
    xhr.onerror = function() {
      log('Erreur réseau pour ' + path);
      tryLoadJson(index + 1);
    };
    xhr.send();
  }

  function onDataLoaded() {
    log('Données chargées: ' + allAutomedias.length + ' automédias');
    
    populateFilters();
    hideLoading();
    render();
  }

  function populateFilters() {
    var types = {};
    var countries = {};
    var languages = {};
    var statuses = {};

    for (var i = 0; i < allAutomedias.length; i++) {
      var item = allAutomedias[i];
      if (item.type) types[item.type] = true;
      if (item.country) countries[item.country] = true;
      if (item.status) statuses[item.status] = true;
      if (item.languages && item.languages.length) {
        for (var j = 0; j < item.languages.length; j++) {
          if (item.languages[j]) languages[item.languages[j]] = true;
        }
      }
    }

    fillSelect(els.filterType, sortKeys(types), 'Tous types');
    fillSelect(els.filterCountry, sortKeys(countries), 'Tous pays');
    fillSelect(els.filterLanguage, sortKeys(languages), 'Toutes langues');
    fillSelect(els.filterStatus, sortKeys(statuses), 'Tous statuts');
  }

  function sortKeys(obj) {
    return Object.keys(obj).sort();
  }

  function fillSelect(select, options, defaultLabel) {
    if (!select) return;
    select.innerHTML = '';
    var opt = document.createElement('option');
    opt.value = '';
    opt.textContent = defaultLabel;
    select.appendChild(opt);
    for (var i = 0; i < options.length; i++) {
      var o = document.createElement('option');
      o.value = options[i];
      o.textContent = options[i];
      select.appendChild(o);
    }
  }

  function render() {
    if (!els.grid) {
      log('ERREUR: #automedias-grid non trouvé');
      return;
    }

    var filtered = [];
    for (var i = 0; i < allAutomedias.length; i++) {
      var item = allAutomedias[i];
      if (currentFilters.type && item.type !== currentFilters.type) continue;
      if (currentFilters.country && item.country !== currentFilters.country) continue;
      if (currentFilters.status && item.status !== currentFilters.status) continue;
      if (currentFilters.language) {
        if (!item.languages || item.languages.indexOf(currentFilters.language) === -1) continue;
      }
      filtered.push(item);
    }

    log('Affichage: ' + filtered.length + '/' + allAutomedias.length + ' automédias');

    if (els.status) {
      els.status.textContent = filtered.length + ' automédia' + (filtered.length !== 1 ? 's' : '');
    }

    if (els.empty) {
      els.empty.hidden = filtered.length > 0;
    }

    els.grid.innerHTML = '';

    if (filtered.length === 0) {
      return;
    }

    for (var i = 0; i < filtered.length; i++) {
      var card = createCard(filtered[i]);
      els.grid.appendChild(card);
    }
  }

  function createCard(item) {
    var card = document.createElement('article');
    card.className = 'am-card';

    var header = document.createElement('header');
    header.className = 'am-card-header';

    var title = document.createElement('h2');
    title.className = 'am-card-title';

    var link = document.createElement('a');
    link.href = item.url || '#';
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = item.name || 'Sans nom';
    title.appendChild(link);
    header.appendChild(title);

    var meta = document.createElement('div');
    meta.className = 'am-card-meta';

    if (item.type) {
      meta.appendChild(createTag(item.type, 'am-tag-type'));
    }
    if (item.country) {
      meta.appendChild(createTag(item.country, 'am-tag-country'));
    }
    if (item.languages && item.languages.length) {
      for (var i = 0; i < item.languages.length; i++) {
        meta.appendChild(createTag(item.languages[i], 'am-tag-language'));
      }
    }
    if (item.status) {
      var statusClass = item.status === 'online' ? 'am-tag-online' : 'am-tag-offline';
      meta.appendChild(createTag(item.status, statusClass));
    }

    var body = document.createElement('div');
    body.className = 'am-card-body';

    if (item.description) {
      var desc = document.createElement('p');
      desc.className = 'am-card-description';
      desc.textContent = item.description;
      body.appendChild(desc);
    }

    card.appendChild(header);
    card.appendChild(meta);
    card.appendChild(body);

    return card;
  }

  function createTag(text, extraClass) {
    var span = document.createElement('span');
    span.className = 'am-tag ' + (extraClass || '');
    span.textContent = text;
    return span;
  }

  function showLoading(msg) {
    if (els.loading) {
      els.loading.hidden = false;
      els.loading.innerHTML = '<p>' + escapeHtml(msg || 'Chargement...') + '</p>';
    }
    if (els.error) els.error.hidden = true;
    if (els.grid) els.grid.innerHTML = '';
  }

  function hideLoading() {
    if (els.loading) els.loading.hidden = true;
  }

  function showError(msg) {
    if (els.loading) els.loading.hidden = true;
    if (els.error) {
      els.error.hidden = false;
      var p = els.error.querySelector('p');
      if (p) p.textContent = msg || 'Erreur lors du chargement';
    }
  }

  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  // Démarrage
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
