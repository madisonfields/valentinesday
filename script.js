// Date: Feb 14, 2026 13:00 Amsterdam (+01:00)
const START_ISO = "2026-02-14T13:00:00+01:00";
const EVENT_TZ = "Europe/Amsterdam";

// Map links (search links, no address needed)
const MAPS = {
  spa: "https://www.google.com/maps/search/?api=1&query=Five%20City%20Spa%20Haarlem",
  dinner: "https://www.google.com/maps/search/?api=1&query=Menu%20Corridor%20Haarlem",
  movie: "https://www.google.com/maps/search/?api=1&query=FilmKoepel%20De%20Koepel%20Haarlem",
};

// Music links (no audio hosted in repo; user-initiated playback)
const MUSIC = {
  // This is a generic Spotify search. If you want an exact Spotify track embed URL, I can tailor it,
  // but you may need the track ID from Spotify.
  spotifySearch: "https://open.spotify.com/search/Let's%20Stay%20Together%20Al%20Green",
  // Optional YouTube search fallback:
  youtubeSearch: "https://www.youtube.com/results?search_query=Al+Green+Let%27s+Stay+Together",
};

const $ = (id) => document.getElementById(id);

const btnOpen = $("btnOpen");
const btnPeek = $("btnPeek");
const invite = $("invite");
const titlecard = $("titlecard");
const countdownEl = $("countdown");
const reply = $("reply");

const mapSpa = $("mapSpa");
const mapDinner = $("mapDinner");
const mapMovie = $("mapMovie");

const btnYes = $("btnYes");
const btnAlsoYes = $("btnAlsoYes");
const btnCalendar = $("btnCalendar");
const btnCopy = $("btnCopy");

const btnMusic = $("btnMusic");
const btnMusicStop = $("btnMusicStop");
const btnMusicLink = $("btnMusicLink");
const spotifyEmbed = $("spotifyEmbed");

// ---- Set links
mapSpa.href = MAPS.spa;
mapDinner.href = MAPS.dinner;
mapMovie.href = MAPS.movie;

btnMusicLink.href = MUSIC.spotifySearch;

// ---- Countdown
setInterval(updateCountdown, 300);
updateCountdown();

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

// ---- Open / Preview
btnOpen.addEventListener("click", () => {
  titlecard.classList.add("hidden");
  invite.classList.remove("hidden");
  invite.scrollIntoView({ behavior: "smooth", block: "start" });
  burst("confetti", window.innerWidth * 0.5, 140, 26);
});

btnPeek.addEventListener("click", () => {
  burst("spark", window.innerWidth * 0.5, 180, 16);
});

// ---- Notes toggles
document.querySelectorAll(".heart").forEach((b) => {
  b.addEventListener("click", () => {
    const id = b.dataset.unlock;
    const box = $(`unlock${id}`);
    const open = !box.classList.contains("hidden");
    if (open) {
      box.classList.add("hidden");
    } else {
      box.classList.remove("hidden");
      burst("spark", b.getBoundingClientRect().left + 20, b.getBoundingClientRect().top + 20, 14);
    }
  });
});

// ---- RSVP
btnYes.addEventListener("click", () => respond("Accepted. The picture proceeds as scheduled."));
btnAlsoYes.addEventListener("click", () => respond("Accepted (alternative phrasing). Excellent."));

function respond(text) {
  reply.textContent = text;
  reply.classList.remove("hidden");
  reply.scrollIntoView({ behavior: "smooth", block: "center" });
  burst("confetti", window.innerWidth * 0.5, window.innerHeight * 0.4, 40);
}

// ---- Copy
btnCopy.addEventListener("click", async () => {
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

// ---- Calendar (.ics)
btnCalendar.addEventListener("click", downloadICS);

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

// ---- Music (user-initiated). Uses YouTube embed as a practical “background music” method.
// If you prefer Spotify-only, tell me and I’ll switch it.
let musicIframe = null;

btnMusic.addEventListener("click", () => {
  // YouTube embed via search is not stable. Better: you paste the exact video ID you want.
  // For now we open Spotify search in a new tab and also offer the optional Spotify embed panel.
  window.open(MUSIC.spotifySearch, "_blank", "noopener,noreferrer");
  respond("Soundtrack opened. Press play when ready.");

  // Optional: If you find the Spotify track link, you can set an embed URL here:
  // spotifyEmbed.src = "https://open.spotify.com/embed/track/TRACK_ID";
});

btnMusicStop.addEventListener("click", () => {
  if (musicIframe) {
    musicIframe.remove();
    musicIframe = null;
    respond("Soundtrack stopped. Silence restored.");
  } else {
    respond("Nothing is currently playing.");
  }
});

// ---- Minimal film-grain confetti / spark FX
const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d");
let particles = [];

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
requestAnimationFrame(tick);

function resizeCanvas() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

function burst(kind, x, y, count) {
  for (let i = 0; i < count; i++) particles.push(makeParticle(kind, x, y));
}

function makeParticle(kind, x, y) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 1.5 + Math.random() * 4.5;
  return {
    kind,
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - (1.5 + Math.random() * 1.5),
    life: 70 + Math.random() * 40,
    s: 6 + Math.random() * 10,
    r: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.18,
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

    const a = Math.max(0, Math.min(1, p.life / 100));
    ctx.globalAlpha = a;

    if (p.kind === "confetti") drawConfetti(p.x, p.y, p.s, p.r);
    else drawSpark(p.x, p.y, p.s, p.r);
  }

  // light grain
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < 90; i++) {
    const gx = Math.random() * window.innerWidth;
    const gy = Math.random() * window.innerHeight;
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(gx, gy, 1, 1);
  }
  ctx.globalAlpha = 1;

  requestAnimationFrame(tick);
}

function drawConfetti(x, y, s, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(r);
  ctx.fillStyle = "rgba(31,42,46,.9)";
  ctx.fillRect(-s * 0.35, -s * 0.18, s * 0.7, s * 0.36);
  ctx.restore();
}

function drawSpark(x, y, s, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(r);
  ctx.strokeStyle = "rgba(31,42,46,.85)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-s, 0); ctx.lineTo(s, 0);
  ctx.moveTo(0, -s); ctx.lineTo(0, s);
  ctx.stroke();
  ctx.restore();
}
