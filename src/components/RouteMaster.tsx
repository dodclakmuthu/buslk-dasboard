import React, { useState } from 'react';
import { SRI_LANKAN_ROUTES } from '@/data/sriLankanRoutes';
import { MapPin, Route, ChevronDown, ChevronUp, Search, ArrowRight } from 'lucide-react';

const RouteMaster: React.FC = () => {
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRoutes = SRI_LANKAN_ROUTES.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.routeNo.includes(searchTerm) ||
    r.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Route Master</h1>
          <p className="text-slate-500 mt-1">{SRI_LANKAN_ROUTES.length} predefined Sri Lankan bus routes</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search routes by name, number, or city..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
        />
      </div>

      <div className="space-y-3">
        {filteredRoutes.map(route => {
          const isExpanded = expandedRoute === route.id;
          return (
            <div key={route.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div
                className="p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                onClick={() => setExpandedRoute(isExpanded ? null : route.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">{route.routeNo}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{route.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{route.origin}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span>{route.destination}</span>
                        {route.distanceKm && (
                          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full ml-2">{route.distanceKm} km</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">{route.points.length} stops</span>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-100 p-5">
                  <div className="relative">
                    {route.points.map((point, idx) => (
                      <div key={point.id} className="flex items-start gap-4 relative">
                        {/* Timeline */}
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 z-10 ${
                            idx === 0 ? 'bg-emerald-500 border-emerald-500' :
                            idx === route.points.length - 1 ? 'bg-red-500 border-red-500' :
                            'bg-white border-blue-400'
                          }`} />
                          {idx < route.points.length - 1 && (
                            <div className="w-0.5 h-8 bg-slate-200" />
                          )}
                        </div>
                        {/* Stop Info */}
                        <div className="pb-4 -mt-0.5">
                          <p className={`text-sm font-medium ${
                            idx === 0 || idx === route.points.length - 1 ? 'text-slate-900 font-bold' : 'text-slate-700'
                          }`}>
                            {point.name}
                          </p>
                          {point.distanceFromStart !== undefined && point.distanceFromStart > 0 && (
                            <p className="text-[11px] text-slate-400">{point.distanceFromStart} km from start</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RouteMaster;
