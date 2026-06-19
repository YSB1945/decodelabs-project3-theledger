# 📊 The Ledger — Student Progress Dashboard

![Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-success?style=for-the-badge)
![Lighthouse](https://img.shields.io/badge/Lighthouse-4×100-brightgreen?style=for-the-badge&logo=lighthouse&logoColor=white)

### Project 3 · Interactive Web Elements · DecodeLabs Internship — Batch 2026

> This project demonstrates mastery of the Document Object Model (DOM), state management, and the **Input → Process → Output (IPO)** loop, built entirely in Vanilla JavaScript with zero frameworks. Every interaction is calculated. Every DOM mutation is secure.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Key Features](#2-key-features)
3. [File Structure](#3-file-structure)
4. [Architecture & State Management](#4-architecture--state-management)
5. [Strict Decoupling & DOM Security](#5-strict-decoupling--dom-security)
6. [Dynamic Features & Logic](#6-dynamic-features--logic)
7. [Audit & Compliance](#7-audit--compliance)
8. [What I Learned](#8-what-i-learned)
9. [Quick Start](#9-quick-start)
10. [Tech Stack](#10-tech-stack)

---

## 1. Overview

**The Ledger** is an interactive, real-time student progress dashboard built as the Project 3 deliverable for the DecodeLabs Frontend Development Internship (Batch 2026).

The objective wasn't simply to make a page "interactive" — it was to engineer a living UI that reacts to state changes predictably, securely, and without relying on any external libraries or unsafe HTML injection. Every feature was designed to demonstrate **software engineering discipline** as much as front-end skill.

**Core constraints respected throughout:**

- **Pure Vanilla JavaScript** — no frameworks (React/Vue) or state libraries
- **IPO Loop architecture** — every feature follows Input → Process → Output
- **Zero `innerHTML`** — exclusively safe, native DOM methods (`createElement`, `textContent`)
- **Strict decoupling** — visual states (`.is-`) are fully separated from logic hooks (`.js-`)

---

## 2. Key Features

- **📈 Real-Time Dashboard** — The overall average (out of 20) recalculates instantly with every entry added, edited, or removed, with zero page reloads.
- **🟢 Interactive SVG Data Visualization** — A custom-built SVG ring fills proportionally to the class average and dynamically switches color between a "passing" and "failing" state based on the 10/20 threshold.
- **✏️ Inline Editing** — Each dynamically generated list item can be edited in place via event delegation, with the state array and DOM updating in perfect sync.
- **🛡️ Form Validation** — Guards against empty subject fields and invalid/out-of-range numerical grade inputs before any data enters the application state.
- **🌙 Dark Mode Toggle** — A persistent visual theme managed entirely through CSS state classes, not inline styles.

---

## 3. File Structure

```text
decodelabs-project3-theledger/
│
├── audit/
│   └── lighthouse-report.html    # Full Lighthouse audit snapshot (Performance,
│                                  # Accessibility, Best Practices, SEO)
│
├── index.html                    # Main document — semantic HTML5 and static DOM
│                                  # scaffolding awaiting JS actuation
│
├── script.js                     # Logic actuator — Vanilla JS, IPO loop, state
│                                  # management, and DOM mutation
│
└── style.css                     # External stylesheet — design tokens, layouts,
                                   # and visual states (.is- hooks)
```

All production code lives at the root level. The `audit/` directory is a quality gate — it holds the Lighthouse report that validates the build's compliance prior to submission.

---

## 4. Architecture & State Management

This project enforces a strict **unidirectional data flow**, treating user interactions and UI updates as completely separate steps connected by a central state memory.

### 4.1 The IPO Loop (The Logic Flow)

Every feature strictly follows the Input → Process → Output pattern to ensure predictability:

| Phase | Responsibility | Implementation |
|-------|----------------|-----------------|
| **INPUT** | Sensory Receptors | `addEventListener` captures stimuli (clicks, form submissions, keypresses). |
| **PROCESS** | Logic Actuators | Validates data, applies business rules, and updates the central JS memory. |
| **OUTPUT** | DOM Mutation | Re-renders the UI based purely on the new state, using `textContent` and `classList`. |

### 4.2 Deliberate State Management (The Memory)

Application state lives in plain JavaScript memory, acting as the single source of truth:

| Variable Type | State Role |
|---|---|
| `const` | Default binding. Used for immutable data such as DOM references (`const gradeForm`) and fixed rules (`const PASS_THRESHOLD = 10`). |
| `let` | Reserved exclusively for mutable state — used only when data must change over time (e.g. `let grades = []`, `let nextId = 1`). |
| `var` | Strictly prohibited, to avoid hoisting errors and global scope pollution. |

This ensures the DOM is treated as a **pure reflection of state**, rather than being manually patched in inconsistent places.

---

## 5. Strict Decoupling & DOM Security

### 5.1 CSS / JS Separation of Concerns

A disciplined naming convention is enforced throughout the project to keep styling and behavior fully decoupled:

| Prefix | Purpose | Owned By |
|--------|---------|----------|
| `.js-` | Element hooks used **exclusively** for JavaScript event binding/selection | JavaScript |
| `.is-` | Boolean visual/state classes (e.g. `.is-passing`, `.is-dark`, `.is-editing`) | CSS |

This means JavaScript **never** queries or depends on a class used for styling, and CSS **never** dictates application logic. A reviewer could restyle `.is-passing` entirely without touching a single line of JavaScript, and the reverse is equally true — a deliberate, textbook implementation of separation of concerns.

### 5.2 Security-First DOM Manipulation

`innerHTML` is entirely absent from this codebase, eliminating the risk of DOM-based Cross-Site Scripting (XSS):

```javascript
/* ❌ Fragile & insecure — never used in this project */
list.innerHTML = `<li class="subject">${userInput}</li>`;

/* ✅ Robust & secure — used exclusively throughout */
const li = document.createElement('li');
li.className = 'subject';
li.textContent = userInput;
list.appendChild(li);
```

---

## 6. Dynamic Features & Logic

### 6.1 Real-Time Dashboard & Array Reduction

The overall average recalculates instantly with every entry added, edited, or removed. This relies on `Array.prototype.reduce()` to compute the total grade sum from the state array in real time, gracefully handling edge cases such as an empty state.

### 6.2 Interactive SVG Data Visualization

The hero section features a custom-built SVG ring that visualizes progress. Rather than importing a charting library, the JS calculates a 0–1 ratio based on the average and dynamically updates the `stroke-dashoffset` of the SVG `<circle>`, mathematically filling the ring — and toggling its color between "passing" and "failing" states.

### 6.3 Inline Editing & Event Delegation

Each dynamically generated list item can be edited in place. To preserve memory and performance, rather than attaching an event listener to every individual row, **event delegation** is used on the parent `<ul>`. Clicking a text field swaps the `<span>` for an `<input>`, updating both the array state and the DOM on `Enter` or `focusout`.

---

## 7. Audit & Compliance

### 7.1 Lighthouse Report — 4 × 100

| Metric | Score |
|--------|-------|
| ⚡ Performance | 100 / 100 |
| ♿ Accessibility | 100 / 100 |
| ✅ Best Practices | 100 / 100 |
| 🔍 SEO | 100 / 100 |

*Audit conducted via Chrome DevTools Lighthouse · Desktop mode · Cold cache. The full interactive report is available at `audit/lighthouse-report.html`.*

### 7.2 Security & Accessibility Compliance

| Requirement | Implementation |
|---|---|
| **XSS Prevention** | Strict avoidance of `innerHTML`; `.textContent` used for all user-injected data. |
| **Keyboard Navigation** | All dynamically generated rows and edit fields are assigned `tabindex="0"` and appropriate `role="button"` attributes. |
| **Form Validation** | Native `required`, `min`, `max`, and `step` attributes, backed by JS validation before any state mutation. |
| **Contrast & State** | Dynamic addition of `.is-passing` (green) and `.is-failing` (red) classes based on `PASS_THRESHOLD`. |

### 7.3 Technical Note — Zero Dependencies

> **Note for reviewers:** This project operates with absolute autonomy. There are no runtime CDN dependencies for JavaScript libraries (no React, Vue, or jQuery) or CSS frameworks. The execution logic, state management, and styling are completely local and native to the browser's engine.

---

## 8. What I Learned

This project pushed me to deeply internalize concepts that frameworks usually abstract away:

- **Manual DOM construction** — Building every list item, stat, and SVG element by hand gave me a much clearer mental model of the DOM tree and *why* frameworks like React exist in the first place.
- **State as the single source of truth** — Treating the JS state array as authoritative and re-rendering the DOM from it (rather than patching the DOM ad hoc) taught me the foundational pattern behind most modern reactive frameworks.
- **Security isn't optional** — Committing to zero `innerHTML` usage forced me to understand *why* `.textContent` and `createElement()` are the safer default, not just a stylistic preference.
- **Event delegation at scale** — Handling inline editing through a single listener on the parent list, rather than one per row, taught me how to keep an app performant as the dataset grows.
- **Discipline scales** — Enforcing strict naming conventions (`.js-` vs `.is-`) on a solo project felt like overhead at first, but it made debugging and reasoning about the code dramatically easier as the feature set grew.

---

## 9. Quick Start

No build step. No package manager. No server strictly required for basic viewing.

**Option A — Open directly in the browser**

```bash
# Clone the repository
git clone https://github.com/YSB1945/decodelabs-project3-theledger.git

# Navigate to the project folder
cd decodelabs-project3-theledger

# Open in your default browser (macOS)
open index.html

# Open in your default browser (Linux)
xdg-open index.html

# Open in your default browser (Windows)
start index.html
```

**Option B — Serve locally with VS Code Live Server**

1. Open the project folder in Visual Studio Code
2. Install the *Live Server* extension
3. Right-click `index.html` → **Open with Live Server**
4. The page opens at `http://127.0.0.1:5500`

**Option C — Serve locally with Python**

```bash
# Python 3
python -m http.server 8000

# Then open http://localhost:8000 in your browser
```

**Viewing the audit report**

```bash
open audit/lighthouse-report.html
```

---

## 10. Tech Stack

| Layer | Technology |
|---|---|
| **Markup** | HTML5 (semantic, ARIA-enhanced, dynamically generated) |
| **Styling** | CSS3 — design tokens, visual state tracking |
| **Scripting** | Vanilla JavaScript (ES6+) — IPO loop, event delegation |
| **Fonts** | Google Fonts — Fraunces, Inter, JetBrains Mono |
| **Audit** | Google Lighthouse |
| **Tooling** | None — zero build step, zero dependencies |

---

<p align="center"><sub>DecodeLabs Internship — Batch 2026 · Project 3: Interactive Web Elements</sub></p>