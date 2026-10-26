import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Heart,
  MessageCircle,
  RotateCcw,
  Square,
  Bot,
} from "lucide-react";
import {
  sendChatMessageToGemma,
  speakScript,
  stopGuideSpeech,
} from "../services/aiGuideService";

export const GEMMA_SUGGESTED_PROMPTS = [
  { label: "Where are we?", icon: "📍" },
  { label: "Tell me about this room", icon: "💭" },
  { label: "What memories do we have here?", icon: "✨" },
  { label: "I feel a little lost", icon: "🤍" },
];

export default function CompanionChatModal({
  isOpen,
  onClose,
  currentNode,
  settings,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [readAloud, setReadAloud] = useState(true);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);
  const speechRecognitionRef = useRef(null);

  const lovedOneName = settings.lovedOneName || "Sarah";
  const relationTitle = settings.relation || "Your Daughter";
  const addressAs = settings.addressAs || "Mom";
  const currentRoomName = currentNode?.customLabel || currentNode?.id || "Home";

  // Initialize or update welcome message when current room changes
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          text: `Hi ${addressAs}, it's ${lovedOneName}. We're sitting together in the ${currentRoomName}. You can ask me anything, or just chat with me.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, [currentNode?.id, addressAs, lovedOneName, currentRoomName]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isThinking, isOpen]);

  // Setup Web Speech Recognition for voice typing
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleSendMessage(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (e) => {
        console.warn("[VoiceInput] Speech recognition error:", e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
    }

    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.abort();
      }
    };
  }, [currentNode, messages, settings]);

  const toggleVoiceListening = () => {
    if (!speechRecognitionRef.current) {
      alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        speechRecognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Could not start recognition:", err);
      }
    }
  };

  /**
   * Send user message to Gemma 4
   */
  const handleSendMessage = async (textToSend) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || isThinking) return;

    // Stop ongoing speech
    stopGuideSpeech();
    setIsSpeaking(false);

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = {
      role: "user",
      text: messageContent,
      timestamp: timeStr,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsThinking(true);

    try {
      const reply = await sendChatMessageToGemma({
        messages: updatedMessages,
        currentNode,
        lovedOneName,
        relation: relationTitle,
        addressAs,
      });

      const assistantMsg = {
        role: "assistant",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Read aloud using ElevenLabs or SpeechSynthesis if toggled on
      if (readAloud) {
        setIsSpeaking(true);
        await speakScript(reply, () => {
          setIsSpeaking(false);
        });
      }
    } catch (err) {
      console.error("[GemmaChat] Error getting response:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `I'm right here with you, ${addressAs}. Let's take a calm breath and look around the ${currentRoomName}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleStopSpeaking = () => {
    stopGuideSpeech();
    setIsSpeaking(false);
  };

  const handleClearHistory = () => {
    stopGuideSpeech();
    setIsSpeaking(false);
    setMessages([
      {
        role: "assistant",
        text: `Hi ${addressAs}, it's ${lovedOneName}. We're in the ${currentRoomName}. What would you like to talk about?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-24 left-6 z-40 w-[380px] max-w-[92vw] h-[520px] max-h-[75vh] bg-[#121622]/95 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 select-none">
      {/* ─── Header ─── */}
      <div className="px-4 py-3.5 bg-gradient-to-r from-rose-950/60 via-[#181c2a] to-[#121622] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-rose-400/80 shadow-md bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shrink-0">
            {settings.companionPhoto ? (
              <img
                src={settings.companionPhoto}
                alt={lovedOneName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-sm">
                {lovedOneName.charAt(0)}
              </span>
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#121622]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white tracking-wide leading-tight">
                {lovedOneName}
              </h3>
              <span className="text-[10px] px-1.5 py-0.2 bg-rose-500/20 text-rose-300 rounded border border-rose-500/30 font-medium">
                {relationTitle}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-300">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              <span>Gemma 4 Companion</span>
              <span className="text-gray-500">•</span>
              <span className="text-amber-200/90 truncate max-w-[110px]" title={currentRoomName}>
                {currentRoomName}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {/* Read Aloud Toggle */}
          <button
            type="button"
            onClick={() => {
              if (isSpeaking) handleStopSpeaking();
              setReadAloud(!readAloud);
            }}
            className={`p-1.5 rounded-xl border text-xs transition-colors cursor-pointer ${
              readAloud
                ? "bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30"
                : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
            }`}
            title={readAloud ? "Voice read-aloud is ON" : "Voice read-aloud is OFF"}
          >
            {isSpeaking ? (
              <Square className="w-3.5 h-3.5 text-rose-400 fill-current animate-pulse" />
            ) : readAloud ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Reset Conversation */}
          <button
            type="button"
            onClick={handleClearHistory}
            className="p-1.5 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Start fresh conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Close Modal */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-1"
            title="Close Chat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─── Quick Prompt Chips ─── */}
      <div className="px-3.5 py-2 bg-[#0c0e15]/80 border-b border-white/8 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {GEMMA_SUGGESTED_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(p.label)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/6 hover:bg-rose-500/20 border border-white/10 hover:border-rose-400/40 text-[11px] text-gray-200 hover:text-rose-200 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* ─── Messages Scroll Area ─── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map((m, idx) => {
          const isUser = m.role === "user";
          return (
            <div
              key={idx}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed shadow-md ${
                  isUser
                    ? "bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-br-xs"
                    : "bg-[#181c2b] text-gray-100 border border-white/12 rounded-bl-xs shadow-black/40"
                }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1 text-[10px] text-rose-300 font-bold mb-1">
                    <Heart className="w-2.5 h-2.5 fill-current text-rose-400" />
                    <span>{lovedOneName}</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
              <span className="text-[10px] text-gray-500 mt-1 px-1">
                {m.timestamp}
              </span>
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center gap-2 px-3 py-2 bg-[#181c2b]/80 border border-amber-400/20 rounded-2xl w-fit">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span className="text-[11px] text-amber-200/90 italic">
              {lovedOneName} is thinking lovingly...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ─── Input Bar & Voice Controls ─── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-[#0c0e15] border-t border-white/10 flex items-center gap-2"
      >
        {/* Voice Dictation (Microphone) */}
        <button
          type="button"
          onClick={toggleVoiceListening}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            isListening
              ? "bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse"
              : "bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10"
          }`}
          title={isListening ? "Listening... click to stop" : "Speak your message"}
        >
          {isListening ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4 text-rose-300" />
          )}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Listening to your voice..." : `Ask ${lovedOneName} anything...`}
          className="flex-1 bg-[#161a26] border border-white/12 focus:border-rose-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!input.trim() || isThinking}
          className="p-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:opacity-40 text-white shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
