import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";


function useAudioTransport(audioFile) {
  const audioRef = useRef(null);

  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [visualTime, setVisualTime] = useState(0);

  useEffect(() => {
    if (!audioFile) {
      setAudioUrl("");
      setIsPlaying(false);
      setCurrentTime(0);
      setVisualTime(0);
      setDuration(0);
      setErrorMessage("");

      return undefined;
    }

    const objectUrl = URL.createObjectURL(audioFile);

    setAudioUrl(objectUrl);
    setIsPlaying(false);
    setCurrentTime(0);
    setVisualTime(0);
    setDuration(0);
    setErrorMessage("");

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [audioFile]);

  const togglePlayback = useCallback(async () => {
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

      setErrorMessage(
        "The browser could not play this audio file."
      );
    }
  }, []);

  const seek = useCallback((nextTime) => {
    const audioElement = audioRef.current;

    if (
      !audioElement ||
      !Number.isFinite(nextTime)
    ) {
      return;
    }

    const safeTime = Math.min(
      Math.max(nextTime, 0),
      Number.isFinite(audioElement.duration)
        ? audioElement.duration
        : nextTime
    );

    audioElement.currentTime = safeTime;
    setCurrentTime(safeTime);
    setVisualTime(safeTime);
  }, []);

  const pause = useCallback(() => {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }

    audioElement.pause();
  }, []);

  const reset = useCallback(() => {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }



    audioElement.pause();
    audioElement.currentTime = 0;

    setCurrentTime(0);
    setIsPlaying(false);
    setVisualTime(0);
  }, []);

  const getAudioStream = useCallback(() => {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return null;
    }

    if (
      typeof audioElement.captureStream === "function"
    ) {
      return audioElement.captureStream();
    }

    if (
      typeof audioElement.mozCaptureStream === "function"
    ) {
      return audioElement.mozCaptureStream();
    }

    return null;
  }, []);

  const play = useCallback(async () => {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }

    try {
      await audioElement.play();
    } catch (error) {
      console.error(
        "Audio playback failed:",
        error
      );

      setErrorMessage(
        "The browser could not play this audio file."
      );

      throw error;
    }
  }, []);


  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

    let animationFrameId;

    const updateVisualTime = () => {
      const audioElement = audioRef.current;

      if (audioElement) {
        setVisualTime(audioElement.currentTime);
      }

      animationFrameId =
        requestAnimationFrame(updateVisualTime);
    };

    animationFrameId =
      requestAnimationFrame(updateVisualTime);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  const audioElement = audioUrl ? (
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
        const nextTime =
          event.currentTarget.currentTime;

        setCurrentTime(nextTime);

        if (!isPlaying) {
          setVisualTime(nextTime);
        }
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
        setVisualTime(0);
      }}
    />
  ) : null;

  return {
    audioElement,
    audioUrl,
    audioFile,
    isPlaying,
    currentTime,
    visualTime,
    duration,
    errorMessage,
    setErrorMessage,
    togglePlayback,
    play,
    seek,
    pause,
    reset,
    getAudioStream,
  };
}

export default useAudioTransport;