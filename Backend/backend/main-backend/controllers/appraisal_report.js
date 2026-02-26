const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { getlogDb } = require("../config/db");
const docxConverter = require("docx-pdf");
const libre = require("libreoffice-convert");
const util = require("util");

const {
    Document,
    Packer,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    TextRun,
    ExternalHyperlink,
    WidthType,
    TableLayoutType,
    AlignmentType,
    VerticalAlign,
} = require("docx");


function convertDocxToPdf(docxPath, pdfPath) {

    const word = new winax.Object("Word.Application");
    word.Visible = false;

    const doc = word.Documents.Open(docxPath);

    doc.SaveAs(pdfPath, 17); // 17 = PDF format

    doc.Close();
    word.Quit();
}
const FONT_SIZE_HEADING = 22; // 11 pt
const FONT_SIZE_HOD_DETAILS = 20; // 10 pt
const FONT_SIZE_OTHERS = 16; // 8 pt
let PROOF_COLUMN_MODE = false;

const headerCell = (text) =>
    new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        children: [
            new Paragraph({
                children: [new TextRun({ text: String(text || ""), bold: true, size: FONT_SIZE_OTHERS })],
                alignment: AlignmentType.CENTER,
            }),
        ],
        shading: { fill: "F2F2F2" },
    });

const dataCell = (text, alignment = AlignmentType.CENTER) =>
    new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        children: [
            new Paragraph({
                alignment,
                children: [new TextRun({ text: String(text ?? "-"), size: FONT_SIZE_OTHERS })],
            }),
        ],
    });

const proofCell = (link) => {
    const value = normalizeProofLink(link);
    if (value === "-") return dataCell("-", AlignmentType.LEFT);
    return new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        children: [
            new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                    new ExternalHyperlink({
                        link: value,
                        children: [
                            new TextRun({
                                text: "Proof",
                                color: "0563C1",
                                underline: {},
                                size: FONT_SIZE_OTHERS,
                            }),
                        ],
                    }),
                ],
            }),
        ],
    });
};

const sectionTitle = (text) =>
    new Paragraph({
        spacing: { before: 280, after: 120 },
        children: [new TextRun({ text, bold: true, size: FONT_SIZE_HEADING })],
    });

const hodDetailsParagraph = (text) =>
    new Paragraph({
        children: [new TextRun({ text: String(text || ""), size: FONT_SIZE_HOD_DETAILS })],
    });

const bodyParagraph = (text) =>
    new Paragraph({
        children: [new TextRun({ text: String(text || ""), size: FONT_SIZE_OTHERS })],
    });

const safe = (value) => {
    if (value === undefined || value === null) return "-";
    if (typeof value === "string" && value.trim() === "") return "-";
    if (typeof value === "object") return "-";
    return String(value);
};

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

const pickYearValue = (metricObj, academicYear) => {
    if (!metricObj || typeof metricObj !== "object") return "-";
    if (metricObj[academicYear] !== undefined) return metricObj[academicYear];
    const keys = Object.keys(metricObj).filter((k) => !["undertaking", "pdf_path"].includes(k));
    return keys.length ? metricObj[keys[0]] : "-";
};

