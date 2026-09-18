"use client";

import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleSubscribe(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
      setMessage("Subscribed successfully! Check your email.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Subscription failed. Please try again.");
    }
  }

  return (
    <div>
      <form onSubmit={handleSubscribe} className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-teal-500"
          required
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="absolute right-1.5 top-1.5 rounded-lg bg-teal-600 p-2 text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
          aria-label="Subscribe"
        >
          <Send size={16} />
        </button>
      </form>
      {message ? (
        <p
          className={`mt-2 text-xs ${status === "success" ? "text-teal-700" : "text-red-600"}`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
