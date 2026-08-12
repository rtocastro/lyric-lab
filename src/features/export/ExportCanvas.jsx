import {
    useEffect,
    useRef,
    useState,
} from "react";
import getMediaDrawRect from "./getMediaDrawRect";
import drawCanvasLyric from "./drawCanvasLyric";
import getLyricAnimationState from "../preview/getLyricAnimationState";

function ExportCanvas({
    width = 1920,
    height = 1080,
    visuals,
    currentTime = 0,
    text = "",
    style,
    animation,
    lyricStart = null,
    lyricEnd = null,
}) {
    const canvasRef = useRef(null);
    const imageRef = useRef(null);
    const videoRef = useRef(null);


    const [backgroundVideoUrl, setBackgroundVideoUrl] =
        useState("");
    const [imageReady, setImageReady] =
        useState(false);
    const [isTestRecording, setIsTestRecording] =
        useState(false);

    const currentVisuals = {
        backgroundType: "color",
        backgroundColor: "#000000",
        backgroundImage: null,
        backgroundVideo: null,
        fit: "cover",
        position: "center",
        ...visuals,
    };

    const animationState =
        getLyricAnimationState({
            currentTime,
            lyricStart,
            lyricEnd,
            animation,
        });

    useEffect(() => {
        if (
            currentVisuals.backgroundType !== "color"
        ) {
            return;
        }

        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const context = canvas.getContext("2d");

        if (!context) {
            return;
        }

        canvas.width = width;
        canvas.height = height;

        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        context.fillStyle =
            currentVisuals.backgroundColor;

        context.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        drawCanvasLyric({
            context,
            canvas,
            text,
            style,
            animation,
            animationState,
        });
    }, [
        width,
        height,
        currentVisuals.backgroundType,
        currentVisuals.backgroundColor,
        text,
        style,
        animation,
        currentTime,
    ]);

    useEffect(() => {
        if (
            currentVisuals.backgroundType !== "image" ||
            !(currentVisuals.backgroundImage instanceof Blob)
        ) {
            imageRef.current = null;
            setImageReady(false);

            return undefined;
        }

        const objectUrl = URL.createObjectURL(
            currentVisuals.backgroundImage
        );

        const image = new Image();

        imageRef.current = image;
        setImageReady(false);

        image.onload = () => {
            setImageReady(true);
        };

        image.onerror = () => {
            console.error(
                "Export background image could not load."
            );

            setImageReady(false);
        };

        image.src = objectUrl;

        return () => {
            image.onload = null;
            image.onerror = null;

            if (imageRef.current === image) {
                imageRef.current = null;
            }

            URL.revokeObjectURL(objectUrl);
        };
    }, [
        currentVisuals.backgroundType,
        currentVisuals.backgroundImage,
    ]);



    useEffect(() => {
        if (
            currentVisuals.backgroundType !== "image" ||
            !imageReady
        ) {
            return;
        }


        const canvas = canvasRef.current;
        const image = imageRef.current;

        if (!canvas || !image) {
            return;
        }

        const context = canvas.getContext("2d");

        if (!context) {
            return;
        }

        const rect = getMediaDrawRect({
            sourceWidth: image.naturalWidth,
            sourceHeight: image.naturalHeight,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            fit: currentVisuals.fit,
            position: currentVisuals.position,
        });

        if (!rect) {
            return;
        }

        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        context.fillStyle = "#000000";

        context.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        context.drawImage(
            image,
            rect.x,
            rect.y,
            rect.width,
            rect.height
        );

        drawCanvasLyric({
            context,
            canvas,
            text,
            style,
            animation,
            animationState,
        });
    }, [
        imageReady,
        currentTime,
        currentVisuals.backgroundType,
        currentVisuals.fit,
        currentVisuals.position,
        width,
        height,
        text,
        style,
        animation,
    ]);

    useEffect(() => {
        if (
            currentVisuals.backgroundType !== "video" ||
            !(currentVisuals.backgroundVideo instanceof Blob)
        ) {
            setBackgroundVideoUrl("");
            return undefined;
        }

        const objectUrl = URL.createObjectURL(
            currentVisuals.backgroundVideo
        );

        setBackgroundVideoUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [
        currentVisuals.backgroundType,
        currentVisuals.backgroundVideo,
    ]);

    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (
            currentVisuals.backgroundType !== "video" ||
            !backgroundVideoUrl ||
            !video ||
            !canvas
        ) {
            return undefined;
        }

        const context = canvas.getContext("2d");

        if (!context) {
            return undefined;
        }

        const drawVideoFrame = () => {
            if (
                video.readyState < 2 ||
                !video.videoWidth ||
                !video.videoHeight
            ) {
                return;
            }

            const rect = getMediaDrawRect({
                sourceWidth: video.videoWidth,
                sourceHeight: video.videoHeight,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                fit: currentVisuals.fit,
                position: currentVisuals.position,
            });

            if (!rect) {
                return;
            }

            context.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            context.fillStyle = "#000000";
            context.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            context.drawImage(
                video,
                rect.x,
                rect.y,
                rect.width,
                rect.height
            );

            drawCanvasLyric({
                context,
                canvas,
                text,
                style,
                animation,
                animationState,
            });
        };

        const seekToCurrentTime = () => {
            if (
                !Number.isFinite(video.duration) ||
                video.duration <= 0
            ) {
                return;
            }

            let targetTime =
                currentTime % video.duration;

            /*
             * At exactly 0 some browsers have metadata
             * but haven't decoded a drawable frame yet.
             */
            if (targetTime < 0.05) {
                targetTime = Math.min(
                    0.05,
                    video.duration
                );
            }

            if (
                Math.abs(
                    video.currentTime - targetTime
                ) < 0.01
            ) {
                drawVideoFrame();
                return;
            }

            video.currentTime = targetTime;
        };

        const handleLoadedData = () => {
            seekToCurrentTime();
        };

        const handleSeeked = () => {
            drawVideoFrame();
        };

        video.addEventListener(
            "loadeddata",
            handleLoadedData
        );

        video.addEventListener(
            "seeked",
            handleSeeked
        );

        if (video.readyState >= 2) {
            seekToCurrentTime();
        }

        return () => {
            video.removeEventListener(
                "loadeddata",
                handleLoadedData
            );

            video.removeEventListener(
                "seeked",
                handleSeeked
            );
        };
    }, [
        backgroundVideoUrl,
        currentTime,
        currentVisuals.backgroundType,
        currentVisuals.fit,
        currentVisuals.position,
        width,
        height,
        text,
        style,
        animation,
    ]);

    const handleTestRecording = () => {
        const canvas = canvasRef.current;

        if (
            !canvas ||
            typeof canvas.captureStream !== "function"
        ) {
            console.error(
                "Canvas recording is not supported in this browser."
            );
            return;
        }

        if (
            typeof MediaRecorder === "undefined"
        ) {
            console.error(
                "MediaRecorder is not supported in this browser."
            );
            return;
        }

        const stream =
            canvas.captureStream(30);

        const mimeType =
            MediaRecorder.isTypeSupported(
                "video/webm;codecs=vp9"
            )
                ? "video/webm;codecs=vp9"
                : MediaRecorder.isTypeSupported(
                    "video/webm;codecs=vp8"
                )
                    ? "video/webm;codecs=vp8"
                    : "video/webm";

        const recorder =
            new MediaRecorder(stream, {
                mimeType,
                videoBitsPerSecond: 8_000_000,
            });

        const chunks = [];

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        recorder.onerror = (event) => {
            console.error(
                "Test export recording failed:",
                event
            );

            setIsTestRecording(false);
        };

        recorder.onstop = () => {
            const blob = new Blob(
                chunks,
                {
                    type: mimeType,
                }
            );

            const downloadUrl =
                URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = downloadUrl;
            link.download =
                "lyric-lab-test.webm";

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            setTimeout(() => {
                URL.revokeObjectURL(
                    downloadUrl
                );
            }, 1000);

            stream
                .getTracks()
                .forEach((track) => {
                    track.stop();
                });

            setIsTestRecording(false);
        };

        setIsTestRecording(true);

        recorder.start();

        setTimeout(() => {
            if (
                recorder.state !== "inactive"
            ) {
                recorder.stop();
            }
        }, 5000);
    };

    return (
        <>
            {backgroundVideoUrl && (
                <video
                    ref={videoRef}
                    src={backgroundVideoUrl}
                    muted
                    playsInline
                    preload="auto"
                    style={{
                        position: "fixed",
                        left: "-9999px",
                        top: 0,
                        width: "1px",
                        height: "1px",
                        opacity: 0,
                        pointerEvents: "none",
                    }}
                />
            )}

            <canvas
                ref={canvasRef}
                className="export-canvas"
                width={width}
                height={height}
            />

            <button
                type="button"
                onClick={handleTestRecording}
                disabled={isTestRecording}
            >
                {isTestRecording
                    ? "Recording 5s..."
                    : "Record 5s Test"}
            </button>
        </>
    );
}



export default ExportCanvas;