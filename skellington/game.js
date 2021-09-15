(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bresenhamLine = void 0;
const bresenhamLine = ({ x1, y1, x2, y2 }) => {
    x1 |= 0;
    y1 |= 0;
    x2 |= 0;
    y2 |= 0;
    const result = [];
    const dX = Math.abs(x2 - x1);
    const dY = Math.abs(y2 - y1);
    const sX = x1 < x2 ? 1 : -1;
    const sY = y1 < y2 ? 1 : -1;
    let err = dX - dY;
    result.push({ x: x1, y: y1 });
    while (x1 !== x2 || y1 !== y2) {
        const err2 = 2 * err;
        if (err2 > dY * -1) {
            err -= dY;
            x1 += sX;
        }
        if (err2 < dX) {
            err += dX;
            y1 += sY;
        }
        result.push({ x: x1, y: y1 });
    }
    return result;
};
exports.bresenhamLine = bresenhamLine;

},{}],2:[function(require,module,exports){
"use strict";
// see if we can make an svg path and render it to canvas
Object.defineProperty(exports, "__esModule", { value: true });
const dom_app_1 = require("dom-app");
const bresenham_1 = require("./bresenham");
const color_1 = require("./color");
const line_1 = require("./geometry/line");
const animation_1 = require("./skeleton/animation");
const walk_1_1 = require("./skeleton/walk-1");
const bgColor = [25, 75, 127];
const pixelSize = 256;
const size = { width: pixelSize, height: pixelSize };
const svgEl = dom_app_1.svg();
const point = svgEl.createSVGPoint();
const shape = dom_app_1.path({
    d: `M94.9,244.7c10-23.9,13.5-39.6,12.7-55.8c-0.3-5.6-3.3-11.9-9.6-20.4C91.6,160,82,140,79.4,123.6s2.4-38.9,12.2-51.9
      c11.4-15,31.5-25.4,52.3-26.3c22-1,39.7,1.3,53.7,10.3s20.2,22.9,22.4,34.9s5.6,14.2,2.2,21.9c-2.7,6.3-0.4,12.5,4.4,19
      s11,14.1,10.4,18.2c-0.5,4.1-5.6,5-7.4,5.7s-6.5,0.7-2.3,9.8c1.2,2.6,3.4,5.8-3,9.3c3.5,2.1,2.9,3.2,2.9,4.6c0,2.5-4.8,3.8-3.3,9.9
      c1.5,6.1,1.8,14.9-4.1,15.9c-11.4,2.1-17.9-0.2-25.2-0.1c-4.5,0.1-9.1,2.7-10.4,6.6c-1.8,5.7-3.1,14.3-2.2,21.7
      c0.7,5.8,1.7,7.9,3.5,11.5C178.2,244.7,94.9,244.7,94.9,244.7z`,
    fill: 'black'
});
svgEl.append(shape);
document.body.append(svgEl);
const start = async () => {
    const canvas = await dom_app_1.drawingMapper.size.canvas(size);
    const context = await dom_app_1.drawingMapper.canvas.context(canvas);
    document.body.prepend(canvas);
    const drawAnimation = (imageData, startTime, currentTime) => {
        const frames = walk_1_1.skelStates.walk;
        const frameIndex = animation_1.getFrameIndex(frames, startTime, currentTime);
        if (frameIndex === undefined)
            return;
        const frame = frames[frameIndex];
        const { vecs, edgeOrder, edges } = frame;
        const vecKeys = Object.keys(vecs);
        const vecColors = color_1.sampleHues(vecKeys.length);
        vecKeys.forEach((key, i) => {
            const vec = vecs[key];
            const { x, y } = vec;
            const [r, g, b] = vecColors[i];
            const index = y * size.width + x;
            const dataIndex = index * 4;
            imageData.data[dataIndex] = r;
            imageData.data[dataIndex + 1] = g;
            imageData.data[dataIndex + 2] = b;
            imageData.data[dataIndex + 3] = 255;
        });
        const edgeColors = color_1.sampleHues(edgeOrder.length);
        edgeOrder.forEach((key, i) => {
            const edge = edges[key];
            const [startVecKey, endVecKey] = edge;
            const startVec = vecs[startVecKey];
            const endVec = vecs[endVecKey];
            const line = bresenham_1.bresenhamLine(line_1.createLine(startVec, endVec));
            const [r, g, b] = edgeColors[i];
            line.forEach(({ x, y }) => {
                const index = y * size.width + x;
                const dataIndex = index * 4;
                imageData.data[dataIndex] = r;
                imageData.data[dataIndex + 1] = g;
                imageData.data[dataIndex + 2] = b;
                imageData.data[dataIndex + 3] = 255;
            });
        });
    };
    let startTime;
    const tick = (time = 0) => {
        if (startTime === undefined) {
            startTime = time;
        }
        const imageData = new ImageData(size.width, size.height);
        const testLine = { x1: 3, y1: 56, x2: 138, y2: 217 };
        const testLinePixels = bresenham_1.bresenhamLine(testLine);
        for (let y = 0; y < size.height; y++) {
            for (let x = 0; x < size.width; x++) {
                let [r, g, b] = bgColor;
                const index = y * size.width + x;
                const dataIndex = index * 4;
                point.x = x;
                point.y = y;
                if (shape.isPointInFill(point)) {
                    r = 0;
                    g = 0;
                    b = 0;
                }
                imageData.data[dataIndex] = r;
                imageData.data[dataIndex + 1] = g;
                imageData.data[dataIndex + 2] = b;
                imageData.data[dataIndex + 3] = 255;
            }
        }
        testLinePixels.forEach(({ x, y }) => {
            const index = y * size.width + x;
            const dataIndex = index * 4;
            imageData.data[dataIndex] = 255;
            imageData.data[dataIndex + 1] = 255;
            imageData.data[dataIndex + 2] = 255;
            imageData.data[dataIndex + 3] = 255;
        });
        drawAnimation(imageData, startTime, time);
        context.putImageData(imageData, 0, 0);
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
};
start().catch(console.error);
// const north: Line = [ [ 0, 1 ], [ 0, 0 ] ]
// const northEast: Line = [ [ 0, 1 ], [ 1, 0 ] ]
// const east: Line = [ [ 0, 0 ], [ 1, 0 ] ]
// const south: Line = [ [ 0, 0 ], [ 0, 1 ] ]
// console.log( 'angle north', lineAngle( north ) )
// const lineNorth = lineFromAngle( [ 0, 1 ], 90 )
// console.log( ...north, ...lineNorth )
// console.log( 'angle northEast', lineAngle( northEast ) )
// console.log( 'angle east', lineAngle( east ) )
// console.log( 'angle south', lineAngle( south ) )
// const degs = 45
// const rads = degToRad( degs )
// console.log( degs, rads, radToDeg( rads ) )
// const v1 = vectorFromAngle( 0 )
// const angle = vectorToAngle( v1 )
// console.log( 0, v1, angle )
// const northLine: Line = [ [ 0, 1 ], [ 0, 0 ] ]
// const northAngle = lineDegs( northLine )
// const northLine2 = lineFromDegs( [ 0, 1 ], northAngle )
// console.log( { northLine, northAngle, northLine2 } )

},{"./bresenham":1,"./color":3,"./geometry/line":7,"./skeleton/animation":9,"./skeleton/walk-1":11,"dom-app":36}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sampleHues = exports.rgbToHsl8 = exports.rgbToHsl = exports.hslToHsl8 = exports.hsl8ToHsl = exports.hsl8ToRgb = exports.rgbToHsl8ToRgb = exports.hslToRgb = void 0;
const consts_1 = require("./consts");
// hue is 0-359
// sat is 0-1
// light is 0-1
const hslToRgb = (hue, saturation, lightness) => {
    const chroma = (1 - Math.abs((2 * lightness) - 1)) * saturation;
    const huePrime = hue / 60;
    const secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));
    const huePrimeInt = Math.floor(huePrime);
    const lightnessAdjustment = lightness - (chroma / 2);
    let red = 0;
    let green = 0;
    let blue = 0;
    if (huePrimeInt === 0) {
        red = chroma;
        green = secondComponent;
        blue = 0;
    }
    else if (huePrimeInt === 1) {
        red = secondComponent;
        green = chroma;
        blue = 0;
    }
    else if (huePrimeInt === 2) {
        red = 0;
        green = chroma;
        blue = secondComponent;
    }
    else if (huePrimeInt === 3) {
        red = 0;
        green = secondComponent;
        blue = chroma;
    }
    else if (huePrimeInt === 4) {
        red = secondComponent;
        green = 0;
        blue = chroma;
    }
    else if (huePrimeInt === 5) {
        red = chroma;
        green = 0;
        blue = secondComponent;
    }
    red += lightnessAdjustment;
    green += lightnessAdjustment;
    blue += lightnessAdjustment;
    return [
        Math.abs(Math.round(red * 255)),
        Math.abs(Math.round(green * 255)),
        Math.abs(Math.round(blue * 255))
    ];
};
exports.hslToRgb = hslToRgb;
const rgbToHsl8ToRgb = (r, g, b) => exports.hsl8ToRgb(...exports.rgbToHsl8(r, g, b));
exports.rgbToHsl8ToRgb = rgbToHsl8ToRgb;
const hsl8ToRgb = (hue, saturation, lightness) => exports.hslToRgb(...exports.hsl8ToHsl(hue, saturation, lightness));
exports.hsl8ToRgb = hsl8ToRgb;
const hueStep = 360 / consts_1.hueCount; // we divide by 16 instead of 15 because 0 === 360
const saturationStep = 1 / (consts_1.satCount - 1);
const lightnessStep = 1 / (consts_1.lumCount - 1);
const hsl8ToHsl = (h8, s8, l8) => [h8 * hueStep, s8 * saturationStep, l8 * lightnessStep];
exports.hsl8ToHsl = hsl8ToHsl;
const hslToHsl8 = (h, s, l) => [h / hueStep, s / saturationStep, l / lightnessStep];
exports.hslToHsl8 = hslToHsl8;
const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    let l = (max + min) / 2;
    if (max === min) {
        h = s = 0; // achromatic
    }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: {
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            }
            case g: {
                h = (b - r) / d + 2;
                break;
            }
            case b: {
                h = (r - g) / d + 4;
                break;
            }
        }
        h *= 60;
    }
    return [h, s, l];
};
exports.rgbToHsl = rgbToHsl;
const rgbToHsl8 = (r, g, b) => exports.hslToHsl8(...exports.rgbToHsl(r, g, b));
exports.rgbToHsl8 = rgbToHsl8;
const sampleHues = (size) => {
    const step = 360 / size + 1;
    const result = [];
    let hue = 0;
    while (hue < 360) {
        const hsl = [hue | 0, 1, 0.5];
        result.push(hsl);
        hue += step;
    }
    return result.map(hsl => exports.hslToRgb(...hsl));
};
exports.sampleHues = sampleHues;

},{"./consts":4}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lumCount = exports.hueCount = exports.satCount = exports.tileSize = exports.gridSize = exports.viewSize = void 0;
exports.viewSize = 512;
exports.gridSize = 32;
exports.tileSize = 16;
exports.satCount = 5;
exports.hueCount = 12;
exports.lumCount = 7;

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.degToRad = exports.radToDeg = void 0;
const consts_1 = require("./consts");
const radToDeg = (rads) => rads * consts_1.degreeStep;
exports.radToDeg = radToDeg;
const degToRad = (degs) => degs * consts_1.radianStep;
exports.degToRad = degToRad;

},{"./consts":6}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.degreeStep = exports.radianStep = void 0;
exports.radianStep = Math.PI / 180;
exports.degreeStep = 180 / Math.PI;

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lineIntersection = exports.lineToQuad = exports.lineToPoints = exports.lineEnd = exports.lineStart = exports.lineFromRads = exports.createLine = void 0;
const angle_1 = require("./angle");
const vector_1 = require("./vector");
const createLine = (v1 = vector_1.createVector(), v2 = vector_1.createVector()) => ({ x1: v1.x, y1: v1.y, x2: v2.x, y2: v2.y });
exports.createLine = createLine;
const lineFromRads = (start = vector_1.createVector(), rads = 0, length = 1) => {
    const translated = vector_1.vectorFromRads(start, rads, length);
    const line = {
        x1: start.x, y1: start.y, x2: translated.x, y2: translated.y
    };
    return line;
};
exports.lineFromRads = lineFromRads;
const lineStart = (line) => ({ x: line.x1, y: line.y1 });
exports.lineStart = lineStart;
const lineEnd = (line) => ({ x: line.x2, y: line.y2 });
exports.lineEnd = lineEnd;
const lineToPoints = (line) => [exports.lineStart(line), exports.lineEnd(line)];
exports.lineToPoints = lineToPoints;
const rightAngle = angle_1.degToRad(90);
const lineToQuad = (line, width) => {
    const segWidth = width / 2;
    const start = exports.lineStart(line);
    const end = exports.lineEnd(line);
    const delta = vector_1.subtractVector(end, start);
    const unit = vector_1.normalizeVector(delta);
    const rads = vector_1.unitVectorToRads(unit);
    const radsLeft = rads + rightAngle;
    const radsRight = rads - rightAngle;
    // clockwise winding 
    const v1 = vector_1.vectorFromRads(start, radsLeft, segWidth);
    const v2 = vector_1.vectorFromRads(start, radsRight, segWidth);
    const v3 = vector_1.vectorFromRads(end, radsRight, segWidth);
    const v4 = vector_1.vectorFromRads(end, radsLeft, segWidth);
    return [v1, v2, v3, v4];
};
exports.lineToQuad = lineToQuad;
const lineIntersection = (l1, l2) => {
    const { x1, y1, x2, y2 } = l1;
    const { x1: x3, y1: y3, x2: x4, y2: y4 } = l2;
    const denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
    const numeA = ((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3));
    const numeB = ((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3));
    if (denom === 0) {
        if (numeA === 0 && numeB === 0) {
            return 'colinear';
        }
        return 'parallel';
    }
    const uA = numeA / denom;
    const uB = numeB / denom;
    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
        const x = x1 + (uA * (x2 - x1));
        const y = y1 + (uA * (y2 - y1));
        return { x, y };
    }
    return 'none';
};
exports.lineIntersection = lineIntersection;

},{"./angle":5,"./vector":8}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isVector = exports.vectorFromRads = exports.roundVector = exports.ceilVector = exports.floorVector = exports.lerpVectors = exports.rotateVector = exports.vectorEquals = exports.divideVector = exports.subtractVector = exports.multiplyVector = exports.scaleVector = exports.addVector = exports.translateVector = exports.cloneVector = exports.createVector = exports.scaleUnitVector = exports.normalizeVector = exports.vectorTuple = exports.vectorDistance = exports.vectorCross = exports.vectorDot = exports.unitVectorToRads = exports.cloneUnitVector = exports.createUnitVector = void 0;
const createUnitVector = (rads = 0) => {
    const ux = Math.cos(rads);
    const uy = Math.sin(rads);
    return { ux, uy };
};
exports.createUnitVector = createUnitVector;
const cloneUnitVector = (uv) => ({ ux: uv.ux, uy: uv.uy });
exports.cloneUnitVector = cloneUnitVector;
const unitVectorToRads = (uv) => Math.atan2(uv.uy, uv.ux);
exports.unitVectorToRads = unitVectorToRads;
const vectorDot = (v1, v2) => v1.x * v2.x + v1.y * v2.y;
exports.vectorDot = vectorDot;
const vectorCross = (v1, v2) => v1.x * v2.x - v1.y * v2.y;
exports.vectorCross = vectorCross;
const vectorDistance = (v) => Math.sqrt(v.x * v.x + v.y * v.y);
exports.vectorDistance = vectorDistance;
const vectorTuple = (v) => [v.x, v.y];
exports.vectorTuple = vectorTuple;
const normalizeVector = (v) => {
    const distance = exports.vectorDistance(v);
    const ux = v.x / distance;
    const uy = v.y / distance;
    return { ux, uy };
};
exports.normalizeVector = normalizeVector;
const scaleUnitVector = (u, scalar = 1) => ({ x: u.ux * scalar, y: u.uy * scalar });
exports.scaleUnitVector = scaleUnitVector;
const createVector = (x = 0, y = x) => ({ x, y });
exports.createVector = createVector;
const cloneVector = (v) => ({ x: v.x, y: v.y });
exports.cloneVector = cloneVector;
const translateVector = (v1, v2) => ({ x: v1.x + v2.x, y: v1.y + v2.y });
exports.translateVector = translateVector;
exports.addVector = exports.translateVector;
const scaleVector = (v1, v2) => ({ x: v1.x * v2.x, y: v1.y * v2.y });
exports.scaleVector = scaleVector;
exports.multiplyVector = exports.scaleVector;
const subtractVector = (v1, v2) => ({ x: v1.x - v2.x, y: v1.y - v2.y });
exports.subtractVector = subtractVector;
const divideVector = (v1, v2) => ({ x: v1.x / v2.x, y: v1.y / v2.y });
exports.divideVector = divideVector;
const vectorEquals = (v1, v2) => v1.x === v2.x && v1.y === v2.y;
exports.vectorEquals = vectorEquals;
const rotateVector = (v, rads, origin = exports.createVector()) => {
    const cos = Math.cos(rads);
    const sin = Math.sin(rads);
    const run = v.x - origin.x;
    const rise = v.y - origin.y;
    const x = (cos * run) - (sin * rise) + origin.x;
    const y = (cos * rise) + (sin * run) + origin.y;
    return { x, y };
};
exports.rotateVector = rotateVector;
const lerpVectors = (v1, v2, alpha) => {
    const delta = exports.subtractVector(v2, v1);
    const scaled = exports.scaleVector(delta, exports.createVector(alpha));
    return exports.translateVector(v1, scaled);
};
exports.lerpVectors = lerpVectors;
const floorVector = (v) => ({ x: v.x | 0, y: v.y | 0 });
exports.floorVector = floorVector;
const ceilVector = (v) => ({ x: Math.ceil(v.x), y: Math.ceil(v.y) });
exports.ceilVector = ceilVector;
const roundVector = (v) => ({ x: Math.round(v.x), y: Math.round(v.y) });
exports.roundVector = roundVector;
const vectorFromRads = (start = exports.createVector(), rads = 0, distance = 1) => {
    const unit = exports.createUnitVector(rads);
    const scaled = exports.scaleUnitVector(unit, distance);
    return exports.translateVector(scaled, start);
};
exports.vectorFromRads = vectorFromRads;
const isVector = (value) => value && typeof value.x === 'number' && typeof value.y === 'number';
exports.isVector = isVector;

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFrameIndex = void 0;
const getFrameIndex = (frames, startTime, currentTime) => {
    const totalTime = frames.reduce((time, frame) => time + frame.duration, 0);
    const currentFrameTime = (currentTime - startTime) % totalTime;
    let frameStartTime = 0;
    for (let i = 0; i < frames.length; i++) {
        const { duration } = frames[i];
        if (currentFrameTime > frameStartTime &&
            currentFrameTime <= frameStartTime + duration)
            return i;
        frameStartTime += duration;
    }
};
exports.getFrameIndex = getFrameIndex;

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skelEdges = exports.skelStateNames = exports.skelEdgeNames = exports.skelVecNames = void 0;
exports.skelVecNames = [
    'head', 'neck', 'shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'wristL',
    'wristR', 'handL', 'handR', 'hipL', 'hipR', 'kneeL', 'kneeR', 'ankleL',
    'ankleR', 'footL', 'footR'
];
exports.skelEdgeNames = [
    'upperArmL', 'upperArmR', 'lowerArmL', 'lowerArmR',
    'upperLegL', 'upperLegR', 'lowerLegL', 'lowerLegR',
    'neck'
];
exports.skelStateNames = [
    'idle', 'walk'
];
exports.skelEdges = {
    upperArmL: ['shoulderL', 'elbowL'],
    lowerArmL: ['elbowL', 'wristL'],
    upperArmR: ['shoulderR', 'elbowR'],
    lowerArmR: ['elbowR', 'wristR'],
    upperLegL: ['hipL', 'kneeL'],
    lowerLegL: ['kneeL', 'ankleL'],
    upperLegR: ['hipR', 'kneeR'],
    lowerLegR: ['kneeR', 'ankleR'],
    neck: ['head', 'neck']
};

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skelStates = exports.skelWalk6EdgeOrder = exports.skelWalk6Vecs = exports.skelWalk5EdgeOrder = exports.skelWalk5Vecs = exports.skelWalk4EdgeOrder = exports.skelWalk4Vecs = exports.skelWalk3EdgeOrder = exports.skelWalk3Vecs = exports.skelWalk2EdgeOrder = exports.skelWalk2Vecs = exports.skelWalk1EdgeOrder = exports.skelWalk1Vecs = void 0;
const types_1 = require("./types");
exports.skelWalk1Vecs = {
    head: { x: 13, y: 9 },
    neck: { x: 13, y: 13 },
    shoulderL: { x: 16, y: 14 },
    shoulderR: { x: 10, y: 14 },
    elbowR: { x: 11, y: 18 },
    wristR: { x: 13, y: 20 },
    handR: { x: 14, y: 21 },
    hipL: { x: 14, y: 22 },
    kneeL: { x: 16, y: 28 },
    ankleL: { x: 16, y: 33 },
    footL: { x: 17, y: 35 },
    hipR: { x: 10, y: 22 },
    kneeR: { x: 8, y: 28 },
    ankleR: { x: 6, y: 33 },
    footR: { x: 5, y: 35 }
};
exports.skelWalk1EdgeOrder = [
    'upperLegL', 'lowerLegL', 'upperLegR', 'lowerLegR',
    'upperArmR', 'lowerArmR', 'neck'
];
exports.skelWalk2Vecs = {
    head: { x: 13, y: 8 },
    neck: { x: 13, y: 12 },
    shoulderL: { x: 16, y: 13 },
    shoulderR: { x: 10, y: 13 },
    elbowR: { x: 8, y: 18 },
    wristR: { x: 10, y: 20 },
    handR: { x: 11, y: 21 },
    hipL: { x: 15, y: 22 },
    kneeL: { x: 15, y: 28 },
    ankleL: { x: 14, y: 33 },
    footL: { x: 14, y: 35 },
    hipR: { x: 11, y: 22 },
    kneeR: { x: 11, y: 28 },
    ankleR: { x: 8, y: 32 },
    footR: { x: 7, y: 33 }
};
exports.skelWalk2EdgeOrder = [
    'upperLegL', 'lowerLegL', 'upperLegR', 'lowerLegR',
    'upperArmR', 'lowerArmR', 'neck'
];
exports.skelWalk3Vecs = {
    head: { x: 13, y: 7 },
    neck: { x: 12, y: 11 },
    shoulderL: { x: 16, y: 13 },
    shoulderR: { x: 8, y: 13 },
    elbowL: { x: 14, y: 17 },
    elbowR: { x: 5, y: 17 },
    wristL: { x: 17, y: 18 },
    wristR: { x: 6, y: 20 },
    handL: { x: 18, y: 18 },
    handR: { x: 7, y: 21 },
    hipL: { x: 15, y: 21 },
    hipR: { x: 11, y: 22 },
    kneeL: { x: 17, y: 27 },
    kneeR: { x: 12, y: 28 },
    ankleL: { x: 16, y: 31 },
    ankleR: { x: 10, y: 33 },
    footL: { x: 15, y: 32 },
    footR: { x: 10, y: 35 }
};
exports.skelWalk3EdgeOrder = [
    'upperLegL', 'lowerLegL', 'upperLegR', 'lowerLegR',
    'upperArmL', 'lowerArmL', 'upperArmR', 'lowerArmR', 'neck'
];
exports.skelWalk4Vecs = {
    head: { x: 13, y: 9 },
    neck: { x: 12, y: 13 },
    shoulderL: { x: 16, y: 14 },
    shoulderR: { x: 8, y: 14 },
    elbowL: { x: 15, y: 19 },
    elbowR: { x: 4, y: 18 },
    wristL: { x: 18, y: 18 },
    wristR: { x: 3, y: 21 },
    handL: { x: 19, y: 18 },
    handR: { x: 4, y: 22 },
    hipL: { x: 14, y: 23 },
    hipR: { x: 10, y: 23 },
    kneeL: { x: 17, y: 29 },
    kneeR: { x: 8, y: 29 },
    ankleL: { x: 16, y: 33 },
    ankleR: { x: 6, y: 34 },
    footL: { x: 16, y: 35 },
    footR: { x: 5, y: 35 }
};
exports.skelWalk4EdgeOrder = [
    'upperLegL', 'lowerLegL', 'upperLegR', 'lowerLegR',
    'upperArmL', 'lowerArmL', 'upperArmR', 'lowerArmR', 'neck'
];
exports.skelWalk5Vecs = {
    head: { x: 13, y: 8 },
    neck: { x: 13, y: 12 },
    shoulderL: { x: 16, y: 14 },
    shoulderR: { x: 8, y: 14 },
    elbowL: { x: 13, y: 17 },
    elbowR: { x: 5, y: 17 },
    wristL: { x: 16, y: 19 },
    wristR: { x: 6, y: 20 },
    handL: { x: 17, y: 20 },
    handR: { x: 7, y: 21 },
    hipL: { x: 15, y: 23 },
    hipR: { x: 11, y: 23 },
    kneeL: { x: 14, y: 29 },
    kneeR: { x: 11, y: 29 },
    ankleL: { x: 13, y: 33 },
    ankleR: { x: 8, y: 32 },
    footL: { x: 13, y: 35 },
    footR: { x: 7, y: 33 }
};
exports.skelWalk5EdgeOrder = [
    'upperLegL', 'lowerLegL', 'upperLegR', 'lowerLegR',
    'upperArmL', 'lowerArmL', 'upperArmR', 'lowerArmR', 'neck'
];
exports.skelWalk6Vecs = {
    head: { x: 13, y: 7 },
    neck: { x: 13, y: 11 },
    shoulderL: { x: 17, y: 13 },
    shoulderR: { x: 10, y: 13 },
    elbowR: { x: 8, y: 17 },
    wristR: { x: 11, y: 19 },
    handR: { x: 12, y: 20 },
    hipL: { x: 15, y: 22 },
    hipR: { x: 12, y: 23 },
    kneeL: { x: 17, y: 26 },
    kneeR: { x: 12, y: 28 },
    ankleL: { x: 16, y: 31 },
    ankleR: { x: 10, y: 32 },
    footL: { x: 15, y: 32 },
    footR: { x: 10, y: 34 }
};
exports.skelWalk6EdgeOrder = [
    'upperLegL', 'lowerLegL', 'upperLegR', 'lowerLegR',
    'upperArmR', 'lowerArmR', 'neck'
];
const skelWalkFrames = [
    {
        vecs: exports.skelWalk1Vecs,
        edges: types_1.skelEdges,
        edgeOrder: exports.skelWalk1EdgeOrder,
        duration: 166.66
    },
    {
        vecs: exports.skelWalk2Vecs,
        edges: types_1.skelEdges,
        edgeOrder: exports.skelWalk2EdgeOrder,
        duration: 166.66
    },
    {
        vecs: exports.skelWalk3Vecs,
        edges: types_1.skelEdges,
        edgeOrder: exports.skelWalk3EdgeOrder,
        duration: 166.66
    },
    {
        vecs: exports.skelWalk4Vecs,
        edges: types_1.skelEdges,
        edgeOrder: exports.skelWalk4EdgeOrder,
        duration: 166.66
    },
    {
        vecs: exports.skelWalk5Vecs,
        edges: types_1.skelEdges,
        edgeOrder: exports.skelWalk5EdgeOrder,
        duration: 166.66
    },
    {
        vecs: exports.skelWalk6Vecs,
        edges: types_1.skelEdges,
        edgeOrder: exports.skelWalk6EdgeOrder,
        duration: 166.66
    }
];
exports.skelStates = {
    idle: [],
    walk: skelWalkFrames
};

},{"./types":10}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pathToRegexp = require("path-to-regexp");
exports.App = (send, redirect) => {
    const getRegexpMap = new Map();
    const getHandlersMap = new Map();
    const middlewares = [];
    const get = (route, ...handlers) => {
        const keys = [];
        const regexp = pathToRegexp(route, keys);
        getRegexpMap.set(route, { keys, regexp });
        getHandlersMap.set(route, handlers);
    };
    const use = (...handlers) => {
        middlewares.push(...handlers);
    };
    const router = path => {
        const route = [...getRegexpMap.keys()].find(mapPath => {
            const { regexp } = getRegexpMap.get(mapPath);
            return regexp.test(path);
        });
        if (!route)
            throw Error(`${path} not found`);
        const { keys, regexp } = getRegexpMap.get(route);
        const handlers = getHandlersMap.get(route);
        const exec = [...regexp.exec(path)];
        const params = keys.reduce((map, key, i) => {
            map[key.name] = exec[i + 1];
            return map;
        }, {});
        const req = { path, params };
        const res = { send, redirect };
        let middlewareIndex = -1;
        let handlerIndex = -1;
        const next = arg => {
            if (arg === 'route') {
                middlewareIndex = middlewares.length;
            }
            else {
                middlewareIndex++;
            }
            let handler = middlewares[middlewareIndex];
            if (handler !== undefined) {
                handler(req, res, next);
                return;
            }
            handlerIndex++;
            handler = handlers[handlerIndex];
            if (handler === undefined)
                throw Error('Unexpected next, no more handlers');
            handler(req, res, next);
        };
        next();
    };
    const app = { get, use, router };
    return app;
};

},{"path-to-regexp":63}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_image_1 = require("@rgba-image/create-image");
exports.CloneFactory = (createImage) => {
    const clone = ({ width, height, data }) => createImage(width, height, data.slice());
    return clone;
};
exports.clone = exports.CloneFactory(create_image_1.createImage);

},{"@rgba-image/create-image":28}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@rgba-image/common");
exports.brightness = (r, g, b, a, amount) => {
    r = r | 0;
    g = g | 0;
    b = b | 0;
    a = a | 0;
    amount = amount < -1 ? -1 : amount;
    amount = amount > 1 ? 1 : amount;
    if (amount < 0) {
        r *= (1 + amount);
        g *= (1 + amount);
        b *= (1 + amount);
    }
    else {
        r += (255 - r) * amount;
        g += (255 - g) * amount;
        b += (255 - b) * amount;
    }
    return [r | 0, g | 0, b | 0, a];
};
exports.brightnessUint32 = (r, g, b, a, amount) => {
    r = r | 0;
    g = g | 0;
    b = b | 0;
    a = a | 0;
    amount = amount < -1 ? -1 : amount;
    amount = amount > 1 ? 1 : amount;
    if (amount < 0) {
        r *= (1 + amount);
        g *= (1 + amount);
        b *= (1 + amount);
    }
    else {
        r += (255 - r) * amount;
        g += (255 - g) * amount;
        b += (255 - b) * amount;
    }
    return common_1.rgbaToUint32(r, g, b, a, common_1.isLittleEndian);
};
exports.brightnessChannel = (source, amount) => {
    source = source | 0;
    amount = amount < -1 ? -1 : amount;
    amount = amount > 1 ? 1 : amount;
    if (amount < 0) {
        source *= (1 + amount);
    }
    else {
        source += (255 - source) * amount;
    }
    return source | 0;
};
exports.contrast = (r, g, b, a, amount) => {
    r = r | 0;
    g = g | 0;
    b = b | 0;
    a = a | 0;
    amount = amount < -1 ? -1 : amount;
    amount = amount > 1 ? 1 : amount;
    const factor = (amount + 1) / (1 - amount);
    r = common_1.clampByte(factor * (r - 127) + 127);
    g = common_1.clampByte(factor * (g - 127) + 127);
    b = common_1.clampByte(factor * (b - 127) + 127);
    return [r, g, b, a];
};
exports.contrastUint32 = (r, g, b, a, amount) => {
    r = r | 0;
    g = g | 0;
    b = b | 0;
    a = a | 0;
    amount = amount < -1 ? -1 : amount;
    amount = amount > 1 ? 1 : amount;
    const factor = (amount + 1) / (1 - amount);
    r = common_1.clampByte(factor * (r - 127) + 127);
    g = common_1.clampByte(factor * (g - 127) + 127);
    b = common_1.clampByte(factor * (b - 127) + 127);
    return common_1.rgbaToUint32(r, g, b, a, common_1.isLittleEndian);
};
exports.contrastChannel = (source, amount) => {
    amount = amount < -1 ? -1 : amount;
    amount = amount > 1 ? 1 : amount;
    const factor = (amount + 1) / (1 - amount);
    return common_1.clampByte(factor * (source - 127) + 127);
};
exports.posterize = (r, g, b, a, amount) => {
    r = r | 0;
    g = g | 0;
    b = b | 0;
    a = a | 0;
    amount = Math.max(2, common_1.clampByte(amount));
    const areas = 256 / amount;
    const values = 255 / (amount - 1);
    r = values * ((r / areas) | 0);
    g = values * ((g / areas) | 0);
    b = values * ((b / areas) | 0);
    return [r | 0, g | 0, b | 0, a];
};
exports.posterizeUint32 = (r, g, b, a, amount) => {
    r = r | 0;
    g = g | 0;
    b = b | 0;
    a = a | 0;
    amount = Math.max(2, common_1.clampByte(amount));
    const areas = 256 / amount;
    const values = 255 / (amount - 1);
    r = values * ((r / areas) | 0);
    g = values * ((g / areas) | 0);
    b = values * ((b / areas) | 0);
    return common_1.rgbaToUint32(r, g, b, a, common_1.isLittleEndian);
};
exports.posterizeChannel = (source, amount) => {
    source = source | 0;
    amount = Math.max(2, common_1.clampByte(amount));
    const areas = 256 / amount;
    const values = 255 / (amount - 1);
    source = values * ((source / areas) | 0);
    return source | 0;
};
exports.opacity = (r, g, b, a, amount) => {
    r = r | 0;
    g = g | 0;
    b = b | 0;
    a = a | 0;
    amount = Math.max(0, amount);
    amount = Math.min(1, amount);
    a *= amount;
    return [r, g, b, a | 0];
};
exports.opacityUint32 = (r, g, b, a, amount) => {
    r = r | 0;
    g = g | 0;
    b = b | 0;
    a = a | 0;
    amount = Math.max(0, amount);
    amount = Math.min(1, amount);
    a *= amount;
    return common_1.rgbaToUint32(r, g, b, a, common_1.isLittleEndian);
};

},{"@rgba-image/common":23}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@rgba-image/common");
exports.compositeRgba = (sR, sG, sB, sA, dR, dG, dB, dA, mode) => {
    mode = (mode | 0);
    const fn = fns[mode];
    if (!fn)
        throw Error(`Bad composite mode ${mode}`);
    return fn(sR, sG, sB, sA, dR, dG, dB, dA);
};
exports.compositeRgbaUint32 = (sR, sG, sB, sA, dR, dG, dB, dA, mode) => {
    mode = (mode | 0);
    const fn = fnsUint32[mode];
    if (!fn)
        throw Error(`Bad composite mode ${mode}`);
    return fn(sR, sG, sB, sA, dR, dG, dB, dA);
};
exports.compositeNormal = (sR, sG, sB, sA, dR, dG, dB, dA) => {
    sR = sR | 0;
    sG = sG | 0;
    sB = sB | 0;
    sA = sA | 0;
    dR = dR | 0;
    dG = dG | 0;
    dB = dB | 0;
    dA = dA | 0;
    sR /= 255;
    sG /= 255;
    sB /= 255;
    sA /= 255;
    dR /= 255;
    dG /= 255;
    dB /= 255;
    dA /= 255;
    let a = dA + sA - dA * sA;
    let r = (sR * sA + dR * dA * (1 - sA)) / a;
    let g = (sG * sA + dG * dA * (1 - sA)) / a;
    let b = (sB * sA + dB * dA * (1 - sA)) / a;
    r *= 255;
    g *= 255;
    b *= 255;
    a *= 255;
    return [r | 0, g | 0, b | 0, a | 0];
};
exports.compositeNormalUint32 = (sR, sG, sB, sA, dR, dG, dB, dA) => {
    sR = sR | 0;
    sG = sG | 0;
    sB = sB | 0;
    sA = sA | 0;
    dR = dR | 0;
    dG = dG | 0;
    dB = dB | 0;
    dA = dA | 0;
    sR /= 255;
    sG /= 255;
    sB /= 255;
    sA /= 255;
    dR /= 255;
    dG /= 255;
    dB /= 255;
    dA /= 255;
    let a = dA + sA - dA * sA;
    let r = (sR * sA + dR * dA * (1 - sA)) / a;
    let g = (sG * sA + dG * dA * (1 - sA)) / a;
    let b = (sB * sA + dB * dA * (1 - sA)) / a;
    r *= 255;
    g *= 255;
    b *= 255;
    a *= 255;
    return common_1.rgbaToUint32(r, g, b, a, common_1.isLittleEndian);
};
exports.compositeMultiply = (sR, sG, sB, sA, dR, dG, dB, dA) => {
    sR = sR | 0;
    sG = sG | 0;
    sB = sB | 0;
    sA = sA | 0;
    dR = dR | 0;
    dG = dG | 0;
    dB = dB | 0;
    dA = dA | 0;
    sR /= 255;
    sG /= 255;
    sB /= 255;
    sA /= 255;
    dR /= 255;
    dG /= 255;
    dB /= 255;
    dA /= 255;
    const sra = sR * sA;
    const sga = sG * sA;
    const sba = sB * sA;
    const dra = dR * dA;
    const dga = dG * dA;
    const dba = dB * dA;
    let a = dA + sA - dA * sA;
    let r = (sra * dra + sra * (1 - dA) + dra * (1 - sA)) / a;
    let g = (sga * dga + sga * (1 - dA) + dga * (1 - sA)) / a;
    let b = (sba * dba + sba * (1 - dA) + dba * (1 - sA)) / a;
    r *= 255;
    g *= 255;
    b *= 255;
    a *= 255;
    return [r | 0, g | 0, b | 0, a | 0];
};
exports.compositeMultiplyUint32 = (sR, sG, sB, sA, dR, dG, dB, dA) => {
    sR = sR | 0;
    sG = sG | 0;
    sB = sB | 0;
    sA = sA | 0;
    dR = dR | 0;
    dG = dG | 0;
    dB = dB | 0;
    dA = dA | 0;
    sR /= 255;
    sG /= 255;
    sB /= 255;
    sA /= 255;
    dR /= 255;
    dG /= 255;
    dB /= 255;
    dA /= 255;
    const sra = sR * sA;
    const sga = sG * sA;
    const sba = sB * sA;
    const dra = dR * dA;
    const dga = dG * dA;
    const dba = dB * dA;
    let a = dA + sA - dA * sA;
    let r = (sra * dra + sra * (1 - dA) + dra * (1 - sA)) / a;
    let g = (sga * dga + sga * (1 - dA) + dga * (1 - sA)) / a;
    let b = (sba * dba + sba * (1 - dA) + dba * (1 - sA)) / a;
    r *= 255;
    g *= 255;
    b *= 255;
    a *= 255;
    return common_1.rgbaToUint32(r, g, b, a, common_1.isLittleEndian);
};
exports.compositeScreen = (sR, sG, sB, sA, dR, dG, dB, dA) => {
    sR = sR | 0;
    sG = sG | 0;
    sB = sB | 0;
    sA = sA | 0;
    dR = dR | 0;
    dG = dG | 0;
    dB = dB | 0;
    dA = dA | 0;
    sR /= 255;
    sG /= 255;
    sB /= 255;
    sA /= 255;
    dR /= 255;
    dG /= 255;
    dB /= 255;
    dA /= 255;
    const sra = sR * sA;
    const sga = sG * sA;
    const sba = sB * sA;
    const dra = dR * dA;
    const dga = dG * dA;
    const dba = dB * dA;
    let a = dA + sA - dA * sA;
    let r = (sra * dA +
        dra * sA -
        sra * dra +
        sra * (1 - dA) +
        dra * (1 - sA)) / a;
    let g = (sga * dA +
        dga * sA -
        sga * dga +
        sga * (1 - dA) +
        dga * (1 - sA)) / a;
    let b = (sba * dA +
        dba * sA -
        sba * dba +
        sba * (1 - dA) +
        dba * (1 - sA)) / a;
    r *= 255;
    g *= 255;
    b *= 255;
    a *= 255;
    return [r | 0, g | 0, b | 0, a | 0];
};
exports.compositeScreenUint32 = (sR, sG, sB, sA, dR, dG, dB, dA) => {
    sR = sR | 0;
    sG = sG | 0;
    sB = sB | 0;
    sA = sA | 0;
    dR = dR | 0;
    dG = dG | 0;
    dB = dB | 0;
    dA = dA | 0;
    sR /= 255;
    sG /= 255;
    sB /= 255;
    sA /= 255;
    dR /= 255;
    dG /= 255;
    dB /= 255;
    dA /= 255;
    const sra = sR * sA;
    const sga = sG * sA;
    const sba = sB * sA;
    const dra = dR * dA;
    const dga = dG * dA;
    const dba = dB * dA;
    let a = dA + sA - dA * sA;
    let r = (sra * dA +
        dra * sA -
        sra * dra +
        sra * (1 - dA) +
        dra * (1 - sA)) / a;
    let g = (sga * dA +
        dga * sA -
        sga * dga +
        sga * (1 - dA) +
        dga * (1 - sA)) / a;
    let b = (sba * dA +
        dba * sA -
        sba * dba +
        sba * (1 - dA) +
        dba * (1 - sA)) / a;
    r *= 255;
    g *= 255;
    b *= 255;
    a *= 255;
    return common_1.rgbaToUint32(r, g, b, a, common_1.isLittleEndian);
};
exports.compositeOverlay = (sR, sG, sB, sA, dR, dG, dB, dA) => {
    sR = sR | 0;
    sG = sG | 0;
    sB = sB | 0;
    sA = sA | 0;
    dR = dR | 0;
    dG = dG | 0;
    dB = dB | 0;
    dA = dA | 0;
    sR /= 255;
    sG /= 255;
    sB /= 255;
    sA /= 255;
    dR /= 255;
    dG /= 255;
    dB /= 255;
    dA /= 255;
    const sra = sR * sA;
    const sga = sG * sA;
    const sba = sB * sA;
    const dra = dR * dA;
    const dga = dG * dA;
    const dba = dB * dA;
    let a = dA + sA - dA * sA;
    let r = (2 * dra <= dA ?
        2 * sra * dra + sra * (1 - dA) + dra * (1 - sA) :
        sra * (1 + dA) + dra * (1 + sA) - 2 * dra * sra - dA * sA) / a;
    let g = (2 * dga <= dA ?
        2 * sga * dga + sga * (1 - dA) + dga * (1 - sA) :
        sga * (1 + dA) + dga * (1 + sA) - 2 * dga * sga - dA * sA) / a;
    let b = (2 * dba <= dA ?
        2 * sba * dba + sba * (1 - dA) + dba * (1 - sA) :
        sba * (1 + dA) + dba * (1 + sA) - 2 * dba * sba - dA * sA) / a;
    r *= 255;
    g *= 255;
    b *= 255;
    a *= 255;
    return [r | 0, g | 0, b | 0, a | 0];
};
exports.compositeOverlayUint32 = (sR, sG, sB, sA, dR, dG, dB, dA) => {
    sR = sR | 0;
    sG = sG | 0;
    sB = sB | 0;
    sA = sA | 0;
    dR = dR | 0;
    dG = dG | 0;
    dB = dB | 0;
    dA = dA | 0;
    sR /= 255;
    sG /= 255;
    sB /= 255;
    sA /= 255;
    dR /= 255;
    dG /= 255;
    dB /= 255;
    dA /= 255;
    const sra = sR * sA;
    const sga = sG * sA;
    const sba = sB * sA;
    const dra = dR * dA;
    const dga = dG * dA;
    const dba = dB * dA;
    let a = dA + sA - dA * sA;
    let r = (2 * dra <= dA ?
        2 * sra * dra + sra * (1 - dA) + dra * (1 - sA) :
        sra * (1 + dA) + dra * (1 + sA) - 2 * dra * sra - dA * sA) / a;
    let g = (2 * dga <= dA ?
        2 * sga * dga + sga * (1 - dA) + dga * (1 - sA) :
        sga * (1 + dA) + dga * (1 + sA) - 2 * dga * sga - dA * sA) / a;
    let b = (2 * dba <= dA ?
        2 * sba * dba + sba * (1 - dA) + dba * (1 - sA) :
        sba * (1 + dA) + dba * (1 + sA) - 2 * dba * sba - dA * sA) / a;
    r *= 255;
    g *= 255;
    b *= 255;
    a *= 255;
    return common_1.rgbaToUint32(r, g, b, a, common_1.isLittleEndian);
};
exports.compositeDarken = (sR, sG, sB, sA, dR, dG, dB, dA) => {
    sR = sR | 0;
    sG = sG | 0;
    sB = sB | 0;
    sA = sA | 0;
    dR = dR | 0;
    dG = dG | 0;
    dB = dB | 0;
    dA = dA | 0;
    sR /= 255;
    sG /= 255;
    sB /= 255;
    sA /= 255;
    dR /= 255;
    dG /= 255;
    dB /= 255;
    dA /= 255;
    const sra = sR * sA;
    const sga = sG * sA;
    const sba = sB * sA;
    const dra = dR * dA;
    const dga = dG * dA;
    const dba = dB * dA;
    let a = dA + sA - dA * sA;
    let r = (Math.min(sra * dA, dra * sA) +
        sra * (1 - dA) +
        dra * (1 - sA)) / a;
    let g = (Math.min(sga * dA, dga * sA) +
        sga * (1 - dA) +
        dga * (1 - sA)) / a;
    let b = (Math.min(sba * dA, dba * sA) +
        sba * (1 - dA) +
        dba * (1 - sA)) / a;
    r *= 255;
    g *= 255;
    b *= 255;
    a *= 255;
    return [r | 0, g | 0, b | 0, a | 0];
};
exports.compositeDarkenUint32 = (sR, sG, sB, sA, dR, dG, dB, dA) => {
    sR = sR | 0;
    sG = sG | 0;
    sB = sB | 0;
    sA = sA | 0;
    dR = dR | 0;
    dG = dG | 0;
    dB = dB | 0;
    dA = dA | 0;
    sR /= 255;
    sG /= 255;
    sB /= 255;
    sA /= 255;
    dR /= 255;
    dG /= 255;
    dB /= 255;
    dA /= 255;
    const sra = sR * sA;
    const sga = sG * sA;
    const sba = sB * sA;
    const dra = dR * dA;
    const dga = dG * dA;
    const dba = dB * dA;
    let a = dA + sA - dA * sA;
    let r = (Math.min(sra * dA, dra * sA) +
        sra * (1 - dA) +
        dra * (1 - sA)) / a;
    let g = (Math.min(sga * dA, dga * sA) +
        sga * (1 - dA) +
        dga * (1 - sA)) / a;
    let b = (Math.min(sba * dA, dba * sA) +
        sba * (1 - dA) +
        dba * (1 - sA)) / a;
    r *= 255;
    g *= 255;
    b *= 255;
    a *= 255;
    return common_1.rgbaToUint32(r, g, b, a, common_1.isLittleEndian);
};
exports.compositeLighten = (sR, sG, sB, sA, dR, dG, dB, dA) => {
    sR = sR | 0;
    sG = sG | 0;
    sB = sB | 0;
    sA = sA | 0;
    dR = dR | 0;
    dG = dG | 0;
    dB = dB | 0;
    dA = dA | 0;
    sR /= 255;
    sG /= 255;
    sB /= 255;
    sA /= 255;
    dR /= 255;
    dG /= 255;
    dB /= 255;
    dA /= 255;
    const sra = sR * sA;
    const sga = sG * sA;
    const sba = sB * sA;
    const dra = dR * dA;
    const dga = dG * dA;
    const dba = dB * dA;
    let a = dA + sA - dA * sA;
    let r = (Math.max(sra * dA, dra * sA) +
        sra * (1 - dA) +
        dra * (1 - sA)) / a;
    let g = (Math.max(sga * dA, dga * sA) +
        sga * (1 - dA) +
        dga * (1 - sA)) / a;
    let b = (Math.max(sba * dA, dba * sA) +
        sba * (1 - dA) +
        dba * (1 - sA)) / a;
    r *= 255;
    g *= 255;
    b *= 255;
    a *= 255;
    return [r | 0, g | 0, b | 0, a | 0];
};
exports.compositeLightenUint32 = (sR, sG, sB, sA, dR, dG, dB, dA) => {
    sR = sR | 0;
    sG = sG | 0;
    sB = sB | 0;
    sA = sA | 0;
    dR = dR | 0;
    dG = dG | 0;
    dB = dB | 0;
    dA = dA | 0;
    sR /= 255;
    sG /= 255;
    sB /= 255;
    sA /= 255;
    dR /= 255;
    dG /= 255;
    dB /= 255;
    dA /= 255;
    const sra = sR * sA;
    const sga = sG * sA;
    const sba = sB * sA;
    const dra = dR * dA;
    const dga = dG * dA;
    const dba = dB * dA;
    let a = dA + sA - dA * sA;
    let r = (Math.max(sra * dA, dra * sA) +
        sra * (1 - dA) +
        dra * (1 - sA)) / a;
    let g = (Math.max(sga * dA, dga * sA) +
        sga * (1 - dA) +
        dga * (1 - sA)) / a;
    let b = (Math.max(sba * dA, dba * sA) +
        sba * (1 - dA) +
        dba * (1 - sA)) / a;
    r *= 255;
    g *= 255;
    b *= 255;
    a *= 255;
    return common_1.rgbaToUint32(r, g, b, a, common_1.isLittleEndian);
};
exports.compositeHardLight = (sR, sG, sB, sA, dR, dG, dB, dA) => {
    sR = sR | 0;
    sG = sG | 0;
    sB = sB | 0;
    sA = sA | 0;
    dR = dR | 0;
    dG = dG | 0;
    dB = dB | 0;
    dA = dA | 0;
    sR /= 255;
    sG /= 255;
    sB /= 255;
    sA /= 255;
    dR /= 255;
    dG /= 255;
    dB /= 255;
    dA /= 255;
    const sra = sR * sA;
    const sga = sG * sA;
    const sba = sB * sA;
    const dra = dR * dA;
    const dga = dG * dA;
    const dba = dB * dA;
    let a = dA + sA - dA * sA;
    let r = (2 * sra <= sA ?
        2 * sra * dra + sra * (1 - dA) + dra * (1 - sA) :
        sra * (1 + dA) + dra * (1 + sA) - 2 * dra * sra - dA * sA) / a;
    let g = (2 * sga <= sA ?
        2 * sga * dga + sga * (1 - dA) + dga * (1 - sA) :
        sga * (1 + dA) + dga * (1 + sA) - 2 * dga * sga - dA * sA) / a;
    let b = (2 * sba <= sA ?
        2 * sba * dba + sba * (1 - dA) + dba * (1 - sA) :
        sba * (1 + dA) + dba * (1 + sA) - 2 * dba * sba - dA * sA) / a;
    r *= 255;
    g *= 255;
    b *= 255;
    a *= 255;
    return [r | 0, g | 0, b | 0, a | 0];
};
exports.compositeHardLightUint32 = (sR, sG, sB, sA, dR, dG, dB, dA) => {
    sR = sR | 0;
    sG = sG | 0;
    sB = sB | 0;
    sA = sA | 0;
    dR = dR | 0;
    dG = dG | 0;
    dB = dB | 0;
    dA = dA | 0;
    sR /= 255;
    sG /= 255;
    sB /= 255;
    sA /= 255;
    dR /= 255;
    dG /= 255;
    dB /= 255;
    dA /= 255;
    const sra = sR * sA;
    const sga = sG * sA;
    const sba = sB * sA;
    const dra = dR * dA;
    const dga = dG * dA;
    const dba = dB * dA;
    let a = dA + sA - dA * sA;
    let r = (2 * sra <= sA ?
        2 * sra * dra + sra * (1 - dA) + dra * (1 - sA) :
        sra * (1 + dA) + dra * (1 + sA) - 2 * dra * sra - dA * sA) / a;
    let g = (2 * sga <= sA ?
        2 * sga * dga + sga * (1 - dA) + dga * (1 - sA) :
        sga * (1 + dA) + dga * (1 + sA) - 2 * dga * sga - dA * sA) / a;
    let b = (2 * sba <= sA ?
        2 * sba * dba + sba * (1 - dA) + dba * (1 - sA) :
        sba * (1 + dA) + dba * (1 + sA) - 2 * dba * sba - dA * sA) / a;
    r *= 255;
    g *= 255;
    b *= 255;
    a *= 255;
    return common_1.rgbaToUint32(r, g, b, a, common_1.isLittleEndian);
};
exports.compositeDifference = (sR, sG, sB, sA, dR, dG, dB, dA) => {
    sR = sR | 0;
    sG = sG | 0;
    sB = sB | 0;
    sA = sA | 0;
    dR = dR | 0;
    dG = dG | 0;
    dB = dB | 0;
    dA = dA | 0;
    sR /= 255;
    sG /= 255;
    sB /= 255;
    sA /= 255;
    dR /= 255;
    dG /= 255;
    dB /= 255;
    dA /= 255;
    const sra = sR * sA;
    const sga = sG * sA;
    const sba = sB * sA;
    const dra = dR * dA;
    const dga = dG * dA;
    const dba = dB * dA;
    let a = dA + sA - dA * sA;
    let r = (sra + dra - 2 * Math.min(sra * dA, dra * sA)) / a;
    let g = (sga + dga - 2 * Math.min(sga * dA, dga * sA)) / a;
    let b = (sba + dba - 2 * Math.min(sba * dA, dba * sA)) / a;
    r *= 255;
    g *= 255;
    b *= 255;
    a *= 255;
    return [r | 0, g | 0, b | 0, a | 0];
};
exports.compositeDifferenceUint32 = (sR, sG, sB, sA, dR, dG, dB, dA) => {
    sR = sR | 0;
    sG = sG | 0;
    sB = sB | 0;
    sA = sA | 0;
    dR = dR | 0;
    dG = dG | 0;
    dB = dB | 0;
    dA = dA | 0;
    sR /= 255;
    sG /= 255;
    sB /= 255;
    sA /= 255;
    dR /= 255;
    dG /= 255;
    dB /= 255;
    dA /= 255;
    const sra = sR * sA;
    const sga = sG * sA;
    const sba = sB * sA;
    const dra = dR * dA;
    const dga = dG * dA;
    const dba = dB * dA;
    let a = dA + sA - dA * sA;
    let r = (sra + dra - 2 * Math.min(sra * dA, dra * sA)) / a;
    let g = (sga + dga - 2 * Math.min(sga * dA, dga * sA)) / a;
    let b = (sba + dba - 2 * Math.min(sba * dA, dba * sA)) / a;
    r *= 255;
    g *= 255;
    b *= 255;
    a *= 255;
    return common_1.rgbaToUint32(r, g, b, a, common_1.isLittleEndian);
};
exports.compositeExclusion = (sR, sG, sB, sA, dR, dG, dB, dA) => {
    sR = sR | 0;
    sG = sG | 0;
    sB = sB | 0;
    sA = sA | 0;
    dR = dR | 0;
    dG = dG | 0;
    dB = dB | 0;
    dA = dA | 0;
    sR /= 255;
    sG /= 255;
    sB /= 255;
    sA /= 255;
    dR /= 255;
    dG /= 255;
    dB /= 255;
    dA /= 255;
    const sra = sR * sA;
    const sga = sG * sA;
    const sba = sB * sA;
    const dra = dR * dA;
    const dga = dG * dA;
    const dba = dB * dA;
    let a = dA + sA - dA * sA;
    let r = (sra * dA +
        dra * sA -
        2 * sra * dra +
        sra * (1 - dA) +
        dra * (1 - sA)) / a;
    let g = (sga * dA +
        dga * sA -
        2 * sga * dga +
        sga * (1 - dA) +
        dga * (1 - sA)) / a;
    let b = (sba * dA +
        dba * sA -
        2 * sba * dba +
        sba * (1 - dA) +
        dba * (1 - sA)) / a;
    r *= 255;
    g *= 255;
    b *= 255;
    a *= 255;
    return [r | 0, g | 0, b | 0, a | 0];
};
exports.compositeExclusionUint32 = (sR, sG, sB, sA, dR, dG, dB, dA) => {
    sR = sR | 0;
    sG = sG | 0;
    sB = sB | 0;
    sA = sA | 0;
    dR = dR | 0;
    dG = dG | 0;
    dB = dB | 0;
    dA = dA | 0;
    sR /= 255;
    sG /= 255;
    sB /= 255;
    sA /= 255;
    dR /= 255;
    dG /= 255;
    dB /= 255;
    dA /= 255;
    const sra = sR * sA;
    const sga = sG * sA;
    const sba = sB * sA;
    const dra = dR * dA;
    const dga = dG * dA;
    const dba = dB * dA;
    let a = dA + sA - dA * sA;
    let r = (sra * dA +
        dra * sA -
        2 * sra * dra +
        sra * (1 - dA) +
        dra * (1 - sA)) / a;
    let g = (sga * dA +
        dga * sA -
        2 * sga * dga +
        sga * (1 - dA) +
        dga * (1 - sA)) / a;
    let b = (sba * dA +
        dba * sA -
        2 * sba * dba +
        sba * (1 - dA) +
        dba * (1 - sA)) / a;
    r *= 255;
    g *= 255;
    b *= 255;
    a *= 255;
    return common_1.rgbaToUint32(r, g, b, a, common_1.isLittleEndian);
};
const fns = [
    exports.compositeNormal, exports.compositeMultiply, exports.compositeScreen, exports.compositeOverlay,
    exports.compositeDarken, exports.compositeLighten, exports.compositeHardLight, exports.compositeDifference,
    exports.compositeExclusion
];
const fnsUint32 = [
    exports.compositeNormalUint32, exports.compositeMultiplyUint32, exports.compositeScreenUint32,
    exports.compositeOverlayUint32, exports.compositeDarkenUint32, exports.compositeLightenUint32,
    exports.compositeHardLightUint32, exports.compositeDifferenceUint32, exports.compositeExclusionUint32
];
/*
Adapted from Jimp:

https://github.com/oliver-moran/jimp

MIT License

Copyright (c) 2018 Oliver Moran

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/ 

},{"@rgba-image/common":23}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@rgba-image/common");
const mix_1 = require("./mix");
exports.gradientRgba = (stops, position) => {
    if (!stops.every(common_1.isRgbaStop))
        throw Error('Expected an array of RgbaStop');
    stops = sortStops(stops);
    const [leftIndex, rightIndex] = findBoundingIndices(position, stops);
    const leftStop = stops[leftIndex];
    const [r0, g0, b0, a0] = leftStop;
    if (leftIndex === rightIndex)
        return [r0, g0, b0, a0];
    const rightStop = stops[rightIndex];
    const [r1, g1, b1, a1] = rightStop;
    const leftPosition = leftStop[4];
    const rightPosition = rightStop[4];
    const delta = rightPosition - leftPosition;
    const positionDelta = position - leftPosition;
    const amount = positionDelta / delta;
    const color = mix_1.mix(r0, g0, b0, a0, r1, g1, b1, a1, amount);
    return color;
};
exports.gradientRgbaUInt32 = (stops, position) => {
    if (!stops.every(common_1.isRgbaUint32Stop))
        throw Error('Expected an array of RgbaUint32Stop');
    stops = sortStops(stops, 1);
    const [leftIndex, rightIndex] = findBoundingIndices(position, stops, 1);
    const leftStop = stops[leftIndex];
    const [v0] = leftStop;
    if (leftIndex === rightIndex)
        return v0;
    const [r0, g0, b0, a0] = common_1.uint32ToRgba(v0, common_1.isLittleEndian);
    const rightStop = stops[rightIndex];
    const [v1] = rightStop;
    const [r1, g1, b1, a1] = common_1.uint32ToRgba(v1, common_1.isLittleEndian);
    const leftPosition = leftStop[1];
    const rightPosition = rightStop[1];
    const delta = rightPosition - leftPosition;
    const positionDelta = position - leftPosition;
    const amount = positionDelta / delta;
    const color = mix_1.mixUint32(r0, g0, b0, a0, r1, g1, b1, a1, amount);
    return color;
};
exports.gradientChannel = (stops, position) => {
    if (!stops.every(common_1.isChannelStop))
        throw Error('Expected an array of ChannelStop');
    stops = sortStops(stops, 1);
    const [leftIndex, rightIndex] = findBoundingIndices(position, stops, 1);
    const leftStop = stops[leftIndex];
    const [c0] = leftStop;
    if (leftIndex === rightIndex)
        return c0;
    const rightStop = stops[rightIndex];
    const [c1] = rightStop;
    const leftPosition = leftStop[1];
    const rightPosition = rightStop[1];
    const delta = rightPosition - leftPosition;
    const positionDelta = position - leftPosition;
    const amount = positionDelta / delta;
    const color = mix_1.mixChannel(c0, c1, amount);
    return color;
};
exports.rgbaValuesToStops = (colors) => {
    return colorsToStops(colors);
};
exports.rgbaUint32ValuesToStops = (colors) => {
    return colorsToStops(colors.map(v => [v]), 1);
};
exports.channelValuesToStops = (colors) => {
    return colorsToStops(colors.map(v => [v]), 1);
};
const findBoundingIndices = (position, sortedStops, positionIndex = 4) => {
    const { length } = sortedStops;
    if (length === 1)
        return [0, 0];
    if (length && sortedStops[0][positionIndex] > position)
        return [0, 0];
    if (length && sortedStops[length - 1][positionIndex] < position)
        return [length - 1, length - 1];
    for (let i = 0; i < length; i++) {
        const current = sortedStops[i];
        const next = sortedStops[i + 1];
        if (current[positionIndex] === position) {
            return [i, i];
        }
        if (current[positionIndex] < position && next[positionIndex] > position) {
            return [i, i + 1];
        }
    }
    throw Error('No positions');
};
const sortStops = (stops, positionIndex = 4) => stops.slice().sort((a, b) => a[positionIndex] - b[positionIndex]);
const colorsToStops = (values, channels = 4) => {
    if (values.length === 0)
        throw Error('No colors provided');
    values = values.map(value => value.slice());
    if (values.length === 1) {
        values[0][channels] = 0.5;
        return values;
    }
    const step = 1 / (values.length - 1);
    values[0][channels] = 0;
    values[values.length - 1][channels] = 1;
    for (let i = 1; i < values.length - 1; i++) {
        values[i][channels] = step * i;
    }
    return values;
};

},{"./mix":19,"@rgba-image/common":23}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var adjust_1 = require("./adjust");
exports.brightness = adjust_1.brightness;
exports.brightnessUint32 = adjust_1.brightnessUint32;
exports.brightnessChannel = adjust_1.brightnessChannel;
exports.contrast = adjust_1.contrast;
exports.contrastUint32 = adjust_1.contrastUint32;
exports.contrastChannel = adjust_1.contrastChannel;
exports.posterize = adjust_1.posterize;
exports.posterizeUint32 = adjust_1.posterizeUint32;
exports.posterizeChannel = adjust_1.posterizeChannel;
exports.opacity = adjust_1.opacity;
exports.opacityUint32 = adjust_1.opacityUint32;
var composite_1 = require("./composite");
exports.compositeRgba = composite_1.compositeRgba;
exports.compositeRgbaUint32 = composite_1.compositeRgbaUint32;
exports.compositeNormal = composite_1.compositeNormal;
exports.compositeMultiply = composite_1.compositeMultiply;
exports.compositeScreen = composite_1.compositeScreen;
exports.compositeOverlay = composite_1.compositeOverlay;
exports.compositeDarken = composite_1.compositeDarken;
exports.compositeLighten = composite_1.compositeLighten;
exports.compositeHardLight = composite_1.compositeHardLight;
exports.compositeDifference = composite_1.compositeDifference;
exports.compositeExclusion = composite_1.compositeExclusion;
exports.compositeNormalUint32 = composite_1.compositeNormalUint32;
exports.compositeMultiplyUint32 = composite_1.compositeMultiplyUint32;
exports.compositeScreenUint32 = composite_1.compositeScreenUint32;
exports.compositeOverlayUint32 = composite_1.compositeOverlayUint32;
exports.compositeDarkenUint32 = composite_1.compositeDarkenUint32;
exports.compositeLightenUint32 = composite_1.compositeLightenUint32;
exports.compositeHardLightUint32 = composite_1.compositeHardLightUint32;
exports.compositeDifferenceUint32 = composite_1.compositeDifferenceUint32;
exports.compositeExclusionUint32 = composite_1.compositeExclusionUint32;
var common_1 = require("@rgba-image/common");
exports.COMPOSITE_NORMAL = common_1.COMPOSITE_NORMAL;
exports.COMPOSITE_MULTIPLY = common_1.COMPOSITE_MULTIPLY;
exports.COMPOSITE_SCREEN = common_1.COMPOSITE_SCREEN;
exports.COMPOSITE_OVERLAY = common_1.COMPOSITE_OVERLAY;
exports.COMPOSITE_DARKEN = common_1.COMPOSITE_DARKEN;
exports.COMPOSITE_LIGHTEN = common_1.COMPOSITE_LIGHTEN;
exports.COMPOSITE_HARD_LIGHT = common_1.COMPOSITE_HARD_LIGHT;
exports.COMPOSITE_DIFFERENCE = common_1.COMPOSITE_DIFFERENCE;
exports.COMPOSITE_EXCLUSION = common_1.COMPOSITE_EXCLUSION;
var gradient_1 = require("./gradient");
exports.gradientRgba = gradient_1.gradientRgba;
exports.gradientRgbaUInt32 = gradient_1.gradientRgbaUInt32;
exports.gradientChannel = gradient_1.gradientChannel;
exports.rgbaValuesToStops = gradient_1.rgbaValuesToStops;
exports.rgbaUint32ValuesToStops = gradient_1.rgbaUint32ValuesToStops;
exports.channelValuesToStops = gradient_1.channelValuesToStops;
var map_1 = require("./map");
exports.grayscale = map_1.grayscale;
exports.grayscaleUint32 = map_1.grayscaleUint32;
exports.sepia = map_1.sepia;
exports.sepiaUint32 = map_1.sepiaUint32;
exports.invert = map_1.invert;
exports.invertUint32 = map_1.invertUint32;
exports.invertChannel = map_1.invertChannel;
var mix_1 = require("./mix");
exports.mix = mix_1.mix;
exports.mixUint32 = mix_1.mixUint32;
exports.mixChannel = mix_1.mixChannel;

},{"./adjust":14,"./composite":15,"./gradient":16,"./map":18,"./mix":19,"@rgba-image/common":23}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@rgba-image/common");
exports.grayscale = (r, g, b, a) => {
    r = r | 0;
    g = g | 0;
    b = b | 0;
    a = a | 0;
    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return [gray | 0, gray | 0, gray | 0, a];
};
exports.grayscaleUint32 = (r, g, b, a) => {
    r = r | 0;
    g = g | 0;
    b = b | 0;
    a = a | 0;
    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return common_1.rgbaToUint32(gray, gray, gray, a, common_1.isLittleEndian);
};
exports.sepia = (r, g, b, a) => {
    r = r | 0;
    g = g | 0;
    b = b | 0;
    a = a | 0;
    return [
        common_1.clampByte(r * 0.393 + g * 0.769 + b * 0.189),
        common_1.clampByte(r * 0.349 + g * 0.686 + b * 0.168),
        common_1.clampByte(r * 0.272 + g * 0.534 + b * 0.131),
        a
    ];
};
exports.sepiaUint32 = (r, g, b, a) => {
    r = r | 0;
    g = g | 0;
    b = b | 0;
    a = a | 0;
    return common_1.rgbaToUint32(common_1.clampByte(r * 0.393 + g * 0.769 + b * 0.189), common_1.clampByte(r * 0.349 + g * 0.686 + b * 0.168), common_1.clampByte(r * 0.272 + g * 0.534 + b * 0.131), a, common_1.isLittleEndian);
};
exports.invert = (r, g, b, a) => {
    r = r | 0;
    g = g | 0;
    b = b | 0;
    a = a | 0;
    r = 255 - r;
    g = 255 - g;
    b = 255 - b;
    return [r, g, b, a];
};
exports.invertUint32 = (r, g, b, a) => {
    r = r | 0;
    g = g | 0;
    b = b | 0;
    a = a | 0;
    r = 255 - r;
    g = 255 - g;
    b = 255 - b;
    return common_1.rgbaToUint32(r, g, b, a, common_1.isLittleEndian);
};
exports.invertChannel = (source) => {
    source = source | 0;
    source = 255 - source;
    return source;
};

},{"@rgba-image/common":23}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@rgba-image/common");
exports.mix = (r0, g0, b0, a0, r1, g1, b1, a1, amount = 0.5) => {
    r0 = r0 | 0;
    g0 = g0 | 0;
    b0 = b0 | 0;
    a0 = a0 | 0;
    r1 = r1 | 0;
    g1 = g1 | 0;
    b1 = b1 | 0;
    a1 = a1 | 0;
    amount = Math.max(0, amount);
    amount = Math.min(1, amount);
    const r = (r1 - r0) * amount + r0;
    const g = (g1 - g0) * amount + g0;
    const b = (b1 - b0) * amount + b0;
    const a = (a1 - a0) * amount + a0;
    return [r | 0, g | 0, b | 0, a | 0];
};
exports.mixUint32 = (r0, g0, b0, a0, r1, g1, b1, a1, amount = 0.5) => {
    r0 = r0 | 0;
    g0 = g0 | 0;
    b0 = b0 | 0;
    a0 = a0 | 0;
    r1 = r1 | 0;
    g1 = g1 | 0;
    b1 = b1 | 0;
    a1 = a1 | 0;
    amount = Math.max(0, amount);
    amount = Math.min(1, amount);
    const r = (r1 - r0) * amount + r0;
    const g = (g1 - g0) * amount + g0;
    const b = (b1 - b0) * amount + b0;
    const a = (a1 - a0) * amount + a0;
    return common_1.rgbaToUint32(r, g, b, a, common_1.isLittleEndian);
};
exports.mixChannel = (c0, c1, amount = 0.5) => {
    c0 = c0 | 0;
    c1 = c1 | 0;
    amount = Math.max(0, amount);
    amount = Math.min(1, amount);
    const c = (c1 - c0) * amount + c0;
    return c | 0;
};

},{"@rgba-image/common":23}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clampByte = (value) => value < 0 ? 0 : value > 255 ? 255 : value | 0;
exports.clampUint32 = (value) => value < 0 ? 0 : value > 4294967295 ? 4294967295 : value >>> 0;

},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPOSITE_NONE = -1;
exports.COMPOSITE_NORMAL = 0;
exports.COMPOSITE_MULTIPLY = 1;
exports.COMPOSITE_SCREEN = 2;
exports.COMPOSITE_OVERLAY = 3;
exports.COMPOSITE_DARKEN = 4;
exports.COMPOSITE_LIGHTEN = 5;
exports.COMPOSITE_HARD_LIGHT = 6;
exports.COMPOSITE_DIFFERENCE = 7;
exports.COMPOSITE_EXCLUSION = 8;
exports.compositeModeNames = [
    'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'hard light',
    'difference', 'exclusion'
];
exports.compositeModeNameToMode = {
    normal: exports.COMPOSITE_NORMAL,
    multiply: exports.COMPOSITE_MULTIPLY,
    screen: exports.COMPOSITE_SCREEN,
    overlay: exports.COMPOSITE_OVERLAY,
    darken: exports.COMPOSITE_DARKEN,
    lighten: exports.COMPOSITE_LIGHTEN,
    'hard light': exports.COMPOSITE_HARD_LIGHT,
    difference: exports.COMPOSITE_DIFFERENCE,
    exclusion: exports.COMPOSITE_EXCLUSION
};

},{}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIndex = (x, y, width, channels = 4) => {
    x = x | 0;
    y = y | 0;
    width = width | 0;
    channels = channels | 0;
    return (y * width + x) * channels;
};

},{}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var clamp_1 = require("./clamp");
exports.clampByte = clamp_1.clampByte;
exports.clampUint32 = clamp_1.clampUint32;
var consts_1 = require("./consts");
exports.COMPOSITE_NORMAL = consts_1.COMPOSITE_NORMAL;
exports.COMPOSITE_MULTIPLY = consts_1.COMPOSITE_MULTIPLY;
exports.COMPOSITE_SCREEN = consts_1.COMPOSITE_SCREEN;
exports.COMPOSITE_OVERLAY = consts_1.COMPOSITE_OVERLAY;
exports.COMPOSITE_DARKEN = consts_1.COMPOSITE_DARKEN;
exports.COMPOSITE_LIGHTEN = consts_1.COMPOSITE_LIGHTEN;
exports.COMPOSITE_HARD_LIGHT = consts_1.COMPOSITE_HARD_LIGHT;
exports.COMPOSITE_DIFFERENCE = consts_1.COMPOSITE_DIFFERENCE;
exports.COMPOSITE_EXCLUSION = consts_1.COMPOSITE_EXCLUSION;
exports.compositeModeNames = consts_1.compositeModeNames;
exports.compositeModeNameToMode = consts_1.compositeModeNameToMode;
var get_index_1 = require("./get-index");
exports.getIndex = get_index_1.getIndex;
var is_little_endian_1 = require("./is-little-endian");
exports.isLittleEndian = is_little_endian_1.isLittleEndian;
var predicates_1 = require("./predicates");
exports.isImageData = predicates_1.isImageData;
exports.isGrayData = predicates_1.isGrayData;
exports.isRgbaStop = predicates_1.isRgbaStop;
exports.isRgbaUint32Stop = predicates_1.isRgbaUint32Stop;
exports.isChannelStop = predicates_1.isChannelStop;
var uint32_1 = require("./uint32");
exports.rgbaToUint32 = uint32_1.rgbaToUint32;
exports.uint32ToRgba = uint32_1.uint32ToRgba;

},{"./clamp":20,"./consts":21,"./get-index":22,"./is-little-endian":24,"./predicates":25,"./uint32":26}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getLittleEndian = () => {
    const array = new Uint8Array(4);
    const view = new Uint32Array(array.buffer);
    return !!((view[0] = 1) & array[0]);
};
exports.isLittleEndian = getLittleEndian();

},{}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isImageData = (imageData) => {
    if (!imageData)
        return false;
    if (typeof imageData.width !== 'number')
        return false;
    if (typeof imageData.height !== 'number')
        return false;
    if (imageData.width < 1)
        return false;
    if (imageData.height < 1)
        return false;
    if (!Number.isInteger(imageData.width))
        return false;
    if (!Number.isInteger(imageData.height))
        return false;
    if (!(imageData.data instanceof Uint8ClampedArray))
        return false;
    if (imageData.data.length !== imageData.width * imageData.height * 4)
        return false;
    return true;
};
exports.isGrayData = (grayData) => {
    if (!grayData)
        return false;
    if (typeof grayData.width !== 'number')
        return false;
    if (typeof grayData.height !== 'number')
        return false;
    if (grayData.width < 1)
        return false;
    if (grayData.height < 1)
        return false;
    if (!Number.isInteger(grayData.width))
        return false;
    if (!Number.isInteger(grayData.height))
        return false;
    if (!(grayData.data instanceof Uint8ClampedArray))
        return false;
    if (grayData.data.length !== grayData.width * grayData.height)
        return false;
    return true;
};
exports.isRgbaStop = (stop) => {
    if (!stop)
        return false;
    if (!stop.length)
        return false;
    if (stop.length !== 5)
        return false;
    if (!stop.every(v => typeof v === 'number' && !isNaN(v)))
        return false;
    return true;
};
exports.isRgbaUint32Stop = (stop) => isStop2(stop);
exports.isChannelStop = (stop) => isStop2(stop);
const isStop2 = stop => {
    if (!stop)
        return false;
    if (!stop.length)
        return false;
    if (stop.length !== 2)
        return false;
    if (!stop.every(v => typeof v === 'number' && !isNaN(v)))
        return false;
    return true;
};

},{}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rgbaToUint32 = (r, g, b, a, isLittleEndian = false) => isLittleEndian ?
    (a << 24) | (b << 16) | (g << 8) | r :
    (r << 24) | (g << 16) | (b << 8) | a;
exports.uint32ToRgba = (v, isLittleEndian = false) => isLittleEndian ?
    [v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >> 24) & 255] :
    [(v >> 24) & 255, (v >> 16) & 255, (v >> 8) & 255, v & 255];

},{}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copy = (source, dest, sx = 0, sy = 0, sw = source.width - sx, sh = source.height - sy, dx = 0, dy = 0) => {
    sx = sx | 0;
    sy = sy | 0;
    sw = sw | 0;
    sh = sh | 0;
    dx = dx | 0;
    dy = dy | 0;
    if (sw <= 0 || sh <= 0)
        return;
    const sourceData = new Uint32Array(source.data.buffer);
    const destData = new Uint32Array(dest.data.buffer);
    for (let y = 0; y < sh; y++) {
        const sourceY = sy + y;
        if (sourceY < 0 || sourceY >= source.height)
            continue;
        const destY = dy + y;
        if (destY < 0 || destY >= dest.height)
            continue;
        for (let x = 0; x < sw; x++) {
            const sourceX = sx + x;
            if (sourceX < 0 || sourceX >= source.width)
                continue;
            const destX = dx + x;
            if (destX < 0 || destX >= dest.width)
                continue;
            const sourceIndex = sourceY * source.width + sourceX;
            const destIndex = destY * dest.width + destX;
            destData[destIndex] = sourceData[sourceIndex];
        }
    }
};

},{}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateImageFactory = (fill = [0, 0, 0, 0], channels = 4) => {
    channels = Math.floor(channels);
    if (isNaN(channels) || channels < 1) {
        throw TypeError('channels should be a positive non-zero number');
    }
    if (!('length' in fill) || fill.length < channels) {
        throw TypeError(`fill should be iterable with at least ${channels} members`);
    }
    fill = (new Uint8ClampedArray(fill)).slice(0, channels);
    const allZero = fill.every(v => v === 0);
    const createImage = (width, height, data) => {
        if (width === undefined || height === undefined) {
            throw TypeError('Not enough arguments');
        }
        width = Math.floor(width);
        height = Math.floor(height);
        if (isNaN(width) || width < 1 || isNaN(height) || height < 1) {
            throw TypeError('Index or size is negative or greater than the allowed amount');
        }
        const length = width * height * channels;
        if (data === undefined) {
            data = new Uint8ClampedArray(length);
        }
        if (data instanceof Uint8ClampedArray) {
            if (data.length !== length) {
                throw TypeError('Index or size is negative or greater than the allowed amount');
            }
            if (!allZero) {
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const index = (y * width + x) * channels;
                        for (let c = 0; c < channels; c++) {
                            data[index + c] = fill[c];
                        }
                    }
                }
            }
            return {
                get width() { return width; },
                get height() { return height; },
                get data() { return data; }
            };
        }
        throw TypeError('Expected data to be Uint8ClampedArray or undefined');
    };
    return createImage;
};
exports.createImage = exports.CreateImageFactory();

},{}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@rgba-image/common");
exports.fill = (dest, color, dx = 0, dy = 0, dw = dest.width - dx, dh = dest.height - dy) => {
    dx = dx | 0;
    dy = dy | 0;
    dw = dw | 0;
    dh = dh | 0;
    const [r, g, b, a] = color;
    const destData = new Uint32Array(dest.data.buffer);
    const destSize = dest.width * dest.height;
    const v = common_1.rgbaToUint32(r, g, b, a, common_1.isLittleEndian);
    for (let y = 0; y < dh; y++) {
        for (let x = 0; x < dw; x++) {
            const destX = dx + x;
            const destY = dy + y;
            const destIndex = destY * dest.width + destX;
            if (destIndex >= destSize)
                continue;
            destData[destIndex] = v;
        }
    }
};
exports.ClearFactory = (fill) => {
    const clear = (dest, dx = 0, dy = 0, dw = dest.width - dx, dh = dest.height - dy) => fill(dest, [0, 0, 0, 0], dx, dy, dw, dh);
    return clear;
};
exports.clear = exports.ClearFactory(exports.fill);

},{"@rgba-image/common":23}],30:[function(require,module,exports){
"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@rgba-image/common");
const create_image_1 = require("@rgba-image/create-image");
const create = create_image_1.CreateImageFactory([0], 1);
exports.createGray = (width, height, data) => create(width, height, data);
exports.RED_CHANNEL = 0;
exports.GREEN_CHANNEL = 1;
exports.BLUE_CHANNEL = 2;
exports.ALPHA_CHANNEL = 3;
exports.extractChannel = (source, channel, sx = 0, sy = 0, sw = source.width - sx, sh = source.height - sy) => {
    channel = (channel | 0);
    sx = sx | 0;
    sy = sy | 0;
    sw = sw | 0;
    sh = sh | 0;
    if (sw <= 0 || sh <= 0)
        throw Error('Cannot create an image with 0 width or height');
    if (channel < 0 || channel > 3)
        throw Error('channel must be 0-3');
    const dest = exports.createGray(sw, sh);
    for (let y = 0; y < sh; y++) {
        const sourceY = sy + y;
        if (sourceY < 0 || sourceY >= source.height)
            continue;
        for (let x = 0; x < sw; x++) {
            const sourceX = sx + x;
            if (sourceX < 0 || sourceX >= source.width)
                continue;
            const sourceIndex = (sourceY * source.width + sourceX) * 4 + channel;
            const destIndex = y * dest.width + x;
            dest.data[destIndex] = source.data[sourceIndex];
        }
    }
    return dest;
};
exports.extractRed = (source, sx = 0, sy = 0, sw = source.width - sx, sh = source.height - sy) => exports.extractChannel(source, exports.RED_CHANNEL, sx, sy, sw, sh);
exports.extractGreen = (source, sx = 0, sy = 0, sw = source.width - sx, sh = source.height - sy) => exports.extractChannel(source, exports.GREEN_CHANNEL, sx, sy, sw, sh);
exports.extractBlue = (source, sx = 0, sy = 0, sw = source.width - sx, sh = source.height - sy) => exports.extractChannel(source, exports.BLUE_CHANNEL, sx, sy, sw, sh);
exports.extractAlpha = (source, sx = 0, sy = 0, sw = source.width - sx, sh = source.height - sy) => exports.extractChannel(source, exports.ALPHA_CHANNEL, sx, sy, sw, sh);
exports.extractRgba = (source, sx = 0, sy = 0, sw = source.width - sx, sh = source.height - sy) => {
    sx = sx | 0;
    sy = sy | 0;
    sw = sw | 0;
    sh = sh | 0;
    if (sw <= 0 || sh <= 0)
        throw Error('Cannot create an image with 0 width or height');
    const r = exports.createGray(sw, sh);
    const g = exports.createGray(sw, sh);
    const b = exports.createGray(sw, sh);
    const a = exports.createGray(sw, sh);
    for (let y = 0; y < sh; y++) {
        const sourceY = sy + y;
        if (sourceY < 0 || sourceY >= source.height)
            continue;
        for (let x = 0; x < sw; x++) {
            const sourceX = sx + x;
            if (sourceX < 0 || sourceX >= source.width)
                continue;
            const destIndex = y * sw + x;
            const sourceIndex = (sourceY * source.width + sourceX) * 4;
            r.data[destIndex] = source.data[sourceIndex];
            g.data[destIndex] = source.data[sourceIndex + 1];
            b.data[destIndex] = source.data[sourceIndex + 2];
            a.data[destIndex] = source.data[sourceIndex + 3];
        }
    }
    return [r, g, b, a];
};
exports.maskImage = (source, dest, sx = 0, sy = 0, sw = source.width - sx, sh = source.height - sy, dx = 0, dy = 0) => {
    sx = sx | 0;
    sy = sy | 0;
    sw = sw | 0;
    sh = sh | 0;
    dx = dx | 0;
    dy = dy | 0;
    if (sw <= 0 || sh <= 0)
        return;
    for (let y = 0; y < sh; y++) {
        const sourceY = sy + y;
        if (sourceY < 0 || sourceY >= source.height)
            continue;
        const destY = dy + y;
        if (destY < 0 || destY >= dest.height)
            continue;
        for (let x = 0; x < sw; x++) {
            const sourceX = sx + x;
            if (sourceX < 0 || sourceX >= source.width)
                continue;
            const destX = dx + x;
            if (destX < 0 || destX >= dest.width)
                continue;
            const sourceIndex = sourceY * source.width + sourceX;
            const destIndex = (destY * dest.width + destX) * 4 + 3;
            dest.data[destIndex] *= (source.data[sourceIndex] / 255);
        }
    }
};
exports.fromAverage = (source, sx = 0, sy = 0, sw = source.width - sx, sh = source.height - sy) => {
    sx = sx | 0;
    sy = sy | 0;
    sw = sw | 0;
    sh = sh | 0;
    if (sw <= 0 || sh <= 0)
        throw Error('Cannot create an image with 0 width or height');
    const dest = exports.createGray(sw, sh);
    for (let y = 0; y < sh; y++) {
        const sourceY = sy + y;
        if (sourceY < 0 || sourceY >= source.height)
            continue;
        for (let x = 0; x < sw; x++) {
            const sourceX = sx + x;
            if (sourceX < 0 || sourceX >= source.width)
                continue;
            const sourceIndex = (sourceY * source.width + sourceX) * 4;
            const destIndex = y * dest.width + x;
            const r = source.data[sourceIndex];
            const g = source.data[sourceIndex + 1];
            const b = source.data[sourceIndex + 2];
            dest.data[destIndex] = (r + g + b) / 3;
        }
    }
    return dest;
};
exports.fromLightness = (source, sx = 0, sy = 0, sw = source.width - sx, sh = source.height - sy) => {
    sx = sx | 0;
    sy = sy | 0;
    sw = sw | 0;
    sh = sh | 0;
    if (sw <= 0 || sh <= 0)
        throw Error('Cannot create an image with 0 width or height');
    const dest = exports.createGray(sw, sh);
    for (let y = 0; y < sh; y++) {
        const sourceY = sy + y;
        if (sourceY < 0 || sourceY >= source.height)
            continue;
        for (let x = 0; x < sw; x++) {
            const sourceX = sx + x;
            if (sourceX < 0 || sourceX >= source.width)
                continue;
            const sourceIndex = (sourceY * source.width + sourceX) * 4;
            const destIndex = y * dest.width + x;
            const r = source.data[sourceIndex];
            const g = source.data[sourceIndex + 1];
            const b = source.data[sourceIndex + 2];
            dest.data[destIndex] = r * 0.2126 + g * 0.7152 + b * 0.0722;
        }
    }
    return dest;
};
exports.GrayToImageFactory = (createImage) => {
    const grayToImage = (source, sx = 0, sy = 0, sw = source.width - sx, sh = source.height - sy, alpha = 255) => {
        sx = sx | 0;
        sy = sy | 0;
        sw = sw | 0;
        sh = sh | 0;
        alpha = alpha | 0;
        if (sw <= 0 || sh <= 0)
            throw Error('Cannot create an image with 0 width or height');
        const dest = createImage(sw, sh);
        const destData = new Uint32Array(dest.data.buffer);
        for (let y = 0; y < sh; y++) {
            const sourceY = sy + y;
            if (sourceY < 0 || sourceY >= source.height)
                continue;
            for (let x = 0; x < sw; x++) {
                const sourceX = sx + x;
                if (sourceX < 0 || sourceX >= source.width)
                    continue;
                const sourceIndex = sourceY * source.width + sourceX;
                const destIndex = y * dest.width + x;
                const gray = source.data[sourceIndex];
                const c = common_1.rgbaToUint32(gray, gray, gray, alpha, common_1.isLittleEndian);
                destData[destIndex] = c;
            }
        }
        return dest;
    };
    const combineChannels = (red, green, blue, alpha) => {
        const { width, height } = red;
        if (green.width !== width || green.height !== height ||
            blue.width !== width || blue.height !== height ||
            alpha.width !== width || alpha.height !== height)
            throw Error('All source channels must be the same size');
        const dest = createImage(width, height);
        const destData = new Uint32Array(dest.data.buffer);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = y * dest.width + x;
                const r = red.data[index];
                const g = green.data[index];
                const b = blue.data[index];
                const a = alpha.data[index];
                const c = common_1.rgbaToUint32(r, g, b, a, common_1.isLittleEndian);
                destData[index] = c;
            }
        }
        return dest;
    };
    return { grayToImage, combineChannels };
};
_a = exports.GrayToImageFactory(create_image_1.createImage), exports.grayToImage = _a.grayToImage, exports.combineChannels = _a.combineChannels;

},{"@rgba-image/common":23,"@rgba-image/create-image":28}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@rgba-image/common");
exports.paste = (source, dest, sx = 0, sy = 0, sw = source.width - sx, sh = source.height - sy, dx = 0, dy = 0) => {
    sx = sx | 0;
    sy = sy | 0;
    sw = sw | 0;
    sh = sh | 0;
    dx = dx | 0;
    dy = dy | 0;
    if (sw <= 0 || sh <= 0)
        return;
    const destData = new Uint32Array(dest.data.buffer);
    for (let y = 0; y < sh; y++) {
        const sourceY = sy + y;
        if (sourceY < 0 || sourceY >= source.height)
            continue;
        const destY = dy + y;
        if (destY < 0 || destY >= dest.height)
            continue;
        for (let x = 0; x < sw; x++) {
            const sourceX = sx + x;
            if (sourceX < 0 || sourceX >= source.width)
                continue;
            const destX = dx + x;
            if (destX < 0 || destX >= dest.width)
                continue;
            const sourceIndex = (sourceY * source.width + sourceX) * 4;
            const destIndex = (destY * dest.width + destX) * 4;
            const sR = source.data[sourceIndex] / 255;
            const sG = source.data[sourceIndex + 1] / 255;
            const sB = source.data[sourceIndex + 2] / 255;
            const sA = source.data[sourceIndex + 3] / 255;
            const dR = dest.data[destIndex] / 255;
            const dG = dest.data[destIndex + 1] / 255;
            const dB = dest.data[destIndex + 2] / 255;
            const dA = dest.data[destIndex + 3] / 255;
            const a = dA + sA - dA * sA;
            const r = (sR * sA + dR * dA * (1 - sA)) / a;
            const g = (sG * sA + dG * dA * (1 - sA)) / a;
            const b = (sB * sA + dB * dA * (1 - sA)) / a;
            const v = common_1.rgbaToUint32(r * 255, g * 255, b * 255, a * 255, common_1.isLittleEndian);
            const dest32Index = destY * dest.width + destX;
            destData[dest32Index] = v;
        }
    }
};

},{"@rgba-image/common":23}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pixel_1 = require("./pixel");
exports.getPixel = pixel_1.getPixel;
exports.getPixelUint32 = pixel_1.getPixelUint32;
exports.setPixel = pixel_1.setPixel;
exports.setPixelUint32 = pixel_1.setPixelUint32;
var plot_1 = require("./plot");
exports.plot = plot_1.plot;
exports.plotUint32 = plot_1.plotUint32;
var region_1 = require("./region");
exports.setRegion = region_1.setRegion;
exports.mapRegion = region_1.mapRegion;
exports.setRegionUint32 = region_1.setRegionUint32;
exports.mapRegionUint32 = region_1.mapRegionUint32;

},{"./pixel":33,"./plot":34,"./region":35}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@rgba-image/common");
const color_1 = require("@rgba-image/color");
exports.getPixel = (source, x, y) => {
    x = x | 0;
    y = y | 0;
    const index = (y * source.width + x) * 4;
    if (index < 0 || index >= source.data.length)
        return [0, 0, 0, 0];
    const r = source.data[index];
    const g = source.data[index + 1];
    const b = source.data[index + 2];
    const a = source.data[index + 3];
    return [r, g, b, a];
};
exports.setPixel = (dest, x, y, r = 0, g = 0, b = 0, a = 255, composite = -1) => {
    x = x | 0;
    y = y | 0;
    const dataIndex = y * dest.width + x;
    const index = dataIndex * 4;
    if (index < 0 || index >= dest.data.length)
        return;
    const data = new Uint32Array(dest.data.buffer);
    if (composite === -1) {
        data[dataIndex] = common_1.rgbaToUint32(r, g, b, a, common_1.isLittleEndian);
    }
    else {
        const dR = dest.data[index];
        const dG = dest.data[index + 1];
        const dB = dest.data[index + 2];
        const dA = dest.data[index + 3];
        data[dataIndex] = typeof composite === 'function' ?
            composite(r, g, b, a, dR, dG, dB, dA) :
            color_1.compositeRgbaUint32(r, g, b, a, dR, dG, dB, dA, composite);
    }
};
exports.getPixelUint32 = (source, x, y) => {
    x = x | 0;
    y = y | 0;
    const size = source.width * source.height;
    const index = y * source.width + x;
    if (index < 0 || index >= size)
        return 0;
    const data = new Uint32Array(source.data.buffer);
    return data[index];
};
exports.setPixelUint32 = (dest, x, y, v, composite = -1) => {
    x = x | 0;
    y = y | 0;
    const size = dest.width * dest.height;
    const index = y * dest.width + x;
    if (index < 0 || index >= size)
        return;
    v = common_1.clampUint32(v);
    const data = new Uint32Array(dest.data.buffer);
    const rgbaUint32 = new Uint32Array(1);
    const rgbaUint8Clamped = new Uint8ClampedArray(rgbaUint32.buffer);
    if (composite === -1) {
        data[index] = v;
    }
    else {
        const currentIndex = index * 4;
        const dR = dest.data[currentIndex];
        const dG = dest.data[currentIndex + 1];
        const dB = dest.data[currentIndex + 2];
        const dA = dest.data[currentIndex + 3];
        rgbaUint32[0] = v;
        const r = rgbaUint8Clamped[0];
        const g = rgbaUint8Clamped[1];
        const b = rgbaUint8Clamped[2];
        const a = rgbaUint8Clamped[3];
        data[index] = typeof composite === 'function' ?
            composite(r, g, b, a, dR, dG, dB, dA) :
            color_1.compositeRgbaUint32(r, g, b, a, dR, dG, dB, dA, composite);
    }
};

},{"@rgba-image/color":17,"@rgba-image/common":23}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@rgba-image/common");
const color_1 = require("@rgba-image/color");
exports.plot = (dest, pixels, composite = -1) => {
    const { length } = pixels;
    if (!length)
        return;
    const size = dest.width * dest.height;
    const data = new Uint32Array(dest.data.buffer);
    for (let i = 0; i < length; i++) {
        let [x, y, r, g, b, a] = pixels[i];
        x = x | 0;
        y = y | 0;
        const index = y * dest.width + x;
        if (index < 0 || index >= size)
            continue;
        if (composite === -1) {
            data[index] = common_1.rgbaToUint32(r, g, b, a, common_1.isLittleEndian);
        }
        else {
            const currentIndex = index * 4;
            const dR = dest.data[currentIndex];
            const dG = dest.data[currentIndex + 1];
            const dB = dest.data[currentIndex + 2];
            const dA = dest.data[currentIndex + 3];
            data[index] = typeof composite === 'function' ?
                composite(r, g, b, a, dR, dG, dB, dA) :
                color_1.compositeRgbaUint32(r, g, b, a, dR, dG, dB, dA, composite);
        }
    }
};
exports.plotUint32 = (dest, pixels, composite = -1) => {
    const { length } = pixels;
    if (!length)
        return;
    const size = dest.width * dest.height;
    const data = new Uint32Array(dest.data.buffer);
    const rgbaUint32 = new Uint32Array(1);
    const rgbaUint8Clamped = new Uint8ClampedArray(rgbaUint32.buffer);
    for (let i = 0; i < length; i++) {
        let [x, y, v] = pixels[i];
        x = x | 0;
        y = y | 0;
        const index = y * dest.width + x;
        if (index < 0 || index >= size)
            continue;
        if (composite === -1) {
            v = common_1.clampUint32(v);
            data[index] = v;
        }
        else {
            const currentIndex = index * 4;
            const dR = dest.data[currentIndex];
            const dG = dest.data[currentIndex + 1];
            const dB = dest.data[currentIndex + 2];
            const dA = dest.data[currentIndex + 3];
            rgbaUint32[0] = v;
            const r = rgbaUint8Clamped[0];
            const g = rgbaUint8Clamped[1];
            const b = rgbaUint8Clamped[2];
            const a = rgbaUint8Clamped[3];
            data[index] = typeof composite === 'function' ?
                composite(r, g, b, a, dR, dG, dB, dA) :
                color_1.compositeRgbaUint32(r, g, b, a, dR, dG, dB, dA, composite);
        }
    }
};

},{"@rgba-image/color":17,"@rgba-image/common":23}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@rgba-image/common");
exports.setRegion = (dest, callback, sx = 0, sy = 0, sw = dest.width - sx, sh = dest.height - sy) => {
    sx = sx | 0;
    sy = sy | 0;
    sw = sw | 0;
    sh = sh | 0;
    if (sw <= 0 || sh <= 0)
        return;
    const data = new Uint32Array(dest.data.buffer);
    for (let y = 0; y < sh; y++) {
        const destY = sy + y;
        if (destY < 0 || destY >= dest.height)
            continue;
        for (let x = 0; x < sw; x++) {
            const destX = sx + x;
            if (destX < 0 || destX >= dest.width)
                continue;
            const dataIndex = destY * dest.width + destX;
            const index = dataIndex * 4;
            const sourceR = dest.data[index];
            const sourceG = dest.data[index + 1];
            const sourceB = dest.data[index + 2];
            const sourceA = dest.data[index + 3];
            const [r, g, b, a] = callback(sourceR, sourceG, sourceB, sourceA, x, y, destX, destY);
            data[dataIndex] = common_1.rgbaToUint32(r, g, b, a, common_1.isLittleEndian);
        }
    }
};
exports.mapRegion = (source, dest, callback, sx = 0, sy = 0, sw = source.width - sx, sh = source.height - sy, dx = 0, dy = 0) => {
    sx = sx | 0;
    sy = sy | 0;
    sw = sw | 0;
    sh = sh | 0;
    dx = dx | 0;
    dy = dy | 0;
    if (sw <= 0 || sh <= 0)
        return;
    const destData = new Uint32Array(dest.data.buffer);
    for (let y = 0; y < sh; y++) {
        const sourceY = sy + y;
        if (sourceY < 0 || sourceY >= source.height)
            continue;
        const destY = dy + y;
        if (destY < 0 || destY >= dest.height)
            continue;
        for (let x = 0; x < sw; x++) {
            const sourceX = sx + x;
            if (sourceX < 0 || sourceX >= source.width)
                continue;
            const destX = dx + x;
            if (destX < 0 || destX >= dest.width)
                continue;
            const sourceIndex = (sourceY * source.width + sourceX) * 4;
            const destIndex = (destY * dest.width + destX) * 4;
            const destUint32Index = destY * dest.width + destX;
            const sourceR = source.data[sourceIndex];
            const sourceG = source.data[sourceIndex + 1];
            const sourceB = source.data[sourceIndex + 2];
            const sourceA = source.data[sourceIndex + 3];
            const destR = dest.data[destIndex];
            const destG = dest.data[destIndex + 1];
            const destB = dest.data[destIndex + 2];
            const destA = dest.data[destIndex + 3];
            const [r, g, b, a] = callback(sourceR, sourceG, sourceB, sourceA, destR, destG, destB, destA, x, y, sourceX, sourceY, destX, destY);
            destData[destUint32Index] = common_1.rgbaToUint32(r, g, b, a, common_1.isLittleEndian);
        }
    }
};
exports.setRegionUint32 = (dest, callback, sx = 0, sy = 0, sw = dest.width - sx, sh = dest.height - sy) => {
    sx = sx | 0;
    sy = sy | 0;
    sw = sw | 0;
    sh = sh | 0;
    if (sw <= 0 || sh <= 0)
        return;
    const data = new Uint32Array(dest.data.buffer);
    for (let y = 0; y < sh; y++) {
        const destY = sy + y;
        if (destY < 0 || destY >= dest.height)
            continue;
        for (let x = 0; x < sw; x++) {
            const destX = sx + x;
            if (destX < 0 || destX >= dest.width)
                continue;
            const dataIndex = destY * dest.width + destX;
            const index = dataIndex * 4;
            const sourceR = dest.data[index];
            const sourceG = dest.data[index + 1];
            const sourceB = dest.data[index + 2];
            const sourceA = dest.data[index + 3];
            data[dataIndex] = callback(sourceR, sourceG, sourceB, sourceA, x, y, destX, destY);
        }
    }
};
exports.mapRegionUint32 = (source, dest, callback, sx = 0, sy = 0, sw = source.width - sx, sh = source.height - sy, dx = 0, dy = 0) => {
    sx = sx | 0;
    sy = sy | 0;
    sw = sw | 0;
    sh = sh | 0;
    dx = dx | 0;
    dy = dy | 0;
    if (sw <= 0 || sh <= 0)
        return;
    const destData = new Uint32Array(dest.data.buffer);
    for (let y = 0; y < sh; y++) {
        const sourceY = sy + y;
        if (sourceY < 0 || sourceY >= source.height)
            continue;
        const destY = dy + y;
        if (destY < 0 || destY >= dest.height)
            continue;
        for (let x = 0; x < sw; x++) {
            const sourceX = sx + x;
            if (sourceX < 0 || sourceX >= source.width)
                continue;
            const destX = dx + x;
            if (destX < 0 || destX >= dest.width)
                continue;
            const sourceIndex = (sourceY * source.width + sourceX) * 4;
            const destIndex = (destY * dest.width + destX) * 4;
            const destUint32Index = destY * dest.width + destX;
            const sourceR = source.data[sourceIndex];
            const sourceG = source.data[sourceIndex + 1];
            const sourceB = source.data[sourceIndex + 2];
            const sourceA = source.data[sourceIndex + 3];
            const destR = dest.data[destIndex];
            const destG = dest.data[destIndex + 1];
            const destB = dest.data[destIndex + 2];
            const destA = dest.data[destIndex + 3];
            destData[destUint32Index] = callback(sourceR, sourceG, sourceB, sourceA, destR, destG, destB, destA, x, y, sourceX, sourceY, destX, destY);
        }
    }
};

},{"@rgba-image/common":23}],36:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadHtmlImage = exports.drawingMapper = exports.cloneImageData = exports.fillImageData = exports.pasteImageData = exports.copyImageData = void 0;
__exportStar(require("@mojule/spa-router"), exports);
__exportStar(require("object-fit-math"), exports);
var copy_1 = require("@rgba-image/copy");
Object.defineProperty(exports, "copyImageData", { enumerable: true, get: function () { return copy_1.copy; } });
var paste_1 = require("@rgba-image/paste");
Object.defineProperty(exports, "pasteImageData", { enumerable: true, get: function () { return paste_1.paste; } });
var fill_1 = require("@rgba-image/fill");
Object.defineProperty(exports, "fillImageData", { enumerable: true, get: function () { return fill_1.fill; } });
var clone_1 = require("@rgba-image/clone");
Object.defineProperty(exports, "cloneImageData", { enumerable: true, get: function () { return clone_1.clone; } });
__exportStar(require("@rgba-image/gray"), exports);
__exportStar(require("@rgba-image/color"), exports);
__exportStar(require("@rgba-image/pixel"), exports);
__exportStar(require("./lib/dom/h"), exports);
__exportStar(require("./lib/dom/s"), exports);
__exportStar(require("./lib/dom/util"), exports);
__exportStar(require("./lib/geometry/line"), exports);
__exportStar(require("./lib/geometry/number"), exports);
__exportStar(require("./lib/geometry/point"), exports);
__exportStar(require("./lib/geometry/rect"), exports);
__exportStar(require("./lib/geometry/scale"), exports);
__exportStar(require("./lib/geometry/size"), exports);
__exportStar(require("./lib/util"), exports);
var mappers_1 = require("./lib/drawing/mappers");
Object.defineProperty(exports, "drawingMapper", { enumerable: true, get: function () { return mappers_1.drawingMapper; } });
var html_image_1 = require("./lib/drawing/mappers/html-image");
Object.defineProperty(exports, "loadHtmlImage", { enumerable: true, get: function () { return html_image_1.loadHtmlImage; } });
const s = {
    'paddingLeft': '1rem'
};

},{"./lib/dom/h":38,"./lib/dom/s":40,"./lib/dom/util":41,"./lib/drawing/mappers":49,"./lib/drawing/mappers/html-image":46,"./lib/geometry/line":52,"./lib/geometry/number":53,"./lib/geometry/point":54,"./lib/geometry/rect":55,"./lib/geometry/scale":56,"./lib/geometry/size":57,"./lib/util":58,"@mojule/spa-router":12,"@rgba-image/clone":13,"@rgba-image/color":17,"@rgba-image/copy":27,"@rgba-image/fill":29,"@rgba-image/gray":30,"@rgba-image/paste":31,"@rgba-image/pixel":32,"object-fit-math":60}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cursorStates = exports.svgDataUrlHeader = exports.svgNs = void 0;
exports.svgNs = 'http://www.w3.org/2000/svg';
exports.svgDataUrlHeader = 'data:image/svg+xml;base64,';
exports.cursorStates = [
    'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize', 'move'
];

},{}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wbr = exports.video = exports.$var = exports.ul = exports.u = exports.track = exports.tr = exports.title = exports.time = exports.thead = exports.th = exports.tfoot = exports.textarea = exports.template = exports.td = exports.tbody = exports.table = exports.sup = exports.summary = exports.sub = exports.style = exports.strong = exports.span = exports.source = exports.small = exports.slot = exports.select = exports.section = exports.script = exports.samp = exports.$s = exports.ruby = exports.rt = exports.rp = exports.q = exports.progress = exports.pre = exports.picture = exports.param = exports.p = exports.output = exports.option = exports.optgroup = exports.ol = exports.object = exports.noscript = exports.nav = exports.meter = exports.meta = exports.menu = exports.marquee = exports.mark = exports.map = exports.main = exports.link = exports.li = exports.legend = exports.label = exports.kbd = exports.ins = exports.input = exports.img = exports.iframe = exports.i = exports.html = exports.hr = exports.hgroup = exports.header = exports.head = exports.h6 = exports.h5 = exports.h4 = exports.h3 = exports.h2 = exports.h1 = exports.frameset = exports.frame = exports.form = exports.footer = exports.font = exports.figure = exports.figcaption = exports.fieldset = exports.embed = exports.em = exports.dt = exports.dl = exports.div = exports.dir = exports.dialog = exports.dfn = exports.details = exports.del = exports.dd = exports.datalist = exports.data = exports.colgroup = exports.col = exports.code = exports.cite = exports.caption = exports.canvas = exports.button = exports.br = exports.body = exports.blockquote = exports.bdo = exports.bdi = exports.basefont = exports.base = exports.b = exports.audio = exports.aside = exports.article = exports.area = exports.applet = exports.address = exports.abbr = exports.a = exports.styleToString = exports.htmlElementFactory = exports.text = exports.fragment = exports.h = void 0;
const predicates_1 = require("./predicates");
const util_1 = require("./util");
exports.h = (name, ...args) => {
    const el = document.createElement(name);
    args.forEach(arg => {
        if (predicates_1.isNode(arg) || typeof arg === 'string') {
            el.append(arg);
        }
        else {
            util_1.attr(el, arg);
        }
    });
    return el;
};
exports.fragment = (...args) => {
    const documentFragment = document.createDocumentFragment();
    documentFragment.append(...args);
    return documentFragment;
};
exports.text = (...values) => document.createTextNode(values.join(''));
exports.htmlElementFactory = (name) => (...args) => exports.h(name, ...args);
exports.styleToString = (style) => {
    const { style: rules } = exports.div();
    Object.assign(rules, style);
    const { cssText } = rules;
    return cssText;
};
exports.a = exports.htmlElementFactory('a');
exports.abbr = exports.htmlElementFactory('abbr');
exports.address = exports.htmlElementFactory('address');
exports.applet = exports.htmlElementFactory('applet');
exports.area = exports.htmlElementFactory('area');
exports.article = exports.htmlElementFactory('article');
exports.aside = exports.htmlElementFactory('aside');
exports.audio = exports.htmlElementFactory('audio');
exports.b = exports.htmlElementFactory('b');
exports.base = exports.htmlElementFactory('base');
exports.basefont = exports.htmlElementFactory('basefont');
exports.bdi = exports.htmlElementFactory('bdi');
exports.bdo = exports.htmlElementFactory('bdo');
exports.blockquote = exports.htmlElementFactory('blockquote');
exports.body = exports.htmlElementFactory('body');
exports.br = exports.htmlElementFactory('br');
exports.button = exports.htmlElementFactory('button');
exports.canvas = exports.htmlElementFactory('canvas');
exports.caption = exports.htmlElementFactory('caption');
exports.cite = exports.htmlElementFactory('cite');
exports.code = exports.htmlElementFactory('code');
exports.col = exports.htmlElementFactory('col');
exports.colgroup = exports.htmlElementFactory('colgroup');
exports.data = exports.htmlElementFactory('data');
exports.datalist = exports.htmlElementFactory('datalist');
exports.dd = exports.htmlElementFactory('dd');
exports.del = exports.htmlElementFactory('del');
exports.details = exports.htmlElementFactory('details');
exports.dfn = exports.htmlElementFactory('dfn');
exports.dialog = exports.htmlElementFactory('dialog');
exports.dir = exports.htmlElementFactory('dir');
exports.div = exports.htmlElementFactory('div');
exports.dl = exports.htmlElementFactory('dl');
exports.dt = exports.htmlElementFactory('dt');
exports.em = exports.htmlElementFactory('em');
exports.embed = exports.htmlElementFactory('embed');
exports.fieldset = exports.htmlElementFactory('fieldset');
exports.figcaption = exports.htmlElementFactory('figcaption');
exports.figure = exports.htmlElementFactory('figure');
exports.font = exports.htmlElementFactory('font');
exports.footer = exports.htmlElementFactory('footer');
exports.form = exports.htmlElementFactory('form');
exports.frame = exports.htmlElementFactory('frame');
exports.frameset = exports.htmlElementFactory('frameset');
exports.h1 = exports.htmlElementFactory('h1');
exports.h2 = exports.htmlElementFactory('h2');
exports.h3 = exports.htmlElementFactory('h3');
exports.h4 = exports.htmlElementFactory('h4');
exports.h5 = exports.htmlElementFactory('h5');
exports.h6 = exports.htmlElementFactory('h6');
exports.head = exports.htmlElementFactory('head');
exports.header = exports.htmlElementFactory('header');
exports.hgroup = exports.htmlElementFactory('hgroup');
exports.hr = exports.htmlElementFactory('hr');
exports.html = exports.htmlElementFactory('html');
exports.i = exports.htmlElementFactory('i');
exports.iframe = exports.htmlElementFactory('iframe');
exports.img = exports.htmlElementFactory('img');
exports.input = exports.htmlElementFactory('input');
exports.ins = exports.htmlElementFactory('ins');
exports.kbd = exports.htmlElementFactory('kbd');
exports.label = exports.htmlElementFactory('label');
exports.legend = exports.htmlElementFactory('legend');
exports.li = exports.htmlElementFactory('li');
exports.link = exports.htmlElementFactory('link');
exports.main = exports.htmlElementFactory('main');
exports.map = exports.htmlElementFactory('map');
exports.mark = exports.htmlElementFactory('mark');
exports.marquee = exports.htmlElementFactory('marquee');
exports.menu = exports.htmlElementFactory('menu');
exports.meta = exports.htmlElementFactory('meta');
exports.meter = exports.htmlElementFactory('meter');
exports.nav = exports.htmlElementFactory('nav');
exports.noscript = exports.htmlElementFactory('noscript');
exports.object = exports.htmlElementFactory('object');
exports.ol = exports.htmlElementFactory('ol');
exports.optgroup = exports.htmlElementFactory('optgroup');
exports.option = exports.htmlElementFactory('option');
exports.output = exports.htmlElementFactory('output');
exports.p = exports.htmlElementFactory('p');
exports.param = exports.htmlElementFactory('param');
exports.picture = exports.htmlElementFactory('picture');
exports.pre = exports.htmlElementFactory('pre');
exports.progress = exports.htmlElementFactory('progress');
exports.q = exports.htmlElementFactory('q');
exports.rp = exports.htmlElementFactory('rp');
exports.rt = exports.htmlElementFactory('rt');
exports.ruby = exports.htmlElementFactory('ruby');
exports.$s = exports.htmlElementFactory('s');
exports.samp = exports.htmlElementFactory('samp');
exports.script = exports.htmlElementFactory('script');
exports.section = exports.htmlElementFactory('section');
exports.select = exports.htmlElementFactory('select');
exports.slot = exports.htmlElementFactory('slot');
exports.small = exports.htmlElementFactory('small');
exports.source = exports.htmlElementFactory('source');
exports.span = exports.htmlElementFactory('span');
exports.strong = exports.htmlElementFactory('strong');
exports.style = exports.htmlElementFactory('style');
exports.sub = exports.htmlElementFactory('sub');
exports.summary = exports.htmlElementFactory('summary');
exports.sup = exports.htmlElementFactory('sup');
exports.table = exports.htmlElementFactory('table');
exports.tbody = exports.htmlElementFactory('tbody');
exports.td = exports.htmlElementFactory('td');
exports.template = exports.htmlElementFactory('template');
exports.textarea = exports.htmlElementFactory('textarea');
exports.tfoot = exports.htmlElementFactory('tfoot');
exports.th = exports.htmlElementFactory('th');
exports.thead = exports.htmlElementFactory('thead');
exports.time = exports.htmlElementFactory('time');
exports.title = exports.htmlElementFactory('title');
exports.tr = exports.htmlElementFactory('tr');
exports.track = exports.htmlElementFactory('track');
exports.u = exports.htmlElementFactory('u');
exports.ul = exports.htmlElementFactory('ul');
exports.$var = exports.htmlElementFactory('var');
exports.video = exports.htmlElementFactory('video');
exports.wbr = exports.htmlElementFactory('wbr');

},{"./predicates":39,"./util":41}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSVGElement = exports.isElement = exports.isNode = void 0;
const consts_1 = require("./consts");
exports.isNode = (value) => value && typeof value['nodeType'] === 'number';
exports.isElement = (value) => value && value['nodeType'] === 1;
exports.isSVGElement = (value) => exports.isElement(value) && value.namespaceURI === consts_1.svgNs;

},{"./consts":37}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLinearGradient = exports.view = exports.use = exports.tspan = exports.$title = exports.textPath = exports.$text = exports.symbol = exports.$switch = exports.svg = exports.$style = exports.stop = exports.$script = exports.rect = exports.radialGradient = exports.polyline = exports.polygon = exports.pattern = exports.path = exports.metadata = exports.mask = exports.marker = exports.linearGradient = exports.line = exports.image = exports.g = exports.foreignObject = exports.filter = exports.feTurbulence = exports.feTile = exports.feSpotLight = exports.feSpecularLighting = exports.fePointLight = exports.feOffset = exports.feMorphology = exports.feMergeNode = exports.feMerge = exports.feImage = exports.feGaussianBlur = exports.feFuncR = exports.feFuncG = exports.feFuncB = exports.feFuncA = exports.feFlood = exports.feDistantLight = exports.feDisplacementMap = exports.feDiffuseLighting = exports.feConvolveMatrix = exports.feComposite = exports.feComponentTransfer = exports.feColorMatrix = exports.feBlend = exports.ellipse = exports.desc = exports.defs = exports.clipPath = exports.circle = exports.$a = exports.svgElementFactory = exports.s = void 0;
const consts_1 = require("./consts");
const predicates_1 = require("./predicates");
const util_1 = require("./util");
exports.s = (name, ...args) => {
    const el = document.createElementNS(consts_1.svgNs, name);
    args.forEach(arg => {
        if (predicates_1.isSVGElement(arg) || predicates_1.isElement(arg) || typeof arg === 'string') {
            el.append(arg);
        }
        else {
            util_1.attr(el, arg);
        }
    });
    return el;
};
exports.svgElementFactory = (name) => (...args) => exports.s(name, ...args);
exports.$a = exports.svgElementFactory('a');
exports.circle = exports.svgElementFactory('circle');
exports.clipPath = exports.svgElementFactory('clipPath');
exports.defs = exports.svgElementFactory('defs');
exports.desc = exports.svgElementFactory('desc');
exports.ellipse = exports.svgElementFactory('ellipse');
exports.feBlend = exports.svgElementFactory('feBlend');
exports.feColorMatrix = exports.svgElementFactory('feColorMatrix');
exports.feComponentTransfer = exports.svgElementFactory('feComponentTransfer');
exports.feComposite = exports.svgElementFactory('feComposite');
exports.feConvolveMatrix = exports.svgElementFactory('feConvolveMatrix');
exports.feDiffuseLighting = exports.svgElementFactory('feDiffuseLighting');
exports.feDisplacementMap = exports.svgElementFactory('feDisplacementMap');
exports.feDistantLight = exports.svgElementFactory('feDistantLight');
exports.feFlood = exports.svgElementFactory('feFlood');
exports.feFuncA = exports.svgElementFactory('feFuncA');
exports.feFuncB = exports.svgElementFactory('feFuncB');
exports.feFuncG = exports.svgElementFactory('feFuncG');
exports.feFuncR = exports.svgElementFactory('feFuncR');
exports.feGaussianBlur = exports.svgElementFactory('feGaussianBlur');
exports.feImage = exports.svgElementFactory('feImage');
exports.feMerge = exports.svgElementFactory('feMerge');
exports.feMergeNode = exports.svgElementFactory('feMergeNode');
exports.feMorphology = exports.svgElementFactory('feMorphology');
exports.feOffset = exports.svgElementFactory('feOffset');
exports.fePointLight = exports.svgElementFactory('fePointLight');
exports.feSpecularLighting = exports.svgElementFactory('feSpecularLighting');
exports.feSpotLight = exports.svgElementFactory('feSpotLight');
exports.feTile = exports.svgElementFactory('feTile');
exports.feTurbulence = exports.svgElementFactory('feTurbulence');
exports.filter = exports.svgElementFactory('filter');
exports.foreignObject = exports.svgElementFactory('foreignObject');
exports.g = exports.svgElementFactory('g');
exports.image = exports.svgElementFactory('image');
exports.line = exports.svgElementFactory('line');
exports.linearGradient = exports.svgElementFactory('linearGradient');
exports.marker = exports.svgElementFactory('marker');
exports.mask = exports.svgElementFactory('mask');
exports.metadata = exports.svgElementFactory('metadata');
exports.path = exports.svgElementFactory('path');
exports.pattern = exports.svgElementFactory('pattern');
exports.polygon = exports.svgElementFactory('polygon');
exports.polyline = exports.svgElementFactory('polyline');
exports.radialGradient = exports.svgElementFactory('radialGradient');
exports.rect = exports.svgElementFactory('rect');
exports.$script = exports.svgElementFactory('script');
exports.stop = exports.svgElementFactory('stop');
exports.$style = exports.svgElementFactory('style');
exports.svg = exports.svgElementFactory('svg');
exports.$switch = exports.svgElementFactory('switch');
exports.symbol = exports.svgElementFactory('symbol');
exports.$text = exports.svgElementFactory('text');
exports.textPath = exports.svgElementFactory('textPath');
exports.$title = exports.svgElementFactory('title');
exports.tspan = exports.svgElementFactory('tspan');
exports.use = exports.svgElementFactory('use');
exports.view = exports.svgElementFactory('view');
exports.createLinearGradient = (stops, x1, y1, x2, y2, gradientUnits = 'userSpaceOnUse') => {
    const el = exports.linearGradient(...stops.map(createStop));
    util_1.attr(el, { gradientUnits, x1, y1, x2, y2 });
    return el;
};
const createStop = ([offset, color]) => exports.stop({ offset, style: `stop-color:${color}` });

},{"./consts":37,"./predicates":39,"./util":41}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadFont = exports.cloneImageData = exports.cloneElement = exports.setRectElRect = exports.getRectElRect = exports.strictFind = exports.strictGetData = exports.strictFormRadioNodes = exports.strictFieldsetRadioNodes = exports.strictFieldsetElement = exports.strictFormElement = exports.strictSelect = exports.attr = void 0;
const styleKey = 'style';
exports.attr = (el, ...attributeRecords) => {
    attributeRecords.forEach(attributes => {
        Object.keys(attributes).forEach(key => {
            if (key === styleKey) {
                if (styleKey in el) {
                    const value = attributes[key];
                    if (typeof value === 'string') {
                        el.setAttribute('style', value);
                        return;
                    }
                    const styleTarget = el[styleKey];
                    try {
                        Object.assign(styleTarget, value);
                    }
                    catch (err) {
                        console.warn('setting style on el', { styleTarget, value });
                        throw err;
                    }
                }
                return;
            }
            const value = String(attributes[key]);
            el.setAttribute(key, value);
        });
    });
};
exports.strictSelect = (selectors, el = document) => {
    const result = el.querySelector(selectors);
    if (result === null)
        throw Error(`Expected ${selectors} to match something`);
    return result;
};
exports.strictFormElement = (formEl, name) => {
    const el = formEl.elements.namedItem(name);
    if (el instanceof HTMLInputElement)
        return el;
    if (el instanceof RadioNodeList)
        return el;
    throw Error(`Expected an HTMLInputElement or RadioNodeList called ${name}`);
};
exports.strictFieldsetElement = (fieldsetEl, name) => {
    const el = fieldsetEl.elements.namedItem(name);
    if (el instanceof HTMLInputElement)
        return el;
    if (el instanceof RadioNodeList)
        return el;
    throw Error(`Expected an HTMLInputElement or RadioNodeList called ${name}`);
};
exports.strictFieldsetRadioNodes = (fieldsetEl, name) => {
    const el = fieldsetEl.elements.namedItem(name);
    if (el instanceof RadioNodeList)
        return el;
    throw Error(`Expected a RadioNodeList called ${name}`);
};
exports.strictFormRadioNodes = (formEl, name) => {
    const el = formEl.elements.namedItem(name);
    if (el instanceof RadioNodeList)
        return el;
    throw Error(`Expected a RadioNodeList called ${name}`);
};
exports.strictGetData = (el, key) => {
    const value = el.dataset[key];
    if (value === undefined)
        throw Error(`Expected element dataset to contain ${key}`);
    return value;
};
exports.strictFind = (elements, predicate) => {
    const result = elements.find(predicate);
    if (result === undefined)
        throw Error(`Expected predicate to match something`);
    return result;
};
exports.getRectElRect = (rectEl) => {
    const { x: ex, y: ey, width: ew, height: eh } = rectEl;
    const x = ex.baseVal.value;
    const y = ey.baseVal.value;
    const width = ew.baseVal.value;
    const height = eh.baseVal.value;
    const rect = { x, y, width, height };
    return rect;
};
exports.setRectElRect = (rectEl, rect) => {
    const initialRect = exports.getRectElRect(rectEl);
    const { x, y, width, height } = Object.assign({}, initialRect, rect);
    rectEl.x.baseVal.value = x;
    rectEl.y.baseVal.value = y;
    rectEl.width.baseVal.value = width;
    rectEl.height.baseVal.value = height;
};
exports.cloneElement = (value) => value.cloneNode(true);
exports.cloneImageData = (source) => {
    const dest = new ImageData(source.width, source.height);
    for (let i = 0; i < source.data.length; i++) {
        dest.data[i] = source.data[i];
    }
    return dest;
};
exports.loadFont = async (name, src) => {
    const fontFace = new FontFace(name, `url(${src})`, {});
    await fontFace.load();
    document['fonts'].add(fontFace);
};

},{}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyBlob = exports.cloneBlob = exports.blobToCanvas = exports.blobToHtmlImage = exports.blobToDataUrl = void 0;
const html_image_1 = require("./html-image");
const image_source_1 = require("./image-source");
exports.blobToDataUrl = (source) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        const { result } = reader;
        if (typeof result === 'string') {
            return resolve(result);
        }
        reject(Error('Expected a data URL'));
    };
    reader.readAsDataURL(source);
});
exports.blobToHtmlImage = async (source) => html_image_1.loadHtmlImage(await exports.blobToDataUrl(source));
exports.blobToCanvas = async (source) => image_source_1.imageSourceToCanvas(await exports.blobToHtmlImage(source));
exports.cloneBlob = (source) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
        if (r.result instanceof ArrayBuffer) {
            return resolve(new Blob([r.result], { type: source.type }));
        }
        reject(Error('Expected ArrayBuffer'));
    };
    r.onerror = reject;
    r.readAsArrayBuffer(source);
});
exports.stringifyBlob = ({ size, type }) => JSON.stringify({ blob: { size, type } });

},{"./html-image":46,"./image-source":48}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canvasToContext = exports.cloneCanvas = exports.canvasToSvg = exports.canvasToDataUrl = exports.canvasToBlob = exports.canvasToHtmlImage = exports.canvasToImageData = exports.createCanvas = void 0;
const h_1 = require("../../dom/h");
const util_1 = require("../../dom/util");
const context_1 = require("./context");
const html_image_1 = require("./html-image");
const image_data_1 = require("./image-data");
const settings_1 = require("./settings");
exports.createCanvas = (size) => {
    const el = h_1.canvas();
    const crossorigin = settings_1.getCrossOrigin();
    if (crossorigin) {
        util_1.attr(el, { crossorigin });
    }
    el.width = size.width;
    el.height = size.height;
    return el;
};
exports.canvasToImageData = (source) => context_1.contextToImageData(exports.canvasToContext(source));
exports.canvasToHtmlImage = (source) => html_image_1.loadHtmlImage(source.toDataURL());
exports.canvasToBlob = (source) => new Promise((resolve, reject) => {
    source.toBlob(blob => {
        if (blob === null)
            return reject(Error('Expected blob, got null'));
        resolve(blob);
    });
});
exports.canvasToDataUrl = (source) => source.toDataURL();
exports.canvasToSvg = async (source) => html_image_1.htmlImageToSvg(await html_image_1.loadHtmlImage(source.toDataURL()));
exports.cloneCanvas = (source) => image_data_1.imageDataToCanvas(exports.canvasToImageData(source));
exports.canvasToContext = (source) => {
    const context = source.getContext('2d');
    if (context === null)
        throw Error('Expected CanvasRenderingContext2D');
    return context;
};

},{"../../dom/h":38,"../../dom/util":41,"./context":44,"./html-image":46,"./image-data":47,"./settings":50}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextToImageData = void 0;
exports.contextToImageData = (source) => {
    const imageData = source.getImageData(0, 0, Number(source.canvas.width), Number(source.canvas.height));
    return imageData;
};

},{}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataUrlToCanvas = exports.dataUrlToSvg = void 0;
const consts_1 = require("../../dom/consts");
const html_image_1 = require("./html-image");
const image_source_1 = require("./image-source");
const svg_1 = require("./svg");
exports.dataUrlToSvg = async (source) => {
    if (source.startsWith(consts_1.svgDataUrlHeader))
        return svg_1.svgDataUrlToSvg(source);
    const imageEl = await html_image_1.loadHtmlImage(source);
    return html_image_1.htmlImageToSvg(imageEl);
};
exports.dataUrlToCanvas = async (source) => image_source_1.imageSourceToCanvas(await html_image_1.loadHtmlImage(source));

},{"../../dom/consts":37,"./html-image":46,"./image-source":48,"./svg":51}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.htmlImageToSvg = exports.htmlImageToSvgImage = exports.loadHtmlImage = void 0;
const util_1 = require("../../dom/util");
const settings_1 = require("./settings");
const svg_1 = require("./svg");
exports.loadHtmlImage = async (src) => {
    const el = new Image();
    const crossorigin = settings_1.getCrossOrigin();
    if (crossorigin) {
        el.crossOrigin = crossorigin;
    }
    el.src = src;
    await el.decode();
    return el;
};
exports.htmlImageToSvgImage = async (source) => {
    const { width, height, src } = source;
    const el = await svg_1.loadSvgImage(src);
    util_1.attr(el, { width, height });
    return el;
};
exports.htmlImageToSvg = async (source) => {
    const { width, height } = source;
    const el = svg_1.createSvg({ width, height });
    const svgImageEl = await exports.htmlImageToSvgImage(source);
    el.append(svgImageEl);
    return el;
};

},{"../../dom/util":41,"./settings":50,"./svg":51}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageDataToSvg = exports.imageDataToCanvas = void 0;
const canvas_1 = require("./canvas");
const html_image_1 = require("./html-image");
exports.imageDataToCanvas = (source) => {
    const el = canvas_1.createCanvas(source);
    const context = canvas_1.canvasToContext(el);
    context.putImageData(source, 0, 0);
    return el;
};
exports.imageDataToSvg = async (source) => {
    const canvas = exports.imageDataToCanvas(source);
    const htmlImage = await canvas_1.canvasToHtmlImage(canvas);
    return html_image_1.htmlImageToSvg(htmlImage);
};

},{"./canvas":43,"./html-image":46}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneImageSource = exports.imageSourceToDataUrl = exports.imageSourceToSvg = exports.imageSourceToSize = exports.imageSourceToElement = exports.imageSourceToHtmlImage = exports.imageSourceToImageData = exports.imageSourceToCanvas = exports.imageSourceToContext = void 0;
const predicates_1 = require("../../dom/predicates");
const util_1 = require("../../dom/util");
const canvas_1 = require("./canvas");
const html_image_1 = require("./html-image");
exports.imageSourceToContext = (source) => canvas_1.canvasToContext(exports.imageSourceToCanvas(source));
exports.imageSourceToCanvas = (source) => {
    const width = Number(source.width);
    const height = Number(source.height);
    const el = canvas_1.createCanvas({ width, height });
    const context = canvas_1.canvasToContext(el);
    context.drawImage(source, 0, 0);
    return el;
};
exports.imageSourceToImageData = (source) => {
    const context = exports.imageSourceToContext(source);
    const imageData = context.getImageData(0, 0, Number(source.width), Number(source.height));
    return imageData;
};
exports.imageSourceToHtmlImage = async (source) => {
    if (source instanceof HTMLImageElement) {
        return util_1.cloneElement(source);
    }
    return html_image_1.loadHtmlImage(exports.imageSourceToCanvas(source).toDataURL());
};
exports.imageSourceToElement = async (source) => {
    if (predicates_1.isElement(source)) {
        return util_1.cloneElement(source);
    }
    return html_image_1.loadHtmlImage(exports.imageSourceToCanvas(source).toDataURL());
};
exports.imageSourceToSize = (source) => {
    const width = Number(source.width);
    const height = Number(source.height);
    return { width, height };
};
exports.imageSourceToSvg = async (source) => html_image_1.htmlImageToSvg(await html_image_1.loadHtmlImage(exports.imageSourceToCanvas(source).toDataURL()));
exports.imageSourceToDataUrl = async (source) => exports.imageSourceToCanvas(source).toDataURL();
exports.cloneImageSource = async (source) => {
    if (source instanceof HTMLImageElement) {
        return util_1.cloneElement(source);
    }
    if (source instanceof HTMLCanvasElement)
        return canvas_1.cloneCanvas(source);
    return canvas_1.canvasToHtmlImage(exports.imageSourceToCanvas(source));
};

},{"../../dom/predicates":39,"../../dom/util":41,"./canvas":43,"./html-image":46}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawingMapper = void 0;
const util_1 = require("../../dom/util");
const blob_1 = require("./blob");
const canvas_1 = require("./canvas");
const context_1 = require("./context");
const data_url_1 = require("./data-url");
const html_image_1 = require("./html-image");
const image_data_1 = require("./image-data");
const image_source_1 = require("./image-source");
const svg_1 = require("./svg");
const syncToAsync = (sync) => async (from) => sync(from);
const justSize = async ({ width, height }) => ({ width, height });
exports.drawingMapper = {
    imageSource: {
        imageSource: image_source_1.cloneImageSource,
        htmlImage: image_source_1.imageSourceToHtmlImage,
        canvas: syncToAsync(image_source_1.imageSourceToCanvas),
        context: syncToAsync(image_source_1.imageSourceToContext),
        imageData: syncToAsync(image_source_1.imageSourceToImageData),
        blob: source => canvas_1.canvasToBlob(image_source_1.imageSourceToCanvas(source)),
        size: syncToAsync(image_source_1.imageSourceToSize),
        svg: image_source_1.imageSourceToSvg,
        dataUrl: image_source_1.imageSourceToDataUrl
    },
    htmlImage: {
        imageSource: image_source_1.cloneImageSource,
        htmlImage: syncToAsync(util_1.cloneElement),
        canvas: syncToAsync(image_source_1.imageSourceToCanvas),
        context: syncToAsync(image_source_1.imageSourceToContext),
        imageData: syncToAsync(image_source_1.imageSourceToImageData),
        blob: source => canvas_1.canvasToBlob(image_source_1.imageSourceToCanvas(source)),
        size: justSize,
        svg: html_image_1.htmlImageToSvg,
        dataUrl: image_source_1.imageSourceToDataUrl
    },
    canvas: {
        imageSource: canvas_1.canvasToHtmlImage,
        htmlImage: canvas_1.canvasToHtmlImage,
        canvas: syncToAsync(canvas_1.cloneCanvas),
        context: syncToAsync(canvas_1.canvasToContext),
        imageData: syncToAsync(canvas_1.canvasToImageData),
        blob: canvas_1.canvasToBlob,
        size: justSize,
        svg: canvas_1.canvasToSvg,
        dataUrl: syncToAsync(canvas_1.canvasToDataUrl)
    },
    context: {
        imageSource: source => canvas_1.canvasToHtmlImage(source.canvas),
        htmlImage: source => canvas_1.canvasToHtmlImage(source.canvas),
        canvas: async (source) => canvas_1.cloneCanvas(source.canvas),
        context: async (source) => canvas_1.canvasToContext(canvas_1.cloneCanvas(source.canvas)),
        imageData: syncToAsync(context_1.contextToImageData),
        blob: source => canvas_1.canvasToBlob(source.canvas),
        size: source => justSize(source.canvas),
        svg: async (source) => canvas_1.canvasToSvg(source.canvas),
        dataUrl: async (source) => source.canvas.toDataURL()
    },
    imageData: {
        imageSource: source => canvas_1.canvasToHtmlImage(image_data_1.imageDataToCanvas(source)),
        htmlImage: source => canvas_1.canvasToHtmlImage(image_data_1.imageDataToCanvas(source)),
        canvas: async (source) => image_data_1.imageDataToCanvas(source),
        context: async (source) => canvas_1.canvasToContext(image_data_1.imageDataToCanvas(source)),
        imageData: async (source) => util_1.cloneImageData(source),
        blob: source => canvas_1.canvasToBlob(image_data_1.imageDataToCanvas(source)),
        size: justSize,
        svg: image_data_1.imageDataToSvg,
        dataUrl: async (source) => image_data_1.imageDataToCanvas(source).toDataURL()
    },
    blob: {
        imageSource: blob_1.blobToHtmlImage,
        htmlImage: blob_1.blobToHtmlImage,
        canvas: blob_1.blobToCanvas,
        context: async (source) => canvas_1.canvasToContext(await blob_1.blobToCanvas(source)),
        imageData: async (source) => canvas_1.canvasToImageData(await blob_1.blobToCanvas(source)),
        blob: blob_1.cloneBlob,
        size: async (source) => justSize(await blob_1.blobToHtmlImage(source)),
        svg: async (source) => html_image_1.htmlImageToSvg(await blob_1.blobToHtmlImage(source)),
        dataUrl: blob_1.blobToDataUrl
    },
    svg: {
        imageSource: svg_1.svgToHtmlImage,
        htmlImage: svg_1.svgToHtmlImage,
        canvas: svg_1.svgToCanvas,
        context: async (source) => canvas_1.canvasToContext(await svg_1.svgToCanvas(source)),
        imageData: async (source) => canvas_1.canvasToImageData(await svg_1.svgToCanvas(source)),
        blob: async (source) => canvas_1.canvasToBlob(await svg_1.svgToCanvas(source)),
        size: svg_1.svgToSize,
        svg: async (source) => util_1.cloneElement(source),
        dataUrl: async (source) => svg_1.svgToDataUrl(source)
    },
    dataUrl: {
        imageSource: html_image_1.loadHtmlImage,
        htmlImage: html_image_1.loadHtmlImage,
        canvas: data_url_1.dataUrlToCanvas,
        context: async (source) => canvas_1.canvasToContext(await data_url_1.dataUrlToCanvas(source)),
        imageData: async (source) => canvas_1.canvasToImageData(await data_url_1.dataUrlToCanvas(source)),
        blob: async (source) => canvas_1.canvasToBlob(await data_url_1.dataUrlToCanvas(source)),
        size: async (source) => justSize(await html_image_1.loadHtmlImage(source)),
        svg: data_url_1.dataUrlToSvg,
        dataUrl: async (source) => source
    },
    size: {
        imageSource: async (source) => new Image(source.width, source.height),
        htmlImage: async (source) => new Image(source.width, source.height),
        canvas: async (source) => canvas_1.createCanvas(source),
        context: async (source) => canvas_1.canvasToContext(canvas_1.createCanvas(source)),
        imageData: async (source) => canvas_1.canvasToImageData(canvas_1.createCanvas(source)),
        blob: source => canvas_1.canvasToBlob(canvas_1.createCanvas(source)),
        size: justSize,
        svg: syncToAsync(svg_1.createSvg),
        dataUrl: async (source) => canvas_1.createCanvas(source).toDataURL()
    }
};

},{"../../dom/util":41,"./blob":42,"./canvas":43,"./context":44,"./data-url":45,"./html-image":46,"./image-data":47,"./image-source":48,"./svg":51}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCrossOrigin = exports.clearCrossOrigin = exports.setCrossOrigin = void 0;
let crossOrigin = undefined;
exports.setCrossOrigin = (value) => {
    crossOrigin = value;
};
exports.clearCrossOrigin = () => {
    crossOrigin = undefined;
};
exports.getCrossOrigin = () => crossOrigin;

},{}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.svgDataUrlToSvg = exports.sizeFromSvgViewBox = exports.svgToCanvas = exports.svgToSize = exports.svgToHtmlImage = exports.svgToDataUrl = exports.createSvg = exports.loadSvgImage = void 0;
const consts_1 = require("../../dom/consts");
const h_1 = require("../../dom/h");
const s_1 = require("../../dom/s");
const util_1 = require("../../dom/util");
const html_image_1 = require("./html-image");
const image_source_1 = require("./image-source");
const settings_1 = require("./settings");
exports.loadSvgImage = (src) => new Promise((resolve, reject) => {
    const el = s_1.image();
    const crossorigin = settings_1.getCrossOrigin();
    if (crossorigin) {
        util_1.attr(el, { crossorigin });
    }
    el.onerror = reject;
    el.onload = () => resolve(el);
    el.href.baseVal = src;
});
exports.createSvg = ({ width, height }) => {
    const el = s_1.svg();
    const crossorigin = settings_1.getCrossOrigin();
    if (crossorigin) {
        util_1.attr(el, { crossorigin });
    }
    util_1.attr(el, { width, height, viewBox: `0 0 ${width} ${height}` });
    return el;
};
exports.svgToDataUrl = (source) => {
    source.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', 'http://www.w3.org/2000/svg');
    source.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
    const xml = new XMLSerializer().serializeToString(source);
    const dataUrl = `${consts_1.svgDataUrlHeader}${btoa(xml)}`;
    return dataUrl;
};
exports.svgToHtmlImage = async (source) => {
    const dataUrl = exports.svgToDataUrl(source);
    const el = await html_image_1.loadHtmlImage(dataUrl);
    return el;
};
exports.svgToSize = async (source) => {
    try {
        return exports.sizeFromSvgViewBox(source);
    }
    catch (err) {
        if (err.message === 'Expected viewBox to be set') {
            const width = Number(source.width);
            const height = Number(source.height);
            return { width, height };
        }
        throw err;
    }
};
exports.svgToCanvas = async (source) => image_source_1.imageSourceToCanvas(await exports.svgToHtmlImage(source));
exports.sizeFromSvgViewBox = async (source) => {
    const viewBox = source.getAttribute('viewBox');
    const error = Error('Expected viewBox to be set');
    if (viewBox === null || viewBox.trim() === '')
        throw error;
    const segs = viewBox.split(' ');
    const values = (segs.map(s => s.trim()).filter(s => s !== '').map(s => Number(s)));
    const [, , width, height] = values;
    if (typeof width === 'number' && !isNaN(width) &&
        typeof height === 'number' && !isNaN(height)) {
        const size = { width, height };
        return size;
    }
    throw error;
};
exports.svgDataUrlToSvg = (source) => {
    source = source.slice(consts_1.svgDataUrlHeader.length);
    const xml = atob(source);
    const el = h_1.div();
    el.innerHTML = xml;
    const svgEl = util_1.strictSelect('svg', el);
    svgEl.remove();
    return svgEl;
};

},{"../../dom/consts":37,"../../dom/h":38,"../../dom/s":40,"../../dom/util":41,"./html-image":46,"./image-source":48,"./settings":50}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distance = exports.normalizeLine = exports.createLine = exports.lineToVector = void 0;
exports.lineToVector = ({ x1, y1, x2, y2 }) => ({
    x: x2 - x1,
    y: y2 - y1
});
exports.createLine = ({ x: x1, y: y1 }, { x: x2, y: y2 }) => ({
    x1, y1, x2, y2
});
exports.normalizeLine = ({ x1: startX, y1: startY, x2: endX, y2: endY }) => {
    const x1 = Math.min(startX, endX);
    const x2 = Math.max(startX, endX);
    const y1 = Math.min(startY, endY);
    const y2 = Math.max(startY, endY);
    return { x1, y1, x2, y2 };
};
exports.distance = (line) => {
    const { x, y } = exports.lineToVector(line);
    return Math.sqrt(x * x + y * y);
};

},{}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gcd = exports.toBase26 = exports.fromBase26 = exports.createNumericIndex = exports.snapToGrid = void 0;
exports.snapToGrid = (value, grid) => Math.floor(value / grid) * grid;
exports.createNumericIndex = (start = 0) => {
    const ids = new Map();
    const getNext = (name) => {
        let index = ids.get(name);
        if (index === undefined) {
            index = start;
        }
        ids.set(name, index + 1);
        return index;
    };
    return getNext;
};
exports.fromBase26 = (value) => {
    if (!/^[a-z]+$/.test(value)) {
        throw Error('Expected non-empty string comprised of a-z');
    }
    const letters = value.split('');
    let out = 0;
    for (let i = 0; i < letters.length; i++) {
        out += (letters[letters.length - 1 - i].charCodeAt(0) - 96) * Math.pow(26, i);
    }
    return out;
};
exports.toBase26 = (number) => {
    if (number <= 0) {
        throw Error('Expected > 0');
    }
    let out = '';
    while (true) {
        out = String.fromCharCode(((number - 1) % 26) + 97) + out;
        number = Math.floor((number - 1) / 26);
        if (number === 0) {
            break;
        }
    }
    return out;
};
exports.gcd = (a, b) => {
    let temp;
    while (b !== 0) {
        temp = a % b;
        a = b;
        b = temp;
    }
    return a;
};

},{}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tupleToPoint = exports.deltaPoint = exports.snapPointToGrid = exports.scalePoint = exports.translatePoint = void 0;
const number_1 = require("./number");
exports.translatePoint = ({ x: x1, y: y1 }, { x: x2, y: y2 }) => ({
    x: x1 + x2,
    y: y1 + y2
});
exports.scalePoint = ({ x, y }, scale) => ({
    x: x * scale,
    y: y * scale
});
exports.snapPointToGrid = ({ x, y }, { width: gridW, height: gridH }) => {
    x = number_1.snapToGrid(x, gridW);
    y = number_1.snapToGrid(y, gridH);
    return { x, y };
};
exports.deltaPoint = ({ x: x1, y: y1 }, { x: x2, y: y2 }) => ({
    x: x1 - x2,
    y: y1 - y2
});
exports.tupleToPoint = ([x, y]) => ({ x, y });

},{"./number":53}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flipRectInBounds = exports.scaleRectFromBounds = exports.scaleRectFrom = exports.scaleSidesRect = exports.growSidesRectByDelta = exports.translateRect = exports.sidesRectToRect = exports.rectToSidesRect = exports.growRect = exports.stringRectToRect = exports.rectToStringRect = exports.scaleRect = exports.rectIntersection = exports.getBoundingRect = exports.expandRect = exports.contractRect = exports.rectContainsPoint = void 0;
const util_1 = require("../util");
const point_1 = require("./point");
exports.rectContainsPoint = (rect, point) => {
    if (point.x < rect.x)
        return false;
    if (point.y < rect.y)
        return false;
    if (point.x > (rect.x + rect.width))
        return false;
    if (point.y > (rect.y + rect.height))
        return false;
    return true;
};
exports.contractRect = ({ x, y, width, height }, amount = 1) => {
    x += amount;
    y += amount;
    width -= amount * 2;
    height -= amount * 2;
    return { x, y, width, height };
};
exports.expandRect = ({ x, y, width, height }, amount = 1) => {
    x -= amount;
    y -= amount;
    width += amount * 2;
    height += amount * 2;
    return { x, y, width, height };
};
exports.getBoundingRect = (rects) => {
    if (rects.length === 0)
        return;
    const [first, ...rest] = rects;
    let { x: left, y: top } = first;
    let right = left + first.width;
    let bottom = top + first.height;
    rest.forEach(rect => {
        const { x: rx, y: ry, width: rw, height: rh } = rect;
        const rr = rx + rw;
        const rb = ry + rh;
        if (rx < left)
            left = rx;
        if (ry < top)
            top = ry;
        if (rr > right)
            right = rr;
        if (rb > bottom)
            bottom = rb;
    });
    const x = left;
    const y = top;
    const width = right - left;
    const height = bottom - top;
    return { x, y, width, height };
};
exports.rectIntersection = (a, b) => {
    const x = Math.max(a.x, b.x);
    const y = Math.max(a.y, b.y);
    const right = Math.min(a.x + a.width, b.x + b.width);
    const bottom = Math.min(a.y + a.height, b.y + b.height);
    if (right >= x && bottom >= y) {
        const width = right - x;
        const height = bottom - y;
        return { x, y, width, height };
    }
};
exports.scaleRect = ({ x, y, width, height }, { x: sx, y: sy }) => {
    x *= sx;
    y *= sy;
    width *= sx;
    height *= sy;
    const scaled = { x, y, width, height };
    return scaled;
};
exports.rectToStringRect = ({ x, y, width, height }) => ({
    x: String(x),
    y: String(y),
    width: String(width),
    height: String(height)
});
exports.stringRectToRect = ({ x, y, width, height }) => ({
    x: Number(x),
    y: Number(y),
    width: Number(width),
    height: Number(height)
});
exports.growRect = (rect, ...args) => {
    let { x, y, width, height } = rect;
    if (args.length === 0)
        return { x, y, width, height };
    if (args.length === 1) {
        x -= args[0];
        y -= args[0];
        width += args[0] * 2;
        height += args[0] * 2;
        return { x, y, width, height };
    }
    if (args.length === 2) {
        x -= args[1];
        y -= args[0];
        width += args[1] * 2;
        height += args[0] * 2;
        return { x, y, width, height };
    }
    if (args.length === 3) {
        x -= args[1];
        y -= args[0];
        width += args[1] * 2;
        height += args[0] + args[2];
        return { x, y, width, height };
    }
    x -= args[3];
    y -= args[0];
    width += args[3] + args[1];
    height += args[0] + args[2];
    return { x, y, width, height };
};
exports.rectToSidesRect = ({ x, y, width, height }) => {
    const left = x;
    const top = y;
    const right = x + width;
    const bottom = y + height;
    return { top, right, bottom, left };
};
exports.sidesRectToRect = ({ top, right, bottom, left }) => {
    const x = left;
    const y = top;
    const width = right - left;
    const height = bottom - top;
    return { x, y, width, height };
};
exports.translateRect = (rect, delta) => {
    const p = point_1.translatePoint(rect, delta);
    return Object.assign({}, rect, p);
};
exports.growSidesRectByDelta = (sidesRect, delta, origin) => {
    const [oX, oY] = origin;
    let { top, right, bottom, left } = sidesRect;
    if (oY === 'top')
        top += delta.y;
    if (oX === 'right')
        right += delta.x;
    if (oY === 'bottom')
        bottom += delta.y;
    if (oX === 'left')
        left += delta.x;
    const grownRect = { top, right, bottom, left };
    return grownRect;
};
exports.scaleSidesRect = (sidesRect, scale) => {
    let { top, right, bottom, left } = sidesRect;
    top *= scale.y;
    right *= scale.x;
    bottom *= scale.y;
    left *= scale.x;
    const scaledRect = { top, right, bottom, left };
    return scaledRect;
};
// TODO - this is a weird way to do it, research better implementation
// 
exports.scaleRectFrom = (bounds, appRect, delta, origin) => {
    const sidesRect = exports.rectToSidesRect(bounds);
    const grown = exports.growSidesRectByDelta(sidesRect, delta, origin);
    const newBoundsRect = exports.sidesRectToRect(grown);
    let flipX = false;
    let flipY = false;
    if (newBoundsRect.width < 0) {
        flipX = true;
        newBoundsRect.x += newBoundsRect.width * 2;
        newBoundsRect.width *= -1;
    }
    if (newBoundsRect.height < 0) {
        flipY = true;
        newBoundsRect.y += newBoundsRect.height * 2;
        newBoundsRect.height *= -1;
    }
    if (newBoundsRect.width === 0 || newBoundsRect.height === 0)
        return;
    appRect = exports.scaleRectFromBounds(appRect, bounds, newBoundsRect);
    appRect = exports.flipRectInBounds(appRect, newBoundsRect, flipX, flipY);
    return appRect;
};
exports.scaleRectFromBounds = (rect, fromBounds, toBounds) => {
    rect = util_1.clone(rect);
    const x = toBounds.width / fromBounds.width;
    const y = toBounds.height / fromBounds.height;
    const scale = { x, y };
    const negativeTranslate = point_1.scalePoint(fromBounds, -1);
    const delta = point_1.deltaPoint(toBounds, fromBounds);
    Object.assign(rect, exports.translateRect(rect, negativeTranslate));
    Object.assign(rect, exports.scaleRect(rect, scale));
    Object.assign(rect, exports.translateRect(rect, fromBounds));
    Object.assign(rect, exports.translateRect(rect, delta));
    return rect;
};
exports.flipRectInBounds = (rect, bounds, flipX, flipY) => {
    rect = util_1.clone(rect);
    const negativeTranslate = point_1.scalePoint(bounds, -1);
    Object.assign(rect, exports.translateRect(rect, negativeTranslate));
    let { x, y, width, height } = rect;
    if (flipX) {
        x = bounds.width - x - width;
    }
    if (flipY) {
        y = bounds.height - y - height;
    }
    Object.assign(rect, { x, y, width, height });
    Object.assign(rect, exports.translateRect(rect, bounds));
    return rect;
};

},{"../util":58,"./point":54}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zoomAt = exports.translateAndScalePoint = exports.transformRelativeTo = void 0;
const point_1 = require("./point");
exports.transformRelativeTo = (existing, newScale, origin) => {
    const { scale } = existing;
    let newPoint = point_1.translatePoint(existing, point_1.scalePoint(origin, -1));
    newPoint = point_1.scalePoint(newPoint, newScale / scale);
    newPoint = point_1.translatePoint(newPoint, origin);
    const transformed = Object.assign(newPoint, { scale: newScale });
    return transformed;
};
exports.translateAndScalePoint = ({ x, y }, { x: tx, y: ty, scale }) => {
    x -= tx;
    y -= ty;
    x /= scale;
    y /= scale;
    return { x, y };
};
exports.zoomAt = (existingTransform, { scale, x, y }, minScale) => {
    if (scale < minScale)
        scale = minScale;
    const newTransform = exports.transformRelativeTo(existingTransform, scale, { x, y });
    return Object.assign({}, existingTransform, newTransform);
};

},{"./point":54}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zoomToFit = void 0;
const object_fit_math_1 = require("object-fit-math");
exports.zoomToFit = (parent, child) => {
    const { x: fx, y: fy, width: fw } = object_fit_math_1.fitAndPosition(parent, child, 'contain', '50%', '50%');
    const scale = fw / child.width;
    const x = fx / scale;
    const y = fy / scale;
    const transform = { x, y, scale };
    return transform;
};

},{"object-fit-math":60}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeys = exports.id = exports.noop = exports.clone = exports.assertUnique = exports.strictMapGet = exports.shuffle = exports.createSequence = exports.randomInt = exports.randomChar = exports.randomId = void 0;
exports.randomId = () => exports.createSequence(16, exports.randomChar).join('');
exports.randomChar = () => String.fromCharCode(exports.randomInt(26) + 97);
exports.randomInt = (exclMax) => Math.floor(Math.random() * exclMax);
exports.createSequence = (length, cb) => Array.from({ length }, (_v, index) => cb(index));
exports.shuffle = (values) => {
    values = values.slice();
    let currentIndex = values.length;
    let temporaryValue;
    let randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = values[currentIndex];
        values[currentIndex] = values[randomIndex];
        values[randomIndex] = temporaryValue;
    }
    return values;
};
exports.strictMapGet = (map, key) => {
    const existing = map.get(key);
    if (existing === undefined)
        throw Error(`Expected key ${key}`);
    return existing;
};
exports.assertUnique = (map, key) => {
    if (map.has(key))
        throw Error(`Duplicate key ${key}`);
};
exports.clone = (value) => JSON.parse(JSON.stringify(value));
exports.noop = () => { };
exports.id = (value) => value;
exports.getKeys = (obj) => Object.keys(obj);

},{}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fit = (parent, child, fitMode = 'fill') => {
    if (fitMode === 'scale-down') {
        if (child.width <= parent.width && child.height <= parent.height) {
            fitMode = 'none';
        }
        else {
            fitMode = 'contain';
        }
    }
    if (fitMode === 'cover' || fitMode === 'contain') {
        const wr = parent.width / child.width;
        const hr = parent.height / child.height;
        const ratio = fitMode === 'cover' ? Math.max(wr, hr) : Math.min(wr, hr);
        const width = child.width * ratio;
        const height = child.height * ratio;
        const size = { width, height };
        return size;
    }
    if (fitMode === 'none')
        return child;
    // default case, fitMode === 'fill'
    return parent;
};
exports.position = (parent, child, left = '50%', top = '50%') => {
    const x = lengthToPixels(left, parent.width, child.width);
    const y = lengthToPixels(top, parent.height, child.height);
    const point = { x, y };
    return point;
};
exports.fitAndPosition = (parent, child, fitMode = 'fill', left = '50%', top = '50%') => {
    const fitted = exports.fit(parent, child, fitMode);
    const { x, y } = exports.position(parent, fitted, left, top);
    const { width, height } = fitted;
    const rect = { x, y, width, height };
    return rect;
};
const lengthToPixels = (length, parent, child) => length.endsWith('%') ?
    (parent - child) * (parseFloat(length) / 100) :
    parseFloat(length);

},{}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fitter_1 = require("./fitter");
exports.fit = fitter_1.fit;
exports.position = fitter_1.position;
exports.fitAndPosition = fitter_1.fitAndPosition;
var transform_fitted_point_1 = require("./transform-fitted-point");
exports.transformFittedPoint = transform_fitted_point_1.transformFittedPoint;
var predicates_1 = require("./predicates");
exports.isFit = predicates_1.isFit;

},{"./fitter":59,"./predicates":61,"./transform-fitted-point":62}],61:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fitModes = {
    contain: true,
    cover: true,
    fill: true,
    none: true,
    'scale-down': true
};
exports.isFit = (value) => value in fitModes;

},{}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fitter_1 = require("./fitter");
exports.transformFittedPoint = (fittedPoint, parent, child, fitMode = 'fill', left = '50%', top = '50%') => {
    const { x: positionedX, y: positionedY, width: fittedWidth, height: fittedHeight } = fitter_1.fitAndPosition(parent, child, fitMode, left, top);
    const wRatio = child.width / fittedWidth;
    const hRatio = child.height / fittedHeight;
    const x = (fittedPoint.x - positionedX) * wRatio;
    const y = (fittedPoint.y - positionedY) * hRatio;
    const childPoint = { x, y };
    return childPoint;
};

},{"./fitter":59}],63:[function(require,module,exports){
/**
 * Expose `pathToRegexp`.
 */
