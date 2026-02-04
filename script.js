// Date: Feb 14, 2026 13:00 Amsterdam (+01:00)
const START_ISO = "2026-02-14T13:00:00+01:00";
const EVENT_TZ = "Europe/Amsterdam";

// Map links
const MAPS = {
  spa: "https://www.google.com/maps/search/?api=1&query=Five%20City%20Spa%20Haarlem",
  dinner: "https://www.google.com/maps/search/?api=1&query=Menu%20Corridor%20Haarlem",
  movie: "https://www.google.com/maps/search/?api=1&query=FilmKoepel%20De%20Koepel%20Haarlem",
};

const MUSIC = {
  spotifySearch: "https://open.spotify.com/search/Let's%20Stay%20Together%20Al%20Green",
};

const $ = (id) => document.getElementById(id);

// Envelope
const envelopeStage = $("envelopeStage");
const envelope = $("envelope");
const page = $("page");

// Page bits
const btnOpen = $("btnOpen");
const btnHearts = $("btnHearts");
const invite = $("invite");
const titlecard = $("titlecard");
const countdownEl = $("countdown");
const reply = $("reply");

// Links
const mapSpa = $("mapSpa");
const mapDinner = $("mapDinner");
const mapMovie = $("mapMovie");

// RSVP/tools
const btnYes = $("btnYes");
const btnAlsoYes = $("btnAlsoYes");
const btnCalendar = $("btnCalendar");
const btnCopy = $("btnCopy");

// Music / record player controls
const btnMusic = $("btnMusic");
const btnMusicStop = $("btnMusicStop");
const btnMusicLink = $("btnMusicLink");
const playerBox = $("playerBox");
const vinyl = $("vinyl");
const tonearm = $("tonearm");

// Canvas FX
const canvas = document.getElementById("fx");
const ctx = canvas?.getContext("2d");
let particles = [];

// ------------------ Envelope open ------------------
function openEnvelope() {
  envelope.classList.add("is-open");

  // Reveal page after animation
  setTimeout(() => {
    envelopeStage.style.display = "none";
    page.classList.remove("page--hidden");

    // Small dreamy burst
    burst("hearts", window.innerWidth * 0.5, window.innerHeight * 0.35, 28);
    burst("confetti", window.innerWidth * 0.5, window.innerHeight * 0.35, 14);
  }, 900);
}

envelope?.addEventListener("click", openEnvelope);
envelope?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") openEnvelope();
});

// ------------------ Set links ------------------
if (mapSpa) mapSpa.href = MAPS.spa;
if (mapDinner) mapDinner.href = MAPS.dinner;
if (mapMovie) mapMovie.href = MAPS.movie;
if (btnMusicLink) btnMusicLink.href = MUSIC.spotifySearch;

// ------------------ Countdown ------------------
if (countdownEl) {
  setInterval(updateCountdown, 300);
  updateCountdown();
}

