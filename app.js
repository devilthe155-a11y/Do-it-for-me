/* Do It For Me: all app logic. Plain JavaScript, no build step. Content is in data.js. */

/* ---------- small helpers ---------- */
const $ = id => document.getElementById(id);

function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (k === "class") el.className = v;
    else if (k === "value" || k === "checked" || k === "disabled") el[k] = v;
    else if (k.startsWith("on")) el[k] = v;
    else if (v !== false && v != null) el.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(kid));
  return el;
}

const KEY = "difm2:";
function load(k, fallback) {
  try { const v = localStorage.getItem(KEY + k); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
}
function save(k, v) { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }

const pad = n => String(n).padStart(2, "0");
const iso = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const today = () => iso(new Date());
const addDays = (s, n) => { const d = new Date(s + "T00:00:00"); d.setDate(d.getDate() + n); return iso(d); };
const rupees = n => "Rs " + Math.round(n).toLocaleString("en-IN");

let toastTimer;
function toast(msg) {
  const t = $("toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch (e) {
    const ta = h("textarea", { value: text }); document.body.append(ta); ta.select();
    let ok = false; try { ok = document.execCommand("copy"); } catch (_) { /* ignore */ }
    ta.remove(); return ok;
  }
}

/* Opens the phone's own share sheet, which lists every installed app, including AI apps. */
async function shareText(text, title) {
  const native = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Share;
  try {
    if (native) { await native.share({ title, text, dialogTitle: "Send to an AI app" }); return "shared"; }
    if (navigator.share) { await navigator.share({ title, text }); return "shared"; }
  } catch (e) {
    if (e && (e.name === "AbortError" || /cancel/i.test(e.message || ""))) return "cancelled";
  }
  return (await copyText(text)) ? "copied" : "failed";
}

/* ---------- shared state ---------- */
let profile = load("profile", DEFAULT_PROFILE);
let askDraft = "";      // text handed to the Ask AI tab from other tabs
let askMode = "Solve it for me";
let writeFor = "";      // name handed to the Write tab from People

function askAiLink(label, text, mode) {
  return h("button", { class: "ghost", type: "button", onclick: () => { askDraft = text; if (mode) askMode = mode; go("ask"); } }, label);
}

/* ---------- WRITE ---------- */
function viewWrite() {
  const f = load("writeForm", { me: "", co: "", skill: "" });
  const sit = h("select", { id: "w-sit" }, Object.keys(TEMPLATES).map(k => h("option", {}, k)));
  const me = h("input", { id: "w-me", value: f.me, placeholder: "Your name" });
  const them = h("input", { id: "w-them", value: writeFor, placeholder: "Their name" });
  const role = h("input", { id: "w-role", placeholder: "Their role" });
  const co = h("input", { id: "w-co", value: f.co, placeholder: "Company" });
  const skill = h("input", { id: "w-skill", value: f.skill, placeholder: "problem solving, web design" });
  const out = h("textarea", { id: "w-out", "aria-label": "Your message", placeholder: "Your message appears here. Edit it freely." });
  writeFor = "";
  const field = (l, el, id) => h("div", {}, h("label", { for: id }, l), el);
  return h("section", { class: "panel" },
    h("h2", {}, "Message maker"),
    h("div", { class: "grid" },
      field("What do you need?", sit, "w-sit"), field("Your name", me, "w-me"), field("Their name", them, "w-them"),
      field("Their role", role, "w-role"), field("Company", co, "w-co"), field("Your skills", skill, "w-skill")),
    h("div", { class: "row" },
      h("button", { class: "btn", type: "button", onclick: () => {
        save("writeForm", { me: me.value, co: co.value, skill: skill.value });
        out.value = TEMPLATES[sit.value]({ me: me.value.trim(), them: them.value.trim(), role: role.value.trim(), co: co.value.trim(), skill: skill.value.trim() });
      } }, "Write it"),
      askAiLink("My situation is not listed", "Write a message for this situation: ", "Write it for me")),
    out,
    h("div", { class: "row" },
      h("button", { class: "ghost", type: "button", onclick: async () => toast(await copyText(out.value) ? "Copied" : "Select and copy it manually") }, "Copy"),
      h("button", { class: "ghost", type: "button", onclick: async () => {
        const r = await shareText(out.value, "Message"); if (r === "copied") toast("Copied");
      } }, "Send via app")));
}

/* ---------- DECODE ---------- */
function viewDecode() {
  const list = h("div", { class: "panel", style: "gap:10px" });
  const q = h("input", { type: "search", id: "d-q", placeholder: "Search a word (KPI, CTC, sprint...)", "aria-label": "Search words" });
  function draw() {
    const s = q.value.toLowerCase().trim();
    list.replaceChildren();
    const hits = GLOSSARY.filter(g => (g[0] + " " + g[1]).toLowerCase().includes(s));
    if (!hits.length) {
      list.append(h("p", { class: "note" }, "Not in my list."), askAiLink("Ask an AI to explain \"" + q.value + "\"", "Explain this office or corporate term in simple words: " + q.value, "Explain it simply"));
      return;
    }
    hits.forEach(g => list.append(h("div", { class: "item" },
      h("h3", {}, g[0]), h("div", {}, g[1]), g[2] ? h("div", { class: "say" }, "You can say: " + g[2]) : null)));
  }
  q.oninput = draw; draw();
  return h("div", { style: "display:flex;flex-direction:column;gap:14px" }, h("section", { class: "panel" }, h("h2", {}, "Office words, explained"), q), list);
}

/* ---------- PREP ---------- */
function viewPrep() {
  const f = load("prepForm", { name: "", field: "", str: "", co: "" });
  const inputs = {
    name: h("input", { id: "p-name", value: f.name, placeholder: "Your name" }),
    field: h("input", { id: "p-field", value: f.field, placeholder: "computer science" }),
    str: h("input", { id: "p-str", value: f.str, placeholder: "problem solving, drawing" }),
    co: h("input", { id: "p-co", value: f.co, placeholder: "Company name" })
  };
  const list = h("div", { style: "display:flex;flex-direction:column;gap:10px" });
  function draw() {
    const v = { name: inputs.name.value.trim() || "[Your name]", field: inputs.field.value.trim() || "[your field]", str: inputs.str.value.trim() || "[your strengths]", co: inputs.co.value.trim() || "[the company]" };
    save("prepForm", { name: inputs.name.value, field: inputs.field.value, str: inputs.str.value, co: inputs.co.value });
    list.replaceChildren(...interviewQs(v).map(q => h("div", { class: "item" }, h("h3", {}, q[0]), h("div", { class: "say" }, q[1]))));
  }
  Object.values(inputs).forEach(i => { i.oninput = draw; });
  draw();
  const done = load("firstDay", {});
  const field = (l, el, id) => h("div", {}, h("label", { for: id }, l), el);
  return h("div", { style: "display:flex;flex-direction:column;gap:14px" },
    h("section", { class: "panel" }, h("h2", {}, "Interview answers"),
      h("div", { class: "grid" }, field("Name", inputs.name, "p-name"), field("Field", inputs.field, "p-field"), field("Strengths", inputs.str, "p-str"), field("Company", inputs.co, "p-co")),
      list, askAiLink("Different question? Ask an AI", "Prepare me for this interview or work situation: ", "Prepare me")),
    h("section", { class: "panel" }, h("h2", {}, "First day checklist"),
      FIRST_DAY.map((c, i) => h("label", { class: "check" },
        h("input", { type: "checkbox", checked: !!done[i], onchange: e => { done[i] = e.target.checked; save("firstDay", done); } }), c))));
}

/* ---------- DECIDE ---------- */
function viewDecide() {
  const st = load("decide", { a: "Option A", b: "Option B", rows: [["Salary", 5, 7, 6], ["Learning", 5, 6, 8], ["Travel and cost", 3, 5, 4]] });
  const a = h("input", { id: "x-a", value: st.a, "aria-label": "Option A name" });
  const b = h("input", { id: "x-b", value: st.b, "aria-label": "Option B name" });
  const table = h("table"); const res = h("div");
  const persist = () => save("decide", { a: a.value, b: b.value, rows: st.rows });
  a.oninput = b.oninput = persist;
  function draw() {
    table.replaceChildren(h("tr", {}, ["What matters", "Weight 1-10", "A: 1-10", "B: 1-10", ""].map(t => h("th", {}, t))),
      ...st.rows.map((r, i) => h("tr", {},
        [0, 1, 2, 3].map(j => h("td", {}, h("input", {
          value: r[j], type: j ? "number" : "text", min: 0, max: 10, "aria-label": ["Criterion", "Weight", "Score A", "Score B"][j],
          oninput: e => { r[j] = j ? Number(e.target.value) : e.target.value; persist(); }
        }))),
        h("td", {}, h("button", { class: "ghost", type: "button", onclick: () => { st.rows.splice(i, 1); persist(); draw(); } }, "Remove")))));
  }
  function decide() {
    let sa = 0, sb = 0, w = 0;
    st.rows.forEach(r => { sa += r[1] * r[2]; sb += r[1] * r[3]; w += r[1] * 10; });
    const pa = w ? Math.round(sa / w * 100) : 0, pb = w ? Math.round(sb / w * 100) : 0;
    const A = a.value || "A", B = b.value || "B";
    res.replaceChildren(
      h("div", { class: "win" }, pa === pb ? "Tie at " + pa + "%. Add one more thing that matters, or trust your gut." : (pa > pb ? A : B) + " wins: " + A + " " + pa + "% vs " + B + " " + pb + "%."),
      h("p", { class: "note" }, "If the result feels wrong, your weights are telling you something. Change what matters most and run it again."));
  }
  draw();
  return h("section", { class: "panel" }, h("h2", {}, "Decision maker"),
    h("p", { class: "note" }, "Name your options and what matters. Weight is how much it matters. Score each option from 1 to 10."),
    h("div", { class: "grid" }, h("div", {}, h("label", { for: "x-a" }, "Option A"), a), h("div", {}, h("label", { for: "x-b" }, "Option B"), b)),
    h("div", { class: "tablewrap" }, table),
    h("div", { class: "row" },
      h("button", { class: "ghost", type: "button", onclick: () => { st.rows.push(["", 5, 5, 5]); persist(); draw(); } }, "Add a row"),
      h("button", { class: "btn", type: "button", onclick: decide }, "Decide"),
      askAiLink("Ask an AI to decide", "Help me decide between options. My options and what matters to me: ", "Solve it for me")),
    res);
}

/* ---------- MONEY ---------- */
function viewMoney() {
  const num = (id, label, val, hint) => {
    const i = h("input", { id, type: "number", inputmode: "decimal", value: val, placeholder: hint || "" });
    return { i, el: h("div", {}, h("label", { for: id }, label), i) };
  };
  /* CTC to in-hand estimator */
  const ctc = num("m-ctc", "Yearly CTC (Rs)", "", "e.g. 400000");
  const basic = num("m-basic", "Basic pay % of CTC", 40);
  const ins = num("m-ins", "Insurance cost per year (Rs)", 0);
  const tax = num("m-tax", "Income tax per year (Rs)", 0);
  const est = h("div");
  const estimate = () => {
    const C = Number(ctc.i.value) || 0, b = C * (Number(basic.i.value) || 0) / 100;
    const employerPF = b * 0.12, gratuity = b * 0.0481, employeePF = b * 0.12, pt = 2400;
    const inhand = (C - employerPF - gratuity - (Number(ins.i.value) || 0) - employeePF - pt - (Number(tax.i.value) || 0)) / 12;
    est.replaceChildren(
      h("div", { class: "big" }, C ? rupees(Math.max(inhand, 0)) + " / month" : "Enter your CTC"),
      h("p", { class: "note" }, "A rough estimate: employer PF 12% of basic, gratuity 4.81% of basic, your PF 12% of basic, and Rs 200 a month professional tax are removed. Your offer letter's breakup is the truth. Ask HR for it."));
  };
  [ctc, basic, ins, tax].forEach(x => { x.i.oninput = estimate; }); estimate();

  /* Goal saver */
  const goal = num("g-goal", "Goal amount (Rs)", "", "e.g. 60000");
  const have = num("g-have", "Saved so far (Rs)", 0);
  const per = num("g-per", "I can save per month (Rs)", "", "e.g. 3000");
  const gres = h("div");
  const saver = () => {
    const left = (Number(goal.i.value) || 0) - (Number(have.i.value) || 0), p = Number(per.i.value) || 0;
    if (left <= 0) { gres.replaceChildren(h("div", { class: "win" }, Number(goal.i.value) ? "You have reached the goal." : "Enter a goal.")); return; }
    if (p <= 0) { gres.replaceChildren(h("p", { class: "note" }, "Enter how much you can save each month.")); return; }
    const m = Math.ceil(left / p), d = new Date(); d.setMonth(d.getMonth() + m);
    gres.replaceChildren(h("div", { class: "win" }, m + " months to go, around " + d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }) + "."));
  };
  [goal, have, per].forEach(x => { x.i.oninput = saver; }); saver();

  /* 50/30/20 split */
  const inc = num("b-inc", "Monthly in-hand (Rs)", "", "e.g. 30000");
  const bres = h("div");
  const split = () => {
    const v = Number(inc.i.value) || 0;
    bres.replaceChildren(v ? h("div", { class: "say" }, "Needs (rent, food, travel, bills): " + rupees(v * .5) + "\nWants (fun, shopping): " + rupees(v * .3) + "\nSavings and debt: " + rupees(v * .2)) : h("p", { class: "note" }, "Enter your monthly in-hand pay. Adjust the split to your life: if needs are above 50%, trim wants first."));
  };
  inc.i.oninput = split; split();

  return h("div", { style: "display:flex;flex-direction:column;gap:14px" },
    h("section", { class: "panel" }, h("h2", {}, "CTC to monthly in-hand"), h("div", { class: "grid" }, ctc.el, basic.el, ins.el, tax.el), est),
    h("section", { class: "panel" }, h("h2", {}, "Savings goal"), h("div", { class: "grid" }, goal.el, have.el, per.el), gres),
    h("section", { class: "panel" }, h("h2", {}, "Where should my salary go?"), inc.el, bres),
    askAiLink("Money question? Ask an AI", "I have a money question as a fresher in India: ", "Solve it for me"));
}

