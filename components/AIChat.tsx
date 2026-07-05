"use client";

import { useState } from "react";
import { Send } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const quickPrompts = [
  "I own a dental clinic.",
  "I own a restaurant.",
  "I own a beauty salon.",
  "I run a real estate business.",
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi, I’m JOHAI. Tell me what type of business you own, and I’ll show you what AI can automate.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(customMessage?: string) {
    const text = customMessage || input;

    if (!text.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: text,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "Sorry, I could not respond.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[560px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0B1220] shadow-2xl">
      <div className="border-b border-white/10 bg-blue-600 p-5">
        <h3 className="text-xl font-bold text-white">JOHAI AI Assistant</h3>
        <p className="text-sm text-blue-100">
          Get a quick automation audit for your business.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-[85%] whitespace-pre-line rounded-2xl p-4 ${
              message.role === "user"
                ? "ml-auto bg-blue-600 text-white"
                : "bg-white/10 text-gray-100"
            }`}
          >
            {message.content}
          </div>
        ))}

        {messages.length === 1 && (
          <div className="grid gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-gray-200 transition hover:bg-white/10"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="max-w-[85%] rounded-2xl bg-white/10 p-4 text-gray-300">
            JOHAI is thinking...
          </div>
        )}
      </div>

      <div className="flex gap-3 border-t border-white/10 p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Type your message..."
          className="flex-1 rounded-xl bg-white/10 px-4 py-3 text-white outline-none placeholder:text-gray-500"
        />

        <button
          onClick={() => sendMessage()}
          className="rounded-xl bg-blue-600 px-4 transition hover:bg-blue-500"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}