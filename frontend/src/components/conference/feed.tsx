import { useEffect, useRef } from "react";

type FeedProps = {
    stream: MediaStream | null;
};

const Feed: React.FC<FeedProps> = function ({ stream }) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current !== null) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <video className="rotate-y-180" autoPlay playsInline ref={videoRef} />
    );
};

export default Feed;
