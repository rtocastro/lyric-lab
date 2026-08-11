function clamp01(value) {
    return Math.min(Math.max(value, 0), 1);
}

function getLyricAnimationState({
    currentTime,
    lyricStart,
    lyricEnd,
    animation,
}) {
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

    if (!hasLyricTiming) {
        return {
            isInIntro: false,
            isInOutro: false,
            introProgress: 1,
            outroProgress: 0,
            activeAnimationProgress: 1,
            activeAnimationDuration:
                currentAnimation.introDuration,
        };
    }

    const timeSinceLyricStart = Math.max(
        0,
        currentTime - lyricStart
    );

    const timeUntilLyricEnd = Math.max(
        0,
        lyricEnd - currentTime
    );

    const isInIntro =
        timeSinceLyricStart <
        currentAnimation.introDuration;

    const isInOutro =
        timeUntilLyricEnd <=
        currentAnimation.outroDuration;

    const introProgress =
        currentAnimation.introDuration > 0
            ? clamp01(
                timeSinceLyricStart /
                currentAnimation.introDuration
            )
            : 1;

    const outroProgress =
        currentAnimation.outroDuration > 0
            ? clamp01(
                1 -
                timeUntilLyricEnd /
                currentAnimation.outroDuration
            )
            : 0;

    const activeAnimationDuration =
        isInOutro
            ? currentAnimation.outroDuration
            : currentAnimation.introDuration;

    const activeAnimationProgress =
        isInOutro
            ? outroProgress
            : introProgress;

    return {
        isInIntro,
        isInOutro,
        introProgress,
        outroProgress,
        activeAnimationProgress,
        activeAnimationDuration,
    };
}

export default getLyricAnimationState;