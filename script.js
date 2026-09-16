
const METADATA = {
  best_model: "svm",
  results: {
    svm:            { accuracy: 0.8289, precision: 0.5333, recall: 0.5714, f1_score: 0.5517, roc_auc: 0.8341 },
    random_forest:  { accuracy: 0.8421, precision: 0.6000, recall: 0.4286, f1_score: 0.5000, roc_auc: 0.8232 },
    decision_tree:  { accuracy: 0.8947, precision: 0.8000, recall: 0.5714, f1_score: 0.6667, roc_auc: 0.7713 }
  },
  numeric_columns: [
    "Level_of_Study", "Admission_Year", "Semester_GPA", "CGPA", "Previous_Semester_GPA",
    "Total_Credit_Units_Registered", "Total_Credit_Units_Passed", "Total_Credit_Units_Failed",
    "Credit_Completion_Rate_%", "Number_of_Outstanding_Courses", "Number_of_Carryovers",
    "Number_of_Repeated_Courses", "Attendance_Percentage", "Number_of_Probation_Occurrences"
  ],
  categorical_columns: ["Mode_of_Entry", "Current_Semester", "GPA_Trend", "Academic_Probation"],
  categorical_values: {
    Mode_of_Entry: ["Direct Entry", "Transfer", "UTME"],
    Current_Semester: ["First Semester", "Second Semester"],
    GPA_Trend: ["Declining", "Improving", "Stable"],
    Academic_Probation: ["No", "Yes"]
  }
};
METADATA.feature_columns = METADATA.numeric_columns.concat(METADATA.categorical_columns);
const CSV_HEADER = ["student_id"].concat(METADATA.feature_columns);

const SAMPLE_ROSTER = [
  { student_id: "CS/400/001", Level_of_Study: 400, Mode_of_Entry: "Transfer", Admission_Year: 2021, Current_Semester: "Second Semester", Semester_GPA: 5.0, CGPA: 4.72, Previous_Semester_GPA: 4.37, GPA_Trend: "Improving", Total_Credit_Units_Registered: 22, Total_Credit_Units_Passed: 22, Total_Credit_Units_Failed: 0, "Credit_Completion_Rate_%": 100.0, Number_of_Outstanding_Courses: 0, Number_of_Carryovers: 0, Number_of_Repeated_Courses: 0, Attendance_Percentage: 98.6, Academic_Probation: "No", Number_of_Probation_Occurrences: 0 },
  { student_id: "CS/400/002", Level_of_Study: 400, Mode_of_Entry: "Direct Entry", Admission_Year: 2022, Current_Semester: "Second Semester", Semester_GPA: 3.33, CGPA: 3.08, Previous_Semester_GPA: 3.2, GPA_Trend: "Stable", Total_Credit_Units_Registered: 18, Total_Credit_Units_Passed: 16, Total_Credit_Units_Failed: 2, "Credit_Completion_Rate_%": 88.9, Number_of_Outstanding_Courses: 1, Number_of_Carryovers: 4, Number_of_Repeated_Courses: 3, Attendance_Percentage: 61.1, Academic_Probation: "No", Number_of_Probation_Occurrences: 0 },
  { student_id: "CS/400/003", Level_of_Study: 400, Mode_of_Entry: "UTME", Admission_Year: 2022, Current_Semester: "Second Semester", Semester_GPA: 3.03, CGPA: 3.19, Previous_Semester_GPA: 3.31, GPA_Trend: "Declining", Total_Credit_Units_Registered: 18, Total_Credit_Units_Passed: 15, Total_Credit_Units_Failed: 3, "Credit_Completion_Rate_%": 83.3, Number_of_Outstanding_Courses: 4, Number_of_Carryovers: 1, Number_of_Repeated_Courses: 1, Attendance_Percentage: 61.7, Academic_Probation: "No", Number_of_Probation_Occurrences: 0 },
  { student_id: "CS/400/004", Level_of_Study: 400, Mode_of_Entry: "UTME", Admission_Year: 2021, Current_Semester: "Second Semester", Semester_GPA: 4.82, CGPA: 4.94, Previous_Semester_GPA: 4.93, GPA_Trend: "Stable", Total_Credit_Units_Registered: 17, Total_Credit_Units_Passed: 16, Total_Credit_Units_Failed: 1, "Credit_Completion_Rate_%": 94.1, Number_of_Outstanding_Courses: 1, Number_of_Carryovers: 1, Number_of_Repeated_Courses: 0, Attendance_Percentage: 75.5, Academic_Probation: "No", Number_of_Probation_Occurrences: 0 },
  { student_id: "CS/400/005", Level_of_Study: 400, Mode_of_Entry: "Direct Entry", Admission_Year: 2022, Current_Semester: "Second Semester", Semester_GPA: 3.63, CGPA: 3.35, Previous_Semester_GPA: 3.55, GPA_Trend: "Stable", Total_Credit_Units_Registered: 16, Total_Credit_Units_Passed: 16, Total_Credit_Units_Failed: 0, "Credit_Completion_Rate_%": 100.0, Number_of_Outstanding_Courses: 1, Number_of_Carryovers: 3, Number_of_Repeated_Courses: 2, Attendance_Percentage: 72.1, Academic_Probation: "No", Number_of_Probation_Occurrences: 0 },
  { student_id: "CS/400/006", Level_of_Study: 400, Mode_of_Entry: "UTME", Admission_Year: 2021, Current_Semester: "First Semester", Semester_GPA: 3.89, CGPA: 3.79, Previous_Semester_GPA: 3.92, GPA_Trend: "Stable", Total_Credit_Units_Registered: 23, Total_Credit_Units_Passed: 22, Total_Credit_Units_Failed: 1, "Credit_Completion_Rate_%": 95.7, Number_of_Outstanding_Courses: 1, Number_of_Carryovers: 1, Number_of_Repeated_Courses: 1, Attendance_Percentage: 79.4, Academic_Probation: "No", Number_of_Probation_Occurrences: 0 }
];

