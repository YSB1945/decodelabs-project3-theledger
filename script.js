/* ============================================================================
   STUDENT PROGRESS DASHBOARD — script.js
   ----------------------------------------------------------------------------
   Architecture: Input -> Process -> Output (IPO loop), per DecodeLabs standard.

   Rules enforced throughout this file:
   - const for DOM references & values that never get reassigned.
   - let only for values that must mutate (the `grades` array, running totals).
   - var is never used.
   - .textContent only — never innerHTML — for injecting data into the DOM.
   - document.createElement() + appendChild() for all dynamic nodes.
   - classList.toggle()/add()/remove() for every visual state change.
   - .js- classes are read by JS only. .is- classes are written by JS only,
     and styled by CSS only. Neither prefix crosses into the other's job.
   ============================================================================ */

(function () {
  'use strict';

  /* ==========================================================================
     DOM REFERENCES (const — these bindings never change, even if content does)
     ========================================================================== */
  const themeToggleBtn   = document.querySelector('.js-theme-toggle');
  const gradeForm        = document.querySelector('.js-grade-form');
  const subjectInput     = document.querySelector('.js-subject-input');
  const gradeInput       = document.querySelector('.js-grade-input');
  const formErrorEl      = document.querySelector('.js-form-error');

  const averageValueEl   = document.querySelector('.js-average-value');
  const statusLabelEl    = document.querySelector('.js-status-label');
  const averageRingEl    = document.querySelector('.js-average-ring');
  const ringFillEl       = document.querySelector('.js-ring-fill');
  const subjectCountEl   = document.querySelector('.js-subject-count');
  const themeLabelEl     = document.querySelector('.js-theme-label');

  const subjectListEl    = document.querySelector('.js-subject-list');
  const emptyStateEl     = document.querySelector('.js-empty-state');

  /* ==========================================================================
     STATE (let — this is the "memory" the system needs to react properly)
     ========================================================================== */
  let grades = [];       // Array of { id, subject, grade }
  let nextId = 1;        // Mutable counter for unique row identifiers

  const PASS_THRESHOLD = 10; // const — a fixed rule of the system, never reassigned
  const RING_CIRCUMFERENCE = 540.4; // const — derived from the SVG circle's radius (r=86), fixed geometry

  /* ==========================================================================
     PHASE 1 — INPUT: wiring the sensory receptors
     Each addEventListener is a "nerve" that listens for one specific stimulus
     and hands it to a single, small function (the IPO "Process" step).
     ========================================================================== */

  // INPUT: form submission (the user wants to add a subject + grade)
  gradeForm.addEventListener('submit', handleGradeFormSubmit);

  // INPUT: click on the dark mode toggle button
  themeToggleBtn.addEventListener('click', handleThemeToggleClick);

  // INPUT: click anywhere inside the subject list (event delegation, so we
  // don't have to attach a listener to every dynamically created remove button)
  subjectListEl.addEventListener('click', handleSubjectListClick);

  // INPUT: keyboard activation of editable fields (Enter/Space via role="button"),
  // plus Enter-to-commit / Escape-to-cancel while a field is being edited.
  subjectListEl.addEventListener('keydown', handleSubjectListKeydown);

  // INPUT: a field loses focus while being edited — commit the change.
  // useCapture(true) needed because 'blur' does not bubble.
  subjectListEl.addEventListener('focusout', handleSubjectListFocusOut);


  /* ==========================================================================
     PHASE 2 — PROCESS: the logic actuators
     Small, single-purpose functions. Each one evaluates state, applies
     business rules, and either mutates state or hands off to an Output step.
     ========================================================================== */

  /**
   * PROCESS: Validate and parse form input, then mutate state if valid.
   * Triggered by: gradeForm 'submit' event (INPUT)
   * Produces: an updated `grades` array, or a visible error (OUTPUT)
   */
  function handleGradeFormSubmit(event) {
    event.preventDefault(); // stop the browser's default full-page submit

    const subjectName = subjectInput.value.trim();
    const gradeValue = parseFloat(gradeInput.value);

    const validationError = validateEntry(subjectName, gradeValue);

    if (validationError) {
      renderFormError(validationError); // OUTPUT: show the problem, stop here
      return;
    }

    renderFormError(''); // clear any previous error

    // STATE MUTATION: this is the only place `grades` and `nextId` change
    const newEntry = {
      id: nextId,
      subject: subjectName,
      grade: gradeValue,
    };
    grades.push(newEntry);
    nextId += 1; // let-bound counter — explicitly allowed to mutate

    appendSubjectRow(newEntry);  // OUTPUT: new DOM node
    refreshSummary();            // OUTPUT: recalculated average + visual state
    refreshEmptyState();         // OUTPUT: hide/show the empty-state message

    resetForm();
  }

  /**
   * PROCESS: Pure validation logic — no DOM access, no side effects.
   * Kept single-purpose so it's trivially testable on its own.
   */
  function validateEntry(subjectName, gradeValue) {
    if (subjectName.length === 0) {
      return 'Subject name is required.';
    }
    if (Number.isNaN(gradeValue)) {
      return 'Grade must be a number.';
    }
    if (gradeValue < 0 || gradeValue > 20) {
      return 'Grade must be between 0 and 20.';
    }
    return null; // no error
  }

  /**
   * PROCESS: Toggle the in-memory dark mode state, then delegate to Output.
   * Triggered by: themeToggleBtn 'click' event (INPUT)
   */
  function handleThemeToggleClick() {
    const isDarkModeNow = document.body.classList.toggle('is-dark-mode');
    // classList.toggle() returns the resulting boolean state — use it directly
    // rather than re-querying the class, keeping this function single-purpose.
    updateThemeToggleLabel(isDarkModeNow);
  }

  /**
   * PROCESS: Identify which subject row was targeted by a delegated click.
   * Two possible targets: the remove button, or an editable field (name/grade).
   * Triggered by: subjectListEl 'click' event (INPUT)
   */
  function handleSubjectListClick(event) {
    const removeButton = event.target.closest('.js-remove-row');
    if (removeButton) {
      const rowId = Number(removeButton.dataset.id);

      // STATE MUTATION: filter creates a new array; reassignment is allowed
      // because `grades` is declared with `let`.
      grades = grades.filter((entry) => entry.id !== rowId);

      removeSubjectRow(rowId); // OUTPUT: remove the matching DOM node
      refreshSummary();        // OUTPUT: recalculate
      refreshEmptyState();     // OUTPUT: show empty-state again if list is now empty
      return;
    }

    const field = event.target.closest('.js-field');
    if (field) {
      beginFieldEdit(field); // OUTPUT: swap the span for an input
    }
  }

  /**
   * PROCESS: Handle keyboard interaction within the subject list.
   * - Enter/Space on a field that ISN'T yet editing -> open it for editing
   * (mirrors the click handler above, for keyboard-only users).
   * - Enter on a field that IS editing -> commit the new value.
   * - Escape on a field that IS editing -> cancel and restore the old value.
   * Triggered by: subjectListEl 'keydown' event (INPUT)
   */
  function handleSubjectListKeydown(event) {
    const activeInput = event.target.closest('.js-field-input');

    if (activeInput) {
      if (event.key === 'Enter') {
        event.preventDefault();
        commitFieldEdit(activeInput);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        cancelFieldEdit(activeInput);
      }
      return;
    }

    const field = event.target.closest('.js-field');
    if (field && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      beginFieldEdit(field);
    }
  }

  /**
   * PROCESS: If a field is mid-edit and loses focus (e.g. user clicks
   * elsewhere on the page) without pressing Enter or Escape, commit
   * whatever value is currently in the input. Mirrors common spreadsheet
   * behavior: clicking away saves, it doesn't silently discard.
   * Triggered by: subjectListEl 'focusout' event (INPUT)
   */
  function handleSubjectListFocusOut(event) {
    const input = event.target.closest('.js-field-input');
    if (!input) return;
    commitFieldEdit(input);
  }

  /**
   * PROCESS: Validate and apply a single edited field (subject or grade)
   * back into the `grades` array, then hand off to Output to re-render
   * that one row and the summary. Reverts to the old value on bad input
   * rather than blocking the user with a form error mid-list.
   */
  function applyFieldEdit(rowId, fieldType, rawValue) {
    const entry = grades.find((item) => item.id === rowId);
    if (!entry) return; // row was removed mid-edit — nothing to apply

    if (fieldType === 'subject') {
      const trimmed = rawValue.trim();
      if (trimmed.length === 0) return; // reject empty name, keep old value
      entry.subject = trimmed; // STATE MUTATION: entry is an object reference
    }

    if (fieldType === 'grade') {
      const parsed = parseFloat(rawValue);
      if (Number.isNaN(parsed) || parsed < 0 || parsed > 20) return; // reject, keep old value
      entry.grade = parsed; // STATE MUTATION
    }
  }

  /**
   * PROCESS: Pure calculation — derives the average from current state.
   * No DOM access here; this function only computes a number.
   */
  function calculateAverage() {
    if (grades.length === 0) return null;
    const total = grades.reduce((sum, entry) => sum + entry.grade, 0);
    return total / grades.length;
  }


  /* ==========================================================================
     PHASE 3 — OUTPUT: mutating the DOM
     Every function below is the "visible reaction" half of the IPO loop.
     Text injection uses .textContent exclusively. Visual state uses
     classList only. New rows are built with createElement + appendChild.
     ========================================================================== */

  /**
   * OUTPUT: Build a single subject <li> from scratch and prepend it to the
   * top of the list — the panel is labeled "most recent first", so new
   * entries enter at the top to match what's promised on screen.
   * Uses createElement/appendChild exclusively — no innerHTML, ever.
   */
  function appendSubjectRow(entry) {
    const row = document.createElement('li');
    row.className = 'subject-row';
    row.dataset.id = String(entry.id); // links the DOM node back to state

    const nameEl = document.createElement('span');
    nameEl.className = 'subject-row__name js-field js-field-subject';
    nameEl.textContent = entry.subject; // safe text injection
    nameEl.tabIndex = 0;
    nameEl.setAttribute('role', 'button');
    nameEl.setAttribute('aria-label', `Edit subject name, currently ${entry.subject}`);

    const gradeEl = document.createElement('span');
    gradeEl.className = 'subject-row__grade js-field js-field-grade';
    gradeEl.textContent = entry.grade.toFixed(2);
    gradeEl.tabIndex = 0;
    gradeEl.setAttribute('role', 'button');
    gradeEl.setAttribute('aria-label', `Edit grade, currently ${entry.grade.toFixed(2)}`);
    gradeEl.classList.toggle('is-passing', entry.grade >= PASS_THRESHOLD);
    gradeEl.classList.toggle('is-failing', entry.grade < PASS_THRESHOLD);

    const actionsEl = document.createElement('span');
    actionsEl.className = 'subject-row__actions';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'subject-row__icon-btn js-remove-row';
    removeBtn.dataset.id = String(entry.id);
    removeBtn.textContent = '✕';
    removeBtn.setAttribute('aria-label', `Remove ${entry.subject}`);

    actionsEl.appendChild(removeBtn);

    row.appendChild(nameEl);
    row.appendChild(gradeEl);
    row.appendChild(actionsEl);

    // prepend rather than append: keeps the newest entry visually on top,
    // matching the "Most recent first" hint in the panel header.
    subjectListEl.insertBefore(row, subjectListEl.firstChild);
  }

  /**
   * OUTPUT: Remove a specific row from the DOM by its data-id.
   */
  function removeSubjectRow(rowId) {
    const row = subjectListEl.querySelector(`[data-id="${rowId}"]`);
    if (row) {
      row.remove();
    }
  }

  /**
   * OUTPUT: Recompute the average, write it to the hero display, and drive
   * the animated ring's stroke-dashoffset to visually represent progress
   * toward 20/20. Toggles .is-passing / .is-failing for color state.
   */
  function refreshSummary() {
    const average = calculateAverage();

    if (average === null) {
      averageValueEl.textContent = '—';
      statusLabelEl.textContent = 'No grades recorded yet';
      averageRingEl.classList.remove('is-passing', 'is-failing');
      setRingFill(0);
    } else {
      averageValueEl.textContent = average.toFixed(2);
      statusLabelEl.textContent = average >= PASS_THRESHOLD
        ? 'On track — average is passing'
        : 'Below the passing threshold';

      // Mutually exclusive visual states — only one is ever active.
      averageRingEl.classList.toggle('is-passing', average >= PASS_THRESHOLD);
      averageRingEl.classList.toggle('is-failing', average < PASS_THRESHOLD);

      setRingFill(average / 20); // ring fills relative to the 0–20 scale
    }

    subjectCountEl.textContent = String(grades.length);
  }

  /**
   * OUTPUT: Translate a 0–1 ratio into the SVG ring's stroke-dashoffset.
   * Kept as its own function since it's a distinct unit of visual logic
   * from the text/label updates above (single-purpose functions).
   */
  function setRingFill(ratio) {
    const clampedRatio = Math.min(Math.max(ratio, 0), 1);
    const offset = RING_CIRCUMFERENCE * (1 - clampedRatio);
    ringFillEl.style.strokeDashoffset = String(offset);
  }

  /**
   * OUTPUT: Show the "empty state" message only when there are no subjects.
   */
  function refreshEmptyState() {
    const hasSubjects = grades.length > 0;
    emptyStateEl.classList.toggle('is-hidden', hasSubjects);
    subjectListEl.classList.toggle('is-hidden', !hasSubjects);
  }

  /**
   * OUTPUT: Write a validation message into the form's error slot.
   * Empty string clears it. textContent only.
   */
  function renderFormError(message) {
    formErrorEl.textContent = message;
  }

  /**
   * OUTPUT: Reset the form fields after a successful submission.
   */
  function resetForm() {
    gradeForm.reset();
    subjectInput.focus();
  }

  /**
   * OUTPUT: Update the toggle button's label text and aria-pressed state.
   * The icon swap itself is handled declaratively by CSS rules keyed off
   * body.is-dark-mode, so this function only owns the text label.
   */
  function updateThemeToggleLabel(isDarkModeNow) {
    themeLabelEl.textContent = isDarkModeNow ? 'Day mode' : 'Night mode';
    themeToggleBtn.setAttribute('aria-pressed', String(isDarkModeNow));
  }

  /**
   * OUTPUT: Transforme le texte statique en champ de saisie (input)
   */
  function beginFieldEdit(fieldEl) {
    if (fieldEl.querySelector('input')) return; // Déjà en cours d'édition

    const currentValue = fieldEl.textContent;
    const isGrade = fieldEl.classList.contains('js-field-grade');
    
    const input = document.createElement('input');
    input.type = isGrade ? 'number' : 'text';
    input.className = 'inline-edit-input js-field-input';
    input.value = currentValue;
    input.dataset.original = currentValue; // Sauvegarde en cas d'annulation

    if (isGrade) {
      input.min = "0";
      input.max = "20";
      input.step = "0.25";
    }

    fieldEl.textContent = ''; // Vide le span de manière sécurisée
    fieldEl.appendChild(input);
    input.focus();
  }

  /**
   * OUTPUT: Valide la modification, met à jour le DOM et recalcule la moyenne
   */
  function commitFieldEdit(inputEl) {
    const fieldEl = inputEl.parentElement;
    const rowEl = inputEl.closest('.subject-row');
    const rowId = Number(rowEl.dataset.id);
    const isGrade = fieldEl.classList.contains('js-field-grade');
    const fieldType = isGrade ? 'grade' : 'subject';
    const newValue = inputEl.value;

    // 1. Met à jour l'état (la variable mémoire)
    applyFieldEdit(rowId, fieldType, newValue);

    // 2. Met à jour l'affichage avec les nouvelles données
    const entry = grades.find((item) => item.id === rowId);
    if (entry) {
      fieldEl.textContent = isGrade ? entry.grade.toFixed(2) : entry.subject;
      
      if (isGrade) {
        fieldEl.classList.toggle('is-passing', entry.grade >= PASS_THRESHOLD);
        fieldEl.classList.toggle('is-failing', entry.grade < PASS_THRESHOLD);
      }
      refreshSummary(); // Recalcule la moyenne générale
    } else {
      cancelFieldEdit(inputEl);
    }
  }

  /**
   * OUTPUT: Annule la modification si l'utilisateur appuie sur Échap
   */
  function cancelFieldEdit(inputEl) {
    const fieldEl = inputEl.parentElement;
    fieldEl.textContent = inputEl.dataset.original;
  }

  /* ==========================================================================
     INITIAL RENDER
     Run the Output phase once on load so the UI matches empty state correctly.
     ========================================================================== */
  refreshSummary();
  refreshEmptyState();

})();