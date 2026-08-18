import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useSocket } from "@/hooks/use-socket";
import { useConference } from "@/hooks/use-conference";
import { useUserMedia } from "@/hooks/use-user-media";
import {
    Mic,
    MicOff,
    Video as VideoIcon,
    VideoOff,
    PhoneOff,
    Users,
    Loader2,
    Wifi,
    WifiOff,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getConferenceById } from "@/api/conference";

type ConferencePageParams = {
    conference_id: string;
};

type ConferenceSignalPayload = {
    sdp?: RTCSessionDescriptionInit["sdp"];
    type?: RTCSessionDescriptionInit["type"];
    iceCandidate?: RTCIceCandidateInit | RTCIceCandidate;
};

// --- COMPONENTS FOR DIFFERENT STATES ---

const FetchingConferenceLoader = () => {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                <p className="text-zinc-400 font-medium animate-pulse">
                    Loading conference details...
                </p>
            </div>
        </div>
    );
};
const ConferenceFetchErrorScreen = () => {
    const navigate = useNavigate();

    return (
        <div className="relative flex h-screen w-full items-center justify-center bg-[#0a0a0a] p-4 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-125 w-125 rounded-full bg-red-600/5 blur-[100px]" />

            <Card className="relative z-10 w-full max-w-md p-8 shadow-2xl border-white/10 bg-zinc-900/60 backdrop-blur-xl rounded-2xl text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 shadow-inner ring-1 ring-red-500/20">
                    <AlertCircle className="h-10 w-10 text-red-500" />
                </div>

                <h1 className="mb-2 text-2xl font-bold text-white tracking-tight">
                    Room Not Found
                </h1>
                <p className="mb-4 text-zinc-400 text-sm leading-relaxed">
                    We couldn't load the details for this conference. The
                    meeting may have ended, or the link is invalid.
                </p>

                <Button
                    onClick={() => navigate("/dashboard")}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl py-6 font-medium transition-colors"
                >
                    Return to Dashboard
                </Button>
            </Card>
        </div>
    );
};
const ConferenceJoinErrorScreen = ({ error }: { error: string }) => {
    const navigate = useNavigate();

    return (
        <div className="relative flex h-screen w-full items-center justify-center bg-[#0a0a0a] p-4 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-125 w-125 rounded-full bg-red-600/5 blur-[100px]" />

            <Card className="relative z-10 w-full max-w-md p-8 shadow-2xl border-white/10 bg-zinc-900/60 backdrop-blur-xl rounded-2xl text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 shadow-inner ring-1 ring-red-500/20">
                    <AlertCircle className="h-10 w-10 text-red-500" />
                </div>

                <h1 className="mb-2 text-2xl font-bold text-white tracking-tight">
                    Unable to Join
                </h1>
                <p className="mb-4 text-zinc-400 text-sm leading-relaxed">
                    {error}
                </p>

                <Button
                    onClick={() => navigate("/dashboard")}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl py-6 font-medium transition-colors"
                >
                    Return to Dashboard
                </Button>
            </Card>
        </div>
    );
};
const ConferencePreJoinScreen = ({
    conference,
    conferenceId,
    handleJoin,
    cameraError
}: {
    conference: { title: string } | undefined;
    conferenceId: string | undefined;
    handleJoin: () => void;
    cameraError: Error | null;
}) => {
    return (
        <div className="relative flex h-screen w-full items-center justify-center bg-[#0a0a0a] p-4 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-125 w-125 rounded-full bg-blue-600/10 blur-[100px]" />

            <Card className="relative z-10 w-full max-w-md p-8 shadow-2xl border-white/10 bg-zinc-900/60 backdrop-blur-xl rounded-2xl">
                <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-tr from-blue-600/20 to-indigo-600/20 shadow-inner ring-1 ring-white/10">
                    <Users className="h-10 w-10 text-blue-400" />
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-zinc-300 text-4xl font-bold">
                        {conference?.title}
                    </h1>

                    <Badge
                        variant="secondary"
                        className="mt-3 bg-zinc-800/50 text-zinc-300 border-zinc-700/50"
                    >
                        Room ID: {conferenceId}
                    </Badge>
                </div>

                {cameraError && (
                    <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 text-center">
                        Failed to access camera/microphone. Please check your
                        browser permissions.
                    </div>
                )}

                <Button
                    size="lg"
                    onClick={handleJoin}
                    className="w-full cursor-pointer bg-linear-to-r from-blue-600 to-indigo-600 py-6 text-lg font-semibold hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] rounded-xl"
                >
                    Join Conference
                </Button>
            </Card>
        </div>
    );
};

