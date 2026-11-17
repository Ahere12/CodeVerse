# Setting up the AI tutor

The tutor code is already built into CodeVerse. To switch it on you need an AI API key (paid per use) and about 10 minutes in Supabase. Until then, the tutor panel says it isn't switched on yet. Nothing breaks.

## What it costs

The tutor uses Anthropic's Claude (`claude-opus-5-5` by default) at **$4 per million input tokens and $20 per million output tokens**.

- A typical tutor reply is roughly **$0.01 to $0.03**. Repeated instructions are cached, which lowers the cost.
- Every signed-in learner gets **30 messages a day** by default, so one very active learner costs at most about $0.50 to $1 a day. Guests can't use it at all.
- In console.anthropic.com you can set a **monthly spend limit** so the bill can never go above it. Do this.

To make it cheaper, set `TUTOR_MODEL` to `claude-haiku-5-5` ($0.10 / $0.50 per million tokens, about 40× cheaper, but less capable at explaining code). That's your call.

## 1. Get an API key
1. Go to **console.anthropic.com**, sign up, and add billing (Settings → Billing). Set a **spend limit** there.
2. **API Keys → Create Key**. Name it `codeverse-tutor` and copy it (`sk-ant-...`).
3. Never put this key in the website, in `.env.local`, or in GitHub. It goes **only** into Supabase (step 3).

## 2. Create the usage table
In Supabase → **SQL Editor** → New query, paste the contents of `supabase/migrations/002_ai_usage.sql` and click **Run**.

## 3. Add the secret
Supabase → **Edge Functions** → **Secrets** (or Project Settings → Edge Functions) → **Add new secret**:

| Name | Value |
|---|---|
| `ANTHROPIC_API_KEY` | your `sk-ant-...` key |
| `TUTOR_DAILY_LIMIT` | optional, default `30` |
| `TUTOR_MODEL` | optional, default `claude-opus-5-5` |
| `ALLOWED_ORIGINS` | optional, default `https://codeverseteams.vercel.app,http://localhost:5173` |

## 4. Deploy the function
**Easiest (in the browser):** Supabase → **Edge Functions** → **Deploy a new function** → **Via Editor**.
- Name it exactly `ai-tutor`.
- Replace the sample code with the contents of `supabase/functions/ai-tutor/index.ts`.
- Click **Deploy**.
- Leave **Verify JWT** switched **on**.

**Or with the CLI:**
```bash
npx supabase login
npx supabase link --project-ref kwupiyswkyjculwprfgn
npx supabase functions deploy ai-tutor
```

## 5. Try it
Sign in on the site, click **Ask AI** in the top bar, and ask "What is a variable?".

## How it protects you
- The key exists only on Supabase's servers.
- Only signed-in users can call the function, and their login token is checked on every request.
- Each user has a per-day message limit, counted in the database.
- Message and context sizes are capped.
- Only your site's address is allowed to call it from a browser (CORS).
- The tutor is told to teach, give hints and ask questions, and to give full solutions only when explicitly asked after trying.
