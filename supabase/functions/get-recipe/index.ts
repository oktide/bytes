const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface RecipeRequest {
  mealName: string
  servings: number
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

    const { mealName, servings }: RecipeRequest = await req.json()

    if (!mealName) {
      throw new Error('mealName is required')
    }

    console.log('Generating recipe for:', mealName, 'servings:', servings)

    const prompt = `You are a helpful cooking assistant. Generate a detailed recipe for "${mealName}" that serves ${servings || 4} people.

Return ONLY valid JSON matching this exact structure (no markdown, no explanation):
{
  "name": "${mealName}",
  "prepTime": "XX minutes",
  "cookTime": "XX minutes",
  "servings": ${servings || 4},
  "ingredients": [
    "1 cup ingredient",
    "2 tbsp ingredient"
  ],
  "instructions": [
    "Step 1 description",
    "Step 2 description"
  ],
  "tips": "Optional helpful tips for this recipe"
}

Make the recipe practical and family-friendly. Include specific measurements and clear instructions. Keep ingredient list reasonable (under 15 items if possible).`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic API error:', response.status, errorText)
      throw new Error(`Anthropic API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    let content = data.content[0]?.text

    if (!content) {
      throw new Error('No content in response')
    }

    // Strip markdown code fences if present
    content = content.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '')

    const recipe = JSON.parse(content)

    return new Response(JSON.stringify(recipe), {
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
