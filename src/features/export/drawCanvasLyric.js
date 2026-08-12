import getCanvasFittedFontSize from "./getCanvasFittedFontSize";

function drawCanvasLyric({
    context,
    canvas,
    text,
    style,
    animation,
    animationState,
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

    let opacity = 1;

    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let blur = 0;

    const introProgress =
        animationState?.introProgress ?? 1;

    const outroProgress =
        animationState?.outroProgress ?? 0;

    const easedIntroProgress =
        1 -
        Math.pow(
            1 - introProgress,
            2
        );

    if (
        animationState?.isInIntro &&
        animation?.intro === "fade"
    ) {
        opacity =
            easedIntroProgress;
    }


    if (animationState?.isInIntro) {
        switch (animation?.intro) {
            case "pop": {
                opacity = Math.min(
                    introProgress / 0.7,
                    1
                );

                if (introProgress < 0.7) {
                    scale =
                        0.72 +
                        (1.08 - 0.72) *
                        (introProgress / 0.7);
                } else {
                    scale =
                        1.08 -
                        0.08 *
                        ((introProgress - 0.7) / 0.3);
                }

                break;
            }

            case "zoom":
                opacity = easedIntroProgress;

                scale =
                    1.35 -
                    0.35 * easedIntroProgress;
                break;

            case "slide-up":
                opacity = easedIntroProgress;

                translateY =
                    32 *
                    renderScale *
                    (1 - easedIntroProgress);
                break;

            case "slide-down":
                opacity = easedIntroProgress;

                translateY =
                    -32 *
                    renderScale *
                    (1 - easedIntroProgress);
                break;

            case "slide-left":
                opacity = easedIntroProgress;

                translateX =
                    42 *
                    renderScale *
                    (1 - easedIntroProgress);
                break;

            case "slide-right":
                opacity = easedIntroProgress;
                translateX =
                    -42 *
                    renderScale *
                    (1 - easedIntroProgress);
                break;

            case "blur":
                opacity = easedIntroProgress;
                blur =
                    12 *
                    renderScale *
                    (1 - easedIntroProgress);
                break;

            default:
                break;
        }
    }

    if (animationState?.isInOutro) {
        switch (animation?.outro) {
            case "shrink":
                opacity =
                    1 - outroProgress;

                scale =
                    1 -
                    0.3 * outroProgress;
                break;

            case "blur":
                opacity =
                    1 - outroProgress;

                blur =
                    12 *
                    renderScale *
                    outroProgress;
                break;

            case "slide-left":
                opacity =
                    1 - outroProgress;

                translateX =
                    -48 *
                    renderScale *
                    outroProgress;
                break;

            case "slide-right":
                opacity =
                    1 - outroProgress;

                translateX =
                    48 *
                    renderScale *
                    outroProgress;
                break;

            default:
                break;
        }
    }

    if (
        animationState?.isInOutro &&
        animation?.outro === "fade"
    ) {
        opacity =
            1 - animationState.outroProgress;
    }

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

    context.globalAlpha = opacity;

    context.translate(
        canvas.width / 2 + translateX,
        centerY + translateY
    );

    context.scale(
        scale,
        scale
    );

    context.translate(
        -canvas.width / 2,
        -centerY
    );

    context.filter =
        blur > 0
            ? `blur(${blur}px)`
            : "none";


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
        drawShadowOnly = false,
    }) => {
        context.shadowColor = shadowColor;
        context.shadowBlur = shadowBlur;
        context.shadowOffsetX = shadowOffsetX;
        context.shadowOffsetY = shadowOffsetY;

        fitted.lines.forEach((line, index) => {
            const y =
                firstLineY +
                index * fitted.lineHeight;

            // Outline
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

            // Glow/shadow without painting
            // another visible copy of the glyph.
            if (drawShadowOnly) {
                const shadowDistance = 10000;

                const originalShadowOffsetX =
                    context.shadowOffsetX;

                context.shadowOffsetX =
                    originalShadowOffsetX +
                    shadowDistance;

                context.fillStyle =
                    currentStyle.color;

                context.fillText(
                    line,
                    x - shadowDistance,
                    y
                );

                context.shadowOffsetX =
                    originalShadowOffsetX;
            }

            // Normal visible text.
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
            drawShadowOnly: true,
        });

        drawLines({
            shadowColor:
                currentStyle.color,
            shadowBlur:
                18 * renderScale,
            drawShadowOnly: true,
        });

        drawLines({
            shadowColor:
                currentStyle.color,
            shadowBlur:
                8 * renderScale,
            drawShadowOnly: true,
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