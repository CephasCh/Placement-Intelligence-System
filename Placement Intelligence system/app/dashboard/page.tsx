import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  {
    title: "Companies",
    description: "Browse company cards, search by name, and filter by category.",
    href: "/companies",
  },
  {
    title: "Skill Match",
    description: "Enter your skill levels and find the best company matches.",
    href: "/skill-match",
  },
  {
    title: "AI Assistant",
    description: "Ask company and preparation questions grounded in platform data.",
    href: "/chat",
  },
  {
    title: "Compare",
    description: "Compare selected companies side-by-side.",
    href: "/compare",
  },
];

export default function DashboardPage() {
  return (
    <main className="app-page-shell min-h-screen px-4 py-10 text-white md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-center">
        <section className="mb-10">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
            Placement Intelligence
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
            Dashboard
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
            Start with company research, then compare options, match your
            skills, and use the assistant for focused placement preparation.
          </p>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          {actions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="h-full border-white/10 bg-zinc-950/80 text-white transition duration-300 hover:-translate-y-1 hover:bg-zinc-900">
                <CardHeader>
                  <CardTitle>{action.title}</CardTitle>
                  <CardDescription className="text-zinc-400">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="soft-primary inline-flex rounded-xl px-4 py-2 text-sm font-semibold">
                    Open
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
