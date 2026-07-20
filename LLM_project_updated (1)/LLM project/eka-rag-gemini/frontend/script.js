// ------------------------------------------------------------------
// EKA frontend — talks to the FastAPI backend (app/main.py).
// Change the backend URL below if your API runs somewhere other than
// http://127.0.0.1:8000 (e.g. a deployed URL).
// ------------------------------------------------------------------

const DEFAULT_API_BASE = "http://127.0.0.1:8000";

const state = {
  apiBase: localStorage.getItem("eka_api_base") || DEFAULT_API_BASE,
};

const chatScroll = document.getElementById("chatScroll");
const composerForm = document.getElementById("composerForm");
const queryInput = document.getElementById("queryInput");
const sendBtn = document.getElementById("sendBtn");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const endpointLabel = document.getElementById("endpointLabel");
const editEndpointBtn = document.getElementById("editEndpoint");
const resetBtn = document.getElementById("resetBtn");

endpointLabel.textContent = state.apiBase;

// ---------- helpers ----------

function addMessage({ role, text, isError = false }) {
  const wrap = document.createElement("div");
  wrap.className = `msg msg--${role}${isError ? " msg--error" : ""}`;

  const avatar = document.createElement("div");
  avatar.className = "msg__avatar";
  avatar.textContent = role === "user" ? "YOU" : "EKA";

  const bubble = document.createElement("div");
  bubble.className = "msg__bubble";
  bubble.textContent = text;

  wrap.appendChild(avatar);
  wrap.appendChild(bubble);
  chatScroll.appendChild(wrap);
  chatScroll.scrollTop = chatScroll.scrollHeight;
  return bubble;
}

function addLoadingBubble() {
  const wrap = document.createElement("div");
  wrap.className = "msg msg--bot";

  const avatar = document.createElement("div");
  avatar.className = "msg__avatar";
  avatar.textContent = "EKA";

  const bubble = document.createElement("div");
  bubble.className = "msg__bubble is-loading";
  bubble.innerHTML = "<span></span><span></span><span></span>";

  wrap.appendChild(avatar);
  wrap.appendChild(bubble);
  chatScroll.appendChild(wrap);
  chatScroll.scrollTop = chatScroll.scrollHeight;
  return wrap;
}

function autoGrow() {
  queryInput.style.height = "auto";
  queryInput.style.height = Math.min(queryInput.scrollHeight, 140) + "px";
}

// ---------- backend status check ----------

async function checkStatus() {
  try {
    const res = await fetch(`${state.apiBase}/`, { method: "GET" });
    if (!res.ok) throw new Error("bad response");
    statusDot.className = "dot dot--ok";
    statusText.textContent = "backend connected";
  } catch (err) {
    statusDot.className = "dot dot--bad";
    statusText.textContent = "backend unreachable";
  }
}

// ---------- ask the backend ----------

async function askQuestion(query) {
  const res = await fetch(`${state.apiBase}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const detail = data && data.detail ? data.detail : `Request failed (${res.status})`;
    throw new Error(detail);
  }
  return data.answer;
}

// ---------- events ----------

composerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = queryInput.value.trim();
  if (!query) return;

  addMessage({ role: "user", text: query });
  queryInput.value = "";
  autoGrow();
  sendBtn.disabled = true;

  const loadingEl = addLoadingBubble();

  try {
    const answer = await askQuestion(query);
    loadingEl.remove();
    addMessage({ role: "bot", text: answer });
  } catch (err) {
    loadingEl.remove();
    addMessage({
      role: "bot",
      text: `Something went wrong: ${err.message}`,
      isError: true,
    });
  } finally {
    sendBtn.disabled = false;
    queryInput.focus();
  }
});

queryInput.addEventListener("input", autoGrow);

queryInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    composerForm.requestSubmit();
  }
});

editEndpointBtn.addEventListener("click", () => {
  const next = prompt("Backend URL:", state.apiBase);
  if (next && next.trim()) {
    state.apiBase = next.trim().replace(/\/$/, "");
    localStorage.setItem("eka_api_base", state.apiBase);
    endpointLabel.textContent = state.apiBase;
    checkStatus();
  }
});

resetBtn.addEventListener("click", () => {
  chatScroll.innerHTML = "";
  addMessage({
    role: "bot",
    text: "Conversation cleared. Ask me anything covered in your indexed documents.",
  });
});

// ---------- init ----------

checkStatus();
queryInput.focus();
