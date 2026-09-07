// Grilla (1280 x 1024) 
const GRID_SIZE = 64;
const COLS = 20; // 1280 / 64
const ROWS = 16; // 1024 / 64

let estado = "INICIO"; // inicio, instrucciones, etc. 
let jugador;
let vehiculos = [];

<<<<<<< HEAD
let imgObelisco, imgVereda, imgAsfalto, imgMetrobus, imgJugador;
let imgAuto1Derecha, imgAuto2Derecha, imgAuto1, imgAuto2;
let imgTaxi1Derecha, imgTaxi2Derecha, imgTaxi1, imgTaxi2;
let imgColectivo;
=======
// TILES: Declaración de variables globales para imágenes y fuentes
let imgObelisco, imgVereda, imgAsfalto, imgMetrobus, imgJugador, imgAuto, imgColectivo, imgTaxi;
>>>>>>> ca5f74f6a84ad360fc06506755597b3fdd3a798a
let fuentePixel, fuenteTitulo;
let imgWinScreen, imgRewindButton;


// UI: Declaración de variables para la interfaz
let imgFondoInicio, imgTitulo, imgBotonPlay, imgInstrucciones;

function preload() {
  imgJugador = loadImage('img/personaje.png');
  
  // Autos - Derecha 
  imgAuto1Derecha = loadImage('img/auto1-derecha.png');
  imgAuto2Derecha = loadImage('img/auto2-derecha.png');

  // Autos - Izquierda
  imgAuto1 = loadImage('img/auto2.png');
  imgAuto2 = loadImage('img/auto1.png');

  // Taxis - Derecha
  imgTaxi1Derecha = loadImage('img/taxi1_derecha.png');
  imgTaxi2Derecha = loadImage('img/taxi2_derecha.png');

  // Taxis - Izquierda
  imgTaxi1 = loadImage('img/taxi1.png');
  imgTaxi2 = loadImage('img/taxi2.png');

  // Carga de imágenes suplementarias (descomentar según uso)
  // imgObelisco = loadImage('assets/obelisco.png');
  // imgVereda   = loadImage('assets/vereda.png');
  // imgAsfalto  = loadImage('assets/asfalto.png');
  // imgMetrobus = loadImage('assets/metrobus.png');
  // imgColectivo= loadImage('assets/colectivo.png');
<<<<<<< HEAD
=======
  // imgTaxi     = loadImage('assets/taxi.png');

  // Carga de UI Inicio
  imgFondoInicio = loadImage('img/ui/fondo-inicio.png');
  imgTitulo      = loadImage('img/ui/titulo.png');
  imgBotonPlay   = loadImage('img/ui/boton-play.png');
  imgInstrucciones = loadImage('img/ui/instrucciones-pantalla.png');
  imgWinScreen     = loadImage('img/ui/win-screen.png');
  imgRewindButton  = loadImage('img/ui/rewind-button.png');
>>>>>>> ca5f74f6a84ad360fc06506755597b3fdd3a798a
}

function setup() {
  createCanvas(1280, 1024);

  // Renderizado de píxeles Pixel Art
  noSmooth();

  reiniciarJuego();
}

function draw() {
  background(30);

  switch (estado) {
    case "INICIO":
      dibujarPantallaInicio();
      break;
    case "INSTRUCCIONES":
      dibujarPantallaInstrucciones();
      break;
    case "GAMEPLAY":
      ejecutarGameplay();
      break;
    case "GAMEOVER":
      dibujarPantallaTexto("¡TE ATROPELLARON!", "Te quedaste sin vidas.\n\nPresioná 'R' para reiniciar", color(150, 30, 30));
      break;
    case "VICTORIA":
      dibujarPantallaVictoria();
      break;
  }
}

// LÓGICA PRINCIPAL
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
  fill(180);
  rect(0, 0, width, GRID_SIZE);
  

  // FILAS 1 A 6: CARRILES SENTIDO NORTE
  fill(50);
  rect(0, GRID_SIZE * 1, width, GRID_SIZE * 6);

  // FILAS 7 Y 8: BULEVAR CENTRAL / METROBUS
  fill(40, 140, 60);
  rect(0, GRID_SIZE * 7, width, GRID_SIZE * 2);

  // FILAS 9 A 14: CARRILES SENTIDO SUR
  fill(50);
  rect(0, GRID_SIZE * 9, width, GRID_SIZE * 6);

  // FILA 15: VEREDA INICIAL DE SALIDA
  fill(180); // Gris claro
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

