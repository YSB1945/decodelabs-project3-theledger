# 📊 The Ledger: Student Progress Dashboard

**DecodeLabs Frontend Internship (Batch 2026) — Project 3: Interactive Web Elements** *Pure Vanilla JavaScript, DOM Manipulation, and State Management.*

## 🧭 Overview
The Ledger is an interactive student progress dashboard that lets users log subjects and grades, then instantly visualizes academic performance through a live-updating average, a dynamic SVG progress ring, and an editable record list.

The core objective of this project was not just to build a working UI, but to prove engineering discipline: every line of DOM-facing code was written manually, with zero reliance on frameworks, libraries, or unsafe HTML injection. The result is a lightweight, secure, and fully predictable application built entirely on the fundamentals of the web platform.

## ✨ Key Features
* **📈 Real-Time Dashboard** — The overall average (out of 20) recalculates instantly with every entry added, edited, or removed, with zero page reloads.
* **🟢 Interactive SVG Data Visualization** — A custom-built SVG ring fills proportionally to the class average and dynamically switches color between a "passing" and "failing" state based on the 10/20 threshold.
* **✏️ Inline Editing** — Each dynamically generated list item is directly clickable, allowing users to edit a subject name or grade in place, with the state and DOM updating in perfect sync.
* **🛡️ Form Validation** — Guards against empty subject fields and invalid/out-of-range numerical grade inputs before any data enters the application state.
* **🌙 Persistent Dark Mode** — A toggleable visual theme managed entirely through CSS state classes, not inline styles.

## 🏗️ Technical Architecture
This project was built around four non-negotiable engineering principles, chosen specifically to demonstrate readiness for production-grade front-end work.

### 1. The IPO Loop (Input → Process → Output)
Every feature in The Ledger strictly follows the Input-Process-Output pattern, ensuring a predictable, unidirectional data flow rather than tangled, ad-hoc event handling:

* **INPUT** → User submits a form / clicks an editable element.
* **PROCESS** → Data is validated, the in-memory state array is updated, and derived values (average, pass/fail status) are recalculated.
* **OUTPUT** → The DOM is re-rendered from the updated state (list, dashboard stats, and SVG ring).

This loop is applied consistently across every interaction — adding a grade, editing an entry, and toggling dark mode all funnel through the same cycle, making the codebase easy to reason about and debug.

### 2. Security-First DOM Manipulation
`innerHTML` is never used anywhere in this codebase. All DOM nodes are constructed and mutated using the native, safe DOM API:
* `document.createElement()` to build every element.
* `appendChild()` / `removeChild()` to manage the tree.
* `.textContent` (never `.innerHTML`) to inject all user-provided text.

This eliminates an entire class of vulnerabilities — most notably DOM-based XSS — and forces a deeper, more deliberate understanding of how the browser actually constructs and updates the page.

### 3. Strict Decoupling (Separation of Concerns)
A disciplined CSS naming convention is enforced throughout the project to keep styling and behavior fully decoupled:

| Prefix | Purpose | Owned By |
| :--- | :--- | :--- |
| **`.js-`** | Element hooks used exclusively for JavaScript event binding/selection | JavaScript |
| **`.is-`** | Boolean visual/state classes (e.g. `.is-passing`, `.is-dark`, `.is-editing`) | CSS |

This means JavaScript never queries or depends on a class used for styling, and CSS never dictates application logic. A designer could restyle `.is-passing` entirely without touching a single line of JavaScript, and the reverse is equally true.

### 4. Deliberate State Management
Application state lives in plain JavaScript memory (no external store, no framework reactivity):
* `const` is used by default for all references to enforce immutability wherever the data does not need to change.
* `let` is reserved exclusively for values that are genuinely mutable (e.g. the running grades array, the next ID counter).

The DOM is treated as a pure reflection of state — the UI is re-rendered from state on every change, rather than being manually patched in inconsistent, scattered places.

## 📁 File Structure

```text
decodelabs-project3-theledger/
├── index.html                  # Main document — semantic HTML5 and static DOM scaffolding
├── style.css                   # External stylesheet — Design tokens, layouts, and visual states (.is- hooks)
├── script.js                   # Logic actuator — Vanilla JS, IPO loop, state management, and DOM mutation
├── README.md                   # Technical documentation & architecture blueprint
└── audit/
    └── lighthouse-report.html  # Audited Chrome DevTools Lighthouse report

    
## 🎓 What I Learned
This project pushed me to deeply internalize concepts that frameworks usually abstract away:
* **Manual DOM construction:** Building every list item, stat, and SVG element by hand gave me a much clearer mental model of the DOM tree, reflow/repaint behavior, and why frameworks like React exist.
* **State as the single source of truth:** Treating the JS state object as authoritative and re-rendering the DOM from it taught me the foundational pattern behind virtually all modern reactive frameworks.
* **Security isn't optional:** Committing to zero `innerHTML` usage forced me to understand why `.textContent` and `createElement()` are the safer defaults.
* **Discipline scales:** Enforcing strict naming conventions (`.js-` vs `.is-`) on a solo project made debugging, refactoring, and reasoning about the code dramatically easier as the feature set grew.

## 🚀 How to Run Locally
No build tools, package managers, or dependencies required — this is intentionally a pure HTML/CSS/JS project.

```bash
# 1. Clone the repository
git clone [https://github.com/YSB1945/decodelabs-project3-theledger.git](https://github.com/YSB1945/decodelabs-project3-theledger.git)

# 2. Navigate into the project folder
cd decodelabs-project3-theledger

# 3. Open index.html directly in your browser
#    (or use a lightweight local server, e.g. via VS Code's Live Server extension)