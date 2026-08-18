export interface AiChatMessage {
  from: string;
  content: string;
  role?: 'user' | 'model';
  isAi?: boolean;
}

export interface AiChatResponse {
  success: boolean;
  reply?: string;
  error?: string;
}

export interface AiSummaryResponse {
  success: boolean;
  summary?: string;
  error?: string;
}

export interface AiSuggestionsResponse {
  success: boolean;
  suggestions?: string[];
  error?: string;
}

export interface AiRephraseResponse {
  success: boolean;
  rephrased?: string;
  error?: string;
}

export interface AiTranslateResponse {
  success: boolean;
  translatedText?: string;
  error?: string;
}

export async function askAiAssistant(
  prompt: string,
  history: AiChatMessage[] = [],
  systemInstruction?: string
): Promise<string> {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, history, systemInstruction }),
    });

    const data: AiChatResponse = await response.json();
    if (data.success && data.reply) {
      return data.reply;
    }
    return data.error || 'Sorry, I could not generate a response at this moment.';
  } catch (error) {
    console.error('API call to askAiAssistant failed:', error);
    return 'I encountered a network issue contacting Nova AI. Please verify your connection.';
  }
}

export async function summarizeConversation(
  messages: Array<{ from: string; content: string; senderName?: string }>,
  contactName: string
): Promise<string> {
  try {
    const response = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, contactName }),
    });

    const data: AiSummaryResponse = await response.json();
    if (data.success && data.summary) {
      return data.summary;
    }
    return data.error || 'Could not summarize conversation.';
  } catch (error) {
    console.error('API call to summarizeConversation failed:', error);
    return 'Failed to generate chat summary.';
  }
}

export async function getAiReplySuggestions(
  messages: Array<{ from: string; content: string }>,
  contactName: string
): Promise<string[]> {
  try {
    const response = await fetch('/api/ai/suggest-replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, contactName }),
    });

    const data: AiSuggestionsResponse = await response.json();
    if (data.success && data.suggestions && data.suggestions.length > 0) {
      return data.suggestions;
    }
    return ['Sounds good! 👍', 'Got it, thanks!', "I'll follow up shortly."];
  } catch (error) {
    console.error('API call to getAiReplySuggestions failed:', error);
    return ['Sounds good! 👍', 'Got it, thanks!', "I'll follow up shortly."];
  }
}

export async function rephraseDraft(text: string, tone: string = 'professional'): Promise<string> {
  try {
    const response = await fetch('/api/ai/rephrase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, tone }),
    });

    const data: AiRephraseResponse = await response.json();
    if (data.success && data.rephrased) {
      return data.rephrased;
    }
    return text;
  } catch (error) {
    console.error('API call to rephraseDraft failed:', error);
    return text;
  }
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    const response = await fetch('/api/ai/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage }),
    });

    const data: AiTranslateResponse = await response.json();
    if (data.success && data.translatedText) {
      return data.translatedText;
    }
    return text;
  } catch (error) {
    console.error('API call to translateText failed:', error);
    return text;
  }
}
