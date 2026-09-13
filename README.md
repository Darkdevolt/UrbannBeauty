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
