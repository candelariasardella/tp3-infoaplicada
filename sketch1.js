// Grilla (1280 x 1024) 
const GRID_SIZE = 64;
const COLS = 20; // 1280 / 64
const ROWS = 16; // 1024 / 64

let estado = "INICIO"; // INICIO, INSTRUCCIONES, GAMEPLAY, GAMEOVER, VICTORIA
let jugador;
let vehiculos = [];

// TILES: Declaración de variables globales para imágenes y fuentes

let imgObelisco, imgVereda, imgAsfalto, imgMetrobus, imgJugador, imgAuto, imgColectivo, imgTaxi;
let fuentePixel, fuenteTitulo;

function preload() {
  // Carga del sprite del personaje
  imgJugador = loadImage('img/personaje.png');

  // Carga de imágenes suplementarias 
  // imgObelisco = loadImage('assets/obelisco.png');
  // imgVereda   = loadImage('assets/vereda.png');
  // imgAsfalto  = loadImage('assets/asfalto.png');
  // imgMetrobus = loadImage('assets/metrobus.png');
  // imgAuto     = loadImage('assets/auto.png');
  // imgColectivo= loadImage('assets/colectivo.png');
  // imgTaxi     = loadImage('assets/taxi.png');
}

function setup() {

  createCanvas(1280, 1024);

  // renderizado de píxeles nítido para arte 2D/Pixel Art
  noSmooth();

  reiniciarJuego();
}

function draw() {
  background(30);

  switch (estado) {
    case "INICIO":
      dibujarPantallaTexto("CRAZY 9 DE JULIO", "Presioná ENTER para ver instrucciones");
      break;
    case "INSTRUCCIONES":
      dibujarPantallaTexto("INSTRUCCIONES", "Usa WASD o Flechas para moverte.\nLlega al Obelisco cruzando el tráfico.\n\nPresioná ENTER para jugar");
      break;
    case "GAMEPLAY":
      ejecutarGameplay();
      break;
    case "GAMEOVER":
      dibujarPantallaTexto("¡TE ATROPELLARON!", "Te quedaste sin vidas.\n\nPresioná 'R' para reiniciar", color(150, 30, 30));
      break;
    case "VICTORIA":
      dibujarPantallaTexto("¡LLEGASTE AL OBELISCO!", "¡Cruzaste la 9 de Julio con éxito!\n\nPresioná 'R' para jugar de nuevo", color(30, 120, 60));
      break;
  }
}

// LÓGICA PRINCIPAL DE GAMEPLAY 
function ejecutarGameplay() {
  dibujarEscenario();

  // Actualizar y dibujar vehículos
  for (let v of vehiculos) {
    v.actualizar();
    v.dibujar();

    if (v.colisionaCon(jugador)) {
      jugador.perderVida();
      if (jugador.vidas <= 0) {
        estado = "GAMEOVER";
      }
    }
  }

  // Dibujar al jugador por encima del fondo y autos
  jugador.dibujar();

  // Condición de Victoria (Llegar a la vereda norte / Fila 0)
  if (jugador.gridY === 0) {
    estado = "VICTORIA";
  }

  dibujarHUD();
}

// ESCENARIO 
function dibujarEscenario() {
  noStroke();

  // FILA 0: META / VEREDA NORTE Y OBELISCO
  fill(180, 200, 180);
  rect(0, 0, width, GRID_SIZE);
  // TODO: Reemplazar el triángulo provisorio por: image(imgObelisco, width/2 - GRID_SIZE/2, 0, GRID_SIZE, GRID_SIZE);
  fill(220);
  triangle(width / 2 - 20, GRID_SIZE, width / 2 + 20, GRID_SIZE, width / 2, 10);

  // FILAS 1 A 6: CARRILES SENTIDO NORTE
  // TODO: Repetir patrón de fondo con imgAsfalto en un bucle for()
  fill(50);
  rect(0, GRID_SIZE * 1, width, GRID_SIZE * 6);

  // FILAS 7 Y 8: BULEVAR CENTRAL / CANTERO / METROBUS
  // TODO: Usar imgMetrobus o imgVereda para decorar el bulevar central
  fill(40, 140, 60);
  rect(0, GRID_SIZE * 7, width, GRID_SIZE * 2);

  // FILAS 9 A 14: CARRILES SENTIDO SUR
  // TODO: Repetir patrón de fondo con imgAsfalto en un bucle for()
  fill(50);
  rect(0, GRID_SIZE * 9, width, GRID_SIZE * 6);

  // FILA 15: VEREDA INICIAL DE SALIDA
  // TODO: Reemplazar por patrón repetido con imgVereda
  fill(40, 140, 60);
  rect(0, GRID_SIZE * 15, width, GRID_SIZE);

  // LÍNEAS DIVISORIAS PROVISORIAS
  stroke(255, 200, 0);
  strokeWeight(2);
  for (let r = 1; r < ROWS - 1; r++) {
    if (r !== 7 && r !== 8 && r !== 15) {
      for (let c = 0; c < COLS; c += 2) {
        line(c * GRID_SIZE, r * GRID_SIZE, (c + 1) * GRID_SIZE, r * GRID_SIZE);
      }
    }
  }
}

