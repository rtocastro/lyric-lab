import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

function AudioWaveform({ audioUrl }) {
  const containerRef = useRef(null);
  const waveSurferRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!containerRef.current || !audioUrl) {
      return undefined;
    }

    setIsReady(false);
    setErrorMessage("");

    const waveSurfer = WaveSurfer.create({
      container: containerRef.current,
      height: 130,
      waveColor: "#52616f",
      progressColor: "#55c7ff",
      cursorColor: "#f5f7fa",
      cursorWidth: 2,
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      normalize: true,
      interact: true,
    });

    waveSurferRef.current = waveSurfer;

    const handleReady = () => {
      setIsReady(true);
    };

    const handleError = (error) => {
      console.error("Waveform loading failed:", error);
      setErrorMessage("The waveform could not be generated.");
    };

    waveSurfer.on("ready", handleReady);
    waveSurfer.on("error", handleError);

    waveSurfer.load(audioUrl);

    return () => {
      waveSurfer.destroy();
      waveSurferRef.current = null;
    };
  }, [audioUrl]);

  return (
    <section className="audio-waveform">
      <div className="audio-waveform__header">
        <span>Waveform</span>

        <span>
          {errorMessage
            ? "Unable to load waveform"
            : isReady
              ? "Waveform ready"
              : "Generating waveform..."}
        </span>
      </div>

      <div className="audio-waveform__canvas">
        <div
          ref={containerRef}
          className="audio-waveform__wavesurfer"
          aria-label="Interactive audio waveform"
        />

        {!isReady && !errorMessage && (
          <span className="audio-waveform__placeholder">
            Generating waveform...
          </span>
        )}

        {errorMessage && (
          <span className="audio-waveform__error">
            {errorMessage}
          </span>
        )}
      </div>
    </section>
  );
}

export default AudioWaveform;