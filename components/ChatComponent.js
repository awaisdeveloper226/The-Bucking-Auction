"use client";

import { useEffect, useState, useRef } from "react";

export default function ChatBox({ auctionId, chatEnabled }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Check login
    const storedUser = localStorage.getItem("userId");
    if (storedUser) {
      setUserId(storedUser);
    }

    // TODO: Replace with socket connection
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat?auctionId=${auctionId}`);
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Error loading messages", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [auctionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = {
      userId,
      auctionId,
      text: input,
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  if (!chatEnabled) {
    return (
      <div className="max-w-4xl mx-auto bg-gray-100 text-gray-600 p-4 rounded-lg mt-6 text-center">
        Chat is disabled by admin.
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="max-w-4xl mx-auto bg-gray-100 p-6 rounded-lg mt-6 text-center">
        <p className="text-gray-700 mb-3">Please login to participate in chat.</p>
        <a
          href="/login"
          className="bg-[#6ED0CE] hover:bg-[#4DB1B1] text-[#335566] px-4 py-2 rounded-lg font-semibold"
        >
          Login
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white border rounded-lg shadow mt-6 flex flex-col h-[500px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <p className="text-gray-500 text-center">Loading chat...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-400 text-center">No messages yet. Start chatting!</p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.userId === userId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-xl max-w-[70%] ${
                  msg.userId === userId
                    ? "bg-[#6ED0CE] text-[#335566]"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                <p>{msg.text}</p>
                <span className="text-xs text-gray-500 block mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#6ED0CE]"
        />
        <button
          onClick={handleSend}
          className="bg-[#335566] hover:bg-[#4a6f7d] text-white px-4 py-2 rounded-r-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
