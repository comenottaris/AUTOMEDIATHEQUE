# Automédiathèque

Automédiathèque est un petit site statique qui recense des **automédias** : collectifs, sites, comptes et ressources d’information autonomes, avec un filtre par type, pays, langue et une recherche plein texte.

C’est important de pouvoir accéder au **ressenti** et au **vécu** des personnes en lutte directement depuis leur propre point de vue, pour comprendre la situation, les aider, ou s’outiller pour ses propres luttes.  
Ce projet propose un **portail** des différentes pratiques d’automédia, pour donner une vue d’ensemble et faciliter la découverte.

Projet conçu et développé par **Côme Nottaris**, journaliste.

---

## Démo

Version en ligne :  
https://automedias.netlify.app/

---

## Objectifs du projet

- Donner une **porte d’entrée** vers des automédias variés (territoires, thématiques, formats).
- Rendre visible la **diversité des pratiques** : sites, blogs, zines PDF, cartes, comptes Telegram/Instagram, chaînes vidéo, livestreams, etc.
- Proposer un **outil simple** à réutiliser, adapter ou forker : un JSON de données + une interface statique filtrable.
- Ouvrir un **terrain** pour la recherche : mémoire des luttes, archivage, infrastructures techniques, autorité politique des récits produits par les personnes concernées.

---

## Structure du projet

```text
.
├─ index.html                 # Page principale (UI, structure)
├─ automedias.json            # Données : liste des automédias
└─ assets/
   ├─ automediatheque.css     # Styles (thème minimal, mat, apaisé)
   └─ automediatheque.js      # Logique : chargement JSON + filtres
```

- `index.html` : structure de la page (en-tête, recherche, filtres, grille des cartes, pied de page).
- `automedias.json` : base de données minimale des automédias (un objet par automédia).
- `assets/automediatheque.css` : thème graphique sobre, mat, reposant.
- `assets/automediatheque.js` : chargement du JSON, génération des cartes, recherche, filtres.

---

## Données : `automedias.json`

Les automédias sont décrits dans un tableau JSON à la racine du dépôt :

```json
[
  {
    "name": "Automedias",
    "url": "https://automedias.org/en/",
    "type": "site",
    "languages": ["en"],
    "country": "France",
    "status": "online",
    "description": "Articles théoriques sur le sujet des automédias."
  },
  {
    "name": "Paris Luttes Info (portail)",
    "url": "https://paris-luttes.info/",
    "type": "site",
    "languages": ["fr"],
    "country": "France",
    "status": "online",
    "description": "Portail où les différents collectifs peuvent publier."
  }
]
```

### Champs

- `name` *(string, requis)*  
  Nom de l’automédia.

- `url` *(string, requis)*  
  Lien principal (site, canal, page, dépôt…).

- `type` *(string, requis)*  
  Type principal de support, par ex. :
  - `site`
  - `noblogs`
  - `telegram`
  - `instagram`
  - `video`
  - `map`
  - `pdf`
  - `zine`
  - `other`…

- `languages` *(array de string)*  
  Codes ou noms de langues : `"fr"`, `"en"`, `"es"`, `"ar"`, `"pt-BR"`, etc.

- `country` *(string)*  
  Pays ou zone géographique (`"France"`, `"International"`, `"Kurdistan"`, etc.).

- `status` *(string)*  
  État du projet : `online`, `offline`, `archived`, etc. (affiché comme badge).

- `description` *(string)*  
  Courte description contextuelle (objectif, type de contenus, public cible, etc.).

---

## Ajouter ou modifier un automédia

1. **Éditer `automedias.json`**

Ouvrir le fichier dans votre éditeur (VS Code, nano, notepad, etc.) et :

- ajouter un **nouvel objet** dans le tableau pour créer une entrée, ou
- modifier un objet existant pour mettre à jour.

2. **Vérifier la validité JSON**

- le fichier commence par `[` et se termine par `]` ;
- chaque objet est séparé par une **virgule** ;
- il n’y a **pas de virgule** après le *dernier* objet.

En cas de doute, utiliser un validateur JSON en ligne.

3. **Commit & push**

```bash
git add automedias.json
git commit -m "Ajout / mise à jour d'un automédia"
git push origin main
```

Le site sera ensuite mis à jour automatiquement (GitHub Pages, Netlify, ou autre hébergement statique).

---

## Développement / personnalisation

### HTML : `index.html`

Fichier principal de la page.  
On peut y modifier :

- le texte de présentation,
- la structure de l’en-tête,
- le pied de page (crédits, liens),
- l’ordre des blocs.

### CSS : `assets/automediatheque.css`

Thème actuel :

- palette **mate** et légèrement chaude,
- polices Google Fonts :
  - `Spectral` pour les titres (sérif douce),
  - `Nunito` pour le corps de texte (sans sérif arrondie),
