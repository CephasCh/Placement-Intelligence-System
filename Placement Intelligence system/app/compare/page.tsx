import Link from "next/link";
import {
  getCompaniesForCompare,
  getCompanySkillsForCompare,
  getCompanies,
} from "@/lib/data";
import CompareCompanyPicker from "@/components/CompareCompanyPicker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  CompanyCompareItem,
  CompanySearchItem,
  CompanySkill,
} from "@/types/company";

export const dynamic = "force-dynamic";

type ComparePageProps = {
  searchParams?: Promise<{
    ids?: string;
  }>;
};

type CompareRow = {
  label: string;
  key: keyof CompanyCompareItem;
};

function parseCompanyIds(ids?: string) {
  if (!ids) return [];

  return ids
    .split(",")
    .map((id) => Number(id.trim()))
    .filter(Boolean)
    .slice(0, 4);
}

function valueOrFallback(value?: string | number | string[] | null) {
  if (!value) return "Not available";
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "Not available";
  return value;
}

function getFitLabel(score?: number | null) {
  if (!score) return "Not Rated";
  if (score >= 85) return "Excellent Fit";
  if (score >= 70) return "Good Fit";
  if (score >= 55) return "Moderate Fit";
  return "Needs Preparation";
}

function CompareTable({
  title,
  description,
  rows,
  companies,
}: {
  title: string;
  description: string;
  rows: CompareRow[];
  companies: CompanyCompareItem[];
}) {
  return (
    <Card className="overflow-hidden border-white/10 bg-zinc-950/80 text-zinc-100 shadow-[0_24px_70px_rgba(0,0,0,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_32px_90px_rgba(0,0,0,0.55)]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="text-zinc-400">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/30">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.04]">
                <th className="w-48 px-4 py-4 text-left font-semibold text-zinc-300">
                  Field
                </th>

                {companies.map((company) => (
                  <th
                    key={company.company_id}
                    className="px-4 py-4 text-left font-semibold text-white"
                  >
                    {company.short_name || company.name}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.key}
                  className="border-b border-white/10 last:border-b-0"
                >
                  <td className="px-4 py-4 font-medium text-zinc-400">
                    {row.label}
                  </td>

                  {companies.map((company) => (
                    <td
                      key={`${company.company_id}-${row.key}`}
                      className="px-4 py-4 leading-6 text-zinc-100"
                    >
                      {valueOrFallback(company[row.key] as string | string[] | number | null)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function FitScoreComparison({ companies }: { companies: CompanyCompareItem[] }) {
  return (
    <Card className="border-white/10 bg-zinc-950/80 text-zinc-100 shadow-[0_24px_70px_rgba(0,0,0,0.45)] transition duration-300 hover:-translate-y-1">
      <CardHeader>
        <CardTitle>Student-Fit Comparison</CardTitle>
        <CardDescription className="text-zinc-400">
          Compare how suitable each company is for students.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {companies.map((company) => {
            const score = company.student_fit_score || 0;

            return (
              <div
                key={company.company_id}
                className="rounded-2xl border border-white/10 bg-black/30 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:-translate-y-0.5"
              >
                <p className="line-clamp-1 text-sm font-semibold text-cyan-50">
                  {company.short_name || company.name}
                </p>

                <div className="mt-4 flex items-end gap-2">
                  <span className="text-4xl font-bold">{score}</span>
                  <span className="pb-1 text-sm text-zinc-400">/100</span>
                </div>

                <p className="mt-2 text-sm font-medium text-zinc-300">
                  {getFitLabel(score)}
                </p>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="soft-progress h-full rounded-full"
                    style={{ width: `${Math.min(score, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function SkillsComparison({
  companies,
  skills,
}: {
  companies: CompanyCompareItem[];
  skills: CompanySkill[];
}) {
  const skillNames = Array.from(
    new Set(skills.map((skill) => skill.skill_set_name).filter(Boolean))
  );

  function findSkill(companyId: number, skillName: string) {
    return skills.find(
      (skill) =>
        skill.company_id === companyId && skill.skill_set_name === skillName
    );
  }

  return (
    <Card className="overflow-hidden border-white/10 bg-zinc-950/80 text-zinc-100 shadow-[0_24px_70px_rgba(0,0,0,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_32px_90px_rgba(0,0,0,0.55)]">
      <CardHeader>
        <CardTitle>Required Skills Comparison</CardTitle>
        <CardDescription className="text-zinc-400">
          Skill requirement levels compared on a 1 to 7 scale.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {skillNames.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/30">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.04]">
                  <th className="w-56 px-4 py-4 text-left font-semibold text-zinc-300">
                    Skill
                  </th>

                  {companies.map((company) => (
                    <th
                      key={company.company_id}
                      className="px-4 py-4 text-left font-semibold text-white"
                    >
                      {company.short_name || company.name}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {skillNames.map((skillName) => (
                  <tr
                    key={skillName}
                    className="border-b border-white/10 last:border-b-0"
                  >
                    <td className="px-4 py-4 font-medium text-zinc-300">
                      {skillName}
                    </td>

                    {companies.map((company) => {
                      const skill = findSkill(company.company_id, skillName);
                      const level = skill?.required_level || 0;
                      const width = Math.min((level / 7) * 100, 100);

                      return (
                        <td
                          key={`${company.company_id}-${skillName}`}
                          className="px-4 py-4"
                        >
                          {skill ? (
                            <div>
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <span className="text-xs text-zinc-400">
                                  {skill.proficiency_name || "Required"}
                                </span>

                                <span className="text-xs font-semibold text-zinc-100">
                                  {level}/7
                                </span>
                              </div>

                              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                                <div
                                  className="soft-progress h-full rounded-full"
                                  style={{ width: `${width}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-500">
                              Not listed
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-zinc-400">
            Skill comparison data is not available.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const resolvedSearchParams = await searchParams;
  const ids = parseCompanyIds(resolvedSearchParams?.ids);
  let pickerCompanies: CompanySearchItem[] = [];

  try {
    pickerCompanies = await getCompanies();
  } catch {
    pickerCompanies = [];
  }

  if (ids.length === 0) {
    return (
      <main className="app-page-shell min-h-screen px-4 py-10 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/companies"
            className="text-sm font-medium text-zinc-400 transition hover:text-white"
          >
            Back to Companies
          </Link>

          <section className="mb-8 mt-8">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
              Company Comparison
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-5xl">
              Compare Companies
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
              Search and select multiple companies before opening the side-by-side comparison.
            </p>
          </section>

          <CompareCompanyPicker companies={pickerCompanies} />
        </div>
      </main>
    );
  }

  let companies: CompanyCompareItem[] = [];
  let skills: CompanySkill[] = [];
  let loadError = "";

  try {
    companies = await getCompaniesForCompare(ids);
    skills = await getCompanySkillsForCompare(ids);
  } catch {
    loadError =
      "Comparison data is not available right now. Please check Supabase configuration.";
  }

  const profileRows: CompareRow[] = [
    { label: "Category", key: "category" },
    { label: "Nature", key: "nature_of_company" },
    { label: "Employee size", key: "employee_size" },
    { label: "Office count", key: "office_count" },
    { label: "Operating countries", key: "operating_countries" },
  ];

  const financialRows: CompareRow[] = [
    { label: "Annual revenue", key: "annual_revenue" },
    { label: "Annual profit", key: "annual_profit" },
    { label: "Valuation", key: "valuation" },
    { label: "Growth rate", key: "yoy_growth_rate" },
    { label: "Profitability", key: "profitability_status" },
  ];

  const cultureRows: CompareRow[] = [
    { label: "Work culture", key: "work_culture_summary" },
    { label: "Manager quality", key: "manager_quality" },
    { label: "Psychological safety", key: "psychological_safety" },
    { label: "Learning culture", key: "learning_culture" },
    { label: "Mentorship", key: "mentorship_availability" },
    { label: "Burnout risk", key: "burnout_risk" },
  ];

  const technologyRows: CompareRow[] = [
    { label: "Tech stack", key: "tech_stack" },
    { label: "AI / ML adoption", key: "ai_ml_adoption_level" },
    { label: "Skill relevance", key: "skill_relevance" },
    { label: "Exposure quality", key: "exposure_quality" },
  ];

  return (
    <main className="app-page-shell min-h-screen px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
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
            Company Comparison
          </p>

          <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
                Compare Companies
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
                Compare profile elements, student-fit signals, work culture,
                technology exposure, financial strength, and required skills.
              </p>
            </div>

            <Link
              href="/compare"
              className="w-fit rounded-xl border border-cyan-200/20 bg-cyan-300/5 px-4 py-2 text-sm font-medium text-cyan-50 shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:bg-cyan-300/10"
            >
              Change Companies
            </Link>
          </div>
        </section>

        {loadError ? (
          <Card className="border-white/10 bg-zinc-950 text-white shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
            <CardHeader>
              <CardTitle>Comparison unavailable</CardTitle>
              <CardDescription className="text-zinc-400">
                {loadError}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : companies.length > 0 ? (
          <div className="space-y-6">
            <CompareCompanyPicker
              companies={pickerCompanies}
              initialSelectedIds={ids}
            />

            <FitScoreComparison companies={companies} />

            <CompareTable
              title="Company Profile"
              description="Basic company identity and operating information."
              rows={profileRows}
              companies={companies}
            />

            <CompareTable
              title="Financial Strength"
              description="Revenue, profit, valuation, growth, and profitability."
              rows={financialRows}
              companies={companies}
            />

            <CompareTable
              title="Work Culture"
              description="Compare workplace environment and student learning signals."
              rows={cultureRows}
              companies={companies}
            />

            <CompareTable
              title="Technology Exposure"
              description="Compare technology stack, skill relevance, and AI adoption."
              rows={technologyRows}
              companies={companies}
            />

            <SkillsComparison companies={companies} skills={skills} />
          </div>
        ) : (
          <Card className="border-white/10 bg-zinc-950 text-white shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
            <CardHeader>
              <CardTitle>No companies found</CardTitle>
              <CardDescription className="text-zinc-400">
                The selected company IDs did not match any records.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Link
                href="/companies"
                className="soft-primary inline-flex rounded-xl px-4 py-2 text-sm font-semibold"
              >
                Browse Companies
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
