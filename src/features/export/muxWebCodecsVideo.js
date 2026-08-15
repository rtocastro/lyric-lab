import {
    AudioBufferSource,
    BufferTarget,
    EncodedPacket,
    EncodedVideoPacketSource,
    Output,
    WebMOutputFormat,
} from "mediabunny";

async function decodeAudioFile(
    audioFile
) {
    if (!audioFile) {
        return null;
    }

    const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioContextClass) {
        throw new Error(
            "Web Audio is not supported in this browser."
        );
    }

    const audioContext =
        new AudioContextClass();

    try {
        const arrayBuffer =
            await audioFile.arrayBuffer();

        return await audioContext.decodeAudioData(
            arrayBuffer
        );
    } finally {
        await audioContext.close();
    }
}

async function muxWebCodecsVideo({
    chunks,
    width,
    height,
    codec = "vp09.00.10.08",
    audioFile = null,
}) {
    if (
        !Array.isArray(chunks) ||
        chunks.length === 0
    ) {
        throw new Error(
            "No encoded video chunks were provided."
        );
    }

    const target =
        new BufferTarget();

    const output =
        new Output({
            format:
                new WebMOutputFormat(),
            target,
        });

    /*
     * VIDEO
     */
    const videoSource =
        new EncodedVideoPacketSource(
            "vp9"
        );

    output.addVideoTrack(
        videoSource
    );

    /*
     * AUDIO
     *
     * Decode the original song rather
     * than recording realtime playback.
     */
    const audioBuffer =
        await decodeAudioFile(
            audioFile
        );

    let audioSource = null;

    if (audioBuffer) {
        audioSource =
            new AudioBufferSource({
                codec: "opus",
                bitrate: 192_000,
            });

        output.addAudioTrack(
            audioSource
        );
    }

    /*
     * All tracks must be registered
     * before Output starts.
     */
    await output.start();

    /*
     * Feed deterministic VP9 packets.
     */
    for (
        let index = 0;
        index < chunks.length;
        index += 1
    ) {
        const chunk =
            chunks[index];

        const timestamp =
            chunk.timestamp /
            1_000_000;

        const duration =
            Number.isFinite(
                chunk.duration
            )
                ? chunk.duration /
                    1_000_000
                : 0;

        const packet =
            new EncodedPacket(
                chunk.data,
                chunk.type,
                timestamp,
                duration
            );

        if (index === 0) {
            await videoSource.add(
                packet,
                {
                    decoderConfig: {
                        codec,
                        codedWidth:
                            width,
                        codedHeight:
                            height,
                    },
                }
            );
        } else {
            await videoSource.add(
                packet
            );
        }
    }

    videoSource.close();

    /*
     * Feed the decoded song to the
     * Opus encoder.
     */
    if (
        audioSource &&
        audioBuffer
    ) {
        await audioSource.add(
            audioBuffer
        );

        audioSource.close();
    }

    await output.finalize();

    if (!target.buffer) {
        throw new Error(
            "WebM muxing produced no output buffer."
        );
    }

    return new Blob(
        [target.buffer],
        {
            type: "video/webm",
        }
    );
}

export default muxWebCodecsVideo;