- cartes sobres, légèrement ombrées,
- accent discret (vert-gris) pour les liens et les filtres.

Libre à vous de forker et d’adapter :

- couleurs (variables CSS `--am-*`),
- typographies,
- radius, marges, densité de la grille, etc.

### JavaScript : `assets/automediatheque.js`

Rôle :

- charger `automedias.json`,
- construire les cartes dans le DOM,
- gérer :
  - la recherche texte,
  - les filtres (type, pays, langue),
- afficher un message lorsqu’aucun résultat ne correspond.

---

## Développement local

Le site est un simple **front statique**.  
Pour le tester en local, il est préférable d’utiliser un petit serveur HTTP pour éviter les problèmes liés au chargement de fichiers locaux (CORS).

Avec Python 3 :

```bash
cd AUTOMEDIATHEQUE
python -m http.server 8000
```

Puis ouvrir :

- http://localhost:8000

dans un navigateur récent.

---

## Déploiement

Le projet est pensé pour être déployé comme **site statique** :

- GitHub Pages (dépôt public),
- ou n’importe quel hébergeur statique (Netlify, serveur perso, etc.).

Workflow typique :

```bash
git clone https://github.com/comenottaris/AUTOMEDIATHEQUE.git
cd AUTOMEDIATHEQUE

# modifications…
git commit -am "Message"

# envoi
git push origin main
```

La configuration exacte dépendra de la plateforme de déploiement (GitHub Pages, Netlify, etc.), mais dans tous les cas il suffit de servir les fichiers tels quels.

---

## Contexte théorique : que sont les automédias ?

### Définition-cadre

Les *automédias* désignent l’ensemble des pratiques, dispositifs et réseaux par lesquels des acteurs collectifs — mouvements sociaux, collectifs militants, communautés en lutte ou d’entraide — **produisent, publient et archivent eux-mêmes** des récits, preuves et instruments de leur action politique.

L’automédia combine :

- **autoproduction** : contenu créé par les protagonistes eux-mêmes ;
- **autogestion éditoriale** : contrôle des formes, des cadres de diffusion et des dispositifs d’archivage ;
- **polymédialité** : texte, photo, audio, vidéo, livestream, zines, dépôts numériques, cartes, etc.

Il s’agit de construire des régimes locaux de légitimation et de mémoire qui **concurrencent** ou **complètent** ceux des médias institutionnels.

### Fondements théoriques et positionnement disciplinaire

L’étude des automédias se situe à l’intersection :

- de l’**anthropologie documentaire**,
- des **media studies**,
- de la **sociologie politique**.

Elle mobilise notamment :

- l’idée d’une **fabrique populaire de l’information** (design informationnel participatif) ;
- l’analyse des **régimes de vérité** (procédures et acteurs qui confèrent crédibilité aux énoncés) ;
- une attention aux **infrastructures techniques** qui médiatisent l’expérience collective.

Cette approche dialogue avec :

- les travaux sur les **médias alternatifs** (Indymedia comme cas canonique),
- les recherches sur les pratiques de **media­activisme**,
- les études sur la manière dont les technologies numériques recomposent les rapports de pouvoir entre producteurs, plateformes et publics.

### Caractéristiques essentielles (opérationnelles pour la recherche)

1. **Autonomie éditoriale**  
   Décisions internes (parfois partagées, parfois très informelles) sur :
   - ce qui est publié,
   - les formats,
   - les publics visés.  
   Cette autonomie peut être **partielle**, du fait de la dépendance à des infrastructures externes (plateformes, hébergeurs).

2. **Polymédialité et redondance**  
   Recours systématique à plusieurs supports :
   - site + Telegram / FB / X,
   - YouTube / Odysee / PeerTube,
   - PDF, zines, cartes, pads collaboratifs…  
   Objectif : assurer **diffusion**, **archivage** et **résilience** face à la suppression et la censure.

3. **Performativité politique**  
   La mise en récit, la documentation et la diffusion ne sont pas neutres : ce sont des actes qui produisent :

   - alliance et solidarité,
   - légitimité publique,
   - capacité de mobilisation.  

   La documentation est simultanément **tactique** (outil de lutte) et **mémorielle** (fabrique d’archives).

4. **Archivalité vernaculaire**  
   Constitution d’archives non-instituées :
   - blogs,
   - maps,
   - dossiers PDF,
   - fichiers vidéo bruts,
   - drives partagés ou serveurs autonomes.  

   Ces archives exigent des méthodes spécifiques d’archivage, de description, d’analyse.

### Questions épistémologiques et méthodologiques

- **Fiabilité et partialité**  
  Les automédias sont des **sources primaires politisées**.  
  Enjeu : la **triangulation** (comparaison presse, témoignages, documents judiciaires, archives militantes) et l’étude des stratégies de présentation de soi, de preuve et d’authentification.