function updateCountdown() {
  const start = new Date(START_ISO).getTime();
  const now = Date.now();
  const diff = start - now;

  if (diff <= 0) {
    countdownEl.textContent = "now";
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const pad = (n) => String(n).padStart(2, "0");
  countdownEl.textContent = `${days}d ${pad(hours)}h ${pad(minutes)}m`;
}

// ------------------ Begin the picture ------------------
btnOpen?.addEventListener("click", () => {
  titlecard?.classList.add("hidden");
  invite?.classList.remove("hidden");
  invite?.scrollIntoView({ behavior: "smooth", block: "start" });
  burst("hearts", window.innerWidth * 0.5, 140, 24);
  burst("confetti", window.innerWidth * 0.5, 170, 16);
});

// ------------------ Notes toggles ------------------
document.querySelectorAll(".heart").forEach((b) => {
  b.addEventListener("click", () => {
    const id = b.dataset.unlock;
    const box = $(`unlock${id}`);
    if (!box) return;

    const isOpen = !box.classList.contains("hidden");
    if (isOpen) {
      box.classList.add("hidden");
    } else {
      box.classList.remove("hidden");
      burst("hearts", b.getBoundingClientRect().left + 20, b.getBoundingClientRect().top + 20, 14);
    }
  });
});

// ------------------ RSVP ------------------
btnYes?.addEventListener("click", () => respond("Accepted. The picture proceeds as scheduled."));
btnAlsoYes?.addEventListener("click", () => respond("Accepted. Yas queen."));

// ------------------ Copy ------------------
btnCopy?.addEventListener("click", async () => {
  const text =
`Romana,

February 14 in Haarlem:
1:00 PM Five City Spa (one hour massage)
7:00 PM Menu Corridor (dinner)
Afterwards FilmKoepel: Marty Supreme

I made a small invitation page for you.`;

  try {
    await navigator.clipboard.writeText(text);
    respond("Message copied. Neat and efficient.");
  } catch {
    respond("Copy failed due to browser permissions. Still charming, though.");
  }
});

// ------------------ Calendar (.ics) ------------------
btnCalendar?.addEventListener("click", downloadICS);

function downloadICS() {
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
SUMMARY:A Small Valentine Picture (Romana) • Haarlem
DESCRIPTION:Itinerary:%0A1:00 PM - Five City Spa (Five Full Body Massage)%0A7:00 PM - Menu Corridor (Dinner)%0AAfter - FilmKoepel: Marty Supreme%0A%0ALinks:%0Ahttps://fivecityspa.nl/behandeling/five-full-body-massage/%0Ahttps://www.menucorridor.nl/menu/%0Ahttps://filmkoepel.nl/films/marty-supreme/
LOCATION:Haarlem, Netherlands
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "romana-valentine-haarlem.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  respond("Calendar added to the props department.");
}
// RETURN TO TITLE CARD WHEN HEADER IS CLICKED
document.addEventListener("DOMContentLoaded", () => {
  const homeBtn = document.getElementById("homeBtn");
  const inviteSection = document.getElementById("invite");
  const titleCard = document.getElementById("titlecard");

  if (!homeBtn || !inviteSection || !titleCard) return;

  homeBtn.addEventListener("click", () => {
    inviteSection.classList.add("hidden");   // hide itinerary
    titleCard.classList.remove("hidden");   // show main page
    titleCard.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Scroll back to top smoothly
  window.scrollTo({ top: 0, behavior: "smooth" });
});
function stampUTC() {
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
  const a = new Uint32Array(4);
  crypto.getRandomValues(a);
  return Array.from(a).map((n) => n.toString(16)).join("");
}

function respond(text) {
  if (!reply) return;
  reply.textContent = text;
  reply.classList.remove("hidden");
  reply.scrollIntoView({ behavior: "smooth", block: "center" });
  burst("confetti", window.innerWidth * 0.5, window.innerHeight * 0.45, 26);
  burst("hearts", window.innerWidth * 0.5, window.innerHeight * 0.45, 18);
}

// ------------------ Hearts button ------------------
btnHearts?.addEventListener("click", () => {
  burst("hearts", window.innerWidth * 0.5, 120, 42);
});

// ------------------ Record player ------------------
btnMusic?.addEventListener("click", () => {
  // Animate the record player
  vinyl?.classList.add("is-spinning");
  tonearm?.classList.add("is-playing");

  // Reveal Spotify embed
  playerBox?.classList.remove("hidden");
  playerBox?.scrollIntoView({ behavior: "smooth", block: "center" });

  burst("hearts", window.innerWidth * 0.72, 140, 16);
  // Keep "Open" link as a fallback
});

btnMusicStop?.addEventListener("click", () => {
  vinyl?.classList.remove("is-spinning");
  tonearm?.classList.remove("is-playing");
  playerBox?.classList.add("hidden");
});

// ------------------ Canvas FX ------------------
if (canvas && ctx) {
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  requestAnimationFrame(tick);
}

function resizeCanvas() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

function burst(kind, x, y, count) {
  if (!ctx) return;
  for (let i = 0; i < count; i++) particles.push(makeParticle(kind, x, y));
}

function makeParticle(kind, x, y) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 1.4 + Math.random() * 5.2;
  return {
    kind,
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - (1.6 + Math.random() * 1.8),
    life: 80 + Math.random() * 50,
    s: 8 + Math.random() * 14,
    r: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.2,
  };
}

function tick() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles = particles.filter(p => p.life > 0);
  for (const p of particles) {
    p.life -= 1;
    p.vy += 0.06;
    p.x += p.vx;
    p.y += p.vy;
    p.r += p.vr;

    const a = Math.max(0, Math.min(1, p.life / 120));
    ctx.globalAlpha = a;

    if (p.kind === "hearts") drawHeart(p.x, p.y, p.s, p.r);
    else drawConfetti(p.x, p.y, p.s, p.r);
  }

  ctx.globalAlpha = 1;
  requestAnimationFrame(tick);
}

function drawConfetti(x, y, s, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(r);
  ctx.fillStyle = "rgba(31,42,46,.85)";
  ctx.fillRect(-s * 0.35, -s * 0.18, s * 0.7, s * 0.36);
  ctx.restore();
}

function drawHeart(x, y, s, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(r);

  ctx.fillStyle = "rgba(215,43,63,.85)";
  ctx.beginPath();

  const top = s * 0.15;
  ctx.moveTo(0, top);
  ctx.bezierCurveTo(0, -s * 0.30, -s * 0.55, -s * 0.30, -s * 0.55, top);
  ctx.bezierCurveTo(-s * 0.55, s * 0.55, 0, s * 0.75, 0, s);
  ctx.bezierCurveTo(0, s * 0.75, s * 0.55, s * 0.55, s * 0.55, top);
  ctx.bezierCurveTo(s * 0.55, -s * 0.30, 0, -s * 0.30, 0, top);

  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
