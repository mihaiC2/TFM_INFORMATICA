import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import { CONFIG } from "./constants";
import { createEnvironment, createGuideBall } from "./environment";
import { FrameSender } from "./sender";
import { SlamManager } from "./slamManager";

// ---------------------------------------------------------
// 1. OBTENCIÓN DE DOM ELEMENTS
// ---------------------------------------------------------
const canvas = document.querySelector('#mi-canvas') as HTMLCanvasElement;
const canvasiso = document.querySelector('#mi-iso-canvas') as HTMLCanvasElement;

if (!canvas || !canvasiso) {
	throw new Error("Canvas Element not desired");
}

// ---------------------------------------------------------
// 2. INICIALIZACIÓN CORE (Three.js)
// ---------------------------------------------------------
const scene = new Scene();

// Cámara Principal
const camera = new PerspectiveCamera(50, CONFIG.WIDTH / CONFIG.HEIGHT, CONFIG.NEAR, CONFIG.FAR);
camera.position.z = 1;

// Cámara Isométrica/Auxiliar
const cameraISO = new PerspectiveCamera(50, 2, 0.1, 1000);
cameraISO.position.y = 10;
cameraISO.lookAt(new Vector3(0, 0, 0));

// Renderers
const renderer = new WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(CONFIG.WIDTH, CONFIG.HEIGHT);
document.body.appendChild(renderer.domElement);

const rendererISO = new WebGLRenderer({ canvas: canvasiso });

// ---------------------------------------------------------
// 3. INICIALIZACIÓN DE MÓDULOS
// ---------------------------------------------------------
createEnvironment(scene);

const bolaGuia = createGuideBall();
scene.add(bolaGuia);

const slamManager = new SlamManager(camera);
scene.add(slamManager.group);

const frameSender = new FrameSender(CONFIG.WS_SENDER_URL);

// ---------------------------------------------------------
// 4. ANIMACIÓN Y BUCLE DE RENDER
// ---------------------------------------------------------
let lastFrameTime = 0;
let angle = 0;
const radius = 4;
const speed = 0.005;

function animate(time: number) {
	if (lastFrameTime === 0) lastFrameTime = time;

	// Calcular Delta Time
	const deltaTime = time - lastFrameTime;
	lastFrameTime = time;

	// Normalizar la velocidad
	const timeScale = deltaTime / CONFIG.FPS_TARGET;
	angle += speed * timeScale;

	// Movimiento circular de la cámara principal
	camera.position.set(Math.cos(angle) * radius, 0.5, Math.sin(angle) * radius);
	camera.lookAt(Math.cos(angle + 0.1) * radius, 0.5, Math.sin(angle + 0.1) * radius);

	// Movimiento de bola guía
	bolaGuia.position.set(camera.position.x, camera.position.y + 2, camera.position.z);

	// --- FASE DE RENDER Y ENVÍO ---

	// 1. Ocultar SLAM para enviar un frame limpio al servidor
	slamManager.setVisible(false);
	renderer.render(scene, camera);

	// 2. Intentar enviar el frame mediante nuestra clase Sender
	frameSender.trySendFrame(canvas, time);

	// 3. Volver a mostrar SLAM y renderizar escena completa visual
	slamManager.setVisible(true);
	renderer.render(scene, camera);

	// 4. Render auxiliar ISO
	rendererISO.render(scene, cameraISO);
}

// Iniciar bucle
renderer.setAnimationLoop(animate);