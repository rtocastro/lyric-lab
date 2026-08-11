function getCanvasFittedFontSize({
    context,
    text,
    requestedFontSize,
    fontFamily,
    fontWeight = 700,
    maxWidth,
    maxHeight,
    minimumFontSize = 18,
    lineHeight = 1.05,
}) {
    if (
        !context ||
        !text ||
        !Number.isFinite(requestedFontSize) ||
        !Number.isFinite(maxWidth) ||
        !Number.isFinite(maxHeight)
    ) {
        return minimumFontSize;
    }

    const maximumFontSize = Math.max(
        requestedFontSize,
        minimumFontSize
    );

    const words = text
        .trim()
        .split(/\s+/);

    const measureAtSize = (fontSize) => {
        context.font =
            `${fontWeight} ${fontSize}px ${fontFamily}`;

        const lines = [];

        let currentLine = "";

        for (const word of words) {
            const testLine = currentLine
                ? `${currentLine} ${word}`
                : word;

            const width =
                context.measureText(testLine).width;

            if (
                width <= maxWidth ||
                !currentLine
            ) {
                currentLine = testLine;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        const widestLine = Math.max(
            ...lines.map(
                (line) =>
                    context.measureText(line).width
            ),
            0
        );

        const totalHeight =
            lines.length *
            fontSize *
            lineHeight;

        return {
            lines,
            widestLine,
            totalHeight,
        };
    };

    let low = minimumFontSize;
    let high = maximumFontSize;
    let bestFit = minimumFontSize;

    while (low <= high) {
        const middle = Math.floor(
            (low + high) / 2
        );

        const measurement =
            measureAtSize(middle);

        const fits =
            measurement.widestLine <= maxWidth &&
            measurement.totalHeight <= maxHeight;

        if (fits) {
            bestFit = middle;
            low = middle + 1;
        } else {
            high = middle - 1;
        }
    }

    const finalMeasurement =
        measureAtSize(bestFit);

    return {
        fontSize: bestFit,
        lines: finalMeasurement.lines,
        lineHeight:
            bestFit * lineHeight,
    };
}

export default getCanvasFittedFontSize;