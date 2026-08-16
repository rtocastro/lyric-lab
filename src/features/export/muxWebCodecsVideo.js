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

function trimAudioBuffer({
    audioBuffer,
    startTime = 0,
    duration = null,
}) {
    if (!audioBuffer) {
        return null;
    }

    const sampleRate =
        audioBuffer.sampleRate;

    const safeStartTime =
        Math.max(
            Number.isFinite(startTime)
                ? startTime
                : 0,
            0
        );

    const safeEndTime =
        Number.isFinite(duration) &&
        duration > 0
            ? Math.min(
                safeStartTime +
                    duration,
                audioBuffer.duration
            )
            : audioBuffer.duration;

    const startFrame =
        Math.floor(
            safeStartTime *
            sampleRate
        );

    const endFrame =
        Math.min(
            Math.ceil(
                safeEndTime *
                sampleRate
            ),
            audioBuffer.length
        );

    const frameCount =
        Math.max(
            endFrame -
                startFrame,
            0
        );

    if (frameCount === 0) {
        return null;
    }

    const trimmedBuffer =
        new AudioBuffer({
            length: frameCount,
            numberOfChannels:
                audioBuffer.numberOfChannels,
            sampleRate,
        });

    for (
        let channel = 0;
        channel <
        audioBuffer.numberOfChannels;
        channel += 1
    ) {
        const sourceData =
            audioBuffer.getChannelData(
                channel
            );

        const targetData =
            trimmedBuffer.getChannelData(
                channel
            );

        targetData.set(
            sourceData.subarray(
                startFrame,
                endFrame
            )
        );
    }

    return trimmedBuffer;
}

async function muxWebCodecsVideo({
    chunks,
    width,
    height,
    codec = "vp09.00.10.08",
    audioFile = null,

    // Project timeline window.
    audioStartTime = 0,
    audioDuration = null,
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
     */
    const decodedAudio =
        await decodeAudioFile(
            audioFile
        );

    const audioBuffer =
        trimAudioBuffer({
            audioBuffer:
                decodedAudio,
            startTime:
                audioStartTime,
            duration:
                audioDuration,
        });

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
     * before output starts.
     */
    await output.start();

    /*
     * VIDEO PACKETS
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
     * AUDIO
     *
     * Because this is already a trimmed
     * AudioBuffer, Mediabunny places its
     * first sample at output time 0.
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