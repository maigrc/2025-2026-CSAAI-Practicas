let tablero = document.getElementById("tablero")

let btnComenzar = document.getElementById("comenzar")
let btnDetener = document.getElementById("detener")
let btnMusica = document.getElementById("musica")

let infoNivel = document.getElementById("infoNivel").firstChild
let infoTiempo = document.getElementById("infoTiempo").firstChild
let infoEstado = document.getElementById("infoEstado").firstChild

let mensaje = document.getElementById("mensaje")

let selectorNivel = document.getElementById("nivelInicial")

let audio = document.getElementById("audio")

let cartas = []

let juego = {

activo:false,
nivel:1,
tiempo:0,
timer:null,

velocidad:{
1:800,
2:600,
3:450,
4:300,
5:180
},

niveles:{

1:["cama","cama","cama","cama","casa","casa","casa","casa"],
2:["cama","casa","cama","casa","cama","casa","cama","casa"],
3:["casa","casa","cama","cama","casa","casa","cama","cama"],
4:["cama","casa","casa","cama","casa","cama","cama","casa"],
5:["casa","cama","casa","cama","casa","cama","casa","cama"]

}

}

function generarTablero(){

tablero.innerHTML=""

for(let i=0;i<8;i++){

let carta=document.createElement("div")
carta.classList.add("carta")

tablero.appendChild(carta)

cartas.push(carta)

}

}

function cargarNivel(n){

let layout=juego.niveles[n]

cartas.forEach((carta,i)=>{

carta.innerHTML=`<img src="${layout[i]}.png">`

})

}

function iniciarTiempo(){

juego.timer=setInterval(()=>{

juego.tiempo++

infoTiempo.textContent=juego.tiempo+" Segundos"

},1000)

}

function pararTiempo(){

clearInterval(juego.timer)

}

function sleep(ms){

return new Promise(r=>setTimeout(r,ms))

}

async function secuencia(vel){

for(let i=0;i<cartas.length;i++){

if(!juego.activo) return

cartas[i].classList.add("activa")

await sleep(vel)

cartas[i].classList.remove("activa")

}

}

async function comenzar(){

juego.activo=true
juego.tiempo=0

infoEstado.textContent="Jugando"

juego.nivel=parseInt(selectorNivel.value)

iniciarTiempo()

audio.play()

for(let n=juego.nivel;n<=5;n++){

infoNivel.textContent="Nivel "+n

cargarNivel(n)

mensaje.textContent="Preparado..."

await sleep(2000)

mensaje.textContent="¡Vamos!"

await secuencia(juego.velocidad[n])

}

terminar()

}

function detener(){

juego.activo=false

pararTiempo()

audio.pause()

infoEstado.textContent="Detenido"

mensaje.textContent="Juego detenido"

}

function terminar(){

juego.activo=false

pararTiempo()

audio.pause()

infoEstado.textContent="Finalizado"

mensaje.textContent="Partida terminada"

}

btnComenzar.onclick=comenzar
btnDetener.onclick=detener

btnMusica.onclick=()=>{

if(audio.paused){

audio.play()
btnMusica.textContent="Música ON"

}else{

audio.pause()
btnMusica.textContent="Música OFF"

}

}

generarTablero()