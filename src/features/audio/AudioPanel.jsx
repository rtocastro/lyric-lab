import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
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

function AudioPanel({ audioFile, onAudioChange }) {
    const audioRef = useRef(null);

    const [audioUrl, setAudioUrl] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!audioFile) {
            setAudioUrl("");
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
            return undefined;
        }

        const objectUrl = URL.createObjectURL(audioFile);

        setAudioUrl(objectUrl);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [audioFile]);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        if (!selectedFile.type.startsWith("audio/")) {
            setErrorMessage("Please choose a valid audio file.");
            event.target.value = "";
            return;
        }

        setErrorMessage("");
        onAudioChange(selectedFile);

        event.target.value = "";
    };

    const handleTogglePlayback = async () => {
        const audioElement = audioRef.current;

        if (!audioElement) {
            return;
        }

        try {
            if (audioElement.paused) {
                await audioElement.play();
            } else {
                audioElement.pause();
            }
        } catch (error) {
            console.error("Audio playback failed:", error);
            setErrorMessage("The browser could not play this audio file.");
        }
    };

    const handleSeek = (event) => {
        const audioElement = audioRef.current;
        const nextTime = Number(event.target.value);

        if (!audioElement || !Number.isFinite(nextTime)) {
            return;
        }

        audioElement.currentTime = nextTime;
        setCurrentTime(nextTime);
    };

    const handleWaveformSeek = useCallback((nextTime) => {
        const audioElement = audioRef.current;

        if (!audioElement || !Number.isFinite(nextTime)) {
            return;
        }

        audioElement.currentTime = nextTime;
        setCurrentTime(nextTime);
    }, []);

    const handleRemoveAudio = () => {
        const audioElement = audioRef.current;

        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
        }

        setErrorMessage("");
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
                        {audioUrl && (
                            <audio
                                ref={audioRef}
                                src={audioUrl}
                                preload="metadata"
                                onLoadedMetadata={(event) => {
                                    setDuration(event.currentTarget.duration);
                                }}
                                onDurationChange={(event) => {
                                    setDuration(event.currentTarget.duration);
                                }}
                                onTimeUpdate={(event) => {
                                    setCurrentTime(event.currentTarget.currentTime);
                                }}
                                onPlay={() => {
                                    setIsPlaying(true);
                                }}
                                onPause={() => {
                                    setIsPlaying(false);
                                }}
                                onEnded={() => {
                                    setIsPlaying(false);
                                    setCurrentTime(0);
                                }}
                            />
                        )}

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
                                onClick={handleTogglePlayback}
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
                                    onChange={handleSeek}
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
                            onSeek={handleWaveformSeek}
                        />
                    </>
                )}

                {errorMessage && (
                    <p className="audio-panel__error">{errorMessage}</p>
                )}
            </div>
        </Panel>
    );
}

export default AudioPanel;