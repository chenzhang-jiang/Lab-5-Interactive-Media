var places = [
  { name: "Québec City", file: "quebec", x: 75.35, y: 79.8, labelX: 79.3, labelY: 75.5 },
  { name: "Ottawa", file: "ottawa", x: 71.1, y: 84.6, labelX: 68.1, labelY: 79.1 },
  { name: "Vancouver", file: "vancouver", x: 21.7, y: 66.6, labelX: 14.3, labelY: 62.7 },
  { name: "Montréal", file: "montreal", x: 73.05, y: 82.7, labelX: 79.6, labelY: 88.0 },
  { name: "Halifax", file: "halifax", x: 84.95, y: 79.8, labelX: 90.9, labelY: 85.6 },
  { name: "Banff", file: "banff", x: 30.8, y: 65.6, labelX: 27.1, labelY: 59.7 },
  { name: "Niagara Falls", file: "niagara", x: 65.95, y: 91.0, labelX: 59.1, labelY: 95.0 },
  { name: "Prince Edward Island", file: "pei", x: 84.25, y: 76.1, labelX: 88.8, labelY: 70.3 },
  { name: "Toronto", file: "toronto", x: 67.45, y: 89.9, labelX: 73.2, labelY: 95.8 }
];

var artists = ["Salomé_Lubczanski", "Anthousai", "mycompasstv", "Breviceps", "micmussfilm", "lwdickens", "miastodzwiekow", "juskiddink", "moxobna"];
var licenses = ["CC0", "CC0", "CC0", "CC0*", "CC BY 4.0", "CC0", "CC BY 4.0", "CC BY 4.0", "CC0"];
var soundNumbers = [733785, 398776, 474290, 462340, 848489, 260634, 442274, 149488, 36734];
var soundUsers = ["Salomé_Lubczanski", "Anthousai", "mycompasstv", "Breviceps", "micmussfilm", "lwdickens", "miastodzwiekow", "juskiddink", "moxobna"];

var currentPlace = -1;
var visited = [false, false, false, false, false, false, false, false, false];
var lastJourneyPlace = -1;
var sound = document.getElementById("sceneAudio");
var journey = document.getElementById("journeyAudio");
var stampSound = document.getElementById("stampAudio");

function get(id) {
  return document.getElementById(id);
}

function playAudio(audio) {
  var result = audio.play();
  if (result) {
    result.catch(function () {});
  }
}

function showTime(seconds) {
  var minutes = Math.floor(seconds / 60);
  var rest = Math.floor(seconds % 60);
  if (rest < 10) rest = "0" + rest;
  return minutes + ":" + rest;
}

function drawMap() {
  get("pins").innerHTML = "";
  get("labelLines").innerHTML = "";

  for (var i = 0; i < places.length; i++) {
    addMapPoint(i);
  }

  var total = 0;
  for (var j = 0; j < visited.length; j++) {
    if (visited[j]) total++;
  }

  if (total === 9) {
    get("finishArea").hidden = false;
    var points = "";
    for (var k = 0; k < places.length; k++) {
      points += places[k].x + "," + places[k].y + " ";
    }
    get("routeStroke").setAttribute("points", points);
    get("routeStroke").classList.add("visible");
  }
}

function addMapPoint(index) {
  var place = places[index];
  var point = document.createElement("button");
  point.className = "map-marker";
  if (visited[index]) point.classList.add("collected");
  point.style.left = place.x + "%";
  point.style.top = place.y + "%";
  point.innerHTML = visited[index] ? "✓" : "✳";
  point.title = place.name;
  point.setAttribute("aria-label", "Open " + place.name);
  point.onclick = function () { openPostcard(index); };
  get("pins").appendChild(point);

  var label = document.createElement("button");
  label.className = "place-label";
  if (visited[index]) label.classList.add("collected");
  label.style.left = place.labelX + "%";
  label.style.top = place.labelY + "%";
  label.textContent = place.name;
  label.onclick = function () { openPostcard(index); };
  get("pins").appendChild(label);

  var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", place.x);
  line.setAttribute("y1", place.y);
  line.setAttribute("x2", place.labelX);
  line.setAttribute("y2", place.labelY);
  line.setAttribute("class", "leader");
  get("labelLines").appendChild(line);
}

function openPostcard(index) {
  currentPlace = index;
  var place = places[index];
  journey.pause();
  sound.pause();
  get("postcard").classList.remove("flipped");

  get("frontCardImage").src = "assets/postcards/" + place.file + "_back.webp";
  get("backCardImage").src = "assets/postcards/" + place.file + "_front.webp";
  get("frontCardImage").alt = place.name + " landscape and poem";
  get("backCardImage").alt = place.name + " postcard with caption";
  get("collectBtn").textContent = visited[index] ? "COLLECTED ✓" : "COLLECT ✳";
  get("playStatus").textContent = "10 SECOND SOUNDSCAPE";
  get("playBtn").textContent = "Ⅱ";
  get("audioSeek").value = 0;
  get("audioTime").textContent = "0:00 / 0:10";

  get("overlay").hidden = false;
  document.body.classList.add("modal-open");
  sound.src = "assets/audio/" + place.file + ".mp3";
  sound.load();
  playAudio(sound);
}

