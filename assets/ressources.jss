const DATA_URL = './data/ressources.json';
const PROPOSALS_URL = './data/propositions.json';

let allResources = [];

const els = {
  results: null,
  filterTheme: null,
  filterLang: null,
  filterHashtags: null,
  statusText: null,
  refreshBtn: null,
  count: null,
};

function cacheDom() {
  els.results = document.getElementById('am-results');
  els.filterTheme = document.getElementById('am-filter-theme');
  els.filterLang = document.getElementById('am-filter-lang');
  els.filterHashtags = document.getElementById('am-filter-hashtags');
  els.statusText = document.getElementById('am-status-text');
  els.refreshBtn = document.getElementById('am-refresh-db');
  els.count = document.getElementById('am-count');
}

function setStatus(text) {
  if (els.statusText) els.statusText.textContent = Statut : ${text};
}
function setCount(n) {
  if (els.count) els.count.textContent = typeof n === 'number' ? n : '–';
}

function uniqueSorted(arr) {
  return Array.from(new Set(arr.filter(Boolean))).sort((a,b) => a.localeCompare(b,'fr',{sensitivity:'base'}));
}

function buildThemeOptions(items) {
  if (!els.filterTheme) return;
  // keep first option, remove others
  while (els.filterTheme.options.length > 1) els.filterTheme.remove(1);
  const themes = uniqueSorted(items.map(i => i.theme || i.category).filter(Boolean));
  themes.forEach(t => {
    const opt = document.createElement('option'); opt.value = t; opt.textContent = t;
    els.filterTheme.appendChild(opt);
  });
}

function buildHashtagOptions(items) {
  if (!els.filterHashtags) return;
  const tags = items.flatMap(i => {
    if (!i.tags) return [];
    if (Array.isArray(i.tags)) return i.tags;
    if (typeof i.tags === 'string') return i.tags.split(',').map(s => s.trim());
    return [];
  });
  const uniq = uniqueSorted(tags);
  els.filterHashtags.innerHTML = '';
  uniq.forEach(t => {
    const opt = document.createElement('option'); opt.value = t; opt.textContent = t;
    els.filterHashtags.appendChild(opt);
  });
}

async function loadData(forceReload = false) {
  if (!forceReload && allResources.length) return allResources;

  if (els.results) els.results.innerHTML = '<p class="am-message">Chargement des données…</p>';
  setStatus('chargement…');

  const cacheBust = forceReload ? ?t=${Date.now()} : '';
  const officialUrl = ${DATA_URL}${cacheBust};
  const proposalsUrl = ${PROPOSALS_URL}${cacheBust};

  const [resOfficial, resProps] = await Promise.all([
    fetch(officialUrl, { cache: 'no-store', headers: { Accept: 'application/json' } }),
    fetch(proposalsUrl, { cache: 'no-store', headers: { Accept: 'application/json' } }).catch(() => null),
  ]);

  if (!resOfficial.ok) {
    throw new Error(Erreur HTTP ${resOfficial.status} sur ressources.json);
  }
  const officialData = await resOfficial.json();
  if (!Array.isArray(officialData)) throw new Error('Le fichier ressources.json doit contenir un tableau.');

  let proposalsData = [];
  if (resProps && resProps.ok) {
    const raw = await resProps.json();
    if (Array.isArray(raw)) proposalsData = raw;
    else if (raw && typeof raw === 'object') proposalsData = Object.values(raw);
  }

  const officialTagged = officialData.map(r => ({ ...r, __origin: 'validated' }));
  const proposalsTagged = proposalsData.map(r => ({ ...r, __origin: 'proposed' }));

  allResources = [...officialTagged, ...proposalsTagged];

  setCount(allResources.length);

  // build filters
  buildThemeOptions(allResources);
  buildHashtagOptions(allResources);

  const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  setStatus(OK (${allResources.length} entrées, ${now}));

  return allResources;
}

function makePill(text, extraClass = '') {
  const span = document.createElement('span');
  span.className = am-pill ${extraClass}.trim();
  span.textContent = text;
  return span;
}