/* ---------- PEOPLE ---------- */
function viewPeople() {
  let people = load("people", []);
  const persist = () => save("people", people);
  const name = h("input", { id: "pe-name", placeholder: "Name" });
  const role = h("input", { id: "pe-role", placeholder: "Role and company" });
  const met = h("input", { id: "pe-met", placeholder: "How you know them" });
  const note = h("input", { id: "pe-note", placeholder: "Notes" });
  const list = h("div", { style: "display:flex;flex-direction:column;gap:10px" });
  function draw() {
    people.sort((a, b) => a.next.localeCompare(b.next));
    list.replaceChildren();
    if (!people.length) { list.append(h("p", { class: "note" }, "No one yet. Add the first person: a classmate, a senior, a relative's friend, anyone who could help you someday.")); return; }
    people.forEach((p, i) => {
      const due = p.next <= today();
      list.append(h("div", { class: "item" },
        h("div", { class: "row" }, h("h3", {}, p.name), h("span", { class: "tag" + (due ? " due" : "") }, due ? "Follow up now" : "Next: " + p.next)),
        h("div", { class: "note" }, [p.role, p.met, p.note].filter(Boolean).join(" · ")),
        h("div", { class: "note" }, "Last contacted: " + (p.last || "not yet")),
        h("div", { class: "row" },
          h("button", { class: "ghost", type: "button", onclick: () => { writeFor = p.name; go("write"); } }, "Write to them"),
          h("button", { class: "ghost", type: "button", onclick: () => { p.last = today(); p.next = addDays(today(), 14); persist(); draw(); toast("Next follow-up in 14 days"); } }, "I contacted them"),
          h("button", { class: "ghost danger", type: "button", onclick: () => { people.splice(i, 1); persist(); draw(); } }, "Remove"))));
    });
  }
  draw();
  const field = (l, el, id) => h("div", {}, h("label", { for: id }, l), el);
  return h("div", { style: "display:flex;flex-direction:column;gap:14px" },
    h("section", { class: "panel" }, h("h2", {}, "People who can help me"),
      h("p", { class: "note" }, "A network is built by small, regular contact. Add people, and the app tells you when to follow up."),
      h("div", { class: "grid" }, field("Name", name, "pe-name"), field("Role and company", role, "pe-role"), field("How you know them", met, "pe-met"), field("Notes", note, "pe-note")),
      h("div", { class: "row" }, h("button", { class: "btn", type: "button", onclick: () => {
        if (!name.value.trim()) { name.focus(); return; }
        people.push({ name: name.value.trim(), role: role.value.trim(), met: met.value.trim(), note: note.value.trim(), last: "", next: addDays(today(), 3) });
        [name, role, met, note].forEach(i => { i.value = ""; }); persist(); draw();
      } }, "Add person"))),
    h("section", { class: "panel" }, list));
}

