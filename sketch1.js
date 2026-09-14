// Grilla (1280 x 1024) 
const GRID_SIZE = 64;
const COLS = 20; // 1280 / 64
const ROWS = 16; // 1024 / 64

let estado = "INICIO"; // INICIO, NIVELES, INSTRUCCIONES, GAMEPLAY, GAMEOVER, VICTORIA
let nivelActual = 1;
let estrellasGanadas = 0;
let jugador;
let vehiculos = [];
let imgObelisco, imgVereda, imgAsfalto, imgMetrobus, imgJugador, imgAuto, imgColectivo, imgTaxi;
let imgAuto1Derecha, imgAuto2Derecha, imgAuto1, imgAuto2;
let imgTaxi1Derecha, imgTaxi2Derecha, imgTaxi1, imgTaxi2;
let imgMotoDerecha, imgMoto;
let fuentePixelify;

// UI: Declaración de variables para la interfaz
let imgFondoInicio, imgTitulo, imgBotonPlay, imgInstrucciones;
let imgLevel1, imgLevel2, imgLevel3;
let imgWinScreens = [];
let imgGameOverScreen;
let imgRewindButton, imgNextButton, imgBackButton;
let imgCorazon;

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

  // Carga de tipografía
  fuentePixelify = loadFont('tipografia/PixelifySans-Regular.ttf');

  // Carga de UI Inicio y Niveles
  imgFondoInicio   = loadImage('img/ui/fondo-inicio.png');
  imgTitulo        = loadImage('img/ui/titulo.png');
  imgBotonPlay     = loadImage('img/ui/boton-play.png');
  imgInstrucciones = loadImage('img/ui/instrucciones-pantalla.png');
  imgLevel1        = loadImage('img/ui/level_1.png');
  imgLevel2        = loadImage('img/ui/level_2.png');
  imgLevel3        = loadImage('img/ui/level_3.png');

  // Pantallas de Victoria según estrellas (0 a 3)
  for (let i = 0; i <= 3; i++) {
    imgWinScreens[i] = loadImage(`img/ui/win-${i}-stars-screen.png`);
  }

  // Pantalla de Game Over
  imgGameOverScreen = loadImage('img/ui/te-chocaron-screen.png');

  // Botones de Interfaces
  imgRewindButton = loadImage('img/ui/rewind-button.png');
  imgNextButton   = loadImage('img/ui/next-button.png');
  imgBackButton   = loadImage('img/ui/back-button.png');
  imgCorazon      = loadImage('img/ui/heart.png');
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
      dibujarPantallaInicio();
      break;
    case "NIVELES":
      dibujarPantallaNiveles();
      break;
    case "INSTRUCCIONES":
      dibujarPantallaInstrucciones();
      break;
    case "GAMEPLAY":
      ejecutarGameplay();
      break;
    case "GAMEOVER":
      dibujarPantallaGameOver();
      break;
    case "VICTORIA":
      dibujarPantallaVictoria();
      break;
  }
}

// LÓGICA PRINCIPAL
function ejecutarGameplay() {
  dibujarEscenario();

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

  jugador.dibujar();

  // Condición de Victoria
  if (jugador.gridY === 0) {
    estrellasGanadas = calcularEstrellas();
    estado = "VICTORIA";
  }

  dibujarHUD();
}

function calcularEstrellas() {
  if (jugador.vidas >= 3) return 3;
  if (jugador.vidas === 2) return 2;
  if (jugador.vidas === 1) return 1;
  return 0;
}

