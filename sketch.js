// Grilla (1280 x 1024)
const GRID_SIZE = 64;
const COLS = 20; // 1280 / 64
const ROWS = 16; // 1024 / 64

let estado = "INICIO"; // INICIO, INSTRUCCIONES, GAMEPLAY, GAMEOVER, VICTORIA
let jugador;
let vehiculos = [];

// Tiles - declaración de variables globales para imágenes y fuentes
let imgObelisco01, imgObelisco02, imgObelisco03, imgObelisco04;
let imgVereda, imgAsfalto, imgMetrobus, imgJugador;
let imgAuto1, imgAuto2; // Orientación Izquierda
let imgAuto1Derecha, imgAuto2Derecha; // Orientación Derecha
let imgColectivo, imgTaxi;

function preload() {
  // Función auxiliar para cargar imagen de forma segura sin trancar la pantalla de carga
  function cargarSegura(ruta) {
    return loadImage(
      ruta,
      img => img,
      err => {
        console.warn("No se pudo cargar: " + ruta + ". Usando fallback.");
        let gfx = createGraphics(GRID_SIZE, GRID_SIZE);
        gfx.fill(200, 50, 200);
        gfx.rect(0, 0, GRID_SIZE, GRID_SIZE);
        return gfx;
      }
    );
  }

  imgJugador       = cargarSegura('img/personaje.png');
  
  // Tiles del Obelisco (2x2 de 512x512px cada uno)
  imgObelisco01    = cargarSegura('img/obelisco_01.png'); // Arriba - Izquierda
  imgObelisco02    = cargarSegura('img/obelisco_02.png'); // Arriba - Derecha
  imgObelisco03    = cargarSegura('img/obelisco_03.png'); // Abajo - Izquierda
  imgObelisco04    = cargarSegura('img/obelisco_04.png'); // Abajo - Derecha

  imgVereda        = cargarSegura('img/vereda.png');
  imgAsfalto       = cargarSegura('img/asfalto.png');
  imgMetrobus      = cargarSegura('img/metrobus.png');
  imgAuto1         = cargarSegura('img/auto1.png');          // Tile1 Izquierda
  imgAuto2         = cargarSegura('img/auto2.png');          // Tile2 Izquierda
  imgAuto1Derecha  = cargarSegura('img/auto1-derecha.png');  // Tile1 Derecha
  imgAuto2Derecha  = cargarSegura('img/auto2-derecha.png');  // Tile2 Derecha
  imgColectivo     = cargarSegura('img/colectivo.png');
  imgTaxi          = cargarSegura('img/taxi.png');
}