export default function ConferencePage() {
    const { conference_id: conferenceId } = useParams<ConferencePageParams>();
    const navigate = useNavigate();

    const [hasJoined, setHasJoined] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [joinError, setJoinError] = useState<string | null>(null);

    const {
        data: conference,
        isFetching: isFetchingConference,
        isError: isConferenceFetchError
    } = useQuery({
        queryKey: ["get-conference", conferenceId],
        queryFn: async () => getConferenceById(conferenceId ?? "")
    });

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const {
        userMediaStream,
        requestUserMedia,
        stopUserMedia,
        isPermissionGranted,
        error: cameraError
    } = useUserMedia();

    // Clean up media stream on component unmount
    useEffect(() => {
        return () => {
            stopUserMedia();
        };
    }, [stopUserMedia]);

    const {
        remoteStream,
        initializePeerConnection,
        addLocalStream,
        createOffer,
        createAnswer,
        setRemoteDescription,
        addIceCandidate,
        closePeerConnection
    } = useConference();

    // Socket Event Handler for Signaling
    const handleSocketEvent = useCallback(
        async (
            emitEvent: (event: string, data?: unknown) => void,
            event: string,
            data: unknown
        ) => {
            const payload = (data ?? {}) as ConferenceSignalPayload;

            switch (event) {
                case "conference:join-failed": {
                    const code = (payload as any)?.code;

                    if (code === "ALREADY_IN_CONFERENCE") {
                        setJoinError("You are already in another conference.");
                    } else if (code === "ALREADY_JOINED") {
                        setJoinError(
                            "You have already joined this conference."
                        );
                    } else if (code === "CONFERENCE_FULL") {
                        setJoinError(
                            "This conference room is full. Maximum of 2 participants allowed."
                        );
                    }

                    break;
                }

                case "conference:new-user-joined": {
                    const offer = await createOffer();

                    if (offer) {
                        emitEvent("conference:offer", {
                            conference_id: conferenceId,
                            sdp: offer.sdp,
                            type: offer.type
                        });
                    }

                    break;
                }

                case "conference:offer": {
                    await setRemoteDescription({
                        sdp: payload.sdp,
                        type: "offer"
                    });

                    const answer = await createAnswer();

                    if (answer) {
                        emitEvent("conference:answer", {
                            conference_id: conferenceId,
                            sdp: answer.sdp
                        });
                    }

                    break;
                }

                case "conference:answer": {
                    await setRemoteDescription({
                        sdp: payload.sdp,
                        type: "answer"
                    });

                    break;
                }

                case "conference:ice-candidate": {
                    if (payload.iceCandidate) {
                        await addIceCandidate(payload.iceCandidate);
                    }

                    break;
                }

                case "conference:user-left": {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = null;
                    }

                    break;
                }
            }
        },
        [
            createOffer,
            conferenceId,
            setRemoteDescription,
            createAnswer,
            addIceCandidate,
            closePeerConnection,
            initializePeerConnection,
            addLocalStream,
            userMediaStream
            // socket
        ]
    );

    const {
        connect: connectSocket,
        disconnect: disconnectSocket,
        emitEvent,
        isConnected: isSocketConnected
    } = useSocket({
        onConnect: (_, emit) => {
            console.log("Connected to signaling server");
            emit("conference:join", { conference_id: conferenceId });
        },
        onEvent: handleSocketEvent
    });

    // Cleanup resources if connection errors out during join constraints
    useEffect(() => {
        if (joinError) {
            stopUserMedia();
            disconnectSocket();
        }
    }, [joinError, stopUserMedia, disconnectSocket]);

    // Handle joining the room
    const handleJoin = async () => {
        await requestUserMedia();
        setHasJoined(true);
        connectSocket();
    };

    // Handle hanging up
    const handleLeave = () => {
        if (conferenceId && isSocketConnected) {
            emitEvent("conference:leave", { conference_id: conferenceId });
        }

        stopUserMedia();
        closePeerConnection();
        disconnectSocket();
        setHasJoined(false);
        navigate("/dashboard");
    };

    // Initialize PeerConnection once media is ready
    useEffect(() => {
        if (hasJoined && userMediaStream) {
            initializePeerConnection(undefined, (candidate) => {
                emitEvent("conference:ice-candidate", {
                    conference_id: conferenceId,
                    iceCandidate: candidate
                });
            });
            addLocalStream(userMediaStream);
        }
    }, [
        hasJoined,
        userMediaStream,
        initializePeerConnection,
        addLocalStream,
        emitEvent,
        conferenceId
    ]);

    // Attach streams to video elements
    useEffect(() => {
        if (localVideoRef.current && userMediaStream) {
            localVideoRef.current.srcObject = userMediaStream;
        }
    }, [userMediaStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    // Media Toggle Handlers
    const toggleMic = () => {
        if (userMediaStream) {
            const audioTrack = userMediaStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMicOn(audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (userMediaStream) {
            const videoTrack = userMediaStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOn(videoTrack.enabled);
            }
        }
    };

    if (isFetchingConference) {
        return <FetchingConferenceLoader />;
    }
    if (isConferenceFetchError || !conference) {
        return <ConferenceFetchErrorScreen />;
    }
    if (joinError) {
        return <ConferenceJoinErrorScreen error={joinError} />;
    }
    if (!hasJoined) {
        return (
            <ConferencePreJoinScreen
                cameraError={cameraError}
                conference={conference}
                conferenceId={conferenceId}
                handleJoin={handleJoin}
            />
        );
    }

    console.log("Local Stream:", userMediaStream);
    console.log("Remote Stream:", remoteStream);

    // --- RENDER ACTIVE CONFERENCE ---
    return (
        <div className="relative flex h-screen w-full flex-col bg-[#0a0a0a] text-zinc-100 overflow-hidden">
            {/* Header */}
            <header className="absolute top-0 w-full z-20 flex h-20 items-center justify-between px-6 bg-linear-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/80 backdrop-blur-md ring-1 ring-white/10">
                        <Users className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold text-white leading-tight">
                            {conference?.title || "Conference Room"}
                        </h1>
                        <p className="text-xs text-zinc-400 font-mono">
                            {conferenceId}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 rounded-full bg-zinc-900/60 backdrop-blur-md px-3 py-1.5 ring-1 ring-white/10 shadow-sm">
                    {isSocketConnected ? (
                        <>
                            <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-xs font-medium text-zinc-300">
                                Connected
                            </span>
                        </>
                    ) : (
                        <>
                            <WifiOff className="h-3.5 w-3.5 text-red-500" />
                            <span className="text-xs font-medium text-red-400">
                                Reconnecting...
                            </span>
                        </>
                    )}
                </div>
            </header>

            {/* Main Video Area */}
            <main className="flex-1 w-full h-full p-4 pt-24 pb-32">
                <div className="relative mx-auto h-full max-w-7xl overflow-hidden rounded-3xl bg-zinc-900/50 ring-1 ring-white/5 shadow-2xl">
                    {/* Remote Stream Container (Only visible when remote joins) */}
                    {remoteStream && (
                        <div className="absolute inset-0 z-10 bg-zinc-950">
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute top-6 left-6 z-20 flex items-center gap-2 rounded-lg bg-black/40 px-3 py-1.5 backdrop-blur-md border border-white/10 shadow-sm">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                <span className="text-sm font-medium text-white">
                                    Remote Peer
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Local Stream Container (Dynamic styles switch it from Full Screen to PiP) */}
                    <div
                        className={`transition-all duration-700 ease-in-out ${
                            remoteStream
                                ? "absolute bottom-6 right-6 z-30 h-48 w-32 sm:h-64 sm:w-44 md:h-72 md:w-56 rounded-2xl shadow-2xl ring-2 ring-white/10 overflow-hidden hover:scale-[1.02]"
                                : "absolute inset-0 z-10"
                        }`}
                    >
                        {isPermissionGranted ? (
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className={`h-full w-full object-cover transition-opacity duration-500 ${isVideoOn ? "opacity-100" : "opacity-0"}`}
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                                <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
                            </div>
                        )}

                        {/* Video Off Fallback */}
                        {!isVideoOn && (
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/95 backdrop-blur-sm">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
                                    <VideoOff className="h-6 w-6 text-zinc-400" />
                                </div>
                            </div>
                        )}

                        {/* "Waiting for others" Overlay (Only shows when local is full screen) */}
                        {!remoteStream && (
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center backdrop-blur-[2px] pointer-events-none">
                                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-zinc-800/80 mb-6 ring-1 ring-white/10 shadow-2xl">
                                    <div className="absolute inset-0 rounded-full border-[3px] border-blue-500/30 border-t-blue-500 animate-spin" />
                                    <Users className="h-8 w-8 text-zinc-300" />
                                </div>
                                <h2 className="text-2xl font-semibold text-white mb-2 shadow-black drop-shadow-md">
                                    Waiting for others to join
                                </h2>
                                <p className="text-zinc-300 font-medium shadow-black drop-shadow-md">
                                    You're the only one here right now
                                </p>
                            </div>
                        )}

                        {/* 'You' Badge */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-black/50 px-2.5 py-1.5 backdrop-blur-md border border-white/10 shadow-sm">
                            <span className="text-xs font-medium text-white">
                                You
                            </span>
                            {!isMicOn && (
                                <MicOff className="h-3.5 w-3.5 text-red-400" />
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating Controls Dock */}
            <footer className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-900/80 px-4 py-3 rounded-full border border-white/10 shadow-2xl backdrop-blur-xl z-30">
                <Button
                    variant={isMicOn ? "secondary" : "destructive"}
                    size="icon"
                    className={`h-12 w-12 rounded-full transition-all hover:scale-105 ${isMicOn ? "bg-zinc-800 hover:bg-zinc-700 text-white" : ""}`}
                    onClick={toggleMic}
                >
                    {isMicOn ? (
                        <Mic className="h-5 w-5" />
                    ) : (
                        <MicOff className="h-5 w-5" />
                    )}
                </Button>

                <Button
                    variant={isVideoOn ? "secondary" : "destructive"}
                    size="icon"
                    className={`h-12 w-12 rounded-full transition-all hover:scale-105 ${isVideoOn ? "bg-zinc-800 hover:bg-zinc-700 text-white" : ""}`}
                    onClick={toggleVideo}
                >
                    {isVideoOn ? (
                        <VideoIcon className="h-5 w-5" />
                    ) : (
                        <VideoOff className="h-5 w-5" />
                    )}
                </Button>

                <div className="w-px h-8 bg-white/10 mx-1" />

                <Button
                    variant="destructive"
                    className="h-12 px-6 rounded-full bg-red-600 hover:bg-red-500 font-semibold shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all hover:scale-105 gap-2"
                    onClick={handleLeave}
                >
                    <PhoneOff className="h-4 w-4" />
                    <span>Leave</span>
                </Button>
            </footer>
        </div>
    );
}