/* ── LOCAL AUTH, STORAGE, AND FRONTEND SIMULATION ── */
const STORAGE_KEYS = {
  users: "sads_authorized_personnel_v1",
  session: "sads_active_session_v1",
  runs: "sads_prediction_runs_v1"
};
const DEFAULT_USER = {
  email: "admin@institution.edu",
  password: "Admin@123",
  name: "Administrator",
  role: "System Admin"
};

function riskTier(p) { return p < 30 ? "Low" : p < 70 ? "Medium" : "High"; }
function binaryLabel(p) { return p >= 50 ? "At Risk" : "Not At Risk"; }

/* the stsate */
let datasetRecords = null;   
let datasetMeta = null;      // { fileName, uploadDate }
let analysisResults = [];
let savedRuns = [];

function safeJsonRead(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value === null ? fallback : value;
  } catch (_) {
    return fallback;
  }
}

function initializeAuthorizedPersonnel() {
  const users = safeJsonRead(STORAGE_KEYS.users, []);
  if (!Array.isArray(users) || users.length === 0) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify([DEFAULT_USER]));
  }
}

function showDashboard(user) {
  document.getElementById("loginScreen").hidden = true;
  document.getElementById("appShell").hidden = false;
  document.getElementById("signedInName").textContent = user.name || "Authorized Personnel";
  document.getElementById("signedInRole").textContent = user.role || "Academic Officer";
}

function showLogin() {
  document.getElementById("appShell").hidden = true;
  document.getElementById("loginScreen").hidden = false;
  document.getElementById("loginPassword").value = "";
  document.getElementById("loginError").hidden = true;
  setTimeout(() => document.getElementById("loginEmail").focus(), 0);
}

function initializeAuth() {
  initializeAuthorizedPersonnel();
  const session = safeJsonRead(STORAGE_KEYS.session, null);
  if (session && session.email) showDashboard(session);
  else showLogin();
}

document.getElementById("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;
  const users = safeJsonRead(STORAGE_KEYS.users, []);
  const user = users.find((item) => String(item.email).toLowerCase() === email && item.password === password);
  const error = document.getElementById("loginError");
  if (!user) {
    error.textContent = "The email or password is incorrect. Use the authorized demo credentials shown below.";
    error.hidden = false;
    return;
  }
  const session = { email: user.email, name: user.name, role: user.role, signedInAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
  error.hidden = true;
  showDashboard(session);
});

document.getElementById("passwordToggle").addEventListener("click", () => {
  const input = document.getElementById("loginPassword");
  const reveal = input.type === "password";
  input.type = reveal ? "text" : "password";
  document.getElementById("passwordToggle").textContent = reveal ? "Hide" : "Show";
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEYS.session);
  showLogin();
});

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[char]));
}