function renderList(list) {
  if (!els.results) return;
  if (!list.length) {
    els.results.innerHTML = '<p class="am-message">Aucune ressource pour ces critères.</p>';
    return;
  }

  els.results.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'am-grid';

  list.forEach((r) => {
    const card = document.createElement('article');
    card.className = 'am-card';
    if (r.__origin === 'proposed') card.classList.add('am-card-proposed');

// header
const header = document.createElement('div'); header.className = 'am-card-header';
header.style.display = 'flex'; header.style.gap = '0.75rem'; header.style.alignItems = 'flex-start';

const visual = document.createElement('div'); visual.className = 'am-card-visual';
visual.setAttribute('aria-hidden','true');
visual.textContent = (r.initials || (r.name||'').slice(0,2).toUpperCase());

const titleWrap = document.createElement('div'); titleWrap.style.flex = '1';
const title = document.createElement('h3'); title.className = 'am-card-title';
if (r.url) {
  const a = document.createElement('a'); a.href = r.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = r.name || 'Sans nom';
  title.appendChild(a);
} else {
  title.textContent = r.name || 'Sans nom';
}
titleWrap.appendChild(title);

// meta pills (theme/type/country/lang)
const meta = document.createElement('div'); meta.className = 'am-card-meta';
if (r.theme) meta.appendChild(makePill(r.theme, 'am-pill-theme filterable'));
if (r.type) meta.appendChild(makePill(r.type, 'am-pill-type'));
if (r.country) meta.appendChild(makePill(r.country, 'am-pill-country'));
if (r.languages) {
  const langs = Array.isArray(r.languages) ? r.languages.join(', ') : r.languages;
  meta.appendChild(makePill(langs, 'am-pill-lang'));
}
titleWrap.appendChild(meta);

header.appendChild(visual);
header.appendChild(titleWrap);
card.appendChild(header);

// description
const desc = document.createElement('p'); desc.className = 'am-card-desc'; desc.textContent = r.description || '—';
card.appendChild(desc);

// hashtags rendered as pills (non-duplicate) and clickable (filterable)
if (r.tags && (Array.isArray(r.tags) ? r.tags.length : (r.tags||'').length)) {
  const tagsWrap = document.createElement('div'); tagsWrap.className = 'am-card-meta';
  const tags = Array.isArray(r.tags) ? r.tags : (r.tags || '').split(',').map(s=>s.trim()).filter(Boolean);
  tags.forEach(t => tagsWrap.appendChild(makePill('#'+t, 'am-pill-hash filterable')));
  card.appendChild(tagsWrap);
}

// links bottom as grey pills (no doublons avec le titre/url)
if (r.links && Array.isArray(r.links) && r.links.length) {
  const linksWrap = document.createElement('div'); linksWrap.className = 'am-card-links';
  const seen = new Set();
  if (r.url) seen.add(r.url);
  r.links.forEach(l => {
    if (!l || !l.href) return;
    if (seen.has(l.href)) return;
    seen.add(l.href);
    const a = document.createElement('a'); a.className = 'am-pill-link'; a.href = l.href; a.target = '_blank'; a.rel='noopener noreferrer';
    a.textContent = l.title || l.href;
    linksWrap.appendChild(a);
  });
  if (linksWrap.children.length) card.appendChild(linksWrap);
}

grid.appendChild(card);

  });

  els.results.appendChild(grid);
}

function applyFilters() {
  if (!allResources.length) return;
  const theme = els.filterTheme ? els.filterTheme.value : '';
  const lang = els.filterLang ? els.filterLang.value : '';
  const hashtags = [];
  if (els.filterHashtags) {
    for (const opt of Array.from(els.filterHashtags.selectedOptions)) {
      if (opt.value) hashtags.push(opt.value);
    }
  }

  let list = allResources.slice();

  if (theme) list = list.filter(i => (i.theme || i.category || '').toLowerCase() === theme.toLowerCase());
  if (lang) list = list.filter(i => {
    if (!i.languages) return false;
    const langs = Array.isArray(i.languages) ? i.languages.map(x=>x.toLowerCase()) : String(i.languages).toLowerCase().split(',').map(x=>x.trim());
    return langs.includes(lang.toLowerCase());
  });
  if (hashtags.length) {
    list = list.filter(i => {
      const tags = Array.isArray(i.tags) ? i.tags.map(t=>t.toLowerCase()) : (i.tags||'').toLowerCase().split(',').map(s=>s.trim());
      return hashtags.some(h => tags.includes(h.toLowerCase()));
    });
  }

  renderList(list);
}

function setupEvents() {
  if (els.refreshBtn) {
    els.refreshBtn.addEventListener('click', async () => {
      try {
        setStatus('rafraîchissement…');
        await loadData(true);
        // reset filters
        if (els.filterTheme) els.filterTheme.value = '';
        if (els.filterLang) els.filterLang.value = '';
        if (els.filterHashtags) {
          for (const o of Array.from(els.filterHashtags.options)) o.selected = false;
        }
        applyFilters();
      } catch (err) {
        console.error('Erreur rafraîchissement', err);
        if (els.results) els.results.innerHTML = '<p class="am-message am-message-error">Erreur lors du rafraîchissement de la base.</p>';
        setStatus('erreur');
      }
    });
  }
  if (els.filterTheme) els.filterTheme.addEventListener('change', applyFilters);
  if (els.filterLang) els.filterLang.addEventListener('change', applyFilters);
  if (els.filterHashtags) els.filterHashtags.addEventListener('change', applyFilters);

  // delegation : clicking on an element with class .filterable toggles/apply filters
  document.addEventListener('click', (e) => {
    const pill = e.target.closest('.filterable');
    if (!pill) return;
    const text = pill.textContent.replace(/^#/, '').trim();

// try theme match
if (els.filterTheme && Array.from(els.filterTheme.options).some(o => o.value && o.value.toLowerCase() === text.toLowerCase())) {
  els.filterTheme.value = Array.from(els.filterTheme.options).find(o => o.value.toLowerCase() === text.toLowerCase()).value;
  applyFilters(); return;
}
// toggle hashtag in multi-select
if (els.filterHashtags) {
  const opt = Array.from(els.filterHashtags.options).find(o => o.value.toLowerCase() === text.toLowerCase());
  if (opt) {
    opt.selected = !opt.selected;
    applyFilters();
    return;
  }
}
// language quick filter (FR/EN/Multi)
if (els.filterLang && ['fr','en','multi'].includes(text.toLowerCase())) {
  els.filterLang.value = text.toLowerCase();
  applyFilters();
}

  });
}

async function init() {
  cacheDom();
  setupEvents();

  try {
    await loadData(false);
    applyFilters(); // initial render
  } catch (err) {
    console.error('Erreur init', err);
    if (els.results) els.results.innerHTML = '<p class="am-message am-message-error">Erreur lors du chargement de la base.</p>';
    setStatus('erreur');
    setCount(null);
  }
}

document.addEventListener('DOMContentLoaded', init);
