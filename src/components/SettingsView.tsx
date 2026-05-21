import React, { useEffect, useState } from 'react';
import { Settings, Building2, Bell, Shield, Globe, Save, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { updateMyCompany } from '@/lib/companyApi';
import { getWageDefaults, updateWageDefaults } from '@/lib/settingsApi';
import { ApiError } from '@/lib/api';
import { FormFieldsSkeleton, SettingsPageSkeleton } from './PageSkeletons';

const SettingsView: React.FC = () => {
  const { user, token } = useAuth();
  const { company, setCompany, isLoadingCompany } = useCompany();
  const [activeTab, setActiveTab] = useState('company');
  const [saved, setSaved] = useState(false);
  const [isSavingCompany, setIsSavingCompany] = useState(false);

  const [companyForm, setCompanyForm] = useState({
    name: '',
    address: '',
    phone: '',
    registrationNo: '',
  });

  useEffect(() => {
    if (company) {
      setCompanyForm({
        name: company.name,
        address: company.address ?? '',
        phone: company.mobileNumber ?? '',
        registrationNo: '',
      });
    }
  }, [company]);

  const [wageDefaults, setWageDefaults] = useState({
    defaultDriverPercentage: 12,
    defaultConductorPercentage: 8,
    defaultFixedDriverWage: 4500,
    defaultFixedConductorWage: 3500,
    maxPercentageWarning: 50,
  });
  const [wageLoading, setWageLoading] = useState(false);
  const [isSavingWages, setIsSavingWages] = useState(false);
  const [wageSaved, setWageSaved] = useState(false);
  const [applyToBuses, setApplyToBuses] = useState(false);
  const [overwriteAll, setOverwriteAll] = useState(false);

  // Load wage defaults from backend when the wages tab is first selected
  useEffect(() => {
    if (activeTab !== 'wages' || !token) return;
    setWageLoading(true);
    getWageDefaults(token)
      .then(data => {
        setWageDefaults({
          defaultDriverPercentage: data.defaultDriverPercentage ?? 12,
          defaultConductorPercentage: data.defaultConductorPercentage ?? 8,
          defaultFixedDriverWage: data.defaultFixedDriverWage ?? 4500,
          defaultFixedConductorWage: data.defaultFixedConductorWage ?? 3500,
          maxPercentageWarning: data.maxCombinedPercentageWarning ?? 50,
        });
      })
      .catch(() => { /* keep defaults on error */ })
      .finally(() => setWageLoading(false));
  }, [activeTab, token]);

  const handleSaveWages = async () => {
    if (!token) return;
    setIsSavingWages(true);
    try {
      const res = await updateWageDefaults(token, {
        defaultDriverPercentage: wageDefaults.defaultDriverPercentage,
        defaultConductorPercentage: wageDefaults.defaultConductorPercentage,
        defaultFixedDriverWage: wageDefaults.defaultFixedDriverWage,
        defaultFixedConductorWage: wageDefaults.defaultFixedConductorWage,
        maxCombinedPercentageWarning: wageDefaults.maxPercentageWarning,
        applyToBuses,
        overwriteAll: applyToBuses ? overwriteAll : undefined,
      });
      setWageSaved(true);
      const busMsg = res.busesUpdated != null
        ? ` ${res.busesUpdated} bus${res.busesUpdated !== 1 ? 'es' : ''} updated.`
        : '';
      toast({ title: 'Wage Defaults Saved', description: `Default wage settings have been updated.${busMsg}` });
      setTimeout(() => setWageSaved(false), 2000);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to save wage defaults';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setIsSavingWages(false);
    }
  };

  const handleSave = () => {
    setSaved(true);
    toast({ title: 'Settings Saved', description: 'Your settings have been updated successfully.' });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveCompany = async () => {
    if (!token) return;
    setIsSavingCompany(true);
    try {
      const res = await updateMyCompany(token, {
        name: companyForm.name,
        mobileNumber: companyForm.phone || undefined,
        address: companyForm.address || undefined,
      });
      setCompany(res.company);
      setSaved(true);
      toast({ title: 'Company Updated', description: 'Company profile saved successfully.' });
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to save company profile';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setIsSavingCompany(false);
    }
  };

  const tabs = [
    { id: 'company', label: 'Company Profile', icon: Building2 },
    { id: 'wages', label: 'Wage Defaults', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'language', label: 'Language', icon: Globe },
  ];

  if (isLoadingCompany) {
    return <SettingsPageSkeleton showHeader={true} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your company profile and app preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-56 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          {activeTab === 'company' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-slate-900">Company Profile</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                  <input value={companyForm.name} onChange={e => setCompanyForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input value={companyForm.phone} onChange={e => setCompanyForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <input value={companyForm.address} onChange={e => setCompanyForm(p => ({ ...p, address: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Registration Number</label>
                  <input value={companyForm.registrationNo} onChange={e => setCompanyForm(p => ({ ...p, registrationNo: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                </div>
              </div>
              <button onClick={handleSaveCompany} disabled={isSavingCompany}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all disabled:opacity-60">
                {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {isSavingCompany ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          )}

          {activeTab === 'wages' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-slate-900">Default Wage Settings</h2>
              <p className="text-sm text-slate-500">These defaults apply when creating new buses. Individual bus settings can override these.</p>
              {wageLoading ? (
                <FormFieldsSkeleton rows={5} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Default Driver %</label>
                    <input type="number" value={wageDefaults.defaultDriverPercentage}
                      onChange={e => setWageDefaults(p => ({ ...p, defaultDriverPercentage: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Default Conductor %</label>
                    <input type="number" value={wageDefaults.defaultConductorPercentage}
                      onChange={e => setWageDefaults(p => ({ ...p, defaultConductorPercentage: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Default Fixed Driver Wage (Rs.)</label>
                    <input type="number" value={wageDefaults.defaultFixedDriverWage}
                      onChange={e => setWageDefaults(p => ({ ...p, defaultFixedDriverWage: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Default Fixed Conductor Wage (Rs.)</label>
                    <input type="number" value={wageDefaults.defaultFixedConductorWage}
                      onChange={e => setWageDefaults(p => ({ ...p, defaultFixedConductorWage: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Max Combined Percentage Warning (%)</label>
                    <input type="number" value={wageDefaults.maxPercentageWarning}
                      onChange={e => setWageDefaults(p => ({ ...p, maxPercentageWarning: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                    <p className="text-xs text-slate-400 mt-1">System will warn if driver% + conductor% exceeds this value</p>
                  </div>
                </div>
              )}
              {/* Apply-to-buses options */}
              <div className="border-t border-slate-100 pt-4 space-y-2.5">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={applyToBuses}
                    onChange={e => { setApplyToBuses(e.target.checked); if (!e.target.checked) setOverwriteAll(false); }}
                    className="w-4 h-4 rounded border-slate-300 text-amber-500 accent-amber-500"
                  />
                  <span className="text-sm text-slate-700">Apply these defaults to buses</span>
                </label>
                {applyToBuses && (
                  <label className="flex items-center gap-3 cursor-pointer select-none ml-7">
                    <input
                      type="checkbox"
                      checked={overwriteAll}
                      onChange={e => setOverwriteAll(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-amber-500 accent-amber-500"
                    />
                    <span className="text-sm text-slate-600">Overwrite buses that already have wage settings</span>
                  </label>
                )}
                {applyToBuses && !overwriteAll && (
                  <p className="text-xs text-slate-400 ml-7">Only buses with no wage info configured will be updated.</p>
                )}
              </div>
              <button onClick={handleSaveWages} disabled={isSavingWages}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all disabled:opacity-60">
                {isSavingWages ? <Loader2 className="w-4 h-4 animate-spin" /> : wageSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {isSavingWages ? 'Saving…' : wageSaved ? 'Saved!' : 'Save Defaults'}
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-slate-900">Notification Preferences</h2>
              {[
                { label: 'Trip completion alerts', desc: 'Get notified when a trip is completed', default: true },
                { label: 'Daily settlement reminders', desc: 'Reminder to settle accounts at end of day', default: true },
                { label: 'Permit expiry warnings', desc: 'Alerts 60, 30, and 7 days before permit expiry', default: true },
                { label: 'Insurance expiry warnings', desc: 'Alerts before insurance renewal date', default: true },
                { label: 'Expense anomaly alerts', desc: 'Flag unusual expense patterns', default: false },
                { label: 'Weekly summary report', desc: 'Receive weekly fleet performance summary', default: true },
              ].map((pref, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{pref.label}</p>
                    <p className="text-xs text-slate-500">{pref.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={pref.default} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-slate-900">Security Settings</h2>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm font-medium text-slate-900">Current User</p>
                <p className="text-sm text-slate-600 mt-1">{user?.fullName ?? '—'} (Owner)</p>
                <p className="text-sm text-slate-600">Phone: {user?.mobileNumber ?? '—'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm font-medium text-slate-900">Settlement Lock Policy</p>
                <p className="text-xs text-slate-500 mt-1">Only owners can unlock locked settlements. All unlock actions are logged in the audit trail.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm font-medium text-slate-900">Data Export</p>
                <p className="text-xs text-slate-500 mt-1">Export all your data as CSV or PDF for record-keeping and compliance.</p>
                <button className="mt-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                  Export All Data
                </button>
              </div>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-slate-900">Language Settings</h2>
              <p className="text-sm text-slate-500">Select your preferred language. Multi-language support coming in Phase 2.</p>
              <div className="space-y-2">
                {[
                  { code: 'en', name: 'English', available: true },
                  { code: 'si', name: 'සිංහල (Sinhala)', available: false },
                  { code: 'ta', name: 'தமிழ் (Tamil)', available: false },
                ].map(lang => (
                  <div key={lang.code} className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                    lang.code === 'en' ? 'border-amber-500 bg-amber-50' : 'border-slate-100 bg-slate-50'
                  }`}>
                    <span className="text-sm font-medium text-slate-900">{lang.name}</span>
                    {lang.available ? (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Active</span>
                    ) : (
                      <span className="text-xs text-slate-400">Coming Soon</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
