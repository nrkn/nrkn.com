// assumes canvas is `object-fit: contain` & `object-position: 50% 50%`
export const transformEventPoint = (canvas, eventPoint) => {
    const { width: naturalWidth, height: naturalHeight } = canvas;
    const { width: clientWidth, height: clientHeight } = canvas.getBoundingClientRect();
    const clientRatio = clientWidth / clientHeight;
    const naturalRatio = naturalWidth / naturalHeight;
    let sw = 0;
    let sh = 0;
    if (naturalRatio > clientRatio) {
        sw = 1;
        sh = (naturalHeight / clientHeight) / (naturalWidth / clientWidth);
    }
    else {
        sw = (naturalWidth / clientWidth) / (naturalHeight / clientHeight);
        sh = 1;
    }
    const canvasSize = {
        width: clientWidth * sw,
        height: clientHeight * sh
    };
    const canvasPosition = {
        x: (clientWidth - canvasSize.width) / 2,
        y: (clientHeight - canvasSize.height) / 2
    };
    const { x: eventX, y: eventY } = eventPoint;
    const clientX = eventX - canvasPosition.x;
    const clientY = eventY - canvasPosition.y;
    const pixelX = (naturalWidth / canvasSize.width) * clientX;
    const pixelY = (naturalHeight / canvasSize.height) * clientY;
    const pixel = {
        x: pixelX,
        y: pixelY
    };
    return pixel;
};
//# sourceMappingURL=transform-event-point.js.map