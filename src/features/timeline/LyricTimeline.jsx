import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import Panel from "../../components/Panel";

function formatTime(seconds, showMilliseconds = false) {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return showMilliseconds ? "00:00.00" : "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (showMilliseconds) {
        return `${String(minutes).padStart(2, "0")}:${remainingSeconds
            .toFixed(2)
            .padStart(5, "0")}`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(
        Math.floor(remainingSeconds)
    ).padStart(2, "0")}`;
}

function getLyricTiming(
    lyrics,
    lyricIndex,
    songDuration
) {
    const lyric = lyrics[lyricIndex];

    if (Number.isFinite(lyric.end)) {
        return {
            effectiveEnd: lyric.end,
            isProvisional: false,
        };
    }

    const nextSyncedLyric = lyrics
        .slice(lyricIndex + 1)
        .find((candidate) =>
            Number.isFinite(candidate.start)
        );

    if (Number.isFinite(nextSyncedLyric?.start)) {
        return {
            effectiveEnd: nextSyncedLyric.start,
            isProvisional: false,
        };
    }

    const provisionalDuration = 2;

    return {
        effectiveEnd: Math.min(
            lyric.start + provisionalDuration,
            Number.isFinite(songDuration)
                ? songDuration
                : lyric.start + provisionalDuration
        ),
        isProvisional: true,
    };
}

function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
}

function clampPercentage(value) {
    return clamp(value, 0, 100);
}

function LyricTimeline({
    lyrics,
    currentTime,
    duration,
    activeLyricId,
    selectedLyricIds,
    primarySelectedLyricId,
    onSeek,
    onSelectLyric,
    onTimingChange,
}) {
    const viewportRef = useRef(null);
    const dragStateRef = useRef(null);

    const [draggingLyricId, setDraggingLyricId] =
        useState(null);

    const timelineLyrics = useMemo(() => {
        if (
            !Array.isArray(lyrics) ||
            !Number.isFinite(duration) ||
            duration <= 0
        ) {
            return [];
        }

        return lyrics
            .map((lyric, index) => {
                if (!Number.isFinite(lyric.start)) {
                    return null;
                }

                const {
                    effectiveEnd,
                    isProvisional,
                } = getLyricTiming(
                    lyrics,
                    index,
                    duration
                );

                const safeEnd = Math.max(
                    effectiveEnd,
                    lyric.start
                );

                const left = clampPercentage(
                    (lyric.start / duration) * 100
                );

                const width = clampPercentage(
                    ((safeEnd - lyric.start) / duration) *
                    100
                );

                return {
                    ...lyric,
                    sourceIndex: index,
                    effectiveEnd: safeEnd,
                    isProvisional,
                    left,
                    width: Math.max(width, 0.35),
                };
            })
            .filter(Boolean);
    }, [lyrics, duration]);

    useEffect(() => {
        const handlePointerMove = (event) => {
            const dragState = dragStateRef.current;

            if (
                !dragState ||
                !Number.isFinite(duration) ||
                duration <= 0
            ) {
                return;
            }

            const pixelDifference =
                event.clientX - dragState.startPointerX;

            const timeDifference =
                (pixelDifference / dragState.viewportWidth) *
                duration;

            if (dragState.edge === "start") {
                const nextStart = clamp(
                    dragState.initialStart + timeDifference,
                    dragState.minimumStart,
                    dragState.maximumStart
                );

                onTimingChange(dragState.lyricId, {
                    start: Number(nextStart.toFixed(3)),
                });
            }

            if (dragState.edge === "end") {
                const nextEnd = clamp(
                    dragState.initialEnd + timeDifference,
                    dragState.minimumEnd,
                    dragState.maximumEnd
                );

                onTimingChange(dragState.lyricId, {
                    end: Number(nextEnd.toFixed(3)),
                });
            }
        };

        const handlePointerUp = () => {
            if (!dragStateRef.current) {
                return;
            }

            dragStateRef.current = null;
            setDraggingLyricId(null);
        };

        window.addEventListener(
            "pointermove",
            handlePointerMove
        );

        window.addEventListener(
            "pointerup",
            handlePointerUp
        );

        window.addEventListener(
            "pointercancel",
            handlePointerUp
        );

        return () => {
            window.removeEventListener(
                "pointermove",
                handlePointerMove
            );

            window.removeEventListener(
                "pointerup",
                handlePointerUp
            );

            window.removeEventListener(
                "pointercancel",
                handlePointerUp
            );
        };
    }, [duration, onTimingChange]);

    const playheadPosition =
        Number.isFinite(duration) && duration > 0
            ? clampPercentage(
                (currentTime / duration) * 100
            )
            : 0;

    const handleClipClick = (event, lyric) => {
        if (dragStateRef.current) {
            return;
        }

        const toggle =
            event.ctrlKey || event.metaKey;

        const range = event.shiftKey;

        onSelectLyric(lyric.id, {
            toggle,
            range,
        });

        if (!toggle && !range) {
            onSeek(lyric.start);
        }
    };

    const handleClipKeyDown = (event, lyric) => {
        if (
            event.key !== "Enter" &&
            event.key !== " "
        ) {
            return;
        }

        event.preventDefault();
        onSelectLyric(lyric.id);
        onSeek(lyric.start);
    };

    const handleResizeStart = (
        event,
        lyric,
        edge
    ) => {
        event.preventDefault();
        event.stopPropagation();

        const viewport = viewportRef.current;

        if (
            !viewport ||
            !Number.isFinite(duration) ||
            duration <= 0
        ) {
            return;
        }

        const lyricIndex = lyric.sourceIndex;

        const previousSyncedLyric = lyrics
            .slice(0, lyricIndex)
            .reverse()
            .find((candidate) =>
                Number.isFinite(candidate.start)
            );

        const nextSyncedLyric = lyrics
            .slice(lyricIndex + 1)
            .find((candidate) =>
                Number.isFinite(candidate.start)
            );

        const minimumStart =
            Number.isFinite(previousSyncedLyric?.start)
                ? previousSyncedLyric.start + 0.01
                : 0;

        const maximumStart = Math.max(
            minimumStart,
            lyric.effectiveEnd - 0.05
        );

        const minimumEnd = lyric.start + 0.05;

        const maximumEnd =
            Number.isFinite(nextSyncedLyric?.start)
                ? nextSyncedLyric.start
                : duration;

        dragStateRef.current = {
            lyricId: lyric.id,
            edge,
            startPointerX: event.clientX,
            viewportWidth:
                viewport.getBoundingClientRect().width,
            initialStart: lyric.start,
            initialEnd: lyric.effectiveEnd,
            minimumStart,
            maximumStart,
            minimumEnd,
            maximumEnd,
        };

        onSelectLyric(lyric.id);
        setDraggingLyricId(lyric.id);
    };

    return (
        <Panel title="Timeline">
            <div className="lyric-timeline">
                <div className="lyric-timeline__ruler">
                    <span>00:00</span>
                    <span>{formatTime(duration / 4)}</span>
                    <span>{formatTime(duration / 2)}</span>
                    <span>
                        {formatTime((duration / 4) * 3)}
                    </span>
                    <span>{formatTime(duration)}</span>
                </div>

                <div
                    ref={viewportRef}
                    className="lyric-timeline__viewport"
                >
                    <div className="lyric-timeline__grid">
                        <div className="lyric-timeline__guide lyric-timeline__guide--25" />
                        <div className="lyric-timeline__guide lyric-timeline__guide--50" />
                        <div className="lyric-timeline__guide lyric-timeline__guide--75" />
                    </div>

                    {timelineLyrics.length === 0 ? (
                        <div className="lyric-timeline__empty">
                            Synchronize lyrics to create timeline
                            clips.
                        </div>
                    ) : (
                        <div className="lyric-timeline__track">
                            {timelineLyrics.map((lyric) => {
                                const isActive =
                                    lyric.id === activeLyricId;

                                const isSelected =
                                    selectedLyricIds.includes(lyric.id);

                                const isPrimarySelected =
                                    lyric.id === primarySelectedLyricId;

                                const isDragging =
                                    lyric.id === draggingLyricId;

                                return (
                                    <div
                                        className={[
                                            "lyric-timeline__clip",
                                            isActive
                                                ? "lyric-timeline__clip--active"
                                                : "",
                                            isSelected
                                                ? "lyric-timeline__clip--selected"
                                                : "",
                                            isPrimarySelected
                                                ? "lyric-timeline__clip--primary"
                                                : "",
                                            lyric.isProvisional
                                                ? "lyric-timeline__clip--provisional"
                                                : "",
                                            isDragging
                                                ? "lyric-timeline__clip--dragging"
                                                : "",
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                        key={lyric.id}
                                        style={{
                                            left: `${lyric.left}%`,
                                            width: `${lyric.width}%`,
                                        }}
                                        role="button"
                                        tabIndex={0}
                                        onClick={(event) =>
                                            handleClipClick(event, lyric)
                                        }
                                        onKeyDown={(event) =>
                                            handleClipKeyDown(
                                                event,
                                                lyric
                                            )
                                        }
                                        title={`${lyric.text}
