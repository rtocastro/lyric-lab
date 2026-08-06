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

    const [selectedLyricId, setSelectedLyricId] =
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

    const selectedLyric = useMemo(
        () =>
            project.lyrics.find(
                (lyric) => lyric.id === selectedLyricId
            ) ?? null,
        [project.lyrics, selectedLyricId]
    );

    const syncedLyricCount = useMemo(
        () =>
            project.lyrics.filter((lyric) =>
                Number.isFinite(lyric.start)
            ).length,
        [project.lyrics]
    );

    useEffect(() => {
        if (
            selectedLyricId &&
            !project.lyrics.some(
                (lyric) => lyric.id === selectedLyricId
            )
        ) {
            setSelectedLyricId(null);
        }
    }, [project.lyrics, selectedLyricId]);

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

        setSelectedLyricId(null);
    }, [onProjectChange, selectedLyric]);

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
                <div className="preview">
                    <div className="preview__canvas">
                        <div className="preview__hud preview__hud--top">
                            <span>Live lyric preview</span>

                            <strong>
                                {audioTransport.isPlaying
                                    ? "Playing"
                                    : "Paused"}
                            </strong>
                        </div>

                        <div
                            className={[
                                "preview__lyric-stage",
                                activeLyric
                                    ? "preview__lyric-stage--active"
                                    : "",
                            ]
                                .filter(Boolean)
                                .join(" ")}
                            key={activeLyric?.id ?? "empty-preview"}
                        >
                            <span className="preview__eyebrow">
                                {activeLyric
                                    ? `Line ${activeLyric.order + 1}`
                                    : "Video Preview"}
                            </span>

                            <strong className="preview__lyric">
                                {previewText}
                            </strong>
                        </div>

                        <div className="preview__hud preview__hud--bottom">
                            <button
                                className="preview__play-button"
                                type="button"
                                onClick={audioTransport.togglePlayback}
                                disabled={!project.audioFile}
                                aria-label={
                                    audioTransport.isPlaying
                                        ? "Pause song"
                                        : "Play song"
                                }
                            >
                                {audioTransport.isPlaying ? "❚❚" : "▶"}
                            </button>

                            <div className="preview__time">
                                <strong>
                                    {formatPreviewTime(
                                        audioTransport.currentTime
                                    )}
                                </strong>

                                <span>
                                    /{" "}
                                    {formatDuration(
                                        audioTransport.duration
                                    )}
                                </span>
                            </div>

                            <div className="preview__progress">
                                <div
                                    className="preview__progress-fill"
                                    style={{
                                        width:
                                            audioTransport.duration > 0
                                                ? `${Math.min(
                                                    (audioTransport.currentTime /
                                                        audioTransport.duration) *
                                                    100,
                                                    100
                                                )}%`
                                                : "0%",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
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
        Reset Clip
      </button>
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
                        selectedLyricId={selectedLyricId}
                        onSeek={audioTransport.seek}
                        onSelectLyric={setSelectedLyricId}
                    />
                </section>
            </div>
        </EditorLayout>
    );
}

export default EditorPage;