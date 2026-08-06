import { useState } from "react";
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

function LyricPanel({ lyrics, onLyricsChange }) {
  const [lyricDraft, setLyricDraft] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
    const existingText = lyrics
      .map((lyric) => lyric.text)
      .join("\n");

    setLyricDraft(existingText);
    onLyricsChange([]);
    setErrorMessage("");
  };

  const hasImportedLyrics = lyrics.length > 0;

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
              placeholder={`The time has come
To get the fuck up
I won't remain
Buried beneath this`}
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
                  Lyrics imported
                </span>

                <h3>
                  {lyrics.length}{" "}
                  {lyrics.length === 1 ? "line" : "lines"}
                </h3>
              </div>

              <div className="lyric-workspace__actions">
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

            <div className="lyric-list">
              {lyrics.map((lyric, index) => {
                const isFirstUnsynced =
                  lyric.start === null &&
                  lyrics
                    .slice(0, index)
                    .every(
                      (previousLyric) =>
                        previousLyric.start !== null
                    );

                return (
                  <article
                    className={[
                      "lyric-card",
                      lyric.start !== null
                        ? "lyric-card--synced"
                        : "",
                      isFirstUnsynced
                        ? "lyric-card--active"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={lyric.id}
                  >
                    <div className="lyric-card__status">
                      {lyric.start !== null
                        ? "✓"
                        : isFirstUnsynced
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

            <div className="lyric-workspace__hint">
              <span className="lyric-workspace__key">
                Space
              </span>

              <span>
                Spacebar synchronization arrives in the next
                commit.
              </span>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}

export default LyricPanel;