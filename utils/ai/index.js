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
[
  {
    "type": "create_file" | "modify_file",
    "path": "string (relative path where changes happen)",
    "desc": "string (explanation of what this does)",
    "content": "string (only required for create_file)",
    "steps": [   // only for modify_file
      {
        "action": "find_and_replace" | "insert_after" | "insert_before" | "append_content",
        "find": "string (if applicable)",
        "replace": "string (if applicable)",
        "target": "string (if applicable)",
        "content": "string (if applicable)",
        "desc": "string (explanation of this step)",
        "alternative": {
          // fallback if find/target is not found
          "action": "another action (like insert_after/append_content)",
          "target": "string",
          "content": "string",
          "desc": "explanation of fallback"
        }
      }
    ],
    "alternative": {
      // fallback if file already exists
      "type": "modify_file",
      "steps": [
        {
          "action": "insert_after",
          "target": "string",
          "content": "string",
          "desc": "explanation",
          "alternative": {
            // nested fallback if this also fails
          }
        }
      ]
    }
  }
]

Requirements:
- Always include "path" to show where changes happen.
- Always include "desc" at both file and step level.
- Always include an "alternative" at file level if the file already exists.
- Always include an "alternative" at step level if the target/find text does not exist.
- The response must be strictly valid JSON (no explanations outside JSON).
Return ONLY JSON, no extra text.
`;

    const userPrompt = `
The user wants to integrate **${pkgName}** into a React app.  
Here is the README of the package:\n\n${readmeContent}\n\n
Please output the JSON instructions needed to set up boilerplate code for this package.
`;

    const response = await client.chat.completions.create({
      model: "deepseek/deepseek-r1:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error("❌ AI Error:", err.message);
    return null;
  }
}