/* ---------- PROOF ---------- */
function viewProof() {
  let items = load("proof", []);
  const persist = () => save("proof", items);
  const title = h("input", { id: "pr-title", placeholder: "What you built or learned" });
  const link = h("input", { id: "pr-link", placeholder: "Link (optional)" });
  const learn = h("input", { id: "pr-learn", placeholder: "Result or what you learned" });
  const list = h("div", { style: "display:flex;flex-direction:column;gap:10px" });
  function draw() {
    list.replaceChildren();
    if (!items.length) { list.append(h("p", { class: "note" }, "Nothing logged yet. Anything counts: a bug you fixed, a drawing, a small tool, a course finished.")); return; }
    items.slice().reverse().forEach(it => list.append(h("div", { class: "item" },
      h("h3", {}, it.title), h("div", { class: "note" }, it.date + (it.learn ? " · " + it.learn : "")),
      it.link ? h("a", { href: it.link, target: "_blank", rel: "noopener" }, it.link) : null,
      h("div", {}, h("button", { class: "ghost danger", type: "button", onclick: () => { items = items.filter(x => x !== it); persist(); draw(); } }, "Remove")))));
  }
  draw();
  const asText = () => items.map(it => "- " + it.title + (it.learn ? " (" + it.learn + ")" : "") + (it.link ? " " + it.link : "")).join("\n");
  const field = (l, el, id) => h("div", {}, h("label", { for: id }, l), el);
  return h("div", { style: "display:flex;flex-direction:column;gap:14px" },
    h("section", { class: "panel" }, h("h2", {}, "My proof of work"),
      h("p", { class: "note" }, "People trust what they can see. Log everything you make or learn. It becomes your resume bullets and portfolio."),
      h("div", { class: "grid" }, field("Title", title, "pr-title"), field("Result or learning", learn, "pr-learn"), field("Link", link, "pr-link")),
      h("div", { class: "row" },
        h("button", { class: "btn", type: "button", onclick: () => {
          if (!title.value.trim()) { title.focus(); return; }
          items.push({ title: title.value.trim(), link: link.value.trim(), learn: learn.value.trim(), date: today() });
          [title, link, learn].forEach(i => { i.value = ""; }); persist(); draw();
        } }, "Add"),
        h("button", { class: "ghost", type: "button", onclick: async () => toast(items.length ? ((await copyText(asText())) ? "Copied as resume bullets" : "Could not copy") : "Add something first") }, "Copy as resume bullets"),
        askAiLink("Polish with an AI", "Turn these into strong resume bullet points for a fresher: ", "Write it for me"))),
    h("section", { class: "panel" }, list));
}

