import { serverHost, serverPort } from "@/config/constants";
import { useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type useSocketParams = {
    onConnect?: (
        socket: Socket,
        emitEvent: (event: string, data?: unknown) => void
    ) => void;
    onEvent?: (
        emitEvent: (event: string, data?: unknown) => void,
        event: string,
        data: unknown
    ) => void;
};

export const useSocket = ({ onConnect, onEvent }: useSocketParams = {}) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const socketRef = useRef<Socket | null>(null);

    const emitEvent = (event: string, data: unknown) => {
        const currentSocket = socketRef.current;

        if (!currentSocket?.connected) {
            console.warn("Socket is not connected. Cannot emit event:", event);
            return;
        }

        currentSocket.emit(event, data);
    };

    const connect = () => {
        const _socket = io(`ws://${serverHost}:${serverPort}`, {
            withCredentials: true
        });

        socketRef.current = _socket;
        setSocket(_socket);

        _socket.on("connect", () => {
            setIsConnected(true);
            onConnect?.(_socket, (event, data) => _socket.emit(event, data));
        });

        _socket.on("disconnect", () => {
            setIsConnected(false);
            if (socketRef.current === _socket) {
                socketRef.current = null;
            }
        });

        _socket.onAny((event, ...args) => {
            onEvent?.(emitEvent, event, args[0]);
        });
    };

    const disconnect = () => {
        socketRef.current?.close();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
    };

    return { socket, isConnected, connect, disconnect, emitEvent };
};
