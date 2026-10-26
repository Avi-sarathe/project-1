/**
 * Dementia Reminiscence Therapy Service — Loved One's Cloned Voice & Familiar Memory Grounding
 * Powered by ElevenLabs Voice Cloning + Emotional Grounding AI Script Generation
 */

export const DEFAULT_LOVED_ONE_VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Daughter Voice (Rachel - Gentle & Caring)" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Granddaughter Voice (Bella - Warm & Affectionate)" },
  { id: "ErXwobaYiN019PkySvjV", name: "Son Voice (Antoni - Calm & Reassuring)" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Husband / Brother Voice (Josh - Deep & Familiar)" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi (Friendly & Grounding)" },
];

const STORAGE_KEYS = {
  lovedOneName: "immersia_loved_one_name",
  relation: "immersia_relation_title",
  addressAs: "immersia_address_as",
  companionPhoto: "immersia_companion_photo",
  elevenLabsApiKey: "immersia_11labs_api_key",
  elevenLabsVoiceId: "immersia_11labs_voice_id",
  aiProvider: "immersia_ai_provider", // "gemma" | "gemini" | "openai"
  aiApiKey: "immersia_ai_api_key",
  gemmaModel: "immersia_gemma_model",
  autoSpeak: "immersia_avatar_auto_speak",
};

/**
 * Retrieves saved Dementia Reminiscence settings from localStorage
 */
export function getGuideSettings() {
  return {
    lovedOneName: localStorage.getItem(STORAGE_KEYS.lovedOneName) || "Sarah",
    relation: localStorage.getItem(STORAGE_KEYS.relation) || "Your Daughter",
    addressAs: localStorage.getItem(STORAGE_KEYS.addressAs) || "Mom",
    companionPhoto: localStorage.getItem(STORAGE_KEYS.companionPhoto) || "",
    elevenLabsApiKey: localStorage.getItem(STORAGE_KEYS.elevenLabsApiKey) || "",
    elevenLabsVoiceId:
      localStorage.getItem(STORAGE_KEYS.elevenLabsVoiceId) ||
      DEFAULT_LOVED_ONE_VOICES[0].id,
    aiProvider: localStorage.getItem(STORAGE_KEYS.aiProvider) || "gemma",
    aiApiKey: localStorage.getItem(STORAGE_KEYS.aiApiKey) || "",
    gemmaModel: localStorage.getItem(STORAGE_KEYS.gemmaModel) || "gemma-4-31b-it",
    autoSpeak: localStorage.getItem(STORAGE_KEYS.autoSpeak) !== "false", // default true
  };
}

/**
 * Saves Dementia Reminiscence settings to localStorage
 */
export function saveGuideSettings(settings) {
  if (settings.lovedOneName !== undefined)
    localStorage.setItem(STORAGE_KEYS.lovedOneName, settings.lovedOneName.trim());
  if (settings.relation !== undefined)
    localStorage.setItem(STORAGE_KEYS.relation, settings.relation.trim());
  if (settings.addressAs !== undefined)
    localStorage.setItem(STORAGE_KEYS.addressAs, settings.addressAs.trim());
  if (settings.companionPhoto !== undefined)
    localStorage.setItem(STORAGE_KEYS.companionPhoto, settings.companionPhoto);
  if (settings.elevenLabsApiKey !== undefined)
    localStorage.setItem(STORAGE_KEYS.elevenLabsApiKey, settings.elevenLabsApiKey.trim());
  if (settings.elevenLabsVoiceId !== undefined)
    localStorage.setItem(STORAGE_KEYS.elevenLabsVoiceId, settings.elevenLabsVoiceId.trim());
  if (settings.aiProvider !== undefined)
    localStorage.setItem(STORAGE_KEYS.aiProvider, settings.aiProvider);
  if (settings.aiApiKey !== undefined)
    localStorage.setItem(STORAGE_KEYS.aiApiKey, settings.aiApiKey.trim());
  if (settings.gemmaModel !== undefined)
    localStorage.setItem(STORAGE_KEYS.gemmaModel, settings.gemmaModel.trim());
  if (settings.autoSpeak !== undefined)
    localStorage.setItem(STORAGE_KEYS.autoSpeak, String(settings.autoSpeak));
}

/**
 * 1. AI Reminiscence Script Generation:
 * Generates an emotionally comforting, deeply familiar message from the loved one,
 * anchoring the person with dementia in their cherished memories and safe surroundings.
 */