- **Approche ethnographique multi-modale**  
  Combiner :
  - observation participante,
  - entretiens semi-directifs avec les producteurs automédiatiques,
  - analyse de corpus (textes, vidéos, métadonnées, commentaires).  
  Objectif : rendre compte à la fois des pratiques, des circulations et des effets de diffusion.

- **Archivage reproductible**  
  En raison de la **volatilité** des contenus (suppression, censure, disparition de pages), il est crucial de mettre en place des pratiques d’archivage :
  - captures (PDF, images),
  - snapshots (Wayback Machine, autres services d’archivage),
  - copies locales,
  - sauvegarde des métadonnées.  
  Objectif : assurer la **reproductibilité scientifique** et l’**intégrité des sources**.

### Enjeux normatifs et éthiques

Les automédias soulèvent plusieurs tensions :

- entre **engagement politique** et **responsabilité factuelle** (risques de désinformation, rumeurs, erreurs factuelles),
- entre **protection des personnes** (sécurité des sources, activistes, publics vulnérables) et **valeur probante** des documents (usage potentiel comme preuves, en justice ou dans le plaidoyer),
- entre **autonomie** et **dépendance aux plateformes commerciales** (modération, algorithmes, surveillance, déréférencement).

Une réflexion éthique doit intégrer :

- les guides pratiques d’enregistrement et d’archivage,
- la sécurité numérique,
- le consentement et l’anonymisation,
- les attentes des collectifs sur la circulation secondaire de leurs contenus.

### Apports heuristiques pour la recherche

L’étude des automédias permet notamment de :

- analyser la **construction de l’autorité** et de la **crédibilité** dans les luttes contemporaines ;
- documenter l’**invention de formats narratifs et visuels** propres aux mouvements ;
- comprendre les **infrastructures politiques** : réseaux techniques, protocoles d’archivage, stratégies de redondance, choix de plateformes.

Étudier les automédias, c’est saisir simultanément :

- des **discours**,
- des **pratiques**,
- des **infrastructures**.

### Problèmes ouverts / pistes de recherche

- **Durabilité des archives automédiatiques**  
  Quelles pratiques d’archivage favorisent la **résilience documentaire** à long terme ?

- **Validité probatoire**  
  Dans quelles conditions les documents produits par des automédias peuvent-ils être mobilisés efficacement dans :
  - des procédures judiciaires,
  - des campagnes de plaidoyer,
  - des enquêtes indépendantes ?

- **Politique des plateformes**  
  Comment la dépendance aux infrastructures commerciales (hébergeurs, réseaux sociaux, services vidéo) reconfigure-t-elle l’**autonomie éditoriale** des collectifs ?

- **Régimes de vérité alternatifs**  
  Comment se construisent, circulent et se légitiment des énoncés de vérité au sein des publics d’automédias ?  
  Comment se joue la **géopolitique de la crédibilité** (publics affinitaires, contre-publics, publics hostiles) ?

---

## Références indicatives

Quelques points d’entrée pour prolonger le travail théorique et empirique :

- Automedias. (s.d.). *Pour une fabrique populaire de l'information à l'époque de la post-vérité.*  
  https://automedias.org/fr/publication/001-A/

- Pickard, V. W. (2006). *United yet autonomous: Indymedia and the struggle to sustain a radical democratic network.*  
  Media, Culture & Society, 28(3), 315–336.

- COSTECH (Galligo, I.). (2023). *Introduction au dossier « Automédias : Pour une fabrique populaire de l'information ».* Cahiers Costech.  
  https://costech.utc.fr/

- WITNESS. (s.d.). *Video as Evidence Field Guide* et ressources d’archivage/éthique.  
  https://vae.witness.org/  
  https://archiving.witness.org/

- Mídia NINJA. (s.d.). *Qui sommes-nous ?*  
  https://midianinja.org/  
  (exemple de réseau de livestream citoyen).

- CrimethInc. Ex-Workers Collective. (s.d.). *Library / zines.*  
  https://crimethinc.com/  
  (exemple d’auto-publication et d’archives militantes).

---

## Crédits & auteur

- **Conception et développement** : [Côme Nottaris](https://github.com/comenottaris), journaliste.  
- **Données** : collectées à partir de sources publiques, dans une optique de **documentation** des automédias et des médias autonomes de lutte.  
- Le dépôt et le site ont vocation à être :
  - un **outil pour les luttes** (repérage, veille, inspiration),
  - une **base de travail** pour la recherche (anthropologie documentaire, media studies, sociologie politique),
  - un **point de départ** pour mieux penser l’archivage, la mémoire et la circulation des récits produits par les personnes concernées.

