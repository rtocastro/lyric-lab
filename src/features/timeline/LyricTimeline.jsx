import { useMemo } from "react";
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

  const provisionalEnd = Math.min(
    lyric.start + provisionalDuration,
    Number.isFinite(songDuration)
      ? songDuration
      : lyric.start + provisionalDuration
  );

  return {
    effectiveEnd: provisionalEnd,
    isProvisional: true,
  };
}

function clampPercentage(value) {
  return Math.min(Math.max(value, 0), 100);
}

function LyricTimeline({
  lyrics,
  currentTime,
  duration,
  activeLyricId,
  selectedLyricId,
  onSeek,
  onSelectLyric,
}) {
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
          effectiveEnd: safeEnd,
          isProvisional,
          left,
          width: Math.max(width, 0.35),
        };
      })
      .filter(Boolean);
  }, [lyrics, duration]);

  const playheadPosition =
    Number.isFinite(duration) && duration > 0
      ? clampPercentage(
          (currentTime / duration) * 100
        )
      : 0;

  const handleClipClick = (lyric) => {
    onSelectLyric(lyric.id);
    onSeek(lyric.start);
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

        <div className="lyric-timeline__viewport">
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
                  lyric.id === selectedLyricId;

                return (
                  <button
                    className={[
                      "lyric-timeline__clip",
                      isActive
                        ? "lyric-timeline__clip--active"
                        : "",
                      isSelected
                        ? "lyric-timeline__clip--selected"
                        : "",
                      lyric.isProvisional
                        ? "lyric-timeline__clip--provisional"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    type="button"
                    key={lyric.id}
                    style={{
                      left: `${lyric.left}%`,
                      width: `${lyric.width}%`,
                    }}
                    onClick={() =>
                      handleClipClick(lyric)
                    }
                    title={`${lyric.text}
${formatTime(
  lyric.start,
  true
)} – ${
                      lyric.isProvisional
                        ? "Pending next lyric"
                        : formatTime(
                            lyric.effectiveEnd,
                            true
                          )
                    }`}
                  >
                    <span>{lyric.text}</span>
                  </button>
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