// ESCENARIO 
function dibujarEscenario() {
  noStroke();

  // FILA 0: META / VEREDA NORTE
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
  fill(180);
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
      estado = "NIVELES";
    }
  } else if (estado === "NIVELES") {
    // Volver al Inicio
    let backX = 40;
    let backY = 40;
    if (mouseX >= backX && mouseX <= backX + imgBackButton.width &&
        mouseY >= backY && mouseY <= backY + imgBackButton.height) {
      estado = "INICIO";
      return;
    }

    let gap = 40;
    let anchoBoton = imgLevel1.width;
    let altoBoton = imgLevel1.height;
    let anchoTotal = (anchoBoton * 3) + (gap * 2);

    let inicioX = (width - anchoTotal) / 2;
    let btnY = (height - altoBoton) / 2 + 50;

    let x1 = inicioX;
    let x2 = inicioX + anchoBoton + gap;
    let x3 = inicioX + (anchoBoton + gap) * 2;

    if (mouseX >= x1 && mouseX <= x1 + anchoBoton && mouseY >= btnY && mouseY <= btnY + altoBoton) {
      nivelActual = 1;
      reiniciarJuego();
      estado = "INSTRUCCIONES";
    } else if (mouseX >= x2 && mouseX <= x2 + anchoBoton && mouseY >= btnY && mouseY <= btnY + altoBoton) {
      nivelActual = 2;
      reiniciarJuego();
      estado = "INSTRUCCIONES";
    } else if (mouseX >= x3 && mouseX <= x3 + anchoBoton && mouseY >= btnY && mouseY <= btnY + altoBoton) {
      nivelActual = 3;
      reiniciarJuego();
      estado = "INSTRUCCIONES";
    }
  } else if (estado === "VICTORIA") {
    let gap = 40;
    let anchoBoton = imgRewindButton.width;
    let altoBoton = imgRewindButton.height;
    let btnY = 640;

    let xRewind = (width - anchoBoton) / 2;
    let xBack = xRewind - anchoBoton - gap;
    let xNext = xRewind + anchoBoton + gap;

    if (mouseX >= xBack && mouseX <= xBack + anchoBoton && mouseY >= btnY && mouseY <= btnY + altoBoton) {
      estado = "NIVELES";
    } else if (mouseX >= xRewind && mouseX <= xRewind + anchoBoton && mouseY >= btnY && mouseY <= btnY + altoBoton) {
      reiniciarJuego();
      estado = "GAMEPLAY";
    } else if (mouseX >= xNext && mouseX <= xNext + anchoBoton && mouseY >= btnY && mouseY <= btnY + altoBoton) {
      if (nivelActual < 3) {
        nivelActual++;
      }
      reiniciarJuego();
      estado = "GAMEPLAY";
    }
  } else if (estado === "GAMEOVER") {
    let gap = 40;
    let anchoBoton = imgRewindButton.width;
    let altoBoton = imgRewindButton.height;
    let btnY = 640;

    let anchoTotal = (anchoBoton * 2) + gap;
    let xBack = (width - anchoTotal) / 2;
    let xRewind = xBack + anchoBoton + gap;

    if (mouseX >= xBack && mouseX <= xBack + anchoBoton && mouseY >= btnY && mouseY <= btnY + altoBoton) {
      estado = "NIVELES";
    } else if (mouseX >= xRewind && mouseX <= xRewind + anchoBoton && mouseY >= btnY && mouseY <= btnY + altoBoton) {
      reiniciarJuego();
      estado = "GAMEPLAY";
    }
  }
}

