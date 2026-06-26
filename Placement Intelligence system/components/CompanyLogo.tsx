"use client";

import { useState } from "react";

type CompanyLogoProps = {
  src?: string | null;
  name: string;
  className?: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export default function CompanyLogo({ src, name, className }: CompanyLogoProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const shouldShowImage = Boolean(src) && !failed;

  return (
    <div
      className={[
        "flex items-center justify-center overflow-hidden rounded-2xl border border-border bg-background",
        "shadow-[0_0_22px_rgba(34,211,238,0.12)]",
        className || "",
      ].join(" ")}
    >
      {shouldShowImage ? (
        <>
          {!loaded ? (
            <span className="text-lg font-bold text-cyan-100">
              {getInitials(name) || "CO"}
            </span>
          ) : null}
          <img
            src={src || ""}
            alt={`${name} logo`}
            referrerPolicy="no-referrer"
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={[
              "h-full w-full object-contain p-2",
              loaded ? "block" : "hidden",
            ].join(" ")}
          />
        </>
      ) : (
        <span className="text-lg font-bold text-cyan-100">
          {getInitials(name) || "CO"}
        </span>
      )}
    </div>
  );
}
