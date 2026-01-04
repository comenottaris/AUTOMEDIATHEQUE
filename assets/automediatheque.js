// assets/automediatheque.js

// Si automedias.json est à la racine à côté de index.html :
const DATA_URL = './automedias.json';

// Si tu le mets dans assets/, remplace par :
// const DATA_URL = './assets/automedias.json';

async function init() {
  const container = document.getElementById('am-results');
  if (!container) {
    console.error('Élément #am-results introuvable');
    return;
  }

  container.textContent = 'Chargement des données…';

  try {
    const res = await fetch(DATA_URL, { headers: { 'Accept': 'application/json' } });

    console.log('Statut HTTP du fetch :', res.status);

    if (!res.ok) {
      container.textContent = `Erreur de chargement (${res.status})`;
      return;
    }

    const data = await res.json();
    console.log('Données JSON chargées :', data);

    if (!Array.isArray(data)) {
      container.textContent = 'Le JSON doit être un tableau.';
      return;
    }

    // Affichage simple : une carte par entrée
    container.innerHTML = '';

    data.forEach((media) => {
      const article = document.createElement('article');
      article.style.border = '1px solid #ccc';
      article.style.padding = '0.5rem 1rem';
      article.style.margin = '0.5rem 0';

      const title = document.createElement('h3');
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

      const meta = document.createElement('p');
      meta.textContent = [
        media.type,
        media.country,
        Array.isArray(media.languages) ? media.languages.join(', ') : media.languages
      ].filter(Boolean).join(' · ');

      const desc = document.createElement('p');
      desc.textContent = media.description || '';

      article.appendChild(title);
      article.appendChild(meta);
      article.appendChild(desc);

      container.appendChild(article);
    });

    if (!data.length) {
      container.textContent = 'Aucun automédia dans la base.';
    }

  } catch (err) {
    console.error('Erreur lors du chargement/parsing du JSON :', err);
    container.textContent = 'Erreur lors du chargement de la base de données (voir console).';
  }
}

document.addEventListener('DOMContentLoaded', init);