function setup() {
  createCanvas(1280, 1024);
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

// Gameplay
function ejecutarGameplay() {
  dibujarEscenario();

  // Actualizar y dibujar vehículos
  for (let v of vehiculos) {
    v.actualizar();
    v.dibujar();

    // Colisión
    if (v.colisionaCon(jugador)) {
      jugador.perderVida();
      if (jugador.vidas <= 0) {
        estado = "GAMEOVER";
      }
    }
  }

  // Dibujar jugador
  jugador.dibujar();

  // Condición de Victoria (Llegar a la fila 0)
  if (jugador.gridY === 0) {
    estado = "VICTORIA";
  }

  dibujarHUD();
}

// Escenario principal
function dibujarEscenario() {
  noStroke();

  // FILA 0: META
  fill(180, 200, 180);
  rect(0, 0, width, GRID_SIZE);
  fill(220);
  triangle(width / 2 - 20, GRID_SIZE, width / 2 + 20, GRID_SIZE, width / 2, 10);

  // FILAS 1 A 6: CARRILES SENTIDO NORTE
  for (let r = 1; r <= 6; r++) {
    for (let c = 0; c < COLS; c++) {
      if (imgAsfalto) {
        image(imgAsfalto, c * GRID_SIZE, r * GRID_SIZE, GRID_SIZE, GRID_SIZE);
      }
    }
  }

  // FILAS 7 Y 8: CANTERO CENTRAL CON OBELISCO (2x2 TILES DE 512px ESCALADOS A GRID_SIZE)
  fill(40, 140, 60);
  rect(0, GRID_SIZE * 7, width, GRID_SIZE * 2);

  // Posición central para abarcar 2 columnas de la grilla (128px)
  let obeliscoX = (width / 2) - GRID_SIZE; 
  let obeliscoY = GRID_SIZE * 7;

  // Fila superior del Obelisco (Fila 7 de la grilla)
  if (imgObelisco01) image(imgObelisco01, obeliscoX, obeliscoY, GRID_SIZE, GRID_SIZE);
  if (imgObelisco02) image(imgObelisco02, obeliscoX + GRID_SIZE, obeliscoY, GRID_SIZE, GRID_SIZE);

  // Fila inferior del Obelisco (Fila 8 de la grilla)
  if (imgObelisco03) image(imgObelisco03, obeliscoX, obeliscoY + GRID_SIZE, GRID_SIZE, GRID_SIZE);
  if (imgObelisco04) image(imgObelisco04, obeliscoX + GRID_SIZE, obeliscoY + GRID_SIZE, GRID_SIZE, GRID_SIZE);

  // FILAS 9 A 14: CARRILES SENTIDO SUR
  for (let r = 9; r <= 14; r++) {
    for (let c = 0; c < COLS; c++) {
      if (imgAsfalto) {
        image(imgAsfalto, c * GRID_SIZE, r * GRID_SIZE, GRID_SIZE, GRID_SIZE);
      }
    }
  }

  // FILA 15: VEREDA INICIAL
  fill(40, 140, 60);
  rect(0, GRID_SIZE * 15, width, GRID_SIZE);

  // LÍNEAS DIVISORIAS
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

// Controles
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

  // Prevenir scroll 
  if ([37, 38, 39, 40, 32].includes(keyCode)) {
    return false;
  }
}

function reiniciarJuego() {
  jugador = new Jugador();
  vehiculos = [];

  const tilesAuto = {
    izq: [imgAuto1, imgAuto2],
    der: [imgAuto1Derecha, imgAuto2Derecha]
  };

  // Creación de vehículos en diferentes filas
  // Vehiculo(filaGrid, velocidad, largoCeldas, colorVehiculo, tilesObj)
  
  // Sentido Norte (Van hacia la izquierda/derecha alternados o según diseño)
  vehiculos.push(new Vehiculo(2, -4, 2, color(230, 50, 50), tilesAuto));
  vehiculos.push(new Vehiculo(4, 7, 1, color(240, 200, 40)));
  vehiculos.push(new Vehiculo(6, 3, 3, color(40, 100, 220)));

  // Sentido Sur
  vehiculos.push(new Vehiculo(10, 5, 2, color(200, 200, 200), tilesAuto));
  vehiculos.push(new Vehiculo(12, -8, 1, color(240, 200, 40)));
  vehiculos.push(new Vehiculo(14, -4, 3, color(40, 100, 220)));
}

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

  // Tarjeta central
  push();
  rectMode(CENTER);
  stroke(255, 80);
  strokeWeight(3);
  fill(colorTarjeta);
  rect(width / 2, height / 2, anchoTarjeta, altoTarjeta, 16);
  pop();

  textAlign(CENTER, CENTER);
  noStroke();

  // Título
  fill(255);
  textSize(48);
  textStyle(BOLD);
  text(titulo, width / 2, height / 2 - 40);

  // Subtítulo / Instrucciones
  fill(230);
  textSize(22);
  textStyle(NORMAL);
  text(subtitulo, width / 2, height / 2 + 40);
}

// Clase Jugador
class Jugador {
  constructor() {
    this.gridX = 10; // Inicio centrado
    this.gridY = 15; // Vereda inicial
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
    if (imgJugador) {
      image(imgJugador, x, y, GRID_SIZE, GRID_SIZE);
    } else {
      fill(0, 255, 0);
      rect(x, y, GRID_SIZE, GRID_SIZE);
    }
  }

  // Getters para coordenadas en píxeles (para colisiones)
  get x() { return this.gridX * GRID_SIZE; }
  get y() { return this.gridY * GRID_SIZE; }
}

// Clase Vehiculo
class Vehiculo {
  constructor(filaGrid, velocidad, largoCeldas, colorVehiculo, tilesObj = null) {
    this.gridY = filaGrid;
    this.velocidad = velocidad;
    this.largoCeldas = largoCeldas;
    this.color = colorVehiculo;
    this.tilesObj = tilesObj;

    this.ancho = this.largoCeldas * GRID_SIZE;
    // Aparecen fuera de pantalla según dirección
    this.x = velocidad > 0 ? -this.ancho : width;
  }

  actualizar() {
    this.ancho = this.largoCeldas * GRID_SIZE;
    this.x += this.velocidad;

    // Reaparecer al salir de la pantalla
    if (this.velocidad > 0 && this.x > width) {
      this.x = -this.ancho - random(50, 300);
    } else if (this.velocidad < 0 && this.x < -this.ancho) {
      this.x = width + random(50, 300);
    }
  }

  dibujar() {
    let y = this.gridY * GRID_SIZE;
    let alto = GRID_SIZE - 8; // Dejar margen dentro del carril

    if (this.tilesObj) {
      // Selecciona los tiles correspondientes según la dirección de movimiento
      let tiles = this.velocidad > 0 ? this.tilesObj.der : this.tilesObj.izq;
      
      if (tiles && tiles.length >= 2) {
        image(tiles[0], this.x, y + 4, GRID_SIZE, alto);
        image(tiles[1], this.x + GRID_SIZE, y + 4, GRID_SIZE, alto);
      }
    } else {
      stroke(0);
      strokeWeight(2);
      fill(this.color);
      rect(this.x, y + 4, this.ancho, alto, 8);
    }
  }

  colisionaCon(jugador) {
    // AABB 
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