/* ---------- ASK AI (hand-off) ---------- */
function viewAsk() {
  const mode = h("select", { id: "a-mode" }, Object.keys(ASK_MODES).map(k => h("option", { selected: k === askMode }, k)));
  const input = h("textarea", { id: "a-in", value: askDraft, placeholder: "Describe your situation in your own words. Any language you like." });
  const prompt = h("textarea", { id: "a-prompt", "aria-label": "Full prompt that will be sent", style: "min-height:180px" });
  const links = h("div", { class: "row" });
  const build = () => {
    prompt.value =
      "About me: " + profile + "\n\nWhat I need: " + ASK_MODES[mode.value] +
      " Use plain simple English and short sentences. Do not ask me questions back; assume sensible details and mark them in [brackets]. No markdown symbols." +
      "\n\nMy situation:\n" + input.value.trim();
    const q = encodeURIComponent(prompt.value);
    links.replaceChildren(...AI_APPS.map(app => h("a", {
      class: "ghost", href: app.url(q), target: "_blank", rel: "noopener",
      onclick: () => { copyText(prompt.value); if (app.noPrefill) toast("Prompt copied. Paste it in Gemini."); }
    }, app.name)));
  };
  mode.onchange = input.oninput = build; build();
  return h("section", { class: "panel" },
    h("h2", {}, "Ask any AI on my phone"),
    h("p", { class: "note" }, "This app has no AI inside. It writes a complete prompt for you, then hands it to any AI app you already use. Pick one below, or use the share button to choose from every app on your phone."),
    h("div", {}, h("label", { for: "a-mode" }, "What kind of answer?"), mode),
    h("div", {}, h("label", { for: "a-in" }, "Your situation"), input),
    h("button", { class: "btn", type: "button", onclick: async () => {
      if (!input.value.trim()) { input.focus(); return; }
      const r = await shareText(prompt.value, "My prompt"); if (r === "copied") toast("Copied. Paste it in any AI app.");
    } }, "Send to any app on my phone"),
    h("p", { class: "note" }, "Or open one directly. The prompt is also copied, in case the app opens empty:"),
    links,
    h("div", {}, h("label", { for: "a-prompt" }, "Full prompt (you can edit it)"), prompt),
    h("button", { class: "ghost", type: "button", onclick: async () => toast(await copyText(prompt.value) ? "Copied" : "Select and copy it manually") }, "Copy prompt"));
}

