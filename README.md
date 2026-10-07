# DECIV — Decision Intelligence for Commerce
Know before you commit.

## Structure
- `index.html` – shell + styles
- `js/app.js` – UI/pages · `js/calc.js` – calculationService (deterministic) · `js/aiService.js` – AI client
- `js/storage.js` – storageService (localStorage; swap for Supabase/Firebase) · `js/i18n.js` – EN/RU/KZ
- `api/ai.js` – serverless Gemini proxy (reads `GEMINI_API_KEY` from env; never sent to the browser)

## Run
1. Free key: https://aistudio.google.com/apikey
2. `npm i -g vercel` → in this folder: `vercel dev` (set `GEMINI_API_KEY` when prompted, or in a `.env` file / Vercel project settings)
3. Open the printed URL. Deploy with `vercel --prod`.

Without a key the app still works: AI features show a friendly "AI unavailable" message and all calculations continue.
