# Setting up accounts (GitHub, Discord, Google)

CodeVerse works fully without accounts: progress is saved in the browser. Turning on accounts adds sign-in and cloud sync across devices. It uses [Supabase](https://supabase.com), whose free tier covers this.

You'll need to do these steps yourself: they create accounts and secrets that belong to you.

## 1. Create the Supabase project
1. Sign up at supabase.com and create a project.
2. Open **SQL Editor**, paste in `supabase/migrations/001_user_progress.sql` and run it. This creates the `user_progress` table with Row Level Security, so each user can only read and write their own row.
3. In **Project Settings → API**, copy the **Project URL** and the **anon public** key.
4. Copy `.env.example` to `.env.local` and paste both values in. **Never** use the `service_role` key in the frontend.

## 2. Set the redirect URLs
In **Authentication → URL Configuration**:
- **Site URL:** your production URL (for example `https://codeverse.example.com`)
- **Redirect URLs:** add `http://localhost:5173/account` and `https://YOUR-DOMAIN/account`

Every provider below uses the same callback URL, which is shown on each provider's page in Supabase:
`https://YOUR-PROJECT.supabase.co/auth/v1/callback`

## 3. Enable the providers
In **Authentication → Providers**:

| Provider | Where to create the OAuth app | Paste into Supabase |
|---|---|---|
| **GitHub** | github.com → Settings → Developer settings → OAuth Apps → New. Authorization callback URL = the Supabase callback URL. | Client ID + Client secret |
| **Discord** | discord.com/developers/applications → New Application → OAuth2. Add the Supabase callback URL as a redirect. | Client ID + Client secret |
| **Google** | console.cloud.google.com → APIs & Services → Credentials → Create OAuth client ID (Web). Add the Supabase callback URL as an authorised redirect URI, and set up the consent screen. | Client ID + Client secret |

Client secrets go **only into Supabase**, never into this repository.

## 4. Restart and test
Run `npm run dev`, open `/account` and sign in. The Account page shows the sync status.

## How sync works
- On sign-in, this device's progress is **merged** with the cloud copy. Nothing is lost: lessons and badges are combined and XP never goes down (see `src/lib/mergeProgress.ts`).
- Changes sync automatically within 30 seconds, and immediately when the tab is hidden.
- **Settings → Reset progress** while signed in overwrites the cloud copy as well.
- **Account → Delete cloud data** removes the row permanently.
