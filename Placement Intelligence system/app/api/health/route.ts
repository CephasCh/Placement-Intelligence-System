import { NextResponse } from "next/server";

function configured(value: string | undefined, placeholder: string) {
  return value && value !== placeholder ? "configured" : "missing";
}

export function GET() {
  const supabaseUrl = configured(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "your_supabase_url"
  );
  const supabaseAnonKey = configured(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "your_supabase_anon_key"
  );
  const ollamaUrl = configured(process.env.OLLAMA_URL, "");
  const ollamaModel = configured(process.env.OLLAMA_MODEL, "");

  return NextResponse.json({
    status:
      supabaseUrl === "configured" &&
      supabaseAnonKey === "configured" &&
      ollamaUrl === "configured" &&
      ollamaModel === "configured"
        ? "ok"
        : "configuration_required",
    supabase:
      supabaseUrl === "configured" && supabaseAnonKey === "configured"
        ? "configured"
        : "missing",
    ollama:
      ollamaUrl === "configured" && ollamaModel === "configured"
        ? "configured"
        : "missing",
  });
}
