const servers = {
	iceServers: [
		{
			urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
		},
	],
};

class Room {
	/**
	 * Constructor takes in a room id and creates a peer connection
	 * @param {string} id
	 */
	constructor(id) {
		this.id = id;
		this.peerConnection = new RTCPeerConnection(servers);
	}

	async createOffer() {
		const offer = await this.peerConnection.createOffer();
		await this.peerConnection.setLocalDescription(offer);
		return offer;
	}

	async createAnswer() {
		const answer = await this.peerConnection.createAnswer();
		await this.peerConnection.setLocalDescription(answer);
		return answer;
	}

	/**
	 * Sets the remote description for the peer connection.
	 * @param {RTCSessionDescriptionInit} remoteDescription - The remote description to set.
	 * @returns {Promise<void>} - A promise that resolves when the remote description is set.
	 */
	async setRemoteDescription(remoteDescription) {
		await this.peerConnection.setRemoteDescription(remoteDescription);
	}

	async sendOffer() {
		const offer = await this.createOffer();
		const res = await fetch("/api/room/offer", {
			method: "post",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ offer, roomId: this.id }),
		});

		if (res.ok) {
			console.log("Offer sent successfully");
		} else {
			console.error("Failed to send offer");
		}
	}
}

export default Room;
