const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateQueryFromNLP(description) {
  const schemaDescription = `
You are a helpful assistant that converts natural language into MongoDB JSON queries.
Only use the following schema fields:

- total_spent: Number
- total_orders: Number
- last_order_date: Date
- signup_date: Date
- is_active: Boolean

IMPORTANT: For any date value, ALWAYS use an ISO 8601 string (e.g., "2025-01-01T00:00:00.000Z") and NEVER use new Date().
Return ONLY the MongoDB query object — no explanations, no comments, and no text before or after the JSON.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: schemaDescription,
        },
        {
          role: "user",
          content: `Convert this to MongoDB query: "${description}"`,
        },
      ],
    });

    const queryText = response.choices[0].message.content.trim();
    console.log("Response from OpenAI:", queryText);

    const safeJson = queryText.replace(
      /new Date\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      '"$1"'
    );

    // Extract valid JSON only
    const match = safeJson.match(/{[\s\S]*}/);
    if (match) {
      return JSON.parse(match[0]);
    } else {
      throw new Error("No valid JSON object found in OpenAI response.");
    }
  } catch (err) {
    console.error("OpenAI or JSON parse error:", err.message);
    throw err;
  }
}

async function generateTitleFromNLP(description) {
  const instruction = `
You are an assistant that creates a short, catchy title summarizing an audience segment description.
Return ONLY the title as a short phrase (3-5 words) with no extra text.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: instruction },
        {
          role: "user",
          content: `Generate a short title for this audience segment: "${description}"`,
        },
      ],
    });

    const title = response.choices[0].message.content.trim();
    console.log("Response from OpenAI (title):", title);
    return title;
  } catch (err) {
    console.error("OpenAI error in generateTitleFromNLP:", err.message);
    throw err;
  }
}

async function generateMessageFromNLP(campaignId, segment) {
  try {
    const prompt = `
Create a 20–30 word friendly sales message with emojis.
Use "{{name}}" as a placeholder.
Mention discounts based on: ${segment}.
Make it engaging and end with a CTA.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    const message = response.choices[0].message.content.trim();
    console.log("Response from OpenAI (message):", message);
    return message;
  } catch (err) {
    console.error("OpenAI error in generateMessageFromNLP:", err.message);
    throw err;
  }
}

module.exports = {
  generateQueryFromNLP,
  generateTitleFromNLP,
  generateMessageFromNLP,
};
