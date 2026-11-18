# Hendrix Kao Learning — Student Information and Course Management Website

A traditional, public-facing education website built for the Web Programming final project using HTML, CSS, and JavaScript. The layout uses a top navigation menu, landing-page hero, informational sections, course catalogue, student registration page, and student directory. It is **not** an administrative dashboard.

## Run it

1. Extract the project ZIP.
2. Open `index.html` in a modern browser such as Chrome, Edge, or Firefox.
3. No server, database, account, or installation is required.

## Pages

- **Home:** Introduction, feature descriptions, and links to registration and courses.
- **Our courses:** Six courses, searchable by code/name/topic and filterable by category.
- **Registration:** Student ID, name, email, gender, course, optional skills; validation and error/success feedback.
- **Student directory:** Search by ID or name, see enrolled course and interests, delete with confirmation, and export CSV.

## Source structure

- `index.html` — semantic HTML and form controls
- `style.css` — responsive website design, navigation, form and catalogue styling
- `script.js` — arrays/objects, functions, loops, events, DOM updates, search/validation, localStorage, CSV
- `project-report.pdf` — editable-content report draft; replace placeholders and add actual screenshots/test evidence before submitting

## How data works

Records are stored in a JavaScript array and saved to browser `localStorage` with key `classroom_student_records_v1`. Data is available only in the current browser profile and can disappear when browser site data is cleared. There is no server-side database or synchronization. Existing records from the previous dashboard version use the same key and remain available if you open the new app on the same origin/browser.

## Testing checklist

- Open all four pages using desktop and mobile navigation.
- Register a valid student and find them in the directory.
- Try missing fields, invalid email, short ID, and duplicate ID.
- Search courses using terms and change categories.
- Search existing and nonexistent student names/IDs.
- Refresh the page and verify the record is still stored.
- Export CSV; delete a record and verify deletion.

## Academic integrity

Review and understand every part of the project. Disclose AI assistance when required by your lecturer/university. Do not claim unperformed tests or submit unedited placeholder details or screenshots.
