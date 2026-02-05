# Bytes - Budget-Conscious Meal Planner

Bytes is a weekly meal planning app that generates personalized 7-day meal plans and grocery lists using AI. It helps families stay within budget while eating well.

## Features

- **AI-Powered Meal Plans**: Generate complete weekly meal plans tailored to your family size and budget
- **Weekly Calendar View**: See your entire week at a glance with a 7-column calendar (desktop) or accordion view (mobile)
- **Grocery Lists**: Auto-generated shopping lists organized by store with price estimates
- **Meal Preferences**: Thumbs up/down meals to teach the AI what your family likes and dislikes
- **Recipe Lookup**: Click any meal to get a detailed recipe with ingredients and step-by-step instructions
- **Household Sharing**: Invite family members to collaborate on meal planning
- **Week Navigation**: Browse past meal plans or plan future weeks
- **Print Recipes**: Print any recipe directly from the app

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Material UI
- **Backend**: Supabase (Postgres database + Edge Functions)
- **AI**: Anthropic Claude API

## Self-Hosting Guide

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)
- An [Anthropic](https://anthropic.com) API key

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/bytes.git
cd bytes
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```
3. Link your project:
   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```
4. Run the database migrations:
   ```bash
   supabase db push
   ```
5. Deploy the Edge Functions:
   ```bash
   supabase functions deploy generate-meal-plan --no-verify-jwt
   supabase functions deploy get-recipe --no-verify-jwt
   ```
6. Set your Anthropic API key as a secret:
   ```bash
   supabase secrets set ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

### 3. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials (found in Project Settings > API):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Configure Authentication (Optional)

To enable Google authentication:

1. In Supabase Dashboard, go to Authentication > Providers
2. Enable Google and add your OAuth credentials
3. Add your app URL to the redirect URLs

### 5. Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 6. Deploy to Production

#### GitHub Pages (Static Hosting)

1. Update `vite.config.ts` if deploying to a subpath
2. Set up GitHub Actions (see `.github/workflows/deploy.yml`)
3. Add your environment variables as repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

#### Other Platforms

The app builds to static files, so it can be hosted on any static hosting service:
- Vercel
- Netlify
- Cloudflare Pages

```bash
npm run build
# Deploy the 'dist' folder
```

## Usage

### Getting Started

1. Sign in with Google (or your configured auth provider)
2. Create or join a household
3. Set your family size and weekly budget in Household Settings

### Generating a Meal Plan

1. Click the **Generate** button
2. Optionally add dietary notes (e.g., "vegetarian", "no shellfish", "kid-friendly")
3. Wait for the AI to create your personalized plan
4. Your plan is automatically saved to the current week

### Managing Preferences

- Click the thumbs up/down icons on any meal to mark it as liked or disliked
- The AI will consider your preferences when generating future plans
- Disliked meals will be avoided; liked meals may inspire similar suggestions

### Viewing Recipes

- Click on any meal name to get a detailed recipe
- Recipes include prep time, cook time, ingredients, and step-by-step instructions
- Use the Print button to print recipes for offline use

### Week Navigation

- Use the arrow buttons to navigate between weeks
- Click "Today" to return to the current week
- Use the history icon to see all your saved plans

## Project Structure

```
bytes/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities, API, Supabase client
│   ├── pages/          # Page components
│   └── main.tsx        # App entry point
├── supabase/
│   ├── functions/      # Edge Functions (Deno)
│   └── migrations/     # Database migrations
└── public/             # Static assets
```

## License

MIT
