import drawCanvasLyric from "./drawCanvasLyric";
import getLyricAnimationState from "../preview/getLyricAnimationState";

function getActiveLyricAtTime(
    lyrics = [],
    time = 0
) {
    return (
        lyrics.find((lyric) => {
            const start = Number(lyric.start);
            const end = Number(lyric.end);

            return (
                Number.isFinite(start) &&
                Number.isFinite(end) &&
                time >= start &&
                time < end
            );
        }) ?? null
    );
}

function renderExportFrame({
    canvas,
    time = 0,
    lyrics = [],
    style,
    animation,
    drawBackground,
}) {
    if (!canvas) {
        return;
    }

    const context =
        canvas.getContext("2d");

    if (!context) {
        return;
    }

    /*
     * Background rendering is deliberately
     * injected here. That lets color, image,
     * and video all use the exact same
     * deterministic frame renderer.
     */
    if (
        typeof drawBackground ===
        "function"
    ) {
        drawBackground({
            context,
            canvas,
            time,
        });
    }

    const activeLyric =
        getActiveLyricAtTime(
            lyrics,
            time
        );

    if (!activeLyric) {
        return;
    }

    const lyricStart =
        Number(activeLyric.start);

    const lyricEnd =
        Number(activeLyric.end);

    const animationState =
        getLyricAnimationState({
            currentTime: time,
            lyricStart,
            lyricEnd,
            animation,
        });

    drawCanvasLyric({
        context,
        canvas,
        text: activeLyric.text ?? "",
        style,
        animation,
        animationState,
    });
}

export {
    getActiveLyricAtTime,
    renderExportFrame,
};

export default renderExportFrame;