const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const { getlogDb } = require("../../config/db");
const { uploadAppraisalReport, CheckIfFileExists } = require("../../middlewares/appraisal_multer");
const { join } = require("path");

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const safe = (value) => {
    if (value === undefined || value === null) return "-";
    if (typeof value === "string" && value.trim() === "") return "-";
    if (typeof value === "object") return "-";
    return String(value);
};

function formatShortYear(academicYear) {
    if (!academicYear) return "";
    const match = academicYear.match(/(\d{4})\D*(\d{2,4})?/);
    if (!match) return academicYear;
    const start = match[1].slice(-2);
    const end = match[2] ? match[2].slice(-2) : String(Number(start) + 1);
    return `${start}-${end}`;
}

const normalizeProofLink = (value) => {
    const s = String(value ?? "").trim();
    if (!s) return "-";
    const lowered = s.toLowerCase();
    if (["-", "na", "n/a", "null", "undefined"].includes(lowered)) return "-";
    if (!/^https?:\/\//i.test(s)) return "-";
    return s;
};

const formatPercent = (value) => {
    const s = safe(value);
    if (s === "-") return "-";
    return s.includes("%") ? s : `${s}%`;
};

const getPath = (obj, dotPath) => {
    const raw = dotPath.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
    return safe(raw);
};

// Updated to ignore "default" keys and empty strings mapping from DB
const pickYearValue = (metricObj, academicYear) => {
    if (!metricObj || typeof metricObj !== "object") return "-";

    if (metricObj[academicYear] !== undefined && metricObj[academicYear] !== "") {
        return metricObj[academicYear];
    }

    const keys = Object.keys(metricObj).filter((k) =>
        !["undertaking", "pdf_path", "default"].includes(k) && metricObj[k] !== ""
    );
    return keys.length ? metricObj[keys[0]] : "-";
};

const resolveNewSchemaValue = (obj, dotPath) => {
    const replaceBySemMetric = (prefix) => {
        const m = dotPath.match(new RegExp(`^${prefix}\\.(odd_sem|even_sem|consolidated|undertaking)\\.(.+)$`));
        if (!m) return undefined;
        return obj?.[prefix]?.[m[2]]?.[m[1]];
    };

    if (dotPath.startsWith("remarks.")) {
        const key = dotPath.replace("remarks.", "").replace("others.", "");
        return obj?.remarks?.[key]?.value || obj?.others?.[key]?.value;
    }

    if (dotPath.startsWith("student_admission_details.")) {
        const suffix = dotPath.replace("student_admission_details.", "");
        if (suffix === "sanctioned_strength") return obj?.student_admitted_details?.sanctioned_strength?.sanctioned_value;
        if (suffix === "students_on_roll") return obj?.student_admitted_details?.students_on_roll?.students_on_roll_value;
        if (suffix === "vacant_seats") return obj?.student_admitted_details?.vacant_seats?.vacant_seats_value;
        if (suffix === "undertaking.sanctioned_strength") return obj?.student_admitted_details?.sanctioned_strength?.undertaking;
        if (suffix === "undertaking.students_on_roll") return obj?.student_admitted_details?.students_on_roll?.undertaking;
        if (suffix === "undertaking.vacant_seats") return obj?.student_admitted_details?.vacant_seats?.undertaking;
    }

    if (dotPath === "essential_parameters.research_status") return obj?.essential_parameters?.research_status?.present_status;
    if (dotPath === "essential_parameters.nba_status") return obj?.essential_parameters?.nba_status?.present_status;
    if (dotPath === "essential_parameters.undertaking.research_status") return obj?.essential_parameters?.research_status?.undertaking;
    if (dotPath === "essential_parameters.undertaking.nba_status") return obj?.essential_parameters?.nba_status?.undertaking;

    const endSem = dotPath.match(/^end_sem_results\.(odd_sem|even_sem)\.year([1-4])\.(appeared|passed|pass_percent)$/);
    if (endSem) {
        const sem = endSem[1];
        const year = `year${endSem[2]}`;
        const metricMap = { appeared: "student_appeared", passed: "student_passed", pass_percent: "pass_percent" };
        return obj?.end_sem_results?.[metricMap[endSem[3]]]?.[sem]?.[year];
    }
    const endSemUndertaking = dotPath.match(/^end_sem_results\.undertaking\.(appeared|passed|pass_percent)$/);
    if (endSemUndertaking) {
        const metricMap = { appeared: "student_appeared", passed: "student_passed", pass_percent: "pass_percent" };
        return obj?.end_sem_results?.[metricMap[endSemUndertaking[1]]]?.undertaking;
    }

    const semFlippedPrefixes = ["faculty_learning", "phd_scholars", "research_funding", "professional_associations", "competitions_participated_won", "mou_centre_of_excellence"];
    for (const prefix of semFlippedPrefixes) {
        const m = dotPath.match(new RegExp(`^${prefix}\\.(odd_sem|even_sem|consolidated|undertaking)\\.(.+)$`));
        if (m) return obj?.[prefix]?.[m[2]]?.[m[1]];
    }

    if (dotPath.startsWith("consultancy.")) {
        const m = dotPath.match(/^consultancy\.(odd_sem|even_sem|consolidated|undertaking)\.amount_received$/);
        if (m) return obj?.consultancy?.amount_received?.[m[1]];
    }

    if (dotPath.startsWith("research_publications.")) {
        const m = dotPath.match(/^research_publications\.(odd_sem|even_sem|consolidated)\.(total_faculty|journals_sci_wos|journals_scopus|avg_publications_per_faculty)(?:\.(target|achieved|percentage))?$/);
        if (m) {
            const sem = m[1];
            const metric = m[2];
            const sub = m[3];
            if (metric === "total_faculty") return obj?.research_publications?.total_faculty?.[sem]?.target;
            if (sub) return obj?.research_publications?.[metric]?.[sem]?.[sub];
        }
        const mu = dotPath.match(/^research_publications\.undertaking\.(total_faculty|journals_sci_wos|journals_scopus|avg_publications_per_faculty)$/);
        if (mu) return obj?.research_publications?.[mu[1]]?.undertaking;
    }

    if (dotPath.startsWith("brand_building_admission.")) {
        const m = dotPath.match(/^brand_building_admission\.(odd_sem|even_sem|consolidated)\.(prospective_students_covered|students_converted_admissions)\.(target|achieved)$/);
        if (m) return obj?.brand_building_admission?.[m[2]]?.[m[1]]?.[m[3]];
        const mu = dotPath.match(/^brand_building_admission\.undertaking\.(prospective_students_covered|students_converted_admissions)$/);
        if (mu) return obj?.brand_building_admission?.[mu[1]]?.undertaking;
    }

    if (dotPath.startsWith("placements_higher_studies_entrepreneurship.")) {
        const p = "placements_higher_studies_entrepreneurship";
        if (dotPath === `${p}.companies_visited`) return obj?.[p]?.companies_visited?.companies_visited_value;
        if (dotPath === `${p}.median_salary`) return obj?.[p]?.median_salary?.median_salary_value;
        if (dotPath === `${p}.undertaking.companies_visited`) return obj?.[p]?.companies_visited?.undertaking;
        if (dotPath === `${p}.undertaking.median_salary`) return obj?.[p]?.median_salary?.undertaking;
        if (dotPath === `${p}.undertaking.students_placed_core_companies`) return obj?.[p]?.students_placed_core_companies?.undertaking;
        if (dotPath === `${p}.undertaking.students_admitted_higher_studies`) return obj?.[p]?.students_admitted_higher_studies?.undertaking;
        if (dotPath === `${p}.undertaking.entrepreneurs_evolved`) return obj?.[p]?.entrepreneurs_evolved?.undertaking;
        const m = dotPath.match(/^placements_higher_studies_entrepreneurship\.(students_placed_core_companies|students_admitted_higher_studies|entrepreneurs_evolved)\.(number|percentage)$/);
        if (m) return obj?.[p]?.[m[1]]?.[m[2]];
    }

    // Updated to map correctly from DB `.value`
    if (dotPath.startsWith("innovation_entrepreneurship_activities.")) {
        const k = dotPath.replace("innovation_entrepreneurship_activities.", "");
        if (k.startsWith("undertaking.")) return obj?.innovation_entrepreneurship_activities?.[k.replace("undertaking.", "")]?.undertaking;
        return obj?.innovation_entrepreneurship_activities?.[k]?.value;
    }

    if (dotPath.startsWith("graduation_success_rate.")) {
        const m = dotPath.match(/^graduation_success_rate\.(total_on_roll_final_sem|total_graduated|percent_graduated|average_cgpa|university_ranks)$/);
        if (m) {
            const map = { total_on_roll_final_sem: "total_on_roll", total_graduated: "total_graduated", percent_graduated: "percent_graduated", average_cgpa: "average_cgpa", university_ranks: "university_ranks" };
            return pickYearValue(obj?.graduation_success_rate?.[map[m[1]]], obj?.academic_year);
        }
        const mu = dotPath.match(/^graduation_success_rate\.undertaking\.(total_on_roll_final_sem|total_graduated|percent_graduated|average_cgpa|university_ranks)$/);
        if (mu) {
            const map = { total_on_roll_final_sem: "total_on_roll", total_graduated: "total_graduated", percent_graduated: "percent_graduated", average_cgpa: "average_cgpa", university_ranks: "university_ranks" };
            return obj?.graduation_success_rate?.[map[mu[1]]]?.undertaking;
        }
    }

    if (dotPath === "student_development_parameters.value_added_courses_conducted.total") {
        const objv = obj?.student_development_parameters?.value_added_courses_conducted;
        const t = ["year1", "year2", "year3", "year4"].reduce((a, k) => a + Number(objv?.[k] || 0), 0);
        return t ? String(t) : "-";
    }
    if (dotPath === "student_development_parameters.paid_internships.total") {
        const objv = obj?.student_development_parameters?.paid_internships;
        const t = ["year1", "year2", "year3", "year4"].reduce((a, k) => a + Number(objv?.[k] || 0), 0);
        return t ? String(t) : "-";
    }
    if (dotPath === "student_development_parameters.undertaking.value_added_courses_conducted") return obj?.student_development_parameters?.value_added_courses_conducted?.undertaking;
    if (dotPath === "student_development_parameters.undertaking.paid_internships") return obj?.student_development_parameters?.paid_internships?.undertaking;

    return undefined;
};

const getValue = (obj, dotPath) => {
    const withValue = getPath(obj, `${dotPath}.value`);
    if (withValue !== "-") return withValue;
    const direct = getPath(obj, dotPath);
    if (direct !== "-") return direct;
    return safe(resolveNewSchemaValue(obj, dotPath));
};

const getProofPath = (obj, dotPath) => {
    const readPdf = (p) => {
        const node = p.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
        return normalizeProofLink(node?.pdf_path);
    };

    const direct = readPdf(dotPath);
    if (direct !== "-") return direct;

    if (dotPath.startsWith("student_admission_details.")) {
        const mapped = dotPath.replace("student_admission_details.", "student_admitted_details.");
        const found = readPdf(mapped);
        if (found !== "-") return found;
    }

    const semFlip = dotPath.match(/^(faculty_learning|phd_scholars|research_funding|professional_associations|competitions_participated_won|mou_centre_of_excellence)\.(odd_sem|even_sem|consolidated|undertaking)\.(.+)$/);
    if (semFlip) {
        const found = readPdf(`${semFlip[1]}.${semFlip[3]}`);
        if (found !== "-") return found;
    }

    return "-";
};

const normalizeDepartment = (dept) => {
    const normalized = String(dept || "").trim().toLowerCase();
    if (normalized === "AI_DS" || normalized === "ai_ds") return "aids";
    return normalized;
};

const parseAcademicYearStart = (academicYear) => {
    const raw = String(academicYear || "").trim();
    const fourDigit = raw.match(/\b(19|20)\d{2}\b/);
    if (fourDigit) return Number(fourDigit[0]);
    const twoDigit = raw.match(/\b(\d{2})\b/);
    if (twoDigit) return 2000 + Number(twoDigit[1]);
    return -1;
};

// ==========================================
// WEB VIEW HELPER
// ==========================================
const buildWebProofRows = (node, path = [], inheritedProof = "-", rows = []) => {
    if (node === null || node === undefined) return rows;
    if (Array.isArray(node)) {
        node.forEach((item, idx) => buildWebProofRows(item, [...path, String(idx + 1)], inheritedProof, rows));
        return rows;
    }
    if (typeof node !== "object") {
        rows.push({ field: path.join("."), value: safe(node), proof_link: inheritedProof });
        return rows;
    }
    const proof = node.pdf_path ? normalizeProofLink(node.pdf_path) : normalizeProofLink(inheritedProof);
    for (const [key, value] of Object.entries(node)) {
        if (key === "pdf_path" || key === "_id") continue;
        buildWebProofRows(value, [...path, key], proof, rows);
    }
    return rows;
};

const buildSectionedWebView = (doc) => {
    const skipTop = new Set(["_id", "department", "academic_year", "createdAt", "updatedAt"]);
    const sections = [];
    for (const [key, value] of Object.entries(doc || {})) {
        if (skipTop.has(key)) continue;
        const rows = buildWebProofRows(value, [key]).filter((r) => r.value !== "-");
        if (!rows.length) continue;
        sections.push({ section: key, columns: ["field", "value", "proof_link"], rows });
    }
    return sections;
};

// ==========================================
// MAIN CONTROLLER
// ==========================================

const generateAppraisalDoc = async (req, res) => {

    try {
        const department = normalizeDepartment(req.body.department);
        const requestedAcademicYear = String(req.body.academic_year || "").trim();
        const requestedAcademicYearStart = parseAcademicYearStart(requestedAcademicYear);
        const reportType = String(req.body.report_type || "download").toLowerCase();

        const includeProofInDoc =
            req.body.include_proof === true ||
            String(req.body.include_proof).toLowerCase() === "true" ||
            String(req.originalUrl || "").toLowerCase().includes("with_proof");

        if (!department) return res.status(400).json({ message: "Department is required" });
        if (requestedAcademicYear && requestedAcademicYearStart < 0) return res.status(400).json({ message: "Invalid academic_year format" });

        const pdfFileName = includeProofInDoc
            ? `${department}_${requestedAcademicYear}_with_proof.pdf`
            : `${department}_${requestedAcademicYear}_without_proof.pdf`;

        const isFileExist = await CheckIfFileExists(`${department}/${requestedAcademicYear}/${pdfFileName}`);

        if (isFileExist.exists) {
            console.log("From S3");
            return res.status(200).json({
                success: true,
                message: "File Url from S3",
                pdf_Url: isFileExist?.url
            });
        } else {
            console.log("Generating New Report");
        }

        const db = getlogDb();
        const collectionName = `${department}_appraisals`;

        const reports = await db.collection(collectionName).find().toArray();
        const sortedReports = reports.sort((a, b) => parseAcademicYearStart(b?.academic_year) - parseAcademicYearStart(a?.academic_year));

        // Fetch up to 4 years for sections like Graduation Success Rate & Placements
        const latestReports = requestedAcademicYear
            ? sortedReports.filter((r) => parseAcademicYearStart(r?.academic_year) <= requestedAcademicYearStart).slice(0, 4)
            : sortedReports.slice(0, 4);

        if (!latestReports.length) {
            return res.status(404).json({ message: "No data found" });
        }

        const latest = latestReports[0];

        // Handle Web View immediately
        // if (reportType === "view") {
        //     const sections = buildSectionedWebView(latest);
        //     return res.status(200).json({ success: true, report_type: "view", department, academic_year: safe(latest.academic_year), sections });
        // }

        const history3 = latestReports.slice(0, 3);
        const history4 = latestReports;

        // HTML Row Helper
        const rRow = (cells, sectionProof) => {
            let html = `<tr>`;
            cells.forEach((c, idx) => {
                let alignClass = (idx === 1 && cells.length > 2) ? "text-left" : "text-center";
                html += `<td class="${alignClass}">${c}</td>`;
            });
            if (includeProofInDoc) {
                let p = normalizeProofLink(sectionProof);
                html += `<td class="text-center">${p !== "-" ? `<a href="${p}" target="_blank">Proof</a>` : "-"}</td>`;
            }
            html += `</tr>`;
            return html;
        };

        // HTML Header Helper
        const rHeaders = (headers) => {
            let html = `<tr>`;
            headers.forEach((h) => html += `<th>${h}</th>`);
            if (includeProofInDoc) html += `<th>Proof Link</th>`;
            html += `</tr>`;
            return html;
        };

        // --- BUILD FULL HTML STRUCTURE ---
        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <style>
                @page { size: A4; margin: 15mm; }
                body { 
                    font-family: 'Times New Roman', Times, serif; 
                    font-size: 8.5pt; 
                    color: #000; 
                    line-height: 1.4;
                    margin: 0;
                }
                .header-container {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    border-bottom: 1px solid black;
                    padding-bottom: 8px;
                    margin-bottom: 15px;
                }
                .logo { width: 90px; }
                .header-text { flex: 1; text-align: center; }
                .college-name { font-size: 16pt; font-weight: bold; letter-spacing: 1px; }
                .sub-text { font-size: 10pt; font-style: italic; }
                
                .heading { 
                    text-align: center; 
                    font-size: 14pt; 
                    font-weight: bold; 
                    text-decoration: underline; 
                    margin-bottom: 20px; 
                }
                .hod-details-table { 
                    width: 100%; 
                    border: none; 
                    margin-bottom: 15px; 
                    font-size: 10pt;
                }
                .hod-details-table td { border: none; padding: 2px; }
                
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-bottom: 20px; 
                    page-break-inside: avoid; 
                    table-layout: auto; 
                }
                tr { page-break-inside: avoid; page-break-after: auto; }
                th, td { 
                    border: 1px solid #000; 
                    padding: 4px; 
                    word-wrap: break-word; 
                    overflow-wrap: break-word; 
                }
                /* MS Word Style Light Blue Header */
                th { 
                    font-weight: bold; 
                    text-align: center; 
                    vertical-align: middle;
                }
                
                .text-center { text-align: center; }
                .text-left { text-align: left; }
                .dense-table th, .dense-table td { font-size: 7.5pt; padding: 2px; }
                
                .section-title { font-size: 11pt; font-weight: bold; margin: 20px 0 10px 0; text-decoration: underline; }
                a { color: #0563C1; text-decoration: underline; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header-container">
                <img class="logo" src="https://velammal.edu.in/VEC Logo.png" />
                <div class="header-text">
                    <div class="college-name">VELAMMAL ENGINEERING COLLEGE</div>
                    <div class="sub-text">An Autonomous Institution, Affiliated to Anna University, Chennai - 25</div>
                    <div class="sub-text">Velammal Newgen Park, Ambattur - Red Hills Road, Chennai - 600 066.</div>
                </div>
            </div>

            <div class="heading">Department Appraisal (ACY ${safe(latest.academic_year)})</div>
            
            <div class="hod-details" style="margin-top:20px; font-size:10pt;">
                <p>Name of the HoD: <strong>${getValue(latest, "hod_details.hod_name")}</strong></p>
                <p>Name of the Department: <strong>${getValue(latest, "hod_details.department_name")}</strong></p>
                <p>Date of Joining as Head of the Department: <strong>${getValue(latest, "hod_details.date_of_joining_as_hod")}</strong></p>
            </div>

            <table>
                ${rHeaders(["I", "ESSENTIAL PARAMETERS", "Present Status", `Commitment / Undertakings ${formatShortYear(latest.academic_year)}`])}
                ${rRow(["1", "Department Research status and period of recognition", getValue(latest, "essential_parameters.research_status"), getValue(latest, "essential_parameters.undertaking.research_status")], getProofPath(latest, "essential_parameters.research_status"))}
                ${rRow(["2", "Department NBA status and period of accreditation", getValue(latest, "essential_parameters.nba_status"), getValue(latest, "essential_parameters.undertaking.nba_status")], getProofPath(latest, "essential_parameters.nba_status"))}
            </table>

            <table>
                ${rHeaders(["II", "DEPARTMENT STUDENT ADMITTED DETAILS", ...history3.map(r => `AY ${safe(r.academic_year)}`), `Commitment / Undertakings ${formatShortYear(latest.academic_year)}`])}
                ${rRow(["1", "Sanctioned strength", ...history3.map((r) => getValue(r, "student_admission_details.sanctioned_strength")), getValue(latest, "student_admission_details.undertaking.sanctioned_strength")], getProofPath(latest, "student_admitted_details.sanctioned_strength"))}
                ${rRow(["2", "No of students on roll including LE", ...history3.map((r) => getValue(r, "student_admission_details.students_on_roll")), getValue(latest, "student_admission_details.undertaking.students_on_roll")], getProofPath(latest, "student_admitted_details.students_on_roll"))}
                ${rRow(["3", "Vacant seats", ...history3.map((r) => getValue(r, "student_admission_details.vacant_seats")), getValue(latest, "student_admission_details.undertaking.vacant_seats")], getProofPath(latest, "student_admitted_details.vacant_seats"))}
            </table>

            <table class="dense-table">
                <tr>
                    <th rowspan="2" style="width:3%;">III</th>
                    <th rowspan="2" style="width:25%;">END SEMESTER EXAM RESULTS ANALYSIS</th>
                    <th colspan="4">Odd Sem AY ${safe(latest.academic_year)}</th>
                    <th colspan="4">Even Sem AY ${safe(latest.academic_year)}</th>
                    <th rowspan="2" style="width:12%;">Commitment / Undertakings</th>
                    ${includeProofInDoc ? '<th rowspan="2" style="width:6%;">Proof Link</th>' : ''}
                </tr>
                <tr>
                    <th>I year</th><th>II year</th><th>III year</th><th>IV Year</th>
                    <th>I year</th><th>II year</th><th>III year</th><th>IV Year</th>
                </tr>
                ${rRow(["1", "Total no of students appeared",
            getValue(latest, "end_sem_results.odd_sem.year1.appeared"), getValue(latest, "end_sem_results.odd_sem.year2.appeared"), getValue(latest, "end_sem_results.odd_sem.year3.appeared"), getValue(latest, "end_sem_results.odd_sem.year4.appeared"),
            getValue(latest, "end_sem_results.even_sem.year1.appeared"), getValue(latest, "end_sem_results.even_sem.year2.appeared"), getValue(latest, "end_sem_results.even_sem.year3.appeared"), getValue(latest, "end_sem_results.even_sem.year4.appeared"),
            getValue(latest, "end_sem_results.undertaking.appeared")], getProofPath(latest, "end_sem_results.student_appeared"))}
                ${rRow(["2", "Total no of students passed",
                getValue(latest, "end_sem_results.odd_sem.year1.passed"), getValue(latest, "end_sem_results.odd_sem.year2.passed"), getValue(latest, "end_sem_results.odd_sem.year3.passed"), getValue(latest, "end_sem_results.odd_sem.year4.passed"),
                getValue(latest, "end_sem_results.even_sem.year1.passed"), getValue(latest, "end_sem_results.even_sem.year2.passed"), getValue(latest, "end_sem_results.even_sem.year3.passed"), getValue(latest, "end_sem_results.even_sem.year4.passed"),
                getValue(latest, "end_sem_results.undertaking.passed")], getProofPath(latest, "end_sem_results.student_passed"))}
                ${rRow(["3", "End. Sem Results (Pass % of the dept)",
                    getValue(latest, "end_sem_results.odd_sem.year1.pass_percent"), getValue(latest, "end_sem_results.odd_sem.year2.pass_percent"), getValue(latest, "end_sem_results.odd_sem.year3.pass_percent"), getValue(latest, "end_sem_results.odd_sem.year4.pass_percent"),
                    getValue(latest, "end_sem_results.even_sem.year1.pass_percent"), getValue(latest, "end_sem_results.even_sem.year2.pass_percent"), getValue(latest, "end_sem_results.even_sem.year3.pass_percent"), getValue(latest, "end_sem_results.even_sem.year4.pass_percent"),
                    getValue(latest, "end_sem_results.undertaking.pass_percent")], getProofPath(latest, "end_sem_results.pass_percent"))}
            </table>

            <table class="dense-table">
<tr>
                    <th style="width: 3%;">IV</th>
                    <th style="width: 25%;">GRADUATION SUCCESS RATE</th>
                    ${[0, 1, 2, 3].map(i => {
                        let batchText = "AY -";
                        if (history4[i] && history4[i].academic_year) {
                            const match = String(history4[i].academic_year).match(/(\d{4})/);
                            if (match) {
                                const startYear = parseInt(match[1], 10);
                                batchText = `${startYear - 3}-${startYear + 1}`;
                            }
                        }
                        return `<th>${batchText}</th>`;
                    }).join('')}
                    <th style="width: 15%;">Commitment / Undertakings ${(() => {
                if (latest && latest.academic_year) {
                    const match = String(latest.academic_year).match(/(\d{4})/);
                    if (match) {
                        const startYear = parseInt(match[1], 10) + 1; // Shift 1 year forward
                        return `for ${startYear - 3}-${String(startYear + 1).slice(-2)}`;
                    }
                }
                return "";
            })()}</th>
                    ${includeProofInDoc ? '<th style="width: 6%;">Proof Link</th>' : ''}
                </tr>             ${rRow([
                "1",
                "Total no of students on Roll during final sem",
                ...Array.from({ length: 4 }).map((_, i) =>
                    history4[i] ? getValue(history4[i], "graduation_success_rate.total_on_roll_final_sem") : "-"
                ),
                getValue(latest, "graduation_success_rate.undertaking.total_on_roll_final_sem")
            ], getProofPath(latest, "graduation_success_rate.total_on_roll"))}

${rRow([
                "2",
                "Total no of students Graduated",
                ...Array.from({ length: 4 }).map((_, i) =>
                    history4[i] ? getValue(history4[i], "graduation_success_rate.total_graduated") : "-"
                ),
                getValue(latest, "graduation_success_rate.undertaking.total_graduated")
            ], getProofPath(latest, "graduation_success_rate.total_graduated"))}

${rRow([
                "3",
                "% of students graduated",
                ...Array.from({ length: 4 }).map((_, i) =>
                    history4[i] ? getValue(history4[i], "graduation_success_rate.percent_graduated") : "-"
                ),
                getValue(latest, "graduation_success_rate.undertaking.percent_graduated")
            ], getProofPath(latest, "graduation_success_rate.percent_graduated"))}

${rRow([
                "4",
                "Average CGPA of the passed out batch",
                ...Array.from({ length: 4 }).map((_, i) =>
                    history4[i] ? getValue(history4[i], "graduation_success_rate.average_cgpa") : "-"
                ),
                getValue(latest, "graduation_success_rate.undertaking.average_cgpa")
            ], getProofPath(latest, "graduation_success_rate.average_cgpa"))}

${rRow([
                "5",
                "No of University Ranks / No of students over 9.4 CGPA",
                ...Array.from({ length: 4 }).map((_, i) =>
                    history4[i] ? getValue(history4[i], "graduation_success_rate.university_ranks") : "-"
                ),
                getValue(latest, "graduation_success_rate.undertaking.university_ranks")
            ], getProofPath(latest, "graduation_success_rate.university_ranks"))}         </table>

            <table>
                ${rHeaders(["V", "FACULTY CONTINUOUS LEARNING", `Odd Sem ${formatShortYear(latest.academic_year)}`, `Even Sem ${formatShortYear(latest.academic_year)}`, `Consolidated ${formatShortYear(latest.academic_year)}`, `Commitment / Undertakings ${formatShortYear(latest.academic_year)}`])}
                ${rRow(["1", "Total No. of Faculty", getValue(latest, "faculty_learning.odd_sem.total_faculty"), getValue(latest, "faculty_learning.even_sem.total_faculty"), getValue(latest, "faculty_learning.consolidated.total_faculty"), getValue(latest, "faculty_learning.undertaking.total_faculty")], getProofPath(latest, "faculty_learning.total_faculty"))}
                ${rRow(["2", "No of Faculty Completed NPTEL Online Courses with FDP certificate", getValue(latest, "faculty_learning.odd_sem.nptel_completed"), getValue(latest, "faculty_learning.even_sem.nptel_completed"), getValue(latest, "faculty_learning.consolidated.nptel_completed"), getValue(latest, "faculty_learning.undertaking.nptel_completed")], getProofPath(latest, "faculty_learning.nptel_completed"))}
                ${rRow(["3", "No of faculty attended FDPs (5 days)", getValue(latest, "faculty_learning.odd_sem.fdps_attended"), getValue(latest, "faculty_learning.even_sem.fdps_attended"), getValue(latest, "faculty_learning.consolidated.fdps_attended"), getValue(latest, "faculty_learning.undertaking.fdps_attended")], getProofPath(latest, "faculty_learning.fdps_attended"))}
                ${rRow(["4", "No. of FDPs organized by the dept (5 days)", getValue(latest, "faculty_learning.odd_sem.fdps_organized"), getValue(latest, "faculty_learning.even_sem.fdps_organized"), getValue(latest, "faculty_learning.consolidated.fdps_organized"), getValue(latest, "faculty_learning.undertaking.fdps_organized")], getProofPath(latest, "faculty_learning.fdps_organized"))}
            </table>

            <table>
                ${rHeaders(["VI", "Ph.D SCHOLARS", `Odd Sem ${formatShortYear(latest.academic_year)}`, `Even Sem ${formatShortYear(latest.academic_year)}`, `Consolidated ${formatShortYear(latest.academic_year)}`, `Commitment / Undertakings ${formatShortYear(latest.academic_year)}`])}
                ${rRow(["1", "No. of Faculty with PhD in Department", getValue(latest, "phd_scholars.odd_sem.faculty_with_phd"), getValue(latest, "phd_scholars.even_sem.faculty_with_phd"), getValue(latest, "phd_scholars.consolidated.faculty_with_phd"), getValue(latest, "phd_scholars.undertaking.faculty_with_phd")], getProofPath(latest, "phd_scholars.faculty_with_phd"))}
                ${rRow(["2", "No. of PhD Supervisors in Department (AU)", getValue(latest, "phd_scholars.odd_sem.phd_supervisors_au"), getValue(latest, "phd_scholars.even_sem.phd_supervisors_au"), getValue(latest, "phd_scholars.consolidated.phd_supervisors_au"), getValue(latest, "phd_scholars.undertaking.phd_supervisors_au")], getProofPath(latest, "phd_scholars.phd_supervisors_au"))}
                ${rRow(["3", "No. of Faculty Pursuing PhD", getValue(latest, "phd_scholars.odd_sem.faculty_pursuing_phd"), getValue(latest, "phd_scholars.even_sem.faculty_pursuing_phd"), getValue(latest, "phd_scholars.consolidated.faculty_pursuing_phd"), getValue(latest, "phd_scholars.undertaking.faculty_pursuing_phd")], getProofPath(latest, "phd_scholars.faculty_pursuing_phd"))}
                ${rRow(["4", "No. of Ph.D Scholars (Int + Ext) Pursuing in the dept Research centre", getValue(latest, "phd_scholars.odd_sem.phd_scholars_pursuing"), getValue(latest, "phd_scholars.even_sem.phd_scholars_pursuing"), getValue(latest, "phd_scholars.consolidated.phd_scholars_pursuing"), getValue(latest, "phd_scholars.undertaking.phd_scholars_pursuing")], getProofPath(latest, "phd_scholars.phd_scholars_pursuing"))}
                ${rRow(["5", "No. of (Int + Ext) Ph.D scholars completed in the dept Research centre", getValue(latest, "phd_scholars.odd_sem.phd_scholars_completed"), getValue(latest, "phd_scholars.even_sem.phd_scholars_completed"), getValue(latest, "phd_scholars.consolidated.phd_scholars_completed"), getValue(latest, "phd_scholars.undertaking.phd_scholars_completed")], getProofPath(latest, "phd_scholars.phd_scholars_completed"))}
            </table>

            <table class="dense-table">
                <tr>
                    <th rowspan="2" style="width:3%;">VII</th>
                    <th rowspan="2" style="width:20%;">RESEARCH PUBLICATIONS BY FACULTY</th>
                    <th colspan="3">Odd Sem ${safe(latest.academic_year)}</th>
                    <th colspan="3">Even Sem AY ${safe(latest.academic_year)}</th>
                    <th colspan="3">Consolidated AY ${safe(latest.academic_year)}</th>
                    <th rowspan="2" style="width:10%;">Commitment / Undertakings</th>
                    ${includeProofInDoc ? '<th rowspan="2" style="width:6%;">Proof Link</th>' : ''}
                </tr>
                <tr>
                    <th>Target</th><th>Achieved</th><th>%</th>
                    <th>Target</th><th>Achieved</th><th>%</th>
                    <th>Target</th><th>Achieved</th><th>%</th>
                </tr>
                ${rRow(["1", "Total Faculty", getValue(latest, "research_publications.odd_sem.total_faculty"), "-", "-", getValue(latest, "research_publications.even_sem.total_faculty"), "-", "-", getValue(latest, "research_publications.consolidated.total_faculty"), "-", "-", getValue(latest, "research_publications.undertaking.total_faculty")], getProofPath(latest, "research_publications.total_faculty"))}
                ${rRow(["2", "No. of Publications in Journals (SCI/ WoS)", getValue(latest, "research_publications.odd_sem.journals_sci_wos.target"), getValue(latest, "research_publications.odd_sem.journals_sci_wos.achieved"), getValue(latest, "research_publications.odd_sem.journals_sci_wos.percentage"), getValue(latest, "research_publications.even_sem.journals_sci_wos.target"), getValue(latest, "research_publications.even_sem.journals_sci_wos.achieved"), getValue(latest, "research_publications.even_sem.journals_sci_wos.percentage"), getValue(latest, "research_publications.consolidated.journals_sci_wos.target"), getValue(latest, "research_publications.consolidated.journals_sci_wos.achieved"), getValue(latest, "research_publications.consolidated.journals_sci_wos.percentage"), getValue(latest, "research_publications.undertaking.journals_sci_wos")], getProofPath(latest, "research_publications.journals_sci_wos"))}
                ${rRow(["3", "No. of Publications in Journals (Scopus)", getValue(latest, "research_publications.odd_sem.journals_scopus.target"), getValue(latest, "research_publications.odd_sem.journals_scopus.achieved"), getValue(latest, "research_publications.odd_sem.journals_scopus.percentage"), getValue(latest, "research_publications.even_sem.journals_scopus.target"), getValue(latest, "research_publications.even_sem.journals_scopus.achieved"), getValue(latest, "research_publications.even_sem.journals_scopus.percentage"), getValue(latest, "research_publications.consolidated.journals_scopus.target"), getValue(latest, "research_publications.consolidated.journals_scopus.achieved"), getValue(latest, "research_publications.consolidated.journals_scopus.percentage"), getValue(latest, "research_publications.undertaking.journals_scopus")], getProofPath(latest, "research_publications.journals_scopus"))}
                ${rRow(["4", "Avg publication per faculty in dept", getValue(latest, "research_publications.odd_sem.avg_publications_per_faculty.target"), getValue(latest, "research_publications.odd_sem.avg_publications_per_faculty.achieved"), getValue(latest, "research_publications.odd_sem.avg_publications_per_faculty.percentage"), getValue(latest, "research_publications.even_sem.avg_publications_per_faculty.target"), getValue(latest, "research_publications.even_sem.avg_publications_per_faculty.achieved"), getValue(latest, "research_publications.even_sem.avg_publications_per_faculty.percentage"), getValue(latest, "research_publications.consolidated.avg_publications_per_faculty.target"), getValue(latest, "research_publications.consolidated.avg_publications_per_faculty.achieved"), getValue(latest, "research_publications.consolidated.avg_publications_per_faculty.percentage"), getValue(latest, "research_publications.undertaking.avg_publications_per_faculty")], getProofPath(latest, "research_publications.avg_publications_per_faculty"))}
            </table>

            <table>
                ${rHeaders(["VIII", "RESEARCH FUNDING", `Odd Sem ${formatShortYear(latest.academic_year)}`, `Even Sem ${formatShortYear(latest.academic_year)}`, `Consolidated ${formatShortYear(latest.academic_year)}`, `Commitment / Undertakings ${formatShortYear(latest.academic_year)}`])}
                ${[
                ["No of Funded Projects sanctioned", "funded_projects_sanctioned"],
                ["Amount received through Funded Projects", "amount_received"],
                ["No. of Research Projects (Ongoing) - sanctioned in earlier years", "ongoing_projects_sanctioned_previous_years"],
                ["No. of Proposals & Amount sanctioned under MODROBS", "modrobs_proposals_and_amount"],
                ["No. of Proposals & Amount sanctioned For STTP / Workshops / FDP's / Entrepreneurship", "sttp_workshops_fdps_entrepreneurship_proposals_and_amount"],
                ["Any other funding for student schemes like IEDC / TNSCST", "other_student_schemes_iedc_tnscst"]
            ].map(([label, key], idx) =>
                rRow([String(idx + 1), label, getValue(latest, `research_funding.odd_sem.${key}`), getValue(latest, `research_funding.even_sem.${key}`), getValue(latest, `research_funding.consolidated.${key}`), getValue(latest, `research_funding.undertaking.${key}`)], getProofPath(latest, `research_funding.${key}`))
            ).join('')}
            </table>

            <table>
                ${rHeaders(["IX", "CONSULTANCY", `Odd Sem ${formatShortYear(latest.academic_year)}`, `Even Sem ${formatShortYear(latest.academic_year)}`, `Consolidated ${formatShortYear(latest.academic_year)}`, `Commitment / Undertakings ${formatShortYear(latest.academic_year)}`])}
                ${rRow(["1", "Amount received as Consultancy", getValue(latest, "consultancy.odd_sem.amount_received"), getValue(latest, "consultancy.even_sem.amount_received"), getValue(latest, "consultancy.consolidated.amount_received"), getValue(latest, "consultancy.undertaking.amount_received")], getProofPath(latest, "consultancy.amount_received"))}
            </table>

            <table class="dense-table">
                <tr>
                    <th rowspan="2" style="width:3%;">X</th>
                    <th rowspan="2" style="width:15%;">STUDENT DEVELOPMENT PARAMETERS</th>
                    <th colspan="5">AY ${safe(history3[0]?.academic_year)}</th>
                    <th colspan="5">AY ${safe(history3[1]?.academic_year)}</th>
                    <th colspan="5">AY ${safe(history3[2]?.academic_year)}</th>
                    <th rowspan="2" style="width:8%;">Commitment</th>
                    ${includeProofInDoc ? '<th rowspan="2" style="width:5%;">Proof</th>' : ''}
                </tr>
                <tr>
                    <th>I yr</th><th>II yr</th><th>III yr</th><th>IV yr</th><th>Total</th>
                    <th>I yr</th><th>II yr</th><th>III yr</th><th>IV yr</th><th>Total</th>
                    <th>I yr</th><th>II yr</th><th>III yr</th><th>IV yr</th><th>Total</th>
                </tr>
                ${rRow(["1", "No. of Value added courses conducted (30 hours) as per NAAC",
                getValue(history3[0] || {}, "student_development_parameters.value_added_courses_conducted.year1"), getValue(history3[0] || {}, "student_development_parameters.value_added_courses_conducted.year2"), getValue(history3[0] || {}, "student_development_parameters.value_added_courses_conducted.year3"), getValue(history3[0] || {}, "student_development_parameters.value_added_courses_conducted.year4"), getValue(history3[0] || {}, "student_development_parameters.value_added_courses_conducted.total"),
                getValue(history3[1] || {}, "student_development_parameters.value_added_courses_conducted.year1"), getValue(history3[1] || {}, "student_development_parameters.value_added_courses_conducted.year2"), getValue(history3[1] || {}, "student_development_parameters.value_added_courses_conducted.year3"), getValue(history3[1] || {}, "student_development_parameters.value_added_courses_conducted.year4"), getValue(history3[1] || {}, "student_development_parameters.value_added_courses_conducted.total"),
                getValue(history3[2] || {}, "student_development_parameters.value_added_courses_conducted.year1"), getValue(history3[2] || {}, "student_development_parameters.value_added_courses_conducted.year2"), getValue(history3[2] || {}, "student_development_parameters.value_added_courses_conducted.year3"), getValue(history3[2] || {}, "student_development_parameters.value_added_courses_conducted.year4"), getValue(history3[2] || {}, "student_development_parameters.value_added_courses_conducted.total"),
                getValue(latest, "student_development_parameters.undertaking.value_added_courses_conducted")], getProofPath(latest, "student_development_parameters.value_added_courses_conducted"))}
                ${rRow(["2", "No. of students who got paid Internship",
                    getValue(history3[0] || {}, "student_development_parameters.paid_internships.year1"), getValue(history3[0] || {}, "student_development_parameters.paid_internships.year2"), getValue(history3[0] || {}, "student_development_parameters.paid_internships.year3"), getValue(history3[0] || {}, "student_development_parameters.paid_internships.year4"), getValue(history3[0] || {}, "student_development_parameters.paid_internships.total"),
                    getValue(history3[1] || {}, "student_development_parameters.paid_internships.year1"), getValue(history3[1] || {}, "student_development_parameters.paid_internships.year2"), getValue(history3[1] || {}, "student_development_parameters.paid_internships.year3"), getValue(history3[1] || {}, "student_development_parameters.paid_internships.year4"), getValue(history3[1] || {}, "student_development_parameters.paid_internships.total"),
                    getValue(history3[2] || {}, "student_development_parameters.paid_internships.year1"), getValue(history3[2] || {}, "student_development_parameters.paid_internships.year2"), getValue(history3[2] || {}, "student_development_parameters.paid_internships.year3"), getValue(history3[2] || {}, "student_development_parameters.paid_internships.year4"), getValue(history3[2] || {}, "student_development_parameters.paid_internships.total"),
                    getValue(latest, "student_development_parameters.undertaking.paid_internships")], getProofPath(latest, "student_development_parameters.paid_internships"))}
            </table>

            <table>
                ${rHeaders(["XI", "PROFESSIONAL ASSOCIATIONS", `Odd Sem ${formatShortYear(latest.academic_year)}`, `Even Sem ${formatShortYear(latest.academic_year)}`, `Consolidated ${formatShortYear(latest.academic_year)}`, `Commitment / Undertakings ${formatShortYear(latest.academic_year)}`])}
                ${[
                ["No of faculty having Professional Society Membership", "faculty_professional_membership"],
                ["No. of Student Chapters of Professional Associations available in dept", "student_chapters_available"],
                ["Total number of student members in all chapters", "total_student_members"],
                ["No. of student chapter activities conducted", "student_chapter_activities"]
            ].map(([label, key], idx) =>
                rRow([String(idx + 1), label, getValue(latest, `professional_associations.odd_sem.${key}`), getValue(latest, `professional_associations.even_sem.${key}`), getValue(latest, `professional_associations.consolidated.${key}`), getValue(latest, `professional_associations.undertaking.${key}`)], getProofPath(latest, `professional_associations.${key}`))
            ).join('')}
            </table>

            <table>
                ${rHeaders(["XII", "COMPETITIONS PARTICIPATED / WON BY STUDENTS", `Odd Sem ${formatShortYear(latest.academic_year)}`, `Even Sem ${formatShortYear(latest.academic_year)}`, `Consolidated ${formatShortYear(latest.academic_year)}`, `Commitment / Undertakings ${formatShortYear(latest.academic_year)}`])}
                ${[
                ["No. of renowned competitions participated", "competitions_participated"],
                ["No. of awards won in competition like SIH / Design competitions etc", "awards_won"],
                ["Amount of Prize money received in the above competition", "prize_money_received"]
            ].map(([label, key], idx) =>
                rRow([String(idx + 1), label, getValue(latest, `competitions_participated_won.odd_sem.${key}`), getValue(latest, `competitions_participated_won.even_sem.${key}`), getValue(latest, `competitions_participated_won.consolidated.${key}`), getValue(latest, `competitions_participated_won.undertaking.${key}`)], getProofPath(latest, `competitions_participated_won.${key}`))
            ).join('')}
            </table>

            <table>
                ${rHeaders(["XIII", "MoU / CENTRE OF EXCELLENCE IN DEPARTMENT", `Odd Sem ${formatShortYear(latest.academic_year)}`, `Even Sem ${formatShortYear(latest.academic_year)}`, `Consolidated ${formatShortYear(latest.academic_year)}`, `Commitment / Undertakings ${formatShortYear(latest.academic_year)}`])}
                ${rRow(["1", "No. of functional MoU's signed with reputed Industries", getValue(latest, "mou_centre_of_excellence.odd_sem.mous_signed"), getValue(latest, "mou_centre_of_excellence.even_sem.mous_signed"), getValue(latest, "mou_centre_of_excellence.consolidated.mous_signed"), getValue(latest, "mou_centre_of_excellence.undertaking.mous_signed")], getProofPath(latest, "mou_centre_of_excellence.mous_signed"))}
                ${rRow(["2", "No. of Activities done through MoU of Industries", getValue(latest, "mou_centre_of_excellence.odd_sem.mou_activities"), getValue(latest, "mou_centre_of_excellence.even_sem.mou_activities"), getValue(latest, "mou_centre_of_excellence.consolidated.mou_activities"), getValue(latest, "mou_centre_of_excellence.undertaking.mou_activities")], getProofPath(latest, "mou_centre_of_excellence.mou_activities"))}
            </table>
<table class="dense-table">
                <tr>
                    <th style="width: 3%;">XIV</th>
                    <th style="width: 25%;">PLACEMENTS, HIGHER STUDIES, ENTREPRENEURSHIP</th>
                    ${[0, 1, 2, 3].map(i => `<th colspan="2">AY ${history4[i] ? safe(history4[i].academic_year) : '-'}</th>`).join('')}
                    <th style="width: 10%;">Commitment / Undertakings</th>
                    ${includeProofInDoc ? '<th style="width: 6%;">Proof Link</th>' : ''}
                </tr>
                <tr>
                    <td class="text-center">1</td>
                    <td class="text-left">No. of companies visited for your Department</td>
                    ${[0, 1, 2, 3].map(i => `<td colspan="2" class="text-center">${history4[i] ? safe(getValue(history4[i], "placements_higher_studies_entrepreneurship.companies_visited")) : '-'}</td>`).join('')}
                    <td class="text-center">${safe(getValue(latest, "placements_higher_studies_entrepreneurship.undertaking.companies_visited"))}</td>
                    ${includeProofInDoc ? `<td class="text-center">${getProofPath(latest, "placements_higher_studies_entrepreneurship.companies_visited") !== "-" ? `<a href="${getProofPath(latest, "placements_higher_studies_entrepreneurship.companies_visited")}" target="_blank">Proof</a>` : "-"}</td>` : ''}
                </tr>
                <tr>
                    <td class="text-center">2</td>
                    <td class="text-left">Median Salary of the Students Placed</td>
                    ${[0, 1, 2, 3].map(i => `<td colspan="2" class="text-center">${history4[i] ? safe(getValue(history4[i], "placements_higher_studies_entrepreneurship.median_salary")) : '-'}</td>`).join('')}
                    <td class="text-center">${safe(getValue(latest, "placements_higher_studies_entrepreneurship.undertaking.median_salary"))}</td>
                    ${includeProofInDoc ? `<td class="text-center">${getProofPath(latest, "placements_higher_studies_entrepreneurship.median_salary") !== "-" ? `<a href="${getProofPath(latest, "placements_higher_studies_entrepreneurship.median_salary")}" target="_blank">Proof</a>` : "-"}</td>` : ''}
                </tr>
                <tr>
                    <td class="text-center">3</td>
                    <td class="text-left">No. of students placed in Core Companies with % in terms of admitted total strength</td>
                    ${[0, 1, 2, 3].map(i => history4[i] ? `
                        <td class="text-center">${safe(getValue(history4[i], "placements_higher_studies_entrepreneurship.students_placed_core_companies.number"))}</td>
                        <td class="text-center">${formatPercent(getValue(history4[i], "placements_higher_studies_entrepreneurship.students_placed_core_companies.percentage"))}</td>
                    ` : `<td class="text-center">-</td><td class="text-center">-</td>`).join('')}
                    <td class="text-center">${safe(getValue(latest, "placements_higher_studies_entrepreneurship.undertaking.students_placed_core_companies"))}</td>
                    ${includeProofInDoc ? `<td class="text-center">${getProofPath(latest, "placements_higher_studies_entrepreneurship.students_placed_core_companies") !== "-" ? `<a href="${getProofPath(latest, "placements_higher_studies_entrepreneurship.students_placed_core_companies")}" target="_blank">Proof</a>` : "-"}</td>` : ''}
                </tr>
                <tr>
                    <td class="text-center">4</td>
                    <td class="text-left">No. of students admitted for higher studies with % in terms of total Admitted students strength.</td>
                    ${[0, 1, 2, 3].map(i => history4[i] ? `
                        <td class="text-center">${safe(getValue(history4[i], "placements_higher_studies_entrepreneurship.students_admitted_higher_studies.number"))}</td>
                        <td class="text-center">${formatPercent(getValue(history4[i], "placements_higher_studies_entrepreneurship.students_admitted_higher_studies.percentage"))}</td>
                    ` : `<td class="text-center">-</td><td class="text-center">-</td>`).join('')}
                    <td class="text-center">${safe(getValue(latest, "placements_higher_studies_entrepreneurship.undertaking.students_admitted_higher_studies"))}</td>
                    ${includeProofInDoc ? `<td class="text-center">${getProofPath(latest, "placements_higher_studies_entrepreneurship.students_admitted_higher_studies") !== "-" ? `<a href="${getProofPath(latest, "placements_higher_studies_entrepreneurship.students_admitted_higher_studies")}" target="_blank">Proof</a>` : "-"}</td>` : ''}
                </tr>
                <tr>
                    <td class="text-center">5</td>
                    <td class="text-left">No. of Entrepreneurs evolved with % in terms of total Admitted students strength</td>
                    ${[0, 1, 2, 3].map(i => history4[i] ? `
                        <td class="text-center">${safe(getValue(history4[i], "placements_higher_studies_entrepreneurship.entrepreneurs_evolved.number"))}</td>
                        <td class="text-center">${formatPercent(getValue(history4[i], "placements_higher_studies_entrepreneurship.entrepreneurs_evolved.percentage"))}</td>
                    ` : `<td class="text-center">-</td><td class="text-center">-</td>`).join('')}
                    <td class="text-center">${safe(getValue(latest, "placements_higher_studies_entrepreneurship.undertaking.entrepreneurs_evolved"))}</td>
                    ${includeProofInDoc ? `<td class="text-center">${getProofPath(latest, "placements_higher_studies_entrepreneurship.entrepreneurs_evolved") !== "-" ? `<a href="${getProofPath(latest, "placements_higher_studies_entrepreneurship.entrepreneurs_evolved")}" target="_blank">Proof</a>` : "-"}</td>` : ''}
                </tr>
            </table>
            <table>
                <tr>
                    <th rowspan="2" style="width:3%;">XV</th>
                    <th rowspan="2" style="width:25%;">BRAND BUILDING FOR ADMISSION</th>
                    <th colspan="2">Odd Sem AY ${safe(latest.academic_year)}</th>
                    <th colspan="2">Even Sem AY ${safe(latest.academic_year)}</th>
                    <th colspan="2">Consolidated AY ${safe(latest.academic_year)}</th>
                    <th rowspan="2" style="width:12%;">Commitment</th>
                    ${includeProofInDoc ? '<th rowspan="2" style="width:6%;">Proof</th>' : ''}
                </tr>
                <tr>
                    <th>Target</th><th>Achieved</th>
                    <th>Target</th><th>Achieved</th>
                    <th>Target</th><th>Achieved</th>
                </tr>
                ${rRow(["1", "No. of Prospective students covered during Branding (Database)", getValue(latest, "brand_building_admission.odd_sem.prospective_students_covered.target"), getValue(latest, "brand_building_admission.odd_sem.prospective_students_covered.achieved"), getValue(latest, "brand_building_admission.even_sem.prospective_students_covered.target"), getValue(latest, "brand_building_admission.even_sem.prospective_students_covered.achieved"), getValue(latest, "brand_building_admission.consolidated.prospective_students_covered.target"), getValue(latest, "brand_building_admission.consolidated.prospective_students_covered.achieved"), getValue(latest, "brand_building_admission.undertaking.prospective_students_covered")], getProofPath(latest, "brand_building_admission.prospective_students_covered"))}
                ${rRow(["2", "No. of students converted as Admissions", getValue(latest, "brand_building_admission.odd_sem.students_converted_admissions.target"), getValue(latest, "brand_building_admission.odd_sem.students_converted_admissions.achieved"), getValue(latest, "brand_building_admission.even_sem.students_converted_admissions.target"), getValue(latest, "brand_building_admission.even_sem.students_converted_admissions.achieved"), getValue(latest, "brand_building_admission.consolidated.students_converted_admissions.target"), getValue(latest, "brand_building_admission.consolidated.students_converted_admissions.achieved"), getValue(latest, "brand_building_admission.undertaking.students_converted_admissions")], getProofPath(latest, "brand_building_admission.students_converted_admissions"))}
            </table>

            <table>
                ${rHeaders(["XVI", "INNOVATION AND ENTREPRENEURSHIP ACTIVTIES", `AY ${safe(latest.academic_year)}`, history3[1] ? `AY ${safe(history3[1].academic_year)}` : "Previous AY", `Commitment / Undertakings ${formatShortYear(latest.academic_year)}`])}
                ${[
                ["No of Trained Innovation Ambassadors in Driving Department I&E Ecosystem", "trained_innovation_ambassadors"],
                ["How many teams participated in SIH", "teams_participated_sih"],
                ["Total no. of Innovations by dept in Different TRLs (4-9)in the YUKTI National Innovation Repository", "innovations_trl_4_9_yukti"],
                ["Total no of Students Ventures/Startups from the department are Recorded in the YUKTI repository", "student_ventures_yukti"],
                ["No of innovative ideas identified through final year projects / Mini Projects", "innovative_ideas_final_year_projects"],
                ["No. of Patents Filed", "patents_filed"],
                ["No. of Patents Published", "patents_published"],
                ["No. of Patents Granted", "patents_granted"],
                ["No patents filed through Kapila Scheme", "patents_filed_kapila_scheme"],
                ["Patents commercialized / transferred to Industry/ startup", "patents_commercialized"]
            ].map(([label, key], idx) =>
                rRow([String(idx + 1), label, getValue(latest, `innovation_entrepreneurship_activities.${key}`), history3[1] ? getValue(history3[1], `innovation_entrepreneurship_activities.${key}`) : "-", getValue(latest, `innovation_entrepreneurship_activities.undertaking.${key}`)], getProofPath(latest, `innovation_entrepreneurship_activities.${key}`))
            ).join('')}
            </table>

            

            <h3 style="margin-bottom: 5px; margin-top: 20px;">OTHERS</h3>
            <table style="width:100%; border-collapse:collapse; page-break-inside:auto;">
                <tr><td style="padding:10px;"><strong>(i) Steps taken (or being taken) for improving scores for NBA / NAAC / NIRF</strong><br><br>${safe(getValue(latest, "others.improve_scores_nba_naac_nirf.value"))}</td></tr>
                <tr><td style="padding:10px;"><strong>(ii) Documentary evidences of POs and PSOs attainment levels</strong><br><br>${safe(getValue(latest, "others.documentary_evidence_pos_psos.value"))}</td></tr>
                <tr><td style="padding:10px;"><strong>(iii) Identification of GAPs / Shortfalls (PEOs, PSOs)</strong><br><br>${safe(getValue(latest, "others.gaps_shortfalls_peos_psos.value"))}</td></tr>
                <tr><td style="padding:10px;"><strong>(iv) Plan of action to bridge the gap and its implementation</strong><br><br>${safe(getValue(latest, "others.plan_action_bridge_gap.value"))}</td></tr>
            </table>            

            <div class="text-section" style="margin-top: 20px;">
                <div class="section-title" style="text-decoration: none;">Appraisers Remarks</div>
                <table>
                    <tr>
                        <th style="width: 10%;">Sl.No</th>
                        <th style="width: 45%;">Name and Designation</th>
                        <th style="width: 45%;">Remarks</th>
                    </tr>
                    ${(latest.appraisers_remarks || []).length > 0
                ? (latest.appraisers_remarks).map((item, idx) => `
                            <tr>
                                <td class="text-center">${idx + 1}</td>
                                <td class="text-center">${safe(item?.name_and_designation)}</td>
                                <td class="text-center">${safe(item?.remarks)}</td>
                            </tr>`).join('')
                : `<tr><td class="text-center">1</td><td class="text-center">-</td><td class="text-center">-</td></tr>
                           <tr><td class="text-center">2</td><td class="text-center">-</td><td class="text-center">-</td></tr>`}
                </table>
            </div>

        </body>
        </html>
        `;

        // ==========================================
        // PDF GENERATION USING PUPPETEER
        // ==========================================
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' }
        });

        await browser.close();

        // Upload to S3
        const s3Url = await uploadAppraisalReport(pdfBuffer, `${department}/${latest.academic_year}/${pdfFileName}`);

        return res.status(200).json({
            success: true,
            message: "Report generated and uploaded successfully",
            pdf_Url: s3Url
        });

    } catch (error) {
        console.error("Error generating appraisal report:", error);
        return res.status(500).json({ message: "Error generating report" });
    }
};

module.exports = generateAppraisalDoc;