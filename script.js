const ageSelect = document.querySelector("#age");
const modeSelect = document.querySelector("#mode");
const newTaskButton = document.querySelector("#newTask");
const taskType = document.querySelector("#taskType");
const question = document.querySelector("#question");
const visual = document.querySelector("#visual");
const answers = document.querySelector("#answers");
const feedback = document.querySelector("#feedback");
const stars = document.querySelector("#stars");
const done = document.querySelector("#done");
const progressFill = document.querySelector("#progressFill");

const icons = ["🍎", "⭐", "🧸", "🚗", "⚽", "🌸", "🍓", "🧩"];

const state = {
  score: 0,
  progress: 0,
  answer: 0,
  locked: false
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function maxForAge() {
  const age = Number(ageSelect.value);
  if (age <= 3) return 5;
  if (age === 4) return 7;
  return 10;
}

function availableModes() {
  const age = Number(ageSelect.value);
  const selected = modeSelect.value;

  if (selected !== "mixed") return [selected];
  if (age <= 3) return ["count"];
  if (age === 4) return ["count", "compare"];
  return ["count", "compare", "add"];
}

function pickMode() {
  const modes = availableModes();
  return modes[randomInt(0, modes.length - 1)];
}

function setFeedback(text, kind = "") {
  feedback.textContent = text;
  feedback.className = `feedback ${kind}`.trim();
}

function renderObjects(count) {
  const icon = icons[randomInt(0, icons.length - 1)];
  const wrap = document.createElement("div");
  wrap.className = "objects";

  for (let index = 0; index < count; index += 1) {
    const item = document.createElement("div");
    item.className = "object";
    item.textContent = icon;
    item.setAttribute("aria-label", `Предмет ${index + 1}`);
    wrap.appendChild(item);
  }

  visual.replaceChildren(wrap);
}

function renderCompare(left, right) {
  const wrap = document.createElement("div");
  wrap.className = "compare-wrap";
  wrap.innerHTML = `
    <div class="number-card">${left}</div>
    <div class="operator">?</div>
    <div class="number-card">${right}</div>
  `;
  visual.replaceChildren(wrap);
}

function renderAdd(left, right) {
  const wrap = document.createElement("div");
  wrap.className = "add-wrap";
  wrap.innerHTML = `
    <div class="number-card">${left}</div>
    <div class="operator">+</div>
    <div class="number-card">${right}</div>
  `;
  visual.replaceChildren(wrap);
}

function buildChoices(correct, min, max) {
  const values = new Set([correct]);

  while (values.size < 3) {
    values.add(randomInt(min, max));
  }

  return shuffle([...values]);
}

function renderAnswers(values) {
  answers.replaceChildren();

  values.forEach((value) => {
    const button = document.createElement("button");
    button.className = "answer";
    button.type = "button";
    button.textContent = value;
    button.addEventListener("click", () => checkAnswer(button, value));
    answers.appendChild(button);
  });
}

function makeCountTask() {
  const max = maxForAge();
  const count = randomInt(1, max);
  state.answer = count;
  taskType.textContent = "Счет";
  question.textContent = "Сколько предметов на экране?";
  renderObjects(count);
  renderAnswers(buildChoices(count, 1, max));
}

function makeCompareTask() {
  const max = maxForAge();
  let left = randomInt(1, max);
  let right = randomInt(1, max);

  while (left === right) {
    right = randomInt(1, max);
  }

  state.answer = left > right ? ">" : "<";
  taskType.textContent = "Сравнение";
  question.textContent = "Какой знак подходит?";
  renderCompare(left, right);
  renderAnswers(shuffle([">", "<", "="]));
}

function makeAddTask() {
  const max = maxForAge();
  const left = randomInt(1, Math.max(2, Math.floor(max / 2)));
  const right = randomInt(1, max - left);
  const sum = left + right;

  state.answer = sum;
  taskType.textContent = "Сложение";
  question.textContent = "Сколько получится?";
  renderAdd(left, right);
  renderAnswers(buildChoices(sum, 1, max));
}

function makeTask() {
  state.locked = false;
  setFeedback("");

  const mode = pickMode();
  if (mode === "compare") makeCompareTask();
  else if (mode === "add") makeAddTask();
  else makeCountTask();
}

function updateProgress() {
  stars.textContent = state.score;
  done.textContent = state.progress;
  progressFill.style.width = `${Math.min(state.progress, 5) * 20}%`;
}

function checkAnswer(button, value) {
  if (state.locked) return;
  state.locked = true;

  const isCorrect = String(value) === String(state.answer);
  button.classList.add(isCorrect ? "correct" : "wrong");

  if (isCorrect) {
    state.score += 1;
    state.progress = Math.min(state.progress + 1, 5);
    setFeedback(state.progress === 5 ? "Цель выполнена! Можно продолжать." : "Верно!", "good");
  } else {
    setFeedback(`Почти. Правильный ответ: ${state.answer}`, "try");
  }

  updateProgress();
  window.setTimeout(makeTask, isCorrect ? 900 : 1500);
}

function resetMiniGoal() {
  if (state.progress >= 5) {
    state.progress = 0;
    updateProgress();
  }
}

ageSelect.addEventListener("change", () => {
  resetMiniGoal();
  makeTask();
});

modeSelect.addEventListener("change", makeTask);
newTaskButton.addEventListener("click", makeTask);

updateProgress();
makeTask();
