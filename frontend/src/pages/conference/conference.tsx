import { useEffect, useState, useCallback, useRef } from "react";
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
    AlertCircle,
    LockIcon
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getConferenceById, getConferenceJoinToken } from "@/api/conference";
import { toast } from "sonner";

const FullScreenCard = ({
    color = "red",
    icon: Icon,
    title,
    children
}: any) => {
    const isError = color === "red";
    return (
        <div className="relative flex h-screen w-full items-center justify-center bg-[#0a0a0a] p-4 overflow-hidden">
            <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-125 w-125 rounded-full blur-[100px] ${isError ? "bg-red-600/5" : "bg-blue-600/10"}`}
            />
            <Card className="relative z-10 w-full max-w-md p-8 shadow-2xl border-white/10 bg-zinc-900/60 backdrop-blur-xl rounded-2xl text-center">
                <div
                    className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl shadow-inner ring-1 ${isError ? "bg-red-500/10 ring-red-500/20 text-red-500" : "bg-linear-to-tr from-blue-600/20 to-indigo-600/20 ring-white/10 text-blue-400"}`}
                >
                    <Icon className="h-10 w-10" />
                </div>
                <h1 className="mb-4 text-2xl font-bold text-white tracking-tight">
                    {title}
                </h1>
                {children}
            </Card>
        </div>
    );
};

