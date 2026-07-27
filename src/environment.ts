import { BoxGeometry, Color, DirectionalLight, GridHelper, HemisphereLight, Mesh, MeshBasicMaterial, MeshStandardMaterial, Scene, SphereGeometry } from 'three';

export function createEnvironment(scene: Scene) {
	const hemiLight = new HemisphereLight(0xffffff, 0x444444, 0.6);
	hemiLight.position.set(0, 20, 0); // La colocamos bien arriba
	scene.add(hemiLight);

	// 2. Luz Principal Cenital (Color, Intensidad)
	const dirLight = new DirectionalLight(0xffffff, 0.8);
	// La colocamos arriba, pero ligeramente desplazada en X y Z 
	// para que las caras de los cubos tengan diferentes tonos
	dirLight.position.set(5, 10, 2);
	scene.add(dirLight);

	// Escena: Rejilla base
	const gridHelper = new GridHelper(20, 40, 0x00ff00, 0xffffff);
	gridHelper.position.y = -0.5;
	scene.add(gridHelper);

	// Escena: Cubos aleatorios
	const geometry = new BoxGeometry(0.4, 0.4, 0.4);
	const material = [
		Color.NAMES.red,
		Color.NAMES.aliceblue,
		Color.NAMES.green,
		Color.NAMES.green,
		Color.NAMES.beige
	].map(c => new MeshStandardMaterial({
		color: c
	}));

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

export function createGuideBall(): Mesh {
	const bolaGuiaGeo = new SphereGeometry(0.3, 16, 16);
	const bolaGuiaMat = new MeshBasicMaterial({ color: 0x00ff00 });
	return new Mesh(bolaGuiaGeo, bolaGuiaMat);
}