// CONTROLES Y MANEJO DE TECLADO Y MOUSE
function keyPressed() {
  if (estado === "INSTRUCCIONES" && keyCode === ENTER) {
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

function mouseClicked() {
  if (estado === "INICIO") {
    let btnX = 483;
    let btnY = 539;
    let btnAncho = imgBotonPlay.width;
    let btnAlto = imgBotonPlay.height;

    if (mouseX >= btnX && mouseX <= btnX + btnAncho &&
        mouseY >= btnY && mouseY <= btnY + btnAlto) {
      estado = "INSTRUCCIONES";
    }
  }
}

function reiniciarJuego() {
  jugador = new Jugador();
  vehiculos = [];

  // Configuración inicial de vehículos:
  // Parametros: (filaGrid, velocidad, largoCeldas, tipo, colorFallback)
  vehiculos.push(new Vehiculo(2, 4, 2, "auto"));                                  // Auto (2 tiles, derecha)
  vehiculos.push(new Vehiculo(4, 7, 2, "taxi"));                                  // Taxi (2 tiles, derecha)
  vehiculos.push(new Vehiculo(6, 3, 3, "colectivo", color(40, 100, 220)));       // Colectivo (3 celdas)

  vehiculos.push(new Vehiculo(10, -5, 2, "auto"));                                 // Auto (2 tiles, izquierda)
  vehiculos.push(new Vehiculo(12, -8, 2, "taxi"));                                 // Taxi (2 tiles, izquierda)
  vehiculos.push(new Vehiculo(14, -4, 3, "colectivo", color(40, 100, 220)));      // Colectivo (3 celdas)
}

// DIBUJO DE INTERFAZ Y PANTALLAS
function dibujarHUD() {
  fill(0);
  noStroke();
  textSize(20);
  textAlign(LEFT, TOP);
  text("Vidas: " + jugador.vidas, 20, 20);
}

function dibujarPantallaInicio() {
  image(imgFondoInicio, 0, 0, width, height);
  image(imgTitulo, 350, 357);
  image(imgBotonPlay, 483, 539);
}
function dibujarPantallaInstrucciones() {
  image(imgInstrucciones, 0, 0, width, height);
}

function dibujarPantallaVictoria() {
  background(15); // Fondo oscuro para los bordes sobrantes del canvas

  // Centrado respetando resolución original
  let x = (width - imgWinScreen.width) / 2;
  let y = (height - imgWinScreen.height) / 2;
  image(imgWinScreen, x, y);

  // Modificá estos valores para ubicar el botón
  let botonX = 580;
  let botonY = 640;

  image(imgRewindButton, botonX, botonY);
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
    
    image(imgJugador, x, y, GRID_SIZE, GRID_SIZE);
  }

  get x() { return this.gridX * GRID_SIZE; }
  get y() { return this.gridY * GRID_SIZE; }
}

// CLASE VEHICULO 
class Vehiculo {
  constructor(filaGrid, velocidad, largoCeldas, tipo = "auto", colorVehiculo = color(200)) {
    this.gridY = filaGrid;
    this.velocidad = velocidad;
    this.largoCeldas = largoCeldas;
    this.tipo = tipo; // "auto", "taxi" o "colectivo"
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
    let y = this.gridY * GRID_SIZE + 4;
    let alto = GRID_SIZE - 8;

    if (this.tipo === "taxi") {
      // TAXI (2 tiles)
      if (this.velocidad > 0) {
        image(imgTaxi1Derecha, this.x, y, GRID_SIZE, alto);
        image(imgTaxi2Derecha, this.x + GRID_SIZE, y, GRID_SIZE, alto);
      } else {
        image(imgTaxi1, this.x, y, GRID_SIZE, alto);
        image(imgTaxi2, this.x + GRID_SIZE, y, GRID_SIZE, alto);
      }
    } else if (this.tipo === "auto") {
      // AUTO (2 tiles)
      if (this.velocidad > 0) {
        image(imgAuto1Derecha, this.x, y, GRID_SIZE, alto);
        image(imgAuto2Derecha, this.x + GRID_SIZE, y, GRID_SIZE, alto);
      } else {
        image(imgAuto2, this.x, y, GRID_SIZE, alto);
        image(imgAuto1, this.x + GRID_SIZE, y, GRID_SIZE, alto);
      }
    } else {
      // COLECTIVOS / OTROS (Rectángulo provisorio)
      stroke(0);
      strokeWeight(2);
      fill(this.color);
      rect(this.x, y, this.ancho, alto, 8);
    }
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