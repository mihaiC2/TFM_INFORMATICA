import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import { CONFIG } from "./constants";
import { createGuideBall, createRandomCubeEnvironment } from "./environment";
import { ControlledMovement } from "./movement";
import { FrameSender } from "./sender";
// import { SlamManager } from "./slamManager";

// Contenedores de la web
const canvas = document.querySelector('#mi-canvas') as HTMLCanvasElement;
const canvasiso = document.querySelector('#mi-iso-canvas') as HTMLCanvasElement;

if (!canvas || !canvasiso) {
	throw new Error("Desired Canvas Element not found");
}

// INICIALIZACIÓN Three.js
const scene = new Scene();

// Cámara Principal
const camera = new PerspectiveCamera(50, CONFIG.WIDTH / CONFIG.HEIGHT, CONFIG.NEAR, CONFIG.FAR);
camera.position.z = 1;

// Cámara Isométrica Auxiliar
const cameraISO = new PerspectiveCamera(50, 2, 0.1, 1000);
cameraISO.position.y = 10;
cameraISO.lookAt(new Vector3(0, 0, 0));

// Renderers
const renderer = new WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(CONFIG.WIDTH, CONFIG.HEIGHT);
document.body.appendChild(renderer.domElement);

const rendererISO = new WebGLRenderer({ canvas: canvasiso });

// Escenario
createRandomCubeEnvironment(scene);

const bolaGuia = createGuideBall();
scene.add(bolaGuia);

// SLAM Manager para dibujar puntos del servidor
// const slamManager = new SlamManager(camera);
// scene.add(slamManager.group);

// Bucle de render
const frameSender = new FrameSender(CONFIG.WS_SENDER_URL);
const movement = new ControlledMovement();
let lastFrameTime = 0;

function animate(time: number) {

	// Calcular ms desde la úlitma animación
	const deltaTime = time - lastFrameTime;
	lastFrameTime = time;

	// Para avanzar en función del timepo transcurrido y dar la sensación de v constante
	const timeScale = deltaTime / CONFIG.TARGET_MS_BETWEEN_FRAMES;

	// Movimiento de la camara
	movement.move(camera, timeScale);

	// Movimiento de bola guía
	bolaGuia.position.set(camera.position.x, camera.position.y + 2, camera.position.z);


	// Hacer helper invisible y mandar solo escena limpia

	// slamManager.setVisible(false);
	renderer.render(scene, camera);

	frameSender.trySendFrame(canvas, time);

	// slamManager.setVisible(true);
	renderer.render(scene, camera);


	// Render cámara isométrica auxiliar para ver la posición en el mapa
	rendererISO.render(scene, cameraISO);
}

renderer.setAnimationLoop(animate);