import { Object3D, Vector3 } from "three";

abstract class Movement {
	abstract move(object: Object3D, deltaTime: number): void;
}

export class CircularMovement extends Movement {
	constructor(
		private readonly radius: number = 4,
		private readonly speed: number = 0.005,
		private angle: number = 0,
	) {
		super();
	}

	move(object: Object3D, deltaTime: number): void {
		this.angle += this.speed * deltaTime;
		object.position.set(Math.cos(this.angle) * this.radius, 0.5, Math.sin(this.angle) * this.radius);
		object.lookAt(Math.cos(this.angle + 0.1) * this.radius, 0.5, Math.sin(this.angle + 0.1) * this.radius);
	}
}

export class ControlledMovement extends Movement {
	// Forward | Left | Backward | Right. Indica que movimientos están sucediento en un instante determinado
	private readonly activeActions = new Set<string>();
	private readonly keyActionMap: Record<string, string> = {
		'w': 'Forward',
		'a': 'Left',
		's': 'Backward',
		'd': 'Right',
		'arrowup': 'Forward',
		'arrowdown': 'Backward',
		'arrowleft': 'Left',
		'arrowright': 'Right'
	};

	private readonly movementFunctions: Record<string, (object: Object3D, deltaTime: number) => void> = {
		Forward: (object, deltaTime) => this.moveForward(object, deltaTime),
		Backward: (object, deltaTime) => this.moveBackward(object, deltaTime),
		Left: (object, deltaTime) => this.turnLeft(object, deltaTime),
		Right: (object, deltaTime) => this.turnRight(object, deltaTime)
	};

	constructor(
		private readonly speed: number = 0.01,
		private readonly turnSpeed: number = 0.01
	) {
		super();
		window.addEventListener('keydown', this.onKeyDown);
		window.addEventListener('keyup', this.onKeyUp);
	}

	private onKeyDown = (event: KeyboardEvent): void => {
		const key = event.key.toLowerCase();
		if (this.keyActionMap[key]) {
			this.activeActions.add(this.keyActionMap[key]);
		}
	};

	private onKeyUp = (event: KeyboardEvent): void => {
		const key = event.key.toLowerCase();
		if (this.keyActionMap[key]) {
			this.activeActions.delete(this.keyActionMap[key]);
		}
	};

	move(object: Object3D, deltaTime: number): void {
		this.activeActions.forEach((action) => {
			const localMovementFun = this.movementFunctions[action];
			if (localMovementFun) {
				localMovementFun(object, deltaTime);
			}
		});
	}

	private moveForward(object: Object3D, deltaTime: number): void {
		const facingVector = new Vector3();
		object.getWorldDirection(facingVector);

		object.position.add(facingVector.multiplyScalar(deltaTime * this.speed));
	}

	private moveBackward(object: Object3D, deltaTime: number): void {
		const facingVector = new Vector3();
		object.getWorldDirection(facingVector);

		object.position.sub(facingVector.multiplyScalar(deltaTime * this.speed));
	}

	private turnLeft(object: Object3D, deltaTime: number): void {
		// Gira el objeto sobre su eje Y local (hacia la izquierda)
		object.rotateY(this.turnSpeed * deltaTime);
	}

	private turnRight(object: Object3D, deltaTime: number): void {
		// Gira el objeto sobre su eje Y local (hacia la derecha)
		object.rotateY(-this.turnSpeed * deltaTime);
	}
}