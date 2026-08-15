import {
    BufferTarget,
    EncodedPacket,
    EncodedVideoPacketSource,
    Output,
    WebMOutputFormat,
} from "mediabunny";

async function muxWebCodecsVideo({
    chunks,
    width,
    height,
    codec = "vp09.00.10.08",
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
     * Mediabunny uses the generic codec
     * name here rather than the full
     * WebCodecs codec string.
     */
    const videoSource =
        new EncodedVideoPacketSource(
            "vp9"
        );

    output.addVideoTrack(
        videoSource
    );

    await output.start();

    for (
        let index = 0;
        index < chunks.length;
        index += 1
    ) {
        const chunk =
            chunks[index];

        /*
         * Our WebCodecs test stores
         * timestamps/durations in
         * microseconds. Mediabunny
         * EncodedPacket uses seconds.
         */
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

    /*
     * Signals that no additional
     * video packets are coming.
     */
    videoSource.close();

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