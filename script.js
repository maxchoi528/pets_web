const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const toolTabs = document.querySelector(".tool-tabs");
const toolPanel = document.querySelector(".tool-panel");
const toolOpenButtons = document.querySelectorAll("[data-tool-open]");
let activeUnitSystem = "us";

const safetyFoods = [
  { names: ["chocolate", "cocoa"], level: "Danger", note: "Avoid. Theobromine can be toxic, especially for dogs." },
  { names: ["grapes", "raisins"], level: "Danger", note: "Avoid. Can be linked to kidney injury in dogs." },
  { names: ["onion", "garlic", "chives"], level: "Danger", note: "Avoid. Allium foods can damage red blood cells." },
  { names: ["xylitol", "birch sugar"], level: "Emergency", note: "Avoid. Xylitol can cause rapid, severe problems in dogs." },
  { names: ["macadamia"], level: "Danger", note: "Avoid for dogs. Can cause weakness and other symptoms." },
  { names: ["coffee", "caffeine"], level: "Danger", note: "Avoid. Caffeine is unsafe for pets." },
  { names: ["apple"], level: "Usually ok", note: "Plain apple flesh is often used as a small treat. Remove seeds and core." },
  { names: ["carrot"], level: "Usually ok", note: "Plain carrots are commonly used as a low-calorie treat." },
  { names: ["peanut butter"], level: "Check label", note: "Only xylitol-free, unsweetened options, in small amounts." },
  { names: ["milk", "dairy"], level: "Use caution", note: "Many pets are lactose sensitive. Use tiny amounts or avoid." },
];

const energyOptions = [
  ["1.6", "Adult dog, neutered"],
  ["1.8", "Adult dog, intact"],
  ["1.4", "Adult dog, obesity prone"],
  ["3.0", "Puppy under 4 months"],
  ["2.0", "Puppy over 4 months"],
  ["1.2", "Adult cat, neutered"],
  ["1.4", "Adult cat, intact"],
  ["1.0", "Adult cat, obesity prone"],
  ["2.5", "Kitten"],
];

const unitLabels = {
  us: "US",
  metric: "Metric",
};

