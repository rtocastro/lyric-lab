import { useRef } from "react";
import useAutoFitText from "./useAutoFitText";

function PreviewCanvas({
    text,
    lineLabel,
    style,
    animation,
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

    const hasLyricTiming =
        Number.isFinite(lyricStart) &&
        Number.isFinite(lyricEnd) &&
        lyricEnd > lyricStart;

    const timeSinceLyricStart = hasLyricTiming
        ? Math.max(0, currentTime - lyricStart)
        : 0;

    const timeUntilLyricEnd = hasLyricTiming
        ? Math.max(0, lyricEnd - currentTime)
        : Infinity;

    const isInIntro =
        hasLyricTiming &&
        timeSinceLyricStart <
        currentAnimation.introDuration;

    const isInOutro =
        hasLyricTiming &&
        timeUntilLyricEnd <=
        currentAnimation.outroDuration;

    const safeAreaRef = useRef(null);
    const lyricRef = useRef(null);

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
            <div className="preview__canvas">
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
                                animationDuration: `${isInOutro
                                        ? currentAnimation.outroDuration
                                        : currentAnimation.introDuration
                                    }s`,
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