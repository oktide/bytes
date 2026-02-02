const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface MealPlanRequest {
  familySize: number
  weeklyBudget: number
  dietaryNotes?: string
  likedMeals?: string[]
  dislikedMeals?: string[]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }

    const { familySize, weeklyBudget, dietaryNotes, likedMeals, dislikedMeals }: MealPlanRequest = await req.json()

    let preferencesSection = ''
    if (likedMeals && likedMeals.length > 0) {
      preferencesSection += `\nMeals the family has LIKED (include similar meals):\n${likedMeals.map(m => `- ${m}`).join('\n')}\n`
    }
    if (dislikedMeals && dislikedMeals.length > 0) {
      preferencesSection += `\nMeals the family has DISLIKED (AVOID these completely):\n${dislikedMeals.map(m => `- ${m}`).join('\n')}\n`
    }

    const prompt = `You are a helpful meal planning assistant. Generate a weekly meal plan for a family of ${familySize} with a budget of $${weeklyBudget} per week.

${dietaryNotes ? `Dietary considerations: ${dietaryNotes}` : ''}
${preferencesSection}
Return ONLY valid JSON matching this exact structure (no markdown, no explanation):
{
  "familySize": ${familySize},
  "weeklyBudget": ${weeklyBudget},
  "estimatedWeeklyTotal": "$XXX",
  "days": [
    {
      "day": "Monday",
      "breakfast": "description",
      "lunch": "description",
      "dinner": "description",
      "dinnerCost": "$XX"
    }
  ],
  "groceries": {
    "Store Name (~$XXX)": [
      { "item": "Item name (quantity)", "price": "$XX" }
    ]
  }
}

Include all 7 days (Monday through Sunday). Organize groceries by store (suggest bulk stores like Sam's Club or Costco for larger items, and regular grocery stores for fresh items). Make meals practical, family-friendly, and budget-conscious. Ensure the estimated total stays within or close to the budget.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        //model: 'claude-sonnet-4-20250514',
        model: 'claude-haiku-4-5',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Anthropic API error: ${error}`)
    }

    const data = await response.json()
    let content = data.content[0]?.text

    if (!content) {
      throw new Error('No content in response')
    }

    // Strip markdown code fences if present
    content = content.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '')

    const mealPlan = JSON.parse(content)

    return new Response(JSON.stringify(mealPlan), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
