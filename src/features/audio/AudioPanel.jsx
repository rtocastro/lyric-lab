import Panel from "../../components/Panel";
import AudioWaveform from "./AudioWaveform";

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function AudioPanel({
  audioFile,
  audioUrl,
  isPlaying,
  currentTime,
  duration,
  errorMessage,
  onAudioChange,
  onTogglePlayback,
  onSeek,
  onResetPlayback,
  onClearError,
}) {
  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("audio/")) {
      onClearError("Please choose a valid audio file.");
      event.target.value = "";
      return;
    }

    onClearError("");
    onAudioChange(selectedFile);
    event.target.value = "";
  };

  const handleSliderSeek = (event) => {
    onSeek(Number(event.target.value));
  };

  const handleRemoveAudio = () => {
    onResetPlayback();
    onClearError("");
    onAudioChange(null);
  };

  return (
    <Panel title="Audio">
      <div className="audio-panel">
        {!audioFile ? (
          <label className="audio-dropzone">
            <input
              className="audio-dropzone__input"
              type="file"
              accept="audio/*,.mp3,.wav,.m4a,.ogg"
              onChange={handleFileChange}
            />

            <span className="audio-dropzone__icon">♪</span>

            <strong>Import a song</strong>

            <span>
              Choose an MP3, WAV, M4A, or OGG file
            </span>
          </label>
        ) : (
          <>
            <div className="audio-file">
              <div className="audio-file__icon">♪</div>

              <div className="audio-file__details">
                <strong>{audioFile.name}</strong>

                <span>
                  {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>

              <label className="audio-file__replace">
                Replace

                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.ogg"
                  onChange={handleFileChange}
                />
              </label>

              <button
                className="audio-file__remove"
                type="button"
                onClick={handleRemoveAudio}
              >
                Remove
              </button>
            </div>

            <div className="audio-controls">
              <button
                className="audio-controls__play"
                type="button"
                onClick={onTogglePlayback}
                aria-label={isPlaying ? "Pause song" : "Play song"}
              >
                {isPlaying ? "❚❚" : "▶"}
              </button>

              <div className="audio-controls__timeline">
                <input
                  className="audio-controls__range"
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.01"
                  value={Math.min(currentTime, duration || 0)}
                  onChange={handleSliderSeek}
                  disabled={!duration}
                  aria-label="Song position"
                />

                <div className="audio-controls__time">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>

            <AudioWaveform
              audioUrl={audioUrl}
              currentTime={currentTime}
              duration={duration}
              onSeek={onSeek}
            />
          </>
        )}

        {errorMessage && (
          <p className="audio-panel__error">
            {errorMessage}
          </p>
        )}
      </div>
    </Panel>
  );
}

export default AudioPanel;