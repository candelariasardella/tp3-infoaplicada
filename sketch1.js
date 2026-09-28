// Grilla (1280 x 1024) 
const GRID_SIZE = 64;
const COLS = 20; // 1280 / 64
const ROWS = 16; // 1024 / 64
let estado = "APODO"; 
let nivelActual = 1;
let estrellasGanadas = 0;
let jugador;
let vehiculos = [];
let imgObelisco, imgVereda, imgAsfalto, imgMetrobus, imgJugador, imgAuto, imgColectivo, imgTaxi;
let imgAuto1Derecha, imgAuto2Derecha, imgAuto1, imgAuto2;
let imgTaxi1Derecha, imgTaxi2Derecha, imgTaxi1, imgTaxi2;
let imgMoto, imgMotoIzquierda;
let fuentePixelify;
let imgEscenario;

// UI: Declaración de variables para la interfaz
let imgFondoInicio, imgTitulo, imgBotonPlay, imgInstrucciones;
let imgLevel1, imgLevel2, imgLevel3;
let imgWinScreens = [];
let imgGameOverScreen;
let imgRewindButton, imgNextButton, imgBackButton;
let imgCorazon;

// TIMER VARIABLES
let tiempoInicio = 0;
let tiempoFinal = 0;
let tiempoJugadoSegundos = 0;

// VARIABLES PARA MYSQL, RANKING Y MONEDAS
let apodoGlobal = "";
let resultadosNiveles = { 1: { tiempo: 0, estrellas: 0 }, 2: { tiempo: 0, estrellas: 0 }, 3: { tiempo: 0, estrellas: 0 } };
let top5Ranking = [];
let enviandoDatos = false;
let monedas = [];
let monedasRecolectadas = 0;

// VARIABLES SPRITESHEET MONEDA
let imgMonedaSprite;
let monedaFrames = 12;
let monedaFrameActual = 0;
let contadorAnimacionMoneda = 0;
let velAnimacionMoneda = 5;

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
  //Moto
  imgMoto = loadImage('img/moto.png');                
  imgMotoIzquierda = loadImage('img/moto-izquierda.png'); 
  // Moneda Spritesheet
  imgMonedaSprite = loadImage('img/unpeso-spritesheet.png');
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

  imgEscenario = loadImage('img/escenario-9-de-julio.png');
}

function setup() {
  createCanvas(1280, 1024);
  noSmooth();
  reiniciarJuego();
}

function draw() {
  background(30);
  switch (estado) {
    case "APODO":
      dibujarPantallaApodo();
      break;
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
    case "RANKING":
      dibujarPantallaRanking();
      break;
  }
}

// LÓGICA PRINCIPAL
function ejecutarGameplay() {
  dibujarEscenario();
  
  // Lógica para avanzar el frame de animación de las monedas
  contadorAnimacionMoneda++;
  if (contadorAnimacionMoneda >= velAnimacionMoneda) {
    monedaFrameActual = (monedaFrameActual + 1) % monedaFrames;
    contadorAnimacionMoneda = 0;
  }

  // DIBUJAR Y RECOLECTAR MONEDAS
  for (let m of monedas) {
    if (m.activa) {
      let anchoFrame = imgMonedaSprite.width / monedaFrames;
      let altoFrame = imgMonedaSprite.height;
      let margen = 12;
      
      image(
        imgMonedaSprite, 
        m.x * GRID_SIZE + margen, 
        m.y * GRID_SIZE + margen, 
        GRID_SIZE - margen * 2, 
        GRID_SIZE - margen * 2, 
        monedaFrameActual * anchoFrame, 
        0, 
        anchoFrame, 
        altoFrame
      );
      
      if (jugador.gridX === m.x && jugador.gridY === m.y) {
        m.activa = false;
        monedasRecolectadas++;
      }
    }
  }

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
    tiempoFinal = millis();
    tiempoJugadoSegundos = ((tiempoFinal - tiempoInicio) / 1000).toFixed(1);
    estrellasGanadas = monedasRecolectadas; 
    
    resultadosNiveles[nivelActual] = {
      tiempo: parseFloat(tiempoJugadoSegundos),
      estrellas: estrellasGanadas
    };

    estado = "VICTORIA";
  }
  dibujarHUD();
}

// ESCENARIO 
function dibujarEscenario() {
  image(imgEscenario, 0, 0, width, height);
}

// CONTROLES Y MANEJO DE TECLADO Y MOUSE
function keyPressed() {
  if (estado === "APODO") {
    if (keyCode >= 65 && keyCode <= 90 && apodoGlobal.length < 3) {
      apodoGlobal += key.toUpperCase();
    } 
    else if (keyCode === BACKSPACE && apodoGlobal.length > 0) {
      apodoGlobal = apodoGlobal.slice(0, -1);
    } 
    else if (keyCode === ENTER && apodoGlobal.length === 3) {
      estado = "INICIO";
    }
    return false; 
  }

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
    if (mouseX >= btnX && mouseX <= btnX + btnAncho && mouseY >= btnY && mouseY <= btnY + btnAlto) {
      estado = "NIVELES";
    }
    let rankY = 740;
    if (mouseX >= width/2 - 120 && mouseX <= width/2 + 120 && mouseY >= rankY && mouseY <= rankY + 50) {
      obtenerRanking(); 
    }
  } else if (estado === "NIVELES") {
    let backX = 40;
    let backY = 40;
    if (mouseX >= backX && mouseX <= backX + imgBackButton.width && mouseY >= backY && mouseY <= backY + imgBackButton.height) {
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
    
    if (mouseX >= width/2 - 120 && mouseX <= width/2 + 120 && mouseY >= btnY + 145 && mouseY <= btnY + 195) {
      if(!enviandoDatos) finalizarJuegoYEnviarDatos();
    }
  } else if (estado === "RANKING") {
    let btnX = width/2 - 120;
    let btnY = height - 120;
    if (mouseX >= btnX && mouseX <= btnX + 240 && mouseY >= btnY && mouseY <= btnY + 50) {
      estado = "INICIO";
      apodoGlobal = ""; 
      resultadosNiveles = { 1: { tiempo: 0, estrellas: 0 }, 2: { tiempo: 0, estrellas: 0 }, 3: { tiempo: 0, estrellas: 0 } };
    }
  }
}

