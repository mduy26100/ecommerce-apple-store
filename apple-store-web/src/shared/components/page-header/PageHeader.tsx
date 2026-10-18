import React from "react";

interface PageHeaderProps {
  title: string;
  breadcrumbs: string[];
}

export const PageHeader = ({ title, breadcrumbs }: PageHeaderProps) => {
  return (
    <div className="mb-6 flex flex-col gap-1 select-none">
      <div className="flex flex-wrap items-center text-[10px] sm:text-xs font-semibold text-gray-400 tracking-wider uppercase gap-y-1">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb}>
            {idx > 0 && <span className="mx-2 text-gray-300">/</span>}
            <span>{crumb}</span>
          </React.Fragment>
        ))}
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
        {title}
      </h1>
    </div>
  );
};

export default PageHeader;