function reiniciarJuego() {
  jugador = new Jugador();
  vehiculos = [];

  const VEL_COLECTIVO = 3;
  const VEL_AUTO = 5;
  const VEL_MOTO = 8;

  let configCarrilesNorte = [];
  let configCarrilesSur = [];

  if (nivelActual === 1) {
    configCarrilesNorte.push({ fila: 1, tipo: "auto", cantidad: 2, vel: VEL_AUTO, largo: 2, color: color(200), desfase: 0 });
    configCarrilesNorte.push({ fila: 2, tipo: "auto", cantidad: 1, vel: VEL_AUTO, largo: 2, color: color(200), desfase: 600 });
    configCarrilesNorte.push({ fila: 3, tipo: "auto", cantidad: 2, vel: VEL_AUTO, largo: 2, color: color(200), desfase: 350 });
    configCarrilesNorte.push({ fila: 4, tipo: "auto", cantidad: 1, vel: VEL_AUTO, largo: 2, color: color(200), desfase: 100 });
    configCarrilesNorte.push({ fila: 5, tipo: "auto", cantidad: 2, vel: VEL_AUTO, largo: 2, color: color(200), desfase: 750 });
    configCarrilesNorte.push({ fila: 6, tipo: "auto", cantidad: 1, vel: VEL_AUTO, largo: 2, color: color(200), desfase: 420 });

    configCarrilesSur.push({ fila: 9,  tipo: "auto", cantidad: 1, vel: -VEL_AUTO, largo: 2, color: color(200), desfase: 200 });
    configCarrilesSur.push({ fila: 10, tipo: "auto", cantidad: 2, vel: -VEL_AUTO, largo: 2, color: color(200), desfase: 800 });
    configCarrilesSur.push({ fila: 11, tipo: "auto", cantidad: 1, vel: -VEL_AUTO, largo: 2, color: color(200), desfase: 450 });
    configCarrilesSur.push({ fila: 12, tipo: "auto", cantidad: 2, vel: -VEL_AUTO, largo: 2, color: color(200), desfase: 150 });
    configCarrilesSur.push({ fila: 13, tipo: "auto", cantidad: 1, vel: -VEL_AUTO, largo: 2, color: color(200), desfase: 700 });
    configCarrilesSur.push({ fila: 14, tipo: "auto", cantidad: 2, vel: -VEL_AUTO, largo: 2, color: color(200), desfase: 350 });

  } else if (nivelActual === 2) {
    for (let f = 1; f <= 6; f++) {
      let esMoto = (f === 2 || f === 5);
      configCarrilesNorte.push({
        fila: f,
        tipo: esMoto ? "moto" : "auto",
        cantidad: 2,
        vel: esMoto ? VEL_MOTO : VEL_AUTO,
        largo: esMoto ? 1 : 2,
        color: esMoto ? color(220, 100, 40) : color(200)
      });
    }
    for (let f = 9; f <= 14; f++) {
      let esMoto = (f === 10 || f === 13);
      configCarrilesSur.push({
        fila: f,
        tipo: esMoto ? "moto" : "auto",
        cantidad: 2,
        vel: esMoto ? -VEL_MOTO : -VEL_AUTO,
        largo: esMoto ? 1 : 2,
        color: esMoto ? color(220, 100, 40) : color(200)
      });
    }

  } else if (nivelActual === 3) {
    for (let f = 1; f <= 6; f++) {
      if (f === 6) {
        configCarrilesNorte.push({ fila: f, tipo: "colectivo", cantidad: 1, vel: VEL_COLECTIVO, largo: 3, color: color(40, 100, 220) });
      } else if (f === 2 || f === 4) {
        configCarrilesNorte.push({ fila: f, tipo: "moto", cantidad: 2, vel: VEL_MOTO, largo: 1, color: color(220, 100, 40) });
      } else {
        configCarrilesNorte.push({ fila: f, tipo: "auto", cantidad: 2, vel: VEL_AUTO, largo: 2, color: color(200) });
      }
    }

    for (let f = 9; f <= 14; f++) {
      if (f === 9) {
        configCarrilesSur.push({ fila: f, tipo: "colectivo", cantidad: 1, vel: -VEL_COLECTIVO, largo: 3, color: color(40, 100, 220) });
      } else if (f === 11 || f === 13) {
        configCarrilesSur.push({ fila: f, tipo: "moto", cantidad: 2, vel: -VEL_MOTO, largo: 1, color: color(220, 100, 40) });
      } else {
        configCarrilesSur.push({ fila: f, tipo: "auto", cantidad: 2, vel: -VEL_AUTO, largo: 2, color: color(200) });
      }
    }
  }

  let todosLosCarriles = [...configCarrilesNorte, ...configCarrilesSur];
  for (let c of todosLosCarriles) {
    let distanciaSeparacion = width / c.cantidad;
    let desfaseFila = (c.desfase !== undefined) ? c.desfase : (c.fila * 180) % distanciaSeparacion;

    for (let i = 0; i < c.cantidad; i++) {
      let tipoReal = c.tipo === "auto" ? (i % 2 === 0 ? "auto" : "taxi") : c.tipo;
      let v = new Vehiculo(c.fila, c.vel, c.largo, tipoReal, c.color);
      
      v.x = (i * distanciaSeparacion + desfaseFila) % width;
      if (c.vel < 0 && v.x > width - v.ancho) {
        v.x -= width;
      }
      vehiculos.push(v);
    }
  }
}

// DIBUJO DE INTERFAZ Y PANTALLAS
function dibujarHUD() {
  fill(0);
  noStroke();
  textSize(20);
  textAlign(LEFT, TOP);
  
  let textoVidas = "Vidas: " + jugador.vidas;
  text(textoVidas, 20, 20);

  let tamCorazon = 24;
  let corazonX = 20 + textWidth(textoVidas) + 8;
  let corazonY = 18;

  image(imgCorazon, corazonX, corazonY, tamCorazon, tamCorazon);
}

