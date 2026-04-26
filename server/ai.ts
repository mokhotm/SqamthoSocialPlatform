

const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const PRIMARY_MODEL = "gemma4";
const FALLBACK_MODEL = "phi3";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OllamaResponse {
  message?: {
    content: string;
  };
  error?: string;
}

/**
 * Calls Ollama REST API directly
 */
async function callOllama(messages: ChatMessage[], model: string = PRIMARY_MODEL): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout

  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json() as OllamaResponse;
    if (data.error) {
      throw new Error(data.error);
    }

    return data.message?.content || "";
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Fallback logic
    if (model === PRIMARY_MODEL) {
      console.warn(`[AI] Primary model ${PRIMARY_MODEL} failed, falling back to ${FALLBACK_MODEL}...`);
      return callOllama(messages, FALLBACK_MODEL);
    }
    
    throw error;
  }
}

/**
 * Generates a personalized South African social media bio
 */
export async function generateBio(keywords: string, displayName?: string): Promise<string> {
  const prompt = `Write a short, engaging, and culturally relevant South African social media bio for a user named ${displayName || "someone"}. Include the following keywords: ${keywords}. Keep it under 150 characters. Don't use quotes around the output. Keep it sounding natural.`;
  
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: "You are a social media expert who helps people write engaging bios, especially tuned for a modern South African audience."
    },
    {
      role: "user",
      content: prompt
    }
  ];

  try {
    const bio = await callOllama(messages);
    return bio.trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error("[AI] Error generating bio:", error);
    throw new Error("Failed to generate bio from AI");
  }
}

/**
 * Helps users write posts with AI assistance
 */
export async function generatePostDraft(prompt: string, feeling?: string, location?: string): Promise<string> {
  let context = "";
  if (feeling) context += ` The user is feeling ${feeling}.`;
  if (location) context += ` They are currently at ${location}.`;

  const userPrompt = `Help me write a social media post about: "${prompt}".${context} Make it engaging, conversational, and tailored for a modern social network. Don't include hashtags unless relevant. Do not wrap the response in quotes.`;

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: "You are an AI writing assistant helping a user craft a great social media post. Keep it casual, relatable, and well-structured."
    },
    {
      role: "user",
      content: userPrompt
    }
  ];

  try {
    const draft = await callOllama(messages);
    return draft.trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error("[AI] Error generating post draft:", error);
    throw new Error("Failed to generate post draft from AI");
  }
}

/**
 * Suggests a comment reply for a post
 */
export async function generateComment(postContent: string, tone?: string): Promise<string> {
  let toneContext = tone ? `Use a ${tone} tone.` : "Keep it friendly and conversational.";

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You are a helpful AI that suggests a short, engaging comment to reply to a social media post. ${toneContext} Do not use quotes around the response. Keep it brief (1-2 sentences).`
    },
    {
      role: "user",
      content: `Please suggest a comment for this post: "${postContent}"`
    }
  ];

  try {
    const comment = await callOllama(messages);
    return comment.trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error("[AI] Error generating comment:", error);
    throw new Error("Failed to generate comment from AI");
  }
}

/**
 * Generates a reply for a general chat conversation (e.g. Telegram bot)
 */
export async function generateChatReply(prompt: string): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: "You are OpenClaw, a friendly and helpful AI assistant for the Sqamtho Social Platform. You provide concise, engaging, and culturally aware responses."
    },
    {
      role: "user",
      content: prompt
    }
  ];

  try {
    const reply = await callOllama(messages);
    return reply.trim();
  } catch (error) {
    console.error("[AI] Error generating chat reply:", error);
    throw new Error("Failed to generate chat reply from AI");
  }
}
