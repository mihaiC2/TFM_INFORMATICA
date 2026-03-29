import { BoxGeometry, Mesh, MeshNormalMaterial, PerspectiveCamera, Scene, WebGLRenderer } from "three";

const width = window.innerWidth, height = window.innerHeight;

// init

const camera = new PerspectiveCamera(70, width / height, 0.01, 10);
camera.position.z = 1;

const scene = new Scene();

const geometry = new BoxGeometry(0.2, 0.2, 0.2);
const material = new MeshNormalMaterial();

const mesh = new Mesh(geometry, material);
scene.add(mesh);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// animation

function animate(time: number) {

	mesh.rotation.x = time / 2000;
	mesh.rotation.y = time / 1000;

	renderer.render(scene, camera);

}