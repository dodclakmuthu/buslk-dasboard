import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Search,
  ArrowRight,
  Plus,
  Loader2,
  AlertCircle,
  Upload,
  Edit2,
  X,
  Link2,
  History,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  ApiCompanyRoute,
  ApiGlobalRoute,
  ApiRoute,
  ApiRouteApprovalStatus,
  ApiRouteApprovalStatusSummary,
  ApiRouteHistoryEntry,
  createCompanyRoute,
  getCompanyRoute,
  getCompanyRouteApprovalStatus,
  getCompanyRouteHistory,
  listCompanyRoutes,
  listGlobalRoutes,
  submitCompanyRouteForApproval,
  updateCompanyRoute,
} from '@/lib/routeApi';
import { ApiError } from '@/lib/api';

type StopItem = { id: string; locationName: string };

type FormData = {
  routeNumber: string;
  routeName: string;
  startLocation: string;
  endLocation: string;
  distanceKm: string;
  description: string;
  upStops: StopItem[];
  downIsReverseOfUp: boolean;
  downStops: StopItem[];
};

type ModalState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; route: ApiCompanyRoute };

type UiRoute =
  | (ApiGlobalRoute & { kind: 'global' })
  | (ApiCompanyRoute & { kind: 'company' });

type RoutePanelState = {
  detail?: ApiCompanyRoute;
  approval?: ApiRouteApprovalStatusSummary;
  history?: ApiRouteHistoryEntry[];
  loading: boolean;
  error: string | null;
};

const emptyForm = (): FormData => ({
  routeNumber: '',
  routeName: '',
  startLocation: '',
  endLocation: '',
  distanceKm: '',
  description: '',
  upStops: [],
  downIsReverseOfUp: true,
  downStops: [],
});

const statusStyles: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-slate-100 text-slate-700' },
  PRIVATE_ACTIVE: { label: 'Draft', className: 'bg-slate-100 text-slate-700' },
  PENDING_APPROVAL: { label: 'Pending Approval', className: 'bg-amber-100 text-amber-700' },
  PENDING_UPDATE_APPROVAL: {
    label: 'Pending Update Approval',
    className: 'bg-orange-100 text-orange-700',
  },
  APPROVED: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
  UPDATE_REJECTED: { label: 'Update Rejected', className: 'bg-rose-100 text-rose-700' },
};

function getStatusBadge(status: ApiRouteApprovalStatus): { label: string; className: string } {
  return statusStyles[status] ?? statusStyles.DRAFT;
}

function getScopeBadge(route: UiRoute): { label: string; className: string } {
  if (route.kind === 'global') {
    return { label: 'Global', className: 'bg-blue-100 text-blue-700' };
  }

  return { label: 'Company Private', className: 'bg-indigo-100 text-indigo-700' };
}