module.exports = pathToRegexp
module.exports.match = match
module.exports.regexpToFunction = regexpToFunction
module.exports.parse = parse
module.exports.compile = compile
module.exports.tokensToFunction = tokensToFunction
module.exports.tokensToRegExp = tokensToRegExp

/**
 * Default configs.
 */
var DEFAULT_DELIMITER = '/'

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // ":test(\\d+)?" => ["test", "\d+", undefined, "?"]
  // "(\\d+)"  => [undefined, undefined, "\d+", undefined]
  '(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?'
].join('|'), 'g')

/**
 * Parse a string for the raw tokens.
 *
 * @param  {string}  str
 * @param  {Object=} options
 * @return {!Array}
 */
function parse (str, options) {
  var tokens = []
  var key = 0
  var index = 0
  var path = ''
  var defaultDelimiter = (options && options.delimiter) || DEFAULT_DELIMITER
  var whitelist = (options && options.whitelist) || undefined
  var pathEscaped = false
  var res

  while ((res = PATH_REGEXP.exec(str)) !== null) {
    var m = res[0]
    var escaped = res[1]
    var offset = res.index
    path += str.slice(index, offset)
    index = offset + m.length

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1]
      pathEscaped = true
      continue
    }

    var prev = ''
    var name = res[2]
    var capture = res[3]
    var group = res[4]
    var modifier = res[5]

    if (!pathEscaped && path.length) {
      var k = path.length - 1
      var c = path[k]
      var matches = whitelist ? whitelist.indexOf(c) > -1 : true

      if (matches) {
        prev = c
        path = path.slice(0, k)
      }
    }

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path)
      path = ''
      pathEscaped = false
    }

    var repeat = modifier === '+' || modifier === '*'
    var optional = modifier === '?' || modifier === '*'
    var pattern = capture || group
    var delimiter = prev || defaultDelimiter

    tokens.push({
      name: name || key++,
      prefix: prev,
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      pattern: pattern
        ? escapeGroup(pattern)
        : '[^' + escapeString(delimiter === defaultDelimiter ? delimiter : (delimiter + defaultDelimiter)) + ']+?'
    })
  }

  // Push any remaining characters.
  if (path || index < str.length) {
    tokens.push(path + str.substr(index))
  }

  return tokens
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {string}             str
 * @param  {Object=}            options
 * @return {!function(Object=, Object=)}
 */
