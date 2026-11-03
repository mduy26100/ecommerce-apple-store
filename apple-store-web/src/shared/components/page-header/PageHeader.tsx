import React from "react";

interface PageHeaderProps {
  title: string;
  breadcrumbs?: string[];
  subtitle?: React.ReactNode;
  extra?: React.ReactNode;
}

export const PageHeader = ({
  title,
  breadcrumbs = [],
  subtitle,
  extra,
}: PageHeaderProps) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
      <div className="flex flex-col gap-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex flex-wrap items-center text-[10px] sm:text-xs font-semibold text-gray-400 tracking-wider uppercase gap-y-1">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb}>
                {idx > 0 && <span className="mx-2 text-gray-300">/</span>}
                <span>{crumb}</span>
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <div className="text-xs sm:text-sm text-gray-500 font-normal">
            {subtitle}
          </div>
        )}
      </div>
      {extra && <div className="flex items-center gap-2">{extra}</div>}
    </div>
  );
};

export default PageHeader;
