import Link from "next/link";
import CompanyIntelligenceCard from "@/components/CompanyIntelligenceCard";
import { getCompanies } from "@/lib/data";
import type { CompanySearchItem } from "@/types/company";

export const dynamic = "force-dynamic";

type CompaniesPageProps = {
  searchParams?: Promise<{
    search?: string;
    category?: string;
  }>;
};

const categoryButtons = [
  "All",
  "Enterprise",
  "Startup",
  "IT Services",
  "AI / Analytics",
  "Finance",
  "EdTech",
];

export default async function CompaniesPage({
  searchParams,
}: CompaniesPageProps) {
  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams?.search || "";
  const category =
    resolvedSearchParams?.category && resolvedSearchParams.category !== "All"
      ? resolvedSearchParams.category
      : "";

  let companies: CompanySearchItem[] = [];
  let errorMessage = "";

  try {
    companies = await getCompanies({
      search,
      category,
    });
  } catch {
    errorMessage =
      "Company data is not available right now. Please check Supabase configuration.";
  }

  return (
    <main className="app-page-shell min-h-screen px-4 py-8 text-foreground md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-3">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Company Intelligence
          </p>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                Explore Companies
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Search companies, understand their skill expectations, compare
                opportunities, and choose the right company before you apply.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="w-fit rounded-xl border border-cyan-200/20 bg-cyan-300/5 px-4 py-2 text-sm font-medium text-cyan-50 transition hover:bg-cyan-300/10"
              >
                Dashboard
              </Link>

              <Link
                href="/skill-match"
                className="w-fit rounded-xl border border-cyan-200/20 bg-cyan-300/5 px-4 py-2 text-sm font-medium text-cyan-50 transition hover:bg-cyan-300/10"
              >
                Find by My Skills
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <form className="flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search companies like Accenture, Fractal, Google..."
              className="min-h-11 flex-1 rounded-xl border border-border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground"
            />

            {category ? (
              <input type="hidden" name="category" value={category} />
            ) : null}

            <button
              type="submit"
              className="soft-primary rounded-xl px-5 py-2 text-sm font-semibold transition"
            >
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {categoryButtons.map((item) => {
              const isActive = item === "All" ? !category : category === item;
              const href =
                item === "All"
                  ? search
                    ? `/companies?search=${encodeURIComponent(search)}`
                    : "/companies"
                  : `/companies?category=${encodeURIComponent(item)}${
                      search ? `&search=${encodeURIComponent(search)}` : ""
                    }`;

              return (
                <Link
                  key={item}
                  href={href}
                  className={[
                    "rounded-full border px-4 py-2 text-xs font-semibold transition",
                    isActive
                      ? "soft-selected"
                      : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                  ].join(" ")}
                >
                  {item}
                </Link>
              );
            })}
          </div>
        </div>

        {errorMessage ? (
          <div className="mb-5 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            {errorMessage}
          </div>
        ) : null}

        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {companies.length}
            </span>{" "}
            companies
            {category ? (
              <>
                {" "}
                in <span className="font-semibold text-foreground">{category}</span>
              </>
            ) : null}
          </p>
        </div>

        {companies.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {companies.map((company) => (
              <CompanyIntelligenceCard
                key={company.company_id}
                company={company}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <h2 className="text-xl font-semibold">No companies found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try changing the search keyword or selecting another industry.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