function getActiveBadge(route: ApiRoute): { label: string; className: string } {
  return route.isActive
    ? { label: 'Active', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' }
    : { label: 'Inactive', className: 'bg-slate-100 text-slate-600 border border-slate-200' };
}

function routeNumberLabel(route: ApiRoute) {
  return route.routeNumber ?? route.routeCode ?? '-';
}

function isCompanyRoute(route: UiRoute): route is ApiCompanyRoute & { kind: 'company' } {
  return route.kind === 'company';
}

function isPendingStatus(status: ApiRouteApprovalStatus) {
  return status === 'PENDING_APPROVAL' || status === 'PENDING_UPDATE_APPROVAL';
}

function shouldShowRequestApproval(route: ApiCompanyRoute, approval?: ApiRouteApprovalStatusSummary) {
  if (isPendingStatus(route.approvalStatus) || route.approvalStatus === 'APPROVED') {
    return false;
  }

  if (route.approvalStatus === 'DRAFT' || route.approvalStatus === 'UPDATE_REJECTED') {
    return true;
  }

  if (route.approvalStatus === 'PRIVATE_ACTIVE') {
    return true;
  }

  if (approval?.updateApprovalNeeded) {
    return true;
  }

  return !!route.lastApprovedAt && route.approvalStatus !== 'REJECTED';
}

function shouldShowUpdateApprovalNotice(route: ApiCompanyRoute, approval?: ApiRouteApprovalStatusSummary) {
  if (approval?.updateApprovalNeeded) {
    return true;
  }

  if (!route.lastApprovedAt) {
    return false;
  }

  return !isPendingStatus(route.approvalStatus) && route.approvalStatus !== 'APPROVED';
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return 'Not available';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function actorLabel(entry: ApiRouteHistoryEntry) {
  const actor = entry.changedByUser ?? entry.reviewedBy;
  if (!actor) return 'Unknown user';
  return actor.fullName || actor.mobileNumber || 'Unknown user';
}

function historyRejectionReason(entry: ApiRouteHistoryEntry) {
  return entry.snapshotJson?.rejectionReason ?? null;
}

function StopEditor({
  stops,
  onChange,
  placeholder,
}: {
  stops: StopItem[];
  onChange: (stops: StopItem[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState('');
  const [draggedStopId, setDraggedStopId] = useState<string | null>(null);
  const [dragOverStopId, setDragOverStopId] = useState<string | null>(null);

  const add = () => {
    const name = input.trim();
    if (!name) return;
    onChange([...stops, { id: crypto.randomUUID(), locationName: name }]);
    setInput('');
  };

  const remove = (id: string) => onChange(stops.filter((s) => s.id !== id));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= stops.length) return;
    const arr = [...stops];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    onChange(arr);
  };

  const moveById = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const fromIndex = stops.findIndex((stop) => stop.id === fromId);
    const toIndex = stops.findIndex((stop) => stop.id === toId);
    if (fromIndex === -1 || toIndex === -1) return;
    move(fromIndex, toIndex);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
        />
        <button
          type="button"
          onClick={add}
          disabled={!input.trim()}
          className="px-3.5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {stops.length > 0 && (
        <div className="space-y-1.5">
          {stops.map((stop, idx) => (
            <div
              key={stop.id}
              draggable
              onDragStart={(event) => {
                setDraggedStopId(stop.id);
                setDragOverStopId(stop.id);
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', stop.id);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                if (draggedStopId && draggedStopId !== stop.id) {
                  setDragOverStopId(stop.id);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                const sourceId = draggedStopId ?? event.dataTransfer.getData('text/plain');
                if (sourceId) {
                  moveById(sourceId, stop.id);
                }
                setDraggedStopId(null);
                setDragOverStopId(null);
              }}
              onDragEnd={() => {
                setDraggedStopId(null);
                setDragOverStopId(null);
              }}
              className={`flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border transition-colors ${
                dragOverStopId === stop.id && draggedStopId !== stop.id
                  ? 'border-amber-300 bg-amber-50'
                  : 'border-slate-100'
              }`}
            >
              <span className="flex items-center justify-center text-slate-400 cursor-grab active:cursor-grabbing" title="Drag to reorder">
                <GripVertical className="w-4 h-4" />
              </span>
              <span className="text-xs w-5 text-slate-500 text-center">{idx + 1}</span>
              <span className="text-sm text-slate-700 flex-1">{stop.locationName}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(idx, idx - 1)}
                  disabled={idx === 0}
                  className="px-2 py-1 text-xs text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, idx + 1)}
                  disabled={idx === stops.length - 1}
                  className="px-2 py-1 text-xs text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  ↓
                </button>
                <button type="button" onClick={() => remove(stop.id)} className="px-2 py-1 text-xs border border-red-200 text-red-600 rounded-lg">×</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {stops.length > 1 && (
        <p className="text-xs text-slate-500">Drag rows with the handle to reorder stops.</p>
      )}
    </div>
  );
}

function RouteFormModal({
  state,
  onClose,
  onSave,
}: {
  state: ModalState;
  onClose: () => void;
  onSave: (data: FormData, id?: string) => Promise<void>;
}) {
  const [form, setForm] = useState<FormData>(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (state.mode === 'closed') return;
    if (state.mode === 'edit') {
      setForm({
        routeNumber: state.route.routeNumber ?? state.route.routeCode ?? '',
        routeName: state.route.routeName,
        startLocation: state.route.startLocation,
        endLocation: state.route.endLocation,
        distanceKm: state.route.distanceKm != null ? String(state.route.distanceKm) : '',
        description: state.route.description ?? '',
        upStops: state.route.upStops.map((s) => ({ id: s.id, locationName: s.locationName })),
        downIsReverseOfUp: state.route.downIsReverseOfUp,
        downStops: state.route.downStops.map((s) => ({ id: s.id, locationName: s.locationName })),
      });
    } else {
      setForm(emptyForm());
    }
    setFormError(null);
  }, [state]);

  if (state.mode === 'closed') return null;

  const isEdit = state.mode === 'edit';

  const validate = () => {
    if (!form.routeNumber.trim()) return 'Route number is required';
    if (!form.routeName.trim()) return 'Route name is required';
    if (!form.startLocation.trim()) return 'Start location is required';
    if (!form.endLocation.trim()) return 'End location is required';
    if (form.distanceKm.trim()) {
      const n = Number(form.distanceKm);
      if (!Number.isFinite(n) || n < 0) return 'Distance must be a non-negative number';
    }
    return null;
  };

  const setField = (key: keyof FormData, value: string | StopItem[] | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await onSave(form, isEdit ? state.route.id : undefined);
      onClose();
    } catch (error: any) {
      setFormError(error?.message ?? 'Failed to save route');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl mb-10">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Company Route' : 'New Company Route'}</h2>
            <p className="text-sm text-slate-500 mt-1">Create company route definitions with up/down direction stops.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          {formError && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4" /> {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Route Number *</label>
              <input
                value={form.routeNumber}
                onChange={(e) => setField('routeNumber', e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                placeholder="e.g. 87/1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Route Name *</label>
              <input
                value={form.routeName}
                onChange={(e) => setField('routeName', e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                placeholder="e.g. Chilaw - Colombo"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Start Location *</label>
              <input
                value={form.startLocation}
                onChange={(e) => setField('startLocation', e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">End Location *</label>
              <input
                value={form.endLocation}
                onChange={(e) => setField('endLocation', e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Distance (km)</label>
              <input
                value={form.distanceKm}
                onChange={(e) => setField('distanceKm', e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                placeholder="optional"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Description</label>
              <input
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                placeholder="optional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">Up Direction Stops</p>
              <span className="text-xs text-slate-400">Ordered intermediate stops</span>
            </div>
            <StopEditor
              stops={form.upStops}
              onChange={(stops) => setField('upStops', stops)}
              placeholder="Add up-direction stop"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setField('downIsReverseOfUp', true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  form.downIsReverseOfUp
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                Use reverse of up route
              </button>
              <button
                type="button"
                onClick={() => setField('downIsReverseOfUp', false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  !form.downIsReverseOfUp
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                Customize down route
              </button>
            </div>

            {!form.downIsReverseOfUp && (
              <StopEditor
                stops={form.downStops}
                onChange={(stops) => setField('downStops', stops)}
                placeholder="Add down-direction stop"
              />
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-medium disabled:opacity-60 flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Save Route' : 'Create Route'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const RouteMaster: React.FC = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [globalRoutes, setGlobalRoutes] = useState<ApiGlobalRoute[]>([]);
  const [companyRoutes, setCompanyRoutes] = useState<ApiCompanyRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' });
  const [submitLoadingId, setSubmitLoadingId] = useState<string | null>(null);
  const [panelState, setPanelState] = useState<Record<string, RoutePanelState>>({});

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const [globalRes, companyRes] = await Promise.all([
        listGlobalRoutes(token),
        listCompanyRoutes(token),
      ]);
      setGlobalRoutes(globalRes.routes);
      setCompanyRoutes(companyRes.routes);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load routes');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const mergedRoutes = useMemo<UiRoute[]>(() => {
    const globals = globalRoutes.map((r) => ({ ...r, kind: 'global' as const }));
    const companies = companyRoutes.map((r) => ({ ...r, kind: 'company' as const }));
    return [...globals, ...companies];
  }, [globalRoutes, companyRoutes]);

  const filteredRoutes = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return mergedRoutes;

    return mergedRoutes.filter((route) => {
      const routeNo = routeNumberLabel(route).toLowerCase();
      return (
        routeNo.includes(q) ||
        route.routeName.toLowerCase().includes(q) ||
        route.startLocation.toLowerCase().includes(q) ||
        route.endLocation.toLowerCase().includes(q)
      );
    });
  }, [mergedRoutes, searchTerm]);

  const updateCompanyRouteState = useCallback((route: ApiCompanyRoute) => {
    setCompanyRoutes((prev) => prev.map((item) => (item.id === route.id ? route : item)));
    setPanelState((prev) => ({
      ...prev,
      [route.id]: {
        ...prev[route.id],
        detail: route,
        approval: prev[route.id]?.approval
          ? {
              ...prev[route.id].approval,
              approvalStatus: route.approvalStatus,
              rejectionReason: route.rejectionReason,
              globalRouteId: route.globalRouteId ?? null,
              lastApprovedAt: route.lastApprovedAt ?? null,
              lastSubmittedAt: route.lastSubmittedAt ?? null,
            }
          : prev[route.id]?.approval,
      },
    }));
  }, []);

  const loadCompanyRoutePanel = useCallback(
    async (routeId: string) => {
      if (!token) return;

      setPanelState((prev) => ({
        ...prev,
        [routeId]: {
          detail: prev[routeId]?.detail,
          approval: prev[routeId]?.approval,
          history: prev[routeId]?.history,
          loading: true,
          error: null,
        },
      }));

      try {
        const [detailRes, approvalRes, historyRes] = await Promise.all([
          getCompanyRoute(token, routeId),
          getCompanyRouteApprovalStatus(token, routeId),
          getCompanyRouteHistory(token, routeId),
        ]);

        setCompanyRoutes((prev) => prev.map((item) => (item.id === routeId ? detailRes.route : item)));
        setPanelState((prev) => ({
          ...prev,
          [routeId]: {
            detail: detailRes.route,
            approval: approvalRes,
            history: historyRes.history,
            loading: false,
            error: null,
          },
        }));
      } catch (err: any) {
        setPanelState((prev) => ({
          ...prev,
          [routeId]: {
            detail: prev[routeId]?.detail,
            approval: prev[routeId]?.approval,
            history: prev[routeId]?.history,
            loading: false,
            error: err?.message ?? 'Failed to load route details',
          },
        }));
      }
    },
    [token],
  );

  const handleExpandToggle = useCallback(
    (route: UiRoute) => {
      const nextExpanded = expandedRoute === route.id ? null : route.id;
      setExpandedRoute(nextExpanded);

      if (nextExpanded && isCompanyRoute(route)) {
        void loadCompanyRoutePanel(route.id);
      }
    },
    [expandedRoute, loadCompanyRoutePanel],
  );

  const handleSave = async (form: FormData, id?: string) => {
    if (!token) return;

    const payload = {
      routeNumber: form.routeNumber.trim(),
      routeName: form.routeName.trim(),
      startLocation: form.startLocation.trim(),
      endLocation: form.endLocation.trim(),
      ...(form.distanceKm.trim() ? { distanceKm: Number(form.distanceKm) } : {}),
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
      upStops: form.upStops.map((s) => ({ locationName: s.locationName })),
      downIsReverseOfUp: form.downIsReverseOfUp,
      ...(form.downIsReverseOfUp
        ? {}
        : { downStops: form.downStops.map((s) => ({ locationName: s.locationName })) }),
    };

    try {
      if (id) {
        const res = await updateCompanyRoute(token, id, payload);
        updateCompanyRouteState(res.route);
        await loadCompanyRoutePanel(id);
        toast({ title: 'Route updated', description: 'Company route saved successfully.' });
      } else {
        const res = await createCompanyRoute(token, payload);
        setCompanyRoutes((prev) => [res.route, ...prev]);
        toast({ title: 'Route created', description: 'Company route created for your company.' });
      }
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : 'Failed to save route';
      toast({ title: 'Save failed', description: message, variant: 'destructive' });
      throw err;
    }
  };

  const handleSubmitForApproval = async (route: ApiCompanyRoute) => {
    if (!token) return;
    setSubmitLoadingId(route.id);
    try {
      const res = await submitCompanyRouteForApproval(token, route.id);
      updateCompanyRouteState(res.route);
      await loadCompanyRoutePanel(route.id);
      toast({ title: 'Submitted', description: 'Route submitted for admin approval.' });
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : 'Submission failed';
      toast({ title: 'Submission failed', description: message, variant: 'destructive' });
    } finally {
      setSubmitLoadingId(null);
    }
  };

  const companyRouteCount = companyRoutes.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Route Master</h1>
          <p className="text-slate-500 mt-1">
            {mergedRoutes.length} routes available ({globalRoutes.length} global, {companyRouteCount} company)
          </p>
        </div>
        <button
          onClick={() => setModal({ mode: 'create' })}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-amber-500/25 transition-all"
        >
          <Plus className="w-4 h-4" /> New Company Route
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search routes by name, number, or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading routes...
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
          <button onClick={load} className="ml-auto underline text-xs">Retry</button>
        </div>
      )}

      {!loading && !error && filteredRoutes.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-slate-500">
            {searchTerm ? 'No routes match your search' : 'No routes available yet'}
          </p>
        </div>
      )}

      {!loading && !error && filteredRoutes.length > 0 && (
        <div className="space-y-3">
          {filteredRoutes.map((route) => {
            const isExpanded = expandedRoute === route.id;
            const statusBadge = getStatusBadge(route.approvalStatus);
            const scopeBadge = getScopeBadge(route);
            const activeBadge = getActiveBadge(route);
            const panel = panelState[route.id];
            const detail = isCompanyRoute(route) ? panel?.detail ?? route : route;
            const approval = isCompanyRoute(route) ? panel?.approval : undefined;
            const upStops = detail.upStops;
            const downStops = detail.downIsReverseOfUp ? [...upStops].reverse() : detail.downStops;
            const canEdit = isCompanyRoute(route) && !isPendingStatus(detail.approvalStatus);
            const canRequestApproval =
              isCompanyRoute(route) && shouldShowRequestApproval(detail, approval);
            const showUpdateApprovalNotice =
              isCompanyRoute(route) && shouldShowUpdateApprovalNotice(detail, approval);

            return (
              <div key={route.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div
                  className="p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => handleExpandToggle(route)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 px-1">
                        <span className="text-white font-bold text-sm text-center leading-tight">{routeNumberLabel(route)}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900 truncate">{route.routeName}</h3>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${scopeBadge.className}`}>
                            {scopeBadge.label}
                          </span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${statusBadge.className}`}>
                            {statusBadge.label}
                          </span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${activeBadge.className}`}>
                            {activeBadge.label}
                          </span>
                          {route.globalRouteId && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
                              Linked to Global
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1 flex-wrap">
                          <MapPin className="w-3 h-3" />
                          <span>{route.startLocation}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span>{route.endLocation}</span>
                          {route.distanceKm != null && (
                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full ml-2">{route.distanceKm} km</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <span className="text-sm text-slate-400">{upStops.length} up stops</span>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 space-y-4">
                    {panel?.loading && isCompanyRoute(route) && (
                      <div className="flex items-center text-sm text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading route details...
                      </div>
                    )}

                    {panel?.error && isCompanyRoute(route) && (
                      <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{panel.error}</span>
                        <button
                          type="button"
                          onClick={() => void loadCompanyRoutePanel(route.id)}
                          className="ml-auto underline text-xs"
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {showUpdateApprovalNotice && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        <div className="font-medium">Update approval needed</div>
                        <div className="mt-1 text-amber-700">
                          This route has changed since its last approved version and should be submitted for review again.
                        </div>
                      </div>
                    )}

                    {isPendingStatus(detail.approvalStatus) && (
                      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                        This route is waiting for admin review.
                      </div>
                    )}

                    {detail.description && <p className="text-sm text-slate-600">{detail.description}</p>}

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                      <div className="rounded-xl border border-slate-100 p-4 space-y-2 xl:col-span-1">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Route Info</p>
                        <div className="text-sm text-slate-700 space-y-2">
                          <div><span className="text-slate-500">Number:</span> {routeNumberLabel(detail)}</div>
                          <div><span className="text-slate-500">Approval:</span> {getStatusBadge(detail.approvalStatus).label}</div>
                          <div><span className="text-slate-500">Scope:</span> {scopeBadge.label}</div>
                          <div><span className="text-slate-500">Status:</span> {detail.isActive ? 'Active' : 'Inactive'}</div>
                          <div><span className="text-slate-500">Last approved:</span> {formatDateTime(approval?.lastApprovedAt ?? detail.lastApprovedAt)}</div>
                          {approval?.latestApprovedVersion && (
                            <div>
                              <span className="text-slate-500">Latest approved version:</span>{' '}
                              v{approval.latestApprovedVersion.versionNumber} on {formatDateTime(approval.latestApprovedVersion.createdAt)}
                            </div>
                          )}
                          {detail.globalRouteId && (
                            <div className="flex items-start gap-2">
                              <Link2 className="w-4 h-4 text-cyan-600 mt-0.5 shrink-0" />
                              <div>
                                <div className="text-slate-500">Linked global route</div>
                                <div className="font-medium text-slate-800">
                                  {detail.globalRoute?.routeNumber ?? detail.globalRoute?.routeCode ?? 'Linked route'}
                                  {detail.globalRoute?.routeName ? ` - ${detail.globalRoute.routeName}` : ''}
                                </div>
                              </div>
                            </div>
                          )}
                          {detail.rejectionReason && (
                            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-red-700">
                              <span className="font-medium">Rejection reason:</span> {detail.rejectionReason}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-100 p-4 xl:col-span-1">
                        <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Up Direction</p>
                        <div className="space-y-1.5">
                          {upStops.length === 0 && <p className="text-sm text-slate-400">No intermediate stops</p>}
                          {upStops.map((stop) => (
                            <div key={stop.id} className="text-sm text-slate-700">{stop.sequence}. {stop.locationName}</div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-100 p-4 xl:col-span-1">
                        <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Down Direction</p>
                        <div className="space-y-1.5">
                          {downStops.length === 0 && <p className="text-sm text-slate-400">No intermediate stops</p>}
                          {downStops.map((stop, index) => (
                            <div key={`${stop.id}-${index}`} className="text-sm text-slate-700">{index + 1}. {stop.locationName}</div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {isCompanyRoute(route) && (
                      <div className="flex flex-wrap gap-2">
                        {canEdit && (
                          <button
                            onClick={() => setModal({ mode: 'edit', route: detail })}
                            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                        )}
                        {canRequestApproval && (
                          <button
                            onClick={() => handleSubmitForApproval(detail)}
                            disabled={submitLoadingId === route.id}
                            className="inline-flex items-center gap-1.5 px-3 py-2 border border-amber-200 bg-amber-50 rounded-lg text-sm text-amber-700 hover:bg-amber-100 disabled:opacity-60"
                          >
                            {submitLoadingId === route.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Upload className="w-3.5 h-3.5" />
                            )}
                            Request Approval
                          </button>
                        )}
                        {!canRequestApproval && isPendingStatus(detail.approvalStatus) && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-2 border border-blue-200 bg-blue-50 rounded-lg text-sm text-blue-700">
                            Waiting for Review
                          </div>
                        )}
                      </div>
                    )}

                    <div className="rounded-xl border border-slate-100 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <History className="w-4 h-4 text-slate-500" />
                        <p className="text-sm font-semibold text-slate-800">Route History</p>
                      </div>

                      {route.kind === 'global' ? (
                        <p className="text-sm text-slate-400">History is available for company routes only in this dashboard.</p>
                      ) : panel?.loading && !panel?.history ? (
                        <div className="flex items-center text-sm text-slate-400">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading history...
                        </div>
                      ) : panel?.history && panel.history.length > 0 ? (
                        <div className="space-y-3">
                          {panel.history.map((entry) => {
                            const badge = getStatusBadge(entry.approvalStatus);
                            const rejectionReason = historyRejectionReason(entry);
                            return (
                              <div key={entry.id} className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium text-slate-900">{entry.actionType.replaceAll('_', ' ')}</span>
                                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${badge.className}`}>
                                      {badge.label}
                                    </span>
                                  </div>
                                  <span className="text-xs text-slate-500">{formatDateTime(entry.createdAt)}</span>
                                </div>
                                <div className="mt-2 text-sm text-slate-600">
                                  Changed by: {actorLabel(entry)}
                                </div>
                                {rejectionReason && (
                                  <div className="mt-2 text-sm text-red-700">Rejection reason: {rejectionReason}</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">No history entries yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <RouteFormModal
        state={modal}
        onClose={() => setModal({ mode: 'closed' })}
        onSave={handleSave}
      />
    </div>
  );
};

export default RouteMaster;