const tools = [
  {
    id: "food",
    number: "01",
    title: "Daily food calculator",
    unitSystems: true,
    deck: "Estimate cups per day from weight, energy factor, label calories, and meal count.",
    fields: [
      { key: "weight", label: "Pet weight", type: "number", value: 24, min: 1, max: 220, step: 0.1, unit: "lb", metric: { unit: "kg", ratio: 0.453592, min: 0.5, max: 100, step: 0.1 } },
      {
        key: "factor",
        label: "Life stage / status",
        type: "select",
        value: "1.6",
        options: energyOptions,
      },
      { key: "kcalCup", label: "Food label calories", type: "number", value: 370, min: 100, max: 900, step: 1, unit: "kcal/cup", metric: { key: "kcal100g", unit: "kcal/100g", value: 360, min: 25, max: 650, step: 1 } },
      { key: "meals", label: "Meals per day", type: "number", value: 2, min: 1, max: 6, step: 1, unit: "meals" },
    ],
    compute(values, system) {
      const factor = Number(values.factor);
      const kcal = rer(values.weight) * factor;
      const cups = values.kcalCup ? kcal / values.kcalCup : null;
      const grams = values.kcal100g ? (kcal / values.kcal100g) * 100 : null;
      const perMeal = cups ? cups / values.meals : null;
      return result(
        system === "metric" ? `${Math.round(grams)} g / day` : `${cups.toFixed(1)} cups / day`,
        system === "metric" ? `${Math.round(grams / values.meals)} g per meal across ${values.meals} meals.` : `${perMeal.toFixed(2)} cups per meal across ${values.meals} meals.`,
        [
          `Formula: RER = 70 x body weight(kg)^0.75, then MER = RER x ${factor}.`,
          `Estimated calories: ${Math.round(kcal)} kcal/day.`,
          "Use the feeding guide on the actual food bag as a second check.",
          "If the result is 10-30% below a maintenance label amount, ask a vet whether a weight-management diet is safer.",
        ],
        "Merck Veterinary Manual RER/MER table; WSAVA notes calorie estimates are starting points and individual needs can vary widely.",
        foodVisual(cups, perMeal, values.meals, kcal, system, grams),
      );
    },
  },
  {
    id: "calories",
    number: "02",
    title: "Calorie needs",
    unitSystems: true,
    deck: "Calculate resting energy requirement and a daily maintenance estimate.",
    fields: [
      { key: "weight", label: "Pet weight", type: "number", value: 24, min: 1, max: 220, step: 0.1, unit: "lb", metric: { unit: "kg", ratio: 0.453592, min: 0.5, max: 100, step: 0.1 } },
      {
        key: "factor",
        label: "Lifestyle",
        type: "select",
        value: "1.6",
        options: energyOptions,
      },
    ],
    compute(values) {
      const base = rer(values.weight);
      const daily = base * Number(values.factor);
      return result(`${Math.round(daily)} kcal / day`, `Resting estimate is ${Math.round(base)} kcal/day before lifestyle adjustment.`, [
        "Recheck after weight changes, neuter status changes, or activity changes.",
        "Calculated energy needs are only a starting point; individual pets may need meaningfully more or less.",
      ], "Merck Veterinary Manual RER/MER table.");
    },
  },
  {
    id: "treats",
    number: "03",
    title: "Treat budget",
    deck: "Keep snacks inside a chosen share of daily calories.",
    fields: [
      { key: "dailyKcal", label: "Daily calories", type: "number", value: 420, min: 50, max: 3000, step: 1, unit: "kcal" },
      { key: "percent", label: "Treat limit", type: "number", value: 10, min: 1, max: 20, step: 1, unit: "%" },
      { key: "treatKcal", label: "Calories per treat", type: "number", value: 18, min: 1, max: 300, step: 1, unit: "kcal" },
    ],
    compute(values) {
      const budget = values.dailyKcal * (values.percent / 100);
      const count = Math.floor(budget / values.treatKcal);
      return result(`${count} treats max`, `${Math.round(budget)} kcal available for treats at ${values.percent}% of daily calories.`, [
        "If training uses many rewards, use tiny pieces or part of the regular meal.",
        "Keep the main diet complete and balanced; treats are not a balanced meal.",
      ], "AAHA/VCA-style nutrition guidance commonly limits treats to about 10% of daily calories.");
    },
  },
  {
    id: "water",
    number: "04",
    title: "Water intake",
    unitSystems: true,
    deck: "Estimate a normal daily hydration range by body weight.",
    fields: [
      { key: "weight", label: "Pet weight", type: "number", value: 24, min: 1, max: 220, step: 0.1, unit: "lb", metric: { unit: "kg", ratio: 0.453592, min: 0.5, max: 100, step: 0.1 } },
    ],
    compute(values) {
      const kg = lbToKg(values.weight);
      const low = kg * 44;
      const high = kg * 66;
      return result(`${Math.round(low)}-${Math.round(high)} ml / day`, `That is roughly ${(low / 237).toFixed(1)}-${(high / 237).toFixed(1)} US cups.`, [
        "Wet food, heat, exercise, and health conditions can change this a lot.",
      ], "Merck lists roughly 44-66 mL/kg body weight for most mammals in a thermoneutral environment.");
    },
  },
  {
    id: "bcs",
    number: "05",
    title: "Body condition",
    deck: "Translate a 1-9 body condition score into a rough goal-weight discussion point.",
    fields: [
      {
        key: "species",
        label: "Pet type",
        type: "select",
        value: "dog",
        options: [
          ["dog", "Dog"],
          ["cat", "Cat"],
        ],
      },
      { key: "score", label: "BCS score", type: "number", value: 6, min: 1, max: 9, step: 1, unit: "1-9" },
    ],
    compute(values) {
      const score = Math.max(1, Math.min(9, Math.round(values.score)));
      const ideal = values.species === "dog" ? score >= 4 && score <= 5 : score === 5;
      const label = score <= 3 ? "below ideal" : ideal ? "ideal range" : score >= 9 ? "obese range" : "above ideal";
      return result(`BCS ${score}: ${label}`, values.species === "dog" ? "Merck lists 4-5/9 as ideal for dogs." : "Merck lists 5/9 as ideal for cats.", [
        "This tool does not estimate a target weight because that needs hands-on assessment.",
        "Track photos from the side and above, plus rib feel, before discussing a goal with a vet.",
      ], "Merck Veterinary Manual BCS scale; WSAVA provides dog/cat BCS charts.");
    },
  },
  {
    id: "age",
    number: "06",
    title: "Age converter",
    deck: "Convert dog or cat age into a human-age style life-stage estimate.",
    fields: [
      {
        key: "species",
        label: "Pet type",
        type: "select",
        value: "dog",
        options: [
          ["dog", "Dog"],
          ["cat", "Cat"],
        ],
      },
      {
        key: "size",
        label: "Dog size",
        type: "select",
        value: "medium",
        options: [
          ["small", "Small dog"],
          ["medium", "Medium dog"],
          ["large", "Large dog"],
        ],
      },
      { key: "years", label: "Age", type: "number", value: 4, min: 0.1, max: 30, step: 0.1, unit: "years" },
    ],
    compute(values) {
      const perYear = values.species === "cat" ? 4 : { small: 4, medium: 5, large: 6 }[values.size];
      const human = values.years <= 1 ? values.years * 15 : values.years <= 2 ? 15 + (values.years - 1) * 9 : 24 + (values.years - 2) * perYear;
      const stage = values.years < 1 ? "baby" : values.years < 3 ? "young adult" : values.years < 8 ? "adult" : "senior";
      return result(`${Math.round(human)} yrs`, `Approximate human-age style estimate. Life stage: ${stage}.`, [
        "Breed, size, and health history matter more than a single conversion chart.",
        "For dogs, the UC Davis epigenetic formula exists but was based on Labrador Retrievers; this tool keeps a simpler life-stage estimate.",
      ], "UC Davis/AVMA-style dog age guidance; cat conversion uses the common 15-9-4 rule cited by veterinary education sites.");
    },
  },
  {
    id: "frequency",
    number: "07",
    title: "Meal frequency",
    deck: "Plan puppy or kitten meals per day by age band.",
    fields: [
      {
        key: "species",
        label: "Pet type",
        type: "select",
        value: "puppy",
        options: [
          ["puppy", "Puppy"],
          ["kitten", "Kitten"],
        ],
      },
      { key: "months", label: "Age", type: "number", value: 4, min: 0.5, max: 24, step: 0.5, unit: "months" },
    ],
    compute(values) {
      let meals = 2;
      if (values.species === "kitten") meals = values.months < 6 ? 3 : 2;
      if (values.species === "puppy") meals = values.months < 3 ? 4 : values.months < 6 ? 3 : 2;
      return result(`${meals} meals / day`, `A simple starting rhythm for ${values.species} at ${values.months} months.`, [
        "Tiny breeds, medical needs, and growth plans may need a different rhythm.",
        "Portion size still comes from the daily calorie target or the food label.",
      ], "Cornell says kittens under 6 months usually do best with 3 meals/day, then 2 meals/day between 6-12 months; VCA/Tufts support smaller, more frequent puppy meals, especially under 6 months.");
    },
  },
  {
    id: "vaccines",
    number: "08",
    title: "Vaccine timeline",
    deck: "Generate a vet-discussion timeline without pretending to prescribe care.",
    fields: [
      {
        key: "species",
        label: "Pet type",
        type: "select",
        value: "dog",
        options: [
          ["dog", "Dog"],
          ["cat", "Cat"],
        ],
      },
      { key: "weeks", label: "Current age", type: "number", value: 10, min: 1, max: 520, step: 1, unit: "weeks" },
    ],
    compute(values) {
      const core = values.species === "dog" ? ["DHPP discussion", "Rabies timing", "Lifestyle vaccines"] : ["FVRCP discussion", "Rabies timing", "Lifestyle vaccines"];
      const items = values.weeks < 16
        ? [`Now: ask about ${core[0]}`, "Next: schedule booster window", `By local law: confirm ${core[1]}`, core[2]]
        : [`Bring records: confirm ${core[0]}`, `Confirm ${core[1]} status`, "Ask about annual or multi-year schedule", core[2]];
      return result("Vet visit checklist", "Use this to prepare questions, not to self-schedule vaccines.", items, "AAHA canine and AAHA/AAFP feline vaccination guidelines classify core/noncore vaccines and emphasize patient risk assessment.");
    },
  },
  {
    id: "deworming",
    number: "09",
    title: "Deworming planner",
    deck: "Create a simple reminder date from the last treatment date and interval.",
    fields: [
      {
        key: "plan",
        label: "Reminder type",
        type: "select",
        value: "monthly",
        options: [
          ["monthly", "Monthly broad-spectrum reminder"],
          ["early", "Young puppy/kitten 2-week reminder"],
          ["custom", "Custom vet interval"],
        ],
      },
      { key: "lastDate", label: "Last reminder date", type: "date", value: todayIso() },
      { key: "interval", label: "Custom interval", type: "number", value: 4, min: 1, max: 52, step: 1, unit: "weeks" },
    ],
    compute(values) {
      const interval = values.plan === "early" ? 2 : values.plan === "monthly" ? 4 : values.interval;
      const next = addDays(values.lastDate, interval * 7);
      return result(formatDate(next), `Next reminder based on a ${interval}-week interval.`, [
        "Deworming products and timing depend on region, age, weight, lifestyle, and vet advice.",
        "This is a reminder date only, not a dose or product recommendation.",
        "CAPC specifically calls out 2-week intervals for puppies and kittens until regular broad-spectrum parasite control begins.",
      ], "CAPC recommends year-round broad-spectrum parasite control; puppies and kittens start anthelmintic treatment at 2 weeks and repeat every 2 weeks until regular broad-spectrum control begins.");
    },
  },
  {
    id: "travel",
    number: "10",
    title: "Travel checklist",
    deck: "Generate a compact packing list for a trip with a dog or cat.",
    fields: [
      {
        key: "species",
        label: "Pet type",
        type: "select",
        value: "dog",
        options: [
          ["dog", "Dog"],
          ["cat", "Cat"],
        ],
      },
      { key: "days", label: "Trip length", type: "number", value: 3, min: 1, max: 60, step: 1, unit: "days" },
      {
        key: "transport",
        label: "Transport",
        type: "select",
        value: "car",
        options: [
          ["car", "Car"],
          ["flight", "Flight"],
          ["hotel", "Hotel / stay"],
        ],
      },
    ],
    compute(values) {
      const items = [`${values.days + 1} days of food portions`, "Water bowl and familiar blanket", "Vaccination / ID records", "Waste bags or litter supplies", "Current photo and microchip info"];
      if (values.transport === "flight") items.push("Airline-approved carrier measurements");
      if (values.species === "cat") items.push("Portable litter setup");
      return result("Packing list ready", `Built for a ${values.days}-day ${values.transport} trip.`, items, "USDA APHIS advises checking destination and airline requirements because travel rules change.");
    },
  },
  {
    id: "budget",
    number: "11",
    title: "Annual budget",
    deck: "Estimate yearly recurring pet costs from simple monthly and annual categories.",
    fields: [
      { key: "food", label: "Monthly food", type: "number", value: 65, min: 0, max: 1000, step: 1, unit: "$" },
      { key: "supplies", label: "Monthly supplies", type: "number", value: 35, min: 0, max: 1000, step: 1, unit: "$" },
      { key: "insurance", label: "Monthly insurance", type: "number", value: 45, min: 0, max: 1000, step: 1, unit: "$" },
      { key: "vet", label: "Routine vet per year", type: "number", value: 280, min: 0, max: 5000, step: 1, unit: "$" },
    ],
    compute(values) {
      const total = (values.food + values.supplies + values.insurance) * 12 + values.vet;
      return result(`$${Math.round(total)} / year`, `$${Math.round(total / 12)} average per month.`, [
        "Emergency savings, grooming, boarding, and training can change the total.",
      ]);
    },
  },
  {
    id: "safety",
    number: "12",
    title: "Food safety lookup",
    deck: "Search common household foods and see whether to avoid, check labels, or use caution.",
    fields: [
      { key: "query", label: "Food name", type: "text", value: "grapes", placeholder: "Try chocolate, apple, onion..." },
    ],
    compute(values) {
      const query = String(values.query || "").trim().toLowerCase();
      const match = safetyFoods.find((item) => item.names.some((name) => name.includes(query) || query.includes(name)));
      if (!query) return result("Type a food", "Search a common food or ingredient.", safetyFoods.slice(0, 5).map((item) => item.names[0]));
      if (!match) return result("No local match", "This small lookup table does not know that food yet.", [
        "Search a trusted veterinary poison-control source before sharing unfamiliar food.",
      ], "ASPCA poison-control list is the base source for common avoid/caution foods.");
      return result(match.level, match.note, [`Matched: ${match.names.join(", ")}`], "ASPCA people-foods-to-avoid list.");
    },
  },
];

