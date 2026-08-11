import { io, Socket } from "socket.io-client";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from '../../config/environment';

let socket: Socket | null = null;

export const initializeSocket = (token: string) => {
	if (socket) return socket;

	socket = io(SERVER_URL, {
		auth: {
			token,
		},
		transports: ["websocket"],
	});

	socket.on("connect", () => {
		console.log("Socket connected", socket?.id);
	});

	socket.on("disconnect", () => {
		console.log("Socket disconnected");
	});

	return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
	if (!socket) return;
	socket.disconnect();
	socket = null;
};

export const sendMessage = (toUserId: string, content: string, clientId?: string) => {
	if (!socket) return;
	socket.emit("sendMessage", { toUserId, message: content, clientId });
};

export const markDelivered = (messageId: string) => {
	socket?.emit("messageDelivered", { messageId });
};

export const markRead = (messageId: string) => {
	socket?.emit("messageRead", { messageId });
};

export const reactToMessage = (messageId: string, emoji: string) => {
	socket?.emit("reactMessage", { messageId, emoji });
};

export const deleteMessageSocket = (messageId: string) => {
	socket?.emit("deleteMessage", { messageId });
};

export default {
	initializeSocket,
	getSocket,
	sendMessage,
	markDelivered,
	markRead,
	reactToMessage,
	deleteMessageSocket,
};
