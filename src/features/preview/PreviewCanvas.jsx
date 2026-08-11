import {
    useEffect,
    useRef,
    useState,
} from "react";
import useAutoFitText from "./useAutoFitText";
import getLyricAnimationState from "./getLyricAnimationState";


function PreviewCanvas({
    text,
    lineLabel,
    style,
    animation,
    visuals,
    lyricStart = null,
    lyricEnd = null,
    isPlaying = false,
    currentTime = 0,
    duration = 0,
    showHud = true,
    onTogglePlayback,
    hasAudio = true,
}) {
    const currentStyle = {
        fontFamily: "Montserrat",
        fontSize: 72,
        color: "#FFFFFF",
        outlineColor: "#000000",
        outlineWidth: 2,
        shadow: true,
        glow: false,
        position: "center",
        textAlign: "center",
        ...style,
    };

    const currentAnimation = {
        intro: "fade",
        introDuration: 0.3,
        outro: "fade",
        outroDuration: 0.3,
        ...animation,
    };

    const currentVisuals = {
        backgroundType: "color",
        backgroundColor: "#000000",
        backgroundImage: null,
        backgroundVideo: null,
        fit: "cover",
        position: "center",
        ...visuals,
    };

    const [backgroundImageUrl, setBackgroundImageUrl] =
        useState("");

    const [backgroundVideoUrl, setBackgroundVideoUrl] =
        useState("");

    useEffect(() => {
        const backgroundImage =
            currentVisuals.backgroundImage;

        if (
            currentVisuals.backgroundType !== "image" ||
            !(backgroundImage instanceof Blob)
        ) {
            setBackgroundImageUrl("");
            return undefined;
        }

        const objectUrl =
            URL.createObjectURL(backgroundImage);

        setBackgroundImageUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [
        currentVisuals.backgroundType,
        currentVisuals.backgroundImage,
    ]);

    useEffect(() => {
        const backgroundVideo =
            currentVisuals.backgroundVideo;

        if (
            currentVisuals.backgroundType !== "video" ||
            !(backgroundVideo instanceof Blob)
        ) {
            setBackgroundVideoUrl("");
            return undefined;
        }

        const objectUrl =
            URL.createObjectURL(backgroundVideo);

        setBackgroundVideoUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [
        currentVisuals.backgroundType,
        currentVisuals.backgroundVideo,
    ]);

    const {
        isInIntro,
        isInOutro,
        introProgress,
        outroProgress,
        activeAnimationProgress,
        activeAnimationDuration,
    } = getLyricAnimationState({
        currentTime,
        lyricStart,
        lyricEnd,
        animation: currentAnimation,
    });

    const safeAreaRef = useRef(null);
    const lyricRef = useRef(null);
    const backgroundVideoRef = useRef(null);

    useEffect(() => {
        const video = backgroundVideoRef.current;

        if (
            !video ||
            currentVisuals.backgroundType !== "video" ||
            !backgroundVideoUrl
        ) {
            return;
        }

        if (!Number.isFinite(video.duration) || video.duration <= 0) {
            return;
        }

        const targetTime =
            currentTime % video.duration;

        const drift =
            Math.abs(video.currentTime - targetTime);

        if (drift > 0.08) {
            video.currentTime = targetTime;
        }
    }, [
        currentTime,
        currentVisuals.backgroundType,
        backgroundVideoUrl,
    ]);

    useEffect(() => {
        const video = backgroundVideoRef.current;

        if (
            !video ||
            currentVisuals.backgroundType !== "video" ||
            !backgroundVideoUrl
        ) {
            return;
        }

        if (isPlaying) {
            video.play().catch(() => {
                // Some browsers may briefly reject playback
                // while the source is still loading.
            });
        } else {
            video.pause();
        }
    }, [
        isPlaying,
        currentVisuals.backgroundType,
        backgroundVideoUrl,
    ]);

    const renderFontSize = useAutoFitText({
        text,
        requestedFontSize: currentStyle.fontSize,
        containerRef: safeAreaRef,
        lyricRef,
        fontFamily: currentStyle.fontFamily,
        outlineWidth: currentStyle.outlineWidth,
    });

    const progress =
        Number.isFinite(duration) && duration > 0
            ? Math.min((currentTime / duration) * 100, 100)
            : 0;

    const formatPreviewTime = (seconds) => {
        if (!Number.isFinite(seconds)) {
            return "00:00.00";
        }

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${String(minutes).padStart(
            2,
            "0"
        )}:${remainingSeconds
            .toFixed(2)
            .padStart(5, "0")}`;
    };

    const formatDuration = (seconds) => {
        if (!Number.isFinite(seconds)) {
            return "00:00";
        }

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    };

    return (
        <div className="preview">
            <div
                className="preview__canvas"
                style={{
                    backgroundColor:
                        currentVisuals.backgroundType === "color"
                            ? currentVisuals.backgroundColor
                            : "#000000",

                    backgroundImage:
                        currentVisuals.backgroundType === "image" &&
                            backgroundImageUrl
                            ? `url("${backgroundImageUrl}")`
                            : "none",

                    backgroundSize: currentVisuals.fit,
                    backgroundPosition:
                        currentVisuals.position,
                    backgroundRepeat: "no-repeat",
                }}
            >
                {currentVisuals.backgroundType === "video" &&
                    backgroundVideoUrl && (
                        <video
                            ref={backgroundVideoRef}
                            className="preview__background-video"
                            src={backgroundVideoUrl}
                            muted
                            playsInline
                            preload="auto"
                            style={{
                                objectFit: currentVisuals.fit,
                                objectPosition: currentVisuals.position,
                            }}
                            onLoadedMetadata={(event) => {
                                const video = event.currentTarget;

                                if (Number.isFinite(video.duration) && video.duration > 0) {
                                    video.currentTime = Math.min(0.05, video.duration);
                                }
                            }}
                        />
                    )}

                {showHud && (
                    <div className="preview__hud preview__hud--top">
                        <span>Live lyric preview</span>

                        <strong>
                            {isPlaying ? "Playing" : "Paused"}
                        </strong>
                    </div>
                )}

                <div
                    className={[
                        "preview__lyric-stage",
                        text
                            ? "preview__lyric-stage--active"
                            : "",
                        `preview__lyric-stage--${currentStyle.position}`,
                    ]
                        .filter(Boolean)
                        .join(" ")}
                >
                    <span className="preview__eyebrow">
                        {lineLabel ?? "Video Preview"}
                    </span>

                    <div
                        ref={safeAreaRef}
                        className="preview__text-safe-area"
                    >
                        <strong
                            key={`${lineLabel}-${text}`}
                            ref={lyricRef}
                            className={[
                                "preview__lyric",

                                currentStyle.shadow
                                    ? "preview__lyric--shadow"
                                    : "",

                                currentStyle.glow
                                    ? "preview__lyric--glow"
                                    : "",

                                isInOutro && currentAnimation.outro !== "none"
                                    ? `preview__lyric--outro-${currentAnimation.outro}`
                                    : currentAnimation.intro !== "none"
                                        ? `preview__lyric--intro-${currentAnimation.intro}`
                                        : "",
                            ]
                                .filter(Boolean)
                                .join(" ")}
                            style={{
                                fontFamily: currentStyle.fontFamily,
                                fontSize: `${renderFontSize}px`,
                                color: currentStyle.color,
                                WebkitTextStroke:
                                    currentStyle.outlineWidth > 0
                                        ? `${currentStyle.outlineWidth}px ${currentStyle.outlineColor}`
                                        : "none",
                                textAlign: currentStyle.textAlign,
                                animationDuration: `${Math.max(
                                    activeAnimationDuration,
                                    0.001
                                )}s`,

                                animationDelay: `-${activeAnimationProgress *
                                    Math.max(activeAnimationDuration, 0.001)
                                    }s`,

                                animationPlayState: "paused",
                            }}
                        >
                            {text || "Your lyrics will appear here"}
                        </strong>
                    </div>
                </div>

                {showHud && (
                    <div className="preview__hud preview__hud--bottom">
                        <button
                            className="preview__play-button"
                            type="button"
                            onClick={onTogglePlayback}
                            disabled={!hasAudio}
                            aria-label={
                                isPlaying ? "Pause song" : "Play song"
                            }
                        >
                            {isPlaying ? "❚❚" : "▶"}
                        </button>

                        <div className="preview__time">
                            <strong>
                                {formatPreviewTime(currentTime)}
                            </strong>

                            <span>
                                / {formatDuration(duration)}
                            </span>
                        </div>

                        <div className="preview__progress">
                            <div
                                className="preview__progress-fill"
                                style={{
                                    width: `${progress}%`,
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PreviewCanvas;