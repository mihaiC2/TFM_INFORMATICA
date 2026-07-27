import { BufferGeometry, CameraHelper, Color, Float32BufferAttribute, Group, PerspectiveCamera, Points, PointsMaterial, Quaternion } from 'three';
import { CONFIG } from './constants';

export class SlamManager {
	public group: Group;
	private slamCamera: PerspectiveCamera;
	private cameraHelper: CameraHelper;
	private geometryPuntos: BufferGeometry;
	private ws: WebSocket;
	private mainCameraRef: PerspectiveCamera;

	constructor(mainCamera: PerspectiveCamera) {
		this.mainCameraRef = mainCamera;
		this.group = new Group();

		// Configuración de Nube de Puntos
		this.geometryPuntos = new BufferGeometry();
		const materialPuntos = new PointsMaterial({ color: 0xff0000, size: 0.15 });
		const nubeDePuntos = new Points(this.geometryPuntos, materialPuntos);
		this.group.add(nubeDePuntos);

		// Configuración de Cámara SLAM
		this.slamCamera = new PerspectiveCamera(50, CONFIG.WIDTH / CONFIG.HEIGHT, 0.1, 0.5);
		this.cameraHelper = new CameraHelper(this.slamCamera);
		this.cameraHelper.setColors(new Color(0xffff00), new Color(0xffff00), new Color(0xffff00), new Color(0xffff00), new Color(0xffff00));
		this.group.add(this.cameraHelper);

		// Configuración WebSocket
		this.ws = new WebSocket(CONFIG.WS_SLAM_URL);
		this.ws.binaryType = 'arraybuffer';
		this.initWebSocket();
	}

	private initWebSocket() {
		this.ws.onopen = () => console.log("✅ Conectado al receptor de la Nube de Puntos (5001).");

		this.ws.onmessage = (evento) => {
			if (typeof evento.data === "string") {
				this.updatePose(JSON.parse(evento.data));
			} else {
				this.updatePointCloud(new Float32Array(evento.data));
			}
		};
	}

	private updatePose(pose: any) {
		// 1. Traducir POSICIÓN y ROTACIÓN local
		this.slamCamera.position.set(pose.x * CONFIG.SLAM_SCALE, -pose.y * CONFIG.SLAM_SCALE, -pose.z * CONFIG.SLAM_SCALE);

		const qSLAM = new Quaternion(pose.qx, -pose.qy, -pose.qz, pose.qw);
		this.slamCamera.quaternion.copy(qSLAM);

		// 2. Cálculo del Offset Ideal
		const qOffsetIdeal = this.mainCameraRef.quaternion.clone().multiply(this.slamCamera.quaternion.clone().invert());
		const posOffsetIdeal = this.mainCameraRef.position.clone().sub(
			this.slamCamera.position.clone().applyQuaternion(qOffsetIdeal)
		);

		// 3. Balanceo Continuo
		const factorSuavizado = 0.05;
		this.group.position.lerp(posOffsetIdeal, factorSuavizado);
		this.group.quaternion.slerp(qOffsetIdeal, factorSuavizado);

		this.slamCamera.updateMatrixWorld(true);
		this.cameraHelper.update();
	}

	private updatePointCloud(posicionesBinarias: Float32Array) {
		for (let i = 0; i < posicionesBinarias.length; i += 3) {
			posicionesBinarias[i] = posicionesBinarias[i] * CONFIG.SLAM_SCALE;
			posicionesBinarias[i + 1] = -posicionesBinarias[i + 1] * CONFIG.SLAM_SCALE;
			posicionesBinarias[i + 2] = -posicionesBinarias[i + 2] * CONFIG.SLAM_SCALE;
		}
		this.geometryPuntos.setAttribute('position', new Float32BufferAttribute(posicionesBinarias, 3));
	}

	public setVisible(isVisible: boolean) {
		this.group.visible = isVisible;
	}
}