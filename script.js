const STORAGE_KEY = "code-editor-state-v1";

const DEFAULTS = {
  html: `<h1>Hello, world</h1>\n<button id="btn">Click me</button>\n<p id="out"></p>`,
  css: `body {\n  font-family: sans-serif;\n  text-align: center;\n  padding: 2rem;\n}\n\nbutton {\n  padding: 0.5rem 1rem;\n}`,
  js: `let count = 0;\n\ndocument.getElementById("btn").addEventListener("click", () => {\n  count++;\n  document.getElementById("out").textContent = "Clicked " + count + " times";\n  console.log("count:", count);\n});`
};

const editors = {
  html: document.getElementById("html"),
  css: document.getElementById("css"),
  js: document.getElementById("js")
};
const preview = document.getElementById("preview");
const consoleOut = document.getElementById("consoleOut");

/* ---------- State ---------- */
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && typeof saved === "object" ? { ...DEFAULTS, ...saved } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveState() {
  try {
    const state = {};
    for (const key in editors) state[key] = editors[key].value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* storage unavailable: ignore */ }
}

/* ---------- Preview ---------- */
const consoleBridge = `
<script>
  ["log", "warn", "error"].forEach(function (type) {
    var original = console[type];
    console[type] = function () {
      var text = Array.prototype.map.call(arguments, function (a) {
        try { return typeof a === "object" ? JSON.stringify(a) : String(a); }
        catch (e) { return String(a); }
      }).join(" ");
      parent.postMessage({ source: "preview-console", type: type, text: text }, "*");
      original.apply(console, arguments);
    };
  });
  window.addEventListener("error", function (e) {
    parent.postMessage({ source: "preview-console", type: "error", text: e.message }, "*");
  });
<\/script>`;

function buildDocument() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>${editors.css.value}</style>
${consoleBridge}
</head>
<body>
${editors.html.value}
<script>${editors.js.value.replace(/<\/script>/gi, "<\\/script>")}<\/script>
</body>
</html>`;
}

function render() {
  consoleOut.textContent = "";
  preview.srcdoc = buildDocument();
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
const update = debounce(() => { render(); saveState(); }, 300);

window.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.source !== "preview-console") return;
  const line = document.createElement("div");
  if (data.type === "error") line.className = "err";
  line.textContent = data.text;
  consoleOut.appendChild(line);
  consoleOut.scrollTop = consoleOut.scrollHeight;
});

/* ---------- Editor behavior ---------- */
for (const key in editors) {
  const el = editors[key];
  el.addEventListener("input", update);
  el.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const { selectionStart: s, selectionEnd: end } = el;
      el.setRangeText("  ", s, end, "end");
      update();
    }
  });
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    for (const key in editors) editors[key].classList.remove("active");
    tab.classList.add("active");
    editors[tab.dataset.lang].classList.add("active");
    editors[tab.dataset.lang].focus();
  });
});

/* ---------- Toolbar ---------- */
document.getElementById("layoutBtn").addEventListener("click", () => {
  document.getElementById("workspace").classList.toggle("stacked");
});

document.getElementById("clearConsole").addEventListener("click", () => {
  consoleOut.textContent = "";
});

document.getElementById("resetBtn").addEventListener("click", () => {
  if (!confirm("Reset all code to the starter example?")) return;
  for (const key in editors) editors[key].value = DEFAULTS[key];
  render();
  saveState();
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  const blob = new Blob([buildDocument()], { type: "text/html" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "project.html";
  link.click();
  URL.revokeObjectURL(link.href);
});

/* ---------- Init ---------- */
const initial = loadState();
for (const key in editors) editors[key].value = initial[key];
render();
