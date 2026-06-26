import type { ChatMessage, StudentSkill } from "@/types/company";

type AskOllamaParams = {
  userMessage: string;
  history: ChatMessage[];
  studentSkills: StudentSkill[];
  context: string;
};

export async function askOllama({
  userMessage,
  history,
  studentSkills,
  context,
}: AskOllamaParams) {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const ollamaModel = process.env.OLLAMA_MODEL || "llama3.1";

  const systemPrompt = `
You are the AI Career Assistant for the Placement Intelligence System.

Rules:
- Help students understand companies before applying.
- Use only the Supabase platform data provided in CONTEXT.
- Use the student's skill profile when available.
- Do not invent company facts.
- Do not use outside knowledge.
- Do not pretend to be the student.
- Do not write from the student's point of view.
- Do not invent student interests such as Python, AWS, Azure, backend, or cloud unless the current user message or skill profile explicitly says so.
- If information is missing, say: "This information is not available in the platform data yet."
- Give practical student-friendly guidance.
- Keep answers short and complete: 3 to 6 concise bullets or short paragraphs.
- Use plain text only. Do not use markdown symbols such as *, **, headings, or long study-plan essays.
- Start directly with the useful answer. Avoid long preambles.
- Do not reply with only an acknowledgement like "Okay"; answer the student's question directly.
- For recommendations, explain why each company is suggested.
- For skill gaps, compare student skill levels with company required levels.
- If the student asks where they can improve, list only skill gaps found in CONTEXT and the student profile.
- For company comparisons, use only the provided context.
- If asked for a study plan, give at most 5 steps based on supplied required skills and current skill levels.
- End with a complete final sentence.
- Never mention internal database table names unless the user asks technically.
`;

  const recentHistory = history
    .slice(-6)
    .filter(
      (item) =>
        (item.role === "user" || item.role === "assistant") &&
        item.content.trim().length > 0
    )
    .map((item) => ({
      role: item.role,
      content: item.content.slice(0, 1200),
    }));

  const studentSkillText =
    studentSkills.length > 0
      ? studentSkills
          .map((skill) => `- ${skill.skill_set_name}: ${skill.level}/7`)
          .join("\n")
      : "No student skill profile provided.";

  const response = await fetch(`${ollamaUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: ollamaModel,
      messages: [
        {
          role: "system",
          content: `${systemPrompt}

STUDENT SKILL PROFILE:
${studentSkillText}

CONTEXT FROM SUPABASE:
${context}`,
        },
        ...recentHistory,
        {
          role: "user",
          content: userMessage,
        },
      ],
      options: {
        temperature: 0.2,
        top_p: 0.8,
        num_predict: 500,
        repeat_penalty: 1.08,
      },
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error("Ollama request failed");
  }

  const data = await response.json();

  const answer = (
    data.message?.content ||
    data.response ||
    "This information is not available in the platform data yet."
  ).trim();

  const cleanAnswer = finishCleanly(answer);
  return isImproveQuestion(userMessage)
    ? compactImproveAnswer(cleanAnswer)
    : cleanAnswer;
}

function isImproveQuestion(message: string) {
  return /\b(improve|improvement|weak|weakness|gap|gaps|focus)\b/i.test(
    message
  );
}

function compactImproveAnswer(answer: string) {
  const bulletLines = answer
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .slice(0, 4);

  if (bulletLines.length === 0) {
    return answer;
  }

  const compactLines = bulletLines.map((line) => {
    const body = line.replace(/^- /, "");
    const [rawSkill, ...details] = body.split(":");
    const skill = rawSkill.trim();
    const levels = Array.from(body.matchAll(/(\d+)\/7/g)).map((match) =>
      Number(match[1])
    );

    if (levels.length >= 2) {
      const currentLevel = levels[0];
      const targetLevel = levels[levels.length - 1];
      return `- ${skill}: currently ${currentLevel}/7; target ${targetLevel}/7.`;
    }

    const firstSentence =
      details.join(":").trim().match(/[^.!?]+[.!?]/)?.[0]?.trim() ||
      details.join(":").trim();

    return `- ${skill}: ${firstSentence.slice(0, 130)}`;
  });

  return [
    "Focus on these improvement areas:",
    ...compactLines,
    "Prioritize the biggest gaps first, then retest your skill match.",
  ].join("\n");
}

function finishCleanly(answer: string) {
  const cleaned = answer
    .replace(/\*\*/g, "")
    .replace(/^\s*[*•]\s+/gm, "- ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!cleaned) {
    return "This information is not available in the platform data yet.";
  }

  if (/[.!?]$/.test(cleaned)) {
    return cleaned;
  }

  const lastSentence = cleaned.match(/[\s\S]*[.!?]/)?.[0]?.trim();
  if (lastSentence && lastSentence.length > 40) {
    return lastSentence;
  }

  return `${cleaned}.`;
}
