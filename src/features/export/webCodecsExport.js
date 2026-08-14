export async function testWebCodecsExport({
    canvas,
    fps = 30,
    seconds = 4,
}) {
    if (!canvas) {
        throw new Error(
            "WebCodecs test needs a canvas."
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

    const width = canvas.width;
    const height = canvas.height;

    const codec = "vp09.00.10.08";

    const config = {
        codec,
        width,
        height,

        // Intentionally generous for our
        // 1920x1080 quality test.
        bitrate: 12_000_000,

        framerate: fps,

        // Favor quality over minimum latency.
        latencyMode: "quality",
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

    const encoder = new VideoEncoder({
        output: (chunk, metadata) => {
            const data =
                new Uint8Array(
                    chunk.byteLength
                );

            chunk.copyTo(data);

            chunks.push({
                type: chunk.type,
                timestamp: chunk.timestamp,
                duration: chunk.duration,
                data,
                metadata,
            });
        },

        error: (error) => {
            console.error(
                "WebCodecs encoder error:",
                error
            );

            encoderError = error;
        },
    });

    encoder.configure(
        support.config
    );

    const totalFrames =
        Math.round(seconds * fps);

    const frameDuration =
        1_000_000 / fps;

    console.log(
        `WebCodecs test starting: ${width}x${height}, ${fps} FPS, ${totalFrames} frames`
    );

    for (
        let frameIndex = 0;
        frameIndex < totalFrames;
        frameIndex += 1
    ) {
        if (encoderError) {
            throw encoderError;
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
                // Keyframe every 2 seconds.
                keyFrame:
                    frameIndex %
                        (fps * 2) ===
                    0,
            }
        );

        frame.close();

        /*
         * Don't let us dump hundreds of
         * 1080p frames into the encoder
         * faster than it can consume them.
         */
        if (
            encoder.encodeQueueSize > 8
        ) {
            await new Promise(
                (resolve) => {
                    setTimeout(
                        resolve,
                        0
                    );
                }
            );
        }
    }

    await encoder.flush();

    if (encoderError) {
        encoder.close();
        throw encoderError;
    }

    encoder.close();

    console.log(
        "WebCodecs test complete."
    );

    console.log(
        "Encoded chunks:",
        chunks.length
    );

    console.log(
        "First chunk:",
        chunks[0]
    );

    return {
        chunks,
        codec,
        width,
        height,
        fps,
        seconds,
        totalFrames,
    };
}