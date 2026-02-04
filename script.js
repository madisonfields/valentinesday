// ====== CONFIG ======
const EVENT_TZ = "Europe/Amsterdam";
// Feb 14, 2026 13:00 in Amsterdam time
const START_ISO = "2026-02-14T13:00:00+01:00";

// Map links (generic "search" so you don't need exact addresses)
const MAPS = {
  spa: "https://www.google.com/maps/search/?api=1&query=Five%20City%20Spa%20Haarlem",
  dinner: "https://www.google.com/maps/search/?api=1&query=Menu%20Corridor%20Haarlem",
  movie: "https://www.google.com/maps/search/?api=1&query=FilmKoepel%20De%20Koepel%20Haarlem"
};

// ====== DOM ======
const envelope = document.getElementById("envelope");
const invite = document.getElementById("invite");
const btnOpen = document.getElementById("btnOpen");
const btnPeek = document.getElementById("btnPeek");

const countdownEl = document.getElementById("countdown");
const note = document.getElementById("note");

const btnYes = document.getElementById("btnYes");
const btnAlsoYes = document.getElementById("btnAlsoYes");
const btnCalendar = document.getElementById("btnCalendar");
const btnCopy = document.getElementById("btnCopy");

const btnHearts = document.getElementById("btnHearts");
const btnConfetti = document.getElementById("btnConfetti");

const mapSpa = document.getElementById("mapSpa");
const mapDinner = document.getElementById("mapDinner");
const mapMovie = document.getElementById("mapMovie");

// Canvas FX
const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d");
let particles = [];

// ====== INIT ======
mapSpa.href = MAPS.spa;
mapDinner.href = MAPS.dinner;
mapMovie.href = MAPS.movie;

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

btnOpen.addEventListener("click", () => openInvite(true));
btnPeek.addEventListener("click", () => {
  // Quick little shimmer + message
  burst("hearts", window.innerWidth * 0.35, 120, 14);
  showNote("Okay okay… it’s romantic. But you have to open it for the full experience 😄");
});

document.querySelectorAll(".heartBtn").forEach((b) => {
  b.addEventListener("click", () => {
    const id = b.dataset.unlock;
    const box = document.getElementById(`unlock${id}`);
    if (box.classList.contains("hidden")) {
      box.classList.remove("hidden");
      b.textContent = "♥";
      burst("hearts", b.getBoundingClientRect().left + 10, b.getBoundingClientRect().top + 10, 18);
    } else {
      // Toggle off if you want (optional)
      box.classList.add("hidden");
      b.textContent = "♡";
    }
  });
});

btnYes.addEventListener("click", () => acceptYes("YES! 💘 Romana just made my whole day."));
btnAlsoYes.addEventListener("click", () => acceptYes("Also yes is still yes 😄💘"));

btnCalendar.addEventListener("click", downloadICS);
btnCopy.addEventListener("click", copyShareText);

btnHearts.addEventListener("click", () => burst("hearts", window.innerWidth * 0.75, 100, 28));
btnConfetti.addEventListener("click", () => burst("confetti", window.innerWidth * 0.75, 100, 36));

// Countdown timer
setInterval(updateCountdown, 250);
updateCountdown();

// Start animation loop
requestAnimationFrame(tick);

// ====== FUNCTIONS ======
function openInvite(withConfetti) {
  envelope.classList.add("hidden");
  invite.classList.remove("hidden");
  invite.scrollIntoView({ behavior: "smooth", block: "start" });
  if (withConfetti) burst("confetti", window.innerWidth * 0.5, 80, 44);
}

function updateCountdown() {
  const start = new Date(START_ISO).getTime();
  const now = Date.now();
  const diff = start - now;

  if (diff <= 0) {
    countdownEl.textContent = "It’s time 💘";
    return;
  }
  const totalSeconds = Math.floor(diff / 1000);

  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, "0");
  countdownEl.textContent = `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}

function acceptYes(message) {
  showNote(message + " 🥹✨");
  burst("confetti", window.innerWidth * 0.5, 140, 70);
  burst("hearts", window.innerWidth * 0.5, 170, 45);
}

function showNote(text) {
  note.textContent = text;
  note.classList.remove("hidden");
  note.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function copyShareText() {
  const text =
`Romana 💘

