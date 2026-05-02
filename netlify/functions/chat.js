const Anthropic = require('@anthropic-ai/sdk');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { messages, recipes, plan, shop } = JSON.parse(event.body);
    
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: `You are a personal keto cooking assistant and nutritionist for a type 2 diabetic with fatty liver on Mounjaro. 

Current cookbook has ${recipes?.length || 0} recipes.
Current recipes: ${JSON.stringify(recipes?.map(r => ({ id: r.id, name: r.name, carbs: r.carbs })))}
Current meal plan: ${JSON.stringify(plan)}

You can help by:
1. Suggesting and creating new keto recipes
2. Adding recipes to the cookbook - respond with JSON action when needed
3. Planning meals - respond with JSON action when needed  
4. Managing shopping list - respond with JSON action when needed
5. Giving dietary advice considering diabetes, fatty liver and Mounjaro

When you need to ADD A RECIPE respond with normal helpful text AND include at the end:
ACTION:{"type":"add_recipe","recipe":{"name":"...","carbs":0,"protein":0,"fat":0,"time":"...","ingredients":["..."],"steps":["..."],"tags":["..."]}}

When you need to ADD TO MEAL PLAN respond with normal text AND include at the end:
ACTION:{"type":"add_to_plan","day":"Mon","meal":"D","recipeId":1}

When you need to ADD TO SHOPPING LIST respond with normal text AND include:
ACTION:{"type":"add_to_shop","items":[{"name":"...","cat":"..."}]}

Always be warm friendly and practical. Consider blood sugar management in all advice. Pure Via sweeteners are always in stock. User has Ninja blender and air fryer.`,
      messages: messages
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: response.content[0].text })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