export async function generateTourScript({
  stationLabel,
  stationContext,
  isPanorama,
  exits = [],
}) {
  const { aiApiKey, aiProvider, gemmaModel, lovedOneName, relation, addressAs } = getGuideSettings();

  const salutation = addressAs ? `${addressAs}` : "there";
  const name = lovedOneName || "your family";
  const rel = relation || "family member";

  // If no AI key provided or no context, return a warm loving fallback
  if (!aiApiKey) {
    if (stationContext && stationContext.trim()) {
      return `Hi ${salutation}, it's ${name}. We're in ${stationLabel || "this familiar room"}. ${stationContext.trim()}`;
    }
    return `Hi ${salutation}, it's ${name}. You're safe here in the ${stationLabel || "room"}. Take your time and look around.`;
  }

  const prompt = `You are ${name} (${rel}), speaking warmly and lovingly to ${salutation}, who has dementia / memory loss. You are gently walking with them through a familiar place to help them remember, feel safe, and reminisce about cherished memories.

Room / Location: "${stationLabel || "Our Home"}"
Type of view: ${isPanorama ? "360-degree surrounding view" : "Corridor / Room view"}
Cherished memories & context about this area: "${stationContext || "A calm, familiar space in our home filled with love."}"
Available paths to other rooms: ${exits.map((e) => `${e.direction} leading to ${e.to}`).join(", ") || "peaceful resting spot"}

CRITICAL GUIDELINES FOR DEMENTIA COGNITIVE GROUNDING:
- Speak with immense affection, tenderness, patience, and warmth (like a real, loving daughter/son/spouse).
- Start with a gentle, reassuring greeting using their name or relationship (e.g., "Hi ${salutation}, it's ${name}...").
- Reassure them that they are safe and at home.
- Ground them by bringing up the specific memories, objects, habits, or beloved moments mentioned in the context (e.g. favorite chair, photos, pets, family dinners, gardening).
- Keep it to 2-3 gentle, calming sentences.
- Speak at a relaxed, comforting pace.
- Strictly output ONLY the exact spoken words. NO markdown, NO bullet points, NO quotes, NO stage directions like '(smiling)' or '[pause]'.`;

  try {
    if (aiProvider === "gemma" || aiProvider === "gemini") {
      const activeModel = aiProvider === "gemma" ? (gemmaModel || "gemma-4-31b-it") : "gemini-1.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${aiApiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 160, temperature: 0.65 },
        }),
      });
      if (!res.ok) {
        throw new Error(`${aiProvider.toUpperCase()} error: ${res.statusText}`);
      }
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text.trim();
    } else {
      // OpenAI compatible
      const url = "https://api.openai.com/v1/chat/completions";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${aiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a loving family member speaking soothingly to a loved one with dementia. Output ONLY spoken words.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 160,
          temperature: 0.65,
        }),
      });
      if (!res.ok) {
        throw new Error(`OpenAI error: ${res.statusText}`);
      }
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) return text.trim();
    }
  } catch (err) {
    console.warn("[ReminiscenceAI] Script generation fallback:", err);
  }

  // Graceful fallback
  return `Hi ${salutation}, it's ${name}. We're in the ${stationLabel || "room"}. You are safe and loved. ${stationContext || ""}`;
}

/**
 * 2. Gemma 4 Interactive Reminiscence Chatbot:
 * Conversational companion that grounds the patient in the current room,
 * answering their questions and reassuring them with immense affection.
 */
