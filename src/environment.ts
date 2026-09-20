import { BoxGeometry, Color, DirectionalLight, DoubleSide, GridHelper, HemisphereLight, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, RepeatWrapping, Scene, SphereGeometry, TextureLoader } from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

export function addHemisphereLight(scene: Scene) {
	const hemiLight = new HemisphereLight(0xffffff, 0x444444, 0.6);
	hemiLight.position.set(0, 20, 0);
	hemiLight.castShadow = true;
	scene.add(hemiLight);
}

export function addDirectionalLight(scene: Scene) {
	const dirLight = new DirectionalLight(0xffffff, 0.8);
	dirLight.position.set(5, 10, 2);
	dirLight.castShadow = true;
	scene.add(dirLight);
}

export function addRandomCubeEnvironment(scene: Scene) {
	// Cubos Aleatorios
	const geometry = new BoxGeometry(0.4, 0.4, 0.4);
	const material = [
		Color.NAMES.red,
		Color.NAMES.aliceblue,
		Color.NAMES.green,
		Color.NAMES.green,
		Color.NAMES.beige
	].map(c => new MeshStandardMaterial({ color: c, side: DoubleSide }));

	for (let i = 0; i < 100; i++) {
		const mesh = new Mesh(geometry, material[i % material.length]);
		mesh.position.set(
			(Math.random() - 0.5) * 15,
			-0.3,
			(Math.random() - 0.5) * 15
		);
		mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
		scene.add(mesh);
	}
}

export function addGridHelperFloor(scene: Scene) {
	const gridHelper = new GridHelper(20, 40, 0x00ff00, 0xffffff);
	gridHelper.position.y = -0.5;
	scene.add(gridHelper);
}

export function addTextureFloor(scene: Scene) {
	const planeGeo = new PlaneGeometry(20, 20);

	const textureLoader = new TextureLoader();
	const floorTexture = textureLoader.load('dirt-ground.jpg');
	floorTexture.wrapS = RepeatWrapping;
	floorTexture.wrapT = RepeatWrapping;

	const planeMat = new MeshStandardMaterial({
		// color: Color.NAMES.lightgray, 
		map: floorTexture,
		roughness: 0.7
	});
	const planeMesh = new Mesh(planeGeo, planeMat);

	planeMesh.rotation.x = -Math.PI / 2;
	planeMesh.position.y = -1;
	scene.add(planeMesh);
}

export function addGLB(scene: Scene, name: string = "room",): string {
	const loader = new GLTFLoader();
	const elementoEstado = document.getElementById("EstadoCarga");
	const t0 = performance.now();
	if (elementoEstado) { elementoEstado.innerText = "Cargando..."; }
	loader.load(
		`${name}.glb`,
		(gltf) => {
			const t1 = performance.now();
			if (elementoEstado) { elementoEstado.innerText = `Cargado después de ${(t1 - t0) / 1000}s`; }
			const modelo = gltf.scene;
			scene.add(modelo);
		},
		(xhr) => {
			if (elementoEstado) { elementoEstado.innerText = `Cargando... ${Math.floor(xhr.loaded / xhr.total * 100)}%`; }
		},
		(error) => {
			if (elementoEstado) { elementoEstado.innerText = `Error al cargar el escenario: ${error}`; }
		}
	);

	return name
}


export function createGuideBall(): Mesh {
	const bolaGuiaGeo = new SphereGeometry(0.3, 16, 16);
	const bolaGuiaMat = new MeshBasicMaterial({ color: 0x00ff00 });
	return new Mesh(bolaGuiaGeo, bolaGuiaMat);
}
