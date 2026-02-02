# CLAUDE.md — Bytes

## What this app is

Bytes is a budget-conscious weekly meal planner. It generates personalized 7-day meal plans and grocery lists via Claude AI, persists saved plans in Supabase, and is designed to be hosted for free on GitHub Pages.

## Tech stack

- **Frontend**: Vite + React + Typescript + MUI (Material UI). .
- **State**: Use @tanstack/react-query for state hooks.
- **Routing**: Use react-router for page routes
- **Styling**: MUI theme in `src/lib/theme.js`. Warm green palette (`#2d5016` primary), earthy tones. Fonts are Playfair Display (headings) and Source Sans 3 (body), injected via a Google Fonts link at theme load time. Do not add Tailwind or other CSS frameworks.
- **Backend**: Supabase Edge Functions (Deno runtime). There is no Node.js server, no Express, no separate API service.
- **Database**: Supabase Postgres. Single table: `meal_plans`. RLS is enabled with permissive anonymous policies (no auth required currently).
- **AI**: Anthropic Claude, called from the Edge Function. The API key lives as a Supabase secret — it never touches the client.

## Data flow

1. User adjusts preferences (family size, budget, dietary notes) in `MealView`.
2. Hitting "Generate Plan" calls `generate()` in `useMealPlanner`.
3. That calls `generateMealPlan()` in `api.js`, which invokes the `generate-meal-plan` Edge Function via `supabase.functions.invoke()`.
4. The Edge Function builds a prompt, POSTs to `https://api.anthropic.com/v1/messages`, parses the JSON response, and returns it.
5. The plan lands in `currentPlan` state and renders immediately.
6. "Save" persists `currentPlan` to the `meal_plans` table. History loads on mount and populates a right-side drawer.

## Expected meal plan JSON shape

This is an example of what Claude returns and what the frontend expects. Everything keys off this structure.

```json
{
  "familySize": 4,
  "weeklyBudget": 300,
  "estimatedWeeklyTotal": "$310",
  "days": [
    {
      "day": "Monday",
      "breakfast": "...",
      "lunch": "...",
      "dinner": "...",
      "dinnerCost": "$12"
    }
  ],
  "groceries": {
    "Sam's Club (~$200)": [
      { "item": "Chicken thighs (5 lb)", "price": "$9" }
    ],
    "Giant (~$110)": [
      { "item": "Lettuce", "price": "$3" }
    ]
  }
}
```

## Key conventions

- **All API calls go through `src/lib/api.ts`.** Don't call Supabase or the Edge Function directly from components or hooks. Add new endpoints here.
- **MUI `sx` prop for all inline styles.** Use theme tokens (`theme.palette.primary.main`, `theme.spacing()`) where possible. Avoid raw CSS files.
- **The Edge Function runs on Deno, not Node.** No `require()`, no npm packages. Use native `fetch()` for HTTP. The Anthropic API key is read via `Deno.env.get('ANTHROPIC_API_KEY')`.
- **CORS headers are required on every Edge Function response**, including error responses. The `corsHeaders` object is defined at the top of `index.ts`.
- **Database migrations live in `supabase/migrations/`** and are named with a numeric prefix. If you add a table or column, create a new migration file — don't edit the existing one.
- **Environment variables for the frontend are prefixed with `VITE_`.** See `.env.example` for the full list. Never hardcode Supabase URLs or keys.

## Additional features

- **Auth**: Would like to auth with google / whatever social options
- **Want a way to thumbs down meals**: Saving successful meals is OK, but I would rather have a way to reject meals that the family either didn't like or we will not make. 
- **No server-side rendering.** GitHub Pages serves static files. The Edge Function is the only server-side piece, and it's stateless.
- **No streaming.** The Edge Function waits for Claude's full response before returning. If generation feels slow, streaming could be added later, but it complicates the Edge Function and the frontend significantly for a single-shot use case like this.