export const PasscodeInputScreen = ({
    open,
    conference,
    onJoin,
    onCancel,
    isJoining,
    error
}: any) => {
    const [passcode, setPasscode] = useState("");

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) =>
                !isOpen &&
                !isJoining &&
                (onCancel(), setTimeout(() => setPasscode(""), 200))
            }
        >
            <DialogContent
                className="bg-zinc-900/95 backdrop-blur-xl border-white/10 p-8 sm:max-w-md shadow-2xl"
                showCloseButton={!isJoining}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-indigo-600/10 blur-[80px] pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center pt-2">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-tr from-indigo-600/20 to-purple-600/20 shadow-inner ring-1 ring-white/10">
                        <LockIcon className="h-10 w-10 text-indigo-400" />
                    </div>
                    <DialogHeader className="text-center w-full mb-6">
                        <DialogTitle className="text-2xl font-bold text-white mb-2">
                            Enter Passcode
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            <strong className="text-zinc-300 font-medium">
                                {conference?.title || "This conference"}
                            </strong>{" "}
                            is protected. Please enter the passcode to join.
                        </DialogDescription>
                    </DialogHeader>
                </div>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (passcode.trim().length > 0) onJoin(passcode);
                    }}
                    className="relative z-10 space-y-5"
                >
                    <div className="space-y-2">
                        <input
                            type="password"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                            placeholder="Enter conference passcode"
                            className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-center tracking-widest"
                            autoFocus
                            disabled={isJoining}
                        />
                        {error && (
                            <div className="text-red-400 text-sm text-center font-medium animate-in slide-in-from-top-1">
                                {error}
                            </div>
                        )}
                    </div>
                    <DialogFooter className="sm:justify-center">
                        <Button
                            type="submit"
                            disabled={!passcode.trim() || isJoining}
                            className="w-full bg-linear-to-r from-indigo-600 to-purple-600 py-6 text-lg text-white hover:from-indigo-500 hover:to-purple-500 rounded-xl"
                        >
                            {isJoining ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                "Verify & Join"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default function ConferencePage() {
    const { conference_id: conferenceId } = useParams<{
        conference_id: string;
    }>();
    const navigate = useNavigate();

    const [hasJoined, setHasJoined] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [joinError, setJoinError] = useState<string | null>(null);

    const [isPasscodeOpen, setIsPasscodeOpen] = useState(false);
    const [isJoiningWithPasscode, setIsJoiningWithPasscode] = useState(false);
    const [passcodeError, setPasscodeError] = useState<string | null>(null);

    const {
        data: conference,
        isFetching,
        isError
    } = useQuery({
        queryKey: ["get-conference", conferenceId],
        queryFn: () => getConferenceById(conferenceId ?? "")
    });

    const {
        userMediaStream,
        requestUserMedia,
        stopUserMedia,
        isPermissionGranted,
        error: cameraError
    } = useUserMedia();

    const userMediaStreamRef = useRef<MediaStream | null>(null);
    useEffect(() => {
        userMediaStreamRef.current = userMediaStream;
    }, [userMediaStream]);

    useEffect(() => stopUserMedia, [stopUserMedia]);

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

    const handleSocketEvent = useCallback(
        async (emitEvent: any, event: string, payload: any) => {
            const actions: Record<string, () => void | Promise<void>> = {
                "conference:join-failed": () => {
                    setJoinError(
                        {
                            ALREADY_IN_CONFERENCE:
                                "You are already in another conference.",
                            ALREADY_JOINED:
                                "You have already joined this conference.",
                            CONFERENCE_FULL:
                                "Room is full. Max 2 participants allowed."
                        }[payload?.code as string] ||
                            "Unable to join conference."
                    );
                },

                "conference:new-user-joined": async () => {
                    initializePeerConnection(undefined, (cand) =>
                        emitEvent("conference:ice-candidate", {
                            conference_id: conferenceId,
                            iceCandidate: cand
                        })
                    );

                    if (userMediaStreamRef.current) {
                        addLocalStream(userMediaStreamRef.current);
                    }

                    const offer = await createOffer();

                    if (offer) {
                        emitEvent("conference:offer", {
                            conference_id: conferenceId,
                            sdp: offer.sdp,
                            type: offer.type
                        });
                    }
                },

                "conference:offer": async () => {
                    initializePeerConnection(undefined, (cand) =>
                        emitEvent("conference:ice-candidate", {
                            conference_id: conferenceId,
                            iceCandidate: cand
                        })
                    );

                    if (userMediaStreamRef.current) {
                        addLocalStream(userMediaStreamRef.current);
                    }

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
                },

                "conference:answer": async () => {
                    await setRemoteDescription({
                        sdp: payload.sdp,
                        type: "answer"
                    });

                    toast.success("Call connected", {
                        duration: 1750
                    });
                },

                "conference:ice-candidate": () => {
                    if (payload.iceCandidate) {
                        addIceCandidate(payload.iceCandidate);
                    }
                },

                "conference:user-left": async () => {
                    closePeerConnection();
                    toast.info("Participant left.");
                }
            };

            await actions[event]?.();
        },
        [
            conferenceId,
            createOffer,
            createAnswer,
            setRemoteDescription,
            addIceCandidate,
            closePeerConnection,
            initializePeerConnection,
            addLocalStream
        ]
    );

    const { connect, disconnect, emitEvent, isConnected } = useSocket({
        onConnect: (_, emit) =>
            emit("conference:join", { conference_id: conferenceId }),
        onEvent: handleSocketEvent
    });

    useEffect(() => {
        if (joinError) {
            stopUserMedia();
            disconnect();
        }
    }, [joinError, stopUserMedia, disconnect]);

    const handleJoin = useCallback(
        async (passcode?: string) => {
            if (conference?.isPasscodeRequired && !passcode)
                return setIsPasscodeOpen(true);
            if (!isPermissionGranted) await requestUserMedia();

            try {
                if (passcode) setIsJoiningWithPasscode(true);
                setPasscodeError(null);

                const joinToken = await getConferenceJoinToken(
                    conferenceId ?? "",
                    passcode
                );
                connect({ join_token: joinToken, conference_id: conferenceId });
                setHasJoined(true);
                setIsPasscodeOpen(false);
            } catch (err: any) {
                if (err?.response?.data?.code === "INVALID_PASSCODE")
                    setPasscodeError("Incorrect passcode.");
                else toast.error("Error connecting to room.");
            } finally {
                setIsJoiningWithPasscode(false);
            }
        },
        [
            conference,
            isPermissionGranted,
            requestUserMedia,
            conferenceId,
            connect
        ]
    );

    const handleLeave = () => {
        if (isConnected)
            emitEvent("conference:leave", { conference_id: conferenceId });
        stopUserMedia();
        closePeerConnection();
        disconnect();
        navigate("/dashboard");
    };

    useEffect(() => {
        if (hasJoined && userMediaStream) {
            initializePeerConnection(undefined, (cand) =>
                emitEvent("conference:ice-candidate", {
                    conference_id: conferenceId,
                    iceCandidate: cand
                })
            );
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

    const toggleTrack = (
        kind: "audio" | "video",
        setFn: (val: boolean) => void
    ) => {
        const track = userMediaStream?.getTracks().find((t) => t.kind === kind);
        if (track) setFn((track.enabled = !track.enabled));
    };

    // --- Pre Join States ---
    if (isFetching) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a]">
                <div className="flex flex-col items-center gap-4 text-zinc-400 font-medium animate-pulse">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />{" "}
                    Loading conference details...
                </div>
            </div>
        );
    }
    if (isError || !conference) {
        return (
            <FullScreenCard title="Room Not Found" icon={AlertCircle}>
                <p className="mb-4 text-zinc-400 text-sm">
                    We couldn't load the details. The meeting may have ended.
                </p>
                <Button
                    onClick={() => navigate("/dashboard")}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl py-6"
                >
                    Return to Dashboard
                </Button>
            </FullScreenCard>
        );
    }
    if (joinError) {
        return (
            <FullScreenCard title="Unable to Join" icon={AlertCircle}>
                <p className="mb-4 text-zinc-400 text-sm">{joinError}</p>
                <Button
                    onClick={() => navigate("/dashboard")}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl py-6"
                >
                    Return to Dashboard
                </Button>
            </FullScreenCard>
        );
    }
    if (!hasJoined) {
        return (
            <>
                <FullScreenCard
                    title={conference?.title}
                    icon={Users}
                    color="blue"
                >
                    <Badge
                        variant="secondary"
                        className="mb-8 bg-zinc-800/50 text-zinc-300 border-zinc-700/50"
                    >
                        Conference ID: {conferenceId}
                    </Badge>

                    {cameraError && (
                        <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
                            Failed to access camera/microphone. Check
                            permissions.
                        </div>
                    )}

                    <Button
                        size="lg"
                        onClick={() => handleJoin()}
                        className="w-full rounded-xl border border-white/15 bg-linear-to-r from-blue-600 to-indigo-600 py-6 text-base font-medium tracking-wide text-white shadow-[0_10px_20px_-5px_rgba(79,70,229,0.3)] ring-1 ring-inset ring-white/10 transition-all duration-200 hover:brightness-110 hover:shadow-[0_15px_25px_-5px_rgba(79,70,229,0.4)] active:scale-[0.99] active:brightness-95"
                    >
                        Join Conference
                    </Button>
                </FullScreenCard>

                <PasscodeInputScreen
                    open={isPasscodeOpen}
                    conference={conference}
                    onJoin={handleJoin}
                    onCancel={() => {
                        setIsPasscodeOpen(false);
                        setPasscodeError(null);
                    }}
                    isJoining={isJoiningWithPasscode}
                    error={passcodeError}
                />
            </>
        );
    }

    // --- Active Conference ---
    return (
        <div className="relative flex h-screen w-full flex-col bg-[#0a0a0a] text-zinc-100 overflow-hidden">
            <header className="absolute top-0 w-full z-20 flex h-18 items-center justify-between px-4 bg-linear-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/80 backdrop-blur-md ring-1 ring-white/10">
                        <Users className="h-5 w-5 text-blue-400" />
                    </div>

                    <div>
                        <h1 className="text-sm font-semibold leading-tight">
                            {conference?.title || "Conference Room"}
                        </h1>

                        <p className="text-xs text-zinc-400 font-mono">
                            {conferenceId}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 rounded-full bg-zinc-900/60 backdrop-blur-md px-3 py-1.5 ring-1 ring-white/10 shadow-sm">
                    {isConnected ? (
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

            <main className="flex-1 w-full h-full p-4 pt-18 pb-26">
                <div className="relative mx-auto h-full max-w-7xl overflow-hidden rounded-3xl bg-zinc-900/50 ring-1 ring-white/5 shadow-2xl">
                    {/* Remote User Media Stream */}
                    {remoteStream && (
                        <div className="absolute inset-0 z-10 bg-zinc-950">
                            <video
                                ref={(n) => {
                                    if (n) n.srcObject = remoteStream;
                                }}
                                autoPlay
                                playsInline
                                className="h-full w-full object-cover rotate-y-180"
                            />

                            <div className="absolute top-6 left-6 z-20 flex items-center gap-2 rounded-lg bg-black/40 px-3 py-1.5 backdrop-blur-md border border-white/10">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                <span className="text-sm font-medium">
                                    Remote Peer
                                </span>
                            </div>
                        </div>
                    )}

                    <div
                        className={`transition-all duration-700 ease-in-out ${remoteStream ? "absolute bottom-4 right-4 z-30 h-48 w-32 sm:h-64 sm:w-44 md:h-72 md:w-56 rounded-2xl shadow-2xl ring-2 ring-white/10 overflow-hidden hover:scale-[1.02]" : "absolute inset-0 z-10"}`}
                    >
                        {/* Current User Media Stream */}
                        {isPermissionGranted ? (
                            <video
                                ref={(n) => {
                                    if (n) n.srcObject = userMediaStream;
                                }}
                                autoPlay
                                playsInline
                                muted
                                className={`h-full w-full object-cover rotate-y-180 transition-opacity duration-500 ${isVideoOn ? "opacity-100" : "opacity-0"}`}
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                                <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
                            </div>
                        )}

                        {!isVideoOn && (
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/95 backdrop-blur-sm">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
                                    <VideoOff className="h-6 w-6 text-zinc-400" />
                                </div>
                            </div>
                        )}

                        {!remoteStream && (
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center backdrop-blur-[2px] pointer-events-none">
                                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-zinc-800/80 mb-6 ring-1 ring-white/10 shadow-2xl">
                                    <div className="absolute inset-0 rounded-full border-[3px] border-blue-500/30 border-t-blue-500 animate-spin" />
                                    <Users className="h-8 w-8 text-zinc-300" />
                                </div>
                                <h2 className="text-2xl font-semibold mb-2 drop-shadow-md">
                                    Waiting for other participant to join
                                </h2>
                                <p className="text-zinc-300 font-medium drop-shadow-md">
                                    You're the only one here right now
                                </p>
                            </div>
                        )}

                        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-black/50 px-2.5 py-1.5 backdrop-blur-md border border-white/10">
                            <span className="text-xs font-medium">You</span>
                            {!isMicOn && (
                                <MicOff className="h-3.5 w-3.5 text-red-400" />
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-900/80 px-4 py-3 rounded-full border border-white/10 shadow-2xl backdrop-blur-xl z-30">
                <Button
                    variant={isMicOn ? "secondary" : "destructive"}
                    size="icon"
                    onClick={() => toggleTrack("audio", setIsMicOn)}
                    className={`h-12 w-12 rounded-full transition-all hover:scale-105 ${isMicOn && "bg-zinc-800 text-white"}`}
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
                    onClick={() => toggleTrack("video", setIsVideoOn)}
                    className={`h-12 w-12 rounded-full transition-all hover:scale-105 ${isVideoOn && "bg-zinc-800 text-white"}`}
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
                    onClick={handleLeave}
                    className="h-12 px-6 rounded-full bg-red-600 hover:bg-red-500 font-semibold transition-all hover:scale-105 gap-2"
                >
                    <PhoneOff className="h-4 w-4" /> <span>Leave</span>
                </Button>
            </footer>
        </div>
    );
}
