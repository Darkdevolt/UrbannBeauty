# Urbann Beauty

Maquette HTML/CSS/JS d'un site e-commerce de cosmétiques — boutique publique + espace d'administration.

## Structure

```
urbann-beauty/
├── index.html          Page d'accueil
├── boutique.html        Catalogue produits (filtres, catégories, tri)
├── produit.html          Fiche produit détaillée
├── panier.html           Panier (localStorage)
├── a-propos.html         Page À propos
├── contact.html          Page Contact
├── assets/
│   ├── css/style.css     Design system du site public
│   └── js/
│       ├── data.js       Données produits/catégories (mock)
│       ├── icons.js      Icônes SVG inline
│       └── main.js       Header/footer, panier, animations
└── admin/
    ├── index.html         Connexion admin (démo : identifiants pré-remplis)
    ├── dashboard.html      Tableau de bord (statistiques, ventes)
    ├── produits.html       Gestion produits & stock (upload photo/vidéo, description)
    ├── commandes.html      Gestion des commandes & ventes
    ├── clients.html        Liste des clientes
    └── assets/
        ├── admin.css
        └── admin.js
```

## Aperçu rapide

- **Site public** : pas d'inscription obligatoire, navigation par catégorie, fiches produits, panier.
- **Espace admin** (`/admin`) : gestion des produits (ajout/édition avec upload photo & vidéo), suivi du stock, gestion des commandes/ventes, vue clients.
- Données de démonstration en dur (`assets/js/data.js`), persistance des modifications admin via `localStorage` (aucun backend pour l'instant — c'est une maquette de test).

## Lancer le site en local

Ouvrez simplement `index.html` dans un navigateur, ou servez le dossier avec un petit serveur statique :

```bash
npx serve .
```

Connexion admin de démo : `admin@urbannbeauty.com` / `demo1234` (champs pré-remplis sur `/admin`).

## Palette

Blanc dominant avec touches de mauve (`--mauve-500: #8e56bd`) et accent doré discret, typographie Playfair Display (titres) + Poppins (texte).

## Sauvegardes automatiques

Le projet Supabase est sur le plan gratuit : **aucune sauvegarde ni point-in-time recovery n'est fourni par Supabase**. Un incident a déjà entraîné la perte de tous les produits en septembre 2026.

Un workflow GitHub Actions (`.github/workflows/backup.yml`) exporte chaque nuit à 3h UTC toutes les tables importantes vers `backups/<date>/*.json`, committées directement dans ce dépôt (donc consultables/restaurables via l'historique Git). Rétention : 30 jours glissants.

Le même workflow purge aussi les photos que les clientes joignent au checkout (bucket Storage privé `client-uploads`, ex : photo de teint pour un fond de teint) après 7 jours — le temps de préparer la commande, pas une archive permanente de photos personnelles.

**Pour l'activer** (à faire une seule fois, directement sur GitHub — jamais dans une conversation avec un assistant) :
1. Allez sur `Supabase Dashboard → Project Settings → API` et copiez la clé **`service_role`** (⚠️ jamais la clé `anon` — la `service_role` donne un accès complet, à ne partager avec personne).
2. Sur GitHub : `Settings → Secrets and variables → Actions → New repository secret`.
3. Nom : `SUPABASE_SERVICE_ROLE_KEY`, valeur : la clé copiée. Enregistrez.

Sans ce secret, le workflow échoue proprement avec un message clair (`Onglet Actions` du dépôt) plutôt que d'échouer silencieusement.

Pour restaurer une table depuis une sauvegarde : ouvrez le fichier JSON correspondant et réinsérez les lignes via l'éditeur SQL Supabase (ou demandez à votre assistant de le faire à partir du fichier).
