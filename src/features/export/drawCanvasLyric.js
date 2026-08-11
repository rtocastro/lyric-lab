import getCanvasFittedFontSize from "./getCanvasFittedFontSize";

function drawCanvasLyric({
    context,
    canvas,
    text,
    style,
}) {
    if (
        !context ||
        !canvas ||
        !text
    ) {
        return;
    }

    const currentStyle = {
        fontFamily: "Montserrat",
        fontSize: 72,
        color: "#FFFFFF",
        outlineColor: "#000000",
        outlineWidth: 2,
        shadow: true,
        glow: false,
        position: "center",
        textAlign: "center",
        ...style,
    };

    const renderedText =
    text.toUpperCase();

    const DESIGN_WIDTH = 720;

    const renderScale =
        canvas.width / DESIGN_WIDTH;

    const safeWidth =
        canvas.width * 0.86;

    const safeHeight =
        canvas.height * 0.52;

    const fitted = getCanvasFittedFontSize({
        context,
        text: renderedText,
        requestedFontSize:
            currentStyle.fontSize *
            renderScale,
        fontFamily:
            currentStyle.fontFamily,
        fontWeight: 700,
        maxWidth: safeWidth,
        maxHeight: safeHeight,
        minimumFontSize:
            18 * renderScale,
    });

    context.save();

    context.font =
        `700 ${fitted.fontSize}px ${currentStyle.fontFamily}`;

    context.textAlign =
        currentStyle.textAlign;

    context.textBaseline = "middle";

    context.lineJoin = "round";

    let x;

    switch (currentStyle.textAlign) {
        case "left":
            x =
                (canvas.width - safeWidth) / 2;
            break;

        case "right":
            x =
                canvas.width -
                (canvas.width - safeWidth) / 2;
            break;

        case "center":
        default:
            x = canvas.width / 2;
            break;
    }

    let centerY;

    switch (currentStyle.position) {
        case "top":
            centerY = canvas.height * 0.23;
            break;

        case "bottom":
            centerY = canvas.height * 0.73;
            break;

        case "center":
        default:
            centerY = canvas.height * 0.5;
            break;
    }

    const totalTextHeight =
        fitted.lines.length *
        fitted.lineHeight;

    const firstLineY =
        centerY -
        totalTextHeight / 2 +
        fitted.lineHeight / 2;


    const drawLines = ({
        shadowColor = "transparent",
        shadowBlur = 0,
        shadowOffsetX = 0,
        shadowOffsetY = 0,
        drawStroke = false,
        drawFill = false,
    }) => {
        context.shadowColor = shadowColor;
        context.shadowBlur = shadowBlur;
        context.shadowOffsetX = shadowOffsetX;
        context.shadowOffsetY = shadowOffsetY;

        fitted.lines.forEach((line, index) => {
            const y =
                firstLineY +
                index * fitted.lineHeight;

            if (
                drawStroke &&
                currentStyle.outlineWidth > 0
            ) {
                context.strokeStyle =
                    currentStyle.outlineColor;

                context.lineWidth =
                    currentStyle.outlineWidth *
                    renderScale *
                    3;

                context.strokeText(
                    line,
                    x,
                    y
                );
            }

            if (drawFill) {
                context.fillStyle =
                    currentStyle.color;

                context.fillText(
                    line,
                    x,
                    y
                );
            }
        });
    };

    // Dark drop shadow.
    if (currentStyle.shadow) {
        drawLines({
            shadowColor:
                "rgba(0, 0, 0, 0.75)",
            shadowBlur:
                16 * renderScale,
            shadowOffsetY:
                5 * renderScale,
            drawFill: true,
        });
    }

    // Glow layers.
    // Matches the stacked CSS text-shadow more closely.
    if (currentStyle.glow) {
        drawLines({
            shadowColor:
                currentStyle.color,
            shadowBlur:
                34 * renderScale,
            drawFill: true,
        });

        drawLines({
            shadowColor:
                currentStyle.color,
            shadowBlur:
                18 * renderScale,
            drawFill: true,
        });

        drawLines({
            shadowColor:
                currentStyle.color,
            shadowBlur:
                8 * renderScale,
            drawFill: true,
        });
    }

    // Clean outline pass.
    drawLines({
        drawStroke: true,
    });

    // Final clean text fill.
    // No shadow/glow here so the glyph stays crisp.
    drawLines({
        drawFill: true,
    });

    context.restore();
}

export default drawCanvasLyric; 