function compile (str, options) {
  return tokensToFunction(parse(str, options), options)
}

/**
 * Create path match function from `path-to-regexp` spec.
 */
function match (str, options) {
  var keys = []
  var re = pathToRegexp(str, keys, options)
  return regexpToFunction(re, keys)
}

/**
 * Create a path match function from `path-to-regexp` output.
 */
function regexpToFunction (re, keys) {
  return function (pathname, options) {
    var m = re.exec(pathname)
    if (!m) return false

    var path = m[0]
    var index = m.index
    var params = {}
    var decode = (options && options.decode) || decodeURIComponent

    for (var i = 1; i < m.length; i++) {
      if (m[i] === undefined) continue

      var key = keys[i - 1]

      if (key.repeat) {
        params[key.name] = m[i].split(key.delimiter).map(function (value) {
          return decode(value, key)
        })
      } else {
        params[key.name] = decode(m[i], key)
      }
    }

    return { path: path, index: index, params: params }
  }
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens, options) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length)

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$', flags(options))
    }
  }

  return function (data, options) {
    var path = ''
    var encode = (options && options.encode) || encodeURIComponent
    var validate = options ? options.validate !== false : true

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i]

      if (typeof token === 'string') {
        path += token
        continue
      }

      var value = data ? data[token.name] : undefined
      var segment

      if (Array.isArray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but got array')
        }

        if (value.length === 0) {
          if (token.optional) continue

          throw new TypeError('Expected "' + token.name + '" to not be empty')
        }

        for (var j = 0; j < value.length; j++) {
          segment = encode(value[j], token)

          if (validate && !matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '"')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment
        }

        continue
      }

      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        segment = encode(String(value), token)

        if (validate && !matches[i].test(segment)) {
          throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but got "' + segment + '"')
        }

        path += token.prefix + segment
        continue
      }

      if (token.optional) continue

      throw new TypeError('Expected "' + token.name + '" to be ' + (token.repeat ? 'an array' : 'a string'))
    }

    return path
  }
}

