export const CONFIG = {
	WIDTH: 640,
	HEIGHT: 480,
	NEAR: 0.1,
	FAR: 1000.0,
	SLAM_SCALE: 1,
	WS_SENDER_URL: 'ws://localhost:5000',
	WS_SLAM_URL: 'ws://localhost:5001',
	TARGET_MS_BETWEEN_FRAMES: 33 // 1000ms / 60fps
};

/**
 * "Futuristic Room" (https://skfb.ly/orWOQ) by denis_cliofas is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
 * "Cyberpunk City" (https://skfb.ly/pxSX9) by golukumar is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
 * "Hintze Hall" (https://skfb.ly/oF9N6) by artfletch is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
 */
export enum KnownGLBs {
	room = "room",

	neighbourhood_city_modular_1 = "neighbourhood_city_modular_1",
	neighbourhood_city_modular_2 = "neighbourhood_city_modular_2",

	cyberpunk_city_1 = "cyberpunk_city_1",
	cyberpunk_city_4 = "cyberpunk_city_4",
	cyberpunk_city_8 = "cyberpunk_city_8",

	futuristic_room_1 = "futuristic_room_1",
	futuristic_room_4 = "futuristic_room_4",

	hintze_hall_1 = "hintze_hall_1",
	hintze_hall_4 = "hintze_hall_4",
	hintze_hall_8 = "hintze_hall_8",
}