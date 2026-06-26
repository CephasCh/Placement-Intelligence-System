export type CompanySearchItem = {
  company_id: number;
  name: string | null;
  short_name: string | null;
  logo_url?: string | null;
  category: string | null;
  nature_of_company?: string | null;
  employee_size?: string | null;
  office_count?: string | null;
  website_url?: string | null;
  linkedin_url?: string | null;
  overview_preview?: string | null;
  student_fit_score?: number | null;
  top_skills?: string[] | null;
  office_cities?: string[] | null;
  operating_countries?: string[] | null;
  profitability_status?: string | null;
  yoy_growth_rate?: string | null;
  valuation?: string | null;
  skill_relevance?: string | null;
  burnout_risk?: string | null;
  ai_ml_adoption_level?: string | null;
};

export type CompanyProfile = CompanySearchItem & {
  overview_text?: string | null;
  vision_statement?: string | null;
  mission_statement?: string | null;
  positive_signals?: string[] | null;
  caution_signals?: string[] | null;
  annual_revenue?: string | null;
  annual_profit?: string | null;
  work_culture_summary?: string | null;
  manager_quality?: string | null;
  psychological_safety?: string | null;
  learning_culture?: string | null;
  mentorship_availability?: string | null;
  tech_stack?: string | null;
  exposure_quality?: string | null;
};

export type CompanyCompareItem = CompanyProfile & {
  typical_hours?: string | null;
  weekend_work?: string | null;
  remote_policy_details?: string | null;
  flexibility_level?: string | null;
  onboarding_quality?: string | null;
  internal_mobility?: string | null;
  role_clarity?: string | null;
  early_ownership?: string | null;
  exit_opportunities?: string | null;
  global_exposure?: string | null;
  technology_partners?: string | null;
  tech_adoption_rating?: string | null;
  brand_value?: string | null;
  glassdoor_rating?: string | null;
  google_rating?: string | null;
  website_rating?: string | null;
};

export type CompanySkill = {
  company_id: number;
  company_name?: string | null;
  company_short_name?: string | null;
  skill_set_id: number;
  skill_set_name: string;
  skill_short_name?: string | null;
  skill_set_description?: string | null;
  required_level: number;
  proficiency_level_id?: number | null;
  proficiency_name: string | null;
  proficiency_code?: string | null;
  proficiency_description?: string | null;
};

export type StudentSkill = {
  skill_set_name: string;
  level: number;
};

export type SkillGap = {
  skill: string;
  student_level: number;
  required_level: number;
  gap: number;
};

export type MatchResult = {
  company_id: number;
  name: string | null;
  short_name: string | null;
  category: string | null;
  overview_preview: string | null;
  student_fit_score: number | null;
  match_percentage: number;
  matched_skills: string[];
  gap_skills: SkillGap[];
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
