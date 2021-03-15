(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFrame = (first, timestamp) => {
    if (!first.next)
        return first;
    const length = getLength(first);
    const time = timestamp % length;
    let current = first;
    let currentTime = 0;
    while (current) {
        currentTime += current.duration;
        if (currentTime >= time) {
            return current;
        }
        current = current.next;
    }
    return first;
};
const getLength = (first) => {
    let length = 0;
    let current = first;
    while (current) {
        length += first.duration;
        current = current.next;
    }
    return length;
};

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
exports.bitmap = (width, height) => {
    const size = width * height;
    const data = new Array(size).fill(0);
    return { width, height, data };
};
exports.isEmpty = (bmp) => bmp.data.every(c => c === types_1.Transparent);

},{"./types":3}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transparent = 0;
exports.Fore = 1;
exports.Back = 2;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const _1 = require(".");
exports.applyLights = (lights, size, cb) => {
    const { width, height } = size;
    for (let sy = 0; sy < height; sy++) {
        for (let sx = 0; sx < width; sx++) {
            let lightAmount = 0;
            lights.forEach(light => {
                const { x, y, radius, strength } = light;
                const distX = Math.abs(x - sx);
                const distY = Math.abs(y - sy);
                const dist = Math.hypot(distX, distY);
                const lightness = utils_1.clamp(radius - dist, 0, radius) / radius;
                lightAmount += (lightness * strength);
            });
            lightAmount = utils_1.clamp(lightAmount, 0, 1);
            cb({ x: sx, y: sy }, lightAmount);
        }
    }
};
exports.applyFrameLight = (frame, lightness) => {
    let { fore, back } = frame;
    fore = _1.multiply(fore, ..._1.gray(lightness));
    back = _1.multiply(back, ..._1.gray(lightness));
    Object.assign(frame, { fore, back });
};

},{".":7,"../utils":35}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.black = [0, 0, 0];
exports.nearWhite = [250, 250, 250];
exports.errorColor = [255, 0, 255];
exports.uiBackground = [48, 48, 96];
exports.uiMagic = [96, 48, 96];
exports.paper = [255, 247, 238];
exports.darkerPaper = [168, 152, 132];
exports.ink = [87, 74, 59];
exports.select = [191, 223, 255];
exports.selectAlt = [0, 0, 128];
exports.magicSelect = [255, 191, 255];
exports.metal = [96, 96, 96];
exports.darkerMetal = [48, 48, 48];
exports.darkerWood = [128, 64, 0];
exports.wood = [192, 96, 0];
exports.magic = [178, 0, 255];
exports.darkerMagic = [100, 0, 100];
exports.healWounds = [224, 48, 48];
exports.light = [255, 255, 0];
exports.darkerLight = [255, 192, 0];
exports.titleBlue = [0, 127, 255];
exports.darkerTitleBlue = [0, 51, 102];

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const random_1 = require("../random");
exports.randomSkin = () => {
    const n = random_1.randInt(256);
    const rD = 164 / 256;
    const gD = 200 / 256;
    const bD = 180 / 256;
    const r = Math.floor(rD * n) + 82;
    const g = Math.floor(gD * n) + 38;
    const b = Math.floor(bD * n) + 21;
    return [r, g, b];
};
exports.randomClothes = () => {
    const r = random_1.randInt(48);
    const b = random_1.randInt(72);
    const g = random_1.randInt(72);
    return [r, g, b];
};

},{"../random":22}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const random_1 = require("../random");
const utils_1 = require("../utils");
exports.clampRgb = ([r, g, b]) => [
    Math.floor(utils_1.clamp(r)),
    Math.floor(utils_1.clamp(g)),
    Math.floor(utils_1.clamp(b))
];
exports.multiply = (rgb, mr = 1, mg = 1, mb = 1) => {
    let [r, g, b] = rgb;
    r *= mr;
    g *= mg;
    b *= mb;
    return exports.clampRgb([r, g, b]);
};
exports.darken = (rgb, dr = 0, dg = 0, db = 0) => {
    let [r, g, b] = rgb;
    r -= dr;
    g -= dg;
    b -= db;
    return exports.clampRgb([r, g, b]);
};
exports.gray = (v) => [v, v, v];
exports.toGray = ([r, g, b]) => {
    const sum = r + g + b;
    r = sum / 3;
    g = sum / 3;
    b = sum / 3;
    return exports.clampRgb([r, g, b]);
};
exports.interpolateRgb = (from, to, amount = 0.5) => {
    const bAmount = 1 - amount;
    const [fr, fg, fb] = from;
    const [tr, tg, tb] = to;
    const r = fr * amount + tr * bAmount;
    const g = fg * amount + tg * bAmount;
    const b = fb * amount + tb * bAmount;
    return exports.clampRgb([r, g, b]);
};
exports.randomBright = (brightness) => {
    brightness = utils_1.clamp(brightness);
    brightness *= 3;
    let r = 0;
    let g = 0;
    let b = 0;
    for (let i = 0; i < brightness; i++) {
        const channel = random_1.randInt(3);
        if (channel === 0)
            r += 1;
        if (channel === 1)
            g += 1;
        if (channel === 2)
            b += 1;
    }
    return exports.clampRgb([r, g, b]);
};
exports.quantize = ([r, g, b], amount = 16) => {
    r = Math.floor(r / amount) * amount;
    g = Math.floor(g / amount) * amount;
    b = Math.floor(b / amount) * amount;
    return [r, g, b];
};

},{"../random":22,"../utils":35}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const size_1 = require("../geometry/size");
const rect_1 = require("../geometry/rect");
exports.spriteSize = { width: 8, height: 8 };
exports.fontSize = { width: 6, height: 6 };
exports.gameSize = { width: 16, height: 12 };
exports.viewportSize = { width: 11, height: 11 };
exports.viewportPosition = { x: 0, y: 1 };
exports.viewportRect = Object.assign({}, exports.viewportSize, exports.viewportPosition);
exports.viewportPixelSize = size_1.scaleSize(exports.viewportSize, exports.spriteSize);
exports.viewportPixelRect = rect_1.scaleRect(exports.viewportRect, exports.spriteSize);
exports.menuSize = { width: exports.gameSize.width, height: 3 };
exports.menuPosition = { x: 0, y: 0 };
exports.menuRect = Object.assign({}, exports.menuSize, exports.menuPosition);
exports.menuPixelSize = size_1.scaleSize(exports.menuSize, exports.spriteSize);
exports.menuPixelRect = rect_1.scaleRect(exports.menuRect, exports.spriteSize);
exports.sidebarSize = {
    width: exports.gameSize.width - exports.viewportSize.width,
    height: exports.gameSize.height - 1
};
exports.sidebarPosition = { x: exports.viewportSize.width, y: 1 };
exports.sidebarRect = Object.assign({}, exports.sidebarSize, exports.sidebarPosition);
exports.sidebarPixelSize = size_1.scaleSize(exports.sidebarSize, exports.spriteSize);
exports.sidebarPixelRect = rect_1.scaleRect(exports.sidebarRect, exports.spriteSize);
exports.canvasSize = {
    width: exports.spriteSize.width * exports.gameSize.width,
    height: exports.spriteSize.height * exports.gameSize.height
};
exports.canvasRect = Object.assign({ x: 0, y: 0 }, exports.canvasSize);
exports.viewportCenter = {
    x: Math.floor(exports.viewportSize.width / 2),
    y: Math.floor(exports.viewportSize.height / 2)
};
exports.quantization = 8;

},{"../geometry/rect":14,"../geometry/size":15}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const random_1 = require("../random");
const color_1 = require("../color");
const generators_1 = require("../color/generators");
exports.createPlayer = () => {
    const x = 50;
    const y = 50;
    const str = random_1.dice(16) + 3;
    const int = random_1.dice(16) + 3;
    const dex = random_1.dice(16) + 3;
    const con = random_1.dice(16) + 3;
    const stats = { str, int, dex, con };
    const hp = con * 10;
    const mp = int * 10;
    const skin = generators_1.randomSkin();
    const clothes = generators_1.randomClothes();
    const darkestSkin = color_1.multiply(skin, 0.33, 0.33, 0.33);
    const darkerSkin = color_1.multiply(skin, 0.66, 0.66, 0.66);
    const lighterSkin = color_1.multiply(skin, 1.5, 1.5, 1.5);
    const darkerClothes = color_1.multiply(clothes, 0.66, 0.66, 0.66);
    const lighterClothes = color_1.multiply(clothes, 1.5, 1.5, 1.5);
    const colors = {
        darkestSkin, darkerSkin, skin, lighterSkin,
        darkerClothes, clothes, lighterClothes
    };
    const light = {
        x: 0,
        y: 0,
        radius: 4,
        strength: 0.75
    };
    const player = {
        x, y, colors, stats, hp, mp, light
    };
    return player;
};

},{"../color":7,"../color/generators":6,"../random":22}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const line_1 = require("./line");
exports.fovLines = ({ width, height }, { x: cx, y: cy }) => {
    const lines = [];
    for (let x = 0; x < width; x++) {
        const toTop = line_1.line(cx, cy, x, 0);
        const toBottom = line_1.line(cx, cy, x, height - 1);
        lines.push(toTop, toBottom);
    }
    for (let y = 0; y < height; y++) {
        const toLeft = line_1.line(cx, cy, 0, y);
        const toRight = line_1.line(cx, cy, width - 1, y);
        lines.push(toLeft, toRight);
    }
    return lines;
};

},{"./line":11}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.line = (x0, y0, x1, y1) => {
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

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.noise = (length) => {
    const n = Array(length);
    for (let i = 0; i < length; i++) {
        n[i] = Math.random();
    }
    return n;
};
exports.resizeNoise = (n, length) => {
    const resized = Array(length);
    const step = n.length / length;
    for (let i = 0; i < length; i++) {
        resized[i] = exports.noiseAt(n, i * step);
    }
    return resized;
};
exports.interpolate = (a, b, amount = 0.5) => {
    const bD = 1 - amount;
    const value = a * amount + b * bD;
    return utils_1.clamp(value, 0, 1);
};
exports.noiseAt = (n, index) => {
    const lowerIndex = Math.floor(index) % n.length;
    const upperIndex = Math.ceil(index) % n.length;
    if (lowerIndex === upperIndex)
        return n[lowerIndex];
    let delta = Math.abs(Math.max(upperIndex, lowerIndex) - index % n.length);
    if (lowerIndex > upperIndex)
        delta = 1 - delta;
    return exports.interpolate(n[lowerIndex], n[upperIndex], delta);
};

},{"../utils":35}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pointKey = ({ x, y }) => `${x},${y}`;
exports.translate = ({ x: ax, y: ay }, { x: bx, y: by }) => ({ x: ax + bx, y: ay + by });
exports.scale = ({ x: ax, y: ay }, { x: bx, y: by }) => ({ x: ax * bx, y: ay * by });
exports.valueToPoint = (v) => ({ x: v, y: v });
exports.sizeToPoint = ({ width, height }) => ({ x: width, y: height });

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inRect = ({ x: rx, y: ry, width, height }, { x, y }) => {
    if (x < rx)
        return false;
    if (y < ry)
        return false;
    if (x >= rx + width)
        return false;
    if (y >= ry + height)
        return false;
    return true;
};
exports.sizeToRect = ({ width, height }) => {
    const x = 0;
    const y = 0;
    return { x, y, width, height };
};
exports.scaleRect = ({ x, y, width, height }, { width: sw, height: sh }) => {
    x *= sw;
    y *= sh;
    width *= sw;
    height *= sh;
    return { x, y, width, height };
};

},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scaleSize = (a, b) => {
    const width = a.width * b.width;
    const height = a.height * b.height;
    return { width, height };
};

},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.cloneGrid = (grid) => {
    const { width, height, data } = grid;
    const cloned = {
        width, height, data: data.map(utils_1.clone)
    };
    return cloned;
};
exports.gridGet = (grid, x, y) => {
    const index = y * grid.width + x;
    return grid.data[index];
};
exports.gridView = (grid, x, y, width, height, empty) => {
    const data = Array(width * height);
    for (let dy = 0; dy < height; dy++) {
        const sy = dy + y;
        for (let dx = 0; dx < width; dx++) {
            const sx = dx + x;
            const destIndex = dy * width + dx;
            if (!utils_1.inBounds(sx, sy, grid.width, grid.height)) {
                data[destIndex] = empty;
                continue;
            }
            const sourceIndex = sy * grid.width + sx;
            data[destIndex] = grid.data[sourceIndex];
        }
    }
    const view = {
        width, height, data
    };
    return view;
};
exports.eachCell = (grid, cb) => {
    for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
            cb(exports.gridGet(grid, x, y), x, y);
        }
    }
};

},{"../utils":35}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIcon = (label, sprite, fore, back, background, highlight) => {
    const duration = 0;
    const icon = {
        sprite, fore, back, duration, label, background, highlight
    };
    return icon;
};

},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const consts_1 = require("./consts");
const loader_1 = require("./sprites/loader");
const repository_1 = require("./scene/repository");
document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.querySelector('canvas');
    const context = canvas.getContext('2d');
    canvas.width = consts_1.canvasSize.width;
    canvas.height = consts_1.canvasSize.height;
    const title = await loader_1.readImageData('title.png');
    const sprites = await loader_1.loadSprites('sprites.png', consts_1.spriteSize);
    const font = await loader_1.loadFont('font.png', consts_1.fontSize);
    const onBrowserMessage = (...args) => {
        if (args[0] === 'toggleFullscreen') {
            toggleFullScreen(document);
            //firefox sometimes doesn't draw the bottom part after entering fullscreen
            document.body.style.height = '100%';
        }
    };
    const repository = repository_1.sceneRepository(sprites, font, { title }, onBrowserMessage);
    repository.activate('title');
    repository.show('title');
    const { input, tap, tick } = repository;
    const onTick = (timestamp = 0) => {
        tick(timestamp);
        context.putImageData(repository.imageData, 0, 0);
        requestAnimationFrame(onTick);
    };
    const keyboard = (e) => {
        if (e.key === 'ArrowUp') {
            input('up');
        }
        if (e.key === 'ArrowDown') {
            input('down');
        }
        if (e.key === 'ArrowLeft') {
            input('left');
        }
        if (e.key === 'ArrowRight') {
            input('right');
        }
        if (e.key === 'Enter') {
            input('confirm');
        }
        if (e.key === 'Escape') {
            input('cancel');
        }
    };
    const onTap = (eventPoint) => {
        const { x, y } = eventPoint;
        const pixelPoint = transformEventPoint(canvas, { x, y });
        const tx = Math.floor(pixelPoint.x / consts_1.spriteSize.width);
        const ty = Math.floor(pixelPoint.y / consts_1.spriteSize.height);
        tap(tx, ty);
    };
    const mouse = (e) => {
        const { offsetX: x, offsetY: y } = e;
        onTap({ x, y });
        e.preventDefault();
    };
    const touch = (e) => {
        const [touch] = e.touches;
        if (!touch)
            return;
        const { clientX: x, clientY: y } = touch;
        onTap({ x, y });
        e.preventDefault();
    };
    document.body.onkeydown = keyboard;
    canvas.onclick = mouse;
    canvas.ontouchend = touch;
    onTick();
});
// assumes canvas is `object-fit: contain` & `object-position: 50% 50%`
const transformEventPoint = (canvas, eventPoint) => {
    const { width: naturalWidth, height: naturalHeight } = canvas;
    const { width: clientWidth, height: clientHeight } = canvas.getBoundingClientRect();
    const clientRatio = clientWidth / clientHeight;
    const naturalRatio = naturalWidth / naturalHeight;
    let scaledWidth = 0;
    let scaledHeight = 0;
    if (naturalRatio > clientRatio) {
        scaledWidth = 1;
        scaledHeight = (naturalHeight / clientHeight) / (naturalWidth / clientWidth);
    }
    else {
        scaledWidth = (naturalWidth / clientWidth) / (naturalHeight / clientHeight);
        scaledHeight = 1;
    }
    const canvasSize = {
        width: clientWidth * scaledWidth,
        height: clientHeight * scaledHeight
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
const toggleFullScreen = (document) => {
    if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        }
        else {
            if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
            else {
                if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                }
            }
        }
    }
    else {
        const _element = document.documentElement;
        if (_element.requestFullscreen) {
            _element.requestFullscreen();
        }
        else {
            if (_element.mozRequestFullScreen) {
                _element.mozRequestFullScreen();
            }
            else {
                if (_element.webkitRequestFullscreen) {
                    _element.webkitRequestFullscreen(Element['ALLOW_KEYBOARD_INPUT']);
                }
            }
        }
    }
};

},{"./consts":8,"./scene/repository":28,"./sprites/loader":34}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const random_1 = require("../random");
const tiles_1 = require("./tiles");
const color_1 = require("../color");
const torch_1 = require("./torch");
const floorBase = 128;
const floorVariationRange = 4;
const floorVariationAmount = 4;
const floorFore = () => (random_1.dice(floorVariationRange) + 1) * -floorVariationAmount;
const floorBack = () => random_1.dice(floorVariationRange) * -floorVariationAmount;
const randomTile = () => random_1.pick([
    'wall1', 'floor0', 'floor1', 'floor2', 'floor3'
]);
exports.badMap = (width, height, playerStart) => {
    const tiles = tiles_1.tileGrid(width, height);
    const map = { tiles };
    const wallLight = color_1.randomBright(128);
    const wallDark = color_1.darken(wallLight, ...color_1.randomBright(32));
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = y * width + x;
            const t = (x === playerStart.x && y === playerStart.y ?
                'floor0' :
                randomTile());
            const tile = tiles_1.createTile();
            if (t === 'wall1') {
                Object.assign(tile.background, {
                    sprite: t,
                    fore: wallDark,
                    back: wallLight
                });
                if (!random_1.randInt(10)) {
                    tile.items.push(torch_1.createTorch());
                }
            }
            else {
                const b = floorBase + floorBack();
                const f = b + floorFore();
                const blendB = color_1.interpolateRgb(color_1.gray(b), wallLight, 0.9);
                const blendF = color_1.interpolateRgb(color_1.gray(f), wallLight, 0.9);
                const back = color_1.multiply(blendB, 0.9, 1, 1.1);
                const fore = color_1.multiply(blendF, 0.9, 1, 1.1);
                tile.blocks = false;
                Object.assign(tile.background, {
                    sprite: t,
                    fore,
                    back
                });
            }
            tiles.data[index] = tile;
        }
    }
    return map;
};

},{"../color":7,"../random":22,"./tiles":20,"./torch":21}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grid_1 = require("../grid");
const animation_1 = require("../animation");
const utils_1 = require("../utils");
const consts_1 = require("../color/consts");
exports.createTile = () => {
    return {
        blocks: true,
        seen: false,
        background: {
            sprite: 'floor0',
            fore: consts_1.errorColor,
            back: consts_1.errorColor,
            duration: 0
        },
        items: []
    };
};
exports.emptyTile = () => {
    const empty = exports.createTile();
    Object.assign(empty.background, {
        fore: consts_1.black,
        back: consts_1.black
    });
    return empty;
};
exports.tileGrid = (width, height) => {
    const data = Array(width * height);
    const tiles = {
        width, height, data
    };
    return tiles;
};
exports.tileBlocks = (grid, { x, y }) => grid_1.gridGet(grid, x, y).blocks;
exports.frameView = (grid, timestamp) => {
    grid = utils_1.clone(grid);
    grid_1.eachCell(grid, tile => {
        tile.background = animation_1.getFrame(tile.background, timestamp);
        tile.items = tile.items.map(item => animation_1.getFrame(item, timestamp));
    });
    return grid;
};

},{"../animation":1,"../color/consts":5,"../grid":16,"../utils":35}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const noise_1 = require("../geometry/noise");
const random_1 = require("../random");
const color_1 = require("../color");
exports.createTorch = () => {
    const torchNoise = noise_1.noise(random_1.randInt(16) + 16);
    const first = randomTorch(torchNoise[0]);
    let prev = first;
    for (let i = 1; i < torchNoise.length; i++) {
        const current = randomTorch(torchNoise[i]);
        prev.next = current;
        prev = current;
    }
    return first;
};
const randomTorch = (noise) => {
    const sprite = 'torchOverlay';
    const fore = [128, 64, 0];
    let backRed = 223;
    let backGreen = 223;
    const channel = random_1.randInt(2);
    if (channel) {
        backRed += noise * 32;
    }
    else {
        backRed += noise * 32;
        backGreen += noise * 32;
    }
    const back = color_1.clampRgb([backRed, backGreen, 0]);
    const light = torchLight(0, 0, noise);
    const duration = random_1.randInt(25) + 100;
    const torch = {
        sprite, fore, back, light, duration
    };
    return torch;
};
const torchLight = (x, y, noise) => {
    const radiusModifier = 0.5 * noise;
    const strengthModifier = 0.125 * noise;
    const light = {
        x, y,
        radius: 4.5 + radiusModifier,
        strength: 0.5 + strengthModifier
    };
    return light;
};

},{"../color":7,"../geometry/noise":12,"../random":22}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randInt = (exclMax) => Math.floor(Math.random() * exclMax);
exports.pick = (arr) => arr[exports.randInt(arr.length)];
exports.pickDice = (arr, count = 3) => arr[exports.dice(arr.length, count)];
exports.dice = (exclMax, count = 3) => {
    let sum = 0;
    for (let i = 0; i < count; i++) {
        sum += Math.random() * exclMax;
    }
    return Math.floor(sum / count);
};

},{}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../bitmap/types");
const utils_1 = require("../utils");
const color_1 = require("../color");
const consts_1 = require("../consts");
const consts_2 = require("../color/consts");
exports.blit = (source, dest, x, y, fore, back) => {
    fore = color_1.quantize(fore, consts_1.quantization);
    back = color_1.quantize(back, consts_1.quantization);
    for (let sy = 0; sy < source.height; sy++) {
        const dy = sy + y;
        for (let sx = 0; sx < source.width; sx++) {
            const dx = sx + x;
            if (!utils_1.inBounds(dx, dy, dest.width, dest.height))
                continue;
            const index = sy * source.width + sx;
            const destIndex = (dy * dest.width + dx) * 4;
            const sourceValue = source.data[index];
            if (sourceValue === types_1.Transparent)
                continue;
            let [r, g, b] = consts_2.errorColor;
            let a = 255;
            if (sourceValue === types_1.Fore) {
                [r, g, b] = fore;
            }
            else if (sourceValue === types_1.Back) {
                [r, g, b] = back;
            }
            dest.data[destIndex] = r;
            dest.data[destIndex + 1] = g;
            dest.data[destIndex + 2] = b;
            dest.data[destIndex + 3] = a;
        }
    }
};
exports.clear = (dest, x, y, width, height) => {
    for (let sy = 0; sy < height; sy++) {
        const dy = sy + y;
        for (let sx = 0; sx < width; sx++) {
            const dx = sx + x;
            if (!utils_1.inBounds(dx, dy, dest.width, dest.height))
                continue;
            const destIndex = (dy * dest.width + dx) * 4;
            dest.data[destIndex + 3] = 0;
        }
    }
};
exports.blitImageData = (source, dest, x, y) => {
    for (let sy = 0; sy < source.height; sy++) {
        const dy = sy + y;
        for (let sx = 0; sx < source.width; sx++) {
            const dx = sx + x;
            if (!utils_1.inBounds(dx, dy, dest.width, dest.height))
                continue;
            const sourceIndex = (sy * source.width + sx) * 4;
            if (source.data[sourceIndex + 3] < 128)
                continue;
            const destIndex = (dy * dest.width + dx) * 4;
            const color = [
                source.data[sourceIndex],
                source.data[sourceIndex + 1],
                source.data[sourceIndex + 2]
            ];
            const [r, g, b] = color_1.quantize(color, consts_1.quantization);
            dest.data[destIndex] = r;
            dest.data[destIndex + 1] = g;
            dest.data[destIndex + 2] = b;
            dest.data[destIndex + 3] = 255;
        }
    }
};

},{"../bitmap/types":3,"../color":7,"../color/consts":5,"../consts":8,"../utils":35}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("../color");
exports.grayscaleEffect = (fore, back) => [color_1.toGray(fore), color_1.toGray(back)];
exports.desaturateEffect = (fore, back) => {
    let grayFore = color_1.toGray(fore);
    let grayBack = color_1.toGray(back);
    return [
        color_1.interpolateRgb(fore, grayFore, 0.25),
        color_1.interpolateRgb(back, grayBack, 0.25)
    ];
};
exports.decreaseContrastEffect = (fore, back) => {
    const midGray = [128, 128, 128];
    return [
        color_1.interpolateRgb(fore, midGray, 0.5),
        color_1.interpolateRgb(back, midGray, 0.5)
    ];
};
exports.darkenEffect = (fore, back) => [
    color_1.multiply(fore, 0.25, 0.25, 0.25),
    color_1.multiply(back, 0.25, 0.25, 0.25),
];

},{"../color":7}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../bitmap/types");
const consts_1 = require("../consts");
const blit_1 = require("./blit");
const bitmap_1 = require("../bitmap");
const font_1 = require("../sprites/font");
const consts_2 = require("../color/consts");
exports.createRenderer = (imageData, sprites, font) => {
    const fontMetrics = font_1.getMetrics(font);
    const renderSprite = (key, tx, ty, fore, back) => {
        const bmp = sprites[key];
        renderer.effects.forEach(effect => {
            [fore, back] = effect(fore, back);
        });
        blit_1.blit(bmp, imageData, tx * consts_1.spriteSize.width, ty * consts_1.spriteSize.height, fore, back);
    };
    const renderTiles = (tiles, offset) => {
        const { x: ox, y: oy } = offset;
        for (let y = 0; y < tiles.height; y++) {
            const ty = y + oy;
            for (let x = 0; x < tiles.width; x++) {
                const tx = x + ox;
                const index = y * tiles.width + x;
                const t = tiles.data[index];
                const { seen } = t;
                const { sprite, fore, back } = t.background;
                if (!seen) {
                    renderSprite('floor0', tx, ty, consts_2.black, consts_2.black);
                    continue;
                }
                renderSprite(sprite, tx, ty, fore, back);
                t.items.forEach(item => {
                    const { sprite, fore, back } = item;
                    renderSprite(sprite, tx, ty, fore, back);
                });
            }
        }
    };
    const renderChar = (ch, x, y, color) => {
        const code = ch.charCodeAt(0) - 32;
        const bmp = font[code];
        if (!bmp)
            return;
        renderer.effects.forEach(effect => {
            [color] = effect(color, consts_2.errorColor);
        });
        blit_1.blit(bmp, imageData, x, y, color, consts_2.errorColor);
    };
    const renderString = (s, x, y, color, mono = false) => {
        const chars = s.split('');
        let cx = 0;
        let cy = 0;
        chars.forEach((ch, i) => {
            const code = font_1.getCode(ch);
            if (ch === '\n') {
                cx = 0;
                cy += consts_1.fontSize.height;
            }
            const metrics = fontMetrics[code];
            if (!metrics)
                return;
            let dx = x + cx;
            if (!mono) {
                dx += metrics.x;
            }
            renderChar(ch, dx, y + cy, color);
            cx += mono ? consts_1.fontSize.width : font_1.getAdvance(fontMetrics, ch, chars[i + 1]);
        });
    };
    const renderRect = (rect, color) => {
        const bmp = bitmap_1.bitmap(rect.width, rect.height);
        bmp.data.fill(types_1.Fore);
        renderer.effects.forEach(effect => {
            [color] = effect(color, consts_2.errorColor);
        });
        blit_1.blit(bmp, imageData, rect.x, rect.y, color, consts_2.errorColor);
    };
    const clearRect = rect => {
        blit_1.clear(imageData, rect.x, rect.y, rect.width, rect.height);
    };
    const effects = [];
    const renderer = {
        renderSprite,
        renderTiles,
        renderChar,
        renderString,
        renderRect,
        clearRect,
        measureTextWidth: (text) => font_1.measureTextWidth(fontMetrics, text),
        effects
    };
    return renderer;
};

},{"../bitmap":2,"../bitmap/types":3,"../color/consts":5,"../consts":8,"../sprites/font":33,"./blit":23}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const consts_1 = require("../consts");
exports.sceneBounds = {
    menu: consts_1.menuPixelRect,
    sidebar: consts_1.sidebarPixelRect,
    title: consts_1.canvasRect,
    viewport: consts_1.viewportPixelRect,
    test: consts_1.canvasRect
};

},{"../consts":8}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scene_renderer_1 = require("./scene-renderer");
const consts_1 = require("../consts");
const effects_1 = require("../renderer/effects");
const icon_1 = require("../icon");
const consts_2 = require("../color/consts");
exports.menuScene = (repository) => {
    const { rect, imageData, renderer } = scene_renderer_1.sceneRenderer('menu', repository);
    const { player, messages } = repository.game;
    const { renderSprite, renderRect, clearRect, renderString, measureTextWidth } = renderer;
    const { darkestSkin, darkerSkin, skin, lighterSkin, darkerClothes, clothes, lighterClothes } = player.colors;
    const menuIcons = [
        icon_1.createIcon('get', 'get', darkerSkin, lighterSkin),
        icon_1.createIcon('use', 'use', darkerSkin, lighterSkin),
        icon_1.createIcon('search', 'eye', darkestSkin, consts_2.nearWhite),
        icon_1.createIcon('disarm', 'disarm', consts_2.metal, consts_2.darkerMetal),
        icon_1.createIcon('rest', 'chair', consts_2.darkerWood, consts_2.wood),
        icon_1.createIcon('sleep', 'bed', consts_2.darkerWood, consts_2.wood),
        icon_1.createIcon('character', 'player', clothes, skin),
        icon_1.createIcon('inventory', 'pack', darkerClothes, lighterClothes),
        icon_1.createIcon('map', 'map', consts_2.darkerPaper, consts_2.paper),
        icon_1.createIcon('cast', 'spell', consts_2.darkerMagic, consts_2.magic),
        icon_1.createIcon('cast magic arrow', 'arrow', consts_2.darkerMagic, consts_2.magic, consts_2.uiMagic, consts_2.magicSelect),
        icon_1.createIcon('cast heal medium wounds', 'healMedium', consts_2.healWounds, consts_2.healWounds, consts_2.uiMagic, consts_2.magicSelect),
        icon_1.createIcon('cast light', 'light', consts_2.darkerLight, consts_2.light, consts_2.uiMagic, consts_2.magicSelect),
        icon_1.createIcon('cast reveal', 'eye', consts_2.darkerMagic, consts_2.magic, consts_2.uiMagic, consts_2.magicSelect),
        icon_1.createIcon('main menu', 'home', consts_2.darkerTitleBlue, consts_2.titleBlue),
        icon_1.createIcon('toggle fullscreen', 'fullScreen', consts_2.black, consts_2.nearWhite)
    ];
    const menuLength = menuIcons.length;
    let menuSelection = menuLength;
    const getSelection = () => {
        let selection = menuSelection;
        while (selection >= menuLength) {
            selection -= menuLength;
        }
        while (selection < 0) {
            selection += menuLength;
        }
        return selection;
    };
    const tap = (tx, ty, synthetic = false) => {
        if (!scene.active)
            return;
        if (ty === 0 && tx !== menuSelection) {
            if (tx < menuLength) {
                menuSelection = tx;
            }
            return;
        }
        const selectedIcon = menuIcons[getSelection()];
        if (ty < 3 && !synthetic && selectedIcon && selectedIcon.label in actions) {
            actions[selectedIcon.label]();
        }
        exit();
    };
    const exit = () => {
        // keep same selection but prevent double tap on reenter
        menuSelection = menuSelection + menuLength;
        repository.deactivate('menu');
        repository.activate('viewport');
        repository.activate('sidebar');
    };
    const actions = {
        get: () => {
            messages.push('got nowt');
        },
        use: () => {
            messages.push('hand empty');
        },
        search: () => {
            messages.push('found nowt');
        },
        disarm: () => {
            messages.push('no traps');
        },
        'main menu': () => {
            repository.deactivate('menu');
            repository.hide('menu');
            repository.hide('sidebar');
            repository.hide('viewport');
            repository.activate('title');
            repository.show('title');
        },
        'toggle fullscreen': () => {
            repository.browserMessage('toggleFullscreen');
        }
    };
    const input = (type) => {
        if (type === 'left') {
            menuSelection--;
        }
        if (type === 'right') {
            menuSelection++;
        }
        if (type === 'cancel') {
            exit();
        }
        if (type === 'confirm') {
            const selectedIcon = menuIcons[getSelection()];
            if (selectedIcon.label in actions) {
                actions[selectedIcon.label]();
            }
            exit();
        }
    };
    const tick = (_timestamp) => {
        if (!scene.visible)
            return;
        if (scene.active) {
            renderer.effects = [];
        }
        else {
            renderer.effects = [effects_1.desaturateEffect];
        }
        renderRect({
            x: 0, y: 0,
            width: rect.width, height: consts_1.spriteSize.height
        }, consts_2.uiBackground);
        clearRect({
            x: 0, y: consts_1.spriteSize.height,
            width: rect.width, height: rect.height - consts_1.spriteSize.height
        });
        if (scene.active) {
            drawMenuSelection();
        }
        menuIcons.forEach((icon, x) => {
            const { sprite, fore, back } = icon;
            const highlight = icon.highlight || consts_2.select;
            let background = icon.background || consts_2.uiBackground;
            if (scene.active && x === getSelection()) {
                background = highlight;
            }
            renderRect({
                x: x * consts_1.spriteSize.width,
                y: 0,
                width: consts_1.spriteSize.width,
                height: consts_1.spriteSize.height
            }, background);
            renderSprite(sprite, x, 0, fore, back);
        });
    };
    const drawMenuSelection = () => {
        renderSprite('arrowUp', getSelection(), 1, consts_2.selectAlt, consts_2.select);
        const selectedIcon = menuIcons[getSelection()];
        const { label } = selectedIcon;
        const labelWidth = measureTextWidth(label);
        let labelX = (getSelection() * consts_1.spriteSize.width - Math.floor(labelWidth / 2)) + Math.floor(consts_1.spriteSize.width / 2);
        if (labelX < 0)
            labelX = 0;
        if (labelX + labelWidth > rect.width)
            labelX = rect.width - labelWidth;
        renderString(label, labelX + 1, consts_1.spriteSize.height * 2 + 2, consts_2.selectAlt);
        renderString(label, labelX, consts_1.spriteSize.height * 2 + 1, consts_2.select);
    };
    const scene = {
        tap, input, tick, renderer, imageData,
        active: false,
        visible: false
    };
    return scene;
};

},{"../color/consts":5,"../consts":8,"../icon":17,"../renderer/effects":24,"./scene-renderer":29}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const consts_1 = require("../consts");
const blit_1 = require("../renderer/blit");
const bounds_1 = require("./bounds");
const player_1 = require("../game/player");
const bad_map_1 = require("../map/bad-map");
const title_1 = require("./title");
const menu_1 = require("./menu");
const sidebar_1 = require("./sidebar");
const viewport_1 = require("./viewport");
exports.sceneRepository = (sprites, font, images, browserMessage) => {
    const mapSize = { width: 100, height: 100 };
    const player = player_1.createPlayer();
    const map = bad_map_1.badMap(mapSize.width, mapSize.height, player);
    const messages = [
        'missed',
        '-10 hp',
        'hit',
        '+15 cp',
        'light',
        '+5 gp',
        'trap!',
        '-5 hp',
    ];
    const game = { player, map, messages };
    const imageData = new ImageData(consts_1.canvasSize.width, consts_1.canvasSize.height);
    const activate = (key) => {
        console.log('activate', key);
        repository.scenes[key].active = true;
    };
    const deactivate = (key) => {
        console.log('deactivate', key);
        repository.scenes[key].active = false;
    };
    const show = (key) => {
        console.log('show', key);
        repository.scenes[key].visible = true;
    };
    const hide = (key) => {
        console.log('hide', key);
        repository.scenes[key].visible = false;
    };
    const eachScene = (keys, cb) => {
        keys.forEach(key => {
            const scene = repository.scenes[key];
            cb(scene, key);
        });
    };
    const tick = (timestamp) => {
        eachScene(keys, (scene, key) => {
            scene.tick(timestamp);
            if (scene.visible) {
                const bounds = bounds_1.sceneBounds[key];
                blit_1.blitImageData(scene.imageData, imageData, bounds.x, bounds.y);
            }
        });
    };
    const input = (type) => {
        const activeKeys = keys.filter(key => scenes[key].active);
        eachScene(activeKeys, scene => scene.input(type));
    };
    const tap = (tx, ty) => {
        const activeKeys = keys.filter(key => scenes[key].active);
        eachScene(activeKeys, scene => scene.tap(tx, ty));
    };
    const scenes = {};
    const repository = {
        input, tap, tick, imageData,
        activate, deactivate, show, hide,
        scenes: scenes,
        sprites, font, images,
        game,
        browserMessage
    };
    // remember, this is the draw order!
    scenes.sidebar = sidebar_1.sidebarScene(repository);
    scenes.viewport = viewport_1.viewportScene(repository);
    scenes.menu = menu_1.menuScene(repository);
    scenes.title = title_1.titleScene(repository);
    const keys = Object.keys(scenes);
    return repository;
};

},{"../consts":8,"../game/player":9,"../map/bad-map":19,"../renderer/blit":23,"./bounds":26,"./menu":27,"./sidebar":30,"./title":31,"./viewport":32}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bounds_1 = require("./bounds");
const renderer_1 = require("../renderer/renderer");
exports.sceneRenderer = (key, repository) => {
    const rect = bounds_1.sceneBounds[key];
    const imageData = new ImageData(rect.width, rect.height);
    const renderer = renderer_1.createRenderer(imageData, repository.sprites, repository.font);
    return { rect, imageData, renderer };
};

},{"../renderer/renderer":25,"./bounds":26}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scene_renderer_1 = require("./scene-renderer");
const effects_1 = require("../renderer/effects");
const consts_1 = require("../consts");
const consts_2 = require("../color/consts");
const color_1 = require("../color");
exports.sidebarScene = (repository) => {
    const { rect, imageData, renderer } = scene_renderer_1.sceneRenderer('sidebar', repository);
    const { player, messages } = repository.game;
    const { renderRect, renderString } = renderer;
    const statsRect = {
        x: 0,
        y: 0,
        width: rect.width,
        height: consts_1.fontSize.height * 6 + 1
    };
    const messageRect = {
        x: 0,
        y: statsRect.height,
        width: rect.width,
        height: rect.height - statsRect.height
    };
    const maxMessages = 8;
    const messageFadeStep = 1 / maxMessages;
    const tap = (tx, ty) => {
    };
    const input = (type) => {
    };
    const tick = (_timestamp) => {
        if (!scene.visible)
            return;
        if (scene.active) {
            renderer.effects = [];
        }
        else {
            renderer.effects = [effects_1.decreaseContrastEffect, effects_1.darkenEffect];
        }
        renderRect(statsRect, consts_2.uiBackground);
        renderRect(messageRect, consts_2.paper);
        const { str, int, dex, con } = player.stats;
        const { hp, mp } = player;
        const stats = [
            `STR:${String(str).padStart(2, ' ')}`,
            `INT:${String(int).padStart(2, ' ')}`,
            `DEX:${String(dex).padStart(2, ' ')}`,
            `CON:${String(con).padStart(2, ' ')}`,
            `HP:${String(hp).padStart(3, ' ')}`,
            `MP:${String(mp).padStart(3, ' ')}`
        ].join('\n');
        renderString(stats, 1, 1, consts_2.select, true);
        const recentMessages = (messages.length < maxMessages ?
            [
                ...Array(maxMessages - messages.length).fill(''),
                ...messages
            ] :
            messages.slice(-8));
        recentMessages.forEach((message, y) => {
            const fadeAmount = messageFadeStep * (y + 1);
            const fadeColor = color_1.interpolateRgb(consts_2.ink, consts_2.paper, fadeAmount);
            y *= consts_1.fontSize.height;
            renderString(message, 1, messageRect.y + y + 1, fadeColor);
        });
    };
    const scene = {
        tap, input, tick, renderer, imageData,
        active: false,
        visible: false
    };
    return scene;
};

},{"../color":7,"../color/consts":5,"../consts":8,"../renderer/effects":24,"./scene-renderer":29}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scene_renderer_1 = require("./scene-renderer");
const blit_1 = require("../renderer/blit");
exports.titleScene = (repository) => {
    const { imageData, renderer } = scene_renderer_1.sceneRenderer('title', repository);
    const { title } = repository.images;
    const exit = () => {
        repository.deactivate('title');
        repository.hide('title');
        repository.show('menu');
        repository.show('sidebar');
        repository.show('viewport');
        repository.activate('sidebar');
        repository.activate('viewport');
    };
    const tap = (_tx, _ty) => {
        if (!scene.active)
            return;
        exit();
    };
    const input = (type) => {
        if (!scene.active)
            return;
        if (type === 'confirm') {
            exit();
        }
        if (type === 'cancel') {
            exit();
        }
    };
    const tick = (_timestamp) => {
        if (!scene.visible)
            return;
        blit_1.blitImageData(title, imageData, 0, 0);
    };
    const scene = {
        tap, input, tick, renderer, imageData,
        active: false,
        visible: false
    };
    return scene;
};

},{"../renderer/blit":23,"./scene-renderer":29}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scene_renderer_1 = require("./scene-renderer");
const effects_1 = require("../renderer/effects");
const utils_1 = require("../utils");
const tiles_1 = require("../map/tiles");
const consts_1 = require("../consts");
const grid_1 = require("../grid");
const apply_lights_1 = require("../color/apply-lights");
const rect_1 = require("../geometry/rect");
const point_1 = require("../geometry/point");
const fov_lines_1 = require("../geometry/fov-lines");
exports.viewportScene = (repository) => {
    const { imageData, renderer } = scene_renderer_1.sceneRenderer('viewport', repository);
    const { player, map } = repository.game;
    const { skin, clothes } = player.colors;
    const { renderTiles, renderSprite } = renderer;
    const playerLight = Object.assign({}, player.light, {
        x: consts_1.viewportCenter.x,
        y: consts_1.viewportCenter.y
    });
    const showMenu = () => {
        repository.deactivate('viewport');
        repository.deactivate('sidebar');
        repository.activate('menu');
    };
    const fov = fov_lines_1.fovLines(consts_1.viewportSize, consts_1.viewportCenter);
    const tap = (tx, ty) => {
        if (!scene.active)
            return;
        const tilePosition = { x: tx, y: ty };
        if (ty === 0) {
            showMenu();
            repository.scenes.menu.tap(tx, ty, true);
        }
        if (!rect_1.inRect(consts_1.viewportRect, tilePosition))
            return;
        const translateBy = point_1.scale(consts_1.viewportPosition, point_1.valueToPoint(-1));
        const viewportTilePosition = point_1.translate(tilePosition, translateBy);
        tx = viewportTilePosition.x;
        ty = viewportTilePosition.y;
        const playerViewportTile = consts_1.viewportCenter;
        const deltaX = tx - playerViewportTile.x;
        const deltaY = ty - playerViewportTile.y;
        const dist = Math.hypot(deltaX, deltaY);
        if (dist === 0) {
            input('confirm');
            return;
        }
        const angle = Math.atan2(deltaY, deltaX) / Math.PI;
        const northEast = -0.25;
        const southEast = 0.25;
        const southWest = 0.75;
        const northWest = -0.75;
        if (angle > northWest && angle < northEast) {
            input('up');
        }
        if (angle > southEast && angle < southWest) {
            input('down');
        }
        // the angle sign wraps around on the west side
        if (Math.abs(angle) > 0.75) {
            input('left');
        }
        if (angle > northEast && angle < southEast) {
            input('right');
        }
    };
    const input = (type) => {
        if (type === 'cancel') {
            showMenu();
            return;
        }
        let x = player.x;
        let y = player.y;
        if (type === 'up') {
            y--;
        }
        if (type === 'down') {
            y++;
        }
        if (type === 'left') {
            x--;
        }
        if (type === 'right') {
            x++;
        }
        if (!utils_1.inBounds(x, y, map.tiles.width, map.tiles.height) ||
            tiles_1.tileBlocks(map.tiles, { x, y })) {
            return;
        }
        player.x = x;
        player.y = y;
        grid = grid_1.gridView(map.tiles, player.x - consts_1.viewportCenter.x, player.y - consts_1.viewportCenter.y, consts_1.viewportSize.width, consts_1.viewportSize.height, tiles_1.emptyTile());
        updateSeen();
    };
    let grid = grid_1.gridView(map.tiles, player.x - consts_1.viewportCenter.x, player.y - consts_1.viewportCenter.y, consts_1.viewportSize.width, consts_1.viewportSize.height, tiles_1.emptyTile());
    const tick = (timestamp) => {
        if (!scene.visible)
            return;
        if (scene.active) {
            renderer.effects = [];
        }
        else {
            renderer.effects = [effects_1.decreaseContrastEffect, effects_1.darkenEffect];
            timestamp = 0;
        }
        const lights = [playerLight];
        const tileView = tiles_1.frameView(grid, timestamp);
        grid_1.eachCell(tileView, (tile, x, y) => {
            tile.items.forEach(item => {
                if (item.light) {
                    const light = Object.assign({}, item.light, {
                        x: x + item.light.x,
                        y: y + item.light.y
                    });
                    lights.push(light);
                }
            });
        });
        apply_lights_1.applyLights(lights, tileView, ({ x, y }, lightness) => {
            const tile = grid_1.gridGet(tileView, x, y);
            apply_lights_1.applyFrameLight(tile.background, lightness);
            tile.items.forEach(item => {
                apply_lights_1.applyFrameLight(item, lightness);
            });
        });
        renderTiles(tileView, { x: 0, y: 0 });
        renderSprite('player', consts_1.viewportCenter.x, consts_1.viewportCenter.y, clothes, skin);
    };
    const updateSeen = () => {
        fov.forEach(line => {
            let blocked = false;
            for (let i = 0; i < line.length; i++) {
                if (blocked)
                    continue;
                const p = line[i];
                const tile = grid_1.gridGet(grid, p.x, p.y);
                tile.seen = true;
                if (tile.blocks) {
                    blocked = true;
                    continue;
                }
            }
        });
    };
    updateSeen();
    const scene = {
        tap, input, tick, renderer, imageData,
        active: false,
        visible: false
    };
    return scene;
};

},{"../color/apply-lights":4,"../consts":8,"../geometry/fov-lines":10,"../geometry/point":13,"../geometry/rect":14,"../grid":16,"../map/tiles":20,"../renderer/effects":24,"../utils":35,"./scene-renderer":29}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../bitmap/types");
const grid_1 = require("../grid");
const firstColumn = (bmp) => {
    for (let x = 0; x < bmp.width; x++) {
        for (let y = 0; y < bmp.height; y++) {
            if (grid_1.gridGet(bmp, x, y) !== types_1.Transparent)
                return x;
        }
    }
    return -1;
};
const lastColumn = (bmp) => {
    for (let x = bmp.width - 1; x >= 0; x--) {
        for (let y = 0; y < bmp.height; y++) {
            if (grid_1.gridGet(bmp, x, y) !== types_1.Transparent)
                return x;
        }
    }
    return -1;
};
exports.bounds = (bmp) => {
    const charBounds = {
        x: 0,
        advance: 2,
        height: bmp.height
    };
    const first = firstColumn(bmp);
    if (first === -1)
        return charBounds;
    const last = lastColumn(bmp);
    const width = last - first;
    charBounds.x = -first;
    charBounds.advance = width + 2;
    return charBounds;
};
exports.getMetrics = (font) => {
    const metrics = Array(font.length);
    for (let i = 0; i < font.length; i++) {
        metrics[i] = exports.bounds(font[i]);
    }
    return metrics;
};
exports.measureTextWidth = (fontMetrics, text) => {
    const chars = text.split('');
    let width = 0;
    chars.forEach((ch, i) => {
        const code = exports.getCode(ch);
        const metrics = fontMetrics[code];
        if (!metrics)
            return 0;
        width += exports.getAdvance(fontMetrics, ch, chars[i + 1]);
    });
    return width;
};
exports.getCode = (ch) => ch.charCodeAt(0) - 32;
exports.getAdvance = (fontMetrics, ch, next) => {
    const code = exports.getCode(ch);
    const metrics = fontMetrics[code];
    if (!metrics)
        return 0;
    let { advance } = metrics;
    if (ch in exports.kerning && next) {
        const map = exports.kerning[ch];
        if (next in map) {
            advance += map[next];
        }
    }
    return advance;
};
exports.kerning = {
    c: {
        t: -1
    },
    f: {
        f: -1,
        i: -1,
        t: -1
    },
    h: {
        t: -1
    },
    l: {
        l: -1,
        t: -1
    },
    o: {
        t: -1
    },
    p: {
        t: -1
    },
    s: {
        t: -1
    },
    w: {
        t: -1
    }
};

},{"../bitmap/types":3,"../grid":16}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bitmap_1 = require("../bitmap");
exports.loadSprites = async (src, spriteSize) => {
    const { width, height } = spriteSize;
    const sprites = {};
    const image = await exports.readImageData(src);
    Object.keys(exports.spriteLocationMap).forEach(key => {
        const spriteKey = key;
        const locationKey = key;
        const location = exports.spriteLocationMap[locationKey];
        let { x: sx, y: sy } = location;
        sx *= width;
        sy *= height;
        const bmp = getBmp(image, sx, sy, width, height);
        sprites[spriteKey] = bmp;
    });
    return sprites;
};
exports.loadFont = async (src, fontSize) => {
    const { width, height } = fontSize;
    const image = await exports.readImageData(src);
    const xCount = Math.floor(image.width / width);
    const yCount = Math.floor(image.height / height);
    const count = xCount * yCount;
    const sprites = Array(count);
    for (let y = 0; y < yCount; y++) {
        const sy = y * height;
        for (let x = 0; x < xCount; x++) {
            const sx = x * height;
            const index = y * xCount + x;
            sprites[index] = getBmp(image, sx, sy, width, height);
        }
    }
    return sprites;
};
const getBmp = (source, sx, sy, width, height) => {
    const bmp = bitmap_1.bitmap(width, height);
    for (let y = 0; y < height; y++) {
        const iy = sy + y;
        for (let x = 0; x < width; x++) {
            const ix = sx + x;
            const sourceIndex = (iy * source.width + ix) * 4;
            const destIndex = y * width + x;
            const r = source.data[sourceIndex];
            const a = source.data[sourceIndex + 3];
            if (a === 0) {
                bmp.data[destIndex] = a;
            }
            else {
                if (r < 128) {
                    bmp.data[destIndex] = 1;
                }
                else {
                    bmp.data[destIndex] = 2;
                }
            }
        }
    }
    return bmp;
};
const mobY = 0;
const overlayY = 1;
const tileY = 2;
const itemY = 3;
const iconY = 4;
const spellY = 5;
exports.spriteLocationMap = {
    player: { x: 0, y: mobY },
    ghost: { x: 1, y: mobY },
    devil: { x: 2, y: mobY },
    shieldOverlay: { x: 0, y: overlayY },
    swordOverlay: { x: 1, y: overlayY },
    torchOverlay: { x: 2, y: overlayY },
    stairs: { x: 0, y: tileY },
    floor0: { x: 1, y: tileY },
    floor1: { x: 2, y: tileY },
    floor2: { x: 3, y: tileY },
    floor3: { x: 4, y: tileY },
    wall1: { x: 5, y: tileY },
    wall2: { x: 6, y: tileY },
    sword: { x: 0, y: itemY },
    potion: { x: 1, y: itemY },
    shield: { x: 2, y: itemY },
    coins: { x: 3, y: itemY },
    get: { x: 0, y: iconY },
    use: { x: 1, y: iconY },
    eye: { x: 2, y: iconY },
    disarm: { x: 3, y: iconY },
    chair: { x: 4, y: iconY },
    bed: { x: 5, y: iconY },
    pack: { x: 6, y: iconY },
    map: { x: 7, y: iconY },
    spell: { x: 8, y: iconY },
    arrowUp: { x: 9, y: iconY },
    home: { x: 10, y: iconY },
    fullScreen: { x: 11, y: iconY },
    healMinor: { x: 0, y: spellY },
    healMedium: { x: 1, y: spellY },
    healMajor: { x: 2, y: spellY },
    light: { x: 3, y: spellY },
    arrow: { x: 4, y: spellY },
};
exports.readImageData = (src) => new Promise((resolve, reject) => {
    try {
        const image = new Image();
        image.onload = () => {
            const { width, height } = image;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext('2d');
            context.drawImage(image, 0, 0);
            const imageData = context.getImageData(0, 0, width, height);
            resolve(imageData);
        };
        image.src = src;
    }
    catch (e) {
        reject(e);
    }
});

},{"../bitmap":2}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inBounds = (x, y, width, height) => x >= 0 && y >= 0 && x < width && y < height;
exports.clone = (value) => JSON.parse(JSON.stringify(value));
exports.clamp = (n, min = 0, max = 255) => n < min ? min : n > max ? max : n;

},{}]},{},[18]);
