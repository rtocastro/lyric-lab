function getMediaDrawRect({
  sourceWidth,
  sourceHeight,
  canvasWidth,
  canvasHeight,
  fit = "cover",
  position = "center",
}) {
  if (
    !sourceWidth ||
    !sourceHeight ||
    !canvasWidth ||
    !canvasHeight
  ) {
    return null;
  }

  const scale =
    fit === "contain"
      ? Math.min(
          canvasWidth / sourceWidth,
          canvasHeight / sourceHeight
        )
      : Math.max(
          canvasWidth / sourceWidth,
          canvasHeight / sourceHeight
        );

  const width = sourceWidth * scale;
  const height = sourceHeight * scale;

  const x = (canvasWidth - width) / 2;

  let y;

  switch (position) {
    case "top":
      y = 0;
      break;

    case "bottom":
      y = canvasHeight - height;
      break;

    case "center":
    default:
      y = (canvasHeight - height) / 2;
      break;
  }

  return {
    x,
    y,
    width,
    height,
  };
}

export default getMediaDrawRect;