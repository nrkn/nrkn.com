(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const b = document.body;
const CanvasConsole = require('canvas-console');
const viewport = document.getElementById('viewport');
if (!viewport) {
    throw Error('No #viewport');
}
let canvasConsole;
let canvas;
const start = async () => {
    canvasConsole = await CanvasConsole(viewport, {
        viewSize: { width: 25, height: 25 },
        spriteSize: { width: 8, height: 8 },
        //spriteSource: sprites8x8
        spriteSource: '8x8.png',
        useCleanScaling: false
    });
    canvas = document.querySelector('canvas');
    G();
};
start();
let G = () => {
    /*
      View settings
    */
    let viewSize = [25, 25];
    let viewOff = [12, 12];
    let fov = 6;
    /*
      Constants - these will get inlined by the minifier but make it a lot more
      readable
    */
    /*
      These are indices into tile structures, where the structure is an array
      It's cheaper and packs better if every complex structure is an array
    */
    let X = 0;
    let Y = 1;
    let TILE_TYPE = 2;
    let HP = 3;
    let CHAR = 4;
    let COLOR = 5;
    let SEEN = 6;
    /*
      Tile types
    */
    let TILE_TYPE_PLAYER = 0;
    let TILE_TYPE_MONSTER = 1;
    let TILE_TYPE_STAIRS_DOWN = 2;
    let TILE_TYPE_FLOOR = 3;
    let TILE_TYPE_POTION = 4;
    let TILE_TYPE_WALL = 5;
    /*
      Indices into level structure
    */
    let FLOORS = 0;
    let MOBS = 1;
    /*
      Symbols
    */
    let CHAR_PLAYER = '@';
    let CHAR_WALL = '#';
    let CHAR_FLOOR = '.';
    let CHAR_MONSTER = 'm';
    let CHAR_STAIRS_DOWN = '>';
    let CHAR_POTION = String.fromCharCode(155);
    let CHAR_WIN = '$';
    /*
      Colors
    */
    let COLOR_PLAYER = [85, 170, 255, 255];
    let COLOR_WALL = [85, 85, 85, 255];
    let COLOR_FLOOR = [85, 85, 85, 255];
    let COLOR_MONSTER = [255, 0, 0, 255];
    let COLOR_STAIRS_DOWN = [255, 255, 255, 255];
    let COLOR_POTION = [255, 170, 0, 255];
    let COLOR_WIN = [255, 255, 0, 255];
    /*
      Directions
    */
    let DIRECTION_UP = 1;
    let DIRECTION_RIGHT = 2;
    let DIRECTION_DOWN = 3;
    let DIRECTION_LEFT = 0;
    let DIRECTION_NONE = -1;
    /*
      Dungeon settings
  
      width and height are the bounds for randomly placing initial points for
      waypoints, but aside from placing those initial points, no bounding checks are
      done, to save bytes - the draw algorithm and movement checks are designed
      around points being potentially at any coordinate including negative ones
    */
    let width = 10;
    let height = 10;
    let roomCount = 2;
    let monsterCount = 2;
    let playerStartHP = 10;
    /*
      Bog-standard exlusive max random integer function
    */
    let randInt = exclusiveMax => (Math.random() * exclusiveMax) | 0;
    /*
      Game state
    */
    let currentLevel = 0;
    let level;
    let player = [
        0, 0, TILE_TYPE_PLAYER, playerStartHP, CHAR_PLAYER, COLOR_PLAYER
    ];
    /*
      Is there a tile in collection that collides with the provided point?
  
      Also check the hit points and don't consider "dead" tiles for collision
  
      This lets us kill monsters, pick up potions etc without deleting them from the
      array, which is expensive - we just don't collide with or draw dead things
  
      Has strange side effect whereby floors etc need HP in order to be drawn haha
    */
    let collides = (tiles, point) => {
        for (let i = 0; i < tiles.length; i++) {
            if (tiles[i][HP] &&
                point[X] == tiles[i][X] &&
                point[Y] == tiles[i][Y])
                return tiles[i];
        }
    };
    /*
      Move p2 - mutates this point rather than returns a new one, cheaper
  
      If towards is truthy it moves towards p1
  
      Otherwise, it moves according to the direction passed
    */
    let towardsOrDirection = (p1, p2, direction, towards) => {
        if (towards) {
            if (p1[X] < p2[X]) {
                p2[X]--;
            }
            else if (p1[X] > p2[X]) {
                p2[X]++;
            }
            else if (p1[Y] < p2[Y]) {
                p2[Y]--;
            }
            else if (p1[Y] > p2[Y]) {
                p2[Y]++;
            }
        }
        else {
            /*
              This order is chosen to match the order of the key codes for arrow keys
            */
            if (direction == DIRECTION_UP) {
                p2[Y]--;
            }
            else if (direction == DIRECTION_RIGHT) {
                p2[X]++;
            }
            else if (direction == DIRECTION_DOWN) {
                p2[Y]++;
            }
            else if (direction == DIRECTION_LEFT) {
                p2[X]--;
            }
        }
    };
    /*
      Level generator
    */
    let NewLevel = () => {
        level = [
            // floor tiles - always have a floor tile for the player
            [
                [player[X], player[Y], TILE_TYPE_FLOOR, 1, CHAR_FLOOR, COLOR_FLOOR]
            ],
            // mobs - start with just player
            [player]
        ];
        /*
          Cave more likely to be larger and have more monsters etc as you move down
          the levels
        */
        let levelWidth = randInt(currentLevel * width) + width;
        let levelHeight = randInt(currentLevel * height) + height;
        let levelRooms = randInt(currentLevel * roomCount) + roomCount;
        let levelMonsters = randInt(currentLevel * monsterCount) + monsterCount;
        let levelPotions = randInt(currentLevel * monsterCount) + monsterCount;
        /*
          Add a new mob, even stairs are mobs to save bytes
        */
        let addMob = (tileType, hp, ch, color) => {
            // new mob at random location
            let mob = [
                randInt(levelWidth), randInt(levelHeight),
                tileType, hp, ch, color
            ];
            /*
              Has to collide with a floor tile to be on map, but also has to be the
              only mob at this point on the map
            */
            if (collides(level[FLOORS], mob) &&
                !collides(level[MOBS], mob)) {
                level[MOBS].push(mob);
                return mob;
            }
            /*
              Call recursively if couldn't place, saves a while loop
            */
            return addMob(tileType, hp, ch, color);
        };
        /*
          Modified drunkard's walk algorithm to tunnel out a cave between p1 and p2
        */
        let connect = (p1, p2) => {
            /*
              Always place p2 if it doesn't exist
            */
            if (!collides(level[FLOORS], p2)) {
                level[FLOORS].push([p2[X], p2[Y], TILE_TYPE_FLOOR, 1, CHAR_FLOOR, COLOR_FLOOR]);
            }
            /*
              If we reached the goal, stop
            */
            if (p1[X] == p2[X] && p1[Y] == p2[Y])
                return;
            /*
              Pick a random direction to move in
            */
            let direction = randInt(4);
            /*
              Either move in that random direction, or 1 in 4 chance it moves towards
              goal - better to have it move randomly most of the time, or you just end
              up with a series of connected L shaped corridors
            */
            towardsOrDirection(p1, p2, direction, !randInt(3));
            /*
              Call again, this will keep happening until we reach the goal
            */
            connect(p1, p2);
        };
        /*
          Tunnel out several chambers in the cave, between a random point and a
          randomly selected existing point
        */
        for (let i = 0; i < levelRooms; i++) {
            connect(level[FLOORS][randInt(level[FLOORS].length)], [randInt(levelWidth), randInt(levelHeight)]);
        }
        /*
          Would be ideal to not have stairs block corridors as it can make some parts
          of the map unreachable, but that's exprensive and the levels are at least
          always finishable
        */
        addMob(TILE_TYPE_STAIRS_DOWN, 1, currentLevel > 8 ? CHAR_WIN : CHAR_STAIRS_DOWN, currentLevel > 8 ? COLOR_WIN : COLOR_STAIRS_DOWN);
        /*
          Place monsters at random free floor locations
        */
        for (let i = 0; i < levelMonsters; i++) {
            addMob(TILE_TYPE_MONSTER, 1, CHAR_MONSTER, COLOR_MONSTER);
        }
        /*
          Place healing potions (coins) at random free floor locations
        */
        for (let i = 0; i < levelPotions; i++) {
            addMob(TILE_TYPE_POTION, 1, CHAR_POTION, COLOR_POTION);
        }
    };
    /*
      Almost like a raycaster, we create a viewport centered on the player and
      use the collision algorithm to decide what to draw for each tile we hit,
      gets rid of tedious bounds checking etc - good for byte count of code but
      super inefficient for the CPU. If you have a large viewport and large level
      it's very slow, even on a modern machine, but runs OK with the settings we're
      using
    */
    let draw = () => {
        let dead = player[HP] < 1;
        let won = currentLevel > 9;
        /*
          Iterate over tiles in viewport
        */
        for (let vY = 0; vY < viewSize[Y]; vY++) {
            for (let vX = 0; vX < viewSize[X]; vX++) {
                /*
                  Normalize the viewport coordinates to map coordinates, centered on the
                  player
                */
                let x = player[X] - viewOff[X] + vX;
                let y = player[Y] - viewOff[Y] + vY;
                /*
                  See if we have first a mob, and if not, then a floor here
                */
                let current = collides(level[MOBS], [x, y]) ||
                    collides(level[FLOORS], [x, y]);
                /*
                  If nothing, add a wall at this location, then assign it to current
                */
                if (!current) {
                    level[MOBS].push([x, y, TILE_TYPE_WALL, 1, CHAR_WALL, COLOR_WALL]);
                    current = collides(level[MOBS], [x, y]);
                }
                /*
                  Add the seen flag to all tiles within the field of view
                */
                if (vX >= (viewOff[X] - fov) && vY >= (viewOff[Y] - fov) &&
                    vX <= (viewOff[X] + fov) && vY <= (viewOff[Y] + fov)) {
                    current[SEEN] = 1;
                }
                /*
                  If the player is dead or has won, use the WIN condition color to draw
                  the tile, otherwise use the tile color
        
                  -nb can optimize by inverting and using same tests as below?
                */
                let color = dead || won ? COLOR_WIN : current[COLOR];
                /*
                  If the player has won, draw $, so the screen will fill up with $
                  If dead, fill it with zero symbol, it's cheap to draw and gets the point
                  across
                  Otherwise, if the tile has been seen, draw the character associated with
                  it, or a space if unseen
                */
                canvasConsole.putChar(won ?
                    CHAR_WIN :
                    dead ?
                        '0' :
                        current[SEEN] ?
                            current[CHAR] :
                            ' ', vX, vY, color, [0, 0, 0, 255]);
            }
        }
        /*
          Draw status bar if hasn't won or died, showing current level and HP (coins)
          left
        */
        if (!dead && !won) {
            let s = 1 + currentLevel + ' ' + CHAR_POTION + player[HP];
            for (let i = 0; i < viewSize[X]; i++) {
                canvasConsole.putChar(s[i] ? s[i] : ' ', i, viewSize[Y] - 1, 14, COLOR_PLAYER);
            }
        }
    };
    /*
      Movement for both payers and monsters
    */
    let move = (mob, direction) => {
        /*
          initial position
        */
        let currentPosition = [mob[X], mob[Y]];
        /*
          Monsters, one in five chance doesn't move towards player, otherwise try to
          move closer - the move algorithm  creates very predictable movement but is
          also very cheap - the chance not to move towards player helps to stop
          monsters getting permanently stuck and makes it feel less mechanical
        */
        towardsOrDirection(player, currentPosition, direction, mob[TILE_TYPE] == TILE_TYPE_MONSTER && randInt(5));
        /*
          See if anything is at the point we tried to move to
        */
        let currentTile = collides(level[MOBS], currentPosition);
        /*
          If we're a monster and the tile we tried to move to has a player on it,
          try to hit them instead of moving there (50% chance)
        */
        if (currentTile && mob[TILE_TYPE] == TILE_TYPE_MONSTER &&
            currentTile[TILE_TYPE] == TILE_TYPE_PLAYER && randInt(2)) {
            currentTile[HP]--;
        }
        else if (currentTile && mob[TILE_TYPE] == TILE_TYPE_PLAYER &&
            currentTile[TILE_TYPE] == TILE_TYPE_MONSTER && randInt(2)) {
            currentTile[HP]--;
        }
        else if (currentTile && mob[TILE_TYPE] == TILE_TYPE_PLAYER &&
            currentTile[TILE_TYPE] == TILE_TYPE_STAIRS_DOWN) {
            currentLevel++;
            NewLevel();
        }
        else if (currentTile && currentTile[TILE_TYPE] == TILE_TYPE_POTION) {
            mob[HP]++;
            currentTile[HP]--;
        }
        else if (collides(level[FLOORS], currentPosition) && !currentTile) {
            mob[X] = currentPosition[X];
            mob[Y] = currentPosition[Y];
        }
    };
    const playerMove = direction => {
        /*
          Player moves first, slight advantage
        */
        move(player, direction);
        /*
          Search the mobs for monsters, try to randomly move any that aren't dead
          Monsters prefer to move towards player but there's a chance they'll use
          this passed in random direction instead
        */
        for (let i = 0; i < level[MOBS].length; i++) {
            if (level[MOBS][i][HP] &&
                level[MOBS][i][TILE_TYPE] == TILE_TYPE_MONSTER)
                move(level[MOBS][i], randInt(4));
        }
        /*
          Redraw on movement
        */
        draw();
    };
    canvas.onclick = e => {
        const x = e.offsetX / canvas.width;
        const y = e.offsetY / canvas.height;
        const tileX = Math.floor(x * viewSize[X]);
        const tileY = Math.floor(y * viewSize[Y]);
        const vertical = tileY < viewOff[Y] ? DIRECTION_UP : tileY > viewOff[Y] ? DIRECTION_DOWN : DIRECTION_NONE;
        const horizontal = tileX < viewOff[X] ? DIRECTION_LEFT : tileX > viewOff[X] ? DIRECTION_RIGHT : DIRECTION_NONE;
        let direction = DIRECTION_NONE;
        const distanceX = Math.abs(tileX - viewOff[X]);
        const distanceY = Math.abs(tileY - viewOff[Y]);
        if (horizontal !== DIRECTION_NONE && vertical === DIRECTION_NONE) {
            direction = horizontal;
        }
        else if (vertical !== DIRECTION_NONE && horizontal === DIRECTION_NONE) {
            direction = vertical;
        }
        else {
            if (distanceX > distanceY) {
                direction = horizontal;
            }
            else if (distanceY > distanceX) {
                direction = vertical;
            }
        }
        const dir = ['left', 'up', 'right', 'down'][direction] || 'none';
        playerMove(direction);
    };
    b.onkeydown = e => {
        playerMove(e.which - 37);
    };
    /*
      Generate first level, draw initial view
    */
    NewLevel();
    draw();
};

},{"canvas-console":3}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spriteSize = {
    width: 8,
    height: 16
};
exports.viewSize = {
    width: 80,
    height: 25
};
exports.palette = [
    [0, 0, 0, 255],
    [0, 0, 170, 255],
    [0, 170, 0, 255],
    [0, 170, 170, 255],
    [170, 0, 0, 255],
    [170, 0, 170, 255],
    [170, 85, 0, 255],
    [170, 170, 170, 255],
    [85, 85, 85, 255],
    [85, 85, 255, 255],
    [85, 255, 85, 255],
    [85, 255, 255, 255],
    [255, 85, 85, 255],
    [255, 85, 255, 255],
    [255, 255, 85, 255],
    [255, 255, 255, 255]
];
exports.spriteSource = `data:image/png;base64,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`;
exports.useCleanScaling = true;

},{}],3:[function(require,module,exports){
"use strict";
const default_options_1 = require("./default-options");
const geometry_1 = require("./lib/geometry");
const image_1 = require("./lib/image");
const image_data_1 = require("./lib/image-data");
const predicates_1 = require("./lib/predicates");
const defaultOptions = {
    spriteSize: default_options_1.spriteSize, viewSize: default_options_1.viewSize, palette: default_options_1.palette, spriteSource: default_options_1.spriteSource, useCleanScaling: default_options_1.useCleanScaling
};
const displayCanvasStyle = {
    display: 'block',
    margin: 'auto'
};
const CanvasConsole = async (container, options) => {
    const settings = Object.assign(defaultOptions, options);
    const { spriteSize, viewSize, palette, spriteSource, useCleanScaling } = settings;
    const unscaledSize = {
        width: spriteSize.width * viewSize.width,
        height: spriteSize.height * viewSize.height
    };
    const displayCanvas = document.createElement('canvas');
    const c = displayCanvas.getContext('2d');
    const buffer = c.createImageData(unscaledSize.width, unscaledSize.height);
    Object.assign(displayCanvas.style, displayCanvasStyle);
    const sprites = await image_1.loadSprites(spriteSource, spriteSize);
    let scaledBuffer;
    const blit = () => {
        image_data_1.nearestNeighbourCopy(buffer, scaledBuffer);
        c.putImageData(scaledBuffer, 0, 0);
        requestAnimationFrame(blit);
    };
    const onResize = () => {
        const parentSize = geometry_1.ElementInnerSize(container);
        let scale = geometry_1.scaleRectInRect(parentSize, unscaledSize);
        if (useCleanScaling)
            scale = (scale > 1 ? Math.floor(scale) : scale);
        const scaledSize = geometry_1.scaleSize(unscaledSize, scale);
        Object.assign(displayCanvas, scaledSize);
        displayCanvas.style.marginTop =
            geometry_1.center(parentSize.height, scaledSize.height) + 'px';
        scaledBuffer = c.createImageData(scaledSize.width, scaledSize.height);
    };
    const putChar = (ch, column, row, fore = 7, back = 0) => {
        const { width, height } = spriteSize;
        const spriteIndex = predicates_1.isNumber(ch) ? ch : ch.charCodeAt(0);
        const sprite = sprites[spriteIndex];
        const x = column * width;
        const y = row * height;
        fore = predicates_1.isNumber(fore) ? palette[fore] : fore;
        back = predicates_1.isNumber(back) ? palette[back] : back;
        image_data_1.drawColored(sprite, buffer, x, y, fore, back);
    };
    container.appendChild(displayCanvas);
    window.addEventListener('resize', onResize);
    onResize();
    blit();
    return {
        putChar,
        get width() { return viewSize.width; },
        get height() { return viewSize.height; }
    };
};
module.exports = CanvasConsole;

},{"./default-options":2,"./lib/geometry":5,"./lib/image":7,"./lib/image-data":6,"./lib/predicates":8}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
  Only checks the red channel of sourceColor, assumes background if 0 or
  foreground if anything else.
*/
exports.recolorTwoBit = (sourceColor, fore, back) => sourceColor[0] ? fore : back;

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scaleRectInRect = (parentSize, childSize) => Math.min(parentSize.width / childSize.width, parentSize.height / childSize.height);
exports.scaleSize = (size, scale) => {
    return {
        width: size.width * scale,
        height: size.height * scale
    };
};
exports.center = (parent, child) => (parent - child) / 2;
exports.ElementInnerSize = (el) => {
    const boundingRect = el.getBoundingClientRect();
    const styles = window.getComputedStyle(el);
    const width = boundingRect.width - parseFloat(styles.paddingLeft) -
        parseFloat(styles.paddingRight);
    const height = boundingRect.height - parseFloat(styles.paddingTop) -
        parseFloat(styles.paddingBottom);
    return { width, height };
};

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("./color");
exports.getIndex = (image, x, y) => (y * image.width + x) * 4;
exports.getColor = (image, x, y) => {
    const i = exports.getIndex(image, x, y);
    const r = image.data[i];
    const g = image.data[i + 1];
    const b = image.data[i + 2];
    const a = image.data[i + 3];
    return [r, g, b, a];
};
exports.putColor = (image, color, x, y) => {
    const i = exports.getIndex(image, x, y);
    image.data[i] = color[0];
    image.data[i + 1] = color[1];
    image.data[i + 2] = color[2];
    image.data[i + 3] = color[3];
};
exports.nearestNeighbourCopy = (source, target) => {
    const fX = source.width / target.width;
    const fY = source.height / target.height;
    for (let y = 0; y < target.height; y++) {
        for (let x = 0; x < target.width; x++) {
            const sX = Math.floor(x * fX);
            const sY = Math.floor(y * fY);
            const sourceColor = exports.getColor(source, sX, sY);
            exports.putColor(target, sourceColor, x, y);
        }
    }
};
exports.drawMapped = (source, target, tX, tY, mapper) => {
    const { width, height } = source;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const sourceColor = exports.getColor(source, x, y);
            const targetColor = mapper(sourceColor);
            exports.putColor(target, targetColor, x + tX, y + tY);
        }
    }
};
exports.drawColored = (source, target, tX, tY, fore, back) => {
    const mapper = (sourceColor) => color_1.recolorTwoBit(sourceColor, fore, back);
    exports.drawMapped(source, target, tX, tY, mapper);
};

},{"./color":4}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSprites = (img, spriteSize) => {
    const { width, height } = spriteSize;
    const canvas = document.createElement('canvas');
    const c = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    c.drawImage(img, 0, 0);
    const sprites = [];
    for (let y = 0; y < img.height; y += height) {
        for (let x = 0; x < img.width; x += width) {
            const sprite = c.getImageData(x, y, width, height);
            sprites.push(sprite);
        }
    }
    return sprites;
};
exports.loadImage = async (uri) => new Promise((resolve, reject) => {
    try {
        const image = new Image();
        image.addEventListener('load', () => {
            resolve(image);
        });
        image.src = uri;
    }
    catch (err) {
        reject(err);
    }
});
exports.loadSprites = async (uri, spriteSize) => {
    const spriteSheet = await exports.loadImage(uri);
    return exports.getSprites(spriteSheet, spriteSize);
};

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNumber = (value) => typeof value === 'number';
exports.isString = (value) => typeof value === 'string';
exports.isBoolean = (value) => typeof value === 'boolean';
exports.isSize = (value) => value && exports.isNumber(value.width) && exports.isNumber(value.height);
exports.isRgba = (value) => Array.isArray(value) && value.length === 4 && value.every(exports.isNumber);
exports.isPalette = (value) => Array.isArray(value) && value.every(exports.isRgba);
exports.isSettings = (value) => value && exports.isSize(value.spriteSize) && exports.isSize(value.viewSize) &&
    exports.isPalette(value.palette) && exports.isString(value.spriteSource) &&
    exports.isBoolean(value.useCleanScaling);

},{}]},{},[1]);
