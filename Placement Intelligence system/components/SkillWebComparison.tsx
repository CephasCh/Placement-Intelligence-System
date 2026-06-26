"use client";

import { useEffect, useMemo, useState } from "react";
import type { CompanySkill, StudentSkill } from "@/types/company";

type SkillWebComparisonProps = {
  skills: CompanySkill[];
};

const storageKey = "placement_student_skills";
const maxLevel = 7;

function clampLevel(level: number) {
  return Math.min(Math.max(Number(level) || 1, 1), maxLevel);
}

function pointFor(index: number, total: number, level: number, radius: number) {
  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total;
  const distance = (clampLevel(level) / maxLevel) * radius;
  return {
    x: 50 + Math.cos(angle) * distance,
    y: 50 + Math.sin(angle) * distance,
  };
}

function polygonPoints(skills: CompanySkill[], levels: number[]) {
  return skills
    .map((_, index) => pointFor(index, skills.length, levels[index], 38))
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
}

function gridPoints(total: number, level: number) {
  return Array.from({ length: total }, (_, index) =>
    pointFor(index, total, level, 38)
  )
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
}

export default function SkillWebComparison({ skills }: SkillWebComparisonProps) {
  const chartSkills = useMemo(
    () => skills.slice(0, 8),
    [skills]
  );
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) {
      setStudentSkills(
        chartSkills.map((skill) => ({
          skill_set_name: skill.skill_set_name,
          level: 4,
        }))
      );
      return;
    }

    try {
      const parsed = JSON.parse(saved) as StudentSkill[];
      const merged = chartSkills.map((skill) => {
        const existing = parsed.find(
          (item) => item.skill_set_name === skill.skill_set_name
        );
        return {
          skill_set_name: skill.skill_set_name,
          level: existing?.level || 4,
        };
      });
      setStudentSkills(merged);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [chartSkills]);

  useEffect(() => {
    if (studentSkills.length > 0) {
      window.localStorage.setItem(storageKey, JSON.stringify(studentSkills));
    }
  }, [studentSkills]);

  if (chartSkills.length < 3) {
    return (
      <div className="rounded-2xl border border-border bg-background/70 p-5 text-sm text-muted-foreground">
        Web chart needs at least three skills to compare visually.
      </div>
    );
  }

  const requiredLevels = chartSkills.map((skill) => skill.required_level);
  const studentLevels = chartSkills.map((skill) => {
    return (
      studentSkills.find((item) => item.skill_set_name === skill.skill_set_name)
        ?.level || 4
    );
  });

  function updateStudentLevel(skillName: string, level: number) {
    setStudentSkills((current) =>
      current.map((skill) =>
        skill.skill_set_name === skillName
          ? { ...skill, level: clampLevel(level) }
          : skill
      )
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-background/70 p-4">
        <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-6 rounded-full bg-cyan-300" />
            Company Required
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-6 rounded-full bg-lime-300" />
            Your Level
          </span>
        </div>

        <svg viewBox="0 0 100 100" className="mx-auto aspect-square w-full max-w-[440px]">
          {[1, 2, 3, 4, 5, 6, 7].map((level) => (
            <polygon
              key={level}
              points={gridPoints(chartSkills.length, level)}
              fill="none"
              stroke="rgba(148, 163, 184, 0.18)"
              strokeWidth="0.35"
            />
          ))}

          {chartSkills.map((skill, index) => {
            const outer = pointFor(index, chartSkills.length, maxLevel, 38);
            const label = skill.skill_set_name.replace(" and ", " / ");

            return (
              <g key={skill.skill_set_id}>
                <line
                  x1="50"
                  y1="50"
                  x2={outer.x}
                  y2={outer.y}
                  stroke="rgba(148, 163, 184, 0.16)"
                  strokeWidth="0.35"
                />
                <text
                  x={50 + (outer.x - 50) * 1.16}
                  y={50 + (outer.y - 50) * 1.16}
                  textAnchor={outer.x < 45 ? "end" : outer.x > 55 ? "start" : "middle"}
                  dominantBaseline="middle"
                  className="fill-slate-300 text-[2.8px]"
                >
                  {label.length > 18 ? `${label.slice(0, 17)}...` : label}
                </text>
              </g>
            );
          })}

          <polygon
            points={polygonPoints(chartSkills, requiredLevels)}
            fill="rgba(34, 211, 238, 0.2)"
            stroke="#67e8f9"
            strokeWidth="1"
          />
          <polygon
            points={polygonPoints(chartSkills, studentLevels)}
            fill="rgba(190, 242, 100, 0.16)"
            stroke="#bef264"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="space-y-4">
        {chartSkills.map((skill) => {
          const studentLevel =
            studentSkills.find(
              (item) => item.skill_set_name === skill.skill_set_name
            )?.level || 4;
          const gap = Math.max(skill.required_level - studentLevel, 0);

          return (
            <div
              key={skill.skill_set_id}
              className="rounded-2xl border border-border bg-background/70 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{skill.skill_set_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Required {skill.required_level}/7
                  </p>
                </div>
                <span className="rounded-full border border-cyan-200/20 bg-cyan-300/5 px-3 py-1 text-xs text-cyan-50">
                  {gap > 0 ? `Gap +${gap}` : "Aligned"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={studentLevel}
                  onChange={(event) =>
                    updateStudentLevel(
                      skill.skill_set_name,
                      Number(event.target.value)
                    )
                  }
                  className="soft-range w-full"
                />
                <span className="w-12 text-right text-sm font-semibold">
                  {studentLevel}/7
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
