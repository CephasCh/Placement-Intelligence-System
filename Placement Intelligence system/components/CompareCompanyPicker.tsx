"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CompanySearchItem } from "@/types/company";

type CompareCompanyPickerProps = {
  companies: CompanySearchItem[];
  initialSelectedIds?: number[];
};

function displayName(company: CompanySearchItem) {
  return company.short_name || company.name || "Company";
}

export default function CompareCompanyPicker({
  companies,
  initialSelectedIds = [],
}: CompareCompanyPickerProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>(
    initialSelectedIds.slice(0, 3)
  );

  const filteredCompanies = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return companies.slice(0, 12);

    return companies
      .filter((company) => {
        return [
          company.name,
          company.short_name,
          company.category,
          company.overview_preview,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));
      })
      .slice(0, 18);
  }, [companies, search]);

  const compareHref =
    selectedIds.length >= 2 ? `/compare?ids=${selectedIds.join(",")}` : "#";

  function toggleCompany(companyId: number) {
    setSelectedIds((current) => {
      if (current.includes(companyId)) {
        return current.filter((id) => id !== companyId);
      }

      if (current.length >= 3) {
        return current;
      }

      return [...current, companyId];
    });
  }

  return (
    <div className="neon-card rounded-3xl border border-border bg-card p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Select Companies</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Search and select 2 to 3 companies. The comparison URL updates
            automatically when you continue.
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-200/20 bg-cyan-300/5 px-4 py-3 text-sm text-cyan-50">
          {selectedIds.length}/3 selected
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 md:flex-row">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by company name, category, or keyword..."
          className="min-h-12 flex-1 rounded-2xl border border-border bg-background/80 px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-cyan-200/60"
        />

        <Link
          href={compareHref}
          aria-disabled={selectedIds.length < 2}
          className={[
            "rounded-2xl px-5 py-3 text-center text-sm font-semibold transition",
            selectedIds.length >= 2
              ? "soft-primary"
              : "cursor-not-allowed border border-border bg-muted/50 text-muted-foreground",
          ].join(" ")}
        >
          Compare Selected
        </Link>
      </div>

      {selectedIds.length === 1 ? (
        <p className="mt-3 text-sm text-cyan-100/75">
          Select at least one more company to compare.
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredCompanies.map((company) => {
          const isSelected = selectedIds.includes(company.company_id);
          const isDisabled = !isSelected && selectedIds.length >= 3;

          return (
            <button
              key={company.company_id}
              type="button"
              onClick={() => toggleCompany(company.company_id)}
              disabled={isDisabled}
              className={[
                "rounded-2xl border p-4 text-left transition hover:-translate-y-0.5",
                isSelected
                  ? "soft-selected"
                  : "border-border bg-background/70 text-foreground hover:border-cyan-200/35 hover:bg-cyan-300/5",
                isDisabled ? "cursor-not-allowed opacity-45" : "",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="line-clamp-1 font-semibold">
                    {displayName(company)}
                  </p>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                    {company.category || "Not available"}
                  </p>
                </div>

                <span className="shrink-0 rounded-full border border-cyan-200/20 bg-black/30 px-2 py-1 text-xs">
                  {company.student_fit_score || "NA"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {filteredCompanies.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-border bg-background/70 p-5 text-sm text-muted-foreground">
          No companies found. Try another search term.
        </div>
      ) : null}
    </div>
  );
}
