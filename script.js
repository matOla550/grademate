/* =====================================================
   GradeMate - script.js
   How it works:
   1. "subjects" lists the five subjects and their input ids.
   2. "gradeScale" says which score gets which grade.
   3. When the form is submitted we check every field,
      calculate the results, and swap to the results view.
   ===================================================== */

// ---------- 1. DATA ----------

// The five subjects. "id" matches the HTML: score-maths, score-english...
const subjects = [
  { id: "maths", name: "Mathematics" },
  { id: "english", name: "English Language" },
  { id: "science", name: "Basic Science" },
  { id: "computer", name: "Computer Studies" },
  { id: "social", name: "Social Studies" }
];

// The grading scale, from highest to lowest.
// A score gets the first grade whose "min" it reaches.
// Change these numbers to match your school's scale.
const gradeScale = [
  { min: 70, grade: "A", remark: "Excellent" },
  { min: 60, grade: "B", remark: "Very Good" },
  { min: 50, grade: "C", remark: "Good" },
  { min: 40, grade: "D", remark: "Pass" },
  { min: 0, grade: "F", remark: "Fail" }
];

const MAX_SCORE = 100;

// ---------- 2. FIND THE HTML ELEMENTS WE NEED ----------
const entryView = document.getElementById("entry-view");
const resultsView = document.getElementById("results-view");
const form = document.getElementById("result-form");

const nameInput = document.getElementById("student-name");
const classInput = document.getElementById("student-class");

const errorSummary = document.getElementById("error-summary");
const errorSummaryText = document.getElementById("error-summary-text");

const resultName = document.getElementById("result-name");
const resultClass = document.getElementById("result-class");
const totalScoreEl = document.getElementById("total-score");
const averageScoreEl = document.getElementById("average-score");
const overallRemark = document.getElementById("overall-remark");
const overallGrade = document.getElementById("overall-grade");
const resultsBody = document.getElementById("results-body");
const tableTotal = document.getElementById("table-total");
const tableGrade = document.getElementById("table-grade");
const tableRemark = document.getElementById("table-remark");

const printButton = document.getElementById("print-button");
const editButton = document.getElementById("edit-button");

// ---------- 3. HELPER FUNCTIONS ----------

// Gives back the grade and remark for a score, e.g. 78 -> { grade: "A", remark: "Excellent" }
function getGrade(score) {
  for (let i = 0; i < gradeScale.length; i++) {
    if (score >= gradeScale[i].min) {
      return gradeScale[i];
    }
  }
  return gradeScale[gradeScale.length - 1];
}

// Shows a red error under one field.
// "box" is the element that gets the red border.
function showError(box, messageId, message) {
  const messageEl = document.getElementById(messageId);
  messageEl.textContent = message;
  messageEl.hidden = false;
  box.classList.add("has-error");
}

// Removes every error message and red border from the form.
function clearErrors() {
  document.querySelectorAll(".error-message").forEach(function (el) {
    el.hidden = true;
    el.textContent = "";
  });
  document.querySelectorAll(".has-error").forEach(function (el) {
    el.classList.remove("has-error");
  });
  document.querySelectorAll("[aria-invalid]").forEach(function (el) {
    el.removeAttribute("aria-invalid");
  });
  errorSummary.hidden = true;
}

// Checks one score box. Returns the problem as text, or "" if it is fine.
function checkScore(text) {
  if (text.trim() === "") {
    return "Please enter a score.";
  }

  const number = Number(text);

  if (isNaN(number)) {
    return "Score must be a number.";
  }
  if (number < 0) {
    return "Score cannot be less than 0.";
  }
  if (number > MAX_SCORE) {
    return "Score cannot be more than " + MAX_SCORE + ".";
  }
  if (!Number.isInteger(number)) {
    return "Score must be a whole number.";
  }
  return "";
}

// ---------- 4. MAIN FUNCTIONS ----------

