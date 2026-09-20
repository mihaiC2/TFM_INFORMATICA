import { Color, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import { CONFIG, KnownGLBs } from "./constants";
import { addGLB, addGridHelperFloor, addHemisphereLight, createGuideBall } from "./environment";
import { ControlledMovement } from "./movement";
import { FrameSender } from "./sender";
import { SlamManagerNewScene } from "./slamManager";

// Contenedores de la web
const canvas = document.querySelector('#mi-canvas') as HTMLCanvasElement;
const canvasIso = document.querySelector('#mi-iso-canvas') as HTMLCanvasElement;
const canvasPuntos = document.querySelector('#mi-canvas-puntos') as HTMLCanvasElement;
const botonExportar = document.querySelector("#exportar-nube") as HTMLButtonElement;

if (!canvas || !canvasIso || !canvasPuntos) {
	throw new Error("Desired Canvas Element not found");
}

// INICIALIZACIÓN Three.js
const scene = new Scene();
scene.background = new Color(Color.NAMES.skyblue);
const scenePuntos = new Scene();

// Cámara Principal
const camera = new PerspectiveCamera(50, CONFIG.WIDTH / CONFIG.HEIGHT, CONFIG.NEAR, CONFIG.FAR);
camera.position.z = 1;

// Cámara Isométrica Auxiliar
const cameraISO = new PerspectiveCamera(90, 2, 0.1, 1000);
cameraISO.position.y = 10;
cameraISO.lookAt(0, 0, 0);

// Cámara Puntos
const cameraPuntos = new PerspectiveCamera(50, 2, 0.1, 1000);
cameraPuntos.position.y = 10;
cameraPuntos.lookAt(new Vector3(0, 0, 0));

// Renderers
const renderer = new WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(CONFIG.WIDTH, CONFIG.HEIGHT);

const rendererISO = new WebGLRenderer({ canvas: canvasIso });
rendererISO.setSize(600, 300);

const rendererPuntos = new WebGLRenderer({ canvas: canvasPuntos });
rendererPuntos.setSize(CONFIG.WIDTH, CONFIG.HEIGHT)

// Escenario
addHemisphereLight(scene);
const GLBName = addGLB(scene, KnownGLBs.neighbourhood_city_modular_2);
// addTextureFloor(scene);

addHemisphereLight(scenePuntos);
addGridHelperFloor(scenePuntos);

const bolaGuia = createGuideBall();
scene.add(bolaGuia);

// SLAM Manager para dibujar puntos del servidor
const slamManager = new SlamManagerNewScene();
scenePuntos.add(slamManager.group);

// Exportar
if (botonExportar) {
	botonExportar.addEventListener('click', () => {
		slamManager.exportToXYZ(`PM_${GLBName}_${Math.floor(lastFrameTime / 1000)}s`);
	});
}

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
	bolaGuia.position.set(camera.position.x, camera.position.y, camera.position.z);

	cameraISO.lookAt(bolaGuia.position);

	frameSender.trySendFrame(canvas, time, 60);

	// slamManager.setVisible(true);
	renderer.render(scene, camera);


	// Render cámara isométrica auxiliar para ver la posición en el mapa
	rendererISO.render(scene, cameraISO);
	rendererPuntos.render(scenePuntos, cameraPuntos);
}

renderer.setAnimationLoop(animate);