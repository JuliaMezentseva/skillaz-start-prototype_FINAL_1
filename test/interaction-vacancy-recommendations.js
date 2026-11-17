// The screencast path: management → first vacancy → employee evidence → all recommendations.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");
const babel = require("@babel/core");
const root = path.resolve(__dirname, "..");
const tick = (ms = 60) => new Promise(resolve => setTimeout(resolve, ms));

async function load(file, query = "") {
  const htmlPath = path.join(root, file);
  const dom = new JSDOM('<div id="root"></div>', {
    url: "https://prototype.example/" + file + (query ? "?" + query : ""),
    runScripts: "outside-only", pretendToBeVisual: true,
  });
  const w = dom.window;
  global.window = w; global.document = w.document; global.HTMLElement = w.HTMLElement;
  global.requestAnimationFrame = w.requestAnimationFrame;
  w.React = require("react");
  w.ReactDOM = { ...require("react-dom/client"), createPortal: require("react-dom").createPortal };
  w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
  w.HTMLCanvasElement.prototype.getContext = () => null;
  const errors = [];
  w.addEventListener("error", event => errors.push(event.error || event.message));
  const html = fs.readFileSync(htmlPath, "utf8");
  for (const [, attrs, inline] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    const src = attrs.match(/src="([^"]+)"/);
    if (src && /^https?:/.test(src[1])) continue;
    let code = src ? fs.readFileSync(path.resolve(path.dirname(htmlPath), src[1]), "utf8") : inline;
    if (attrs.includes('type="text/babel"')) code = babel.transformSync(code, { presets: [["@babel/preset-react", { runtime: "classic" }]] }).code;
    new w.Function("window", "document", "React", "ReactDOM", code)(w, w.document, w.React, w.ReactDOM);
  }
  await tick();
  function click(element) {
    assert.ok(element, "Expected interactive element exists");
    element.focus();
    element.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
    return tick();
  }
  return { w, doc: w.document, errors, click, close: () => w.close() };
}

(async () => {
  const management = await load("hr/vacancies-manage.html");
  assert.ok(management.doc.querySelector("thead").textContent.includes("Рекомендации"));
  assert.equal(management.doc.querySelector("tbody tr").textContent.includes("Специалист поддержки клиентов"), true);
  assert.equal(management.doc.querySelector("tbody tr a.ai-count-tag").getAttribute("href"), "vacancy.html?id=v1&tab=recommendations");
  assert.deepEqual(management.errors, []);
  management.close();

  const page = await load("hr/vacancy.html", "id=v1");
  assert.equal(page.doc.querySelectorAll(".ai-person-row").length, 5);
  const firstEmployee = page.doc.querySelector(".ai-person-row");
  await page.click(firstEmployee);
  let dialog = page.doc.querySelector('[role="dialog"]');
  assert.ok(dialog.textContent.includes("Виноградов Ярослав"));
  for (const heading of ["Навыки", "Курсы", "ИПР", "Интересы"]) assert.ok(dialog.textContent.includes(heading));
  assert.equal(page.doc.activeElement.getAttribute("aria-label"), "Закрыть основания рекомендации");
  page.doc.dispatchEvent(new page.w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await tick();
  assert.equal(page.doc.querySelector('[role="dialog"]'), null);
  assert.ok(page.doc.activeElement === firstEmployee, "Closing evidence returns focus to the employee row");

  await page.click(page.doc.querySelector(".ai-show-all"));
  assert.equal(page.doc.querySelectorAll(".ai-candidate-card").length, 7);
  assert.ok(page.doc.querySelector(".ai-candidate-card").textContent.includes("Просмотрено"));
  assert.equal(page.w.location.search, "?id=v1&tab=recommendations");
  await page.click(page.doc.querySelector(".ai-candidate-card:nth-child(2)"));
  assert.ok(page.doc.querySelector('[role="dialog"]').textContent.includes("Белозёрова Дарья"));
  await page.click(page.doc.querySelector('[aria-label="Закрыть основания рекомендации"]'));
  assert.equal(page.doc.querySelector(".ai-candidate-card:nth-child(2) .ai-new-label"), null);

  await page.click(page.doc.querySelector(".ai-refresh"));
  assert.ok(page.doc.querySelector('[role="status"]').textContent.includes("Пожалуйста, подождите"));
  await page.click(page.doc.querySelector(".ai-cancel"));
  assert.equal(page.doc.querySelectorAll(".ai-candidate-card").length, 7);
  await page.click(page.doc.querySelector(".ai-refresh"));
  await tick(1600);
  assert.equal(page.doc.querySelectorAll(".ai-candidate-card").length, 7);
  assert.ok(page.doc.querySelector(".ai-candidate-card:last-child .ai-new-label"));
  assert.deepEqual(page.errors, []);
  page.close();

  const direct = await load("hr/vacancy.html", "id=v1&tab=recommendations");
  assert.equal(direct.doc.querySelectorAll(".ai-candidate-card").length, 7);
  direct.close();
  const other = await load("hr/vacancy.html", "id=v2");
  assert.equal(other.doc.querySelector(".ai-recommendation-panel"), null);
  assert.equal(other.doc.querySelector(".ai-vacancy-tabs"), null);
  assert.deepEqual(other.errors, []);
  other.close();
  console.log("PASS: management, first vacancy, modal, keyboard/focus, recommendation tab, refresh/cancel, direct link, first-vacancy scope");
})().catch(error => { console.error(error); process.exit(1); });
