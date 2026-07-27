export class FrameSender {
	private ws: WebSocket;
	public hasError: boolean = false;
	private lastSentUpdate: number = 0;

	constructor(url: string) {
		this.ws = new WebSocket(url);

		this.ws.onopen = () => {
			this.hasError = false;
		};

		this.ws.onerror = (error) => {
			console.error("Error en WebSocket (Sender):", error);
			this.hasError = true;
		};
	}

	public trySendFrame(canvas: HTMLCanvasElement, currentTime: number, intervalMs: number = 90) {
		if (currentTime - this.lastSentUpdate > intervalMs) {
			this.lastSentUpdate = currentTime;

			if (!this.hasError && this.ws.readyState === WebSocket.OPEN) {
				canvas.toBlob((blob) => {
					if (!blob) return;
					blob.arrayBuffer().then(buffer => {
						this.ws.send(buffer);
					});
				}, 'image/jpeg');
			}
		}
	}
}