${formatTime(
                                            lyric.start,
                                            true
                                        )} – ${lyric.isProvisional
                                            ? "Pending next lyric"
                                            : formatTime(
                                                lyric.effectiveEnd,
                                                true
                                            )
                                            }`}
                                    >
                                        {isPrimarySelected && (
                                            <button
                                                className="lyric-timeline__resize-handle lyric-timeline__resize-handle--start"
                                                type="button"
                                                aria-label={`Adjust start of ${lyric.text}`}
                                                title="Drag to adjust start"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                }}
                                                onPointerDown={(event) =>
                                                    handleResizeStart(
                                                        event,
                                                        lyric,
                                                        "start"
                                                    )
                                                }
                                            />
                                        )}

                                        <span className="lyric-timeline__clip-label">
                                            {lyric.text}
                                        </span>

                                        {isPrimarySelected && (
                                            <button
                                                className="lyric-timeline__resize-handle lyric-timeline__resize-handle--end"
                                                type="button"
                                                aria-label={`Adjust end of ${lyric.text}`}
                                                title="Drag to adjust end"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                }}
                                                onPointerDown={(event) =>
                                                    handleResizeStart(
                                                        event,
                                                        lyric,
                                                        "end"
                                                    )
                                                }
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div
                        className="lyric-timeline__playhead"
                        style={{
                            left: `${playheadPosition}%`,
                        }}
                        aria-hidden="true"
                    >
                        <div className="lyric-timeline__playhead-handle" />
                    </div>
                </div>

                <div className="lyric-timeline__status">
                    <span>
                        {timelineLyrics.length} synchronized{" "}
                        {timelineLyrics.length === 1
                            ? "clip"
                            : "clips"}
                    </span>

                    <strong>
                        {formatTime(currentTime, true)}
                    </strong>
                </div>
            </div>
        </Panel>
    );
}

export default LyricTimeline;