const savedTheme = localStorage.getItem("pet-nook-theme");
if (savedTheme === "dark" || savedTheme === "light") {
  root.dataset.theme = savedTheme;
  updateThemeButton(savedTheme);
}

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = nextTheme;
  localStorage.setItem("pet-nook-theme", nextTheme);
  updateThemeButton(nextTheme);
});

toolOpenButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectTool(button.dataset.toolOpen);
    document.querySelector("#workbench")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

renderToolTabs();
selectTool(tools[0].id);

function renderToolTabs() {
  if (!toolTabs) return;
  toolTabs.innerHTML = tools
    .map(
      (tool) => `
        <button class="tool-tab" type="button" role="tab" id="tab-${tool.id}" aria-controls="panel-${tool.id}" data-tool-tab="${tool.id}">
          <span>${tool.number}</span>
          <strong>${tool.title}</strong>
        </button>
      `,
    )
    .join("");

  toolTabs.querySelectorAll("[data-tool-tab]").forEach((tab) => {
    tab.addEventListener("click", () => selectTool(tab.dataset.toolTab));
  });
}

function selectTool(id) {
  const tool = tools.find((item) => item.id === id) || tools[0];
  activeUnitSystem = "us";
  document.querySelectorAll("[data-tool-tab]").forEach((tab) => {
    tab.setAttribute("aria-selected", String(tab.dataset.toolTab === tool.id));
  });
  renderTool(tool);
}

