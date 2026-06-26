"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MatchResult, StudentSkill } from "@/types/company";

const storageKey = "placement_student_skills";

const defaultSkills: StudentSkill[] = [
  { skill_set_name: "Coding", level: 4 },
  { skill_set_name: "SQL and Design", level: 4 },
  { skill_set_name: "Communication Skills", level: 4 },
  { skill_set_name: "Data Structures and Algorithms", level: 4 },
  { skill_set_name: "AI Native Engineering", level: 3 },
  { skill_set_name: "Software Engineering", level: 4 },
];

function getMatchLabel(score: number) {
  if (score >= 85) return "Excellent Match";
  if (score >= 70) return "Strong Match";
  if (score >= 55) return "Good Match";
  return "Needs Preparation";
}

export default function SkillMatchPage() {
  const [skills, setSkills] = useState<StudentSkill[]>(defaultSkills);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as StudentSkill[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setSkills(parsed);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(skills));
  }, [skills]);

  const averageLevel = useMemo(() => {
    const total = skills.reduce((sum, skill) => sum + skill.level, 0);
    return Math.round((total / skills.length) * 10) / 10;
  }, [skills]);

  function updateSkillLevel(skillName: string, level: number) {
    setSkills((prev) =>
      prev.map((skill) =>
        skill.skill_set_name === skillName ? { ...skill, level } : skill
      )
    );
  }

  async function handleMatch() {
    setLoading(true);
    setHasSearched(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/skill-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ skills }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to calculate skill match");
      }

      setResults(data.results || []);
    } catch {
      setResults([]);
      setErrorMessage(
        "I could not calculate matches right now. Please check Supabase configuration."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-page-shell relative min-h-screen overflow-hidden px-4 py-10 text-white md:px-8">
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-6">
          <Link
            href="/companies"
            className="text-sm font-medium text-zinc-400 transition hover:text-white"
          >
            Back to Companies
          </Link>
        </div>

        <section className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
            Skill Match
          </p>

          <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
                Find Your Best Companies
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
                Enter your current skill levels and discover the top 5 companies
                that match your preparation.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950/80 px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Average Level
              </p>
              <p className="mt-1 text-3xl font-bold">{averageLevel}/7</p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <Card className="h-fit border-white/10 bg-zinc-950/80 text-white shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
            <CardHeader>
              <CardTitle>Enter Your Skills</CardTitle>
              <CardDescription className="text-zinc-400">
                Choose your current level for each skill from 1 to 7.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                {skills.map((skill) => (
                  <div key={skill.skill_set_name}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {skill.skill_set_name}
                        </p>
                        <p className="text-xs text-zinc-500">Student level</p>
                      </div>

                      <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-sm font-semibold">
                        {skill.level}/7
                      </span>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={skill.level}
                      onChange={(event) =>
                        updateSkillLevel(
                          skill.skill_set_name,
                          Number(event.target.value)
                        )
                      }
                      className="soft-range w-full"
                    />

                    <div className="mt-1 flex justify-between text-[10px] text-zinc-600">
                      <span>Beginner</span>
                      <span>Advanced</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleMatch}
                disabled={loading}
                className="soft-primary mt-8 w-full rounded-2xl px-5 py-3 text-sm font-bold transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Finding Matches..." : "Find Best 5 Companies"}
              </button>
            </CardContent>
          </Card>

          <section>
            {!hasSearched ? (
              <Card className="border-white/10 bg-zinc-950/80 text-white shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
                <CardHeader>
                  <CardTitle>Your matches will appear here</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Adjust your skill levels and click the match button to see
                    the best companies for your profile.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-8 text-center">
                    <p className="text-5xl font-bold">Top 5</p>
                    <p className="mt-3 text-sm text-zinc-400">
                      Companies will be ranked by skill match percentage,
                      matched skills, and preparation gaps.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : results.length > 0 ? (
              <div className="space-y-5">
                {results.map((company, index) => (
                  <Card
                    key={company.company_id}
                    className="group border-white/10 bg-zinc-950/80 text-white shadow-[0_24px_70px_rgba(0,0,0,0.45)] transition duration-300 hover:-translate-y-2 hover:rotate-[0.4deg] hover:shadow-[0_36px_100px_rgba(0,0,0,0.65)]"
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/40 text-sm font-bold">
                              {index + 1}
                            </span>

                            <div>
                              <h2 className="text-xl font-bold">
                                {company.short_name || company.name}
                              </h2>
                              <p className="text-sm text-zinc-400">
                                {company.category || "Company"}
                              </p>
                            </div>
                          </div>

                          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
                            {company.overview_preview ||
                              "Explore this company profile to understand its business, skills, and placement suitability."}
                          </p>
                        </div>

                        <div className="min-w-[160px] rounded-2xl border border-white/10 bg-black/30 p-4 text-center">
                          <p className="text-4xl font-bold">
                            {company.match_percentage}%
                          </p>
                          <p className="mt-1 text-sm text-zinc-400">
                            {getMatchLabel(company.match_percentage)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-800">
                        <div
                            className="soft-progress h-full rounded-full"
                          style={{
                            width: `${Math.min(
                              company.match_percentage,
                              100
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                            Matched Skills
                          </p>

                          {company.matched_skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {company.matched_skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded-full border border-cyan-200/30 bg-cyan-100/85 px-3 py-1 text-xs font-semibold text-slate-950"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-zinc-500">
                              No exact skill matches yet.
                            </p>
                          )}
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                            Preparation Gaps
                          </p>

                          {company.gap_skills.length > 0 ? (
                            <div className="space-y-2">
                              {company.gap_skills.slice(0, 3).map((gap) => (
                                <div
                                  key={gap.skill}
                                  className="flex items-center justify-between gap-3 text-sm"
                                >
                                  <span className="text-zinc-300">
                                    {gap.skill}
                                  </span>
                                  <span className="text-zinc-500">
                                    Need +{gap.gap}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-zinc-500">
                              No major gaps. You are well aligned.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                          href={`/companies/${company.company_id}`}
                          className="soft-primary rounded-xl px-4 py-2 text-sm font-semibold transition"
                        >
                          View Profile
                        </Link>

                        <Link
                          href={`/compare?ids=${company.company_id}`}
                          className="rounded-xl border border-cyan-200/20 bg-cyan-300/5 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/10"
                        >
                          Compare
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-white/10 bg-zinc-950/80 text-white shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
                <CardHeader>
                  <CardTitle>No matches found</CardTitle>
                  <CardDescription className="text-zinc-400">
                    {errorMessage ||
                      "Try increasing your skill levels or adjusting your inputs."}
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
