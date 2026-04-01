import type {
  ApiSettlementCard,
  ApiSettlementDetailResponse,
  ApiSettlementListResponse,
} from './settlementApi';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return (
    'Rs.\u00a0' +
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

function fmtDate(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${d} ${months[m - 1]} ${y}`;
}

function printedNow(): string {
  return new Date().toLocaleString('en-LK', {
    timeZone: 'Asia/Colombo',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

// ── Shared print styles ───────────────────────────────────────────────────────

const STYLES = `<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Courier New', Courier, monospace;
    font-size: 10.5pt;
    color: #000;
    background: #fff;
    padding: 14mm 18mm;
    line-height: 1.45;
  }
  h1 { font-size: 13pt; text-align: center; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 3px; }
  .org { font-size: 9.5pt; text-align: center; margin-bottom: 10px; }
  .meta {
    display: flex; gap: 0; flex-wrap: wrap;
    border-top: 1px solid #000; border-bottom: 1px solid #000;
    padding: 5px 0; margin-bottom: 12px; font-size: 10pt;
  }
  .meta-item { margin-right: 24px; }
  .sec {
    font-size: 9pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.8px;
    border-bottom: 1px solid #888; padding-bottom: 2px; margin: 14px 0 6px;
  }
  table { width: 100%; border-collapse: collapse; font-size: 10pt; }
  td, th { padding: 2.5px 2px; vertical-align: top; }
  th { font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 3px; }
  .r { text-align: right; }
  .c { text-align: center; }
  .sep td { border-top: 1px dashed #aaa; padding-top: 4px; }
  .totrow td { border-top: 1px solid #000; font-weight: bold; padding-top: 3px; }
  .grandrow td { border-top: 2px solid #000; font-weight: bold; font-size: 11.5pt; padding-top: 4px; }
  .badge {
    display: inline-block; border: 1.5px solid #000; padding: 1px 10px;
    font-weight: bold; font-size: 9pt; letter-spacing: 0.5px;
  }
  .sig { margin-top: 28px; display: flex; gap: 32px; }
  .sig-block { flex: 1; }
  .sig-line { border-bottom: 1px solid #000; height: 22px; margin-bottom: 3px; }
  .sig-label { font-size: 9pt; }
  .footer { margin-top: 18px; border-top: 1px solid #aaa; padding-top: 5px; font-size: 8.5pt; text-align: center; }
  small { font-size: 8.5pt; }
  @media print { body { padding: 8mm 12mm; } }
</style>`;

function openPrint(bodyHtml: string, title: string): void {
  const w = window.open('', '_blank', 'width=800,height=980,scrollbars=yes');
  if (!w) {
    // eslint-disable-next-line no-alert
    alert('Pop-up blocked. Please allow pop-ups for this site to enable printing.');
    return;
  }
  w.document.write(
    `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>${STYLES}</head><body>${bodyHtml}</body></html>`,
  );
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); }, 400);
}

// ── Single-bus settlement print ───────────────────────────────────────────────

export function printBusSettlement(
  card: ApiSettlementCard,
  detail: ApiSettlementDetailResponse | null,
  date: string,
  companyName: string,
): void {
  const routeLabel = card.route
    ? `${card.route.routeName}${card.route.routeCode ? ' (' + card.route.routeCode + ')' : ''}`
    : 'Not assigned';

  const wageLabel =
    card.wageType === 'percentage'
      ? `Percentage &mdash; Driver: ${card.driverPercentage ?? 0}%,  Conductor: ${card.conductorPercentage ?? 0}%`
      : `Fixed &mdash; Driver: ${fmt(card.fixedDriverWage ?? 0)},  Conductor: ${fmt(card.fixedConductorWage ?? 0)}`;

  // Income/expense breakdown
  const breakdownRows = detail
    ? `<tr><td>Trip Income</td><td class="r">${fmt(detail.breakdown.tripIncome)}</td></tr>
       <tr><td>Extra Income</td><td class="r">${fmt(detail.breakdown.extraIncome)}</td></tr>
       <tr><td>Operational Income</td><td class="r">${fmt(detail.breakdown.operationalIncome)}</td></tr>
       <tr class="sep"><td>Total Income</td><td class="r">${fmt(card.totalIncome)}</td></tr>
       <tr><td>Trip Expenses</td><td class="r">(${fmt(detail.breakdown.tripExpenses)})</td></tr>
       <tr><td>Operational Expenses</td><td class="r">(${fmt(detail.breakdown.operationalExpenses)})</td></tr>
       <tr class="totrow"><td>Total Expenses</td><td class="r">(${fmt(card.totalExpenses)})</td></tr>
       <tr class="grandrow"><td>Daily Total Income (DTI)</td><td class="r">${fmt(card.dti)}</td></tr>`
    : `<tr><td>Total Income</td><td class="r">${fmt(card.totalIncome)}</td></tr>
       <tr><td>Total Expenses</td><td class="r">(${fmt(card.totalExpenses)})</td></tr>
       <tr class="grandrow"><td>Daily Total Income (DTI)</td><td class="r">${fmt(card.dti)}</td></tr>`;

  // Salary rows
  const driverLabel =
    card.wageType === 'percentage'
      ? `Driver Salary (${card.driverPercentage ?? 0}% of DTI)`
      : 'Driver Salary (Fixed)';
  const conductorLabel =
    card.wageType === 'percentage'
      ? `Conductor Salary (${card.conductorPercentage ?? 0}% of DTI)`
      : 'Conductor Salary (Fixed)';

  // Trips table
  const tripRows = detail
    ? detail.trips.length === 0
      ? `<tr><td colspan="4" style="padding:4px 0;font-style:italic;">No trips recorded for this date.</td></tr>`
      : detail.trips
          .map(
            t =>
              `<tr>
                <td style="width:6%">#${t.tripNumber}</td>
                <td>${t.startTime ?? '—'}${t.endTime ? ' &rarr; ' + t.endTime : ''}</td>
                <td style="text-transform:capitalize">${t.status}</td>
                <td class="r">${fmt(t.income)}</td>
              </tr>`,
          )
          .join('')
    : '';

  // Expenses table
  const expenseRows = detail
    ? detail.expenses.length === 0
      ? `<tr><td colspan="3" style="padding:4px 0;font-style:italic;">No expenses recorded for this date.</td></tr>`
      : detail.expenses
          .map(
            e =>
              `<tr>
                <td style="text-transform:capitalize;width:30%">${e.category}</td>
                <td style="font-size:9.5pt">${e.description ?? ''}</td>
                <td class="r">${fmt(e.amount)}</td>
              </tr>`,
          )
          .join('')
    : '';

  const detailSections = detail
    ? `<div class="sec">Trip Details (${detail.trips.length} trip${detail.trips.length !== 1 ? 's' : ''})</div>
       <table>
         <thead><tr><th>#</th><th>Time</th><th>Status</th><th class="r">Income</th></tr></thead>
         <tbody>${tripRows}</tbody>
         ${detail.trips.length > 0
            ? `<tfoot><tr class="totrow"><td colspan="3">Total Trip Income</td><td class="r">${fmt(detail.breakdown.tripIncome)}</td></tr></tfoot>`
            : ''}
       </table>
       <div class="sec">Expense Details (${detail.expenses.length} item${detail.expenses.length !== 1 ? 's' : ''})</div>
       <table>
         <thead><tr><th>Category</th><th>Note</th><th class="r">Amount</th></tr></thead>
         <tbody>${expenseRows}</tbody>
         ${detail.expenses.length > 0
            ? `<tfoot><tr class="totrow"><td colspan="2">Total Expenses</td><td class="r">${fmt(card.totalExpenses)}</td></tr></tfoot>`
            : ''}
       </table>`
    : '';

  const html = `
    <h1>Daily Settlement Report</h1>
    <div class="org">${companyName}</div>

    <div class="meta">
      <span class="meta-item"><strong>Date:</strong> ${fmtDate(date)}</span>
      <span class="meta-item"><strong>Bus:</strong> ${card.registrationNumber}${card.busName ? ' — ' + card.busName : ''}</span>
      <span class="meta-item"><strong>Route:</strong> ${routeLabel}</span>
      <span class="meta-item"><span class="badge">${card.isLocked ? '&#10003; FINALISED' : 'PRELIMINARY'}</span></span>
    </div>

    <p style="font-size:9.5pt;margin-bottom:4px"><strong>Wage Model:</strong> ${wageLabel}</p>

    <div class="sec">Income &amp; Expenses</div>
    <table><tbody>${breakdownRows}</tbody></table>

    <div class="sec">Wage Calculation</div>
    <table>
      <tbody>
        <tr><td>${driverLabel}</td><td class="r">${fmt(card.driverSalary)}</td></tr>
        <tr><td>${conductorLabel}</td><td class="r">${fmt(card.conductorSalary)}</td></tr>
        <tr class="totrow"><td>Total Crew Salaries</td><td class="r">(${fmt(card.driverSalary + card.conductorSalary)})</td></tr>
        <tr class="grandrow"><td>Owner Net Profit</td><td class="r">${fmt(card.netProfit)}</td></tr>
      </tbody>
    </table>

    ${detailSections}

    <div class="sig">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">Driver Signature</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">Conductor Signature</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">Authorized By</div>
      </div>
    </div>

    <div class="footer">Printed: ${printedNow()} &nbsp;|&nbsp; ${companyName} &nbsp;|&nbsp; Buss App</div>
  `;

  openPrint(html, `Settlement — ${card.registrationNumber} — ${date}`);
}

// ── All-buses summary print ───────────────────────────────────────────────────

export function printAllSettlements(
  data: ApiSettlementListResponse,
  companyName: string,
): void {
  const { date, buses, summary } = data;

  const busRows = buses
    .map(
      card =>
        `<tr>
          <td>${card.registrationNumber}${card.busName ? '<br><small>' + card.busName + '</small>' : ''}</td>
          <td>${card.route ? (card.route.routeCode ?? card.route.routeName) : '&mdash;'}</td>
          <td class="c">${card.wageType === 'percentage' ? '%' : 'Fixed'}</td>
          <td class="r">${fmt(card.totalIncome)}</td>
          <td class="r">${fmt(card.totalExpenses)}</td>
          <td class="r">${fmt(card.dti)}</td>
          <td class="r">${fmt(card.driverSalary)}</td>
          <td class="r">${fmt(card.conductorSalary)}</td>
          <td class="r"><strong>${fmt(card.netProfit)}</strong></td>
          <td class="c">${card.isLocked ? '&#10003;' : ''}</td>
        </tr>`,
    )
    .join('');

  const html = `
    <h1>Company Settlement Summary</h1>
    <div class="org">${companyName}</div>

    <div class="meta">
      <span class="meta-item"><strong>Date:</strong> ${fmtDate(date)}</span>
      <span class="meta-item"><strong>Total Buses:</strong> ${buses.length}</span>
      <span class="meta-item"><strong>Locked:</strong> ${buses.filter(b => b.isLocked).length} / ${buses.length}</span>
    </div>

    <div class="sec">Per-Bus Breakdown</div>
    <table>
      <thead>
        <tr>
          <th>Bus</th>
          <th>Route</th>
          <th class="c">Wage</th>
          <th class="r">Income</th>
          <th class="r">Expenses</th>
          <th class="r">DTI</th>
          <th class="r">Driver</th>
          <th class="r">Conductor</th>
          <th class="r">Net Profit</th>
          <th class="c">&#128274;</th>
        </tr>
      </thead>
      <tbody>${busRows}</tbody>
      <tfoot>
        <tr class="totrow">
          <td colspan="3"><strong>TOTALS</strong></td>
          <td class="r">${fmt(summary.totalIncome)}</td>
          <td class="r">${fmt(summary.totalExpenses)}</td>
          <td class="r">&mdash;</td>
          <td colspan="2" class="r">${fmt(summary.totalSalaries)}</td>
          <td class="r">${fmt(summary.netProfit)}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>

    <div class="sec">Summary</div>
    <table style="width:55%">
      <tbody>
        <tr><td>Total Fleet Income</td><td class="r">${fmt(summary.totalIncome)}</td></tr>
        <tr><td>Total Fleet Expenses</td><td class="r">(${fmt(summary.totalExpenses)})</td></tr>
        <tr><td>Total Crew Salaries</td><td class="r">(${fmt(summary.totalSalaries)})</td></tr>
        <tr class="grandrow"><td>Net Owner Profit</td><td class="r">${fmt(summary.netProfit)}</td></tr>
      </tbody>
    </table>

    <div class="sig" style="margin-top:32px">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">Prepared By</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">Verified By</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">Authorized By</div>
      </div>
    </div>

    <div class="footer">Printed: ${printedNow()} &nbsp;|&nbsp; ${companyName} &nbsp;|&nbsp; Buss App</div>
  `;

  openPrint(html, `Settlement Summary — ${companyName} — ${date}`);
}
