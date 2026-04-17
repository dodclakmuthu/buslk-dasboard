import React, { useState } from 'react';
import {
  FileText, ChevronDown, ChevronUp, Shield, Users, Layers, Workflow,
  Calculator, AlertTriangle, BarChart3, Smartphone, Globe, Database,
  Server, DollarSign, Rocket, Lock, Package, CheckCircle2
} from 'lucide-react';

type Section = {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
};

const Blueprint: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');

  const sections: Section[] = [
    {
      id: 'overview',
      title: '1. Product Overview',
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Problem Statement</h4>
            <p>Private bus operators in Sri Lanka face critical challenges in daily financial management. Manual income tracking leads to errors, disputes, and lack of visibility. Complex wage calculations (percentage vs. fixed) done manually at day-end cause delays and mistrust. No centralized expense tracking results in lost receipts and unclear profitability.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Why This Product Matters</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Private buses are the backbone of Sri Lankan public transport, serving millions daily</li>
              <li>Enables fair wage distribution and clear profit visibility</li>
              <li>Reduces end-of-day settlement time from hours to minutes</li>
              <li>Provides data-driven insights for route optimization and fleet expansion</li>
              <li>Prepares operators for future digital ticketing integration</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-2">User Segments</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="font-bold text-blue-800">Single-Bus Owners (60%)</p>
                <p className="text-xs text-blue-600 mt-1">Owner-driver or owner with hired crew. Daily cash operations.</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <p className="font-bold text-purple-800">Small-Medium Fleet (30%)</p>
                <p className="text-xs text-purple-600 mt-1">2-20 buses. Mix of routes. Need consolidated reports.</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="font-bold text-amber-800">Large Companies (10%)</p>
                <p className="text-xs text-amber-600 mt-1">20+ buses. Hierarchical management. Advanced analytics.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'roles',
      title: '2. User Roles & Permissions',
      icon: <Shield className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Permission</th>
                  <th className="text-center px-4 py-2 text-xs font-semibold text-amber-600">Owner</th>
                  <th className="text-center px-4 py-2 text-xs font-semibold text-purple-600">Manager</th>
                  <th className="text-center px-4 py-2 text-xs font-semibold text-blue-600">Driver</th>
                  <th className="text-center px-4 py-2 text-xs font-semibold text-emerald-600">Conductor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  ['Add/Edit Buses', true, false, false, false],
                  ['Add Staff', true, false, false, false],
                  ['Assign Crew', true, true, false, false],
                  ['Start/End Trips', true, true, true, true],
                  ['Enter Income', true, true, true, true],
                  ['Add Expenses', true, true, true, true],
                  ['View All Bus Data', true, true, false, false],
                  ['Lock Settlements', true, true, false, false],
                  ['View Reports', true, true, false, false],
                  ['Edit After Lock', true, false, false, false],
                  ['Manage Subscriptions', true, false, false, false],
                ].map(([perm, ...roles], idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-slate-700">{perm as string}</td>
                    {(roles as boolean[]).map((has, i) => (
                      <td key={i} className="text-center px-4 py-2">
                        {has ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-slate-300">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      id: 'modules',
      title: '3. Core Modules',
      icon: <Layers className="w-5 h-5" />,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          {[
            { name: 'Authentication & Signup', desc: 'Phone OTP-based auth, role selection, company creation' },
            { name: 'Company/Owner Profile', desc: 'Business details, registration, multi-bus setup' },
            { name: 'Bus Management', desc: 'Register buses, assign routes, set wage models, track documents' },
            { name: 'Route Management', desc: 'Predefined Sri Lankan routes with stops, custom route support' },
            { name: 'Staff Management', desc: 'Add drivers, conductors, managers with NIC and license tracking' },
            { name: 'Crew Assignment', desc: 'Daily driver-conductor-bus assignment with scheduling' },
            { name: 'Trip Management', desc: 'Start/end trips, select route points, track per-trip data' },
            { name: 'Income Entry', desc: 'Manual cash entry per trip, future digital ticketing support' },
            { name: 'Expense Entry', desc: 'Categorized expenses: diesel, expressway, runner, meals, repairs' },
            { name: 'Wage Calculation Engine', desc: 'Percentage-based DTI or fixed daily wage computation' },
            { name: 'Daily Settlement', desc: 'Finalize daily accounts, lock settlements, audit trail' },
            { name: 'Reporting & Analytics', desc: 'Income, expense, profit, salary, route-wise reports' },
            { name: 'Notifications & Reminders', desc: 'Permit expiry, insurance alerts, trip completion notices' },
            { name: 'Audit Logs', desc: 'Track all changes, edits, and settlements for transparency' },
          ].map((mod, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="font-bold text-slate-900">{mod.name}</p>
              <p className="text-xs text-slate-500 mt-1">{mod.desc}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'mvp',
      title: '4. MVP Feature List',
      icon: <Package className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <h4 className="font-bold text-emerald-800 mb-2">Must-Have MVP (Month 1-3)</h4>
            <ul className="space-y-1 text-emerald-700">
              {['Phone OTP signup & login', 'Bus registration with route assignment', 'Staff (driver/conductor) management', 'Daily crew assignment', 'Trip start/end with income entry', 'Expense entry (categorized)', 'Percentage & fixed wage calculation', 'Daily settlement with lock', 'Basic daily reports per bus', 'Permit/insurance expiry alerts'].map((item, i) => (
                <li key={i} className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 flex-shrink-0" />{item}</li>
              ))}
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h4 className="font-bold text-blue-800 mb-2">Nice-to-Have Phase 2 (Month 4-6)</h4>
            <ul className="space-y-1 text-blue-700">
              {['Offline-first with sync', 'Photo proof for fuel bills', 'GPS trip tracking', 'Monthly/weekly reports', 'Multi-language (Sinhala, Tamil)', 'Manager role with delegation', 'Crew performance metrics', 'Expense approval workflow'].map((item, i) => (
                <li key={i} className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 flex-shrink-0" />{item}</li>
              ))}
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <h4 className="font-bold text-purple-800 mb-2">Advanced Phase 3 (Month 7-12)</h4>
            <ul className="space-y-1 text-purple-700">
              {['Digital ticketing integration', 'Card payment reconciliation', 'Route optimization analytics', 'Predictive maintenance alerts', 'Multi-company support', 'API for third-party integration', 'White-label for large operators', 'NTC compliance reporting'].map((item, i) => (
                <li key={i} className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 flex-shrink-0" />{item}</li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'calculations',
      title: '5. Business Rules & Calculation Engine',
      icon: <Calculator className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-sm text-slate-700">
          <div className="bg-slate-900 text-slate-100 rounded-xl p-5 font-mono text-xs leading-relaxed">
            <p className="text-amber-400 font-bold mb-2">// Percentage-Based Wage Model</p>
            <p>Total Trip Income = SUM(trip_incomes for the day)</p>
            <p>Total Expenses = SUM(diesel + expressway + runner + parking + meals + repairs + other)</p>
            <p className="text-emerald-400 font-bold mt-2">DTI = Total Trip Income - Total Expenses</p>
            <p className="mt-2">Driver Salary = DTI × (Driver Percentage / 100)</p>
            <p>Conductor Salary = DTI × (Conductor Percentage / 100)</p>
            <p className="text-amber-400 font-bold mt-2">Owner Net Profit = DTI - Driver Salary - Conductor Salary</p>
            <p className="text-slate-500 mt-3">// Fixed Daily Wage Model</p>
            <p>Driver Salary = Fixed Daily Amount (e.g., Rs. 4,500)</p>
            <p>Conductor Salary = Fixed Daily Amount (e.g., Rs. 3,500)</p>
            <p className="text-amber-400 font-bold mt-2">Owner Net Profit = DTI - Fixed Driver Wage - Fixed Conductor Wage</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <h4 className="font-bold text-amber-800 mb-2">Edge Case Handling</h4>
            <ul className="space-y-1 text-amber-700 text-xs">
              <li>If DTI is negative → Percentage-based salaries become Rs. 0 (no negative salary)</li>
              <li>If DTI is negative → Fixed salaries still apply (owner absorbs loss)</li>
              <li>If combined salary percentage exceeds 50% → System warns owner</li>
              <li>Settlement locked → No edits without owner override + audit log</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'edge-cases',
      title: '6. Edge Cases',
      icon: <AlertTriangle className="w-5 h-5" />,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            { case: 'Conductor forgets to end trip', handling: 'Auto-reminder after 6 hours. Manager can force-close with notes.' },
            { case: 'Multiple conductors in one day', handling: 'Each trip records its own crew. Settlement splits by trip assignment.' },
            { case: 'Driver change mid-day', handling: 'New assignment created. Each trip tracks its own driver independently.' },
            { case: 'Trip started offline', handling: 'Local storage queues trip data. Syncs when connectivity returns.' },
            { case: 'Owner edits income after settlement', handling: 'Requires unlock → edit → re-lock. Full audit trail recorded.' },
            { case: 'Fuel entered twice', handling: 'Duplicate detection by amount+time window. Warning shown to user.' },
            { case: 'Bus assigned to wrong route', handling: 'Owner can reassign route. Active trips on old route complete normally.' },
            { case: 'Negative DTI', handling: 'Percentage wages = 0. Fixed wages still paid. Owner sees loss clearly.' },
            { case: 'Cancelled trip', handling: 'Trip marked cancelled. Income = 0. Linked expenses remain in daily total.' },
            { case: 'Bus breakdown mid-route', handling: 'Trip ended as partial. Notes field captures reason. Expenses still tracked.' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-red-50 rounded-xl border border-red-100">
              <p className="font-bold text-red-800 text-xs">{item.case}</p>
              <p className="text-xs text-red-600 mt-1">{item.handling}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'database',
      title: '7. Database Design (ER)',
      icon: <Database className="w-5 h-5" />,
      content: (
        <div className="bg-slate-900 text-slate-100 rounded-xl p-5 font-mono text-xs leading-relaxed overflow-x-auto">
          <pre>{`
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   companies  │     │    users     │     │    buses     │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)      │◄────│ company_id   │     │ id (PK)      │
│ name         │     │ id (PK)      │◄────│ owner_id (FK)│
│ owner_id(FK) │     │ name         │     │ company_id   │
│ address      │     │ phone        │     │ reg_number   │
│ reg_no       │     │ role         │     │ ntc_permit   │
└──────────────┘     │ nic          │     │ route_id(FK) │
                     │ license_no   │     │ service_type │
                     │ is_active    │     │ seat_count   │
                     └──────────────┘     │ wage_model   │
                                          │ driver_%     │
┌──────────────┐     ┌──────────────┐     │ conductor_%  │
│   routes     │     │ route_points │     │ status       │
├──────────────┤     ├──────────────┤     └──────────────┘
│ id (PK)      │◄────│ route_id(FK) │
│ route_no     │     │ id (PK)      │     ┌──────────────┐
│ name         │     │ name         │     │    trips     │
│ origin       │     │ order        │     ├──────────────┤
│ destination  │     │ distance     │     │ id (PK)      │
│ distance_km  │     └──────────────┘     │ bus_id (FK)  │
└──────────────┘                          │ driver_id(FK)│
                                          │ conductor_id │
┌──────────────┐     ┌──────────────┐     │ route_id(FK) │
│  expenses    │     │ settlements  │     │ trip_number  │
├──────────────┤     ├──────────────┤     │ start_point  │
│ id (PK)      │     │ id (PK)      │     │ end_point    │
│ trip_id (FK) │     │ bus_id (FK)  │     │ start_time   │
│ bus_id (FK)  │     │ date         │     │ end_time     │
│ category     │     │ total_income │     │ income       │
│ amount       │     │ total_expense│     │ status       │
│ description  │     │ dti          │     └──────────────┘
│ entered_by   │     │ driver_salary│
│ timestamp    │     │ cond_salary  │     ┌──────────────┐
└──────────────┘     │ net_profit   │     │ crew_assign  │
                     │ is_locked    │     ├──────────────┤
                     │ settled_by   │     │ id (PK)      │
                     └──────────────┘     │ bus_id (FK)  │
                                          │ driver_id(FK)│
┌──────────────┐                          │ conductor_id │
│ audit_logs   │                          │ date         │
├──────────────┤                          │ is_active    │
│ id (PK)      │                          └──────────────┘
│ user_id (FK) │
│ action       │
│ entity       │
│ entity_id    │
│ details      │
│ timestamp    │
└──────────────┘`}</pre>
        </div>
      ),
    },
    {
      id: 'tech-stack',
      title: '8. Recommended Tech Stack',
      icon: <Server className="w-5 h-5" />,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            { layer: 'Mobile App', tech: 'React Native / Flutter', reason: 'Cross-platform, offline-capable, fast development' },
            { layer: 'Backend', tech: 'Supabase (PostgreSQL + Edge Functions)', reason: 'Real-time, auth, storage, low cost' },
            { layer: 'Database', tech: 'PostgreSQL via Supabase', reason: 'Relational data, strong consistency, RLS' },
            { layer: 'Admin Panel', tech: 'React + Tailwind CSS', reason: 'Web-based, responsive, rich dashboards' },
            { layer: 'Offline Sync', tech: 'WatermelonDB / RxDB', reason: 'Local-first, conflict resolution, sync queue' },
            { layer: 'Notifications', tech: 'Firebase Cloud Messaging', reason: 'Free tier, reliable push notifications' },
            { layer: 'Hosting', tech: 'Vercel (frontend) + Supabase (backend)', reason: 'Serverless, auto-scaling, low cost' },
            { layer: 'Analytics', tech: 'PostHog / Mixpanel', reason: 'User behavior tracking, funnel analysis' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">{item.layer}</p>
              <p className="font-bold text-slate-900">{item.tech}</p>
              <p className="text-xs text-slate-500 mt-1">{item.reason}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'monetization',
      title: '9. Monetization Strategy',
      icon: <DollarSign className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
              <p className="text-xs text-slate-400 uppercase font-semibold">Starter</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">Free</p>
              <p className="text-xs text-slate-500 mt-1">1 bus, basic features</p>
              <ul className="mt-3 space-y-1 text-xs text-slate-600">
                <li>1 bus registration</li>
                <li>Trip & income tracking</li>
                <li>Basic daily settlement</li>
                <li>7-day data retention</li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-300 relative">
              <span className="absolute -top-2 right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">POPULAR</span>
              <p className="text-xs text-amber-600 uppercase font-semibold">Professional</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">Rs. 990<span className="text-sm font-normal text-slate-500">/bus/mo</span></p>
              <p className="text-xs text-slate-500 mt-1">2-10 buses</p>
              <ul className="mt-3 space-y-1 text-xs text-slate-600">
                <li>All Starter features</li>
                <li>Staff management</li>
                <li>Crew assignment</li>
                <li>Full reports & analytics</li>
                <li>Unlimited data retention</li>
              </ul>
            </div>
            <div className="p-4 bg-slate-900 rounded-xl text-white">
              <p className="text-xs text-amber-400 uppercase font-semibold">Enterprise</p>
              <p className="text-3xl font-bold mt-1">Rs. 690<span className="text-sm font-normal text-slate-400">/bus/mo</span></p>
              <p className="text-xs text-slate-400 mt-1">10+ buses, volume discount</p>
              <ul className="mt-3 space-y-1 text-xs text-slate-300">
                <li>All Professional features</li>
                <li>Manager roles</li>
                <li>API access</li>
                <li>Priority support</li>
                <li>Custom integrations</li>
                <li>White-label option</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'gtm',
      title: '10. Go-to-Market Strategy',
      icon: <Rocket className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-sm text-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h4 className="font-bold text-blue-800">Phase 1: Pilot (Month 1-2)</h4>
              <ul className="mt-2 space-y-1 text-xs text-blue-700">
                <li>Target 10-20 single-bus owners in Colombo-Kandy corridor</li>
                <li>Free onboarding with hands-on training at bus stands</li>
                <li>Partner with bus stand associations for trust</li>
                <li>Collect feedback, iterate rapidly</li>
              </ul>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <h4 className="font-bold text-emerald-800">Phase 2: Expand (Month 3-6)</h4>
              <ul className="mt-2 space-y-1 text-xs text-emerald-700">
                <li>Expand to Southern, Sabaragamuwa routes</li>
                <li>Target small fleet owners (2-5 buses)</li>
                <li>Referral program: existing users invite others</li>
                <li>WhatsApp-based support for non-technical users</li>
              </ul>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <h4 className="font-bold text-purple-800">Phase 3: Scale (Month 6-12)</h4>
              <ul className="mt-2 space-y-1 text-xs text-purple-700">
                <li>Approach large bus companies with enterprise deals</li>
                <li>NTC partnership for official route data</li>
                <li>Sinhala/Tamil language support launch</li>
                <li>Island-wide marketing campaign</li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <h4 className="font-bold text-amber-800">Trust Building</h4>
              <ul className="mt-2 space-y-1 text-xs text-amber-700">
                <li>Show daily savings in time and dispute reduction</li>
                <li>Transparent calculation logs visible to all parties</li>
                <li>Testimonials from early adopters at bus stands</li>
                <li>Free trial period with no credit card required</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'anti-fraud',
      title: '11. Anti-Fraud & Trust Controls',
      icon: <Lock className="w-5 h-5" />,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            { control: 'Photo Proof for Fuel Bills', desc: 'Optional camera capture for expense receipts. Stored with timestamp and GPS.' },
            { control: 'Time-Stamped Entries', desc: 'All income and expense entries auto-stamped. Cannot be backdated without audit trail.' },
            { control: 'GPS Trip Evidence', desc: 'Optional GPS tracking for trip verification. Start/end location recorded.' },
            { control: 'Approval Flow for Edits', desc: 'Post-lock edits require owner approval. Manager cannot override locked settlements.' },
            { control: 'Complete Audit History', desc: 'Every create, update, delete action logged with user, timestamp, and before/after values.' },
            { control: 'Daily Lock After Settlement', desc: 'Once settlement is locked, no changes without explicit unlock + reason + audit log.' },
            { control: 'Reconciliation Screen', desc: 'Side-by-side comparison of expected vs. actual income. Highlights discrepancies.' },
            { control: 'Duplicate Detection', desc: 'System flags potential duplicate expenses based on amount, category, and time proximity.' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="font-bold text-slate-900">{item.control}</p>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'api',
      title: '12. API Design (REST Endpoints)',
      icon: <Globe className="w-5 h-5" />,
      content: (
        <div className="bg-slate-900 text-slate-100 rounded-xl p-5 font-mono text-xs leading-relaxed overflow-x-auto">
          <pre>{`// Authentication
POST   /api/auth/signup          // Phone OTP signup
POST   /api/auth/login           // Phone OTP login
POST   /api/auth/verify          // Verify OTP
POST   /api/auth/refresh         // Refresh token

// Buses
GET    /api/buses                // List owner's buses
POST   /api/buses                // Register new bus
GET    /api/buses/:id            // Get bus details
PUT    /api/buses/:id            // Update bus
PATCH  /api/buses/:id/status     // Toggle active/inactive

// Routes
GET    /api/routes               // List all routes
GET    /api/routes/:id/points    // Get route stops

// Staff
GET    /api/staff                // List company staff
POST   /api/staff                // Add staff member
PUT    /api/staff/:id            // Update staff
PATCH  /api/staff/:id/status     // Activate/deactivate

// Crew Assignments
GET    /api/assignments?date=    // Get assignments for date
POST   /api/assignments          // Create assignment

// Trips
GET    /api/trips?bus=&date=     // List trips by bus/date
POST   /api/trips                // Start new trip
PUT    /api/trips/:id            // Update/end trip
PATCH  /api/trips/:id/cancel     // Cancel trip

// Expenses
GET    /api/expenses?bus=&date=  // List expenses
POST   /api/expenses             // Add expense
PUT    /api/expenses/:id         // Update expense

// Settlements
GET    /api/settlements?bus=&date= // Get settlement
POST   /api/settlements/calculate  // Calculate settlement
POST   /api/settlements/lock       // Lock settlement
POST   /api/settlements/unlock     // Unlock (owner only)

// Reports
GET    /api/reports/daily?date=    // Daily summary
GET    /api/reports/bus/:id?range= // Bus-level report
GET    /api/reports/route/:id      // Route performance
GET    /api/reports/salary?range=  // Salary report`}</pre>
        </div>
      ),
    },
    {
      id: 'pitch',
      title: '13. Investor Pitch Summary',
      icon: <Rocket className="w-5 h-5" />,
      content: (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white">
          <h3 className="text-2xl font-bold mb-4">BusEka - Digitizing Sri Lanka's Private Bus Economy</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-amber-400 font-bold mb-1">The Problem</p>
              <p className="text-slate-300">25,000+ private buses in Sri Lanka manage Rs. 50B+ annually using paper ledgers. Daily disputes over wages, lost receipts, and zero financial visibility.</p>
            </div>
            <div>
              <p className="text-amber-400 font-bold mb-1">The Solution</p>
              <p className="text-slate-300">Mobile-first platform for trip tracking, income management, automated wage calculation, and daily settlement — built for Sri Lankan bus stand realities.</p>
            </div>
            <div>
              <p className="text-amber-400 font-bold mb-1">Market Size</p>
              <p className="text-slate-300">25,000 private buses × Rs. 990/bus/month = Rs. 297M ARR potential. Enterprise tier adds 40% premium.</p>
            </div>
            <div>
              <p className="text-amber-400 font-bold mb-1">Traction Goal</p>
              <p className="text-slate-300">100 buses in 3 months. 1,000 buses in 12 months. Path to Rs. 12M ARR in Year 1.</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Product Blueprint</h1>
        <p className="text-slate-500 mt-1">Complete product strategy, architecture, and roadmap for BusEka</p>
      </div>

      <div className="space-y-3">
        {sections.map(section => {
          const isExpanded = expandedSection === section.id;
          return (
            <div key={section.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                className="w-full p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
                    {section.icon}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                  {section.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Blueprint;
