"use strict";

// Course data: an array of objects, used by catalogue, registration, and records.
const courses = [
  {
    code: "WEB101",
    name: "Introduction to Web Development",
    category: "Development",
    duration: "8 weeks",
    description:
      "Learn how websites work and build your first pages with HTML and CSS.",
    symbol: "⌘",
    color: "purple",
  },
  {
    code: "JS201",
    name: "JavaScript Fundamentals",
    category: "Development",
    duration: "10 weeks",
    description:
      "Make web pages interactive with variables, functions, events, and the DOM.",
    symbol: "{ }",
    color: "amber",
  },
  {
    code: "UX110",
    name: "UI/UX Design Essentials",
    category: "Design",
    duration: "6 weeks",
    description:
      "Explore accessible interfaces, wireframes, and user-centered design.",
    symbol: "✧",
    color: "blue",
  },
  {
    code: "DB220",
    name: "Database Management",
    category: "Data",
    duration: "12 weeks",
    description:
      "Understand data models, relationships, queries, and database basics.",
    symbol: "▥",
    color: "green",
  },
  {
    code: "PY150",
    name: "Python Programming",
    category: "Development",
    duration: "10 weeks",
    description:
      "Practice programming logic, loops, functions, and useful scripts.",
    symbol: "⌁",
    color: "blue",
  },
  {
    code: "DA230",
    name: "Data Analysis Basics",
    category: "Data",
    duration: "8 weeks",
    description:
      "Organize, explore, and interpret data to solve real-world problems.",
    symbol: "◫",
    color: "purple",
  },
];

const STORAGE_KEY = "classroom_student_records_v1";
let students = loadStudents();
let pendingDeleteId = null;