// CONTROLES Y MANEJO DE TECLADO 
function keyPressed() {
  if (estado === "INICIO" && keyCode === ENTER) {
    estado = "INSTRUCCIONES";
  } else if (estado === "INSTRUCCIONES" && keyCode === ENTER) {
    estado = "GAMEPLAY";
  } else if (estado === "GAMEPLAY") {
    if (keyCode === UP_ARROW || key === 'w' || key === 'W') jugador.mover(0, -1);
    if (keyCode === DOWN_ARROW || key === 's' || key === 'S') jugador.mover(0, 1);
    if (keyCode === LEFT_ARROW || key === 'a' || key === 'A') jugador.mover(-1, 0);
    if (keyCode === RIGHT_ARROW || key === 'd' || key === 'D') jugador.mover(1, 0);
  } else if ((estado === "GAMEOVER" || estado === "VICTORIA") && (key === 'r' || key === 'R')) {
    reiniciarJuego();
    estado = "GAMEPLAY";
  }

  if ([37, 38, 39, 40, 32].includes(keyCode)) {
    return false;
  }
}

function reiniciarJuego() {
  jugador = new Jugador();
  vehiculos = [];

  // Configuración inicial de vehículos
  vehiculos.push(new Vehiculo(2, 4, 2, color(230, 50, 50)));   // Auto Rojo
  vehiculos.push(new Vehiculo(4, 7, 1, color(240, 200, 40)));  // Taxi
  vehiculos.push(new Vehiculo(6, 3, 3, color(40, 100, 220)));  // Colectivo

  vehiculos.push(new Vehiculo(10, -5, 2, color(200, 200, 200))); // Auto Gris
  vehiculos.push(new Vehiculo(12, -8, 1, color(240, 200, 40)));  // Taxi
  vehiculos.push(new Vehiculo(14, -4, 3, color(40, 100, 220)));  // Colectivo
}

// DIBUJO DE INTERFAZ Y PANTALLAS
function dibujarHUD() {
  fill(255);
  noStroke();
  textSize(20);
  textAlign(LEFT, TOP);
  text("Vidas: " + jugador.vidas, 20, 20);
}

function dibujarPantallaTexto(titulo, subtitulo, colorTarjeta = color(20)) {
  background(15);

  let anchoTarjeta = 800;
  let altoTarjeta = 400;

  push();
  rectMode(CENTER);
  stroke(255, 80);
  strokeWeight(3);
  fill(colorTarjeta);
  rect(width / 2, height / 2, anchoTarjeta, altoTarjeta, 16);
  pop();

  textAlign(CENTER, CENTER);
  noStroke();

  fill(255);
  textSize(48);
  textStyle(BOLD);
  text(titulo, width / 2, height / 2 - 40);

  fill(230);
  textSize(22);
  textStyle(NORMAL);
  text(subtitulo, width / 2, height / 2 + 40);
}

// JUGADOR
class Jugador {
  constructor() {
    this.gridX = 10;
    this.gridY = 15;
    this.vidas = 3;
  }

  mover(dirX, dirY) {
    this.gridX = constrain(this.gridX + dirX, 0, COLS - 1);
    this.gridY = constrain(this.gridY + dirY, 0, ROWS - 1);
  }

  perderVida() {
    this.vidas--;
    this.gridX = 10;
    this.gridY = 15;
  }

  dibujar() {
    let x = this.gridX * GRID_SIZE;
    let y = this.gridY * GRID_SIZE;
    
    // TODO: TILES - Se dibuja el sprite cargado en imgJugador
    image(imgJugador, x, y, GRID_SIZE, GRID_SIZE);
  }

  get x() { return this.gridX * GRID_SIZE; }
  get y() { return this.gridY * GRID_SIZE; }
}

// CLASE VEHICULO 
class Vehiculo {
  constructor(filaGrid, velocidad, largoCeldas, colorVehiculo) {
    this.gridY = filaGrid;
    this.velocidad = velocidad;
    this.largoCeldas = largoCeldas;
    this.color = colorVehiculo;

    this.ancho = this.largoCeldas * GRID_SIZE;
    this.x = velocidad > 0 ? -this.ancho : width;
  }

  actualizar() {
    this.ancho = this.largoCeldas * GRID_SIZE;
    this.x += this.velocidad;

    if (this.velocidad > 0 && this.x > width) {
      this.x = -this.ancho - random(50, 300);
    } else if (this.velocidad < 0 && this.x < -this.ancho) {
      this.x = width + random(50, 300);
    }
  }

  dibujar() {
    let y = this.gridY * GRID_SIZE;
    let alto = GRID_SIZE - 8;

    // TODO: TILES - Reemplazar la figura rect() por imágenes de autos/colectivos:
    // Ejemplo: image(imgAuto, this.x, y + 4, this.ancho, alto);
    stroke(0);
    strokeWeight(2);
    fill(this.color);
    rect(this.x, y + 4, this.ancho, alto, 8);
  }

  colisionaCon(jugador) {
    let jX = jugador.x + 4;
    let jY = jugador.y + 4;
    let jAncho = GRID_SIZE - 8;
    let jAlto = GRID_SIZE - 8;

    let vY = this.gridY * GRID_SIZE + 4;
    let vAlto = GRID_SIZE - 8;

    return (
      jX < this.x + this.ancho &&
      jX + jAncho > this.x &&
      jY < vY + vAlto &&
      jY + jAlto > vY
    );
  }
}