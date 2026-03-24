let clave = [];
let intentos = 7;
let usados = [];
let segundos = 0;
let timer = null;
let iniciado = false;

// --- AUDIOS ---
const audioTiktak = new Audio("ticktack.mp3");
audioTiktak.loop = true;

const audioVictoria = new Audio("victoria.mp3");
const audioExplosion = new Audio("explosion.mp3");

const teclado = document.getElementById("teclado");

[7,8,9,4,5,6,1,2,3,null,0,null].forEach(n => {
  const btn = document.createElement("button");

  if (n === null) {
    btn.style.visibility = "hidden";
  } else {
    btn.textContent = n;
    btn.onclick = () => jugar(n, btn);
  }

  teclado.appendChild(btn);
});

function generarClave() {
  let nums = [...Array(10).keys()];
  clave = [];

  while (clave.length < 4) {
    let i = Math.floor(Math.random() * nums.length);
    clave.push(nums.splice(i,1)[0]);
  }
}

function jugar(num, btn) {
  if (!iniciado) start();

  if (usados.includes(num)) return;

  usados.push(num);
  btn.disabled = true;
  intentos--;

  document.getElementById("intentos").textContent =
    "Intentos restantes: " + intentos;

  let acierto = clave.includes(num);

  const mensaje = document.getElementById("mensaje");

  if (acierto) {
    mensaje.innerHTML =
      `Has acertado el número ${num}. ¡Sigue así!`;
    mensaje.style.color = "#00ff99";
  } else {
    mensaje.innerHTML =
      `El número ${num} no se encuentra en la clave. Inténtalo de nuevo.`;
    mensaje.style.color = "#ff5555";
  }

  comprobar(num);

  if (intentos === 0) perder();
}

function comprobar(num) {
  const casillas = document.querySelectorAll("#clave div");

  clave.forEach((n,i) => {
    if (n === num) {
      casillas[i].textContent = num;
      casillas[i].style.color = "#00ffff";
    }
  });

  if ([...casillas].every(c => c.textContent !== "*")) ganar();
}

function ganar() {
  stop();

  const mensaje = document.getElementById("mensaje");

  mensaje.innerHTML =
    `¡Clave descubierta!<br>
     Tiempo ${formato()}<br>
     Intentos consumidos: ${7 - intentos}<br>
     Intentos restantes: ${intentos}`;

  mensaje.style.color = "#00f0ff";

  document.body.classList.add("shake");

  // SOLO AQUI SE LANZAN LOS CONFETIS
  lanzarConfeti();

  // AUDIO VICTORIA
  audioVictoria.play();

  bloquear();
}

function perder() {
  stop();

  // ELIMINAR CONFETIS POR SI QUEDAN
  document.querySelectorAll(".confeti").forEach(e => e.remove());

  const mensaje = document.getElementById("mensaje");

  mensaje.innerHTML =
    `¡BOOM! Has agotado los intentos.<br>
     La clave correcta era <b>${clave.join("")}</b>.<br>
     Pulsa Reset para jugar otra vez.`;

  mensaje.style.color = "red";

  document.querySelectorAll("#clave div")
    .forEach((c,i)=> c.textContent = clave[i]);

  document.body.classList.add("shake");

  const img = document.createElement("img");
  img.src = "bomba.png";
  img.className = "explosion";
  document.body.appendChild(img);

  // AUDIO EXPLOSION
  audioExplosion.play();

  bloquear();
}

function bloquear() {
  document.querySelectorAll(".teclado button")
    .forEach(b => b.disabled = true);
}

function start() {
  if (iniciado) return;

  document.getElementById("mensaje").textContent = "";

  iniciado = true;
  timer = setInterval(() => {
    segundos++;
    document.getElementById("timer").textContent = formato();
  }, 1000);

  // AUDIO TIKTAK
  audioTiktak.play();
}

function stop() {
  clearInterval(timer);
  iniciado = false;

  document.getElementById("mensaje").textContent = "Cronómetro detenido";

  // DETENER AUDIO TIKTAK
  audioTiktak.pause();
  audioTiktak.currentTime = 0;
}

function formato() {
  let m = Math.floor(segundos/60);
  let s = segundos%60;
  return `0:${m}:${s<10?"0":""}${s}`;
}

function resetGame() {
  stop();
  segundos = 0;
  intentos = 7;
  usados = [];

  document.getElementById("timer").textContent = "0:00:00";
  document.getElementById("intentos").textContent = "Intentos restantes: 7";

  const mensaje = document.getElementById("mensaje");
  mensaje.textContent = "Nueva partida preparada";
  mensaje.style.color = "#00f0ff";

  document.querySelectorAll("#clave div").forEach(c => {
    c.textContent = "*";
    c.style.color = "#00f0ff";
  });

  document.querySelectorAll(".teclado button")
    .forEach(b => b.disabled = false);

  document.body.classList.remove("shake");

  document.querySelectorAll(".explosion").forEach(e => e.remove());
  document.querySelectorAll(".confeti").forEach(e => e.remove());

  // DETENER TODOS LOS AUDIOS
  audioVictoria.pause();
  audioVictoria.currentTime = 0;
  audioExplosion.pause();
  audioExplosion.currentTime = 0;
  audioTiktak.pause();
  audioTiktak.currentTime = 0;

  generarClave();
}

function lanzarConfeti() {
  const colores = ["#ff0", "#0ff", "#f0f", "#0f0", "#f00", "#00f"];

  for (let i = 0; i < 120; i++) {
    let confeti = document.createElement("div");
    confeti.className = "confeti";

    confeti.style.left = Math.random() * 100 + "vw";
    confeti.style.backgroundColor =
      colores[Math.floor(Math.random() * colores.length)];

    confeti.style.animationDuration = (Math.random() * 2 + 2) + "s";

    document.body.appendChild(confeti);

    setTimeout(() => confeti.remove(), 3000);
  }
}

generarClave();