function simulateAttritionProbability(record) {
  const cgpa = clamp(Number(record.CGPA) || 0, 0, 5);
  const semesterGpa = clamp(Number(record.Semester_GPA) || 0, 0, 5);
  const previousGpa = clamp(Number(record.Previous_Semester_GPA) || 0, 0, 5);
  const attendance = clamp(Number(record.Attendance_Percentage) || 0, 0, 100);
  const completion = clamp(Number(record["Credit_Completion_Rate_%"]) || 0, 0, 100);
  const failedUnits = Math.max(0, Number(record.Total_Credit_Units_Failed) || 0);
  const outstanding = Math.max(0, Number(record.Number_of_Outstanding_Courses) || 0);
  const carryovers = Math.max(0, Number(record.Number_of_Carryovers) || 0);
  const repeated = Math.max(0, Number(record.Number_of_Repeated_Courses) || 0);
  const probationCount = Math.max(0, Number(record.Number_of_Probation_Occurrences) || 0);
  const onProbation = String(record.Academic_Probation || "").toLowerCase() === "yes";
  const trend = String(record.GPA_Trend || "").toLowerCase();

  let score = 5;
  score += Math.max(0, (3.5 - cgpa) / 3.5) * 30;
  score += Math.max(0, (85 - attendance) / 85) * 20;
  score += Math.max(0, (90 - completion) / 90) * 14;
  score += Math.min(failedUnits * 1.8, 10);
  score += Math.min(carryovers * 2.1, 9);
  score += Math.min(outstanding * 1.5, 7);
  score += Math.min(repeated * 1.7, 6);
  score += onProbation ? 10 : 0;
  score += Math.min(probationCount * 2.5, 7.5);
  score += trend === "declining" ? 6 : trend === "improving" ? -4 : 0;
  score += semesterGpa < previousGpa ? Math.min((previousGpa - semesterGpa) * 5, 5) : 0;

  return Math.round(clamp(score, 2, 98) * 10) / 10;
}
/* ── LIVE CLOCK ── */
function fmtDatetime(d) {
  const datePart = d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  const timePart = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${datePart} · ${timePart}`;
}
function tickClock() {
  const txt = fmtDatetime(new Date());
  ["liveDatetime", "liveDatetime2", "liveDatetime3"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  });
}
tickClock();
setInterval(tickClock, 30000);


/* ── INFO MODAL ── */
const infoOverlay = document.getElementById("infoOverlay");
document.getElementById("howItWorksFab").addEventListener("click", () => infoOverlay.classList.add("open"));
document.getElementById("infoClose").addEventListener("click", () => infoOverlay.classList.remove("open"));
document.getElementById("infoGotIt").addEventListener("click", () => infoOverlay.classList.remove("open"));
infoOverlay.addEventListener("click", (e) => { if (e.target === infoOverlay) infoOverlay.classList.remove("open"); });

/*
   CSV PARSING PART*/
function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (!lines.length) return { header: [], rows: [] };
  const header = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const obj = {};
    header.forEach((h, i) => { obj[h] = cells[i]; });
    return obj;
  });
  return { header, rows };
}

function setupDropzone(prefix) {
  const dropzone = document.getElementById(`dropzone-${prefix}`);
  const csvInput = document.getElementById(`csvInput-${prefix}`);
  const chooseBtn = document.getElementById(`chooseFileBtn-${prefix}`);
  const fileBadge = document.getElementById(`fileBadge-${prefix}`);
  const csvError = document.getElementById(`csvError-${prefix}`);

  chooseBtn.addEventListener("click", (e) => { e.stopPropagation(); csvInput.click(); });
  dropzone.addEventListener("click", () => csvInput.click());
  dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("drag-over"); });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("drag-over"));
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("drag-over");
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });
  csvInput.addEventListener("change", () => { if (csvInput.files.length) handleFile(csvInput.files[0]); });

  function handleFile(file) {
    csvError.hidden = true;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      csvError.textContent = "Please upload a .csv file.";
      csvError.hidden = false;
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const { header, rows } = parseCsv(String(reader.result));
      if (!rows.length) { csvError.textContent = "CSV file has no rows."; csvError.hidden = false; return; }
      const missing = METADATA.feature_columns.filter((c) => !header.includes(c));
      if (missing.length) {
        csvError.textContent = `Missing required column(s): ${missing.join(", ")}`;
        csvError.hidden = false;
        return;
      }
      const idCol = ["student_id", "Student_ID", "Matric_Number", "matric_number"].find((c) => header.includes(c));
      const records = rows.map((r) => {
        const rec = {};
        METADATA.numeric_columns.forEach((c) => { rec[c] = Number(r[c]); });
        METADATA.categorical_columns.forEach((c) => { rec[c] = r[c]; });
        rec.student_id = idCol ? r[idCol] : null;
        return rec;
      });

      fileBadge.hidden = false;
      fileBadge.innerHTML = `
        <svg class="fb-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9.5"/><path d="M8 12.5l2.5 2.5 5.5-6"/></svg>
        <div><div class="fb-name">${file.name}</div><div class="fb-size">${(file.size / 1024).toFixed(0)} KB · ${records.length} students</div></div>
        <button type="button" class="fb-remove" title="Remove">✕</button>
      `;
      fileBadge.querySelector(".fb-remove").addEventListener("click", (e) => {
        e.stopPropagation();
        fileBadge.hidden = true;
        clearDataset();
      });

      setDataset(records, { fileName: file.name, uploadDate: fmtDatetime(new Date()) });
    };
    reader.readAsText(file);
  }
}
setupDropzone("dash");

/* DATASET STATE AND THE ANALYSIS PART*/
function setDataset(records, meta) {
  datasetRecords = records;
  datasetMeta = meta;
  document.getElementById("sumFileName").textContent = meta.fileName;
  document.getElementById("sumUploadDate").textContent = meta.uploadDate;
  document.getElementById("sumTotal").textContent = records.length;
  const statusEl = document.getElementById("sumStatus");
  statusEl.textContent = "Ready for prediction";
  statusEl.className = "status-ready";
  document.getElementById("runAnalysisBtn-dash").disabled = false;
}
function clearDataset() {
  datasetRecords = null; datasetMeta = null;
  document.getElementById("sumFileName").textContent = "—";
  document.getElementById("sumUploadDate").textContent = "—";
  document.getElementById("sumTotal").textContent = "—";
  const statusEl = document.getElementById("sumStatus");
  statusEl.textContent = "Awaiting upload";
  statusEl.className = "status-pending";
  document.getElementById("runAnalysisBtn-dash").disabled = true;
}

async function runAnalysis(triggerBtn) {
  if (!datasetRecords || !datasetRecords.length) return;
  if (triggerBtn) { triggerBtn.classList.add("loading"); triggerBtn.disabled = true; }

  const statusEl = document.getElementById("sumStatus");
  statusEl.textContent = "Running local simulation…";
  statusEl.className = "status-ready";

  try {
    const results = [];
    const batchSize = 100;

    for (let start = 0; start < datasetRecords.length; start += batchSize) {
      const batch = datasetRecords.slice(start, start + batchSize);
      const batchResults = batch.map((r, localIndex) => {
        const probability = simulateAttritionProbability(r);
        return Object.assign({}, r, {
          _idx: start + localIndex,
          probability,
          tier: riskTier(probability),
          label: binaryLabel(probability)
        });
      });

      results.push(...batchResults);
      statusEl.textContent = `Running local simulation… ${Math.min(start + batch.length, datasetRecords.length)} of ${datasetRecords.length}`;
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    analysisResults = results;
    statusEl.textContent = "completed · saved";
    document.getElementById("generateReportBtn-dash").disabled = false;
    savePredictionRun();
    dashboardView.resetPage();
    renderCohortSummary();
  } catch (error) {
    console.error("Attrition simulation error:", error);
    statusEl.textContent = "Simulation failed";
    statusEl.className = "status-pending";
    alert(`Unable to complete the attrition simulation.\n\n${error.message}`);
  } finally {
    if (triggerBtn) { triggerBtn.classList.remove("loading"); triggerBtn.disabled = false; }
  }
}

function writeSavedRuns() {
  try {
    localStorage.setItem(STORAGE_KEYS.runs, JSON.stringify(savedRuns));
  } catch (error) {
    savedRuns = savedRuns.slice(0, 3);
    try { localStorage.setItem(STORAGE_KEYS.runs, JSON.stringify(savedRuns)); } catch (_) {}
    alert("The newest result is displayed, but this browser has limited local storage space. Older saved runs were removed.");
  }
}

function savePredictionRun() {
  const now = new Date();
  const run = {
    id: `run-${now.getTime()}`,
    createdAt: now.toISOString(),
    datasetMeta: datasetMeta || { fileName: "Uploaded dataset", uploadDate: fmtDatetime(now) },
    results: analysisResults
  };
  savedRuns = [run, ...savedRuns].slice(0, 8);
  writeSavedRuns();
  renderHistoryControls(run.id);
}

function activateSavedRun(runId) {
  const run = savedRuns.find((item) => item.id === runId);
  if (!run) return;
  analysisResults = Array.isArray(run.results) ? run.results : [];
  datasetRecords = analysisResults.map((record) => {
    const clean = Object.assign({}, record);
    delete clean.probability;
    delete clean.tier;
    delete clean.label;
    delete clean._idx;
    return clean;
  });
  datasetMeta = run.datasetMeta || { fileName: "Saved prediction run", uploadDate: fmtDatetime(new Date(run.createdAt)) };
  document.getElementById("sumFileName").textContent = datasetMeta.fileName || "Saved prediction run";
  document.getElementById("sumUploadDate").textContent = datasetMeta.uploadDate || fmtDatetime(new Date(run.createdAt));
  document.getElementById("sumTotal").textContent = analysisResults.length;
  const status = document.getElementById("sumStatus");
  status.textContent = "Saved simulation loaded";
  status.className = "status-ready";
  document.getElementById("runAnalysisBtn-dash").disabled = !datasetRecords.length;
  document.getElementById("generateReportBtn-dash").disabled = !analysisResults.length;
  dashboardView.resetPage();
  renderCohortSummary();
}

function renderHistoryControls(activeId) {
  const select = document.getElementById("historySelect");
  const clear = document.getElementById("clearHistoryBtn");
  const hasRuns = savedRuns.length > 0;
  select.hidden = !hasRuns;
  clear.hidden = !hasRuns;
  if (!hasRuns) return;
  select.innerHTML = savedRuns.map((run, index) => {
    const date = new Date(run.createdAt);
    const label = `${index === 0 ? "Latest · " : ""}${run.datasetMeta?.fileName || "Dataset"} · ${date.toLocaleDateString()}`;
    return `<option value="${run.id}">${escapeHtml(label)}</option>`;
  }).join("");
  select.value = activeId || savedRuns[0].id;
}

function loadPredictionHistory() {
  const stored = safeJsonRead(STORAGE_KEYS.runs, []);
  savedRuns = Array.isArray(stored) ? stored.filter((run) => run && Array.isArray(run.results)).slice(0, 8) : [];
  renderHistoryControls(savedRuns[0]?.id);
  if (savedRuns.length) activateSavedRun(savedRuns[0].id);
}

document.getElementById("historySelect").addEventListener("change", (event) => activateSavedRun(event.target.value));
document.getElementById("clearHistoryBtn").addEventListener("click", () => {
  if (!confirm("Clear all prediction results saved in this browser?")) return;
  savedRuns = [];
  analysisResults = [];
  localStorage.removeItem(STORAGE_KEYS.runs);
  renderHistoryControls();
  dashboardView.resetPage();
  renderCohortSummary();
  document.getElementById("generateReportBtn-dash").disabled = true;
  document.getElementById("sumStatus").textContent = datasetRecords?.length ? "Ready for prediction" : "Awaiting upload";
  document.getElementById("resultsEmpty-dash").querySelector("p").textContent = "Upload a dataset and run the analysis to see per-student predictions here.";
});

document.getElementById("runAnalysisBtn-dash").addEventListener("click", (e) => runAnalysis(e.currentTarget));
document.getElementById("generateReportBtn-dash").addEventListener("click", () => {
  if (!analysisResults.length) return;
  renderReport();
  // Allow the report DOM to update before opening the browser print dialog.
  setTimeout(() => window.print(), 50);
});

window.addEventListener("afterprint", () => {
  const reportSheet = document.getElementById("reportSheet");
  if (reportSheet) reportSheet.hidden = true;
});

/* RESULTS TABLE VIEW PART */
function createResultsView(prefix, opts) {
  opts = opts || {};
  const table = document.getElementById(`resultsTable-${prefix}`);
  const tbody = table.querySelector("tbody");
  const emptyEl = document.getElementById(`resultsEmpty-${prefix}`);
  const paginationEl = document.getElementById(`pagination-${prefix}`);
  const searchEl = document.getElementById(`searchInput-${prefix}`);
  const filterEl = document.getElementById(`filterSelect-${prefix}`);
  const titleEl = document.getElementById(`resultsTitle-${prefix}`);
  const pageSize = 5;
  let page = 1;

  function filtered() {
    let data = analysisResults;
    const q = (searchEl.value || "").trim().toLowerCase();
    if (q) data = data.filter((r) => (r.student_id || "").toLowerCase().includes(q));
    const f = filterEl.value;
    if (f !== "all") data = data.filter((r) => r.tier === f);
    return data;
  }

  function render() {
    const total = analysisResults.length;
    if (titleEl) titleEl.textContent = `${opts.titlePrefix || ""}Prediction results (${total} student${total === 1 ? "" : "s"})`;

    if (!total) {
      table.style.display = "none";
      emptyEl.hidden = false;
      paginationEl.innerHTML = "";
      return;
    }
    table.style.display = "";
    emptyEl.hidden = true;

    const data = filtered();
    const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
    if (page > totalPages) page = totalPages;
    const start = (page - 1) * pageSize;
    const pageData = data.slice(start, start + pageSize);

    tbody.innerHTML = pageData.length ? pageData.map((r, i) => `
      <tr>
        <td>${start + i + 1}</td>
        <td>${r.student_id ? escapeHtml(r.student_id) : `<span class="muted">record ${r._idx + 1}</span>`}</td>
        <td>${r.Level_of_Study}</td>
        <td>${Number(r.CGPA).toFixed(2)}</td>
        <td>${Number(r.Attendance_Percentage).toFixed(0)}%</td>
        <td>${r.probability.toFixed(0)}%</td>
        <td><span class="badge risk-${r.tier}">${r.tier} Risk</span></td>
        <td><button type="button" class="view-details-btn" data-idx="${r._idx}">View Details</button></td>
      </tr>
    `).join("") : `<tr><td colspan="8" class="muted" style="text-align:center;padding:24px;">No students match this search / filter.</td></tr>`;

    tbody.querySelectorAll(".view-details-btn").forEach((btn) => {
      btn.addEventListener("click", () => openDrawer(Number(btn.dataset.idx)));
    });

    renderPagination(paginationEl, page, totalPages, data.length, pageSize, (p) => { page = p; render(); });
  }

  searchEl.addEventListener("input", () => { page = 1; render(); });
  filterEl.addEventListener("change", () => { page = 1; render(); });

  return { render, resetPage: () => { page = 1; render(); } };
}

function renderPagination(el, page, totalPages, totalItems, pageSize, onPage) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(totalItems, page * pageSize);
  let html = `<span class="pg-info">Showing ${start} to ${end} of ${totalItems} students</span>`;
  html += `<button type="button" data-p="${page - 1}" ${page === 1 ? "disabled" : ""}>&lt;</button>`;

  const pagesToShow = new Set([1, totalPages, page, page - 1, page + 1]);
  let prev = null;
  for (let p = 1; p <= totalPages; p++) {
    if (!pagesToShow.has(p)) continue;
    if (prev !== null && p - prev > 1) html += `<span class="pg-ellipsis">…</span>`;
    html += `<button type="button" data-p="${p}" class="${p === page ? "active" : ""}">${p}</button>`;
    prev = p;
  }
  html += `<button type="button" data-p="${page + 1}" ${page === totalPages ? "disabled" : ""}>&gt;</button>`;
  el.innerHTML = html;
  el.querySelectorAll("button[data-p]").forEach((btn) => {
    btn.addEventListener("click", () => onPage(Number(btn.dataset.p)));
  });
}

const dashboardView = createResultsView("dash", { titlePrefix: "2. " });


/* FOR THE STUDENT DETAIL DRAWER */
const drawerOverlay = document.getElementById("drawerOverlay");
const drawerBody = document.getElementById("drawerBody");
document.getElementById("drawerClose").addEventListener("click", () => drawerOverlay.classList.remove("open"));
drawerOverlay.addEventListener("click", (e) => { if (e.target === drawerOverlay) drawerOverlay.classList.remove("open"); });

function getRecommendations(r) {
  const rec = [];
  const cgpa = Number(r.CGPA) || 0;
  const semGpa = Number(r.Semester_GPA) || 0;
  const prevGpa = Number(r.Previous_Semester_GPA) || 0;
  const att = Number(r.Attendance_Percentage) || 0;
  const failed = Number(r.Total_Credit_Units_Failed) || 0;
  const passed = Number(r.Total_Credit_Units_Passed) || 0;
  const registered = Number(r.Total_Credit_Units_Registered) || 0;
  const carry = Number(r.Number_of_Carryovers) || 0;
  const repeated = Number(r.Number_of_Repeated_Courses) || 0;
  const outstanding = Number(r.Number_of_Outstanding_Courses) || 0;
  const completion = Number(r['Credit_Completion_Rate_%']) || (registered > 0 ? (passed / registered) * 100 : 0);
  const probation = String(r.Academic_Probation || '').toLowerCase() === 'yes';
  const trend = String(r.GPA_Trend || '').toLowerCase();

  // Recommendations are driven by the student's actual academic indicators.
  if (cgpa < 2.0) rec.push('Place the student on an intensive academic recovery plan with weekly adviser follow-up.');
  else if (cgpa < 2.5) rec.push('Schedule academic advising and set a CGPA improvement target for the next semester.');

  if (semGpa > 0 && prevGpa > 0 && semGpa < prevGpa - 0.25) rec.push('Investigate the recent GPA decline and provide targeted support in weak courses.');
  else if (trend === 'declining') rec.push('Review the declining GPA trend and arrange early academic intervention.');

  if (failed >= 6) rec.push('Create a course recovery plan for the high number of failed credit units before the next registration.');
  else if (failed > 0) rec.push('Prioritize failed courses for remediation and monitored repeat registration.');

  if (carry >= 3 || outstanding >= 4) rec.push('Prepare a semester-by-semester plan to clear carryovers and outstanding courses.');
  else if (carry > 0 || outstanding > 0) rec.push('Monitor outstanding and carryover courses and confirm a realistic completion schedule.');

  if (repeated >= 2) rec.push('Assign focused tutorials or mentoring for repeatedly attempted courses.');
  else if (repeated === 1) rec.push('Monitor the repeated course closely and provide additional academic support.');

  if (att < 60) rec.push('Immediate attendance intervention is recommended, with regular attendance monitoring.');
  else if (att < 75) rec.push('Improve class attendance through attendance monitoring and adviser follow-up.');

  if (completion < 60) rec.push('Review course-load completion and reduce the risk of accumulating additional academic backlog.');
  else if (completion < 75) rec.push('Monitor credit completion and encourage timely completion of registered courses.');

  if (probation) rec.push('Conduct an academic probation review and agree on measurable recovery actions with the adviser.');

  // Avoid a generic list when several indicators exist: keep the most relevant actions.
  if (!rec.length) rec.push('Continue routine academic monitoring and periodic adviser check-ins.');
  return [...new Set(rec)].slice(0, 5);
}

function recommendationHtml(r) { return getRecommendations(r).map(x => `<li>${x}</li>`).join(''); }

function openDrawer(idx) {
  const r = analysisResults.find((x) => x._idx === idx);
  if (!r) return;
  const tierClass = r.tier === "High" ? "danger" : r.tier === "Medium" ? "warn" : "safe";
  drawerBody.innerHTML = `
    <div class="drawer-student">
      <div class="drawer-avatar"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c0-4.1 3.4-7 7.5-7s7.5 2.9 7.5 7"/></svg></div>
      <div>
        <div class="drawer-name">${escapeHtml(r.student_id || "Unlabeled record #" + (r._idx + 1))}</div>
        <div class="drawer-sub">${escapeHtml(r.Level_of_Study)} Level · ${escapeHtml(r.Mode_of_Entry)}</div>
      </div>
    </div>
    <div class="drawer-rows">
      <div class="drawer-row"><span>Current CGPA</span><strong>${Number(r.CGPA).toFixed(2)}</strong></div>
      <div class="drawer-row"><span>Semester GPA</span><strong>${Number(r.Semester_GPA).toFixed(2)}</strong></div>
      <div class="drawer-row"><span>Previous semester GPA</span><strong>${Number(r.Previous_Semester_GPA).toFixed(2)}</strong></div>
      <div class="drawer-row"><span>GPA trend</span><strong>${escapeHtml(r.GPA_Trend)}</strong></div>
      <hr class="drawer-divider">
      <div class="drawer-row"><span>Units registered</span><strong>${r.Total_Credit_Units_Registered}</strong></div>
      <div class="drawer-row"><span>Units passed</span><strong>${r.Total_Credit_Units_Passed}</strong></div>
      <div class="drawer-row"><span>Units failed</span><strong>${r.Total_Credit_Units_Failed}</strong></div>
      <div class="drawer-row"><span>Completion rate</span><strong>${Number(r["Credit_Completion_Rate_%"]).toFixed(1)}%</strong></div>
      <hr class="drawer-divider">
      <div class="drawer-row"><span>Carryovers</span><strong>${r.Number_of_Carryovers}</strong></div>
      <div class="drawer-row"><span>Repeated courses</span><strong>${r.Number_of_Repeated_Courses}</strong></div>
      <div class="drawer-row"><span>Outstanding courses</span><strong>${r.Number_of_Outstanding_Courses}</strong></div>
      <div class="drawer-row"><span>Attendance</span><strong>${Number(r.Attendance_Percentage).toFixed(1)}%</strong></div>
      <div class="drawer-row"><span>Academic probation</span><strong>${escapeHtml(r.Academic_Probation)}${r.Academic_Probation === "Yes" ? ` (${Number(r.Number_of_Probation_Occurrences) || 0}×)` : ""}</strong></div>
      <hr class="drawer-divider">
      <div class="drawer-row"><span>Predicted risk score</span><strong class="${tierClass}">${r.probability.toFixed(1)}%</strong></div>
      <div class="drawer-row"><span>Risk level</span><strong class="${tierClass}">${r.tier} Risk</strong></div>
      <div class="drawer-row"><span>Simulated label (binary)</span><strong>${escapeHtml(r.label)}</strong></div>
    </div>
    <div class="intervention-card ${tierClass}">
      <div class="intervention-title">${r.tier === 'High' ? 'Recommended intervention' : 'Recommended action'}</div>
      <ul>${recommendationHtml(r)}</ul>
    </div>
  `;
  drawerOverlay.classList.add("open");
}

/* SUMMARY PART */
function sparklinePath(values) {
  if (!values.length) return "";
  const w = 100, h = 26, pad = 2;
  if (values.length === 1) return `M${pad},${h - pad} L${w - pad},${h - pad}`;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  return values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

function renderCohortSummary() {
  const el = document.getElementById("cohortSummary-dash");
  const total = analysisResults.length;
  if (!total) { el.innerHTML = ""; return; }

  const low = analysisResults.filter((r) => r.tier === "Low");
  const medium = analysisResults.filter((r) => r.tier === "Medium");
  const high = analysisResults.filter((r) => r.tier === "High");
  const overall = Math.round((analysisResults.reduce((s, r) => s + r.probability, 0) / total) * 10) / 10;
  const overallTier = riskTier(overall);

  const pct = (n) => total ? Math.round((n / total) * 1000) / 10 : 0;

  const r = 34, cx = 42, cy = 42, sw = 10;
  const circumference = 2 * Math.PI * r;
  const segs = [
    { n: low.length, color: "var(--safe)" },
    { n: medium.length, color: "var(--warn)" },
    { n: high.length, color: "var(--danger)" }
  ];
  let offset = 0;
  const arcs = segs.map((s) => {
    const len = total ? (s.n / total) * circumference : 0;
    const arc = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${sw}"
      stroke-dasharray="${len} ${circumference - len}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"/>`;
    offset += len;
    return arc;
  }).join("");

  el.innerHTML = `
    <div class="stat-card total">
      <div class="stat-top"><div class="stat-icon total"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17.5" cy="8.5" r="2.6"/><path d="M15 14.3c2.9.4 5 2.3 5 5.7"/></svg></div><span class="stat-label">Total Students</span></div>
      <div class="stat-number">${total}</div>
      <div class="stat-sub">across this cohort</div>
    </div>
    <div class="stat-card low">
      <div class="stat-top"><div class="stat-icon low"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3.4"/><path d="M4.8 20c0-4 3.2-6.8 7.2-6.8s7.2 2.8 7.2 6.8"/></svg></div><span class="stat-label">Low Risk</span></div>
      <div class="stat-number">${low.length}</div>
      <div class="stat-sub">(${pct(low.length)}%)</div>
      <svg class="sparkline" viewBox="0 0 100 26" preserveAspectRatio="none"><path d="${sparklinePath(low.map((r2) => r2.probability).sort((a, b) => a - b))}" fill="none" stroke="var(--safe)" stroke-width="2"/></svg>
    </div>
    <div class="stat-card medium">
      <div class="stat-top"><div class="stat-icon medium"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3.4"/><path d="M4.8 20c0-4 3.2-6.8 7.2-6.8s7.2 2.8 7.2 6.8"/></svg></div><span class="stat-label">Medium Risk</span></div>
      <div class="stat-number">${medium.length}</div>
      <div class="stat-sub">(${pct(medium.length)}%)</div>
      <svg class="sparkline" viewBox="0 0 100 26" preserveAspectRatio="none"><path d="${sparklinePath(medium.map((r2) => r2.probability).sort((a, b) => a - b))}" fill="none" stroke="var(--warn)" stroke-width="2"/></svg>
    </div>
    <div class="stat-card high">
      <div class="stat-top"><div class="stat-icon high"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3.4"/><path d="M4.8 20c0-4 3.2-6.8 7.2-6.8s7.2 2.8 7.2 6.8"/></svg></div><span class="stat-label">High Risk</span></div>
      <div class="stat-number">${high.length}</div>
      <div class="stat-sub">(${pct(high.length)}%)</div>
      <svg class="sparkline" viewBox="0 0 100 26" preserveAspectRatio="none"><path d="${sparklinePath(high.map((r2) => r2.probability).sort((a, b) => a - b))}" fill="none" stroke="var(--danger)" stroke-width="2"/></svg>
    </div>
    <div class="stat-card overall-card">
      <div class="overall-text">
        <div class="overall-label">Overall Attrition Risk</div>
        <div class="overall-pct">${overall.toFixed(1)}%</div>
        <div class="overall-tier risk-${overallTier}">${overallTier.toUpperCase()} RISK</div>
      </div>
      <svg class="donut" viewBox="0 0 84 84">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#EEF0F8" stroke-width="${sw}"/>
        ${arcs}
      </svg>
    </div>
    <div class="intervention-panel">
      <div class="intervention-panel-head">
        <div><h3>High-Risk Student Intervention</h3><p>Recommended academic actions for students classified as high risk.</p></div>
        <span class="intervention-count">${high.length} students</span>
      </div>
      ${high.length ? `<div class="intervention-grid">${high.slice(0, 4).map(r => `<div class="intervention-item"><div class="intervention-item-top"><strong>${escapeHtml(r.student_id || 'Student ' + (r._idx + 1))}</strong><span class="badge risk-High">${r.probability.toFixed(0)}%</span></div><ul>${recommendationHtml(r)}</ul><button type="button" class="view-details-btn mini-view" data-idx="${r._idx}">View student details</button></div>`).join('')}</div><div class="intervention-foot">Showing recommendations for the four highest-risk students.</div>` : `<div class="intervention-empty">No high-risk students were identified in this cohort.</div>`}
    </div>
  `;
  el.querySelectorAll('.mini-view').forEach(btn => btn.addEventListener('click', () => openDrawer(Number(btn.dataset.idx))));
}

