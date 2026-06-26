"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ChatMessage, StudentSkill } from "@/types/company";

const storageKey = "placement_student_skills";

const suggestedPrompts = [
  "Which company is best for my saved skills?",
  "What preparation gaps should I focus on?",
  "Compare top companies for freshers.",
  "Give me a simple study plan.",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Ask me about companies, skill gaps, comparison points, or placement preparation using platform data.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as StudentSkill[];
      if (Array.isArray(parsed)) {
        setStudentSkills(parsed);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, loading]);

  const hasSkillProfile = studentSkills.length > 0;
  const averageLevel = useMemo(() => {
    if (!studentSkills.length) return 0;
    const total = studentSkills.reduce((sum, skill) => sum + skill.level, 0);
    return Math.round((total / studentSkills.length) * 10) / 10;
  }, [studentSkills]);

  async function sendMessage(overrideMessage?: string) {
    const finalMessage = (overrideMessage || input).trim();
    if (!finalMessage || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: finalMessage,
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: finalMessage,
          history: messages,
          studentSkills,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate response");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I could not generate a response right now. Please check Ollama and Supabase configuration.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <main className="app-page-shell relative min-h-screen overflow-hidden px-4 py-12 text-white md:px-8">
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-zinc-400 transition hover:text-white"
          >
            Back to Dashboard
          </Link>

          <Link
            href="/skill-match"
            className="rounded-xl border border-cyan-200/20 bg-cyan-300/5 px-4 py-2 text-sm font-medium text-cyan-50 shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:bg-cyan-300/10"
          >
            Update Skills
          </Link>
        </div>

        <section className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
            AI Career Assistant
          </p>

          <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
                Placement Chatbot
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
                Ask questions about companies, preparation gaps, required
                skills, student-fit score, work culture, technology exposure,
                and company recommendations.
              </p>
            </div>

            <Card className="w-fit border-white/10 bg-zinc-950/80 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Skill Profile
                </p>
                <p className="mt-1 text-sm font-medium text-zinc-200">
                  {hasSkillProfile
                    ? `Using latest Skill Match / Avg ${averageLevel}/7`
                    : "Not found"}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="grid flex-1 gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <Card className="sticky top-8 border-white/10 bg-zinc-950/80 text-white shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
              <CardHeader>
                <CardTitle>Ask about</CardTitle>
                <CardDescription className="text-zinc-400">
                  Use platform data to guide your preparation.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-left text-sm text-zinc-300 transition hover:-translate-y-1 hover:border-cyan-200/35 hover:bg-cyan-300/10 hover:text-cyan-50"
                  >
                    {prompt}
                  </button>
                ))}

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Context
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {hasSkillProfile
                      ? "The assistant will use your saved skill levels while suggesting companies."
                      : "Complete Skill Match first for personalized suggestions."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>

          <section className="neon-card flex min-h-[620px] flex-col rounded-3xl border border-white/10 bg-zinc-950/80">
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-xs font-bold text-zinc-200">
                  AI
                </div>

                <div>
                  <h2 className="font-semibold">Placement Intelligence AI</h2>
                  <p className="text-xs text-zinc-500">
                    Supabase-grounded company assistant
                  </p>
                </div>
              </div>
            </div>

            <div
              ref={messagesRef}
              className="flex-1 space-y-5 overflow-y-auto px-5 py-6"
            >
              {!hasSkillProfile ? (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-400">
                  Skill profile not found. Complete Skill Match for better
                  suggestions.
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-400">
                  Using your latest Skill Match profile for personalized
                  recommendations.
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" && "justify-end"
                  )}
                >
                  {message.role === "assistant" ? (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/40 text-[10px] font-bold text-zinc-300">
                      AI
                    </div>
                  ) : null}

                  <div
                    className={cn(
                      "max-w-[85%] rounded-3xl px-5 py-4 text-sm leading-7 shadow-[0_14px_45px_rgba(0,0,0,0.35)]",
                      message.role === "user"
                        ? "soft-primary"
                        : "border border-white/10 bg-black/35 text-zinc-200"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {message.role === "user" ? (
                    <div className="soft-primary mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                      YOU
                    </div>
                  ) : null}
                </div>
              ))}

              {loading ? (
                <div className="flex gap-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/40 text-[10px] font-bold text-zinc-300">
                    AI
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-black/35 px-5 py-4 text-sm text-zinc-400">
                    Thinking with company data...
                  </div>
                </div>
              ) : null}

              <div />
            </div>

            <div className="border-t border-white/10 p-4">
              <div
                className={cn(
                  "rounded-3xl border border-[#444444] bg-[#1F2023] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-300",
                  loading && "border-white/30"
                )}
              >
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  placeholder="Ask about companies, skills, fit score, or preparation gaps..."
                  rows={1}
                  className="max-h-40 min-h-[48px] w-full resize-none rounded-md border-none bg-transparent px-3 py-3 text-base text-gray-100 placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />

                <div className="flex items-center justify-between gap-3 px-1 pt-2">
                  <p className="text-xs text-zinc-500">
                    Text chat only / Supabase-grounded answers
                  </p>

                  <button
                    onClick={() => sendMessage()}
                    disabled={loading || !input.trim()}
                    className="soft-primary rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