function closePostcard() {
  sound.pause();
  get("overlay").hidden = true;
  document.body.classList.remove("modal-open");
}

function collectPostcard() {
  if (currentPlace < 0) return;
  if (!visited[currentPlace]) {
    visited[currentPlace] = true;
    stampSound.currentTime = 0;
    playAudio(stampSound);
    var stamp = get("markAnimation");
    stamp.classList.remove("active");
    // Restart the same short CSS animation.
    stamp.offsetWidth;
    stamp.classList.add("active");
    drawMap();
  }
  get("collectBtn").textContent = "COLLECTED ✓";
}

get("closeBtn").onclick = closePostcard;
get("flipBtn").onclick = function () {
  get("postcard").classList.toggle("flipped");
};
get("collectBtn").onclick = collectPostcard;
get("overlay").onclick = function (event) {
  if (event.target === get("overlay")) closePostcard();
};

get("playBtn").onclick = function () {
  if (sound.paused) {
    if (sound.ended || sound.currentTime >= 9.9) sound.currentTime = 0;
    playAudio(sound);
  } else {
    sound.pause();
  }
};

sound.onplay = function () { get("playBtn").textContent = "Ⅱ"; };
sound.onpause = function () { get("playBtn").textContent = "▶"; };
sound.ontimeupdate = function () {
  get("audioSeek").value = sound.currentTime;
  get("audioTime").textContent = showTime(sound.currentTime) + " / 0:10";
};
sound.onended = function () {
  get("playBtn").textContent = "↻";
  get("playStatus").textContent = "REPLAY SOUND";
};

get("audioSeek").oninput = function () {
  sound.currentTime = Number(this.value);
  get("audioTime").textContent = showTime(sound.currentTime) + " / 0:10";
};

get("creditsBtn").onclick = function () {
  var panel = get("infoContent");
  panel.innerHTML = "";

  var intro = document.createElement("p");
  intro.textContent = "Photographs and map supplied for this project. Check their reuse rights before publishing. Sounds were edited and mixed from Freesound recordings:";
  panel.appendChild(intro);

  for (var i = 0; i < places.length; i++) {
    var row = document.createElement("div");
    row.className = "credit-row";
    var label = document.createElement("span");
    label.textContent = places[i].name + " · " + artists[i] + " · " + licenses[i];
    var link = document.createElement("a");
    link.textContent = "Freesound ↗";
    link.href = "https://freesound.org/people/" + encodeURIComponent(soundUsers[i]) + "/sounds/" + soundNumbers[i] + "/";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    row.appendChild(label);
    row.appendChild(link);
    panel.appendChild(row);
  }

  var note = document.createElement("p");
  note.textContent = "CC BY recordings require attribution. Montréal organ music may also involve composition/performance rights; confirm before public release.";
  panel.appendChild(note);
  get("infoOverlay").hidden = false;
  document.body.classList.add("modal-open");
};

get("infoClose").onclick = function () {
  get("infoOverlay").hidden = true;
  document.body.classList.remove("modal-open");
};

get("journeyBtn").onclick = function () {
  closePostcard();
  get("journeyOverlay").hidden = false;
  document.body.classList.add("modal-open");
  lastJourneyPlace = -1;
  journey.currentTime = 0;
  updateJourney();
  playAudio(journey);
};

get("journeyClose").onclick = function () {
  journey.pause();
  get("journeyOverlay").hidden = true;
  document.body.classList.remove("modal-open");
};

get("journeyPlay").onclick = function () {
  if (journey.paused) {
    if (journey.ended) journey.currentTime = 0;
    playAudio(journey);
  } else {
    journey.pause();
  }
};

function updateJourney() {
  var time = journey.currentTime;
  get("journeyClock").textContent = showTime(time) + " / 1:25";
  get("journeySeek").value = time;

  // 85 seconds divided into nine evenly displayed scenes.
  var index = Math.min(8, Math.floor(time / (85 / 9)));
  if (index !== lastJourneyPlace) {
    lastJourneyPlace = index;
    get("journeyImage").src = "assets/postcards/" + places[index].file + "_front.webp";
    get("journeyPlace").textContent = places[index].name;
  }
}

get("journeySeek").oninput = function () {
  journey.currentTime = Number(this.value);
  updateJourney();
};

journey.ontimeupdate = updateJourney;
journey.onplay = function () { get("journeyPlay").textContent = "Ⅱ PAUSE"; };
journey.onpause = function () { get("journeyPlay").textContent = "▶ PLAY"; };
journey.onended = function () { get("journeyPlay").textContent = "↻ REPLAY"; };

// Escape key closes the open window.
document.onkeydown = function (event) {
  if (event.key === "Escape") {
    if (!get("infoOverlay").hidden) get("infoClose").click();
    else if (!get("journeyOverlay").hidden) get("journeyClose").click();
    else if (!get("overlay").hidden) closePostcard();
  }
};

drawMap();
