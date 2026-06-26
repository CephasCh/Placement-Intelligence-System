import Link from "next/link";
import CompanyLogo from "@/components/CompanyLogo";
import type { CompanySearchItem } from "@/types/company";

type CompanyIntelligenceCardProps = {
  company: CompanySearchItem;
};

function getFitLabel(score?: number | null) {
  if (!score) return "Not Rated";
  if (score >= 85) return "Excellent Fit";
  if (score >= 70) return "Good Fit";
  if (score >= 55) return "Moderate Fit";
  return "Needs Preparation";
}

function getStarRating(score?: number | null) {
  if (!score) return 0;
  return Math.round((score / 20) * 10) / 10;
}

export default function CompanyIntelligenceCard({
  company,
}: CompanyIntelligenceCardProps) {
  const name = company.short_name || company.name || "Company";
  const fitScore = company.student_fit_score || 0;
  const rating = getStarRating(fitScore);
  const fitLabel = getFitLabel(fitScore);
  const topSkills = company.top_skills?.slice(0, 4) || [];
  const officeReach =
    company.office_count || `${company.office_cities?.length || 0} Cities`;

  return (
    <div className="neon-card group relative overflow-hidden rounded-3xl border border-border bg-card p-5 transition duration-300 hover:-translate-y-1">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/45 to-transparent opacity-0 transition group-hover:opacity-100" />

      <div className="flex items-start gap-4">
        <CompanyLogo
          src={company.logo_url}
          name={name}
          className="h-16 w-16 shrink-0"
        />

        <div className="min-w-0 flex-1">
          <h2 className="line-clamp-1 text-lg font-bold tracking-tight">
            {name}
          </h2>

          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
            {company.category || "Company"}
          </p>
        </div>
      </div>

      <p className="mt-5 line-clamp-3 min-h-[72px] text-sm leading-6 text-muted-foreground">
        {company.overview_preview ||
          "Explore this company profile to understand its business, skills, culture, and career opportunities."}
      </p>

      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Top Skills
        </p>

        <div className="flex flex-wrap gap-2">
          {topSkills.length > 0 ? (
            topSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-cyan-200/15 bg-cyan-300/5 px-3 py-1 text-xs font-medium text-cyan-50"
              >
                {skill}
              </span>
            ))
          ) : (
            <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              Skills not listed
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-background/80 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-2xl font-bold">{rating.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Student rating</p>
          </div>

          <div className="text-right">
            <p className="font-semibold">{fitLabel}</p>
            <p className="text-xs text-muted-foreground">
              {fitScore}/100 fit score
            </p>
          </div>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="soft-progress h-full rounded-full transition-all"
            style={{ width: `${Math.min(fitScore, 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-background/80 p-3">
          <p className="line-clamp-1 text-sm font-semibold">
            {company.employee_size || "Not available"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Employees</p>
        </div>

        <div className="rounded-2xl border border-border bg-background/80 p-3">
          <p className="line-clamp-1 text-sm font-semibold">{officeReach}</p>
          <p className="mt-1 text-xs text-muted-foreground">Office reach</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link
          href={`/companies/${company.company_id}`}
          className="soft-primary rounded-2xl px-4 py-3 text-center text-sm font-semibold transition"
        >
          View Profile
        </Link>

        <Link
          href={`/compare?ids=${company.company_id}`}
          className="rounded-2xl border border-cyan-200/20 bg-cyan-300/5 px-4 py-3 text-center text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/10"
        >
          Compare
        </Link>
      </div>
    </div>
  );
}
