import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type {
  CompanySearchItem,
  CompanySkill,
  SkillGap,
  StudentSkill,
} from "@/types/company";

type RequiredSkillGroup = Map<number, CompanySkill[]>;

function normalizeStudentSkills(skills: StudentSkill[]) {
  return skills
    .filter((skill) => skill.skill_set_name && Number.isFinite(skill.level))
    .map((skill) => ({
      skill_set_name: String(skill.skill_set_name).trim(),
      level: Math.min(Math.max(Number(skill.level), 1), 7),
    }));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const studentSkills = normalizeStudentSkills(body.skills || []);

    if (!studentSkills.length) {
      return NextResponse.json(
        { error: "Student skills are required" },
        { status: 400 }
      );
    }

    const skillNames = studentSkills.map((skill) => skill.skill_set_name);

    const { data: companySkills, error: skillsError } = await supabase
      .from("company_skills_view")
      .select("*")
      .in("skill_set_name", skillNames);

    if (skillsError) {
      return NextResponse.json(
        { error: "Skill information is not available" },
        { status: 500 }
      );
    }

    const requiredSkills = (companySkills || []) as CompanySkill[];
    const companyIds = Array.from(
      new Set(requiredSkills.map((item) => item.company_id))
    );

    if (companyIds.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const { data: companies, error: companiesError } = await supabase
      .from("company_search_view")
      .select("*")
      .in("company_id", companyIds);

    if (companiesError) {
      return NextResponse.json(
        { error: "No companies found" },
        { status: 500 }
      );
    }

    const groupedSkills: RequiredSkillGroup = new Map();

    requiredSkills.forEach((skill) => {
      const existing = groupedSkills.get(skill.company_id) || [];
      existing.push(skill);
      groupedSkills.set(skill.company_id, existing);
    });

    const results = ((companies || []) as CompanySearchItem[])
      .map((company) => {
        const companyRequiredSkills = groupedSkills.get(company.company_id) || [];
        let totalRequiredScore = 0;
        let matchedScore = 0;
        const matchedSkills: string[] = [];
        const gapSkills: SkillGap[] = [];

        companyRequiredSkills.forEach((requiredSkill) => {
          const studentSkill = studentSkills.find(
            (skill) => skill.skill_set_name === requiredSkill.skill_set_name
          );

          if (!studentSkill) return;

          const studentLevel = Number(studentSkill.level || 0);
          const requiredLevel = Number(requiredSkill.required_level || 0);

          totalRequiredScore += requiredLevel;
          matchedScore += Math.min(studentLevel, requiredLevel);

          if (studentLevel >= requiredLevel) {
            matchedSkills.push(requiredSkill.skill_set_name);
          } else {
            gapSkills.push({
              skill: requiredSkill.skill_set_name,
              student_level: studentLevel,
              required_level: requiredLevel,
              gap: requiredLevel - studentLevel,
            });
          }
        });

        return {
          company_id: company.company_id,
          name: company.name,
          short_name: company.short_name,
          category: company.category,
          overview_preview: company.overview_preview || null,
          student_fit_score: company.student_fit_score || null,
          match_percentage:
            totalRequiredScore > 0
              ? Math.round((matchedScore / totalRequiredScore) * 100)
              : 0,
          matched_skills: matchedSkills,
          gap_skills: gapSkills.sort((a, b) => b.gap - a.gap),
        };
      })
      .filter((result) => result.match_percentage > 0)
      .sort((a, b) => {
        if (b.match_percentage !== a.match_percentage) {
          return b.match_percentage - a.match_percentage;
        }

        return (b.student_fit_score || 0) - (a.student_fit_score || 0);
      })
      .slice(0, 5);

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: "Failed to calculate skill match" },
      { status: 500 }
    );
  }
}
