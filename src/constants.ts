export const CONFIG = {
	WIDTH: 640,
	HEIGHT: 480,
	NEAR: 0.1,
	FAR: 1000.0,
	SLAM_SCALE: 15,
	WS_SENDER_URL: 'ws://localhost:5000',
	WS_SLAM_URL: 'ws://localhost:5001',
	TARGET_MS_BETWEEN_FRAMES: 16.66 // 1000ms / 60fps
};