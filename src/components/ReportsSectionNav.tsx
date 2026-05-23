import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, LineChart } from 'lucide-react';

const reportSections = [
  { path: '/reports', label: 'Standard Reports', icon: BarChart3, exact: true },
  { path: '/reports/performance', label: 'Performance Analytics', icon: LineChart, exact: false },
];

const ReportsSectionNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {reportSections.map((section) => {
        const Icon = section.icon;
        const isActive = section.exact
          ? location.pathname === section.path
          : location.pathname.startsWith(section.path);

        return (
          <button
            key={section.path}
            type="button"
            onClick={() => navigate(section.path)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              isActive
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-4 h-4" /> {section.label}
          </button>
        );
      })}
    </div>
  );
};

export default ReportsSectionNav;