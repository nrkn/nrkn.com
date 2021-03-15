(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSequence = (length, mapper) => Array.from({ length }, (_v, k) => mapper(k));
exports.flatten = (values) => {
    if ('flat' in values)
        return values['flat']();
    const result = [];
    values.forEach(a => result.push(...a));
    return result;
};
exports.average = (values) => values.reduce((a, b) => a + b) / values.length;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bresenham = ({ x: x0, y: y0 }, { x: x1, y: y1 }) => {
    x0 = x0 | 0;
    y0 = y0 | 0;
    x1 = x1 | 0;
    y1 = y1 | 0;
    const line = [{ x: x0, y: y0 }];
    const dX = Math.abs(x1 - x0);
    const dY = Math.abs(y1 - y0);
    const sX = x0 < x1 ? 1 : -1;
    const sY = y0 < y1 ? 1 : -1;
    let err = dX - dY;
    while (x0 !== x1 || y0 !== y1) {
        const err2 = 2 * err;
        if (err2 > dY * -1) {
            err -= dY;
            x0 += sX;
        }
        if (err2 < dX) {
            err += dX;
            y0 += sY;
        }
        line.push({ x: x0, y: y0 });
    }
    return line;
};

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageToImageData = (image) => {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    const imageData = context.getImageData(0, 0, image.naturalWidth, image.naturalHeight);
    return imageData;
};
exports.imageDataToImageRows = (imageData) => {
    const { width, height } = imageData;
    const data = new Array(width);
    const imageRows = { width, height, data };
    for (let x = 0; x < width; x++) {
        const row = new Uint8ClampedArray(height * 4);
        for (let y = 0; y < height; y++) {
            const sourceIndex = (y * width + x) * 4;
            const destIndex = y * 4;
            for (let channel = 0; channel < 4; channel++) {
                row[destIndex + channel] = imageData.data[sourceIndex + channel];
            }
        }
        data[x] = row;
    }
    return imageRows;
};

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array_1 = require("./array");
const random_1 = require("./random");
const image_1 = require("./image");
const bresenham_1 = require("./bresenham");
const row_1 = require("./row");
const vector_1 = require("./vector");
const loadImage = (src) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
        if (image.naturalWidth === 0 && image.naturalHeight === 0) {
            return reject(Error('Expected a valid image'));
        }
        resolve(image);
    };
    image.src = src;
});
document.addEventListener('DOMContentLoaded', () => start());
const viewSize = {
    width: 640,
    height: 400
};
const { width, height } = viewSize;
const center = {
    x: width / 2,
    y: height / 2
};
const wallCount = 20;
const start = async () => {
    //const wallImage = await loadImage( 'RW10_3.png' )
    const wallImage = await loadImage('wall-hole.png');
    const wallRows = image_1.imageDataToImageRows(image_1.imageToImageData(wallImage));
    const canvas = document.getElementById('c');
    const debug = document.querySelector('pre');
    Object.assign(canvas, viewSize);
    const context = canvas.getContext('2d');
    const imageData = context.createImageData(width, height);
    const lineVectors = array_1.createSequence(wallCount, () => random_1.randLine(viewSize));
    const fpses = new Array(10);
    fpses.fill(60);
    let last = 0;
    let angle = 0;
    const clear = () => {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                if (imageData.data[index + 3] !== 0)
                    continue;
                imageData.data[index] = 0;
                imageData.data[index + 1] = 0;
                imageData.data[index + 2] = 0;
                imageData.data[index + 3] = 255;
            }
        }
    };
    const draw = (time = 0) => {
        const elapsed = time - last;
        const fps = elapsed === 0 ? 60 : (1000 / elapsed);
        fpses.shift();
        fpses.push(fps);
        last = time;
        imageData.data.fill(0);
        angle = (angle + (elapsed / 17)) % 360;
        const radians = angle * (Math.PI / 180);
        const rotatedLineVectors = lineVectors.map(l => vector_1.rotateLine(l, radians, center));
        const lines = rotatedLineVectors.map(l => bresenham_1.bresenham(...l));
        const lineRows = lines.map(row_1.lineToRows);
        const rows = array_1.flatten(lineRows).sort(({ y: y0 }, { y: y1 }) => y1 - y0);
        rows.forEach(row => {
            const { x: rx, y: ry } = row;
            let { sourceX } = row;
            const startY = ry - wallImage.naturalHeight;
            const wallRow = wallRows.data[sourceX % wallImage.naturalWidth];
            const dest = { x: rx, y: startY };
            const height = wallImage.naturalHeight;
            for (let y = 0; y < height; y++) {
                const sy = height - 1 - y;
                const sourceIndex = sy * 4;
                const dx = dest.x;
                const dy = dest.y + sy;
                if (dy < 0)
                    continue;
                const destIndex = (dy * imageData.width + dx) * 4;
                if (imageData.data[destIndex + 3] !== 0)
                    continue;
                if (wallRow[sourceIndex + 3] === 0)
                    continue;
                imageData.data[destIndex] = wallRow[sourceIndex];
                imageData.data[destIndex + 1] = wallRow[sourceIndex + 1];
                imageData.data[destIndex + 2] = wallRow[sourceIndex + 2];
                imageData.data[destIndex + 3] = wallRow[sourceIndex + 3];
            }
        });
        const length = rows.length;
        clear();
        context.putImageData(imageData, 0, 0);
        const avFps = array_1.average(fpses);
        debug.innerText = `${avFps.toFixed(0).padStart(3, ' ')} fps / ${length} rows`;
        requestAnimationFrame(draw);
    };
    draw();
};

},{"./array":1,"./bresenham":2,"./image":3,"./random":5,"./row":6,"./vector":7}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randInt = (exclMax) => Math.floor(Math.random() * exclMax);
exports.randVector = ({ width, height }) => {
    const x = exports.randInt(width);
    const y = exports.randInt(height);
    return { x, y };
};
exports.randLine = (size) => [exports.randVector(size), exports.randVector(size)];

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lineToRows = (linePoints) => linePoints.map(({ x, y }, sourceX) => ({ x, y, sourceX }));

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rotate = ({ x, y }, radians, { x: cx, y: cy } = { x: 0, y: 0 }) => {
    const rx = (Math.cos(radians) * (x - cx) -
        Math.sin(radians) * (y - cy) +
        cx);
    const ry = (Math.sin(radians) * (x - cx) +
        Math.cos(radians) * (y - cy) +
        cy);
    return { x: rx, y: ry };
};
exports.rotateLine = ([v0, v1], radians, c = { x: 0, y: 0 }) => [
    exports.rotate(v0, radians, c),
    exports.rotate(v1, radians, c)
];

},{}]},{},[4]);
