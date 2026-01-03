document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('#search');
  const filterCountry = document.querySelector('#filter-country');
  const filterLanguage = document.querySelector('#filter-language');
  const listContainer = document.querySelector('#automedias-list');

  if (!listContainer) return;

  let data = [];

  async function load() {
    try {
      const res = await fetch('/automedias.json');
      data = await res.json();
      initFilters();
      render(data);
    } catch (e) {
      console.error(e);
      listContainer.innerHTML = '<p>Erreur lors du chargement des données.</p>';
    }
  }

  function initFilters() {
    const countries = Array.from(new Set(data.map(a => a.country).filter(Boolean))).sort();
    const languages = Array.from(new Set(data.map(a => a.language).filter(Boolean))).sort();

    if (filterCountry) {
      filterCountry.innerHTML =
        '<option value="">Pays (tous)</option>' +
        countries.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    if (filterLanguage) {
      filterLanguage.innerHTML =
        '<option value="">Langue (toutes)</option>' +
        languages.map(l => `<option value="${l}">${l}</option>`).join('');
    }
  }

  function render(list) {
    listContainer.innerHTML = '';
    if (!list.length) {
      listContainer.innerHTML = '<p>Aucun résultat.</p>';
      return;
    }

    list.forEach(a => {
      const el = document.createElement('article');
      el.className = 'automedia-item';
      el.innerHTML = `
        <h2><a href="/automedias/${a.slug}/">${a.name}</a></h2>
        <p class="meta">
          ${a.country || 'Pays ?'} · ${a.language || 'Langue ?'} · ${a.platform || a.type || ''}
        </p>
        <p class="desc">${a.description || ''}</p>
        ${a.url
          ? `<p><a href="${a.url}" target="_blank" rel="noopener noreferrer">Visiter le site / canal</a></p>`
          : ''
        }
      `;
      listContainer.appendChild(el);
    });
  }

  function applyFilters() {
    const q = (searchInput?.value || '').toLowerCase();
    const c = filterCountry?.value || '';
    const l = filterLanguage?.value || '';

    const filtered = data.filter(a => {
      const text = (
        (a.name || '') + ' ' +
        (a.description || '') + ' ' +
        (a.tags || []).join(' ')
      ).toLowerCase();

      const textMatch = !q || text.includes(q);
      const countryMatch = !c || a.country === c;
      const langMatch = !l || a.language === l;

      return textMatch && countryMatch && langMatch;
    });

    render(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (filterCountry) filterCountry.addEventListener('change', applyFilters);
  if (filterLanguage) filterLanguage.addEventListener('change', applyFilters);

  load();
});