function reiniciarJuego() {
  jugador = new Jugador();
  vehiculos = [];
  
  monedas = [];
  monedasRecolectadas = 0;
  let intentos = 0;
  while (monedas.length < 3 && intentos < 100) {
    let mx = floor(random(0, COLS));
    let my = floor(random(1, ROWS - 1)); 
    let ocupado = monedas.some(m => m.x === mx && m.y === my);
    if (!ocupado) {
      monedas.push({x: mx, y: my, activa: true});
    }
    intentos++;
  }

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
  tiempoInicio = millis();
}

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

  let textoMonedas = "Estrellas: " + monedasRecolectadas + "/3";
  text(textoMonedas, corazonX + tamCorazon + 20, 20);

  let tiempoActual = ((millis() - tiempoInicio) / 1000).toFixed(1);
  textAlign(RIGHT, TOP);
  fill(0);
  text("Tiempo: " + tiempoActual + "s", width - 20, 20);
}

function dibujarPantallaInicio() {
  image(imgFondoInicio, 0, 0, width, height);
  image(imgTitulo, 350, 357);
  image(imgBotonPlay, 483, 539);
  
  let btnY = 740;
  fill(255, 215, 0);
  rect(width / 2 - 120, btnY, 240, 50, 10);
  fill(0);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("VER RANKING", width / 2, btnY + 25);
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

  textFont(fuentePixelify);
  textSize(32);
  fill(255);
  textAlign(CENTER, CENTER);
  text("Tiempo: " + tiempoJugadoSegundos + "s", width / 2, y + pantallaWinActual.height - 40);

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
  
  fill(255, 215, 0);
  rect(width / 2 - 120, btnY + 145, 240, 50, 10);
  fill(0);
  textSize(24);
  textAlign(CENTER, CENTER);
  // Le sumé 25 al Y para que el texto quede centrado justo adentro de la caja
  text("VER RANKING", width / 2, btnY + 170); 
}

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
      if (this.velocidad > 0) {
        image(imgMoto, this.x, y, this.ancho, alto);
      } else {
        image(imgMotoIzquierda, this.x, y, this.ancho, alto);
      }
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

function dibujarPantallaApodo() {
  background(20);
  textFont(fuentePixelify);
  textAlign(CENTER, CENTER);
  
  fill(255);
  textSize(60);
  text("COLOCAR APODO", width / 2, height / 2 - 100);
  
  textSize(30);
  fill(150);
  text("3 Letras - Estilo Arcade", width / 2, height / 2 - 30);
  
  fill(0);
  stroke(255, 215, 0);
  strokeWeight(4);
  rect(width / 2 - 100, height / 2 + 20, 200, 80, 10);
  
  noStroke();
  fill(255, 215, 0);
  textSize(60);
  text(apodoGlobal, width / 2, height / 2 + 60);
  
  if (apodoGlobal.length === 3) {
    fill(0, 255, 0);
    textSize(25);
    text("PRESIONA ENTER PARA CONTINUAR", width / 2, height / 2 + 150);
  }
}

function finalizarJuegoYEnviarDatos() {
  enviandoDatos = true;
  let nivelesCompletados = 0;
  let estrellasTotales = 0;
  let tiempoTotal = 0;
  
  for (let i = 1; i <= 3; i++) {
    if (resultadosNiveles[i].tiempo > 0) {
      nivelesCompletados++;
      estrellasTotales += resultadosNiveles[i].estrellas;
      tiempoTotal += resultadosNiveles[i].tiempo;
    }
  }

  let data = {
    apodo: apodoGlobal, 
    niveles: nivelesCompletados,
    estrellas: estrellasTotales,
    tiempo: parseFloat(tiempoTotal.toFixed(1))
  };

  fetch('guardar.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(() => obtenerRanking())
  .catch(err => console.error("Error guardando datos", err));
}

function obtenerRanking() {
  fetch('ranking.php')
    .then(res => res.json())
    .then(data => {
      top5Ranking = data;
      estado = "RANKING";
      enviandoDatos = false;
    });
}

function dibujarPantallaRanking() {
  background(20);
  textFont(fuentePixelify);
  textAlign(CENTER, CENTER);
  
  textSize(70);
  fill(255, 215, 0); 
  text("TOP 5 RANKING", width / 2, 120);

  textSize(40);
  fill(180);
  text("APODO", width / 4, 250);
  text("TIEMPO", width / 2, 250);
  text("ESTRELLAS", 3 * width / 4, 250);

  fill(255);
  textSize(35);
  for (let i = 0; i < top5Ranking.length; i++) {
    let r = top5Ranking[i];
    let y = 350 + (i * 80);
    
    text(r.apodo, width / 4, y);
    text(r.tiempo_total + "s", width / 2, y);
    text("x" + r.estrellas_totales, 3 * width / 4, y);
  }

  let btnX = width / 2 - 120;
  let btnY = height - 120;
  fill(200, 50, 50);
  rect(btnX, btnY, 240, 50, 10);
  fill(255);
  textSize(24);
  text("VOLVER", width / 2, btnY + 25);
}