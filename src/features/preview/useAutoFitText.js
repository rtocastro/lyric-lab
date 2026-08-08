import {
  useLayoutEffect,
  useState,
} from "react";

function doesTextFit(container, lyric) {
  if (!container || !lyric) {
    return true;
  }

  const fitsWidth =
    lyric.scrollWidth <= container.clientWidth + 1;

  const fitsHeight =
    lyric.scrollHeight <= container.clientHeight + 1;

  return fitsWidth && fitsHeight;
}

function useAutoFitText({
  text,
  requestedFontSize,
  containerRef,
  lyricRef,
  fontFamily,
  outlineWidth = 0,
}) {
  const [renderFontSize, setRenderFontSize] =
    useState(requestedFontSize);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const lyric = lyricRef.current;

    if (
      !container ||
      !lyric ||
      !Number.isFinite(requestedFontSize)
    ) {
      return;
    }

    const minimumFontSize = 18;
    const maximumFontSize = Math.max(
      requestedFontSize,
      minimumFontSize
    );

    let low = minimumFontSize;
    let high = maximumFontSize;
    let bestFit = minimumFontSize;

    while (low <= high) {
      const middle = Math.floor(
        (low + high) / 2
      );

      lyric.style.fontSize = `${middle}px`;

      if (doesTextFit(container, lyric)) {
        bestFit = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }

    lyric.style.fontSize = `${bestFit}px`;

    setRenderFontSize(bestFit);
  }, [
    text,
    requestedFontSize,
    fontFamily,
    outlineWidth,
    containerRef,
    lyricRef,
  ]);

  return renderFontSize;
}

export default useAutoFitText;