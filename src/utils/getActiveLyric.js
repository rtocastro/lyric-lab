export function getActiveLyric(
  lyrics = [],
  currentTime = 0,
  songDuration = 0
) {
  if (
    !Array.isArray(lyrics) ||
    lyrics.length === 0 ||
    !Number.isFinite(currentTime)
  ) {
    return null;
  }

  const syncedLyrics = lyrics.filter(
    (lyric) => Number.isFinite(lyric.start)
  );

  if (syncedLyrics.length === 0) {
    return null;
  }

  const activeLyric = syncedLyrics.find(
    (lyric, syncedIndex) => {
      const originalIndex = lyrics.findIndex(
        (candidate) => candidate.id === lyric.id
      );

      const nextLyric = lyrics
        .slice(originalIndex + 1)
        .find((candidate) =>
          Number.isFinite(candidate.start)
        );

      let effectiveEnd = lyric.end;

      if (!Number.isFinite(effectiveEnd)) {
        effectiveEnd = nextLyric?.start;
      }

      if (!Number.isFinite(effectiveEnd)) {
        effectiveEnd =
          Number.isFinite(songDuration) &&
          songDuration > lyric.start
            ? songDuration
            : Number.POSITIVE_INFINITY;
      }

      return (
        currentTime >= lyric.start &&
        currentTime < effectiveEnd
      );
    }
  );

  return activeLyric ?? null;
}