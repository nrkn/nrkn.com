(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const const_1 = require("./const");
const bmp_to_bmp_1 = require("./lib/bmp/blit/bmp-to-bmp");
const bmp_to_rgba_1 = require("./lib/bmp/blit/bmp-to-rgba");
const rgba_to_bmp_threshold_1 = require("./lib/bmp/blit/rgba-to-bmp-threshold");
const create_bmp_1 = require("./lib/bmp/create-bmp");
const loadImage = (src) => new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.crossOrigin = 'anonymous';
    image.src = src;
});
const loadBmp = async (src) => {
    const image = await loadImage(src);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);
    const rgba = context.getImageData(0, 0, image.width, image.height);
    const bmp = create_bmp_1.createBmp(image.width, image.height);
    rgba_to_bmp_threshold_1.rgbaToBmpThreshold(rgba, bmp);
    return bmp;
};
const viewBmp = create_bmp_1.createBmp(const_1.viewSize.width, const_1.viewSize.height);
const createRectTuple = ({ x, y, width, height }) => [x, y, width, height];
const rects = {
    input: [
        createRectTuple({ x: 64, y: 16, width: 16, height: 16 })
    ],
    output: [
        createRectTuple({ x: 80, y: 16, width: 16, height: 16 })
    ],
    demon: [
        createRectTuple({ x: 0, y: 0, width: 16, height: 16 })
    ],
    explodeIn: [
        createRectTuple({ x: 48, y: 0, width: 16, height: 16 }),
        createRectTuple({ x: 32, y: 0, width: 16, height: 16 }),
        createRectTuple({ x: 16, y: 0, width: 16, height: 16 })
    ],
    explodeOut: [
        createRectTuple({ x: 16, y: 0, width: 16, height: 16 }),
        createRectTuple({ x: 32, y: 0, width: 16, height: 16 }),
        createRectTuple({ x: 48, y: 0, width: 16, height: 16 })
    ],
    tile: [
        createRectTuple({ x: 16, y: 16, width: 16, height: 16 })
    ],
    wall: [
        createRectTuple({ x: 64, y: 48, width: 16, height: 32 })
    ]
};
const KEY = 0;
const X = 1;
const Y = 2;
const FRAME = 3;
const map = [];
const sprites = [];
const start = async () => {
    // set shit up
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = const_1.viewSize.width;
    canvas.height = const_1.viewSize.height;
    const sheet = await loadBmp('data/sheet.png');
    const font = await loadBmp('data/font.png');
    const cx = Math.floor((const_1.viewSize.width - 16) / 2);
    const cy = Math.floor((const_1.viewSize.height - 16) / 2);
    const enterX = 0;
    const exitX = const_1.viewSize.width - 16;
    const gameBeat = 66; // 15fps ish
    // add one sprite for now
    const demonSprite = ['demon', cx, cy, 0];
    sprites.push(demonSprite);
    // add some tiles
    const cols = Math.floor(const_1.viewSize.width / 16);
    for (let i = 0; i < cols; i++) {
        map.push(['wall', i * 16, cy - 32], ['tile', i * 16, cy], ['wall', i * 16, cy + 16]);
    }
    map.push(['input', 0, cy], ['output', const_1.viewSize.width - 16, cy]);
    // looks useful, move somewhere else
    const blit = (key, dx, dy, frame = 0) => bmp_to_bmp_1.blitBmpToBmp(sheet, viewBmp, ...rects[key][frame], dx, dy);
    // state for bmpTick
    let start = 0;
    let flyingDir = -1;
    let flyY = 0;
    const bmpTick = (time) => {
        if (start === 0)
            start = time;
        const elapsed = time - start;
        // we should use the time to scale x, y, frame etc but until we do that,
        // this is a lazy hack because I am a lazy hack
        if (elapsed >= gameBeat) {
            start = time;
            sprites.forEach(sprite => {
                const rect = rects[sprite[KEY]];
                // for now let's just use a bad hand rolled state machine 
                // todo - look at tool david uses for animation, see what it does
                sprite[FRAME]++;
                if (sprite[FRAME] >= rect.length) {
                    sprite[FRAME] = 0;
                    if (sprite[KEY] === 'explodeIn') {
                        sprite[KEY] = 'demon';
                    }
                    if (sprite[KEY] === 'explodeOut') {
                        sprite[KEY] = 'explodeIn';
                        sprite[X] = enterX;
                    }
                }
                if (sprite[KEY] === 'demon') {
                    if (sprite[X] < exitX) {
                        sprite[X] += 4;
                    }
                    if (flyingDir === -1) {
                        flyY--;
                        if (flyY < -2) {
                            flyingDir = 1;
                        }
                    }
                    else {
                        flyY++;
                        if (flyY > 1) {
                            flyingDir = -1;
                            flyY--;
                        }
                    }
                    sprite[Y] = cy + flyY;
                    if (sprite[X] >= exitX) {
                        sprite[KEY] = 'explodeOut';
                    }
                }
            });
        }
        viewBmp.data.fill(0);
        viewBmp.mask.fill(1);
        map.forEach(tile => blit(...tile));
        sprites.forEach(tile => blit(...tile));
    };
    const tick = (time) => {
        bmpTick(time);
        const viewRgba = new ImageData(const_1.viewSize.width, const_1.viewSize.height);
        bmp_to_rgba_1.blitBmpToRgba(viewBmp, viewRgba, 0xffeeeeee, 0xff111111);
        context.putImageData(viewRgba, 0, 0);
        requestAnimationFrame(tick);
    };
    document.body.append(canvas);
    requestAnimationFrame(tick);
};
start().catch(err => { console.error(err); alert(err.message || 'Error'); });

},{"./const":2,"./lib/bmp/blit/bmp-to-bmp":5,"./lib/bmp/blit/bmp-to-rgba":6,"./lib/bmp/blit/rgba-to-bmp-threshold":7,"./lib/bmp/create-bmp":8}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewSize = exports.buildString = exports.build = void 0;
exports.build = [0, 0, 1];
const buildString = () => `v${exports.build.join('.')}`;
exports.buildString = buildString;
exports.viewSize = Object.freeze({ width: 128, height: 128 });

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSequence = void 0;
const createSequence = (length, cb) => Array.from({ length }, (_v, k) => cb(k));
exports.createSequence = createSequence;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertLength = exports.assertPositiveNonZero = void 0;
const assertPositiveNonZero = (value, title) => {
    if (value <= 0)
        throw Error(`Expected positive non-zero ${title || 'value'}`);
};
exports.assertPositiveNonZero = assertPositiveNonZero;
const assertLength = (value, length, title) => {
    if (value.length !== length)
        throw Error(`Expected ${title || 'array'} length to be ${length}`);
};
exports.assertLength = assertLength;

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blitBmpToBmp = void 0;
const blitBmpToBmp = (source, dest, sx = 0, sy = 0, sw = source.width - sx, sh = source.height - sy, dx = 0, dy = 0) => {
    // coerce args to int
    sx |= 0;
    sy |= 0;
    sw |= 0;
    sh |= 0;
    dx |= 0;
    dy |= 0;
    // nothing to do
    if (sw <= 0 || sh <= 0)
        return;
    for (let y = 0; y < sh; y++) {
        const sourceY = sy + y;
        // source pixel is out of bounds
        if (sourceY < 0 || sourceY >= source.height)
            continue;
        const destY = dy + y;
        // dest pixel is out of bounds
        if (destY < 0 || destY >= dest.height)
            continue;
        for (let x = 0; x < sw; x++) {
            const sourceX = sx + x;
            // source pixel is out of bounds
            if (sourceX < 0 || sourceX >= source.width)
                continue;
            const destX = dx + x;
            // dest pixel is out of bounds
            if (destX < 0 || destX >= dest.width)
                continue;
            // in bounds - nice
            const sourceIndex = sourceY * source.width + sourceX;
            const destIndex = destY * dest.width + destX;
            if (source.mask && !source.mask[sourceIndex])
                continue;
            dest.data[destIndex] = source.data[sourceIndex];
            dest.mask[destIndex] = 1;
        }
    }
};
exports.blitBmpToBmp = blitBmpToBmp;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blitBmpToRgba = void 0;
const blitBmpToRgba = (source, dest, on = 0xffffffff, off = 0xff000000, sx = 0, sy = 0, sw = source.width - sx, sh = source.height - sy, dx = 0, dy = 0) => {
    // coerce args to int
    on |= 0;
    off |= 0;
    sx |= 0;
    sy |= 0;
    sw |= 0;
    sh |= 0;
    dx |= 0;
    dy |= 0;
    // nothing to do
    if (sw <= 0 || sh <= 0)
        return;
    // faster to set all 4 bytes of a color at once if you can
    const destDataWordView = new Uint32Array(dest.data.buffer);
    for (let y = 0; y < sh; y++) {
        const sourceY = sy + y;
        // source pixel is out of bounds
        if (sourceY < 0 || sourceY >= source.height)
            continue;
        const destY = dy + y;
        // dest pixel is out of bounds
        if (destY < 0 || destY >= dest.height)
            continue;
        for (let x = 0; x < sw; x++) {
            const sourceX = sx + x;
            // source pixel is out of bounds
            if (sourceX < 0 || sourceX >= source.width)
                continue;
            const destX = dx + x;
            // dest pixel is out of bounds
            if (destX < 0 || destX >= dest.width)
                continue;
            // in bounds - nice
            const sourceIndex = sourceY * source.width + sourceX;
            const destIndex = destY * dest.width + destX;
            if (!source.mask[sourceIndex])
                continue;
            destDataWordView[destIndex] = source.data[sourceIndex] ? on : off;
        }
    }
};
exports.blitBmpToRgba = blitBmpToRgba;

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rgbaToBmpThreshold = void 0;
const maxBright = 255 * 3;
const rgbaToBmpThreshold = (source, dest, threshold = 0.5, sx = 0, sy = 0, sw = source.width - sx, sh = source.height - sy, dx = 0, dy = 0) => {
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
            const sourceDataIndex = sourceIndex * 4;
            const r = source.data[sourceDataIndex];
            const g = source.data[sourceDataIndex + 1];
            const b = source.data[sourceDataIndex + 2];
            const a = source.data[sourceDataIndex + 3];
            const bit = ((r + g + b) / maxBright) < threshold ? 0 : 1;
            const mask = a < (255 * threshold) ? 0 : 1;
            const destIndex = destY * dest.width + destX;
            dest.data[destIndex] = bit;
            dest.mask[destIndex] = mask;
        }
    }
};
exports.rgbaToBmpThreshold = rgbaToBmpThreshold;

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBmp = void 0;
const array_1 = require("../array");
const assert_1 = require("../assert");
const createBmp = (width, height, data, mask) => {
    /*
      can't trust input in javascript lol
  
      bitmasking with 0 ensures int regardless of input type
  
      nonsense input (string, null, NaN etc) just becomes 0
    */
    width |= 0;
    height |= 0;
    // width and height should both be >= 1
    assert_1.assertPositiveNonZero(width, 'width');
    assert_1.assertPositiveNonZero(height, 'height');
    const length = width * height;
    if (data === undefined) {
        data = array_1.createSequence(length, () => 0);
    }
    else {
        // again, can't trust input in javascript 
        assert_1.assertLength(data, length, 'data');
    }
    if (mask === undefined) {
        mask = array_1.createSequence(length, () => 1);
    }
    else {
        assert_1.assertLength(mask, length, 'mask');
    }
    const bmp = { width, height, data, mask };
    return Object.freeze(bmp);
};
exports.createBmp = createBmp;

},{"../array":3,"../assert":4}]},{},[1]);