Valentine’s Day in Haarlem (Feb 14, 2026):
1) 1:00 PM — 1 hour relaxation massage at Five City Spa (3 min walk)
2) 7:00 PM — Dinner at Menu Corridor
3) After — FilmKoepel (De Koepel): Marty Supreme

Open the invite page I made for you ✨`;

  try {
    await navigator.clipboard.writeText(text);
    showNote("Copied! Now you can paste it anywhere 💌");
    burst("hearts", window.innerWidth * 0.55, 180, 18);
  } catch {
    showNote("Couldn’t copy automatically (browser permission). You can still manually copy from the console or edit the text in script.js.");
  }
}

function downloadICS() {
  // One calendar event (covering the whole date window).
  // Start: 13:00, End: 23:00 local time (approx.)
  const dtStart = "20260214T130000";
  const dtEnd = "20260214T230000";

  const ics =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Valentine Invite//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${cryptoRandom()}@valentine
DTSTAMP:${stampUTC()}
DTSTART;TZID=${EVENT_TZ}:${dtStart}
DTEND;TZID=${EVENT_TZ}:${dtEnd}
SUMMARY:Valentine’s Day with Romana 💘 (Haarlem)
DESCRIPTION:Itinerary:%0A1:00 PM - Five City Spa (Five Full Body Massage, 1 hour)%0A7:00 PM - Dinner at Menu Corridor%0AAfter - FilmKoepel: Marty Supreme%0A%0ALinks:%0Ahttps://fivecityspa.nl/behandeling/five-full-body-massage/%0Ahttps://www.menucorridor.nl/menu/%0Ahttps://filmkoepel.nl/films/marty-supreme/
LOCATION:Haarlem, Netherlands
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "romana-valentines-haarlem.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showNote("Downloaded calendar file 💘 (open it to add to your calendar)");
  burst("confetti", window.innerWidth * 0.55, 180, 28);
}

function stampUTC() {
  // YYYYMMDDTHHMMSSZ
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function cryptoRandom() {
  // Small UID helper
  const a = new Uint32Array(4);
  crypto.getRandomValues(a);
  return Array.from(a).map((n) => n.toString(16)).join("");
}

// ====== PARTICLES / FX ======
function resizeCanvas() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

function burst(kind, x, y, count) {
  for (let i = 0; i < count; i++) {
    particles.push(makeParticle(kind, x, y));
  }
}

function makeParticle(kind, x, y) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 2 + Math.random() * 6;

  return {
    kind,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - (2 + Math.random() * 2),
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.25,
    life: 90 + Math.random() * 50,
    size: 10 + Math.random() * 10,
    wobble: Math.random() * 10
  };
}

function tick() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles = particles.filter((p) => p.life > 0);
  for (const p of particles) {
    p.life -= 1;
    p.vy += 0.08; // gravity
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;

    const alpha = Math.max(0, Math.min(1, p.life / 120));
    ctx.globalAlpha = alpha;

    if (p.kind === "hearts") drawHeart(p.x, p.y, p.size, p.rot);
    else drawConfetti(p.x, p.y, p.size, p.rot);
  }
  ctx.globalAlpha = 1;

  requestAnimationFrame(tick);
}

function drawConfetti(x, y, s, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(r);

  // simple rectangle confetti (no fixed colors; use gradient-ish via opacity)
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillRect(-s * 0.35, -s * 0.18, s * 0.7, s * 0.36);

  ctx.restore();
}

function drawHeart(x, y, s, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(r);

  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.beginPath();
  const top = s * 0.2;

  ctx.moveTo(0, top);
  ctx.bezierCurveTo(0, -s * 0.25, -s * 0.5, -s * 0.25, -s * 0.5, top);
  ctx.bezierCurveTo(-s * 0.5, s * 0.55, 0, s * 0.7, 0, s);
  ctx.bezierCurveTo(0, s * 0.7, s * 0.5, s * 0.55, s * 0.5, top);
  ctx.bezierCurveTo(s * 0.5, -s * 0.25, 0, -s * 0.25, 0, top);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// Bonus: open invite if URL has #open
if (location.hash === "#open") openInvite(false);
