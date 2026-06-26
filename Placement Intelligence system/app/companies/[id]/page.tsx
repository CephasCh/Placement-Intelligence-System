import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanyById, getCompanySkills } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SkillWebComparison from "@/components/SkillWebComparison";
import type { CompanySkill } from "@/types/company";

export const dynamic = "force-dynamic";

type CompanyProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
};

function valueOrFallback(value?: string | number | null) {
  return value ? value : "Not available";
}

function formatArray(values?: string[] | null) {
  if (!values || values.length === 0) return "Not available";
  return values.join(", ");
}

function ScoreCard({ score }: { score?: number | null }) {
  const finalScore = score || 0;
  let label = "Needs Preparation";

  if (finalScore >= 85) label = "Excellent Fit";
  else if (finalScore >= 70) label = "Good Fit";
  else if (finalScore >= 55) label = "Moderate Fit";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student-Fit Score</CardTitle>
        <CardDescription>
          How suitable this company looks for students.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex items-end gap-3">
          <span className="text-5xl font-bold">{finalScore}</span>
          <span className="pb-2 text-sm text-muted-foreground">/ 100</span>
        </div>

        <p className="mt-3 text-lg font-semibold">{label}</p>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="soft-progress h-full rounded-full"
            style={{ width: `${Math.min(finalScore, 100)}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function SignalList({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items?: string[] | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        {items && items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Not available</p>
        )}
      </CardContent>
    </Card>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium">
        {valueOrFallback(value)}
      </p>
    </div>
  );
}

function SkillsLevelChart({ skills }: { skills: CompanySkill[] }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Required Skills Level</CardTitle>
        <CardDescription>
          Skill expectations for this company on a 1 to 7 level scale.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {skills.length > 0 ? (
          <div className="space-y-4">
            {skills.map((skill) => {
              const width = Math.min((skill.required_level / 7) * 100, 100);

              return (
                <div key={skill.skill_set_id} className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">
                        {skill.skill_set_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {skill.proficiency_name || "Not available"}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-semibold">
                      Level {skill.required_level}/7
                    </p>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="soft-progress h-full rounded-full"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Skill information is not available.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function SkillWebComparisonCard({ skills }: { skills: CompanySkill[] }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Skill Web Comparison</CardTitle>
        <CardDescription>
          Compare the company required levels with your own skill levels.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <SkillWebComparison skills={skills} />
      </CardContent>
    </Card>
  );
}

export default async function CompanyProfilePage({
  params,
}: CompanyProfilePageProps) {
  const resolvedParams = await params;
  const companyId = Number(resolvedParams.id);

  if (!companyId) {
    notFound();
  }

  let company;
  let skills: CompanySkill[] = [];
  let loadError = "";

  try {
    company = await getCompanyById(companyId);
    skills = await getCompanySkills(companyId);
  } catch {
    loadError =
      "Company profile is not available right now. Please check Supabase configuration.";
  }

  if (!loadError && !company) {
    notFound();
  }

  if (loadError || !company) {
    return (
      <main className="app-page-shell min-h-screen px-4 py-8 text-foreground md:px-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/companies"
            className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            Back to Companies
          </Link>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Profile unavailable</CardTitle>
              <CardDescription>{loadError}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="app-page-shell min-h-screen px-4 py-8 text-foreground md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href="/companies"
            className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            Back to Companies
          </Link>
          <Link
            href={`/compare?ids=${company.company_id}`}
            className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            Compare
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-3xl md:text-5xl">
                {company.short_name || company.name || "Company"}
              </CardTitle>
              <CardDescription className="text-base">
                {company.category || "Company"} /{" "}
                {company.employee_size || "Employee size not available"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <p className="max-w-4xl text-sm leading-7 text-muted-foreground md:text-base">
                {company.overview_text || "Overview is not available."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {company.website_url ? (
                  <Link
                    href={company.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="soft-primary rounded-lg px-4 py-2 text-sm font-semibold"
                  >
                    Visit Website
                  </Link>
                ) : null}

                {company.linkedin_url ? (
                  <Link
                    href={company.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-border px-4 py-2 text-sm font-semibold"
                  >
                    LinkedIn
                  </Link>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <ScoreCard score={company.student_fit_score} />

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Company Direction</CardTitle>
              <CardDescription>
                Vision, mission, and company purpose.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2">
              <InfoRow label="Vision" value={company.vision_statement} />
              <InfoRow label="Mission" value={company.mission_statement} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company Basics</CardTitle>
              <CardDescription>Quick company facts.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <InfoRow label="Nature" value={company.nature_of_company} />
              <InfoRow label="Office count" value={company.office_count} />
              <InfoRow label="Category" value={company.category} />
            </CardContent>
          </Card>

          <SignalList
            title="Positive Signals"
            description="Why this company may be a good student fit."
            items={company.positive_signals}
          />

          <SignalList
            title="Caution Signals"
            description="Areas students should prepare for."
            items={company.caution_signals}
          />

          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>
                Revenue, valuation, growth, and profitability.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <InfoRow label="Annual revenue" value={company.annual_revenue} />
              <InfoRow label="Annual profit" value={company.annual_profit} />
              <InfoRow label="Valuation" value={company.valuation} />
              <InfoRow label="Growth rate" value={company.yoy_growth_rate} />
              <InfoRow
                label="Profitability"
                value={company.profitability_status}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Work Culture</CardTitle>
              <CardDescription>
                Culture, learning, mentorship, and workplace signals.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-3 md:grid-cols-2">
              <InfoRow
                label="Culture summary"
                value={company.work_culture_summary}
              />
              <InfoRow label="Manager quality" value={company.manager_quality} />
              <InfoRow
                label="Psychological safety"
                value={company.psychological_safety}
              />
              <InfoRow label="Burnout risk" value={company.burnout_risk} />
              <InfoRow
                label="Learning culture"
                value={company.learning_culture}
              />
              <InfoRow
                label="Mentorship"
                value={company.mentorship_availability}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technology</CardTitle>
              <CardDescription>
                Technical exposure and adoption level.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <InfoRow
                label="AI/ML adoption"
                value={company.ai_ml_adoption_level}
              />
              <InfoRow label="Tech stack" value={company.tech_stack} />
              <InfoRow label="Skill relevance" value={company.skill_relevance} />
              <InfoRow
                label="Exposure quality"
                value={company.exposure_quality}
              />
            </CardContent>
          </Card>

          <SkillsLevelChart skills={skills} />

          <SkillWebComparisonCard skills={skills} />

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Locations</CardTitle>
              <CardDescription>
                Office cities and operating countries.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-3 md:grid-cols-2">
              <InfoRow
                label="Office cities"
                value={formatArray(company.office_cities)}
              />
              <InfoRow
                label="Operating countries"
                value={formatArray(company.operating_countries)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
