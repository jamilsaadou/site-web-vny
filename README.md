# Portail Officiel - Ville de Niamey

Site web moderne construit avec **Next.js 16**, **Prisma** et **PostgreSQL**.

## Sections publiques

- `Accueil`
- `Actualité`
- `Naneye Yarda`
- `Naneye Yarda Service` (portail des démarches)
- `Le centenaire`
- `Contact`

Le design est en mode clair avec une palette orange/vert inspirée du drapeau du Niger, des animations de reveal et un carrousel animé sur l'accueil.

## Panel admin (full gestion)

Routes principales:

- `/admin/login` : authentification
- `/admin` : tableau de bord
- `/admin/config-accueil` : configuration hero + SEO + slider
- `/admin/media` : import d'images (bibliothèque média)
- `/admin/actualites` : gestion actualités + image mise en avant + SEO
- `/admin/evenements` : gestion événements + image, galerie, géolocalisation, SEO
- `/admin/utilisateurs` : gestion des comptes admin (super admin)
- `/admin/logs` : logs d'activité
- `/admin/messages` : messages du formulaire contact

Le panel admin est protégé par session cookie HTTP-only signée.

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS v4
- Framer Motion
- Prisma ORM
- PostgreSQL

## Installation

```bash
npm install
cp .env.example .env
npm run db:generate
```

## Variables d'environnement

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/niamey_portal?schema=public"
ADMIN_EMAIL="superadmin@niamey.ne"
ADMIN_NAME="Super Admin Ville de Niamey"
ADMIN_PASSWORD="mot-de-passe-fort"
ADMIN_SECRET="secret-signature-session"
```

## Base de données

```bash
npm run db:push
npm run db:seed
```

`npm run db:seed` crée/met à jour:

- la configuration d'accueil,
- les slides,
- des actualités et événements de démarrage,
- le compte super admin défini par `ADMIN_EMAIL` + `ADMIN_PASSWORD`.

## Démarrage local

```bash
npm run dev
```

Site accessible sur `http://localhost:3000`.

## API contact

- Endpoint: `POST /api/contact`
- Enregistre les messages dans `ContactMessage`
- Validation des champs (nom, email, sujet, message)

## Scripts utiles

```bash
npm run dev         # mode développement
npm run build       # build production
npm run start       # lancer la build
npm run lint        # vérification ESLint
npm run db:generate # générer Prisma Client
npm run db:push     # pousser le schéma vers PostgreSQL
npm run db:studio   # ouvrir Prisma Studio
npm run db:seed     # injecter/mettre à jour les données initiales
```
