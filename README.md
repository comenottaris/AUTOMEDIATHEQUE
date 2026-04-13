
# Automédiathèque

Automédiathèque est un portail en ligne recensant des automédias : collectifs, sites, comptes et ressources d'information autonomes produits par des acteurs en lutte. Il propose une navigation filtrée par type, pays, langue et une recherche plein texte.

Ce projet répond à un enjeu central des luttes contemporaines : donner accès aux vécus et récits des personnes concernées, depuis leur propre point de vue, pour mieux comprendre les situations, soutenir les mobilisations ou s'outiller pour des actions locales.

Conçu et développé par [Côme Nottaris](https://muckrack.com/siratton), journaliste.

[Version en ligne](https://automediatheque.org/)

[![zread](https://img.shields.io/badge/Ask_Zread-_.svg?style=for-the-badge&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff)](https://zread.ai/comenottaris/AUTOMEDIATHEQUE)

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
- `country` : Pays ou zone géographique
- `status` : État (online, offline, archived)
- `description` : Description contextuelle (1-2 phrases)

---

## Contribuer

Pour proposer un nouvel automédia :
1. Utiliser le **[formulaire dédié](https://automediatheque.org/formulaire.html)**
2. Les propositions sont validées manuellement avant intégration


## Références
- [Automedias.org](https://Automedias.org) : *Pour une fabrique populaire de l'information*
---

## Crédits
**Auteur** : [Côme Nottaris](https://github.com/comenottaris)  
**Contact** : contact@automediatheque.org
**Licence** : MIT
