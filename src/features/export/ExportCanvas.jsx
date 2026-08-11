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
            currentVisuals.backgroundType === "color"
                ? currentVisuals.backgroundColor
                : "#000000";

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
    ]);

    useEffect(() => {
        if (
            currentVisuals.backgroundType !== "image" ||
            !(currentVisuals.backgroundImage instanceof Blob)
        ) {
            return undefined;
        }

        const canvas = canvasRef.current;

        if (!canvas) {
            return undefined;
        }

        const context = canvas.getContext("2d");

        if (!context) {
            return undefined;
        }

        const objectUrl = URL.createObjectURL(
            currentVisuals.backgroundImage
        );

        const image = new Image();

        imageRef.current = image;

        image.onload = () => {
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
        };

        image.src = objectUrl;

        return () => {
            imageRef.current = null;
            image.onload = null;
            URL.revokeObjectURL(objectUrl);
        };
    }, [
        currentVisuals.backgroundType,
        currentVisuals.backgroundImage,
        currentVisuals.fit,
        currentVisuals.position,
        width,
        height,
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
    ]);
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
        </>
    );
}



export default ExportCanvas;