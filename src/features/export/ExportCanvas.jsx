import { useEffect, useRef } from "react";

function ExportCanvas({
  width = 1920,
  height = 1080,
  visuals,
}) {
  const canvasRef = useRef(null);

  const currentVisuals = {
    backgroundType: "color",
    backgroundColor: "#000000",
    backgroundImage: null,
    backgroundVideo: null,
    fit: "cover",
    position: "center",
    ...visuals,
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    canvas.width = width;
    canvas.height = height;

    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    context.fillStyle =
      currentVisuals.backgroundType === "color"
        ? currentVisuals.backgroundColor
        : "#000000";

    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    context.fillStyle = "#FFFFFF";
    context.font = "700 72px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.fillText(
      "Lyric Lab Export Test",
      canvas.width / 2,
      canvas.height / 2
    );
  }, [
    width,
    height,
    currentVisuals.backgroundType,
    currentVisuals.backgroundColor,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="export-canvas"
      width={width}
      height={height}
    />
  );
}

export default ExportCanvas;