export async function sendChatMessageToGemma({
  messages = [], // [{ role: 'user' | 'assistant', text: string }]
  currentNode,
  lovedOneName: customName,
  relation: customRel,
  addressAs: customAddressAs,
}) {
  const { aiApiKey, aiProvider, gemmaModel, lovedOneName, relation, addressAs } = getGuideSettings();

  const salutation = customAddressAs || addressAs || "Mom";
  const name = customName || lovedOneName || "your family";
  const rel = customRel || relation || "family member";
  const stationLabel = currentNode?.customLabel || currentNode?.id || "Our Home";
  const stationContext = currentNode?.context || "A peaceful, familiar home space filled with cherished memories.";

  const systemInstruction = `You are ${name} (${rel}), having a gentle, loving conversation with ${salutation}, who is living with dementia / Alzheimer's.
You are currently right beside them in "${stationLabel}".
Room memories & context: "${stationContext}".

CRITICAL CONVERSATIONAL GUIDELINES FOR DEMENTIA CARE:
- Speak with immense affection, patience, reassurance, and tenderness (like a real daughter/son/spouse).
- Reassure them that they are safe, loved, and at home.
- Ground them in their familiar surroundings and cherished memories of "${stationLabel}" whenever relevant.
- Keep each reply concise (1 to 3 comforting sentences). Never overwhelm them with long paragraphs.
- Never argue, correct harshly, or say 'don't you remember?'. Gently validate their feelings and steer toward warmth.
- Strictly output only what you say aloud. No stage directions, no markdown formatting, no quotes.`;

  // Fallback if no API key is provided
  if (!aiApiKey) {
    const lastUserMsg = messages[messages.length - 1]?.text?.toLowerCase() || "";
    if (lastUserMsg.includes("where") || lastUserMsg.includes("room")) {
      return `We're right here in the ${stationLabel}, ${salutation}. It's so peaceful here with all our memories. You're completely safe with me.`;
    }
    if (lastUserMsg.includes("who")) {
      return `It's me, ${name}, your loving ${rel}. I'm right here beside you, and I love you so much.`;
    }
    return `I'm right here with you, ${salutation}. Take all the time you need in the ${stationLabel}. Everything is taken care of.`;
  }

  const modelToUse = gemmaModel || "gemma-4-31b-it";

  // If using Gemma or Gemini (Google Generative Language API)
  if (aiProvider === "gemma" || aiProvider === "gemini") {
    const activeModel = aiProvider === "gemma" ? modelToUse : "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${aiApiKey}`;

    // Convert multi-turn history to Google AI format:
    const contents = [
      {
        role: "user",
        parts: [{ text: `[System Context: ${systemInstruction}]\n\nHello!` }],
      },
      {
        role: "model",
        parts: [{ text: `Hi ${salutation}, it's ${name}. I'm right here with you in the ${stationLabel}.` }],
      },
    ];

    for (const msg of messages) {
      contents.push({
        role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
        parts: [{ text: msg.text }],
      });
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 220,
          },
        }),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        throw new Error(`Gemma API error (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) return reply.trim();
    } catch (err) {
      console.error("[GemmaChat] Error:", err);
      throw err;
    }
  } else {
    // OpenAI-compatible format
    const url = "https://api.openai.com/v1/chat/completions";
    const apiMessages = [
      { role: "system", content: systemInstruction },
      ...messages.map((m) => ({
        role: m.role === "assistant" || m.role === "model" ? "assistant" : "user",
        content: m.text,
      })),
    ];

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${aiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 220,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        throw new Error(`OpenAI API error (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content;
      if (reply) return reply.trim();
    } catch (err) {
      console.error("[Chat] Error:", err);
      throw err;
    }
  }

  return `I'm right here with you in the ${stationLabel}, ${salutation}. You are safe and loved.`;
}

/**
 * 2. ElevenLabs Text-to-Speech (Cloned Loved One's Voice):
 * Synthesizes the loved one's cloned voice with gentle, soothing stability.
 */
export async function speakScript(text, onEnd) {
  const { elevenLabsApiKey, elevenLabsVoiceId } = getGuideSettings();

  // If ElevenLabs API Key is present, call ElevenLabs API with high stability for a gentle, warm tone
  if (elevenLabsApiKey) {
    const voiceId = elevenLabsVoiceId || DEFAULT_LOVED_ONE_VOICES[0].id;
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": elevenLabsApiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.65, // More stable, soothing delivery
          similarity_boost: 0.85, // Stronger adherence to the loved one's voice clone
          style: 0.15,
          use_speaker_boost: true,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`ElevenLabs error (${res.status}): ${errText}`);
    }

    const audioBlob = await res.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        onEnd?.();
        resolve();
      };
      audio.onerror = (e) => {
        URL.revokeObjectURL(audioUrl);
        reject(e);
      };
      audio.play().catch(reject);
    });
  }

  // Fallback to Browser Speech Synthesis (gentle pitch and rate)
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88; // Slightly slower, more soothing rate for dementia care
    utterance.pitch = 1.05; // Slightly warmer pitch
    utterance.onend = () => {
      onEnd?.();
      resolve();
    };
    utterance.onerror = () => {
      onEnd?.();
      resolve();
    };
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Stops any ongoing audio playback
 */
export function stopGuideSpeech() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
