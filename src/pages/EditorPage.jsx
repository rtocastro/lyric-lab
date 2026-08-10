import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import EditorLayout from "../components/EditorLayout";
import Panel from "../components/Panel";
import AudioPanel from "../features/audio/AudioPanel";
import useAudioTransport from "../features/audio/useAudioTransport";
import LyricPanel from "../features/lyrics/LyricPanel";
import LyricTimeline from "../features/timeline/LyricTimeline";
import PreviewCanvas from "../features/preview/PreviewCanvas";
import StylePanel from "../features/style/StylePanel";
import AnimationPanel from "../features/animation/AnimationPanel";
import { getActiveLyric } from "../utils/getActiveLyric";


function formatPreviewTime(seconds) {
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
}

function formatDuration(seconds) {
    if (!Number.isFinite(seconds)) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;
}

function EditorPage({
    project,
    onProjectChange,
    onReturnHome,
}) {
    const [activeSection, setActiveSection] =
        useState("project");

    const [selectedLyricIds, setSelectedLyricIds] =
        useState([]);

    const [selectionAnchorId, setSelectionAnchorId] =
        useState(null);

    const audioTransport = useAudioTransport(
        project.audioFile
    );

    const activeLyric = useMemo(
        () =>
            getActiveLyric(
                project.lyrics,
                audioTransport.currentTime,
                audioTransport.duration
            ),
        [
            project.lyrics,
            audioTransport.currentTime,
            audioTransport.duration,
        ]
    );

    const primarySelectedLyricId =
        selectedLyricIds.length > 0
            ? selectedLyricIds[selectedLyricIds.length - 1]
            : null;

    const selectedLyrics = useMemo(
        () =>
            project.lyrics.filter((lyric) =>
                selectedLyricIds.includes(lyric.id)
            ),
        [project.lyrics, selectedLyricIds]
    );

    const selectedLyric = useMemo(
        () =>
            project.lyrics.find(
                (lyric) =>
                    lyric.id === primarySelectedLyricId
            ) ?? null,
        [project.lyrics, primarySelectedLyricId]
    );

    const activeLyricAnimation = useMemo(
        () => ({
            ...project.animation,
            ...(activeLyric?.animation ?? {}),
        }),
        [
            project.animation,
            activeLyric,
        ]
    );

    const selectedLyricAnimation = useMemo(
        () => ({
            ...project.animation,
            ...(selectedLyric?.animation ?? {}),
        }),
        [
            project.animation,
            selectedLyric,
        ]
    );

    const syncedLyricCount = useMemo(
        () =>
            project.lyrics.filter((lyric) =>
                Number.isFinite(lyric.start)
            ).length,
        [project.lyrics]
    );

    useEffect(() => {
        setSelectedLyricIds((currentIds) =>
            currentIds.filter((id) =>
                project.lyrics.some(
                    (lyric) => lyric.id === id
                )
            )
        );

        if (
            selectionAnchorId &&
            !project.lyrics.some(
                (lyric) => lyric.id === selectionAnchorId
            )
        ) {
            setSelectionAnchorId(null);
        }
    }, [project.lyrics, selectionAnchorId]);

    const handleTitleChange = (event) => {
        onProjectChange({
            ...project,
            title: event.target.value,
        });
    };

    const handleArtistChange = (event) => {
        onProjectChange({
            ...project,
            artist: event.target.value,
        });
    };

    const handleAudioChange = (audioFile) => {
        onProjectChange({
            ...project,
            audioFile,
        });
    };

    const handleLyricsChange = useCallback(
        (lyrics) => {
            onProjectChange((currentProject) => ({
                ...currentProject,
                lyrics,
            }));
        },
        [onProjectChange]
    );

    const handleStyleChange = useCallback(
        (updates) => {
            onProjectChange((currentProject) => ({
                ...currentProject,
                style: {
                    ...currentProject.style,
                    ...updates,
                },
            }));
        },
        [onProjectChange]
    );

    const handleAnimationChange = useCallback(
        (updates) => {
            onProjectChange((currentProject) => ({
                ...currentProject,
                animation: {
                    ...currentProject.animation,
                    ...updates,
                },
            }));
        },
        [onProjectChange]
    );

    const handleSelectedLyricsAnimationChange =
        useCallback(
            (updates) => {
                if (selectedLyricIds.length === 0) {
                    return;
                }

                onProjectChange((currentProject) => ({
                    ...currentProject,

                    lyrics: currentProject.lyrics.map(
                        (lyric) => {
                            if (
                                !selectedLyricIds.includes(
                                    lyric.id
                                )
                            ) {
                                return lyric;
                            }

                            return {
                                ...lyric,

                                animation: {
                                    ...lyric.animation,
                                    ...updates,
                                },
                            };
                        }
                    ),
                }));
            },
            [
                onProjectChange,
                selectedLyricIds,
            ]
        );

    const handleSelectLyric = useCallback(
        (
            lyricId,
            {
                toggle = false,
                range = false,
            } = {}
        ) => {
            const syncedLyricIds = project.lyrics
                .filter((lyric) =>
                    Number.isFinite(lyric.start)
                )
                .map((lyric) => lyric.id);

            if (range && selectionAnchorId) {
                const anchorIndex =
                    syncedLyricIds.indexOf(
                        selectionAnchorId
                    );

                const clickedIndex =
                    syncedLyricIds.indexOf(lyricId);

                if (
                    anchorIndex !== -1 &&
                    clickedIndex !== -1
                ) {
                    const rangeStart = Math.min(
                        anchorIndex,
                        clickedIndex
                    );

                    const rangeEnd = Math.max(
                        anchorIndex,
                        clickedIndex
                    );

                    const rangeIds = syncedLyricIds.slice(
                        rangeStart,
                        rangeEnd + 1
                    );

                    setSelectedLyricIds(rangeIds);
                    return;
                }
            }

            if (toggle) {
                setSelectedLyricIds((currentIds) => {
                    if (currentIds.includes(lyricId)) {
                        return currentIds.filter(
                            (id) => id !== lyricId
                        );
                    }

                    return [...currentIds, lyricId];
                });

                setSelectionAnchorId(lyricId);
                return;
            }

            setSelectedLyricIds([lyricId]);
            setSelectionAnchorId(lyricId);
        },
        [project.lyrics, selectionAnchorId]
    );

    const handleLyricTimingChange = useCallback(
        (lyricId, updates) => {
            onProjectChange((currentProject) => {
                const lyricIndex =
                    currentProject.lyrics.findIndex(
                        (lyric) => lyric.id === lyricId
                    );

                if (lyricIndex === -1) {
                    return currentProject;
                }

                const lyric =
                    currentProject.lyrics[lyricIndex];

                const previousLyric =
                    currentProject.lyrics[lyricIndex - 1];

                const nextLyric =
                    currentProject.lyrics[lyricIndex + 1];

                let nextStart =
                    updates.start ?? lyric.start;

                let nextEnd =
                    updates.end !== undefined
                        ? updates.end
                        : lyric.end;

                if (Number.isFinite(nextStart)) {
                    nextStart = Math.max(
                        0,
                        Math.min(
                            nextStart,
                            audioTransport.duration || nextStart
                        )
                    );
                }

                if (
                    Number.isFinite(previousLyric?.start) &&
                    Number.isFinite(nextStart)
                ) {
                    nextStart = Math.max(
                        nextStart,
                        previousLyric.start + 0.01
                    );
                }

                if (
                    Number.isFinite(nextLyric?.start) &&
                    Number.isFinite(nextStart)
                ) {
                    nextStart = Math.min(
                        nextStart,
                        nextLyric.start - 0.01
                    );
                }

                if (
                    Number.isFinite(nextEnd) &&
                    Number.isFinite(nextStart)
                ) {
                    nextEnd = Math.max(
                        nextEnd,
                        nextStart + 0.01
                    );
                }

                if (
                    Number.isFinite(nextLyric?.start) &&
                    Number.isFinite(nextEnd)
                ) {
                    nextEnd = Math.min(
                        nextEnd,
                        nextLyric.start
                    );
                }

                const updatedLyrics =
                    currentProject.lyrics.map(
                        (currentLyric) =>
                            currentLyric.id === lyricId
                                ? {
                                    ...currentLyric,
                                    start: nextStart,
                                    end: nextEnd,
                                }
                                : currentLyric
                    );

                return {
                    ...currentProject,
                    lyrics: updatedLyrics,
                };
            });
        },
        [audioTransport.duration, onProjectChange]
    );

    const handleResetSelectedLyric = useCallback(() => {
        if (!selectedLyric) {
            return;
        }

        onProjectChange((currentProject) => ({
            ...currentProject,
            lyrics: currentProject.lyrics.map(
                (lyric) =>
                    lyric.id === selectedLyric.id
                        ? {
                            ...lyric,
                            start: null,
                            end: null,
                        }
                        : lyric
            ),
        }));

        setSelectedLyricIds((currentIds) =>
            currentIds.filter(
                (id) => id !== selectedLyric.id
            )
        );

        if (selectionAnchorId === selectedLyric.id) {
            setSelectionAnchorId(null);
        }
    }, [
        onProjectChange,
        selectedLyric,
        selectionAnchorId,
    ]);

    useEffect(() => {
        const handleTimelineKeyDown = (event) => {
            const target = event.target;

            const isTyping =
                target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                target instanceof HTMLSelectElement ||
                target?.isContentEditable;

            if (isTyping) {
                return;
            }

            if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "a"
            ) {
                event.preventDefault();

                const allSyncedIds = project.lyrics
                    .filter((lyric) =>
                        Number.isFinite(lyric.start)
                    )
                    .map((lyric) => lyric.id);

                setSelectedLyricIds(allSyncedIds);

                if (allSyncedIds.length > 0) {
                    setSelectionAnchorId(
                        allSyncedIds[allSyncedIds.length - 1]
                    );
                }

                return;
            }

            if (event.key === "Escape") {
                event.preventDefault();

                setSelectedLyricIds([]);
                setSelectionAnchorId(null);

                return;
            }

            if (!selectedLyric) {
                return;
            }

            const isArrowKey =
                event.key === "ArrowLeft" ||
                event.key === "ArrowRight";

            if (isArrowKey) {
                if (!Number.isFinite(selectedLyric.start)) {
                    return;
                }

                event.preventDefault();

                const direction =
                    event.key === "ArrowLeft" ? -1 : 1;

                const step = event.shiftKey ? 0.05 : 0.01;

                if (event.altKey) {
                    const currentEnd = Number.isFinite(
                        selectedLyric.end
                    )
                        ? selectedLyric.end
                        : selectedLyric.start + 2;

                    handleLyricTimingChange(
                        selectedLyric.id,
                        {
                            end:
                                currentEnd +
                                direction * step,
                        }
                    );

                    return;
                }

                handleLyricTimingChange(
                    selectedLyric.id,
                    {
                        start:
                            selectedLyric.start +
                            direction * step,
                    }
                );

                return;
            }

            if (event.key === "Enter") {
                if (!Number.isFinite(selectedLyric.start)) {
                    return;
                }

                event.preventDefault();
                audioTransport.seek(selectedLyric.start);
                return;
            }

            if (event.key === "Delete") {
                event.preventDefault();
                handleResetSelectedLyric();
                return;
            }

            if (event.key === "Escape") {
                event.preventDefault();

                setSelectedLyricIds([]);
                setSelectionAnchorId(null);

                return;
            }

            if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "a"
            ) {
                event.preventDefault();

                const allSyncedIds = project.lyrics
                    .filter((lyric) =>
                        Number.isFinite(lyric.start)
                    )
                    .map((lyric) => lyric.id);

                setSelectedLyricIds(allSyncedIds);

                if (allSyncedIds.length > 0) {
                    setSelectionAnchorId(
                        allSyncedIds[allSyncedIds.length - 1]
                    );
                }
            }
        };

        window.addEventListener(
            "keydown",
            handleTimelineKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleTimelineKeyDown
            );
        };
    }, [
        selectedLyric,
        handleLyricTimingChange,
        handleResetSelectedLyric,
        audioTransport.seek,
    ]);

    const renderPreviewPanel = () => {
        const previewText = activeLyric
            ? activeLyric.text
            : syncedLyricCount > 0
                ? "Waiting for the next lyric..."
                : project.lyrics.length > 0
                    ? "Synchronize your lyrics to begin"
                    : "Your lyrics will appear here";

        return (
            <Panel title="Live Preview">
                <PreviewCanvas
                    text={previewText}
                    lineLabel={
                        activeLyric
                            ? `Line ${activeLyric.order + 1}`
                            : "Video Preview"
                    }
                    style={project.style}
                    animation={activeLyricAnimation}
                    lyricStart={activeLyric?.start ?? null}
                    lyricEnd={activeLyric?.end ?? null}
                    isPlaying={audioTransport.isPlaying}
                    currentTime={audioTransport.visualTime}
                    duration={audioTransport.duration}
                    hasAudio={Boolean(project.audioFile)}
                    onTogglePlayback={
                        audioTransport.togglePlayback
                    }
                />
            </Panel>
        );
    };
    const renderActivePanel = () => {
        if (activeSection === "audio") {
            return (
                <AudioPanel
                    audioFile={project.audioFile}
                    audioUrl={audioTransport.audioUrl}
                    isPlaying={audioTransport.isPlaying}
                    currentTime={audioTransport.currentTime}
                    duration={audioTransport.duration}
                    errorMessage={audioTransport.errorMessage}
                    onAudioChange={handleAudioChange}
                    onTogglePlayback={
                        audioTransport.togglePlayback
                    }
                    onSeek={audioTransport.seek}
                    onResetPlayback={audioTransport.reset}
                    onClearError={
                        audioTransport.setErrorMessage
                    }
                />
            );
        }


        if (activeSection === "lyrics") {
            return (
                <LyricPanel
                    lyrics={project.lyrics}
                    currentTime={audioTransport.currentTime}
                    duration={audioTransport.duration}
                    isPlaying={audioTransport.isPlaying}
                    hasAudio={Boolean(project.audioFile)}
                    onLyricsChange={handleLyricsChange}
                    onTogglePlayback={
                        audioTransport.togglePlayback
                    }
                    onSeek={audioTransport.seek}

                />

            );

        }

        if (activeSection === "style") {
            return (
                <StylePanel
                    style={project.style}
                    onStyleChange={handleStyleChange}
                    preview={
                        <PreviewCanvas
                            text={
                                activeLyric?.text ??
                                selectedLyric?.text ??
                                "Lyric Preview"
                            }
                            lineLabel={
                                activeLyric
                                    ? `Line ${activeLyric.order + 1}`
                                    : selectedLyric
                                        ? `Line ${selectedLyric.order + 1}`
                                        : "Style Preview"
                            }
                            style={project.style}
                            animation={project.animation}
                            lyricStart={activeLyric?.start ?? null}
                            lyricEnd={activeLyric?.end ?? null}
                            isPlaying={audioTransport.isPlaying}
                            currentTime={audioTransport.currentTime}
                            animation={activeLyricAnimation}
                            duration={audioTransport.duration}
                            hasAudio={Boolean(project.audioFile)}
                            onTogglePlayback={
                                audioTransport.togglePlayback
                            }
                        />
                    }
                />
            );
        }

        if (activeSection === "animation") {
            return (
                <AnimationPanel
                    globalAnimation={project.animation}
                    selectedAnimation={
                        selectedLyricAnimation
                    }
                    selectedCount={
                        selectedLyricIds.length
                    }
                    onGlobalAnimationChange={
                        handleAnimationChange
                    }
                    onSelectedAnimationChange={
                        handleSelectedLyricsAnimationChange
                    }
                />
            );
        }

        return renderPreviewPanel();
    };

    return (
        <EditorLayout
            projectTitle={project.title}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onReturnHome={onReturnHome}
        >
            {audioTransport.audioElement}

            <div className="editor-grid">
                <section className="editor-grid__main">
                    {renderActivePanel()}
                </section>

                <aside className="editor-grid__inspector">
                    <Panel title="Project Settings">
                        <div className="form-group">
                            <label htmlFor="project-title">
                                Project title
                            </label>

                            <input
                                id="project-title"
                                type="text"
                                value={project.title}
                                onChange={handleTitleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="artist-name">
                                Artist
                            </label>

                            <input
                                id="artist-name"
                                type="text"
                                value={project.artist}
                                onChange={handleArtistChange}
                                placeholder="Artist or band name"
                            />
                        </div>

                        <div className="project-summary">
                            <span>Active section</span>
                            <strong>{activeSection}</strong>
                        </div>

                        <div className="project-summary">
                            <span>Audio</span>

                            <strong>
                                {project.audioFile
                                    ? project.audioFile.name
                                    : "Not imported"}
                            </strong>
                        </div>

                        <div className="project-summary">
                            <span>Lyrics</span>

                            <strong>
                                {project.lyrics.length > 0
                                    ? `${project.lyrics.length} lines`
                                    : "Not imported"}
                            </strong>
                        </div>

                        <div className="project-summary">
                            <span>Synced</span>

                            <strong>
                                {syncedLyricCount} /{" "}
                                {project.lyrics.length}
                            </strong>
                        </div>

                        <div className="project-summary">
                            <span>Playback</span>

                            <strong>
                                {audioTransport.isPlaying
                                    ? "Playing"
                                    : "Paused"}
                            </strong>
                        </div>
                        <div className="project-summary">
                            <span>Current lyric</span>

                            <strong>
                                {activeLyric
                                    ? `Line ${activeLyric.order + 1}`
                                    : "None"}
                            </strong>
                        </div>

                        {selectedLyricIds.length > 0 && (
                            <div className="selection-summary">
                                <span>Selection</span>

                                <strong>
                                    {selectedLyricIds.length}{" "}
                                    {selectedLyricIds.length === 1
                                        ? "lyric"
                                        : "lyrics"}
                                </strong>
                            </div>
                        )}

                        {selectedLyric && (
                            <div className="timing-inspector">
                                <div className="timing-inspector__header">
                                    <span>Selected lyric</span>

                                    <strong>
                                        Line {selectedLyric.order + 1}
                                    </strong>
                                </div>

                                <p className="timing-inspector__text">
                                    {selectedLyric.text}
                                </p>

                                <div className="timing-inspector__group">
                                    <span>Start time</span>

                                    <strong>
                                        {Number.isFinite(selectedLyric.start)
                                            ? selectedLyric.start.toFixed(2)
                                            : "--"}
                                        s
                                    </strong>

                                    <div className="timing-inspector__buttons">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleLyricTimingChange(
                                                    selectedLyric.id,
                                                    {
                                                        start:
                                                            selectedLyric.start - 0.05,
                                                    }
                                                )
                                            }
                                        >
                                            −0.05
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleLyricTimingChange(
                                                    selectedLyric.id,
                                                    {
                                                        start:
                                                            selectedLyric.start + 0.05,
                                                    }
                                                )
                                            }
                                        >
                                            +0.05
                                        </button>
                                    </div>
                                </div>

                                <div className="timing-inspector__group">
                                    <span>End time</span>

                                    <strong>
                                        {Number.isFinite(selectedLyric.end)
                                            ? `${selectedLyric.end.toFixed(2)}s`
                                            : "Automatic"}
                                    </strong>

                                    <div className="timing-inspector__buttons">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const currentEnd =
                                                    Number.isFinite(selectedLyric.end)
                                                        ? selectedLyric.end
                                                        : selectedLyric.start + 2;

                                                handleLyricTimingChange(
                                                    selectedLyric.id,
                                                    {
                                                        end: currentEnd - 0.05,
                                                    }
                                                );
                                            }}
                                        >
                                            −0.05
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const currentEnd =
                                                    Number.isFinite(selectedLyric.end)
                                                        ? selectedLyric.end
                                                        : selectedLyric.start + 2;

                                                handleLyricTimingChange(
                                                    selectedLyric.id,
                                                    {
                                                        end: currentEnd + 0.05,
                                                    }
                                                );
                                            }}
                                        >
                                            +0.05
                                        </button>
                                    </div>
                                </div>

                                <div className="timing-inspector__actions">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            audioTransport.seek(
                                                selectedLyric.start
                                            );
                                        }}
                                    >
                                        Go to Start
                                    </button>

                                    <button
                                        type="button"
                                        className="timing-inspector__reset"
                                        onClick={handleResetSelectedLyric}
                                    >
                                        Unsync Clip
                                    </button>
                                </div>
                                <div className="timing-inspector__shortcuts">
                                    <span className="timing-inspector__shortcut-title">
                                        Keyboard controls
                                    </span>

                                    <div className="timing-inspector__shortcut">
                                        <div>
                                            <kbd>←</kbd>
                                            <kbd>→</kbd>
                                        </div>

                                        <span>Nudge start by 0.01s</span>
                                    </div>

                                    <div className="timing-inspector__shortcut">
                                        <div>
                                            <kbd>Shift</kbd>
                                            <span>+</span>
                                            <kbd>←</kbd>
                                            <kbd>→</kbd>
                                        </div>

                                        <span>Nudge start by 0.05s</span>
                                    </div>

                                    <div className="timing-inspector__shortcut">
                                        <div>
                                            <kbd>Alt</kbd>
                                            <span>+</span>
                                            <kbd>←</kbd>
                                            <kbd>→</kbd>
                                        </div>

                                        <span>Adjust end time</span>
                                    </div>

                                    <div className="timing-inspector__shortcut">
                                        <div>
                                            <kbd>Enter</kbd>
                                        </div>

                                        <span>Go to lyric start</span>
                                    </div>

                                    <div className="timing-inspector__shortcut">
                                        <div>
                                            <kbd>Delete</kbd>
                                        </div>

                                        <span>Remove timing, keep lyric</span>
                                    </div>

                                    <div className="timing-inspector__shortcut">
                                        <div>
                                            <kbd>Esc</kbd>
                                        </div>

                                        <span>Deselect clip</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Panel>
                </aside>

                <section className="editor-grid__timeline">
                    <LyricTimeline
                        lyrics={project.lyrics}
                        currentTime={audioTransport.currentTime}
                        duration={audioTransport.duration}
                        activeLyricId={activeLyric?.id ?? null}
                        selectedLyricIds={selectedLyricIds}
                        primarySelectedLyricId={
                            primarySelectedLyricId
                        }
                        onSeek={audioTransport.seek}
                        onSelectLyric={handleSelectLyric}
                        onTimingChange={handleLyricTimingChange}
                    />
                </section>
            </div>
        </EditorLayout>
    );
}

export default EditorPage;