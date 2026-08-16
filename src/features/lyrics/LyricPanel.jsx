import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Panel from "../../components/Panel";

function formatTimestamp(seconds) {
  if (!Number.isFinite(seconds)) {
    return "--:--.--";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${remainingSeconds
    .toFixed(2)
    .padStart(5, "0")}`;
}

function LyricPanel({
  lyrics,
  currentTime,
  duration,
  isPlaying,
  hasAudio,
  onLyricsChange,
  onTogglePlayback,
  onSeek,
}) {
  const [lyricDraft, setLyricDraft] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const activeLyricRef = useRef(null);

  const activeLyricIndex = useMemo(
    () =>
      lyrics.findIndex(
        (lyric) => lyric.start === null
      ),
    [lyrics]
  );

  useEffect(() => {
    activeLyricRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeLyricIndex]);

  const handleMarkLyric = () => {
    if (lyrics.length === 0) {
      return;
    }

    if (!hasAudio) {
      setErrorMessage(
        "Import an audio file before synchronizing lyrics."
      );
      return;
    }

    if (activeLyricIndex === -1) {
      setErrorMessage(
        "Every lyric line is already synchronized."
      );
      return;
    }

    const nextLyrics = lyrics.map(
      (lyric, index) => {
        if (index === activeLyricIndex) {
          return {
            ...lyric,
            start: currentTime,
          };
        }

        if (
          index === activeLyricIndex - 1 &&
          lyric.end === null
        ) {
          return {
            ...lyric,
            end: currentTime,
          };
        }

        return lyric;
      }
    );

    onLyricsChange(nextLyrics);
    setErrorMessage("");
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable;

      if (
        event.code !== "Space" ||
        event.repeat ||
        isTyping ||
        lyrics.length === 0
      ) {
        return;
      }

      event.preventDefault();
      handleMarkLyric();

      if (!hasAudio) {
        setErrorMessage(
          "Import an audio file before synchronizing lyrics."
        );
        return;
      }

      if (activeLyricIndex === -1) {
        setErrorMessage("Every lyric line is already synchronized.");
        return;
      }

      const nextLyrics = lyrics.map((lyric, index) => {
        if (index === activeLyricIndex) {
          return {
            ...lyric,
            start: currentTime,
          };
        }

        if (
          index === activeLyricIndex - 1 &&
          lyric.end === null
        ) {
          return {
            ...lyric,
            end: currentTime,
          };
        }

        return lyric;
      });

      onLyricsChange(nextLyrics);
      setErrorMessage("");
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    activeLyricIndex,
    currentTime,
    hasAudio,
    lyrics,
    onLyricsChange,
  ]);

  const handleImportLyrics = () => {
    const lyricLines = lyricDraft
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lyricLines.length === 0) {
      setErrorMessage(
        "Paste at least one lyric line before importing."
      );
      return;
    }

    const importedLyrics = lyricLines.map((text, index) => ({
      id: crypto.randomUUID(),
      text,
      order: index,
      start: null,
      end: null,
    }));

    onLyricsChange(importedLyrics);
    setErrorMessage("");
  };

  const handleClearLyrics = () => {
    onLyricsChange([]);
    setLyricDraft("");
    setErrorMessage("");
  };

  const handleEditLyrics = () => {
    setLyricDraft(
      lyrics.map((lyric) => lyric.text).join("\n")
    );

    onLyricsChange([]);
    setErrorMessage("");
  };

  const handleResetSync = () => {
    const resetLyrics = lyrics.map((lyric) => ({
      ...lyric,
      start: null,
      end: null,
    }));

    onLyricsChange(resetLyrics);
    onSeek(0);
    setErrorMessage("");
  };

  const handleUndoLastSync = () => {
    const lastSyncedIndex = lyrics.findLastIndex(
      (lyric) => lyric.start !== null
    );

    if (lastSyncedIndex === -1) {
      return;
    }

    const previousStart =
      lyrics[lastSyncedIndex].start ?? 0;

    const nextLyrics = lyrics.map((lyric, index) => {
      if (index === lastSyncedIndex) {
        return {
          ...lyric,
          start: null,
          end: null,
        };
      }

      if (index === lastSyncedIndex - 1) {
        return {
          ...lyric,
          end: null,
        };
      }

      return lyric;
    });

    onLyricsChange(nextLyrics);
    onSeek(previousStart);
    setErrorMessage("");
  };

  const hasImportedLyrics = lyrics.length > 0;
  const syncedCount = lyrics.filter(
    (lyric) => lyric.start !== null
  ).length;

  return (
    <Panel title="Lyrics">
      <div className="lyric-panel">
        {!hasImportedLyrics ? (
          <div className="lyric-import">
            <div className="lyric-import__header">
              <div>
                <span className="lyric-import__eyebrow">
                  Step 1
                </span>

                <h3>Paste your lyrics</h3>

                <p>
                  Place each lyric line on its own line.
                  Empty lines will be ignored.
                </p>
              </div>
            </div>

            <textarea
              className="lyric-import__textarea"
              value={lyricDraft}
              onChange={(event) => {
                setLyricDraft(event.target.value);
                setErrorMessage("");
              }}
              placeholder={`Never gonna give you up
Never gonna let you down
Never gonna run around and desert you`}
              spellCheck="true"
            />

            <div className="lyric-import__footer">
              <span>
                {
                  lyricDraft
                    .split(/\r?\n/)
                    .map((line) => line.trim())
                    .filter(Boolean).length
                }{" "}
                lyric lines detected
              </span>

              <button
                className="button button--primary"
                type="button"
                onClick={handleImportLyrics}
              >
                Import Lyrics
              </button>
            </div>

            {errorMessage && (
              <p className="lyric-panel__error">
                {errorMessage}
              </p>
            )}
          </div>
        ) : (
          <div className="lyric-workspace">
            <div className="lyric-workspace__toolbar">
              <div>
                <span className="lyric-import__eyebrow">
                  Synchronization
                </span>

                <h3>
                  {syncedCount} of {lyrics.length} lines synced
                </h3>
              </div>

              <div className="lyric-workspace__actions">
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={onTogglePlayback}
                  disabled={!hasAudio}
                >
                  {isPlaying ? "Pause" : "Play"}
                </button>

                <button
                  className="button button--secondary"
                  type="button"
                  onClick={handleUndoLastSync}
                  disabled={syncedCount === 0}
                >
                  Undo
                </button>

                <button
                  className="button button--secondary"
                  type="button"
                  onClick={handleResetSync}
                  disabled={syncedCount === 0}
                >
                  Reset Sync
                </button>

                <button
                  className="button button--secondary"
                  type="button"
                  onClick={handleEditLyrics}
                >
                  Edit Text
                </button>

                <button
                  className="lyric-workspace__clear"
                  type="button"
                  onClick={handleClearLyrics}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="lyric-sync-status">
              <button
                className="lyric-sync-status__play"
                type="button"
                onClick={onTogglePlayback}
                disabled={!hasAudio}
                aria-label={isPlaying ? "Pause song" : "Play song"}
              >
                {isPlaying ? "❚❚" : "▶"}
              </button>

              <div>
                <span>Current position</span>

                <strong>
                  {formatTimestamp(currentTime)}
                </strong>
              </div>

              <div className="lyric-sync-status__progress">
                <div
                  className="lyric-sync-status__progress-fill"
                  style={{
                    width:
                      duration > 0
                        ? `${Math.min(
                          (currentTime / duration) * 100,
                          100
                        )}%`
                        : "0%",
                  }}
                />
              </div>
            </div>

            <div className="lyric-list">
              {lyrics.map((lyric, index) => {
                const isActive = index === activeLyricIndex;
                const isSynced = lyric.start !== null;

                return (
                  <article
                    ref={isActive ? activeLyricRef : null}
                    className={[
                      "lyric-card",
                      isSynced
                        ? "lyric-card--synced"
                        : "",
                      isActive
                        ? "lyric-card--active"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={lyric.id}
                  >
                    <div className="lyric-card__status">
                      {isSynced
                        ? "✓"
                        : isActive
                          ? "▶"
                          : "○"}
                    </div>

                    <div className="lyric-card__content">
                      <span className="lyric-card__number">
                        Line {index + 1}
                      </span>

                      <strong>{lyric.text}</strong>
                    </div>

                    <time className="lyric-card__time">
                      {formatTimestamp(lyric.start)}
                    </time>
                  </article>
                );
              })}
            </div>

            <div className="lyric-mobile-now">
              <span className="lyric-mobile-now__label">
                Next lyric
              </span>

              <strong className="lyric-mobile-now__current">
                {activeLyricIndex === -1
                  ? "All lyrics synced"
                  : lyrics[activeLyricIndex]?.text}
              </strong>

              {activeLyricIndex !== -1 &&
                lyrics[activeLyricIndex + 1] && (
                  <span className="lyric-mobile-now__next">
                    Up next:{" "}
                    {lyrics[activeLyricIndex + 1].text}
                  </span>
                )}
            </div>

            <button
              className="lyric-mobile-sync"
              type="button"
              onClick={handleMarkLyric}
              disabled={
                !hasAudio ||
                activeLyricIndex === -1
              }
            >
              {activeLyricIndex === -1
                ? "All Lyrics Synced"
                : `Mark Line ${activeLyricIndex + 1}`}
            </button>

            <div className="lyric-workspace__hint">
              <span className="lyric-workspace__key">
                Space
              </span>

              <span>
                Press Space when the highlighted lyric begins.
              </span>
            </div>

            {errorMessage && (
              <p className="lyric-panel__error">
                {errorMessage}
              </p>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
}

export default LyricPanel;