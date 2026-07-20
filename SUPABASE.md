# Activer le mode multi-utilisateurs (Supabase)

Sans configuration, le portail admin fonctionne en **mode démonstration** : les données
restent dans le navigateur (localStorage) et la page de connexion accepte n'importe
quelle saisie. Pour passer en **mode multi-utilisateurs** (vraie authentification +
base de données partagée entre tous les postes), suivez ces étapes — environ 10 minutes.

## 1. Créer le projet Supabase (gratuit)

1. Créez un compte sur [supabase.com](https://supabase.com) puis **New project**.
2. Choisissez un nom (ex. `hh-istitmar`), un mot de passe de base de données, et la
   région **West EU (Paris)** (la plus proche du Maroc).

## 2. Créer les tables

1. Dans le tableau de bord Supabase, ouvrez **SQL Editor**.
2. Copiez tout le contenu du fichier [`supabase/schema.sql`](./supabase/schema.sql)
   de ce dépôt, collez-le, puis cliquez **Run**.

Cela crée les 9 tables (salariés, clients, fournisseurs, factures, dépenses, congés,
contrats, paie, déclarations) avec la sécurité RLS : seuls les utilisateurs
authentifiés peuvent lire/écrire.

## 3. Créer les comptes utilisateurs

1. Menu **Authentication → Users → Add user → Create new user**.
2. Saisissez l'email et le mot de passe de chaque personne autorisée
   (ex. `admin@hh-istitmar.ma`). Cochez **Auto Confirm User**.
3. Répétez pour chaque employé du bureau qui doit accéder au système.

> Par défaut l'inscription publique est ouverte sur Supabase. Pour que seuls vos
> comptes créés manuellement puissent entrer : **Authentication → Sign In / Up →
> désactiver "Allow new users to sign up"**.

## 4. Récupérer les clés du projet

Dans **Project Settings → API** :
- **Project URL** → ce sera `VITE_SUPABASE_URL`
- **anon / public key** → ce sera `VITE_SUPABASE_ANON_KEY`

(La clé `anon` est faite pour être publique — la sécurité vient de l'authentification
et des règles RLS.)

## 5. Configurer Vercel

1. [vercel.com](https://vercel.com) → votre projet → **Settings → Environment Variables**.
2. Ajoutez les deux variables (pour Production, Preview et Development) :
   - `VITE_SUPABASE_URL` = `https://xxxx.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJ...`
3. **Deployments → ⋯ → Redeploy** pour reconstruire le site avec les variables.

## 6. Vérifier

Ouvrez `votre-site.vercel.app/admin` : la page de connexion demande maintenant un
vrai email/mot de passe, et le tableau de bord affiche le badge vert **« Connecté »**
au lieu de « Mode démo ». Les données saisies sont partagées entre tous les
utilisateurs et tous les appareils.

## Développement local

```bash
cp .env.example .env.local   # puis renseigner les 2 variables
npm run dev
```
