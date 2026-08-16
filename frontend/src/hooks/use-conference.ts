import { useRef, useState, useCallback, useEffect } from "react";

export const useConference = () => {
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const closePeerConnection = useCallback(() => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.ontrack = null;
            peerConnectionRef.current.onicecandidate = null;
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        setRemoteStream(null);
    }, []);

    const initializePeerConnection = useCallback(
        (
            config?: RTCConfiguration,
            onIceCandidate?: (candidate: RTCIceCandidate) => void
        ) => {
            if (peerConnectionRef.current) return peerConnectionRef.current;

            const pc = new RTCPeerConnection(
                config ?? {
                    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
                }
            );

            pc.ontrack = (event) => {
                setRemoteStream((prevStream) => {
                    const stream = prevStream ?? new MediaStream();
                    event.streams[0]?.getTracks().forEach((track) => {
                        if (
                            !stream.getTracks().some((t) => t.id === track.id)
                        ) {
                            stream.addTrack(track);
                        }
                    });
                    return new MediaStream(stream.getTracks());
                });
            };

            pc.onicecandidate = (event) => {
                if (event.candidate && onIceCandidate) {
                    onIceCandidate(event.candidate);
                }
            };

            peerConnectionRef.current = pc;
            return pc;
        },
        []
    );

    const addLocalStream = useCallback((localStream: MediaStream) => {
        const pc = peerConnectionRef.current;
        if (!pc) return;

        localStream.getTracks().forEach((track) => {
            const senders = pc.getSenders();
            const exists = senders.some(
                (sender) => sender.track?.id === track.id
            );
            if (!exists) {
                pc.addTrack(track, localStream);
            }
        });
    }, []);

    // Sets local description and returns the offer to be sent to signaling server
    const createOffer = useCallback(
        async (onError?: (error: unknown) => void) => {
            const pc = peerConnectionRef.current;
            if (!pc) return;

            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                return offer;
            } catch (error) {
                console.error("Failed to create offer:", error);
                onError?.(error);
            }
        },
        []
    );

    // Receives an offer from the signaling server, sets it as remote description, and creates an answer to be sent back
    const createAnswer = useCallback(
        async (onError?: (error: unknown) => void) => {
            const pc = peerConnectionRef.current;
            if (!pc) return;

            try {
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                return answer;
            } catch (error) {
                console.error("Failed to create answer:", error);
                onError?.(error);
            }
        },
        []
    );

    const setRemoteDescription = useCallback(
        async (
            sdp: RTCSessionDescriptionInit,
            onError?: (error: unknown) => void
        ) => {
            const pc = peerConnectionRef.current;
            if (!pc) return;

            try {
                await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            } catch (error) {
                console.error("Failed to set remote description:", error);
                onError?.(error);
            }
        },
        []
    );

    const addIceCandidate = useCallback(
        async (
            candidate: RTCIceCandidateInit | RTCIceCandidate,
            onError?: (error: unknown) => void
        ) => {
            const pc = peerConnectionRef.current;
            if (!pc) return;

            try {
                await pc.addIceCandidate(candidate);
            } catch (error) {
                console.error("Failed to add ICE candidate:", error);
                onError?.(error);
            }
        },
        []
    );

    // Cleanup
    useEffect(() => {
        return () => {
            closePeerConnection();
        };
    }, [closePeerConnection]);

    return {
        remoteStream,
        initializePeerConnection,
        addLocalStream,
        createOffer,
        createAnswer,
        setRemoteDescription,
        addIceCandidate,
        closePeerConnection
    };
};
