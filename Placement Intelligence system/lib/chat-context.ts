import { supabase } from "@/lib/supabase";
import type { CompanySkill, SkillGap, StudentSkill } from "@/types/company";

type BuildChatContextParams = {
  userMessage: string;
  studentSkills: StudentSkill[];
};

type RowWithCompanyId = Record<string, unknown> & {
  company_id?: number;
};

function cleanSearchTerm(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
}

function textValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "Not available";
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "Not available";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function companyName(row: RowWithCompanyId) {
  return textValue(row.short_name || row.name || row.company_name);
}

function summarizeCompanies(rows: RowWithCompanyId[], limit = 8) {
  return rows.slice(0, limit).map((row, index) => {
    return `${index + 1}. ${companyName(row)} | category: ${textValue(
      row.category
    )} | fit: ${textValue(row.student_fit_score)} | overview: ${textValue(
      row.overview_preview || row.ai_context_text || row.work_culture_summary
    ).slice(0, 500)}`;
  });
}

function summarizeProfiles(rows: RowWithCompanyId[], limit = 8) {
  return rows.slice(0, limit).map((row, index) => {
    return `${index + 1}. ${companyName(row)} | category: ${textValue(
      row.category
    )} | score: ${textValue(row.student_fit_score)} | culture: ${textValue(
      row.work_culture_summary
    )} | tech: ${textValue(row.tech_stack)} | positive: ${textValue(
      row.positive_signals
    )} | caution: ${textValue(row.caution_signals)}`;
  });
}

function summarizeSkills(rows: CompanySkill[], limit = 80) {
  return rows.slice(0, limit).map((skill) => {
    return `${skill.company_short_name || skill.company_name || skill.company_id}: ${
      skill.skill_set_name
    } requires level ${skill.required_level}/7 (${textValue(
      skill.proficiency_name
    )})`;
  });
}

function extractKeywords(message: string) {
  return cleanSearchTerm(message)
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 8);
}

function collectIds(...groups: Array<RowWithCompanyId[] | null | undefined>) {
  return Array.from(
    new Set(
      groups
        .flatMap((group) => group || [])
        .map((item) => item.company_id)
        .filter((id): id is number => typeof id === "number")
    )
  ).slice(0, 20);
}

export async function buildChatContext({
  userMessage,
  studentSkills,
}: BuildChatContextParams) {
  const keywords = extractKeywords(userMessage);
  const companyQuery = keywords[0] || cleanSearchTerm(userMessage).slice(0, 40);

  const companySearch =
    companyQuery.length > 0
      ? `name.ilike.%${companyQuery}%,short_name.ilike.%${companyQuery}%,category.ilike.%${companyQuery}%`
      : "";

  const { data: companyAiContext } = companySearch
    ? await supabase
        .from("company_ai_context_view")
        .select("*")
        .or(companySearch)
        .limit(8)
    : { data: [] as RowWithCompanyId[] };

  const { data: companySearchData } = companySearch
    ? await supabase
        .from("company_search_view")
        .select("*")
        .or(companySearch)
        .limit(8)
    : { data: [] as RowWithCompanyId[] };

  const { data: topFitCompanies } = await supabase
    .from("company_student_fit_view")
    .select("*")
    .order("student_fit_score", { ascending: false })
    .limit(10);

  const skillNames = studentSkills.map((skill) => skill.skill_set_name);

  const { data: relevantSkills } =
    skillNames.length > 0
      ? await supabase
          .from("company_skills_view")
          .select("*")
          .in("skill_set_name", skillNames)
          .limit(300)
      : { data: [] as CompanySkill[] };

  const relevantCompanyIds = collectIds(
    companyAiContext as RowWithCompanyId[],
    companySearchData as RowWithCompanyId[],
    topFitCompanies as RowWithCompanyId[],
    relevantSkills as RowWithCompanyId[]
  );

  const { data: fullProfiles } =
    relevantCompanyIds.length > 0
      ? await supabase
          .from("company_profile_view")
          .select("*")
          .in("company_id", relevantCompanyIds)
          .limit(20)
      : { data: [] as RowWithCompanyId[] };

  const { data: compareData } =
    relevantCompanyIds.length > 0
      ? await supabase
          .from("company_compare_view")
          .select("*")
          .in("company_id", relevantCompanyIds)
          .limit(20)
      : { data: [] as RowWithCompanyId[] };

  const matchedCompanyScores = calculateSkillMatches({
    studentSkills,
    companySkills: (relevantSkills || []) as CompanySkill[],
  });

  const contextParts = [
    "TOP STUDENT FIT COMPANIES:",
    ...summarizeCompanies((topFitCompanies || []) as RowWithCompanyId[], 10),
    "",
    "RELEVANT COMPANIES FROM QUESTION:",
    ...summarizeCompanies(
      [
        ...((companyAiContext || []) as RowWithCompanyId[]),
        ...((companySearchData || []) as RowWithCompanyId[]),
      ],
      8
    ),
    "",
    "PROFILE AND COMPARISON DETAILS:",
    ...summarizeProfiles(
      [
        ...((fullProfiles || []) as RowWithCompanyId[]),
        ...((compareData || []) as RowWithCompanyId[]),
      ],
      10
    ),
    "",
    "RELEVANT SKILL REQUIREMENTS:",
    ...summarizeSkills((relevantSkills || []) as CompanySkill[]),
    "",
    "STUDENT SKILL MATCH SCORES:",
    ...matchedCompanyScores.map(
      (score) =>
        `Company ${score.company_id}: ${score.match_percentage}% match | matched: ${score.matched_skills.join(
          ", "
        ) || "None"} | gaps: ${
          score.gap_skills
            .map((gap) => `${gap.skill} needs +${gap.gap}`)
            .join(", ") || "None"
        }`
    ),
  ];

  return contextParts.join("\n").slice(0, 12000);
}

function calculateSkillMatches({
  studentSkills,
  companySkills,
}: {
  studentSkills: StudentSkill[];
  companySkills: CompanySkill[];
}) {
  if (!studentSkills.length || !companySkills.length) return [];

  const grouped = new Map<number, CompanySkill[]>();

  companySkills.forEach((skill) => {
    const existing = grouped.get(skill.company_id) || [];
    existing.push(skill);
    grouped.set(skill.company_id, existing);
  });

  return Array.from(grouped.entries())
    .map(([companyId, requiredSkills]) => {
      let totalRequiredScore = 0;
      let matchedScore = 0;
      const matchedSkills: string[] = [];
      const gapSkills: SkillGap[] = [];

      requiredSkills.forEach((requiredSkill) => {
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
        company_id: companyId,
        match_percentage:
          totalRequiredScore > 0
            ? Math.round((matchedScore / totalRequiredScore) * 100)
            : 0,
        matched_skills: matchedSkills,
        gap_skills: gapSkills.sort((a, b) => b.gap - a.gap),
      };
    })
    .sort((a, b) => b.match_percentage - a.match_percentage)
    .slice(0, 10);
}
