
# Automédiathèque

Automédiathèque est un portail en ligne recensant des automédias : collectifs, sites, comptes et ressources d'information autonomes produits par des acteurs en lutte. Il propose une navigation filtrée par type, pays, langue et une recherche plein texte.

Ce projet répond à un enjeu central des luttes contemporaines : donner accès aux vécus et récits des personnes concernées, depuis leur propre point de vue, pour mieux comprendre les situations, soutenir les mobilisations ou s'outiller pour des actions locales.

Conçu et développé par Côme Nottaris, journaliste.

[Version en ligne](https://www.automediatheque.linkpc.net/)

---

## Démarche

Les automédias désignent les pratiques où des collectifs produisent, publient et archivent eux-mêmes leurs récits, preuves et outils de lutte. Ils se distinguent par trois caractéristiques fondamentales :  
- **Autoproduction** : les contenus sont créés par les acteurs directement concernés  
- **Autogestion éditoriale** : contrôle des formats, des dispositifs de publication et d'archivage  
- **Polymédialité** : usage combiné de supports variés (sites, vidéos, zines, comptes sociaux, etc.)

Automédiathèque vise à documenter cette diversité pour plusieurs raisons imbriquées. D'abord, il s'agit de préserver les traces des mobilisations face à la censure et à l'oubli numérique, en constituant une mémoire des luttes. Ensuite, le projet rend visible la pluralité des pratiques et des territoires de lutte, loin des récits médiatiques dominants. Il fournit également une base de données pour l'analyse des infrastructures politiques, des formats narratifs et des régimes de crédibilité alternatifs, ouvrant un terrain de recherche en sciences sociales. Enfin, il constitue un outil pratique pour les collectifs eux-mêmes : faciliter la veille, l'inspiration et le repérage de ressources existantes.

---

## Architecture technique

### Structure des fichiers
```
.
├── index.html          # Interface principale (HTML/CSS/JS)
├── automedias.json     # Base de données des automédias
├── formulaire.html     # Formulaire d'ajout de nouveaux automédias
└── assets/
    ├── automediatheque.css  # Styles
    └── automediatheque.js   # Logique (filtres, recherche)
```

### Fonctionnement
- **`index.html`** : Structure complète de la page (en-tête, barre de recherche, filtres, grille d'affichage)
- **`automedias.json`** : Source unique de données (tableau d'objets JSON)
- **`formulaire.html`** : Formulaire web pour soumettre de nouveaux automédias
- **`automediatheque.js`** : Gère la logique côté client (récupération des données, génération des cartes, filtres)
- **`automediatheque.css`** : Définit le thème graphique

### Flux de données
1. L'utilisateur ouvre `index.html`
2. Le navigateur charge JS/CSS
3. JS effectue une requête fetch vers `automedias.json`
4. Les cartes sont générées dynamiquement
5. Les filtres et recherche modifient l'affichage en temps réel

---

## Données : automedias.json

Format d'un automédia :
```json
{
  "name": "Automedias",
  "url": "https://automedias.org/en/",
  "type": "site",
  "languages": ["en"],
  "country": "France",
  "status": "online",
  "description": "Articles théoriques sur les automédias."
}
```

**Champs obligatoires** :
- `name` : Nom de l'automédia
- `url` : Lien principal
- `type` : Type de support (site, telegram, video, etc.)
- `languages` : Langues (codes ISO : "fr", "es", "en")
- `country` : Pays ou zone géographique
- `status` : État (online, offline, archived)
- `description` : Description contextuelle (1-2 phrases)

---

## Contribuer

Pour proposer un nouvel automédia :
1. Utiliser le **[formulaire dédié](https://www.automediatheque.linkpc.net/formulaire.html)**
2. Les propositions sont validées manuellement avant intégration

Pour contribuer au code ou données :
```bash
# Forker le dépôt
git clone https://github.com/votre-utilisateur/automediatheque.git
cd automediatheque

# Éditer automedias.json
# Valider le JSON avec un linter

# Soumettre une Pull Request
git add automedias.json
git commit -m "Ajout de [nom]"
git push origin main
```

---

## Développement local

Lancer un serveur local :
```bash
python -m http.server 8000
```
Ouvrir [http://localhost:8000](http://localhost:8000)

Personnalisation :
- Modifier `index.html` pour la structure
- Adapter `assets/automediatheque.css` pour le style
- Modifier `assets/automediatheque.js` pour la logique

---

## Déploiement
Site statique compatible avec :
- GitHub Pages
- Netlify
- Vercel
- Tout hébergeur de fichiers statiques

Mise à jour automatique après `git push`

---

## Références
- Automedias.org : *Pour une fabrique populaire de l'information*
- WITNESS : *Video as Evidence Field Guide*
- Pickard (2006) : *United yet autonomous: Indymedia*
- COSTECH : *Automédias : Pour une fabrique populaire de l'information*

---

## Crédits
**Auteur** : [Côme Nottaris](https://github.com/comenottaris)  
**Contact** : contact@automediatheque.org
**Licence** : MIT
