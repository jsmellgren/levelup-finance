import { useState } from "react";
import { useAuth } from "../../store/AuthContext";
import { askCoach } from "../../api/coach";
import { Input } from "../../components/ui/Input";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How can I pay off my debt faster?",
  "Should I focus on savings or debt?",
  "How long will it take me to save $10,000?",
  "Give me a side hustle idea",
];

export function CoachPage() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey! I'm here to help you make smarter financial decisions. Ask me anything about your goals.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function send(question: string) {
    if (!token || !question.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setIsSending(true);
    try {
      const { answer } = await askCoach(token, question);
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong — try again." }]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex h-screen flex-col px-6 py-8">
      <h1 className="mb-1 flex items-center gap-2 text-xl font-bold">
        <span>✨</span> AI Financial Assistant
      </h1>
      <p className="mb-4 text-xs text-white/40">Rule-based for now — full AI coaching is coming soon.</p>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3 pb-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-xl2 px-4 py-3 text-sm ${
                m.role === "user" ? "self-end bg-brand-teal text-bg" : "self-start bg-bg-card"
              }`}
            >
              {m.content}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            className="rounded-full bg-bg-elevated px-3 py-1.5 text-xs text-white/60"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={isSending}
          className="rounded-xl2 bg-brand-teal px-4 text-bg font-semibold disabled:opacity-50"
        >
          →
        </button>
      </form>
    </div>
  );
}