const resolveNewSchemaValue = (obj, dotPath) => {
    const replaceBySemMetric = (prefix) => {
        const m = dotPath.match(new RegExp(`^${prefix}\\.(odd_sem|even_sem|consolidated|undertaking)\\.(.+)$`));
        if (!m) return undefined;
        const sem = m[1];
        const metric = m[2];
        return obj?.[prefix]?.[metric]?.[sem];
    };

    if (dotPath.startsWith("remarks.others.")) {
        const key = dotPath.replace("remarks.others.", "");
        return obj?.others?.[key]?.value;
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

    const semFlippedPrefixes = [
        "faculty_learning",
        "phd_scholars",
        "research_funding",
        "professional_associations",
        "competitions_participated_won",
        "mou_centre_of_excellence",
    ];
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

    if (dotPath.startsWith("innovation_entrepreneurship_activities.")) {
        const k = dotPath.replace("innovation_entrepreneurship_activities.", "");
        if (k.startsWith("undertaking.")) return obj?.innovation_entrepreneurship_activities?.[k.replace("undertaking.", "")]?.undertaking;
        const suffixMap = {
            trained_innovation_ambassadors: "trained_innovation_ambassadors_value",
            teams_participated_sih: "teams_participated_sihvalue",
            innovations_trl_4_9_yukti: "innovations_trl_4_9_yukti_value",
            student_ventures_yukti: "student_ventures_yukti_value",
            innovative_ideas_final_year_projects: "innovative_ideas_final_year_projects_value",
            patents_filed: "patents_filed_value",
            patents_published: "patents_published_value",
            patents_granted: "patents_granted_value",
            patents_filed_kapila_scheme: "patents_filed_kapila_scheme_value",
            patents_commercialized: "patents_commercialized_value",
        };
        if (suffixMap[k]) return obj?.innovation_entrepreneurship_activities?.[k]?.[suffixMap[k]];
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

    const consultancy = dotPath.match(/^consultancy\.(odd_sem|even_sem|consolidated|undertaking)\.amount_received$/);
    if (consultancy) {
        const found = readPdf("consultancy.amount_received");
        if (found !== "-") return found;
    }

    const rp = dotPath.match(/^research_publications\.(odd_sem|even_sem|consolidated|undertaking)\.(total_faculty|journals_sci_wos|journals_scopus|avg_publications_per_faculty)(?:\.(target|achieved|percentage))?$/);
    if (rp) {
        const found = readPdf(`research_publications.${rp[2]}`);
        if (found !== "-") return found;
    }

    const bba = dotPath.match(/^brand_building_admission\.(odd_sem|even_sem|consolidated|undertaking)\.(prospective_students_covered|students_converted_admissions)(?:\.(target|achieved))?$/);
    if (bba) {
        const found = readPdf(`brand_building_admission.${bba[2]}`);
        if (found !== "-") return found;
    }

    if (dotPath.startsWith("placements_higher_studies_entrepreneurship.")) {
        const m = dotPath.match(/^placements_higher_studies_entrepreneurship\.(companies_visited|median_salary|students_placed_core_companies|students_admitted_higher_studies|entrepreneurs_evolved)/);
        if (m) {
            const found = readPdf(`placements_higher_studies_entrepreneurship.${m[1]}`);
            if (found !== "-") return found;
        }
    }

    if (dotPath.startsWith("innovation_entrepreneurship_activities.")) {
        const metric = dotPath.replace("innovation_entrepreneurship_activities.", "").replace("undertaking.", "").split(".")[0];
        const found = readPdf(`innovation_entrepreneurship_activities.${metric}`);
        if (found !== "-") return found;
    }

    if (dotPath.startsWith("end_sem_results.")) {
        if (dotPath.includes(".appeared")) return readPdf("end_sem_results.student_appeared");
        if (dotPath.includes(".passed")) return readPdf("end_sem_results.student_passed");
        if (dotPath.includes(".pass_percent")) return readPdf("end_sem_results.pass_percent");
    }

    if (dotPath.startsWith("graduation_success_rate.")) {
        const map = {
            total_on_roll_final_sem: "total_on_roll",
            total_graduated: "total_graduated",
            percent_graduated: "percent_graduated",
            average_cgpa: "average_cgpa",
            university_ranks: "university_ranks",
        };
        const key = dotPath.replace("graduation_success_rate.", "").replace("undertaking.", "");
        if (map[key]) {
            const found = readPdf(`graduation_success_rate.${map[key]}`);
            if (found !== "-") return found;
        }
    }

    if (dotPath.startsWith("remarks.others.")) {
        const mapped = dotPath.replace("remarks.", "");
        const found = readPdf(mapped);
        if (found !== "-") return found;
    }

    return "-";
};

const normalizeDepartment = (dept) => {
    const normalized = String(dept || "").trim().toLowerCase();
    if (normalized === "AI_DS") return "AIDS";
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

const getSofficeCandidates = () => [
    "soffice",
    "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
    "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
];

// const convertDocxToPdf = (docxPath, outDir) => {
//     const candidates = getSofficeCandidates();
//     for (const cmd of candidates) {
//         if (cmd.includes(":\\") && !fs.existsSync(cmd)) continue;
//         const args = ["--headless", "--convert-to", "pdf", "--outdir", outDir, docxPath];
//         const result = spawnSync(cmd, args, {
//             encoding: "utf8",
//             timeout: 120000,
//             windowsHide: true,
//         });
//         if (result.status === 0) {
//             const pdfPath = path.join(outDir, `${path.parse(docxPath).name}.pdf`);
//             if (fs.existsSync(pdfPath)) return pdfPath;
//         }
//     }
//     throw new Error("PDF conversion failed. Install LibreOffice and ensure soffice is available.");
// };

const buildWebProofRows = (node, path = [], inheritedProof = "-", rows = []) => {
    if (node === null || node === undefined) return rows;
    if (Array.isArray(node)) {
        node.forEach((item, idx) => buildWebProofRows(item, [...path, String(idx + 1)], inheritedProof, rows));
        return rows;
    }
    if (typeof node !== "object") {
        rows.push({
            field: path.join("."),
            value: safe(node),
            proof_link: inheritedProof,
        });
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
        sections.push({
            section: key,
            columns: ["field", "value", "proof_link"],
            rows,
        });
    }
    return sections;
};

const makeTable = (headers, rows, sectionProofLink = "-") => {
    const totalColumns = headers.length + (PROOF_COLUMN_MODE ? 1 : 0);
    const totalWidth = 9900;
    let columnWidths = [totalWidth];

    if (totalColumns === 2) {
        columnWidths = [700, 9200];
    } else if (totalColumns > 2) {
        const firstColumn = 700;
        const secondColumn = 3500;
        const remainingColumns = totalColumns - 2;
        const remainingWidth = Math.max(totalWidth - firstColumn - secondColumn, remainingColumns * 650);
        const eachRemaining = Math.floor(remainingWidth / remainingColumns);
        columnWidths = [firstColumn, secondColumn, ...Array(remainingColumns).fill(eachRemaining)];
    }

    return new Table({
        layout: TableLayoutType.FIXED,
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths,
        rows: [
            new TableRow({
                children: [
                    ...headers.map((h) => headerCell(h)),
                    ...(PROOF_COLUMN_MODE ? [headerCell("Proof Link")] : []),
                ],
            }),
            ...(
                PROOF_COLUMN_MODE
                    ? rows.map((row) =>
                        new TableRow({
                            children: [
                                ...(row.options?.children || []),
                                proofCell(row.proofLink && row.proofLink !== "-" ? row.proofLink : sectionProofLink),
                            ],
                        })
                    )
                    : rows
            ),
        ],
    });
};

const makeRow = (cells, alignments, proofLink = "-") => {
    const row = new TableRow({
        children: cells.map((c, idx) =>
            dataCell(
                c,
                alignments?.[idx] ?? (idx === 1 ? AlignmentType.LEFT : AlignmentType.CENTER)
            )
        ),
    });
    row.proofLink = proofLink;
    return row;
};

const generateAppraisalDoc = async (req, res) => {
    try {
        const department = normalizeDepartment(req.body.department);
        const requestedAcademicYear = String(req.body.academic_year || "").trim();
        const requestedAcademicYearStart = parseAcademicYearStart(requestedAcademicYear);
        const reportType = String(req.body.report_type || "download").toLowerCase(); // download | view
        const includeProofInDoc =
            req.body.include_proof === true ||
            String(req.body.include_proof).toLowerCase() === "true" ||
            String(req.originalUrl || "").toLowerCase().includes("with_proof");
        const saveFileOnly = req.body.save_file === true || String(req.body.save_file).toLowerCase() === "true";
        if (!department) {
            return res.status(400).json({ message: "Department is required" });
        }
        if (requestedAcademicYear && requestedAcademicYearStart < 0) {
            return res.status(400).json({ message: "Invalid academic_year format" });
        }

        const db = getlogDb();
        console.log(department);

        const collectionName = `${department}_appraisals`;

        // Pick latest academic years by numeric year start (e.g. 2024-25 > 2023-24 > 2022-23)
        const reports = await db.collection(collectionName).find().toArray();
        const sortedReports = reports
            .sort((a, b) => parseAcademicYearStart(b?.academic_year) - parseAcademicYearStart(a?.academic_year));
        const latestReports = requestedAcademicYear
            ? sortedReports
                .filter((r) => parseAcademicYearStart(r?.academic_year) <= requestedAcademicYearStart)
                .slice(0, 3)
            : sortedReports.slice(0, 3);


        if (!latestReports.length) {
            return res.status(404).json({
                message: requestedAcademicYear
                    ? `No data found for 3 academic years up to and including ${requestedAcademicYear}`
                    : "No data found",
            });
        }

        const latest = latestReports[0];
        if (reportType === "view") {
            const sections = buildSectionedWebView(latest);
            return res.status(200).json({
                success: true,
                report_type: "view",
                department,
                academic_year: safe(latest.academic_year),
                sections,
            });
        }
        const history3 = latestReports;
        const history4 = latestReports;
        PROOF_COLUMN_MODE = includeProofInDoc;

        const blocks = [];

        blocks.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: `Department Appraisal (ACY ${safe(latest.academic_year)})`,
                        bold: true,
                        size: FONT_SIZE_HEADING,
                    }),
                ],
            }),
            hodDetailsParagraph(" "),
            hodDetailsParagraph(`Name of the HoD: ${getValue(latest, "hod_details.hod_name")}`),
            hodDetailsParagraph(`Name of the Department: ${getValue(latest, "hod_details.department_name")}`),
            hodDetailsParagraph(
                `Date of Joining as Head of the Department: ${getValue(latest, "hod_details.date_of_joining_as_hod")}`
            ),
            bodyParagraph(" ")
        );

        blocks.push(
            makeTable(
                ["I", "ESSENTIAL PARAMETERS", "Present Status", "Commitment Undertakings"],
                [
                    makeRow([
                        "1",
                        "Department Research status and period of recognition",
                        getValue(latest, "essential_parameters.research_status"),
                        getValue(latest, "essential_parameters.undertaking.research_status"),
                    ]),
                    makeRow([
                        "2",
                        "Department NBA status and period of accreditation",
                        getValue(latest, "essential_parameters.nba_status"),
                        getValue(latest, "essential_parameters.undertaking.nba_status"),
                    ]),
                ],
                getProofPath(latest, "essential_parameters.research_status")
            ),
            bodyParagraph(" ")
        );

        blocks.push(
            makeTable(
                [
                    "II",
                    "DEPARTMENT STUDENT ADMITTED DETAILS",
                    ...history3.map((r) => `AY ${safe(r.academic_year)}`),
                    "Commitment / Undertakings",
                ],
                [
                    makeRow([
                        "1",
                        "Sanctioned strength",
                        ...history3.map((r) => getValue(r, "student_admission_details.sanctioned_strength")),
                        getValue(latest, "student_admission_details.undertaking.sanctioned_strength"),
                    ]),
                    makeRow([
                        "2",
                        "No of students on roll including LE",
                        ...history3.map((r) => getValue(r, "student_admission_details.students_on_roll")),
                        getValue(latest, "student_admission_details.undertaking.students_on_roll"),
                    ]),
                    makeRow([
                        "3",
                        "Vacant seats",
                        ...history3.map((r) => getValue(r, "student_admission_details.vacant_seats")),
                        getValue(latest, "student_admission_details.undertaking.vacant_seats"),
                    ]),
                ],
                getProofPath(latest, "student_admitted_details.sanctioned_strength")
            ),
            bodyParagraph(" ")
        );

        blocks.push(
            new Table({
                layout: TableLayoutType.FIXED,
                width: { size: 100, type: WidthType.PERCENTAGE },
                columnWidths: [600, 3200, 700, 700, 700, 700, 700, 700, 700, 700, 1400],
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                verticalMerge: "restart",
                                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "III", bold: true, size: FONT_SIZE_OTHERS })] })],
                                shading: { fill: "F2F2F2" },
                            }),
                            new TableCell({
                                verticalMerge: "restart",
                                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "END SEMESTER EXAM RESULTS ANALYSIS", bold: true, size: FONT_SIZE_OTHERS })] })],
                                shading: { fill: "F2F2F2" },
                            }),
                            new TableCell({
                                columnSpan: 4,
                                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Odd Sem AY ${safe(latest.academic_year)}`, bold: true, size: FONT_SIZE_OTHERS })] })],
                                shading: { fill: "F2F2F2" },
                            }),
                            new TableCell({
                                columnSpan: 4,
                                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Even Sem AY ${safe(latest.academic_year)}`, bold: true, size: FONT_SIZE_OTHERS })] })],
                                shading: { fill: "F2F2F2" },
                            }),
                            new TableCell({
                                verticalMerge: "restart",
                                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Commitment / Undertakings", bold: true, size: FONT_SIZE_OTHERS })] })],
                                shading: { fill: "F2F2F2" },
                            }),
                        ],
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ verticalMerge: "continue", children: [new Paragraph("")] }),
                            new TableCell({ verticalMerge: "continue", children: [new Paragraph("")] }),
                            headerCell("I year"),
                            headerCell("II year"),
                            headerCell("III year"),
                            headerCell("IV Year"),
                            headerCell("I year"),
                            headerCell("II year"),
                            headerCell("III year"),
                            headerCell("IV Year"),
                            new TableCell({ verticalMerge: "continue", children: [new Paragraph("")] }),
                        ],
                    }),
                    makeRow([
                        "1",
                        "Total no of students appeared",
                        getValue(latest, "end_sem_results.odd_sem.year1.appeared"),
                        getValue(latest, "end_sem_results.odd_sem.year2.appeared"),
                        getValue(latest, "end_sem_results.odd_sem.year3.appeared"),
                        getValue(latest, "end_sem_results.odd_sem.year4.appeared"),
                        getValue(latest, "end_sem_results.even_sem.year1.appeared"),
                        getValue(latest, "end_sem_results.even_sem.year2.appeared"),
                        getValue(latest, "end_sem_results.even_sem.year3.appeared"),
                        getValue(latest, "end_sem_results.even_sem.year4.appeared"),
                        getValue(latest, "end_sem_results.undertaking.appeared"),
                    ]),
                    makeRow([
                        "2",
                        "Total no of students passed",
                        getValue(latest, "end_sem_results.odd_sem.year1.passed"),
                        getValue(latest, "end_sem_results.odd_sem.year2.passed"),
                        getValue(latest, "end_sem_results.odd_sem.year3.passed"),
                        getValue(latest, "end_sem_results.odd_sem.year4.passed"),
                        getValue(latest, "end_sem_results.even_sem.year1.passed"),
                        getValue(latest, "end_sem_results.even_sem.year2.passed"),
                        getValue(latest, "end_sem_results.even_sem.year3.passed"),
                        getValue(latest, "end_sem_results.even_sem.year4.passed"),
                        getValue(latest, "end_sem_results.undertaking.passed"),
                    ]),
                    makeRow([
                        "3",
                        "End. Sem Results (Pass % of the dept)",
                        getValue(latest, "end_sem_results.odd_sem.year1.pass_percent"),
                        getValue(latest, "end_sem_results.odd_sem.year2.pass_percent"),
                        getValue(latest, "end_sem_results.odd_sem.year3.pass_percent"),
                        getValue(latest, "end_sem_results.odd_sem.year4.pass_percent"),
                        getValue(latest, "end_sem_results.even_sem.year1.pass_percent"),
                        getValue(latest, "end_sem_results.even_sem.year2.pass_percent"),
                        getValue(latest, "end_sem_results.even_sem.year3.pass_percent"),
                        getValue(latest, "end_sem_results.even_sem.year4.pass_percent"),
                        getValue(latest, "end_sem_results.undertaking.pass_percent"),
                    ]),
                ],
            }),
            bodyParagraph(" ")
        );

        blocks.push(
            makeTable(
                ["IV", "GRADUATION SUCCESS RATE", ...history4.map((r) => `AY ${safe(r.academic_year)}`), "Commitment / Undertakings"],
                [
                    makeRow([
                        "1",
                        "Total no of students on roll during final sem",
                        ...history4.map((r) => getValue(r, "graduation_success_rate.total_on_roll_final_sem")),
                        getValue(latest, "graduation_success_rate.undertaking.total_on_roll_final_sem"),
                    ]),
                    makeRow([
                        "2",
                        "Total no of students graduated",
                        ...history4.map((r) => getValue(r, "graduation_success_rate.total_graduated")),
                        getValue(latest, "graduation_success_rate.undertaking.total_graduated"),
                    ]),
                    makeRow([
                        "3",
                        "% of students graduated",
                        ...history4.map((r) => getValue(r, "graduation_success_rate.percent_graduated")),
                        getValue(latest, "graduation_success_rate.undertaking.percent_graduated"),
                    ]),
                    makeRow([
                        "4",
                        "Average CGPA of the passed out batch",
                        ...history4.map((r) => getValue(r, "graduation_success_rate.average_cgpa")),
                        getValue(latest, "graduation_success_rate.undertaking.average_cgpa"),
                    ]),
                    makeRow([
                        "5",
                        "No of university ranks / no of students over 9.4 CGPA",
                        ...history4.map((r) => getValue(r, "graduation_success_rate.university_ranks")),
                        getValue(latest, "graduation_success_rate.undertaking.university_ranks"),
                    ]),
                ],
                getProofPath(latest, "graduation_success_rate.total_on_roll")
            ),
            bodyParagraph(" ")
        );

        blocks.push(
            makeTable(
                ["V", "FACULTY CONTINUOUS LEARNING", "Odd Sem", "Even Sem", "Consolidated", "Commitment / Undertakings"],
                [
                    makeRow([
                        "1",
                        "Total no of faculty",
                        getValue(latest, "faculty_learning.odd_sem.total_faculty"),
                        getValue(latest, "faculty_learning.even_sem.total_faculty"),
                        getValue(latest, "faculty_learning.consolidated.total_faculty"),
                        getValue(latest, "faculty_learning.undertaking.total_faculty"),
                    ]),
                    makeRow([
                        "2",
                        "No of faculty completed NPTEL online courses with FDP certificate",
                        getValue(latest, "faculty_learning.odd_sem.nptel_completed"),
                        getValue(latest, "faculty_learning.even_sem.nptel_completed"),
                        getValue(latest, "faculty_learning.consolidated.nptel_completed"),
                        getValue(latest, "faculty_learning.undertaking.nptel_completed"),
                    ]),
                    makeRow([
                        "3",
                        "No of faculty attended FDPs (5 days)",
                        getValue(latest, "faculty_learning.odd_sem.fdps_attended"),
                        getValue(latest, "faculty_learning.even_sem.fdps_attended"),
                        getValue(latest, "faculty_learning.consolidated.fdps_attended"),
                        getValue(latest, "faculty_learning.undertaking.fdps_attended"),
                    ]),
                    makeRow([
                        "4",
                        "No of FDPs organized by the department (5 days)",
                        getValue(latest, "faculty_learning.odd_sem.fdps_organized"),
                        getValue(latest, "faculty_learning.even_sem.fdps_organized"),
                        getValue(latest, "faculty_learning.consolidated.fdps_organized"),
                        getValue(latest, "faculty_learning.undertaking.fdps_organized"),
                    ]),
                ],
                getProofPath(latest, "faculty_learning.total_faculty")
            ),
            bodyParagraph(" ")
        );

        blocks.push(
            makeTable(
                ["VI", "Ph.D SCHOLARS", "Odd Sem", "Even Sem", "Consolidated", "Commitment / Undertakings"],
                [
                    makeRow([
                        "1",
                        "No of faculty with PhD in department",
                        getValue(latest, "phd_scholars.odd_sem.faculty_with_phd"),
                        getValue(latest, "phd_scholars.even_sem.faculty_with_phd"),
                        getValue(latest, "phd_scholars.consolidated.faculty_with_phd"),
                        getValue(latest, "phd_scholars.undertaking.faculty_with_phd"),
                    ]),
                    makeRow([
                        "2",
                        "No of PhD supervisors in department (AU)",
                        getValue(latest, "phd_scholars.odd_sem.phd_supervisors_au"),
                        getValue(latest, "phd_scholars.even_sem.phd_supervisors_au"),
                        getValue(latest, "phd_scholars.consolidated.phd_supervisors_au"),
                        getValue(latest, "phd_scholars.undertaking.phd_supervisors_au"),
                    ]),
                    makeRow([
                        "3",
                        "No of faculty pursuing PhD",
                        getValue(latest, "phd_scholars.odd_sem.faculty_pursuing_phd"),
                        getValue(latest, "phd_scholars.even_sem.faculty_pursuing_phd"),
                        getValue(latest, "phd_scholars.consolidated.faculty_pursuing_phd"),
                        getValue(latest, "phd_scholars.undertaking.faculty_pursuing_phd"),
                    ]),
                    makeRow([
                        "4",
                        "No of PhD scholars (Int + Ext) pursuing in dept research centre",
                        getValue(latest, "phd_scholars.odd_sem.phd_scholars_pursuing"),
                        getValue(latest, "phd_scholars.even_sem.phd_scholars_pursuing"),
                        getValue(latest, "phd_scholars.consolidated.phd_scholars_pursuing"),
                        getValue(latest, "phd_scholars.undertaking.phd_scholars_pursuing"),
                    ]),
                    makeRow([
                        "5",
                        "No of (Int + Ext) PhD scholars completed in dept research centre",
                        getValue(latest, "phd_scholars.odd_sem.phd_scholars_completed"),
                        getValue(latest, "phd_scholars.even_sem.phd_scholars_completed"),
                        getValue(latest, "phd_scholars.consolidated.phd_scholars_completed"),
                        getValue(latest, "phd_scholars.undertaking.phd_scholars_completed"),
                    ]),
                ],
                getProofPath(latest, "phd_scholars.faculty_with_phd")
            ),
            bodyParagraph(" ")
        );

        blocks.push(
            new Table({
                layout: TableLayoutType.FIXED,
                width: { size: 100, type: WidthType.PERCENTAGE },
                columnWidths: [600, 3000, 650, 650, 650, 650, 650, 650, 650, 650, 650, 1400],
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                verticalMerge: "restart",
                                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "VII", bold: true, size: FONT_SIZE_OTHERS })] })],
                                shading: { fill: "F2F2F2" },
                            }),
                            new TableCell({
                                verticalMerge: "restart",
                                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "RESEARCH PUBLICATIONS BY FACULTY", bold: true, size: FONT_SIZE_OTHERS })] })],
                                shading: { fill: "F2F2F2" },
                            }),
                            new TableCell({
                                columnSpan: 3,
                                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Odd Sem ${safe(latest.academic_year)} (JULY to DEC)`, bold: true, size: FONT_SIZE_OTHERS })] })],
                                shading: { fill: "F2F2F2" },
                            }),
                            new TableCell({
                                columnSpan: 3,
                                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Even Sem AY ${safe(latest.academic_year)} (JAN to JUN)`, bold: true, size: FONT_SIZE_OTHERS })] })],
                                shading: { fill: "F2F2F2" },
                            }),
                            new TableCell({
                                columnSpan: 3,
                                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Consolidated AY ${safe(latest.academic_year)}`, bold: true, size: FONT_SIZE_OTHERS })] })],
                                shading: { fill: "F2F2F2" },
                            }),
                            new TableCell({
                                verticalMerge: "restart",
                                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Commitment / Undertakings", bold: true, size: FONT_SIZE_OTHERS })] })],
                                shading: { fill: "F2F2F2" },
                            }),
                        ],
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ verticalMerge: "continue", children: [new Paragraph("")] }),
                            new TableCell({ verticalMerge: "continue", children: [new Paragraph("")] }),
                            headerCell("Target"),
                            headerCell("Achieved"),
                            headerCell("%"),
                            headerCell("Target"),
                            headerCell("Achieved"),
                            headerCell("%"),
                            headerCell("Target"),
                            headerCell("Achieved"),
                            headerCell("%"),
                            new TableCell({ verticalMerge: "continue", children: [new Paragraph("")] }),
                        ],
                    }),
                    makeRow([
                        "1",
                        "Total Faculty",
                        getValue(latest, "research_publications.odd_sem.total_faculty"),
                        "-",
                        "-",
                        getValue(latest, "research_publications.even_sem.total_faculty"),
                        "-",
                        "-",
                        getValue(latest, "research_publications.consolidated.total_faculty"),
                        "-",
                        "-",
                        getValue(latest, "research_publications.undertaking.total_faculty"),
                    ]),
                    makeRow([
                        "2",
                        "No. of Publications in Journals (SCI/ WoS)",
                        getValue(latest, "research_publications.odd_sem.journals_sci_wos.target"),
                        getValue(latest, "research_publications.odd_sem.journals_sci_wos.achieved"),
                        getValue(latest, "research_publications.odd_sem.journals_sci_wos.percentage"),
                        getValue(latest, "research_publications.even_sem.journals_sci_wos.target"),
                        getValue(latest, "research_publications.even_sem.journals_sci_wos.achieved"),
                        getValue(latest, "research_publications.even_sem.journals_sci_wos.percentage"),
                        getValue(latest, "research_publications.consolidated.journals_sci_wos.target"),
                        getValue(latest, "research_publications.consolidated.journals_sci_wos.achieved"),
                        getValue(latest, "research_publications.consolidated.journals_sci_wos.percentage"),
                        getValue(latest, "research_publications.undertaking.journals_sci_wos"),
                    ]),
                    makeRow([
                        "3",
                        "No. of Publications in Journals (Scopus)",
                        getValue(latest, "research_publications.odd_sem.journals_scopus.target"),
                        getValue(latest, "research_publications.odd_sem.journals_scopus.achieved"),
                        getValue(latest, "research_publications.odd_sem.journals_scopus.percentage"),
                        getValue(latest, "research_publications.even_sem.journals_scopus.target"),
                        getValue(latest, "research_publications.even_sem.journals_scopus.achieved"),
                        getValue(latest, "research_publications.even_sem.journals_scopus.percentage"),
                        getValue(latest, "research_publications.consolidated.journals_scopus.target"),
                        getValue(latest, "research_publications.consolidated.journals_scopus.achieved"),
                        getValue(latest, "research_publications.consolidated.journals_scopus.percentage"),
                        getValue(latest, "research_publications.undertaking.journals_scopus"),
                    ]),
                    makeRow([
                        "4",
                        "Avg publication per faculty in dept",
                        getValue(latest, "research_publications.odd_sem.avg_publications_per_faculty.target"),
                        getValue(latest, "research_publications.odd_sem.avg_publications_per_faculty.achieved"),
                        getValue(latest, "research_publications.odd_sem.avg_publications_per_faculty.percentage"),
                        getValue(latest, "research_publications.even_sem.avg_publications_per_faculty.target"),
                        getValue(latest, "research_publications.even_sem.avg_publications_per_faculty.achieved"),
                        getValue(latest, "research_publications.even_sem.avg_publications_per_faculty.percentage"),
                        getValue(latest, "research_publications.consolidated.avg_publications_per_faculty.target"),
                        getValue(latest, "research_publications.consolidated.avg_publications_per_faculty.achieved"),
                        getValue(latest, "research_publications.consolidated.avg_publications_per_faculty.percentage"),
                        getValue(latest, "research_publications.undertaking.avg_publications_per_faculty"),
                    ]),
                ],
            }),
            bodyParagraph(" ")
        );

        blocks.push(
            makeTable(
                ["VIII", "RESEARCH FUNDING", "Odd Sem", "Even Sem", "Consolidated", "Commitment / Undertakings"],
                [
                    ["No of funded projects sanctioned", "funded_projects_sanctioned"],
                    ["Amount received through funded projects", "amount_received"],
                    ["No of research projects (ongoing) sanctioned in earlier years", "ongoing_projects_sanctioned_previous_years"],
                    ["No of proposals and amount sanctioned under MODROBS", "modrobs_proposals_and_amount"],
                    ["No of proposals and amount sanctioned for STTP / Workshops / FDP / Entrepreneurship", "sttp_workshops_fdps_entrepreneurship_proposals_and_amount"],
                    ["Any other funding for student schemes like IEDC / TNSCST", "other_student_schemes_iedc_tnscst"],
                ].map(([label, key], idx) =>
                    makeRow([
                        String(idx + 1),
                        label,
                        getValue(latest, `research_funding.odd_sem.${key}`),
                        getValue(latest, `research_funding.even_sem.${key}`),
                        getValue(latest, `research_funding.consolidated.${key}`),
                        getValue(latest, `research_funding.undertaking.${key}`),
                    ])
                ),
                getProofPath(latest, "research_funding.funded_projects_sanctioned")
            ),
            bodyParagraph(" ")
        );

        blocks.push(
            makeTable(
                ["IX", "CONSULTANCY", "Odd Sem", "Even Sem", "Consolidated", "Commitment / Undertakings"],
                [
                    makeRow([
                        "1",
                        "Amount received as consultancy",
                        getValue(latest, "consultancy.odd_sem.amount_received"),
                        getValue(latest, "consultancy.even_sem.amount_received"),
                        getValue(latest, "consultancy.consolidated.amount_received"),
                        getValue(latest, "consultancy.undertaking.amount_received"),
                    ]),
                ],
                getProofPath(latest, "consultancy.amount_received")
            ),
            bodyParagraph(" ")
        );

        blocks.push(
            new Table({
                layout: TableLayoutType.FIXED,
                width: { size: 100, type: WidthType.PERCENTAGE },
                columnWidths: [
                    700, 3200,
                    800, 800, 800, 800, 1000,
                    800, 800, 800, 800, 1000,
                    800, 800, 800, 800, 1000,
                    1500,
                ],
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                verticalMerge: "restart",
                                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "X", bold: true, size: FONT_SIZE_OTHERS })] })],
                                shading: { fill: "F2F2F2" },
                            }),
                            new TableCell({
                                verticalMerge: "restart",
                                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "STUDENT DEVELOPMENT PARAMETERS", bold: true, size: FONT_SIZE_OTHERS })] })],
                                shading: { fill: "F2F2F2" },
                            }),
                            new TableCell({
                                columnSpan: 5,
                                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `AY ${safe(history3[0]?.academic_year)}`, bold: true, size: FONT_SIZE_OTHERS })] })],
                                shading: { fill: "F2F2F2" },
                            }),
                            new TableCell({
                                columnSpan: 5,
                                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `AY ${safe(history3[1]?.academic_year)}`, bold: true, size: FONT_SIZE_OTHERS })] })],
                                shading: { fill: "F2F2F2" },
                            }),
                            new TableCell({
                                columnSpan: 5,
                                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `AY ${safe(history3[2]?.academic_year)}`, bold: true, size: FONT_SIZE_OTHERS })] })],
                                shading: { fill: "F2F2F2" },
                            }),
                            new TableCell({
                                verticalMerge: "restart",
                                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Commitment / Undertakings", bold: true, size: FONT_SIZE_OTHERS })] })],
                                shading: { fill: "F2F2F2" },
                            }),
                        ],
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ verticalMerge: "continue", children: [new Paragraph("")] }),
                            new TableCell({ verticalMerge: "continue", children: [new Paragraph("")] }),
                            headerCell("I yr"),
                            headerCell("II yr"),
                            headerCell("III yr"),
                            headerCell("IV yr"),
                            headerCell("Total"),
                            headerCell("I yr"),
                            headerCell("II yr"),
                            headerCell("III yr"),
                            headerCell("IV yr"),
                            headerCell("Total"),
                            headerCell("I yr"),
                            headerCell("II yr"),
                            headerCell("III yr"),
                            headerCell("IV yr"),
                            headerCell("Total"),
                            new TableCell({ verticalMerge: "continue", children: [new Paragraph("")] }),
                        ],
                    }),
                    makeRow([
                        "1",
                        "No. of Value added courses conducted (30 hours) as per NAAC",
                        getValue(history3[0] || {}, "student_development_parameters.value_added_courses_conducted.year1"),
                        getValue(history3[0] || {}, "student_development_parameters.value_added_courses_conducted.year2"),
                        getValue(history3[0] || {}, "student_development_parameters.value_added_courses_conducted.year3"),
                        getValue(history3[0] || {}, "student_development_parameters.value_added_courses_conducted.year4"),
                        getValue(history3[0] || {}, "student_development_parameters.value_added_courses_conducted.total"),
                        getValue(history3[1] || {}, "student_development_parameters.value_added_courses_conducted.year1"),
                        getValue(history3[1] || {}, "student_development_parameters.value_added_courses_conducted.year2"),
                        getValue(history3[1] || {}, "student_development_parameters.value_added_courses_conducted.year3"),
                        getValue(history3[1] || {}, "student_development_parameters.value_added_courses_conducted.year4"),
                        getValue(history3[1] || {}, "student_development_parameters.value_added_courses_conducted.total"),
                        getValue(history3[2] || {}, "student_development_parameters.value_added_courses_conducted.year1"),
                        getValue(history3[2] || {}, "student_development_parameters.value_added_courses_conducted.year2"),
                        getValue(history3[2] || {}, "student_development_parameters.value_added_courses_conducted.year3"),
                        getValue(history3[2] || {}, "student_development_parameters.value_added_courses_conducted.year4"),
                        getValue(history3[2] || {}, "student_development_parameters.value_added_courses_conducted.total"),
                        getValue(latest, "student_development_parameters.undertaking.value_added_courses_conducted"),
                    ]),
                    makeRow([
                        "2",
                        "No. of students who got paid Internship",
                        getValue(history3[0] || {}, "student_development_parameters.paid_internships.year1"),
                        getValue(history3[0] || {}, "student_development_parameters.paid_internships.year2"),
                        getValue(history3[0] || {}, "student_development_parameters.paid_internships.year3"),
                        getValue(history3[0] || {}, "student_development_parameters.paid_internships.year4"),
                        getValue(history3[0] || {}, "student_development_parameters.paid_internships.total"),
                        getValue(history3[1] || {}, "student_development_parameters.paid_internships.year1"),
                        getValue(history3[1] || {}, "student_development_parameters.paid_internships.year2"),
                        getValue(history3[1] || {}, "student_development_parameters.paid_internships.year3"),
                        getValue(history3[1] || {}, "student_development_parameters.paid_internships.year4"),
                        getValue(history3[1] || {}, "student_development_parameters.paid_internships.total"),
                        getValue(history3[2] || {}, "student_development_parameters.paid_internships.year1"),
                        getValue(history3[2] || {}, "student_development_parameters.paid_internships.year2"),
                        getValue(history3[2] || {}, "student_development_parameters.paid_internships.year3"),
                        getValue(history3[2] || {}, "student_development_parameters.paid_internships.year4"),
                        getValue(history3[2] || {}, "student_development_parameters.paid_internships.total"),
                        getValue(latest, "student_development_parameters.undertaking.paid_internships"),
                    ]),
                ],
            }),
            bodyParagraph(" ")
        );

        blocks.push(
            makeTable(
                ["XI", "PROFESSIONAL ASSOCIATIONS", "Odd Sem", "Even Sem", "Consolidated", "Commitment / Undertakings"],
                [
                    ["No of faculty having professional society membership", "faculty_professional_membership"],
                    ["No of student chapters of professional associations available in dept", "student_chapters_available"],
                    ["Total number of student members in all chapters", "total_student_members"],
                    ["No of student chapter activities conducted", "student_chapter_activities"],
                ].map(([label, key], idx) =>
                    makeRow([
                        String(idx + 1),
                        label,
                        getValue(latest, `professional_associations.odd_sem.${key}`),
                        getValue(latest, `professional_associations.even_sem.${key}`),
                        getValue(latest, `professional_associations.consolidated.${key}`),
                        getValue(latest, `professional_associations.undertaking.${key}`),
                    ])
                ),
                getProofPath(latest, "professional_associations.faculty_professional_membership")
            ),
            bodyParagraph(" ")
        );

        blocks.push(
            makeTable(
                ["XII", "COMPETITIONS PARTICIPATED / WON BY STUDENTS", "Odd Sem", "Even Sem", "Consolidated", "Commitment / Undertakings"],
                [
                    ["No of renowned competitions participated", "competitions_participated"],
                    ["No of awards won in competitions (SIH / design competitions etc.)", "awards_won"],
                    ["Amount of prize money received in above competitions", "prize_money_received"],
                ].map(([label, key], idx) =>
                    makeRow([
                        String(idx + 1),
                        label,
                        getValue(latest, `competitions_participated_won.odd_sem.${key}`),
                        getValue(latest, `competitions_participated_won.even_sem.${key}`),
                        getValue(latest, `competitions_participated_won.consolidated.${key}`),
                        getValue(latest, `competitions_participated_won.undertaking.${key}`),
                    ])
                ),
                getProofPath(latest, "competitions_participated_won.competitions_participated")
            ),
            bodyParagraph(" ")
        );

        blocks.push(
            makeTable(
                ["XIII", "MoU / CENTRE OF EXCELLENCE IN DEPARTMENT", "Odd Sem", "Even Sem", "Consolidated", "Commitment / Undertakings"],
                [
                    makeRow([
                        "1",
                        "No of functional MoUs signed with reputed industries",
                        getValue(latest, "mou_centre_of_excellence.odd_sem.mous_signed"),
                        getValue(latest, "mou_centre_of_excellence.even_sem.mous_signed"),
                        getValue(latest, "mou_centre_of_excellence.consolidated.mous_signed"),
                        getValue(latest, "mou_centre_of_excellence.undertaking.mous_signed"),
                    ]),
                    makeRow([
                        "2",
                        "No of activities done through MoU of industries",
                        getValue(latest, "mou_centre_of_excellence.odd_sem.mou_activities"),
                        getValue(latest, "mou_centre_of_excellence.even_sem.mou_activities"),
                        getValue(latest, "mou_centre_of_excellence.consolidated.mou_activities"),
                        getValue(latest, "mou_centre_of_excellence.undertaking.mou_activities"),
                    ]),
                ],
                getProofPath(latest, "mou_centre_of_excellence.mous_signed")
            ),
            bodyParagraph(" ")
        );

        blocks.push(
            new Table({
                layout: TableLayoutType.FIXED,
                width: { size: 100, type: WidthType.PERCENTAGE },
                columnWidths: [600, 3500, ...history4.flatMap(() => [650, 650]), 1500],
                rows: [
                    new TableRow({
                        children: [
                            headerCell("XIV"),
                            headerCell("PLACEMENTS, HIGHER STUDIES, ENTREPRENEURSHIP"),
                            ...history4.flatMap((r) => [
                                new TableCell({
                                    columnSpan: 2,
                                    children: [
                                        new Paragraph({
                                            alignment: AlignmentType.CENTER,
                                            children: [new TextRun({ text: `AY ${safe(r.academic_year)}`, bold: true, size: FONT_SIZE_OTHERS })],
                                        }),
                                    ],
                                    shading: { fill: "F2F2F2" },
                                }),
                            ]),
                            headerCell("Commitment / Undertakings"),
                        ],
                    }),
                    new TableRow({
                        children: [
                            dataCell("1", AlignmentType.CENTER),
                            dataCell("No. of companies visited for your Department", AlignmentType.LEFT),
                            ...history4.map((r) =>
                                new TableCell({
                                    verticalAlign: VerticalAlign.CENTER,
                                    columnSpan: 2,
                                    children: [
                                        new Paragraph({
                                            alignment: AlignmentType.CENTER,
                                            children: [new TextRun({ text: getValue(r, "placements_higher_studies_entrepreneurship.companies_visited"), size: FONT_SIZE_OTHERS })],
                                        }),
                                    ],
                                })
                            ),
                            dataCell(getValue(latest, "placements_higher_studies_entrepreneurship.undertaking.companies_visited"), AlignmentType.CENTER),
                        ],
                    }),
                    new TableRow({
                        children: [
                            dataCell("2", AlignmentType.CENTER),
                            dataCell("Median Salary of the Students Placed", AlignmentType.LEFT),
                            ...history4.map((r) =>
                                new TableCell({
                                    verticalAlign: VerticalAlign.CENTER,
                                    columnSpan: 2,
                                    children: [
                                        new Paragraph({
                                            alignment: AlignmentType.CENTER,
                                            children: [new TextRun({ text: getValue(r, "placements_higher_studies_entrepreneurship.median_salary"), size: FONT_SIZE_OTHERS })],
                                        }),
                                    ],
                                })
                            ),
                            dataCell(getValue(latest, "placements_higher_studies_entrepreneurship.undertaking.median_salary"), AlignmentType.CENTER),
                        ],
                    }),
                    makeRow([
                        "3",
                        "No. of students placed in Core Companies with % in terms of admitted total strength",
                        ...history4.flatMap((r) => [
                            getValue(r, "placements_higher_studies_entrepreneurship.students_placed_core_companies.number"),
                            formatPercent(getValue(r, "placements_higher_studies_entrepreneurship.students_placed_core_companies.percentage")),
                        ]),
                        getValue(latest, "placements_higher_studies_entrepreneurship.undertaking.students_placed_core_companies"),
                    ]),
                    makeRow([
                        "4",
                        "No. of students admitted for higher studies with % in terms of total admitted students strength",
                        ...history4.flatMap((r) => [
                            getValue(r, "placements_higher_studies_entrepreneurship.students_admitted_higher_studies.number"),
                            formatPercent(getValue(r, "placements_higher_studies_entrepreneurship.students_admitted_higher_studies.percentage")),
                        ]),
                        getValue(latest, "placements_higher_studies_entrepreneurship.undertaking.students_admitted_higher_studies"),
                    ]),
                ],
            }),
            bodyParagraph(" ")
        );

        blocks.push(
            new Table({
                layout: TableLayoutType.FIXED,
                width: { size: 100, type: WidthType.PERCENTAGE },
                columnWidths: [600, 3200, 700, 700, 700, 700, 700, 700, 1500],
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                verticalMerge: "restart",
                                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "XV", bold: true, size: FONT_SIZE_OTHERS })] })],
                                shading: { fill: "F2F2F2" },
                            }),
                            new TableCell({
                                verticalMerge: "restart",
                                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "BRAND BUILDING FOR ADMISSION", bold: true, size: FONT_SIZE_OTHERS })] })],
                                shading: { fill: "F2F2F2" },
                            }),
                            new TableCell({
                                columnSpan: 2,
                                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Odd Sem AY ${safe(latest.academic_year)}`, bold: true, size: FONT_SIZE_OTHERS })] })],
                                shading: { fill: "F2F2F2" },
                            }),
                            new TableCell({
                                columnSpan: 2,
                                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Even Sem AY ${safe(latest.academic_year)}`, bold: true, size: FONT_SIZE_OTHERS })] })],
                                shading: { fill: "F2F2F2" },
                            }),
                            new TableCell({
                                columnSpan: 2,
                                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Consolidated AY ${safe(latest.academic_year)}`, bold: true, size: FONT_SIZE_OTHERS })] })],
                                shading: { fill: "F2F2F2" },
                            }),
                            new TableCell({
                                verticalMerge: "restart",
                                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Commitment / Undertakings", bold: true, size: FONT_SIZE_OTHERS })] })],
                                shading: { fill: "F2F2F2" },
                            }),
                        ],
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ verticalMerge: "continue", children: [new Paragraph("")] }),
                            new TableCell({ verticalMerge: "continue", children: [new Paragraph("")] }),
                            headerCell("Target"),
                            headerCell("Achieved"),
                            headerCell("Target"),
                            headerCell("Achieved"),
                            headerCell("Target"),
                            headerCell("Achieved"),
                            new TableCell({ verticalMerge: "continue", children: [new Paragraph("")] }),
                        ],
                    }),
                    makeRow([
                        "1",
                        "No of prospective students covered during branding (database)",
                        getValue(latest, "brand_building_admission.odd_sem.prospective_students_covered.target"),
                        getValue(latest, "brand_building_admission.odd_sem.prospective_students_covered.achieved"),
                        getValue(latest, "brand_building_admission.even_sem.prospective_students_covered.target"),
                        getValue(latest, "brand_building_admission.even_sem.prospective_students_covered.achieved"),
                        getValue(latest, "brand_building_admission.consolidated.prospective_students_covered.target"),
                        getValue(latest, "brand_building_admission.consolidated.prospective_students_covered.achieved"),
                        getValue(latest, "brand_building_admission.undertaking.prospective_students_covered"),
                    ]),
                    makeRow([
                        "2",
                        "No of students converted as admissions",
                        getValue(latest, "brand_building_admission.odd_sem.students_converted_admissions.target"),
                        getValue(latest, "brand_building_admission.odd_sem.students_converted_admissions.achieved"),
                        getValue(latest, "brand_building_admission.even_sem.students_converted_admissions.target"),
                        getValue(latest, "brand_building_admission.even_sem.students_converted_admissions.achieved"),
                        getValue(latest, "brand_building_admission.consolidated.students_converted_admissions.target"),
                        getValue(latest, "brand_building_admission.consolidated.students_converted_admissions.achieved"),
                        getValue(latest, "brand_building_admission.undertaking.students_converted_admissions"),
                    ]),
                ],
            }),
            bodyParagraph(" ")
        );

        blocks.push(
            makeTable(
                ["XVI", "INNOVATION AND ENTREPRENEURSHIP ACTIVITIES", `AY ${safe(latest.academic_year)}`, history4[1] ? `AY ${safe(history4[1].academic_year)}` : "Previous AY", "Commitment / Undertakings"],
                [
                    ["No of trained innovation ambassadors in department I&E ecosystem", "trained_innovation_ambassadors"],
                    ["How many teams participated in SIH", "teams_participated_sih"],
                    ["Total innovations by dept in different TRLs (4-9) in YUKTI", "innovations_trl_4_9_yukti"],
                    ["Student ventures/startups from dept recorded in YUKTI repository", "student_ventures_yukti"],
                    ["No of innovative ideas identified through final year / mini projects", "innovative_ideas_final_year_projects"],
                    ["No of patents filed", "patents_filed"],
                    ["No of patents published", "patents_published"],
                    ["No of patents granted", "patents_granted"],
                    ["No of patents filed through Kapila scheme", "patents_filed_kapila_scheme"],
                    ["Patents commercialized / transferred to industry / startup", "patents_commercialized"],
                ].map(([label, key], idx) =>
                    makeRow([
                        String(idx + 1),
                        label,
                        getValue(latest, `innovation_entrepreneurship_activities.${key}`),
                        history4[1] ? getValue(history4[1], `innovation_entrepreneurship_activities.${key}`) : "-",
                        getValue(latest, `innovation_entrepreneurship_activities.undertaking.${key}`),
                    ])
                ),
                getProofPath(latest, "innovation_entrepreneurship_activities.trained_innovation_ambassadors")
            )
        );

        blocks.push(
            sectionTitle("OTHERS"),
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        height: { value: 2200 },
                        children: [
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        alignment: AlignmentType.LEFT,
                                        children: [new TextRun({ text: "(i) Steps taken (or being taken) for improving scores for NBA / NAAC / NIRF", size: FONT_SIZE_OTHERS })],
                                    }),
                                    new Paragraph({
                                        alignment: AlignmentType.LEFT,
                                        children: [new TextRun({ text: getValue(latest, "remarks.others.improve_scores_nba_naac_nirf"), size: FONT_SIZE_OTHERS })],
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new TableRow({
                        height: { value: 2200 },
                        children: [
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        alignment: AlignmentType.LEFT,
                                        children: [new TextRun({ text: "(ii) Documentary evidences of POs and PSOs attainment levels", size: FONT_SIZE_OTHERS })],
                                    }),
                                    new Paragraph({
                                        alignment: AlignmentType.LEFT,
                                        children: [new TextRun({ text: getValue(latest, "remarks.others.documentary_evidence_pos_psos"), size: FONT_SIZE_OTHERS })],
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new TableRow({
                        height: { value: 2200 },
                        children: [
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        alignment: AlignmentType.LEFT,
                                        children: [new TextRun({ text: "(iii) Identification of GAPs / Shortfalls (PEOs, PSOs)", size: FONT_SIZE_OTHERS })],
                                    }),
                                    new Paragraph({
                                        alignment: AlignmentType.LEFT,
                                        children: [new TextRun({ text: getValue(latest, "remarks.others.gaps_shortfalls_peos_psos"), size: FONT_SIZE_OTHERS })],
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new TableRow({
                        height: { value: 2200 },
                        children: [
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        alignment: AlignmentType.LEFT,
                                        children: [new TextRun({ text: "(iv) Plan of action to bridge the gap and its implementation", size: FONT_SIZE_OTHERS })],
                                    }),
                                    new Paragraph({
                                        alignment: AlignmentType.LEFT,
                                        children: [new TextRun({ text: getValue(latest, "remarks.others.plan_action_bridge_gap"), size: FONT_SIZE_OTHERS })],
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            }),
            bodyParagraph(" ")
        );

        blocks.push(
            sectionTitle("APPRAISERS REMARKS"),
            makeTable(
                ["Sl.No", "Name and Designation", "Remarks"],
                (latest.appraisers_remarks || []).map((item, idx) =>
                    makeRow(
                        [idx + 1, safe(item?.name_and_designation), safe(item?.remarks)],
                        [AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.CENTER]
                    )
                )
            )
        );

        const doc = new Document({
            sections: [
                {
                    properties: {
                        page: {
                            margin: {
                                top: 1440,
                                right: 1080,
                                bottom: 1440,
                                left: 1080,
                            },
                        },
                    },
                    children: blocks,
                },
            ],
        });

        //PDF

        // const buffer = await Packer.toBuffer(doc);
        // const docxFileName = includeProofInDoc ? "Appraisal_report_with_proof.docx" : "Appraisal_report.docx";
        // const pdfFileName = docxFileName.replace(/\.docx$/i, ".pdf");

        // const reportsDir = path.join(__dirname, "../generated_reports");
        // if (!fs.existsSync(reportsDir)) {
        //     fs.mkdirSync(reportsDir, { recursive: true });
        // }
        // const filePath = path.join(reportsDir, docxFileName);
        // fs.writeFileSync(filePath, buffer);
        // const pdfPath = convertDocxToPdf(filePath, reportsDir);
        // const pdfBuffer = fs.readFileSync(pdfPath);

        // if (saveFileOnly) {
        //     PROOF_COLUMN_MODE = false;
        //     return res.status(400).json({ message: "save_file is temporarily disabled" });
        // }

        // PROOF_COLUMN_MODE = false;

        // res.setHeader("Content-Type", "application/pdf");
        // res.setHeader(
        //     "Content-Disposition",
        //     `${reportType === "download" ? "attachment" : "inline"}; filename="${pdfFileName}"`
        // );
        // return res.send(pdfBuffer);

        //doc

        const libre = require("libreoffice-convert");

        const buffer = await Packer.toBuffer(doc);

        const docxFileName = includeProofInDoc
            ? "Appraisal_report_with_proof.docx"
            : "Appraisal_report.docx";

        const pdfFileName = includeProofInDoc
            ? "Appraisal_report_with_proof.pdf"
            : "Appraisal_report.pdf";

        const reportsDir = path.join(__dirname, "../generated_reports");

        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        const docxPath = path.join(reportsDir, docxFileName);

        // Save DOCX
        fs.writeFileSync(docxPath, buffer);


        // ✅ Convert DOCX → PDF (Correct Way)

        const pdfBuf = await new Promise((resolve, reject) => {

            libre.convert(buffer, ".pdf", undefined, (err, done) => {

                if (err) {
                    return reject(err);
                }

                resolve(done);

            });

        });

        PROOF_COLUMN_MODE = false;

        res.setHeader("Content-Type", "application/pdf");

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${pdfFileName}"`
        );

        res.send(pdfBuf);
    } catch (error) {
        PROOF_COLUMN_MODE = false;
        console.error("Error generating appraisal report:", error);
        return res.status(500).json({ message: "Error generating report" });
    }
};



module.exports = generateAppraisalDoc;



