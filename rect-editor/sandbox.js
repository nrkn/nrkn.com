(function () {
    'use strict';

    const svgNs = 'http://www.w3.org/2000/svg';

    const isNode = (value) => value && typeof value['nodeType'] === 'number';
    const isElement = (value) => value && value['nodeType'] === 1;
    const isSVGElement = (value) => isElement(value) && value.namespaceURI === svgNs;

    const attr = (el, ...attributeRecords) => {
        attributeRecords.forEach(attributes => {
            Object.keys(attributes).forEach(key => {
                const value = String(attributes[key]);
                el.setAttribute(key, value);
            });
        });
    };
    const strictSelect = (selectors, el = document) => {
        const result = el.querySelector(selectors);
        if (result === null)
            throw Error(`Expected ${selectors} to match something`);
        return result;
    };
    const strictFormRadioNodes = (formEl, name) => {
        const el = formEl.elements.namedItem(name);
        if (el instanceof RadioNodeList)
            return el;
        throw Error(`Expected a RadioNodeList called ${name}`);
    };
    const clone = (obj) => JSON.parse(JSON.stringify(obj));
    const getRectElRect = (rectEl) => {
        const { x: ex, y: ey, width: ew, height: eh } = rectEl;
        const x = ex.baseVal.value;
        const y = ey.baseVal.value;
        const width = ew.baseVal.value;
        const height = eh.baseVal.value;
        const rect = { x, y, width, height };
        return rect;
    };

    const h = (name, ...args) => {
        const el = document.createElement(name);
        args.forEach(arg => {
            if (isNode(arg) || typeof arg === 'string') {
                el.append(arg);
            }
            else {
                attr(el, arg);
            }
        });
        return el;
    };
    const htmlElementFactory = (name) => (...args) => h(name, ...args);
    const div = htmlElementFactory('div');
    const fieldset = htmlElementFactory('fieldset');
    const legend = htmlElementFactory('legend');
    const label = htmlElementFactory('label');
    const input = htmlElementFactory('input');
    const button = htmlElementFactory('button');
    const form = htmlElementFactory('form');
    const select = htmlElementFactory('select');
    const option = htmlElementFactory('option');
    const header = htmlElementFactory('header');
    const footer = htmlElementFactory('footer');
    const main = htmlElementFactory('main');
    const section = htmlElementFactory('section');
    const p = htmlElementFactory('p');

    const createAppEls = () => {
        const appEl = div({ id: 'app' }, header('Rect Editor'), main(section({ id: 'tools' }), section({ id: 'viewport' }), section({ id: 'layers' })), footer(p('© 2020 Nik Coughlin')));
        return appEl;
    };

    const s = (name, ...args) => {
        const el = document.createElementNS(svgNs, name);
        args.forEach(arg => {
            if (isSVGElement(arg) || isElement(arg) || typeof arg === 'string') {
                el.append(arg);
            }
            else {
                attr(el, arg);
            }
        });
        return el;
    };
    const svgElementFactory = (name) => (...args) => s(name, ...args);
    const svg = svgElementFactory('svg');
    const g = svgElementFactory('g');
    const rect = svgElementFactory('rect');
    const defs = svgElementFactory('defs');
    const pattern = svgElementFactory('pattern');
    const line = svgElementFactory('line');

    const createGridPattern = () => pattern({ id: 'gridPattern', patternUnits: "userSpaceOnUse" }, rect({ fill: '#ddd' }), line({ stroke: '#39f' }), line({ stroke: '#39f' }));
    const updateGridPattern = ({ width, height }, gridPatternEl = strictSelect('#gridPattern')) => {
        const bgRectEl = strictSelect('rect', gridPatternEl);
        const [vertLineEl, horizLineEl] = gridPatternEl.querySelectorAll('line');
        const bgRect = { x: 0, y: 0, width, height };
        const vertLine = { x1: 0, y1: 0, x2: 0, y2: height };
        const horizLine = { x1: 0, y1: 0, x2: width, y2: 0 };
        attr(gridPatternEl, bgRect);
        attr(bgRectEl, bgRect);
        attr(vertLineEl, vertLine);
        attr(horizLineEl, horizLine);
    };

    const createDocumentEl = () => {
        const svgEl = svg({ id: 'document' }, defs(createGridPattern()), g({ id: 'body' }, rect({ id: 'grid', fill: 'url(#gridPattern)' }), g({ id: 'rects' })));
        return svgEl;
    };

    const createInfoLabel = (caption, id = caption) => label(`${caption} `, input({
        id,
        readonly: 'readonly'
    }));

    const createClickEl = () => {
        const fieldsetEl = fieldset({ id: 'click' }, legend('Last Click'), createInfoLabel('name', 'clickName'), createInfoLabel('x', 'clickX'), createInfoLabel('y', 'clickY'));
        return fieldsetEl;
    };

    const createDeltaEl = () => {
        const fieldsetEl = fieldset({ id: 'delta' }, legend('Delta'), createInfoLabel('name', 'deltaName'), createInfoLabel('dx'), createInfoLabel('dy'));
        return fieldsetEl;
    };

    const createPositionEl = () => {
        const fieldsetEl = fieldset({ id: 'position' }, legend('Cursor Position'), createInfoLabel('x', 'positionX'), createInfoLabel('y', 'positionY'));
        return fieldsetEl;
    };

    const translatePoint = ({ x: x1, y: y1 }, { x: x2, y: y2 }) => ({
        x: x1 + x2,
        y: y1 + y2
    });
    const scalePoint = ({ x, y }, scale) => ({
        x: x * scale,
        y: y * scale
    });
    const deltaPoint = ({ x: x1, y: y1 }, { x: x2, y: y2 }) => ({
        x: x1 - x2,
        y: y1 - y2
    });

    const scaleRect = ({ x, y, width, height }, { x: sx, y: sy }) => {
        x *= sx;
        y *= sy;
        width *= sx;
        height *= sy;
        const scaled = { x, y, width, height };
        return scaled;
    };
    const rectToSidesRect = ({ x, y, width, height }) => {
        const left = x;
        const top = y;
        const right = x + width;
        const bottom = y + height;
        return { top, right, bottom, left };
    };
    const sidesRectToRect = ({ top, right, bottom, left }) => {
        const x = left;
        const y = top;
        const width = right - left;
        const height = bottom - top;
        return { x, y, width, height };
    };
    const translateRect = (rect, delta) => {
        const p = translatePoint(rect, delta);
        return Object.assign({}, rect, p);
    };
    const growSidesRectByDelta = (sidesRect, delta, origin) => {
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
    const scaleRectFromBounds = (rect, fromBounds, toBounds) => {
        rect = clone(rect);
        const x = toBounds.width / fromBounds.width;
        const y = toBounds.height / fromBounds.height;
        const scale = { x, y };
        const negativeTranslate = scalePoint(fromBounds, -1);
        const delta = deltaPoint(toBounds, fromBounds);
        Object.assign(rect, translateRect(rect, negativeTranslate));
        Object.assign(rect, scaleRect(rect, scale));
        Object.assign(rect, translateRect(rect, fromBounds));
        Object.assign(rect, translateRect(rect, delta));
        return rect;
    };
    const flipRectInBounds = (rect, bounds, flipX, flipY) => {
        rect = clone(rect);
        const negativeTranslate = scalePoint(bounds, -1);
        Object.assign(rect, translateRect(rect, negativeTranslate));
        let { x, y, width, height } = rect;
        if (flipX) {
            x = bounds.width - x - width;
        }
        if (flipY) {
            y = bounds.height - y - height;
        }
        Object.assign(rect, { x, y, width, height });
        Object.assign(rect, translateRect(rect, bounds));
        return rect;
    };

    const createInfoSelectionEl = () => {
        const fieldsetEl = fieldset({ id: 'selection' }, legend('Selection'), createInfoLabel('x', 'selectionX'), createInfoLabel('y', 'selectionY'), createInfoLabel('w', 'selectionW'), createInfoLabel('h', 'selectionH'));
        return fieldsetEl;
    };

    const createInfo = () => {
        const infoEl = div({ id: 'info' }, createPositionEl(), createClickEl(), createDeltaEl(), createInfoSelectionEl());
        return infoEl;
    };

    const appModes = ['pan', 'draw', 'select'];
    // TODO - options
    const minScale = 0.9;

    const createSequence = (length, cb) => Array.from({ length }, (_v, index) => cb(index));
    const strictMapGet = (map, key) => {
        const existing = map.get(key);
        if (existing === undefined)
            throw Error(`Expected key ${key}`);
        return existing;
    };
    const assertUnique = (map, key) => {
        if (map.has(key))
            throw Error(`Duplicate key ${key}`);
    };
    const clone$1 = (value) => JSON.parse(JSON.stringify(value));

    const defaultOpacity = 0.75;
    const numHues = 25;
    const deg = 360 / numHues;
    const createStyles = () => {
        const stylesEl = fieldset({ id: 'styles' }, legend('Styles'), createFillStyle(`rgba(255,255,255,${defaultOpacity})`, true), createFillStyle(`rgba(191,191,191,${defaultOpacity})`), createFillStyle(`rgba(127,127,127,${defaultOpacity})`), createFillStyle(`rgba(63,63,63,${defaultOpacity})`), createFillStyle(`rgba(0,0,0,${defaultOpacity})`), ...hslas.map(s => createFillStyle(s)));
        return stylesEl;
    };
    const degs = createSequence(numHues, i => `${Math.floor(i * deg)}deg`);
    const hslas = degs.map(deg => `hsla(${deg},100%,50%,${defaultOpacity})`);
    const createFillStyle = (color, checked = false) => {
        const radioEl = input({
            type: 'radio',
            name: 'fill',
            value: `color ${color}`
        });
        if (checked) {
            attr(radioEl, { checked: '' });
        }
        const labelEl = label({ class: 'style-radio-label', style: `background: ${color}` }, radioEl);
        return labelEl;
    };

    const createToolsEls = () => {
        const toolsFormEl = form(div({ id: 'actionButtons' }, button({ id: 'undo', type: 'button' }, 'Undo'), button({ id: 'redo', type: 'button' }, 'Redo'), button({ id: 'reset-zoom', type: 'button' }, 'Reset Zoom')), fieldset({ id: 'pointerMode' }, legend('Pointer Mode'), ...appModes.map(value => label(input({ type: 'radio', name: 'mode', value }), value))), fieldset({ id: 'snapToGrid' }, legend('Snap to Grid'), label('Width', input({ id: 'snap-width', type: 'number', min: 1, step: 1 })), label('Height', input({ id: 'snap-height', type: 'number', min: 1, step: 1 }))), createStyles());
        return toolsFormEl;
    };

    const LEFT = 'left';
    const RIGHT = 'right';
    const TOP = 'top';
    const BOTTOM = 'bottom';
    const XCENTER = 'xCenter';
    const YCENTER = 'yCenter';
    const xPositionNames = [LEFT, XCENTER, RIGHT];
    const yPositionNames = [TOP, YCENTER, BOTTOM];

    const transformRelativeTo = (existing, newScale, origin) => {
        const { scale } = existing;
        let newPoint = translatePoint(existing, scalePoint(origin, -1));
        newPoint = scalePoint(newPoint, newScale / scale);
        newPoint = translatePoint(newPoint, origin);
        const transformed = Object.assign(newPoint, { scale: newScale });
        return transformed;
    };
    const zoomAt = (transform, { scale, x, y }, minScale) => {
        if (scale < minScale)
            scale = minScale;
        const newTransform = transformRelativeTo(transform, scale, { x, y });
        return Object.assign({}, transform, newTransform);
    };

    const getAllRects = () => {
        const rectsEl = strictSelect('#rects');
        const rectEls = [...rectsEl.querySelectorAll('rect')].filter(el => {
            if (el.id === '') {
                console.warn('<rect> in rects has no ID', el);
                return false;
            }
            return true;
        });
        return rectEls;
    };
    const getRectEls = (ids, parent) => ids.map(id => strictSelect(`#${id}`, parent));
    const getAppRects = (ids, parent) => {
        const rectEls = getRectEls(ids, parent);
        const appRects = rectEls.map(el => {
            const style = el.dataset.style || 'none';
            const { id } = el;
            const rect = getRectElRect(el);
            const appRect = Object.assign({ id, 'data-style': style }, rect);
            return appRect;
        });
        return appRects;
    };

    const handleSnapGrid = () => {
        const snapWidthEl = strictSelect('#snap-width');
        const snapHeightEl = strictSelect('#snap-width');
        const onChange = () => {
            const width = snapWidthEl.valueAsNumber;
            const height = snapHeightEl.valueAsNumber;
            updateGridPattern({ width, height });
        };
        snapWidthEl.addEventListener('change', onChange);
        snapHeightEl.addEventListener('change', onChange);
    };

    const handleViewportResize = (state) => {
        const viewportEl = strictSelect('#viewport');
        document.body.addEventListener('resize', () => {
            const { width, height } = viewportEl.getBoundingClientRect();
            state.viewSize({ width, height });
        });
        document.body.dispatchEvent(new Event('resize'));
    };

    const handleResetZoom = (state) => {
        const buttonEl = strictSelect('#reset-zoom');
        buttonEl.addEventListener('click', e => {
            e.preventDefault();
            state.zoomToFit();
        });
    };
    const handleUndo = (state) => {
        const buttonEl = strictSelect('#undo');
        buttonEl.addEventListener('click', e => {
            e.preventDefault();
            state.rects.undo();
        });
    };
    const handleRedo = (state) => {
        const buttonEl = strictSelect('#redo');
        buttonEl.addEventListener('click', e => {
            e.preventDefault();
            state.rects.redo();
        });
    };

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    		path: basedir,
    		exports: {},
    		require: function (path, base) {
    			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    		}
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var is = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    const isEmptyObject = (obj) => {
        for (const key in obj)
            return false;
        return true;
    };
    const isNumber = (subject) => typeof subject === 'number' && isFinite(subject);
    const isInteger = (subject) => Number.isInteger(subject);
    const isString = (subject) => typeof subject === 'string';
    const isBoolean = (subject) => typeof subject === 'boolean';
    const isArray = (subject) => Array.isArray(subject);
    const isNull = (subject) => subject === null;
    const isUndefined = (subject) => subject === undefined;
    const isFunction = (subject) => typeof subject === 'function';
    // I think you can exclude array, null etc with Diff<T, U> in TS 2.8, look into
    const isObject = (subject) => typeof subject === 'object' && !isNull(subject) && !isArray(subject);
    const isEmpty = (subject) => isObject(subject) && isEmptyObject(subject);
    exports.is = {
        number: isNumber,
        integer: isInteger,
        string: isString,
        boolean: isBoolean,
        array: isArray,
        null: isNull,
        undefined: isUndefined,
        function: isFunction,
        object: isObject,
        empty: isEmpty
    };

    });

    /*
      We add the custom predicates twice - first time, so that their key order is
      retained, then we add the defaults, then we add the custom predicates again
      in case any of them are supposed to override a default predicate
    */
    const extendDefaults = (predicates) => Object.assign({}, predicates, is.is, predicates);
    const Utils = (predicates) => {
        const keys = Object.keys(predicates);
        const isType = (subject, typename) => predicates[typename] && predicates[typename](subject);
        const isOnly = (subject, typename) => isType(subject, typename) && allOf(subject).length === 1;
        const some = (subject, ...typenames) => typenames.some(typename => isType(subject, typename));
        const every = (subject, ...typenames) => typenames.every(typename => isType(subject, typename));
        const _of = (subject) => keys.find(key => isType(subject, key));
        const allOf = (subject) => keys.filter(key => isType(subject, key));
        const types = () => keys.slice();
        return { isType, isOnly, some, every, of: _of, allOf, types };
    };
    const utils = Utils(is.is);
    const Is = { is: is.is, extendDefaults, utils, Utils };
    var dist = Is;

    var SymbolTreeNode_1 = class SymbolTreeNode {
            constructor() {
                    this.parent = null;
                    this.previousSibling = null;
                    this.nextSibling = null;

                    this.firstChild = null;
                    this.lastChild = null;

                    /** This value is incremented anytime a children is added or removed */
                    this.childrenVersion = 0;
                    /** The last child object which has a cached index */
                    this.childIndexCachedUpTo = null;

                    /** This value represents the cached node index, as long as
                     * cachedIndexVersion matches with the childrenVersion of the parent */
                    this.cachedIndex = -1;
                    this.cachedIndexVersion = NaN; // NaN is never equal to anything
            }

            get isAttached() {
                    return Boolean(this.parent || this.previousSibling || this.nextSibling);
            }

            get hasChildren() {
                    return Boolean(this.firstChild);
            }

            childrenChanged() {
                    /* jshint -W016 */
                    // integer wrap around
                    this.childrenVersion = (this.childrenVersion + 1) & 0xFFFFFFFF;
                    this.childIndexCachedUpTo = null;
            }

            getCachedIndex(parentNode) {
                    // (assumes parentNode is actually the parent)
                    if (this.cachedIndexVersion !== parentNode.childrenVersion) {
                            this.cachedIndexVersion = NaN;
                            // cachedIndex is no longer valid
                            return -1;
                    }

                    return this.cachedIndex; // -1 if not cached
            }

            setCachedIndex(parentNode, index) {
                    // (assumes parentNode is actually the parent)
                    this.cachedIndexVersion = parentNode.childrenVersion;
                    this.cachedIndex = index;
            }
    };

    /* eslint-disable sort-keys */
    var TreePosition = Object.freeze({
            // same as DOM DOCUMENT_POSITION_
            DISCONNECTED: 1,
            PRECEDING: 2,
            FOLLOWING: 4,
            CONTAINS: 8,
            CONTAINED_BY: 16,
    });

    const TREE = Symbol();
    const ROOT = Symbol();
    const NEXT = Symbol();
    const ITERATE_FUNC = Symbol();

    class TreeIterator {
            constructor(tree, root, firstResult, iterateFunction) {
                    this[TREE] = tree;
                    this[ROOT] = root;
                    this[NEXT] = firstResult;
                    this[ITERATE_FUNC] = iterateFunction;
            }

            next() {
                    const tree = this[TREE];
                    const iterateFunc = this[ITERATE_FUNC];
                    const root = this[ROOT];

                    if (!this[NEXT]) {
                            return {
                                    done: true,
                                    value: root,
                            };
                    }

                    const value = this[NEXT];

                    if (iterateFunc === 1) {
                            this[NEXT] = tree._node(value).previousSibling;
                    }
                    else if (iterateFunc === 2) {
                            this[NEXT] = tree._node(value).nextSibling;
                    }
                    else if (iterateFunc === 3) {
                            this[NEXT] = tree._node(value).parent;
                    }
                    else if (iterateFunc === 4) {
                            this[NEXT] = tree.preceding(value, {root: root});
                    }
                    else /* if (iterateFunc === 5)*/ {
                            this[NEXT] = tree.following(value, {root: root});
                    }

                    return {
                            done: false,
                            value: value,
                    };
            }
    }

    Object.defineProperty(TreeIterator.prototype, Symbol.iterator, {
            value: function() {
                    return this;
            },
            writable: false,
    });

    TreeIterator.PREV = 1;
    TreeIterator.NEXT = 2;
    TreeIterator.PARENT = 3;
    TreeIterator.PRECEDING = 4;
    TreeIterator.FOLLOWING = 5;

    Object.freeze(TreeIterator);
    Object.freeze(TreeIterator.prototype);

    var TreeIterator_1 = TreeIterator;

    /**
     * @module symbol-tree
     * @author Joris van der Wel <joris@jorisvanderwel.com>
     */





    function returnTrue() {
            return true;
    }

    function reverseArrayIndex(array, reverseIndex) {
            return array[array.length - 1 - reverseIndex]; // no need to check `index >= 0`
    }

    class SymbolTree {

            /**
             * @constructor
             * @alias module:symbol-tree
             * @param {string} [description='SymbolTree data'] Description used for the Symbol
             */
            constructor(description) {
                    this.symbol = Symbol(description || 'SymbolTree data');
            }

            /**
             * You can use this function to (optionally) initialize an object right after its creation,
             * to take advantage of V8's fast properties. Also useful if you would like to
             * freeze your object.
             *
             * `O(1)`
             *
             * @method
             * @alias module:symbol-tree#initialize
             * @param {Object} object
             * @return {Object} object
             */
            initialize(object) {
                    this._node(object);

                    return object;
            }

            _node(object) {
                    if (!object) {
                            return null;
                    }

                    const node = object[this.symbol];

                    if (node) {
                            return node;
                    }

                    return (object[this.symbol] = new SymbolTreeNode_1());
            }

            /**
             * Returns `true` if the object has any children. Otherwise it returns `false`.
             *
             * * `O(1)`
             *
             * @method hasChildren
             * @memberOf module:symbol-tree#
             * @param {Object} object
             * @return {Boolean}
             */
            hasChildren(object) {
                    return this._node(object).hasChildren;
            }

            /**
             * Returns the first child of the given object.
             *
             * * `O(1)`
             *
             * @method firstChild
             * @memberOf module:symbol-tree#
             * @param {Object} object
             * @return {Object}
             */
            firstChild(object) {
                    return this._node(object).firstChild;
            }

            /**
             * Returns the last child of the given object.
             *
             * * `O(1)`
             *
             * @method lastChild
             * @memberOf module:symbol-tree#
             * @param {Object} object
             * @return {Object}
             */
            lastChild(object) {
                    return this._node(object).lastChild;
            }

            /**
             * Returns the previous sibling of the given object.
             *
             * * `O(1)`
             *
             * @method previousSibling
             * @memberOf module:symbol-tree#
             * @param {Object} object
             * @return {Object}
             */
            previousSibling(object) {
                    return this._node(object).previousSibling;
            }

            /**
             * Returns the next sibling of the given object.
             *
             * * `O(1)`
             *
             * @method nextSibling
             * @memberOf module:symbol-tree#
             * @param {Object} object
             * @return {Object}
             */
            nextSibling(object) {
                    return this._node(object).nextSibling;
            }

            /**
             * Return the parent of the given object.
             *
             * * `O(1)`
             *
             * @method parent
             * @memberOf module:symbol-tree#
             * @param {Object} object
             * @return {Object}
             */
            parent(object) {
                    return this._node(object).parent;
            }

            /**
             * Find the inclusive descendant that is last in tree order of the given object.
             *
             * * `O(n)` (worst case) where `n` is the depth of the subtree of `object`
             *
             * @method lastInclusiveDescendant
             * @memberOf module:symbol-tree#
             * @param {Object} object
             * @return {Object}
             */
            lastInclusiveDescendant(object) {
                    let lastChild;
                    let current = object;

                    while ((lastChild = this._node(current).lastChild)) {
                            current = lastChild;
                    }

                    return current;
            }

            /**
             * Find the preceding object (A) of the given object (B).
             * An object A is preceding an object B if A and B are in the same tree
             * and A comes before B in tree order.
             *
             * * `O(n)` (worst case)
             * * `O(1)` (amortized when walking the entire tree)
             *
             * @method preceding
             * @memberOf module:symbol-tree#
             * @param {Object} object
             * @param {Object} [options]
             * @param {Object} [options.root] If set, `root` must be an inclusive ancestor
             *        of the return value (or else null is returned). This check _assumes_
             *        that `root` is also an inclusive ancestor of the given `object`
             * @return {?Object}
             */
            preceding(object, options) {
                    const treeRoot = options && options.root;

                    if (object === treeRoot) {
                            return null;
                    }

                    const previousSibling = this._node(object).previousSibling;

                    if (previousSibling) {
                            return this.lastInclusiveDescendant(previousSibling);
                    }

                    // if there is no previous sibling return the parent (might be null)
                    return this._node(object).parent;
            }

            /**
             * Find the following object (A) of the given object (B).
             * An object A is following an object B if A and B are in the same tree
             * and A comes after B in tree order.
             *
             * * `O(n)` (worst case) where `n` is the amount of objects in the entire tree
             * * `O(1)` (amortized when walking the entire tree)
             *
             * @method following
             * @memberOf module:symbol-tree#
             * @param {!Object} object
             * @param {Object} [options]
             * @param {Object} [options.root] If set, `root` must be an inclusive ancestor
             *        of the return value (or else null is returned). This check _assumes_
             *        that `root` is also an inclusive ancestor of the given `object`
             * @param {Boolean} [options.skipChildren=false] If set, ignore the children of `object`
             * @return {?Object}
             */
            following(object, options) {
                    const treeRoot = options && options.root;
                    const skipChildren = options && options.skipChildren;

                    const firstChild = !skipChildren && this._node(object).firstChild;

                    if (firstChild) {
                            return firstChild;
                    }

                    let current = object;

                    do {
                            if (current === treeRoot) {
                                    return null;
                            }

                            const nextSibling = this._node(current).nextSibling;

                            if (nextSibling) {
                                    return nextSibling;
                            }

                            current = this._node(current).parent;
                    } while (current);

                    return null;
            }

            /**
             * Append all children of the given object to an array.
             *
             * * `O(n)` where `n` is the amount of children of the given `parent`
             *
             * @method childrenToArray
             * @memberOf module:symbol-tree#
             * @param {Object} parent
             * @param {Object} [options]
             * @param {Object[]} [options.array=[]]
             * @param {Function} [options.filter] Function to test each object before it is added to the array.
             *                            Invoked with arguments (object). Should return `true` if an object
             *                            is to be included.
             * @param {*} [options.thisArg] Value to use as `this` when executing `filter`.
             * @return {Object[]}
             */
            childrenToArray(parent, options) {
                    const array   = (options && options.array) || [];
                    const filter  = (options && options.filter) || returnTrue;
                    const thisArg = (options && options.thisArg) || undefined;

                    const parentNode = this._node(parent);
                    let object = parentNode.firstChild;
                    let index = 0;

                    while (object) {
                            const node = this._node(object);
                            node.setCachedIndex(parentNode, index);

                            if (filter.call(thisArg, object)) {
                                    array.push(object);
                            }

                            object = node.nextSibling;
                            ++index;
                    }

                    return array;
            }

            /**
             * Append all inclusive ancestors of the given object to an array.
             *
             * * `O(n)` where `n` is the amount of ancestors of the given `object`
             *
             * @method ancestorsToArray
             * @memberOf module:symbol-tree#
             * @param {Object} object
             * @param {Object} [options]
             * @param {Object[]} [options.array=[]]
             * @param {Function} [options.filter] Function to test each object before it is added to the array.
             *                            Invoked with arguments (object). Should return `true` if an object
             *                            is to be included.
             * @param {*} [options.thisArg] Value to use as `this` when executing `filter`.
             * @return {Object[]}
             */
            ancestorsToArray(object, options) {
                    const array   = (options && options.array) || [];
                    const filter  = (options && options.filter) || returnTrue;
                    const thisArg = (options && options.thisArg) || undefined;

                    let ancestor = object;

                    while (ancestor) {
                            if (filter.call(thisArg, ancestor)) {
                                    array.push(ancestor);
                            }
                            ancestor = this._node(ancestor).parent;
                    }

                    return array;
            }

            /**
             * Append all descendants of the given object to an array (in tree order).
             *
             * * `O(n)` where `n` is the amount of objects in the sub-tree of the given `object`
             *
             * @method treeToArray
             * @memberOf module:symbol-tree#
             * @param {Object} root
             * @param {Object} [options]
             * @param {Object[]} [options.array=[]]
             * @param {Function} [options.filter] Function to test each object before it is added to the array.
             *                            Invoked with arguments (object). Should return `true` if an object
             *                            is to be included.
             * @param {*} [options.thisArg] Value to use as `this` when executing `filter`.
             * @return {Object[]}
             */
            treeToArray(root, options) {
                    const array   = (options && options.array) || [];
                    const filter  = (options && options.filter) || returnTrue;
                    const thisArg = (options && options.thisArg) || undefined;

                    let object = root;

                    while (object) {
                            if (filter.call(thisArg, object)) {
                                    array.push(object);
                            }
                            object = this.following(object, {root: root});
                    }

                    return array;
            }

            /**
             * Iterate over all children of the given object
             *
             * * `O(1)` for a single iteration
             *
             * @method childrenIterator
             * @memberOf module:symbol-tree#
             * @param {Object} parent
             * @param {Object} [options]
             * @param {Boolean} [options.reverse=false]
             * @return {Object} An iterable iterator (ES6)
             */
            childrenIterator(parent, options) {
                    const reverse = options && options.reverse;
                    const parentNode = this._node(parent);

                    return new TreeIterator_1(
                            this,
                            parent,
                            reverse ? parentNode.lastChild : parentNode.firstChild,
                            reverse ? TreeIterator_1.PREV : TreeIterator_1.NEXT
                    );
            }

            /**
             * Iterate over all the previous siblings of the given object. (in reverse tree order)
             *
             * * `O(1)` for a single iteration
             *
             * @method previousSiblingsIterator
             * @memberOf module:symbol-tree#
             * @param {Object} object
             * @return {Object} An iterable iterator (ES6)
             */
            previousSiblingsIterator(object) {
                    return new TreeIterator_1(
                            this,
                            object,
                            this._node(object).previousSibling,
                            TreeIterator_1.PREV
                    );
            }

            /**
             * Iterate over all the next siblings of the given object. (in tree order)
             *
             * * `O(1)` for a single iteration
             *
             * @method nextSiblingsIterator
             * @memberOf module:symbol-tree#
             * @param {Object} object
             * @return {Object} An iterable iterator (ES6)
             */
            nextSiblingsIterator(object) {
                    return new TreeIterator_1(
                            this,
                            object,
                            this._node(object).nextSibling,
                            TreeIterator_1.NEXT
                    );
            }

            /**
             * Iterate over all inclusive ancestors of the given object
             *
             * * `O(1)` for a single iteration
             *
             * @method ancestorsIterator
             * @memberOf module:symbol-tree#
             * @param {Object} object
             * @return {Object} An iterable iterator (ES6)
             */
            ancestorsIterator(object) {
                    return new TreeIterator_1(
                            this,
                            object,
                            object,
                            TreeIterator_1.PARENT
                    );
            }

            /**
             * Iterate over all descendants of the given object (in tree order).
             *
             * Where `n` is the amount of objects in the sub-tree of the given `root`:
             *
             * * `O(n)` (worst case for a single iteration)
             * * `O(n)` (amortized, when completing the iterator)
             *
             * @method treeIterator
             * @memberOf module:symbol-tree#
             * @param {Object} root
             * @param {Object} options
             * @param {Boolean} [options.reverse=false]
             * @return {Object} An iterable iterator (ES6)
             */
            treeIterator(root, options) {
                    const reverse = options && options.reverse;

                    return new TreeIterator_1(
                            this,
                            root,
                            reverse ? this.lastInclusiveDescendant(root) : root,
                            reverse ? TreeIterator_1.PRECEDING : TreeIterator_1.FOLLOWING
                    );
            }

            /**
             * Find the index of the given object (the number of preceding siblings).
             *
             * * `O(n)` where `n` is the amount of preceding siblings
             * * `O(1)` (amortized, if the tree is not modified)
             *
             * @method index
             * @memberOf module:symbol-tree#
             * @param {Object} child
             * @return {Number} The number of preceding siblings, or -1 if the object has no parent
             */
            index(child) {
                    const childNode = this._node(child);
                    const parentNode = this._node(childNode.parent);

                    if (!parentNode) {
                            // In principal, you could also find out the number of preceding siblings
                            // for objects that do not have a parent. This method limits itself only to
                            // objects that have a parent because that lets us optimize more.
                            return -1;
                    }

                    let currentIndex = childNode.getCachedIndex(parentNode);

                    if (currentIndex >= 0) {
                            return currentIndex;
                    }

                    currentIndex = 0;
                    let object = parentNode.firstChild;

                    if (parentNode.childIndexCachedUpTo) {
                            const cachedUpToNode = this._node(parentNode.childIndexCachedUpTo);
                            object = cachedUpToNode.nextSibling;
                            currentIndex = cachedUpToNode.getCachedIndex(parentNode) + 1;
                    }

                    while (object) {
                            const node = this._node(object);
                            node.setCachedIndex(parentNode, currentIndex);

                            if (object === child) {
                                    break;
                            }

                            ++currentIndex;
                            object = node.nextSibling;
                    }

                    parentNode.childIndexCachedUpTo = child;

                    return currentIndex;
            }

            /**
             * Calculate the number of children.
             *
             * * `O(n)` where `n` is the amount of children
             * * `O(1)` (amortized, if the tree is not modified)
             *
             * @method childrenCount
             * @memberOf module:symbol-tree#
             * @param {Object} parent
             * @return {Number}
             */
            childrenCount(parent) {
                    const parentNode = this._node(parent);

                    if (!parentNode.lastChild) {
                            return 0;
                    }

                    return this.index(parentNode.lastChild) + 1;
            }

            /**
             * Compare the position of an object relative to another object. A bit set is returned:
             *
             * <ul>
             *     <li>DISCONNECTED : 1</li>
             *     <li>PRECEDING : 2</li>
             *     <li>FOLLOWING : 4</li>
             *     <li>CONTAINS : 8</li>
             *     <li>CONTAINED_BY : 16</li>
             * </ul>
             *
             * The semantics are the same as compareDocumentPosition in DOM, with the exception that
             * DISCONNECTED never occurs with any other bit.
             *
             * where `n` and `m` are the amount of ancestors of `left` and `right`;
             * where `o` is the amount of children of the lowest common ancestor of `left` and `right`:
             *
             * * `O(n + m + o)` (worst case)
             * * `O(n + m)` (amortized, if the tree is not modified)
             *
             * @method compareTreePosition
             * @memberOf module:symbol-tree#
             * @param {Object} left
             * @param {Object} right
             * @return {Number}
             */
            compareTreePosition(left, right) {
                    // In DOM terms:
                    // left = reference / context object
                    // right = other

                    if (left === right) {
                            return 0;
                    }

                    /* jshint -W016 */

                    const leftAncestors = []; { // inclusive
                            let leftAncestor = left;

                            while (leftAncestor) {
                                    if (leftAncestor === right) {
                                            return TreePosition.CONTAINS | TreePosition.PRECEDING;
                                            // other is ancestor of reference
                                    }

                                    leftAncestors.push(leftAncestor);
                                    leftAncestor = this.parent(leftAncestor);
                            }
                    }


                    const rightAncestors = []; {
                            let rightAncestor = right;

                            while (rightAncestor) {
                                    if (rightAncestor === left) {
                                            return TreePosition.CONTAINED_BY | TreePosition.FOLLOWING;
                                    }

                                    rightAncestors.push(rightAncestor);
                                    rightAncestor = this.parent(rightAncestor);
                            }
                    }


                    const root = reverseArrayIndex(leftAncestors, 0);

                    if (!root || root !== reverseArrayIndex(rightAncestors, 0)) {
                            // note: unlike DOM, preceding / following is not set here
                            return TreePosition.DISCONNECTED;
                    }

                    // find the lowest common ancestor
                    let commonAncestorIndex = 0;
                    const ancestorsMinLength = Math.min(leftAncestors.length, rightAncestors.length);

                    for (let i = 0; i < ancestorsMinLength; ++i) {
                            const leftAncestor  = reverseArrayIndex(leftAncestors, i);
                            const rightAncestor = reverseArrayIndex(rightAncestors, i);

                            if (leftAncestor !== rightAncestor) {
                                    break;
                            }

                            commonAncestorIndex = i;
                    }

                    // indexes within the common ancestor
                    const leftIndex  = this.index(reverseArrayIndex(leftAncestors, commonAncestorIndex + 1));
                    const rightIndex = this.index(reverseArrayIndex(rightAncestors, commonAncestorIndex + 1));

                    return rightIndex < leftIndex
                            ? TreePosition.PRECEDING
                            : TreePosition.FOLLOWING;
            }

            /**
             * Remove the object from this tree.
             * Has no effect if already removed.
             *
             * * `O(1)`
             *
             * @method remove
             * @memberOf module:symbol-tree#
             * @param {Object} removeObject
             * @return {Object} removeObject
             */
            remove(removeObject) {
                    const removeNode = this._node(removeObject);
                    const parentNode = this._node(removeNode.parent);
                    const prevNode = this._node(removeNode.previousSibling);
                    const nextNode = this._node(removeNode.nextSibling);

                    if (parentNode) {
                            if (parentNode.firstChild === removeObject) {
                                    parentNode.firstChild = removeNode.nextSibling;
                            }

                            if (parentNode.lastChild === removeObject) {
                                    parentNode.lastChild = removeNode.previousSibling;
                            }
                    }

                    if (prevNode) {
                            prevNode.nextSibling = removeNode.nextSibling;
                    }

                    if (nextNode) {
                            nextNode.previousSibling = removeNode.previousSibling;
                    }

                    removeNode.parent = null;
                    removeNode.previousSibling = null;
                    removeNode.nextSibling = null;
                    removeNode.cachedIndex = -1;
                    removeNode.cachedIndexVersion = NaN;

                    if (parentNode) {
                            parentNode.childrenChanged();
                    }

                    return removeObject;
            }

            /**
             * Insert the given object before the reference object.
             * `newObject` is now the previous sibling of `referenceObject`.
             *
             * * `O(1)`
             *
             * @method insertBefore
             * @memberOf module:symbol-tree#
             * @param {Object} referenceObject
             * @param {Object} newObject
             * @throws {Error} If the newObject is already present in this SymbolTree
             * @return {Object} newObject
             */
            insertBefore(referenceObject, newObject) {
                    const referenceNode = this._node(referenceObject);
                    const prevNode = this._node(referenceNode.previousSibling);
                    const newNode = this._node(newObject);
                    const parentNode = this._node(referenceNode.parent);

                    if (newNode.isAttached) {
                            throw Error('Given object is already present in this SymbolTree, remove it first');
                    }

                    newNode.parent = referenceNode.parent;
                    newNode.previousSibling = referenceNode.previousSibling;
                    newNode.nextSibling = referenceObject;
                    referenceNode.previousSibling = newObject;

                    if (prevNode) {
                            prevNode.nextSibling = newObject;
                    }

                    if (parentNode && parentNode.firstChild === referenceObject) {
                            parentNode.firstChild = newObject;
                    }

                    if (parentNode) {
                            parentNode.childrenChanged();
                    }

                    return newObject;
            }

            /**
             * Insert the given object after the reference object.
             * `newObject` is now the next sibling of `referenceObject`.
             *
             * * `O(1)`
             *
             * @method insertAfter
             * @memberOf module:symbol-tree#
             * @param {Object} referenceObject
             * @param {Object} newObject
             * @throws {Error} If the newObject is already present in this SymbolTree
             * @return {Object} newObject
             */
            insertAfter(referenceObject, newObject) {
                    const referenceNode = this._node(referenceObject);
                    const nextNode = this._node(referenceNode.nextSibling);
                    const newNode = this._node(newObject);
                    const parentNode = this._node(referenceNode.parent);

                    if (newNode.isAttached) {
                            throw Error('Given object is already present in this SymbolTree, remove it first');
                    }

                    newNode.parent = referenceNode.parent;
                    newNode.previousSibling = referenceObject;
                    newNode.nextSibling = referenceNode.nextSibling;
                    referenceNode.nextSibling = newObject;

                    if (nextNode) {
                            nextNode.previousSibling = newObject;
                    }

                    if (parentNode && parentNode.lastChild === referenceObject) {
                            parentNode.lastChild = newObject;
                    }

                    if (parentNode) {
                            parentNode.childrenChanged();
                    }

                    return newObject;
            }

            /**
             * Insert the given object as the first child of the given reference object.
             * `newObject` is now the first child of `referenceObject`.
             *
             * * `O(1)`
             *
             * @method prependChild
             * @memberOf module:symbol-tree#
             * @param {Object} referenceObject
             * @param {Object} newObject
             * @throws {Error} If the newObject is already present in this SymbolTree
             * @return {Object} newObject
             */
            prependChild(referenceObject, newObject) {
                    const referenceNode = this._node(referenceObject);
                    const newNode = this._node(newObject);

                    if (newNode.isAttached) {
                            throw Error('Given object is already present in this SymbolTree, remove it first');
                    }

                    if (referenceNode.hasChildren) {
                            this.insertBefore(referenceNode.firstChild, newObject);
                    }
                    else {
                            newNode.parent = referenceObject;
                            referenceNode.firstChild = newObject;
                            referenceNode.lastChild = newObject;
                            referenceNode.childrenChanged();
                    }

                    return newObject;
            }

            /**
             * Insert the given object as the last child of the given reference object.
             * `newObject` is now the last child of `referenceObject`.
             *
             * * `O(1)`
             *
             * @method appendChild
             * @memberOf module:symbol-tree#
             * @param {Object} referenceObject
             * @param {Object} newObject
             * @throws {Error} If the newObject is already present in this SymbolTree
             * @return {Object} newObject
             */
            appendChild(referenceObject, newObject) {
                    const referenceNode = this._node(referenceObject);
                    const newNode = this._node(newObject);

                    if (newNode.isAttached) {
                            throw Error('Given object is already present in this SymbolTree, remove it first');
                    }

                    if (referenceNode.hasChildren) {
                            this.insertAfter(referenceNode.lastChild, newObject);
                    }
                    else {
                            newNode.parent = referenceObject;
                            referenceNode.firstChild = newObject;
                            referenceNode.lastChild = newObject;
                            referenceNode.childrenChanged();
                    }

                    return newObject;
            }
    }

    var SymbolTree_1 = SymbolTree;
    SymbolTree.TreePosition = TreePosition;

    var dist$1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });


    exports.valueSymbol = Symbol('Mojule node value');
    exports.apiSymbol = Symbol('Mojule node API');
    const tree = new SymbolTree_1('Mojule node');
    const toApi = nodeValue => nodeValue[exports.apiSymbol];
    exports.isTreeNode = (value) => value && value[exports.valueSymbol];
    exports.createNode = (value, options = {}) => {
        const { extend } = options;
        const nodeValue = { value };
        tree.initialize(nodeValue);
        const ensureParent = child => {
            const parent = tree.parent(child[exports.valueSymbol]);
            if (parent !== nodeValue)
                throw Error('Not a child of this node');
        };
        const node = {
            get value() {
                return nodeValue.value;
            },
            set value(newValue) {
                nodeValue.value = newValue;
            },
            get firstChild() {
                if (!tree.hasChildren(nodeValue))
                    return null;
                return tree.firstChild(nodeValue)[exports.apiSymbol];
            },
            get lastChild() {
                if (!tree.hasChildren(nodeValue))
                    return null;
                return tree.lastChild(nodeValue)[exports.apiSymbol];
            },
            get previousSibling() {
                const previous = tree.previousSibling(nodeValue);
                if (!previous)
                    return null;
                return previous[exports.apiSymbol];
            },
            get nextSibling() {
                const next = tree.nextSibling(nodeValue);
                if (!next)
                    return null;
                return next[exports.apiSymbol];
            },
            get parentNode() {
                const parent = tree.parent(nodeValue);
                if (!parent)
                    return null;
                return parent[exports.apiSymbol];
            },
            get childNodes() {
                return tree.childrenToArray(nodeValue).map(toApi);
            },
            get ancestorNodes() {
                return tree.ancestorsToArray(nodeValue).map(toApi);
            },
            get index() {
                return tree.index(nodeValue);
            },
            hasChildNodes: () => tree.hasChildren(nodeValue),
            remove: () => toApi(tree.remove(nodeValue)),
            removeChild: child => {
                ensureParent(child);
                return toApi(tree.remove(child[exports.valueSymbol]));
            },
            insertBefore: (newNode, referenceNode) => {
                ensureParent(referenceNode);
                tree.remove(newNode[exports.valueSymbol]);
                return toApi(tree.insertBefore(referenceNode[exports.valueSymbol], newNode[exports.valueSymbol]));
            },
            insertAfter: (newNode, referenceNode) => {
                ensureParent(referenceNode);
                tree.remove(newNode[exports.valueSymbol]);
                return toApi(tree.insertAfter(referenceNode[exports.valueSymbol], newNode[exports.valueSymbol]));
            },
            prependChild: newNode => {
                tree.remove(newNode[exports.valueSymbol]);
                return toApi(tree.prependChild(nodeValue, newNode[exports.valueSymbol]));
            },
            appendChild: newNode => {
                tree.remove(newNode[exports.valueSymbol]);
                return toApi(tree.appendChild(nodeValue, newNode[exports.valueSymbol]));
            }
        };
        node[exports.valueSymbol] = nodeValue;
        nodeValue[exports.apiSymbol] = node;
        if (dist.is.function(extend))
            extend(node, nodeValue, tree, exports.valueSymbol, exports.apiSymbol);
        return node;
    };

    });

    const createCommands = () => {
        const commands = {
            list: [],
            nextIndex: 0
        };
        const add = (command) => addCommand(commands, command);
        const nextUndo = () => nextUndoCommand(commands);
        const nextRedo = () => nextRedoCommand(commands);
        return { add, nextUndo, nextRedo };
    };
    const addCommand = (commands, command) => {
        const { nextIndex } = commands;
        commands.list = [...commands.list.slice(0, nextIndex), command];
        commands.nextIndex = commands.list.length;
    };
    const nextUndoCommand = (commands) => {
        const { list } = commands;
        if (list.length === 0 || commands.nextIndex === 0)
            return;
        const command = list[commands.nextIndex - 1];
        commands.nextIndex--;
        return command;
    };
    const nextRedoCommand = (commands) => {
        const { list, nextIndex } = commands;
        if (list.length === 0 || nextIndex >= list.length)
            return;
        const command = list[commands.nextIndex];
        commands.nextIndex++;
        return command;
    };

    const createEmitter = () => {
        const listeners = [];
        let onces = [];
        const on = (listener) => {
            listeners.push(listener);
            return {
                dispose: () => off(listener)
            };
        };
        const once = (listener) => {
            onces.push(listener);
        };
        const off = (listener) => {
            const callbackIndex = listeners.indexOf(listener);
            if (callbackIndex > -1)
                listeners.splice(callbackIndex, 1);
        };
        const emit = (event) => {
            listeners.forEach(listener => listener(event));
            if (onces.length > 0) {
                const existing = onces;
                onces = [];
                existing.forEach(listener => listener(event));
            }
        };
        return { on, once, off, emit };
    };

    // tasks do work and return info needed to create a command for undo/redo
    const createTasks = (elMap, root) => {
        const addOne = (element) => {
            assertUnique(elMap, element.id);
            const node = dist$1.createNode(element);
            root.appendChild(node);
            elMap.set(element.id, node);
            return element;
        };
        const removeOne = (id) => {
            const node = strictMapGet(elMap, id);
            node.remove();
            elMap.delete(id);
            return node.value;
        };
        const updateOne = (element) => {
            const node = strictMapGet(elMap, element.id);
            const prev = node.value;
            node.value = element;
            return { prev, value: element };
        };
        const setOrder = (ids) => {
            const before = root.childNodes.map(n => n.value.id);
            if (ids.length !== before.length)
                throw Error(`Expected ${before.length} ids`);
            ids.forEach(id => {
                const existing = strictMapGet(elMap, id);
                root.appendChild(existing);
            });
            return { type: 'order', before, after: ids };
        };
        return { addOne, removeOne, updateOne, setOrder };
    };

    const undoCommand = ({ addOne, removeOne, updateOne, setOrder }, events, command) => {
        if (command.type === 'add') {
            const ids = command.elements.map(el => el.id);
            ids.forEach(removeOne);
            events.remove.emit(ids);
        }
        if (command.type === 'remove') {
            command.elements.forEach(addOne);
            setOrder(command.before);
            events.add.emit(command.elements);
            events.setOrder.emit(command.before);
        }
        if (command.type === 'update') {
            const values = command.elements.map(el => el.prev);
            values.forEach(updateOne);
            events.update.emit(values);
        }
        if (command.type === 'order') {
            setOrder(command.before);
            events.setOrder.emit(command.before);
        }
    };
    const redoCommand = ({ addOne, removeOne, updateOne, setOrder }, events, command) => {
        if (command.type === 'add') {
            command.elements.forEach(addOne);
            events.add.emit(command.elements);
        }
        if (command.type === 'remove') {
            const ids = command.elements.map(el => el.id);
            ids.forEach(removeOne);
            events.remove.emit(ids);
        }
        if (command.type === 'update') {
            const values = command.elements.map(el => el.value);
            values.forEach(updateOne);
            events.update.emit(values);
        }
        if (command.type === 'order') {
            setOrder(command.after);
            events.setOrder.emit(command.after);
        }
    };

    const createOrderActions = (elMap, root) => {
        const toStart = (ids) => {
            sortIds(elMap, ids).reverse().forEach(id => {
                const existing = strictMapGet(elMap, id);
                root.prependChild(existing);
            });
        };
        const toEnd = (ids) => {
            sortIds(elMap, ids).forEach(id => {
                const existing = strictMapGet(elMap, id);
                root.appendChild(existing);
            });
        };
        const forward = (ids) => {
            sortIds(elMap, ids).forEach(id => {
                const existing = strictMapGet(elMap, id);
                if (existing.nextSibling) {
                    root.insertAfter(existing, existing.nextSibling);
                }
            });
        };
        const back = (ids) => {
            sortIds(elMap, ids).reverse().forEach(id => {
                const existing = strictMapGet(elMap, id);
                if (existing.previousSibling) {
                    root.insertBefore(existing, existing.previousSibling);
                }
            });
        };
        return { toStart, toEnd, forward, back };
    };
    const sortIds = (elMap, ids) => ids.sort((a, b) => {
        const nodeA = strictMapGet(elMap, a);
        const nodeB = strictMapGet(elMap, b);
        return nodeA.index - nodeB.index;
    });

    const createCollection = () => {
        const { root, elMap, commands, events, on, tasks, orderActions, reorder } = initCollection();
        const add = (elements) => {
            elements.forEach(tasks.addOne);
            commands.add({ type: 'add', elements });
            events.add.emit(elements);
        };
        const remove = (ids) => {
            const before = root.childNodes.map(n => n.value.id);
            const elements = ids.map(tasks.removeOne);
            commands.add({ type: 'remove', before, elements });
            events.remove.emit(ids);
        };
        const update = (elements) => {
            const updateElements = elements.map(tasks.updateOne);
            commands.add({ type: 'update', elements: updateElements });
            events.update.emit(elements);
        };
        const toStart = reorder(orderActions.toStart);
        const toEnd = reorder(orderActions.toEnd);
        const forward = reorder(orderActions.forward);
        const back = reorder(orderActions.back);
        const has = (id) => elMap.has(id);
        const get = (id) => strictMapGet(elMap, id).value;
        const toArray = () => root.childNodes.map(n => n.value);
        const undo = () => {
            const command = commands.nextUndo();
            if (command === undefined)
                return false;
            undoCommand(tasks, events, command);
            events.undo.emit();
            return true;
        };
        const redo = () => {
            const command = commands.nextRedo();
            if (command === undefined)
                return false;
            redoCommand(tasks, events, command);
            events.redo.emit();
            return true;
        };
        const collection = {
            add, remove, update, toStart, toEnd, forward, back, has, get, toArray,
            undo, redo, on
        };
        return collection;
    };
    const initCollection = () => {
        const root = dist$1.createNode({ id: 'root' });
        const elMap = new Map();
        const commands = createCommands();
        const events = {
            add: createEmitter(),
            remove: createEmitter(),
            update: createEmitter(),
            setOrder: createEmitter(),
            undo: createEmitter(),
            redo: createEmitter()
        };
        const on = {
            add: events.add.on,
            remove: events.remove.on,
            update: events.update.on,
            setOrder: events.setOrder.on,
            undo: events.undo.on,
            redo: events.redo.on
        };
        const tasks = createTasks(elMap, root);
        const orderActions = createOrderActions(elMap, root);
        const reorder = createReorder(events, commands, root);
        return { root, elMap, commands, events, on, tasks, orderActions, reorder };
    };
    const createReorder = (events, commands, root) => {
        const reorder = (action) => {
            const handleCommandAndEvents = (ids) => {
                const before = root.childNodes.map(n => n.value.id);
                action(ids);
                const after = root.childNodes.map(n => n.value.id);
                commands.add({ type: 'order', before, after });
                events.setOrder.emit(after);
            };
            return handleCommandAndEvents;
        };
        return reorder;
    };

    var fitter = createCommonjsModule(function (module, exports) {
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

    });

    var transformFittedPoint = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });

    exports.transformFittedPoint = (fittedPoint, parent, child, fitMode = 'fill', left = '50%', top = '50%') => {
        const { x: positionedX, y: positionedY, width: fittedWidth, height: fittedHeight } = fitter.fitAndPosition(parent, child, fitMode, left, top);
        const wRatio = child.width / fittedWidth;
        const hRatio = child.height / fittedHeight;
        const x = (fittedPoint.x - positionedX) * wRatio;
        const y = (fittedPoint.y - positionedY) * hRatio;
        const childPoint = { x, y };
        return childPoint;
    };

    });

    var predicates = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    const fitModes = {
        contain: true,
        cover: true,
        fill: true,
        none: true,
        'scale-down': true
    };
    exports.isFit = (value) => value in fitModes;

    });

    var dist$2 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });

    exports.fit = fitter.fit;
    exports.position = fitter.position;
    exports.fitAndPosition = fitter.fitAndPosition;

    exports.transformFittedPoint = transformFittedPoint.transformFittedPoint;

    exports.isFit = predicates.isFit;

    });

    const zoomToFit = (parent, child) => {
        const { x: fx, y: fy, width: fw } = dist$2.fitAndPosition(parent, child, 'contain', '50%', '50%');
        const scale = fw / child.width;
        const x = fx / scale;
        const y = fy / scale;
        const transform = { x, y, scale };
        return transform;
    };

    const createSelector = () => {
        const set = new Set();
        const selectEmitter = createEmitter();
        const actions = {
            add: values => {
                values.forEach(v => set.add(v));
                selectEmitter.emit([...set]);
            },
            remove: values => {
                values.forEach(v => set.delete(v));
                selectEmitter.emit([...set]);
            },
            toggle: values => {
                values.forEach(v => {
                    if (set.has(v)) {
                        set.delete(v);
                    }
                    else {
                        set.add(v);
                    }
                });
                selectEmitter.emit([...set]);
            },
            clear: () => {
                set.clear();
                selectEmitter.emit([]);
            },
            get: () => clone$1([...set]),
            set: values => {
                set.clear();
                actions.add(values);
            },
            any: () => set.size > 0,
        };
        const { on } = selectEmitter;
        const selector = { actions, on };
        return selector;
    };

    const createState = () => {
        const mode = createMode();
        const snap = createSnapToGrid();
        const viewSize = createViewSize();
        const viewTransform = createViewTransform();
        const documentSize = createDocumentSize();
        const rects = createCollection();
        const selector = createSelector();
        const keys = {};
        const zoomToFit = createZoomToFit(viewSize, documentSize, viewTransform);
        const zoomAt = createZoomAt(viewTransform);
        const state = {
            mode, snap, viewSize, viewTransform, documentSize,
            rects, selector, keys, dirty: true,
            zoomToFit, zoomAt
        };
        return state;
    };
    const createMode = () => {
        const toolsEl = strictSelect('#tools');
        const toolsFormEl = strictSelect('form', toolsEl);
        const modeRadioNodes = strictFormRadioNodes(toolsFormEl, 'mode');
        const mode = (value) => {
            if (value !== undefined) {
                modeRadioNodes.value = value;
            }
            return modeRadioNodes.value;
        };
        return mode;
    };
    const createSnapToGrid = () => {
        const widthInputEl = strictSelect('#snap-width');
        const heightInputEl = strictSelect('#snap-height');
        const snapSize = (value) => {
            if (value !== undefined) {
                const { width, height } = value;
                widthInputEl.valueAsNumber = width;
                heightInputEl.valueAsNumber = height;
                updateGridPattern(value);
            }
            const width = widthInputEl.valueAsNumber;
            const height = heightInputEl.valueAsNumber;
            return { width, height };
        };
        return snapSize;
    };
    const createViewSize = () => {
        const svgEl = strictSelect('#document');
        let size = { width: 0, height: 0 };
        const viewSize = (value) => {
            if (value !== undefined) {
                size = value;
                const { width, height } = size;
                attr(svgEl, { viewBox: `0 0 ${width} ${height}` });
            }
            const { width, height } = size;
            return { width, height };
        };
        return viewSize;
    };
    const createDocumentSize = () => {
        const gridEl = strictSelect('#grid');
        let size = { width: 0, height: 0 };
        const documentSize = (value) => {
            if (value !== undefined) {
                size = value;
                const { width, height } = size;
                attr(gridEl, { x: 0, y: 0, width, height });
            }
            const { width, height } = size;
            return { width, height };
        };
        return documentSize;
    };
    const createViewTransform = () => {
        let scaleTransform = { x: 0, y: 0, scale: 1 };
        const viewTransform = (value) => {
            if (value !== undefined) {
                scaleTransform = value;
                const { x, y, scale: transformScale } = scaleTransform;
                const scale = Math.max(transformScale, minScale);
                const bodyEl = strictSelect('#body');
                attr(bodyEl, { transform: `translate(${x} ${y}) scale(${scale})` });
            }
            const { x, y, scale } = scaleTransform;
            return { x, y, scale };
        };
        return viewTransform;
    };
    const createZoomToFit = (viewSize, documentSize, viewTransform) => {
        const action = () => viewTransform(zoomToFit(viewSize(), documentSize()));
        return action;
    };
    const createZoomAt = (viewTransform) => {
        const action = (transform) => viewTransform(zoomAt(viewTransform(), transform, minScale));
        return action;
    };

    const appEl = createAppEls();
    const toolsEl = createToolsEls();
    const documentEl = createDocumentEl();
    const infoEl = createInfo();
    const toolsSectionEl = strictSelect('#tools', appEl);
    const viewportSectionEl = strictSelect('#viewport', appEl);
    const footerEl = strictSelect('footer', appEl);
    footerEl.append(infoEl);
    toolsSectionEl.append(toolsEl);
    viewportSectionEl.append(documentEl);
    document.body.append(appEl);
    const state = createState();
    state.mode('pan');
    state.snap({ width: 25, height: 25 });
    state.documentSize({ width: 1000, height: 1000 });
    handleViewportResize(state);
    handleResetZoom(state);
    handleUndo(state);
    handleRedo(state);
    handleSnapGrid();
    state.zoomToFit();
    state.rects.add([
        { id: 'a', x: 250, y: 250, width: 250, height: 250, 'data-style': 'none' },
        { id: 'b', x: 500, y: 500, width: 250, height: 250, 'data-style': 'none' },
    ]);
    const rectsEl = strictSelect('#rects');
    let boundsRect = { x: 250, y: 250, width: 500, height: 500 };
    const boundsEl = rect({ stroke: 'red', fill: 'none' }, boundsRect);
    rectsEl.before(line({ stroke: 'red', x1: 500, y1: 0, x2: 500, y2: 1000 }), line({ stroke: 'red', x1: 0, y1: 500, x2: 1000, y2: 500 }), boundsEl);
    const selectXOrigin = select(...xPositionNames.map(s => option({ value: s }, s)));
    const selectYOrigin = select(...yPositionNames.map(s => option({ value: s }, s)));
    const dxEl = input({ type: 'number', step: 1, value: 0 });
    const dyEl = input({ type: 'number', step: 1, value: 0 });
    const editScaleEl = fieldset(legend('Scale'), label('X Origin', selectXOrigin), label('Y Origin', selectYOrigin), label('dx', dxEl), label('dy', dyEl));
    toolsEl.append(editScaleEl);
    toolsEl.addEventListener('change', () => {
        const xOrigin = selectXOrigin.value;
        const yOrigin = selectYOrigin.value;
        const dx = dxEl.valueAsNumber * state.snap().width;
        const dy = dyEl.valueAsNumber * state.snap().height;
        const sidesRect = rectToSidesRect(boundsRect);
        const grown = growSidesRectByDelta(sidesRect, { x: dx, y: dy }, [xOrigin, yOrigin]);
        const newBoundsRect = sidesRectToRect(grown);
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
        console.log(dx, dy, newBoundsRect);
        if (newBoundsRect.width === 0 || newBoundsRect.height === 0)
            return;
        attr(boundsEl, newBoundsRect);
        const rectEls = getAllRects();
        const appRects = getAppRects(rectEls.map(el => el.id));
        appRects.forEach(appRect => {
            const el = strictSelect(`#${appRect.id}`);
            appRect = scaleRectFromBounds(appRect, boundsRect, newBoundsRect);
            appRect = flipRectInBounds(appRect, newBoundsRect, flipX, flipY);
            attr(el, appRect);
        });
        boundsRect = newBoundsRect;
    });
    const stateSerialized = JSON.stringify(state, (_key, value) => {
        if (typeof value === 'function')
            return value();
        return value;
    }, 2);
    console.log(stateSerialized);

}());