// Checks every field. Returns true if all of them are fine.
function validateForm() {
  clearErrors();
  const problems = [];   // names of the fields that need fixing

  // Student name and class must not be empty
  if (nameInput.value.trim() === "") {
    showError(nameInput, "error-student-name", "Please enter the student's name.");
    nameInput.setAttribute("aria-invalid", "true");
    problems.push({ label: "Student name", input: nameInput });
  }
  if (classInput.value.trim() === "") {
    showError(classInput, "error-student-class", "Please enter the class.");
    classInput.setAttribute("aria-invalid", "true");
    problems.push({ label: "Class", input: classInput });
  }

  // Check each of the five scores
  subjects.forEach(function (subject) {
    const input = document.getElementById("score-" + subject.id);
    const message = checkScore(input.value);

    if (message !== "") {
      // The red border goes on the wrapper that holds the input and "/ 100"
      showError(input.parentElement, "error-score-" + subject.id, message);
      input.setAttribute("aria-invalid", "true");
      problems.push({ label: subject.name, input: input });
    }
  });

  // If anything is wrong, fill in the red summary box and stop
  if (problems.length > 0) {
    const names = problems.map(function (problem) {
      return problem.label;
    });
    const word = problems.length === 1 ? "field" : "fields";
    errorSummaryText.textContent =
      "Please fix " + problems.length + " " + word + " before calculating. Check: " + names.join(", ") + ".";
    errorSummary.hidden = false;
    problems[0].input.focus();    // jump to the first problem
    return false;
  }
  return true;
}

// Runs when "Calculate Results" is clicked.
function calculateResults(event) {
  event.preventDefault();          // stop the page reloading

  if (!validateForm()) {
    return;
  }

  // Collect the scores into a list of { name, score }
  const scores = subjects.map(function (subject) {
    const input = document.getElementById("score-" + subject.id);
    return { name: subject.name, score: Number(input.value) };
  });

  // Add up the total and work out the average
  let total = 0;
  scores.forEach(function (item) {
    total += item.score;
  });
  const average = total / scores.length;

  showResults(nameInput.value.trim(), classInput.value.trim(), scores, total, average);
}

// Fills in the results view and shows it.
function showResults(studentName, studentClass, scores, total, average) {
  const maxTotal = scores.length * MAX_SCORE;
  const overall = getGrade(average);

  // Student details and the summary cards
  resultName.textContent = studentName;          // textContent is safe for typed text
  resultClass.textContent = studentClass;
  totalScoreEl.textContent = total;
  averageScoreEl.textContent = average.toFixed(1);   // one decimal place, e.g. 73.2
  overallRemark.textContent = overall.remark;
  overallGrade.textContent = "Grade " + overall.grade + " overall";

  // Build one table row for each subject
  resultsBody.innerHTML = "";
  scores.forEach(function (item) {
    const result = getGrade(item.score);
    const row = document.createElement("tr");

    const subjectCell = document.createElement("td");
    subjectCell.textContent = item.name;

    const scoreCell = document.createElement("td");
    scoreCell.className = "col-score";
    scoreCell.textContent = item.score;

    const gradeCell = document.createElement("td");
    gradeCell.className = "col-grade";
    const badge = document.createElement("span");
    badge.className = "grade-badge grade-" + result.grade.toLowerCase();
    badge.textContent = result.grade;
    gradeCell.appendChild(badge);

    const remarkCell = document.createElement("td");
    remarkCell.textContent = result.remark;

    row.appendChild(subjectCell);
    row.appendChild(scoreCell);
    row.appendChild(gradeCell);
    row.appendChild(remarkCell);
    resultsBody.appendChild(row);
  });

  // The bottom row of the table
  tableTotal.textContent = total + " / " + maxTotal;
  tableGrade.textContent = overall.grade;
  tableRemark.textContent = overall.remark;

  // Swap the views
  entryView.hidden = true;
  resultsView.hidden = false;
  window.scrollTo(0, 0);
}

// "Edit Scores": go back to the form. The typed values are still there.
function editScores() {
  resultsView.hidden = true;
  entryView.hidden = false;
  window.scrollTo(0, 0);
}

// "Reset": the browser empties the boxes, we remove the errors.
function resetForm() {
  clearErrors();
}

// "Print Results": opens the browser's print window.
function printResults() {
  window.print();
}

// ---------- 5. CONNECT THE BUTTONS ----------
form.addEventListener("submit", calculateResults);
form.addEventListener("reset", resetForm);
editButton.addEventListener("click", editScores);
printButton.addEventListener("click", printResults);