/**
 * Escape a regular expression string.
 *
 * @param  {string} str
 * @return {string}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {string} group
 * @return {string}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$/()])/g, '\\$1')
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {string}
 */
function flags (options) {
  return options && options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {!RegExp} path
 * @param  {Array=}  keys
 * @return {!RegExp}
 */
function regexpToRegexp (path, keys) {
  if (!keys) return path

  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g)

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        pattern: null
      })
    }
  }

  return path
}

/**
 * Transform an array into a regexp.
 *
 * @param  {!Array}  path
 * @param  {Array=}  keys
 * @param  {Object=} options
 * @return {!RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = []

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source)
  }

  return new RegExp('(?:' + parts.join('|') + ')', flags(options))
}

/**
 * Create a path regexp from string input.
 *
 * @param  {string}  path
 * @param  {Array=}  keys
 * @param  {Object=} options
 * @return {!RegExp}
 */
function stringToRegexp (path, keys, options) {
  return tokensToRegExp(parse(path, options), keys, options)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {!Array}  tokens
 * @param  {Array=}  keys
 * @param  {Object=} options
 * @return {!RegExp}
 */
function tokensToRegExp (tokens, keys, options) {
  options = options || {}

  var strict = options.strict
  var start = options.start !== false
  var end = options.end !== false
  var delimiter = options.delimiter || DEFAULT_DELIMITER
  var endsWith = [].concat(options.endsWith || []).map(escapeString).concat('$').join('|')
  var route = start ? '^' : ''

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]

    if (typeof token === 'string') {
      route += escapeString(token)
    } else {
      var capture = token.repeat
        ? '(?:' + token.pattern + ')(?:' + escapeString(token.delimiter) + '(?:' + token.pattern + '))*'
        : token.pattern

      if (keys) keys.push(token)

      if (token.optional) {
        if (!token.prefix) {
          route += '(' + capture + ')?'
        } else {
          route += '(?:' + escapeString(token.prefix) + '(' + capture + '))?'
        }
      } else {
        route += escapeString(token.prefix) + '(' + capture + ')'
      }
    }
  }

  if (end) {
    if (!strict) route += '(?:' + escapeString(delimiter) + ')?'

    route += endsWith === '$' ? '$' : '(?=' + endsWith + ')'
  } else {
    var endToken = tokens[tokens.length - 1]
    var isEndDelimited = typeof endToken === 'string'
      ? endToken[endToken.length - 1] === delimiter
      : endToken === undefined

    if (!strict) route += '(?:' + escapeString(delimiter) + '(?=' + endsWith + '))?'
    if (!isEndDelimited) route += '(?=' + escapeString(delimiter) + '|' + endsWith + ')'
  }

  return new RegExp(route, flags(options))
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(string|RegExp|Array)} path
 * @param  {Array=}                keys
 * @param  {Object=}               options
 * @return {!RegExp}
 */
function pathToRegexp (path, keys, options) {
  if (path instanceof RegExp) {
    return regexpToRegexp(path, keys)
  }

  if (Array.isArray(path)) {
    return arrayToRegexp(/** @type {!Array} */ (path), keys, options)
  }

  return stringToRegexp(/** @type {string} */ (path), keys, options)
}

},{}]},{},[2]);
