"use client";

import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to mental health assistant by Ramisa Fatima, How can I assist you today?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newUserMessage = { role: "user" as const, content: input };
    const newMessages = [...messages, newUserMessage];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://mentalhealthassistant-production.up.railway.app", {
        method: "POST",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({
          history: newMessages,
          message: input,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: data.reply },
        ]);
      }
    } catch (error) {
      console.error("Error fetching reply:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-center bg-[url('/bg.png')] bg-cover p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white mb-6 text-center bg-black px-4 py-2 rounded-xl shadow">
        Mental Health Assistant
      </h1>

      <div className="w-full max-w-2xl bg-zinc-200 opacity-80 bg-cover rounded-lg p-4 h-[400px] mb-4 space-y-4 shadow-2xl shadow-black overflow-y-auto break-words">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <span
              className={`inline-block px-4 py-2 rounded-2xl max-w-[80%] whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
      </div>

      <div className="w-full max-w-2xl flex gap-4 ">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          className="flex-grow px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-black"
          placeholder="Type your message here..."
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-black text-white px-4 py-2 hover:bg-zinc-500 hover:text-black rounded-lg transition "
        >
          Send
        </button>
      </div>

      <div className="justify-center">
        <p className="text-black">Built by Ramisa Fatima ❤</p>
      </div>
    </div>
  );
}