function renderTool(tool) {
  if (!toolPanel) return;
  toolPanel.id = `panel-${tool.id}`;
  toolPanel.setAttribute("aria-labelledby", `tab-${tool.id}`);
  toolPanel.innerHTML = `
    <article class="tool-card">
      <header>
        <p class="section-kicker">${tool.number} / static calculator</p>
        <h3>${tool.title}</h3>
        <p>${tool.deck}</p>
      </header>
      ${tool.unitSystems ? renderUnitToggle() : ""}
      <form class="tool-form" data-tool-form="${tool.id}">
        ${tool.fields.map((field) => renderField(field, activeUnitSystem)).join("")}
      </form>
      <div class="tool-result" data-tool-result></div>
      <p class="tool-note">Informational only. This site does not replace veterinary advice.</p>
    </article>
  `;

  const form = toolPanel.querySelector("[data-tool-form]");
  toolPanel.querySelectorAll("[data-unit-system]").forEach((button) => {
    button.addEventListener("click", () => {
      switchUnitSystem(tool, button.dataset.unitSystem);
    });
  });
  bindToolForm(tool, form);
  const update = () => renderResult(tool, form);
  update();
}

function renderUnitToggle() {
  return `
    <div class="unit-toggle" aria-label="Unit system">
      <button type="button" data-unit-system="us" aria-pressed="${activeUnitSystem === "us"}">${unitLabels.us}</button>
      <button type="button" data-unit-system="metric" aria-pressed="${activeUnitSystem === "metric"}">${unitLabels.metric}</button>
    </div>
  `;
}