/* REPORT / PRINT */
function renderReport() {
  const reportSheet = document.getElementById("reportSheet");
  if (!analysisResults.length || !reportSheet) return;
  reportSheet.hidden = false;

  const total = analysisResults.length;
  const low = analysisResults.filter((r) => r.tier === "Low").length;
  const medium = analysisResults.filter((r) => r.tier === "Medium").length;
  const high = analysisResults.filter((r) => r.tier === "High").length;
  const overall = Math.round((analysisResults.reduce((s, r) => s + r.probability, 0) / total) * 10) / 10;

  document.getElementById("reportMeta").innerHTML = `
    Dataset: ${escapeHtml(datasetMeta ? datasetMeta.fileName : "—")}<br>
    Generated: ${fmtDatetime(new Date())}
  `;

  document.getElementById("reportStats").innerHTML = `
    <div class="report-stat"><div class="num">${total}</div><div class="lbl">Total students</div></div>
    <div class="report-stat"><div class="num" style="color:var(--safe)">${low}</div><div class="lbl">Low risk</div></div>
    <div class="report-stat"><div class="num" style="color:var(--warn)">${medium}</div><div class="lbl">Medium risk</div></div>
    <div class="report-stat"><div class="num" style="color:var(--danger)">${high}</div><div class="lbl">High risk</div></div>
    <div class="report-stat"><div class="num" style="color:var(--indigo)">${overall.toFixed(1)}%</div><div class="lbl">Overall risk</div></div>
  `;

  const highRisk = [...analysisResults].sort((a, b) => b.probability - a.probability).slice(0, 10);
  const hrRows = highRisk.map((r) => `
    <tr>
      <td>${escapeHtml(r.student_id || `record ${r._idx + 1}`)}</td>
      <td>${r.Level_of_Study}</td>
      <td>${Number(r.CGPA).toFixed(2)}</td>
      <td>${Number(r.Attendance_Percentage).toFixed(0)}%</td>
      <td>${r.probability.toFixed(1)}%</td>
      <td><span class="badge risk-${r.tier}">${r.tier} Risk</span></td>
    </tr>
  `).join("");
  document.getElementById("reportHighRiskTable").innerHTML = `
    <thead><tr><th>Student ID</th><th>Level</th><th>CGPA</th><th>Attendance</th><th>Risk score</th><th>Risk level</th></tr></thead>
    <tbody>${hrRows || `<tr><td colspan="6" class="muted">No records.</td></tr>`}</tbody>
  `;
}

/* ── INIT ── */
dashboardView.render();
loadPredictionHistory();
initializeAuth();
