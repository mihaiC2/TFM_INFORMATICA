import asyncio
import json
import websockets
import cv2
import numpy as np
import roslibpy
import base64
import time
import struct

# VARIABLES GLOBALES
ultima_nube_binaria = b''
ultima_pose_json = None

# CONEXIÓN HACIA DOCKER 
print("⏳ Conectando con ROS (Puerto 9090)...")
ros_client = roslibpy.Ros(host='localhost', port=9090)
ros_client.run()
print("\033[92m¡Conectado al rosbridge de Docker!\033[0m")

topic_imagen = roslibpy.Topic(ros_client, '/camera/image_raw', 'sensor_msgs/Image')

def procesar_nube(mensaje):
	global ultima_nube_binaria
	try:
		datos_binarios = base64.b64decode(mensaje['data'])
		point_step = mensaje['point_step']
		
		puntos_validos = bytearray()
		for i in range(0, len(datos_binarios), point_step):
			xyz = datos_binarios[i:i+12]
			x, y, z = struct.unpack('<fff', xyz)
			if x != 0.0 or y != 0.0 or z != 0.0:
				puntos_validos.extend(xyz)
				
		ultima_nube_binaria = bytes(puntos_validos)
	except Exception as e:
		pass
	
def procesar_pose(mensaje):
	global ultima_pose_json
	try:
		pose = mensaje['pose']['position']
		orientation = mensaje['pose']['orientation']
		
		ultima_pose_json = json.dumps({
			"x": pose['x'], "y": pose['y'], "z": pose['z'],
			"qx": orientation['x'], "qy": orientation['y'], "qz": orientation['z'], "qw": orientation['w']
		})
		
		# print(f"Pose recibida: X={pos['x']:.2f}, Y={pos['y']:.2f}, Z={pos['z']:.2f}")

	except Exception as e:
		print(f"\033[91mError leyendo la pose de ROS: {e}\033[0m")

listener_pose = roslibpy.Topic(ros_client, '/orb_slam3/pose', 'geometry_msgs/PoseStamped')
listener_pose.subscribe(procesar_pose)

listener_mapa = roslibpy.Topic(ros_client, '/orb_slam3/map_points', 'sensor_msgs/PointCloud2')
listener_mapa.subscribe(procesar_nube)


# WEBSOCKET DE ENTRADA (Puerto 5000)
async def recibir_frame(websocket):
	print("\033[92mFrontend conectado para ENVIAR imágenes (Puerto 5000).\033[0m")
	try:
		async for mensaje in websocket:
			nparr = np.frombuffer(mensaje, np.uint8)
			frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
			
			if frame is not None:
				img_bytes = frame.tobytes()
				frame_b64 = base64.b64encode(img_bytes).decode('ascii')

				msg = {
					'header': {
						'frame_id': 'camera',
					},
					'height': frame.shape[0],
					'width': frame.shape[1],
					'encoding': 'bgr8',
					'is_bigendian': 0,
					'step': frame.shape[1] * 3,
					'data': frame_b64
				}
				topic_imagen.publish(roslibpy.Message(msg))
	except websockets.exceptions.ConnectionClosed:
		print("\033[91mFrontend desconectado del túnel de imágenes.\033[0m")


# WEBSOCKET DE SALIDA (Puerto 5001)
async def enviar_nube_loop(websocket):
	print("\033[90mFrontend conectado para RECIBIR la nube y pose (Puerto 5001).\033[0m")
	try:
		while True:
			
			if ultima_nube_binaria:
				await websocket.send(ultima_nube_binaria)

			
			if ultima_pose_json:
				await websocket.send(ultima_pose_json)
				
			await asyncio.sleep(0.1) 
	except websockets.exceptions.ConnectionClosed:
		print("\033[91mFrontend desconectado del túnel de salida.\033[0m")


async def main():
	print("\033[92mServidor WebSocket IN (Imágenes) arrancado en ws://localhost:5000\033[0m")
	print("\033[92mServidor WebSocket OUT (Nube 3D) arrancado en ws://localhost:5001\033[0m")
	
	server_in = websockets.serve(recibir_frame, "0.0.0.0", 5000)
	server_out = websockets.serve(enviar_nube_loop, "0.0.0.0", 5001)
	
	async with server_in, server_out:
		await asyncio.Future()

if __name__ == "__main__":
	try:
		asyncio.run(main())
	except KeyboardInterrupt:
		ros_client.terminate()
		print("\n \033[92mServidor apagado.\033[0m")