function renderField(field, system) {
  const display = getDisplayField(field, system);
  const unit = display.unit ? `<span>${display.unit}</span>` : "";
  if (field.type === "select") {
    return `
      <label>
        ${field.label}
        <select name="${field.key}">
          ${field.options.map(([value, label]) => `<option value="${value}" ${String(value) === String(field.value) ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </label>
    `;
  }

  return `
    <label>
      ${field.label}
      <span class="field-with-unit">
        <input
          name="${field.key}"
          type="${field.type}"
          value="${display.value ?? ""}"
          ${field.placeholder ? `placeholder="${field.placeholder}"` : ""}
          ${display.min !== undefined ? `min="${display.min}"` : ""}
          ${display.max !== undefined ? `max="${display.max}"` : ""}
          ${display.step !== undefined ? `step="${display.step}"` : ""}
        />
        ${unit}
      </span>
    </label>
  `;
}

function renderResult(tool, form) {
  const resultEl = toolPanel.querySelector("[data-tool-result]");
  const values = Object.assign(
    {},
    ...tool.fields.map((field) => {
      const input = form.elements[field.key];
      const value = field.type === "number" ? Number(input.value) : input.value;
      return normalizeValue(field, value, activeUnitSystem);
    }),
  );
  const output = tool.compute(values, activeUnitSystem);
  resultEl.innerHTML = `
    <strong>${output.headline}</strong>
    <p>${output.detail}</p>
    ${output.visual || ""}
    ${output.items?.length ? `<ul class="tool-output-list">${output.items.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}
    ${output.source ? `<p class="source-line">Source check: ${output.source}</p>` : ""}
  `;
}

function switchUnitSystem(tool, nextSystem) {
  if (!tool.unitSystems || nextSystem === activeUnitSystem) return;
  const form = toolPanel.querySelector("[data-tool-form]");
  const currentValues = Object.assign(
    {},
    ...tool.fields.map((field) => {
      const input = form.elements[field.key];
      const value = field.type === "number" ? Number(input.value) : input.value;
      return normalizeValue(field, value, activeUnitSystem);
    }),
  );
  activeUnitSystem = nextSystem;
  toolPanel.querySelectorAll("[data-unit-system]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.unitSystem === activeUnitSystem));
  });
  form.innerHTML = tool.fields.map((field) => renderField(withCurrentValue(field, currentValues), activeUnitSystem)).join("");
  bindToolForm(tool, form);
  const update = () => renderResult(tool, form);
  update();
}

function bindToolForm(tool, form) {
  form.oninput = () => renderResult(tool, form);
  form.onchange = () => renderResult(tool, form);
}

function getDisplayField(field, system) {
  if (system !== "metric" || !field.metric) return field;
  const metricKey = field.metric.key || field.key;
  const rawValue = getMetricDisplayValue(field);
  return {
    ...field,
    key: field.key,
    value: roundForStep(rawValue, field.metric.step),
    unit: field.metric.unit,
    min: field.metric.min,
    max: field.metric.max,
    step: field.metric.step,
    metricKey,
  };
}

function normalizeValue(field, value, system) {
  if (system !== "metric" || !field.metric || field.type !== "number") return { [field.key]: value };
  if (field.metric.key && field.metric.key !== field.key) {
    if (!field.metric.ratio) {
      return { [field.metric.key]: value };
    }
    return {
      [field.key]: value / field.metric.ratio,
      [field.metric.key]: value,
    };
  }
  return { [field.key]: value / field.metric.ratio };
}

function withCurrentValue(field, values) {
  const currentValue = values[field.key] ?? field.value;
  return {
    ...field,
    value: field.type === "number" ? roundForStep(currentValue, field.step) : currentValue,
    metric: field.metric?.key && field.metric.key !== field.key && values[field.metric.key] !== undefined ? { ...field.metric, value: values[field.metric.key] } : field.metric,
  };
}

function getMetricDisplayValue(field) {
  if (field.metric.key && field.metric.key !== field.key) {
    if (field.metric.value !== undefined) return field.metric.value;
    return field.metric.ratio ? convertValue(field.value, field.metric.ratio) : field.value;
  }
  return field.metric.ratio ? convertValue(field.value, field.metric.ratio) : field.metric.value ?? field.value;
}

function convertValue(value, ratio) {
  return Number(value) * Number(ratio);
}

function roundForStep(value, step = 0.1) {
  if (step >= 1) return Math.round(value);
  return Number(value).toFixed(1);
}

function result(headline, detail, items = [], source = "", visual = "") {
  return { headline, detail, items, source, visual };
}

function foodVisual(cups, perMeal, meals, kcal, system, grams) {
  const visualAmount = system === "metric" ? grams / 100 : cups;
  const visualPerMeal = system === "metric" ? grams / meals / 100 : perMeal;
  const cupFill = Math.max(6, Math.min(100, (visualAmount / 4) * 100));
  const mealFill = Math.max(6, Math.min(100, (visualPerMeal / 2) * 100));
  const bowls = Array.from({ length: Math.max(1, Math.min(6, Math.round(meals))) }, (_, index) => {
    const label = meals === 1 ? "meal" : `meal ${index + 1}`;
    return `<span class="meal-bowl" style="--fill:${mealFill}%"><i></i><b>${label}</b></span>`;
  }).join("");

  return `
    <div class="food-visual" aria-label="Food amount visual">
      <div class="cup-meter" style="--fill:${cupFill}%">
        <span></span>
        <b>${system === "metric" ? `${Math.round(grams)} g` : `${cups.toFixed(1)} cups`}</b>
      </div>
      <div class="meal-split">
        ${bowls}
      </div>
      <div class="calorie-ribbon">
        <span>${Math.round(kcal)}</span>
        <b>kcal/day</b>
      </div>
    </div>
  `;
}

function lbToKg(lb) {
  return Number(lb) / 2.20462;
}

function rer(lb) {
  return 70 * Math.pow(lbToKg(lb), 0.75);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + Number(days));
  return date;
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function updateThemeButton(theme) {
  const isDark = theme === "dark";
  themeToggle?.setAttribute("aria-pressed", String(isDark));
  themeToggle?.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
}
