import muxWebCodecsVideo
    from "./muxWebCodecsVideo";

export async function exportWebCodecsVideo({
    canvas,
    fps = 30,
    duration,
    startTime = 0,
    renderFrame,
    audioFile = null,
    onProgress,
    signal,
}) {
    if (!canvas) {
        throw new Error(
            "WebCodecs export needs a canvas."
        );
    }

    if (
        !Number.isFinite(duration) ||
        duration <= 0
    ) {
        throw new Error(
            "WebCodecs export needs a valid duration."
        );
    }

    if (!("VideoEncoder" in window)) {
        throw new Error(
            "VideoEncoder is not supported in this browser."
        );
    }

    if (!("VideoFrame" in window)) {
        throw new Error(
            "VideoFrame is not supported in this browser."
        );
    }

    const width =
        canvas.width;

    const height =
        canvas.height;

    const codec =
        "vp09.00.10.08";

    const config = {
        codec,
        width,
        height,
        bitrate:
            12_000_000,
        framerate:
            fps,
        latencyMode:
            "quality",
    };

    const support =
        await VideoEncoder.isConfigSupported(
            config
        );

    if (!support.supported) {
        throw new Error(
            `WebCodecs does not support ${codec} at ${width}x${height}.`
        );
    }

    const chunks = [];

    let encoderError = null;

    const encoder =
        new VideoEncoder({
            output:
                (
                    chunk,
                    metadata
                ) => {
                    const data =
                        new Uint8Array(
                            chunk.byteLength
                        );

                    chunk.copyTo(
                        data
                    );

                    chunks.push({
                        type:
                            chunk.type,

                        timestamp:
                            chunk.timestamp,

                        duration:
                            chunk.duration,

                        data,

                        metadata,
                    });
                },

            error:
                (error) => {
                    console.error(
                        "WebCodecs encoder error:",
                        error
                    );

                    encoderError =
                        error;
                },
        });

    encoder.configure(
        support.config
    );

    const totalFrames =
        Math.ceil(
            duration *
            fps
        );

    const frameDuration =
        1_000_000 /
        fps;

    console.log(
        `WebCodecs export starting: ${width}x${height}, ${fps} FPS, ${totalFrames} frames`
    );

    try {
        for (
            let frameIndex = 0;
            frameIndex <
            totalFrames;
            frameIndex += 1
        ) {
            if (
                signal?.aborted
            ) {
                throw new DOMException(
                    "Export cancelled.",
                    "AbortError"
                );
            }

            if (encoderError) {
                throw encoderError;
            }

            const frameTime =
                startTime +
                frameIndex /
                fps;

            if (
                typeof renderFrame ===
                "function"
            ) {
                await renderFrame({
                    frameIndex,
                    time:
                        frameTime,
                });
            }

            const timestamp =
                Math.round(
                    frameIndex *
                    frameDuration
                );

            const frame =
                new VideoFrame(
                    canvas,
                    {
                        timestamp,

                        duration:
                            Math.round(
                                frameDuration
                            ),
                    }
                );

            encoder.encode(
                frame,
                {
                    keyFrame:
                        frameIndex %
                            (
                                fps *
                                2
                            ) ===
                        0,
                }
            );

            frame.close();

            /*
             * Backpressure.
             *
             * Export may run slower than
             * realtime, but output timing
             * remains exact.
             */
            while (
                encoder.encodeQueueSize >
                8
            ) {
                if (
                    signal?.aborted
                ) {
                    throw new DOMException(
                        "Export cancelled.",
                        "AbortError"
                    );
                }

                await new Promise(
                    (
                        resolve
                    ) => {
                        setTimeout(
                            resolve,
                            0
                        );
                    }
                );
            }

            if (
                typeof onProgress ===
                "function"
            ) {
                const progress =
                    (
                        frameIndex +
                        1
                    ) /
                    totalFrames;

                onProgress(
                    progress
                );
            }
        }

        await encoder.flush();

        if (encoderError) {
            throw encoderError;
        }

        if (
            signal?.aborted
        ) {
            throw new DOMException(
                "Export cancelled.",
                "AbortError"
            );
        }

        /*
         * The deterministic video is
         * finished. Now mux the matching
         * section of the original audio.
         */
        const blob =
            await muxWebCodecsVideo({
                chunks,
                codec,
                width,
                height,
                audioFile,

                audioStartTime:
                    startTime,

                audioDuration:
                    duration,
            });

        if (
            typeof onProgress ===
            "function"
        ) {
            onProgress(1);
        }

        console.log(
            "WebCodecs export complete."
        );

        console.log(
            "Encoded frames:",
            chunks.length
        );

        return {
            blob,
            codec,
            width,
            height,
            fps,
            duration,
            startTime,
            totalFrames,
        };
    } finally {
        if (
            encoder.state !==
            "closed"
        ) {
            encoder.close();
        }
    }
}

/*
 * Keep our known-good short test,
 * but run it through the same engine
 * that production export uses.
 */
export async function testWebCodecsExport({
    canvas,
    fps = 30,
    seconds = 4,
    startTime = 0,
    renderFrame,
    audioFile = null,
    onProgress,
    signal,
}) {
    return exportWebCodecsVideo({
        canvas,
        fps,
        duration:
            seconds,
        startTime,
        renderFrame,
        audioFile,
        onProgress,
        signal,
    });
}