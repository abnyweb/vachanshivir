import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { titleCase } from '../../utils/format';

export function AdminPage({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const location = useLocation();
  const pathSegments = location.pathname
    .split('/')
    .filter(Boolean)
    .filter((s) => s !== 'admin');

  return (
    <div className="mx-auto max-w-7xl animate-fadeIn space-y-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400 font-medium overflow-x-auto no-scrollbar whitespace-nowrap py-0.5">
        <Link to="/admin/dashboard" className="flex items-center gap-1 hover:text-slate-700 transition-colors shrink-0">
          <Home size={13} />
          <span>Admin</span>
        </Link>
        {pathSegments.map((seg, i) => {
          const isLast = i === pathSegments.length - 1;
          const href = `/admin/${pathSegments.slice(0, i + 1).join('/')}`;
          return (
            <div key={seg} className="flex items-center gap-1.5 shrink-0">
              <ChevronRight size={12} className="text-slate-300" />
              {isLast ? (
                <span className="text-slate-700 font-semibold truncate max-w-[160px] sm:max-w-[220px]">
                  {titleCase(seg.replace(/-/g, ' '))}
                </span>
              ) : (
                <Link to={href} className="hover:text-slate-700 transition-colors">
                  {titleCase(seg.replace(/-/g, ' '))}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-2 border-b border-slate-200/80">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-5 sm:h-6 w-1 rounded-full bg-[#153A66] shrink-0" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans truncate sm:overflow-visible">
              {title}
            </h1>
          </div>
          {description && (
            <p className="max-w-3xl text-xs sm:text-sm text-slate-500 font-normal leading-relaxed line-clamp-2 sm:line-clamp-none">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap sm:flex-nowrap items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
            {actions}
          </div>
        )}
      </div>

      {/* Main Body */}
      <div>{children}</div>
    </div>
  );
}
