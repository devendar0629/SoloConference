import { useState } from "react";

export const useUserMedia = () => {
    const [userMediaStream, setUserMediaStream] = useState<MediaStream | null>(
        null
    );
    const [error, setError] = useState<Error | null>(null);
    const [isPermissionGranted, setIsPermissionGranted] =
        useState<boolean>(false);

    const requestUserMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            setUserMediaStream(stream);
            setIsPermissionGranted(true);
        } catch (err) {
            setIsPermissionGranted(false);
            setError(err as Error);
        }
    };

    const stopUserMedia = () => {
        if (userMediaStream) {
            userMediaStream.getTracks().forEach((track) => track.stop());
            setUserMediaStream(null);
            setIsPermissionGranted(false);
        }
    };

    return {
        userMediaStream,
        isPermissionGranted,
        error,
        requestUserMedia,
        stopUserMedia
    };
};