/* ---------- ME (profile and backup) ---------- */
function viewMe() {
  const about = h("textarea", { id: "me-about", value: profile, oninput: e => { profile = e.target.value; save("profile", profile); } });
  const box = h("textarea", { id: "me-backup", style: "min-height:100px", placeholder: "Backup text appears here. To restore, paste a backup here and press Restore." });
  const names = ["people", "proof", "writeForm", "prepForm", "decide", "firstDay", "profile"];
  return h("div", { style: "display:flex;flex-direction:column;gap:14px" },
    h("section", { class: "panel" }, h("h2", {}, "About me"),
      h("p", { class: "note" }, "This is added to every AI prompt so the answers fit your life. Keep it true and update it as you grow."), about),
    h("section", { class: "panel" }, h("h2", {}, "Backup"),
      h("p", { class: "note" }, "Everything is stored only on this phone. Copy a backup and keep it somewhere safe, such as a note to yourself."),
      box,
      h("div", { class: "row" },
        h("button", { class: "ghost", type: "button", onclick: async () => {
          const data = {}; names.forEach(n => { data[n] = load(n, null); });
          box.value = JSON.stringify(data); toast(await copyText(box.value) ? "Backup copied" : "Select and copy it");
        } }, "Make backup"),
        h("button", { class: "ghost", type: "button", onclick: () => {
          try { const d = JSON.parse(box.value); names.forEach(n => { if (d[n] != null) save(n, d[n]); }); profile = load("profile", DEFAULT_PROFILE); toast("Restored"); go("me"); }
          catch (e) { toast("That is not a valid backup"); }
        } }, "Restore"))));
}

/* ---------- router ---------- */
const TABS = [
  ["write", "Write", viewWrite], ["ask", "Ask AI", viewAsk], ["decode", "Decode", viewDecode], ["prep", "Prep", viewPrep],
  ["decide", "Decide", viewDecide], ["money", "Money", viewMoney], ["people", "People", viewPeople], ["proof", "Proof", viewProof], ["me", "Me", viewMe]
];
let current = "write";
function go(id) {
  current = id; save("tab", id);
  [...$("nav").children].forEach((b, i) => b.setAttribute("aria-selected", String(TABS[i][0] === id)));
  const tab = TABS.find(t => t[0] === id) || TABS[0];
  $("view").replaceChildren(tab[2]());
  window.scrollTo(0, 0);
}
TABS.forEach(t => $("nav").append(h("button", { type: "button", role: "tab", onclick: () => go(t[0]) }, t[1])));
go(TABS.some(t => t[0] === load("tab", "write")) ? load("tab", "write") : "write");

/* Offline support for the web version (not needed inside the Android app). */
if ("serviceWorker" in navigator && location.protocol.startsWith("http") && !(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())) {
  navigator.serviceWorker.register("sw.js").catch(() => { /* optional */ });
}
