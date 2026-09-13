# Urbann Beauty — Organisation des visuels

Déposez les visuels dans ce dossier en conservant une nomenclature simple et stable :

- `logo.png` — logo principal
- `hero-main.webp` — visuel principal du Hero
- `hero-product.webp` — produit flottant du Hero
- `welcome-offer.webp` — visuel de l’offre de bienvenue
- `editorial-routine.webp` — routine beauté / conseils personnalisés
- `brands-editorial.webp` — sélection de marques
- `commitment-beauty.webp` — engagements

## Catégories

Les images de catégories sont prévues dans `assets/img/categories/` :

- `cat-visage.webp`
- `cat-maquillage.webp`
- `cat-parfums.webp`
- `cat-corps.webp`
- `cat-cheveux.webp`
- `cat-accessoires.webp`

> Si GitHub reçoit un fichier avec une extension supplémentaire (par exemple `.webp.png`), le nom réel du fichier doit être utilisé dans la configuration du site. La médiathèque admin permet aussi de remplacer un visuel sans modifier le HTML.

## Gestion depuis l'admin

Depuis **Admin → Catégories → Médiathèque**, vous pouvez remplacer les visuels des emplacements principaux et importer une image pour chaque catégorie. Les produits disposent déjà de leur propre upload photo dans **Produits & Stock**.

Cette version statique conserve les remplacements effectués par l'admin dans `localStorage`. Pour une gestion centralisée sur plusieurs appareils, le prochain niveau consiste à connecter ces uploads à un stockage cloud/API (par exemple Supabase Storage).
