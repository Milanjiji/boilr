import OpenAI from "openai";

// Create client with OpenRouter base URL
const client = new OpenAI({
  apiKey: "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",
  baseURL: "https://openrouter.ai/api/v1"
});

/**
 * Ask AI for boilerplate setup instructions.
 * @param {string} pkgName - package name
 * @param {string} readmeContent - README text of package
 */
export async function askAI(pkgName, readmeContent) {
  try {
    const systemPrompt = `
You are an AI that generates executable boilerplate setup steps for React projects.  
Your response MUST be valid JSON in an array of steps.  

Each step should follow this format:
{
  "action": "create_file | create_folder | rewrite_file | append_file | delete",
  "path": "relative/path/to/file/or/folder",
  "content": "string content (if applicable)",
  "desc": "short explanation of what this step does",
  "changes": "clear description of what changes are being applied in this path (e.g., 'Added import for Firebase', 'Replaced App component JSX')"
}
Return ONLY JSON, no extra text.
`;

    const userPrompt = `
The user wants to integrate **${pkgName}** into a React app.  
Here is the README of the package:\n\n
${readmeContent}\n\n
Please output the JSON instructions needed to set up boilerplate code for this package.
`;

    const response = await client.chat.completions.create({
      model: "deepseek/deepseek-r1:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2 // keep it deterministic
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error("❌ AI Error:", err.message);
    return null;
  }
}