import { supabase } from "@/lib/supabase";
import type {
  CompanyCompareItem,
  CompanyProfile,
  CompanySearchItem,
  CompanySkill,
} from "@/types/company";

type GetCompaniesParams = {
  search?: string;
  category?: string;
  minFitScore?: number;
  limit?: number;
};

function cleanSearchTerm(value: string) {
  return value.trim().replace(/[%,()]/g, " ").replace(/\s+/g, " ");
}

function normalizeSearch(value?: string | null) {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function searchRank(company: CompanySearchItem, search: string) {
  const term = normalizeSearch(search);
  if (!term) return 0;

  const name = normalizeSearch(company.name);
  const shortName = normalizeSearch(company.short_name);
  const category = normalizeSearch(company.category);
  const overview = normalizeSearch(company.overview_preview);
  const skills = normalizeSearch((company.top_skills || []).join(" "));

  if (shortName === term) return 100;
  if (name === term) return 95;
  if (shortName.startsWith(term)) return 90;
  if (name.startsWith(term)) return 85;
  if (shortName.includes(term)) return 80;
  if (name.includes(term)) return 75;
  if (category.includes(term)) return 55;
  if (skills.includes(term)) return 45;
  if (overview.includes(term)) return 35;
  return 0;
}

export async function getCompanies(
  params: GetCompaniesParams = {}
): Promise<CompanySearchItem[]> {
  const { search, category, minFitScore, limit } = params;

  let query = supabase
    .from("company_search_view")
    .select("*")
    .order("student_fit_score", { ascending: false });

  if (typeof limit === "number") {
    query = query.limit(limit);
  }

  const cleanedSearch = search ? cleanSearchTerm(search) : "";

  if (cleanedSearch) {
    query = query.or(
      `name.ilike.%${cleanedSearch}%,short_name.ilike.%${cleanedSearch}%,category.ilike.%${cleanedSearch}%,overview_preview.ilike.%${cleanedSearch}%`
    );
  }

  if (category) {
    query = query.ilike("category", `%${cleanSearchTerm(category)}%`);
  }

  if (typeof minFitScore === "number") {
    query = query.gte("student_fit_score", minFitScore);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Failed to fetch companies");
  }

  const companies = (data || []) as CompanySearchItem[];

  if (!cleanedSearch) {
    return companies;
  }

  return companies.sort((a, b) => {
    const rankDifference = searchRank(b, cleanedSearch) - searchRank(a, cleanedSearch);
    if (rankDifference !== 0) return rankDifference;
    return (b.student_fit_score || 0) - (a.student_fit_score || 0);
  });
}

export async function getCompanyById(
  companyId: number
): Promise<CompanyProfile | null> {
  const { data, error } = await supabase
    .from("company_profile_view")
    .select("*")
    .eq("company_id", companyId)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to fetch company profile");
  }

  return (data as CompanyProfile | null) || null;
}

export async function getCompanySkills(
  companyId: number
): Promise<CompanySkill[]> {
  const { data, error } = await supabase
    .from("company_skills_view")
    .select("*")
    .eq("company_id", companyId)
    .order("required_level", { ascending: false });

  if (error) {
    throw new Error("Failed to fetch company skills");
  }

  return (data || []) as CompanySkill[];
}

export async function getCompaniesForCompare(
  companyIds: number[]
): Promise<CompanyCompareItem[]> {
  if (companyIds.length === 0) return [];

  const { data, error } = await supabase
    .from("company_compare_view")
    .select("*")
    .in("company_id", companyIds);

  if (error) {
    throw new Error("Failed to fetch companies for comparison");
  }

  return companyIds
    .map((id) =>
      (data || []).find((company) => company.company_id === id)
    )
    .filter(Boolean) as CompanyCompareItem[];
}

export async function getCompanySkillsForCompare(
  companyIds: number[]
): Promise<CompanySkill[]> {
  if (companyIds.length === 0) return [];

  const { data, error } = await supabase
    .from("company_skills_view")
    .select("*")
    .in("company_id", companyIds)
    .order("skill_set_name", { ascending: true });

  if (error) {
    throw new Error("Failed to fetch company skills");
  }

  return (data || []) as CompanySkill[];
}