function dibujarPantallaInicio() {
  image(imgFondoInicio, 0, 0, width, height);
  image(imgTitulo, 350, 357);
  image(imgBotonPlay, 483, 539);
}

function dibujarPantallaNiveles() {
  background('#A1CFF0');

  let backX = 40;
  let backY = 40;
  image(imgBackButton, backX, backY);

  textFont(fuentePixelify);
  textSize(96);
  textAlign(CENTER, CENTER);
  fill(0);
  noStroke();
  text("Seleccioná el nivel", width / 2, 280);

  let gap = 40;
  let anchoBoton = imgLevel1.width;
  let altoBoton = imgLevel1.height;
  let anchoTotal = (anchoBoton * 3) + (gap * 2);

  let inicioX = (width - anchoTotal) / 2;
  let btnY = (height - altoBoton) / 2 + 50;

  image(imgLevel1, inicioX, btnY);
  image(imgLevel2, inicioX + anchoBoton + gap, btnY);
  image(imgLevel3, inicioX + (anchoBoton + gap) * 2, btnY);
}

function dibujarPantallaInstrucciones() {
  image(imgInstrucciones, 0, 0, width, height);
}

function dibujarPantallaVictoria() {
  background(15);

  let pantallaWinActual = imgWinScreens[estrellasGanadas];
  let x = (width - pantallaWinActual.width) / 2;
  let y = (height - pantallaWinActual.height) / 2;
  image(pantallaWinActual, x, y);

  let gap = 40;
  let anchoBoton = imgRewindButton.width;
  let btnY = 640;

  let xRewind = (width - anchoBoton) / 2;
  let xBack = xRewind - anchoBoton - gap;
  let xNext = xRewind + anchoBoton + gap;

  image(imgBackButton, xBack, btnY);
  image(imgRewindButton, xRewind, btnY);
  image(imgNextButton, xNext, btnY);
}

function dibujarPantallaGameOver() {
  background(15);

  let x = (width - imgGameOverScreen.width) / 2;
  let y = (height - imgGameOverScreen.height) / 2;
  image(imgGameOverScreen, x, y);

  let gap = 40;
  let anchoBoton = imgRewindButton.width;
  let btnY = 640;

  let anchoTotal = (anchoBoton * 2) + gap;
  let xBack = (width - anchoTotal) / 2;
  let xRewind = xBack + anchoBoton + gap;

  image(imgBackButton, xBack, btnY);
  image(imgRewindButton, xRewind, btnY);
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
    this.tipo = tipo;
    this.color = colorVehiculo;

    this.ancho = this.largoCeldas * GRID_SIZE;
    this.x = velocidad > 0 ? -this.ancho : width;
  }

  actualizar() {
    this.ancho = this.largoCeldas * GRID_SIZE;
    this.x += this.velocidad;

    if (this.velocidad > 0 && this.x > width) {
      this.x = -this.ancho;
    } else if (this.velocidad < 0 && this.x < -this.ancho) {
      this.x = width;
    }
  }

  dibujar() {
    let y = this.gridY * GRID_SIZE + 4;
    let alto = GRID_SIZE - 8;

    if (this.tipo === "taxi") {
      if (this.velocidad > 0) {
        image(imgTaxi1Derecha, this.x, y, GRID_SIZE, alto);
        image(imgTaxi2Derecha, this.x + GRID_SIZE, y, GRID_SIZE, alto);
      } else {
        image(imgTaxi1, this.x, y, GRID_SIZE, alto);
        image(imgTaxi2, this.x + GRID_SIZE, y, GRID_SIZE, alto);
      }
    } else if (this.tipo === "auto") {
      if (this.velocidad > 0) {
        image(imgAuto1Derecha, this.x, y, GRID_SIZE, alto);
        image(imgAuto2Derecha, this.x + GRID_SIZE, y, GRID_SIZE, alto);
      } else {
        image(imgAuto2, this.x, y, GRID_SIZE, alto);
        image(imgAuto1, this.x + GRID_SIZE, y, GRID_SIZE, alto);
      }
    } else if (this.tipo === "moto") {
      stroke(0);
      strokeWeight(2);
      fill(this.color);
      rect(this.x, y, this.ancho, alto, 4);
    } else {
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