function $(id) {
  return document.getElementById(id);
}
function loadStudents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s) =>
        s &&
        typeof s.id === "string" &&
        typeof s.name === "string" &&
        typeof s.email === "string" &&
        typeof s.course === "string" &&
        typeof s.gender === "string" &&
        Array.isArray(s.skills)
    );
  } catch (error) {
    console.warn("Could not read browser storage:", error);
    return [];
  }
}
function saveStudents() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    return true;
  } catch (error) {
    console.warn("Could not save browser storage:", error);
    return false;
  }
}
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => (toast.hidden = true), 3500);
}
function textElement(tag, text, className) {
  const el = document.createElement(tag);
  el.textContent = text;
  if (className) el.className = className;
  return el;
}
function openPage() {
  const requested = location.hash.replace("#", "");
  const page = ["home", "register", "courses", "students"].includes(requested)
    ? requested
    : "home";
  document.querySelectorAll(".page").forEach((section) => {
    const active = section.id === `page-${page}`;
    section.classList.toggle("active", active);
    section.hidden = !active;
  });
  document.querySelectorAll(".nav-link").forEach((link) => {
    const active = link.dataset.page === page;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  $("siteNavigation").classList.remove("open");
  $("menuButton").setAttribute("aria-expanded", "false");
  if (page === "students") renderStudents();
  if (page === "courses") renderCourses();
  window.scrollTo({ top: 0, behavior: "instant" });
}
function renderStats() {
  // Student data is reflected in the directory; no dashboard counters are needed.
}
function populateCourses() {
  const select = $("courseSelect");
  courses.forEach((course) => {
    const opt = document.createElement("option");
    opt.value = course.code;
    opt.textContent = `${course.name} (${course.code})`;
    select.appendChild(opt);
  });
  const cats = [...new Set(courses.map((course) => course.category))];
  cats.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    $("categoryFilter").appendChild(opt);
  });
}
function renderCourses() {
  const term = $("courseSearch").value.trim().toLowerCase();
  const category = $("categoryFilter").value;
  const matches = courses.filter(
    (c) =>
      (category === "all" || c.category === category) &&
      `${c.name} ${c.code} ${c.description} ${c.category}`
        .toLowerCase()
        .includes(term)
  );
  const grid = $("courseGrid");
  grid.replaceChildren();
  for (const course of matches) {
    const article = textElement("article", "", "course-card");
    const image = document.createElement("img");
    image.className = "course-image";
    image.src = `images/${course.code.toLowerCase()}.svg`;
    image.alt = `${course.name} illustration`;
    image.width = 600;
    image.height = 240;
    image.loading = "lazy";
    const top = textElement("div", "", "course-card-top");
    top.append(
      textElement("div", course.symbol, `course-icon ${course.color}`),
      textElement("span", course.code, "course-code")
    );
    article.append(
      image,
      top,
      textElement("h2", course.name),
      textElement("p", course.description)
    );
    const bottom = textElement("div", "", "course-card-bottom");
    bottom.append(textElement("span", `◷  ${course.duration}`, "duration"));
    const action = textElement("a", "Enroll →");
    action.href = "#register";
    action.addEventListener("click", () => {
      $("courseSelect").value = course.code;
    });
    bottom.appendChild(action);
    article.appendChild(bottom);
    grid.appendChild(article);
  }
  $("courseResultCount").textContent = `${matches.length} ${
    matches.length === 1 ? "course" : "courses"
  }`;
  $("courseEmpty").hidden = matches.length > 0;
}
function clearErrors() {
  for (const id of ["studentId", "studentName", "email", "courseSelect"])
    $(id).classList.remove("invalid");
  for (const id of [
    "studentIdError",
    "studentNameError",
    "emailError",
    "genderError",
    "courseError",
  ])
    $(id).textContent = "";
}
function fieldError(fieldId, errorId, message) {
  if (fieldId) $(fieldId).classList.add("invalid");
  $(errorId).textContent = message;
}
function validateStudent(student) {
  clearErrors();
  let valid = true;
  if (!student.id) {
    fieldError("studentId", "studentIdError", "Student ID is required.");
    valid = false;
  } else if (!/^[A-Za-z0-9_-]{3,30}$/.test(student.id)) {
    fieldError(
      "studentId",
      "studentIdError",
      "Use 3–30 letters, numbers, hyphens or underscores."
    );
    valid = false;
  } else if (
    students.some((s) => s.id.toLowerCase() === student.id.toLowerCase())
  ) {
    fieldError(
      "studentId",
      "studentIdError",
      "This student ID is already registered."
    );
    valid = false;
  }
  if (!student.name) {
    fieldError("studentName", "studentNameError", "Student name is required.");
    valid = false;
  } else if (student.name.length < 2) {
    fieldError(
      "studentName",
      "studentNameError",
      "Name must contain at least 2 characters."
    );
    valid = false;
  }
  if (!student.email) {
    fieldError("email", "emailError", "Email address is required.");
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
    fieldError(
      "email",
      "emailError",
      "Enter a valid email, such as name@example.com."
    );
    valid = false;
  }
  if (!student.gender) {
    fieldError(null, "genderError", "Select a gender.");
    valid = false;
  }
  if (!courses.some((c) => c.code === student.course)) {
    fieldError("courseSelect", "courseError", "Select a course.");
    valid = false;
  }
  return valid;
}
function showFormMessage(message, type) {
  const box = $("formMessage");
  box.textContent = message;
  box.className = `form-message ${type}`;
  box.hidden = false;
}
function handleRegistration(event) {
  event.preventDefault();
  $("formMessage").hidden = true;
  const form = event.currentTarget;
  const student = {
    id: $("studentId").value.trim(),
    name: $("studentName").value.trim().replace(/\s+/g, " "),
    email: $("email").value.trim(),
    gender: form.querySelector('input[name="gender"]:checked')?.value || "",
    course: $("courseSelect").value,
    skills: [...form.querySelectorAll('input[name="skills"]:checked')].map(
      (input) => input.value
    ),
    registeredAt: new Date().toISOString(),
  };
  if (!validateStudent(student)) {
    showFormMessage(
      "Please correct the highlighted fields and try again.",
      "error"
    );
    return;
  }
  // Save first; if storage is blocked, keep records in memory but explain the limitation.
  students.push(student);
  const saved = saveStudents();
  renderStats();
  renderStudents();
  form.reset();
  clearErrors();
  $("registrationSuccessText").textContent =
    saved
      ? `Success! ${student.name} has been registered. You can find the student in Student records.`
      : `${student.name} was registered for this session, but browser storage is unavailable. The record may disappear after refresh.`;
  $("registrationDialog").showModal();
}
function renderStudents() {
  const term = $("studentSearch").value.trim().toLowerCase();
  const matches = students.filter(
    (s) =>
      s.id.toLowerCase().includes(term) || s.name.toLowerCase().includes(term)
  );
  const tbody = $("studentTableBody");
  tbody.replaceChildren();
  for (const student of matches) {
    const tr = document.createElement("tr");
    const cell = document.createElement("td");
    const detail = textElement("div", "", "student-cell");
    detail.append(
      textElement(
        "span",
        student.name
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part.charAt(0).toUpperCase())
          .join(""),
        "student-initial"
      )
    );
    const info = document.createElement("div");
    info.append(
      textElement("strong", student.name),
      textElement("small", student.email)
    );
    detail.appendChild(info);
    cell.appendChild(detail);
    tr.appendChild(cell);
    const idCell = document.createElement("td");
    idCell.appendChild(textElement("span", student.id, "id-chip"));
    tr.appendChild(idCell);
    tr.append(
      textElement("td", student.gender),
      textElement(
        "td",
        courses.find((c) => c.code === student.course)?.name || student.course
      )
    );
    const skillsCell = document.createElement("td");
    skillsCell.append(
      textElement(
        "span",
        student.skills.length ? `${student.skills.length} selected` : "None",
        "skill-count"
      )
    );
    skillsCell.title = student.skills.join(", ") || "No skills selected";
    tr.appendChild(skillsCell);
    const actions = document.createElement("td");
    const del = textElement("button", "Delete", "delete-button");
    del.type = "button";
    del.setAttribute("aria-label", `Delete ${student.name}`);
    del.addEventListener("click", () => askDelete(student.id));
    actions.appendChild(del);
    tr.appendChild(actions);
    tbody.appendChild(tr);
  }
  $("studentResultCount").textContent = term
    ? `${matches.length} matching of ${students.length} students`
    : `${students.length} ${
        students.length === 1 ? "student" : "students"
      } registered`;
  $("studentEmpty").hidden = students.length > 0;
  $("studentNoMatch").hidden = students.length === 0 || matches.length > 0;
  $("exportCsv").disabled = students.length === 0;
  $("exportCsv").title =
    students.length === 0
      ? "Register a student before exporting"
      : "Download student records as CSV";
}
function askDelete(id) {
  const student = students.find((s) => s.id === id);
  if (!student) return;
  pendingDeleteId = id;
  $(
    "deleteDialogText"
  ).textContent = `Remove ${student.name} (${student.id}) from student records? This cannot be undone.`;
  const dialog = $("deleteDialog");
  if (typeof dialog.showModal === "function") dialog.showModal();
  else if (confirm($("deleteDialogText").textContent)) deleteStudent();
}
function deleteStudent() {
  if (pendingDeleteId === null) return;
  students = students.filter((s) => s.id !== pendingDeleteId);
  pendingDeleteId = null;
  saveStudents();
  renderStudents();
  renderStats();
  $("deleteDialog").close();
  showToast("Student deleted");
}
function exportCsv() {
  if (!students.length) return;
  const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const rows = [
    [
      "Student ID",
      "Name",
      "Email",
      "Gender",
      "Course",
      "Skills",
      "Registered At",
    ],
    ...students.map((s) => [
      s.id,
      s.name,
      s.email,
      s.gender,
      s.course,
      s.skills.join("; "),
      s.registeredAt || "",
    ]),
  ];
  const csv =
    "\uFEFF" + rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "student-records.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function initialize() {
  $("year").textContent = new Date().getFullYear();
  populateCourses();
  renderStats();
  renderCourses();
  renderStudents();
  openPage();
  window.addEventListener("hashchange", openPage);
  $("menuButton").addEventListener("click", () => {
    const isOpen = $("siteNavigation").classList.toggle("open");
    $("menuButton").setAttribute("aria-expanded", String(isOpen));
  });
  $("registrationForm").addEventListener("submit", handleRegistration);
  $("registrationForm").addEventListener("reset", () => {
    clearErrors();
    $("formMessage").hidden = true;
  });
  $("courseSearch").addEventListener("input", renderCourses);
  $("categoryFilter").addEventListener("change", renderCourses);
  $("clearCourseFilters").addEventListener("click", () => {
    $("courseSearch").value = "";
    $("categoryFilter").value = "all";
    renderCourses();
  });
  $("studentSearch").addEventListener("input", renderStudents);
  $("clearStudentSearch").addEventListener("click", () => {
    $("studentSearch").value = "";
    renderStudents();
  });
  $("exportCsv").addEventListener("click", exportCsv);
  $("cancelDelete").addEventListener("click", () => $("deleteDialog").close());
  $("confirmDelete").addEventListener("click", deleteStudent);
  $("deleteDialog").addEventListener("close", () => {
    pendingDeleteId = null;
  });
}
document.addEventListener("DOMContentLoaded", initialize);
