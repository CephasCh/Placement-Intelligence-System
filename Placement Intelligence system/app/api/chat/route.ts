import { NextResponse } from "next/server";
import { buildChatContext } from "@/lib/chat-context";
import { askOllama } from "@/lib/ollama";
import type { ChatMessage, StudentSkill } from "@/types/company";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const message = String(body.message || "").trim();
    const history: ChatMessage[] = Array.isArray(body.history)
      ? body.history
      : [];
    const studentSkills: StudentSkill[] = Array.isArray(body.studentSkills)
      ? body.studentSkills
      : [];

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const context = await buildChatContext({
      userMessage: message,
      studentSkills,
    });

    const answer = await askOllama({
      userMessage: message,
      history,
      studentSkills,
      context,
    });

    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json(
      {
        error:
          "I could not generate a response right now. Please check Ollama and Supabase configuration.",
      },
      { status: 500 }
    );
  }
}
