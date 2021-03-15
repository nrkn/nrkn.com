(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const quiz_1 = require("./quiz");
const easyTemplate = document.getElementById('easy');
const questionEl = document.querySelector('.question');
const historyEl = document.querySelector('.history');
const scoreEl = document.querySelector('.score');
const questionCountEl = document.querySelector('.questionCount');
const getEasy = (easyQuestion, cb) => {
    const { message, type1, type2 } = easyQuestion;
    const easy = easyTemplate.content.cloneNode(true);
    const messageEl = easy.querySelector('.message');
    const type1El = easy.querySelector('.type1');
    const type2El = easy.querySelector('.type2');
    const type1Img = type1El.querySelector('img');
    const type2Img = type2El.querySelector('img');
    type1El.classList.add(`icon--${type1.toLowerCase()}`);
    type2El.classList.add(`icon--${type2.toLowerCase()}`);
    type1Img.src = `img/${type1}.svg`;
    type2Img.src = `img/${type2}.svg`;
    messageEl.innerHTML = message;
    const strong = easy.querySelector('.strong');
    const normal = easy.querySelector('.normal');
    const weak = easy.querySelector('.weak');
    strong.addEventListener('click', () => cb('strong'));
    normal.addEventListener('click', () => cb('normal'));
    weak.addEventListener('click', () => cb('weak'));
    return easy;
};
let currentScore = 0;
let currentQuestionCount = 0;
const next = () => {
    const easyQuestion = quiz_1.easy();
    const { score, message, type1, type2, isStrong, isNormal, isWeak } = easyQuestion;
    const easyEl = getEasy(easyQuestion, (answer) => {
        const relationship = isStrong ? 'super effective' :
            isNormal ? 'normal' :
                'not very effective';
        const correctAnswer = `${type1} is ${relationship} against ${type2}`;
        const questionScore = score(answer);
        currentScore += questionScore;
        currentQuestionCount++;
        scoreEl.innerHTML = String(currentScore);
        questionCountEl.innerHTML = String(currentQuestionCount);
        const currentHistoryEl = document.createElement('p');
        currentHistoryEl.innerHTML = `
      ${currentQuestionCount}.
      <div class="icon icon--small icon--${type1.toLowerCase()}"><img src="img/${type1}.svg"></div>
      <div class="icon icon--small icon--${type2.toLowerCase()}"><img src="img/${type2}.svg"></div>
      ${message}
      <em>${answer === 'strong' ?
            'Super effective' :
            answer === 'normal' ?
                'Normal' :
                'Not very effective'}</em>
      <strong class="${questionScore ? 'correct' : 'wrong'}">${questionScore ? 'Correct' : 'Wrong'}</strong>
      ${questionScore ? '' : `– <strong>${correctAnswer}</strong>`}
    `;
        historyEl.appendChild(currentHistoryEl);
        currentHistoryEl.scrollIntoView();
        next();
    });
    questionEl.innerHTML = '';
    questionEl.appendChild(easyEl);
};
next();

},{"./quiz":3}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pokémonTypeNames = [
    'Normal', 'Fighting', 'Flying', 'Poison', 'Ground', 'Rock', 'Bug', 'Ghost',
    'Steel', 'Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Ice', 'Dragon',
    'Fairy', 'Dark'
];
exports.pokémonTypeRelationships = [
    'Strong Against', 'Weak Against', 'Resistant To', 'Vulnerable To'
];
exports.relationshipToKeyMap = {
    'Strong Against': 'strongAgainst',
    'Weak Against': 'weakAgainst',
    'Resistant To': 'resistantTo',
    'Vulnerable To': 'vulnerableTo'
};
exports.pokémonTypeDefs = [
    {
        name: 'Normal',
        strongAgainst: [],
        weakAgainst: ['Rock', 'Ghost', 'Steel'],
        resistantTo: ['Ghost'],
        vulnerableTo: ['Fighting']
    },
    {
        name: 'Fighting',
        strongAgainst: ['Normal', 'Rock', 'Steel', 'Ice', 'Dark'],
        weakAgainst: ['Flying', 'Poison', 'Psychic', 'Bug', 'Ghost', 'Fairy'],
        resistantTo: ['Rock', 'Bug', 'Dark'],
        vulnerableTo: ['Flying', 'Psychic', 'Fairy']
    },
    {
        name: 'Flying',
        strongAgainst: ['Fighting', 'Bug', 'Grass'],
        weakAgainst: ['Rock', 'Steel', 'Electric'],
        resistantTo: ['Fighting', 'Ground', 'Bug', 'Grass'],
        vulnerableTo: ['Rock', 'Electric', 'Ice']
    },
    {
        name: 'Poison',
        strongAgainst: ['Grass', 'Fairy'],
        weakAgainst: ['Poison', 'Ground', 'Rock', 'Ghost', 'Steel'],
        resistantTo: ['Fighting', 'Poison', 'Grass', 'Fairy'],
        vulnerableTo: ['Ground', 'Psychic']
    },
    {
        name: 'Ground',
        strongAgainst: ['Poison', 'Rock', 'Steel', 'Fire', 'Electric'],
        weakAgainst: ['Flying', 'Bug', 'Grass'],
        resistantTo: ['Poison', 'Rock', 'Electric'],
        vulnerableTo: ['Water', 'Grass', 'Ice']
    },
    {
        name: 'Rock',
        strongAgainst: ['Flying', 'Bug', 'Fire', 'Ice'],
        weakAgainst: ['Fighting', 'Ground', 'Steel'],
        resistantTo: ['Normal', 'Flying', 'Poison', 'Fire'],
        vulnerableTo: ['Fighting', 'Ground', 'Steel', 'Water', 'Grass']
    },
    {
        name: 'Bug',
        strongAgainst: ['Grass', 'Psychic', 'Dark'],
        weakAgainst: ['Fighting', 'Flying', 'Poison', 'Ghost', 'Steel', 'Fire', 'Fairy'],
        resistantTo: ['Fighting', 'Ground', 'Grass'],
        vulnerableTo: ['Flying', 'Rock', 'Fire']
    },
    {
        name: 'Ghost',
        strongAgainst: ['Ghost', 'Psychic'],
        weakAgainst: ['Normal', 'Dark'],
        resistantTo: ['Normal', 'Fighting', 'Poison', 'Bug'],
        vulnerableTo: ['Ghost', 'Dark']
    },
    {
        name: 'Steel',
        strongAgainst: ['Rock', 'Ice', 'Fairy'],
        weakAgainst: ['Steel', 'Fire', 'Water', 'Electric'],
        resistantTo: [
            'Normal', 'Flying', 'Poison', 'Rock', 'Bug', 'Steel', 'Grass', 'Psychic',
            'Ice', 'Dragon', 'Fairy'
        ],
        vulnerableTo: ['Fighting', 'Ground', 'Fire']
    },
    {
        name: 'Fire',
        strongAgainst: ['Bug', 'Steel', 'Grass', 'Ice'],
        weakAgainst: ['Rock', 'Fire', 'Water', 'Dragon'],
        resistantTo: ['Bug', 'Steel', 'Fire', 'Grass', 'Ice'],
        vulnerableTo: ['Ground', 'Rock', 'Water']
    },
    {
        name: 'Water',
        strongAgainst: ['Ground', 'Rock', 'Fire'],
        weakAgainst: ['Water', 'Grass', 'Dragon'],
        resistantTo: ['Steel', 'Fire', 'Water', 'Ice'],
        vulnerableTo: ['Grass', 'Electric']
    },
    {
        name: 'Grass',
        strongAgainst: ['Ground', 'Rock', 'Water'],
        weakAgainst: [
            'Flying', 'Poison', 'Bug', 'Steel', 'Fire', 'Grass', 'Dragon'
        ],
        resistantTo: ['Ground', 'Water', 'Grass', 'Electric'],
        vulnerableTo: ['Flying', 'Poison', 'Bug', 'Fire', 'Ice']
    },
    {
        name: 'Electric',
        strongAgainst: ['Flying', 'Water'],
        weakAgainst: ['Ground', 'Grass', 'Electric', 'Dragon'],
        resistantTo: ['Flying', 'Steel', 'Electric'],
        vulnerableTo: ['Ground']
    },
    {
        name: 'Psychic',
        strongAgainst: ['Fighting', 'Poison'],
        weakAgainst: ['Steel', 'Psychic', 'Dark'],
        resistantTo: ['Fighting', 'Psychic'],
        vulnerableTo: ['Bug', 'Ghost', 'Dark']
    },
    {
        name: 'Ice',
        strongAgainst: ['Flying', 'Ground', 'Grass', 'Dragon'],
        weakAgainst: ['Steel', 'Fire', 'Water', 'Ice'],
        resistantTo: ['Ice'],
        vulnerableTo: ['Fighting', 'Rock', 'Steel', 'Fire']
    },
    {
        name: 'Dragon',
        strongAgainst: ['Dragon'],
        weakAgainst: ['Steel', 'Fairy'],
        resistantTo: ['Fire', 'Water', 'Grass', 'Electric'],
        vulnerableTo: ['Ice', 'Dragon', 'Fairy']
    },
    {
        name: 'Fairy',
        strongAgainst: ['Fighting', 'Dragon', 'Dark'],
        weakAgainst: ['Poison', 'Steel', 'Fire'],
        resistantTo: ['Fighting', 'Bug', 'Dragon', 'Dark'],
        vulnerableTo: ['Poison', 'Steel']
    },
    {
        name: 'Dark',
        strongAgainst: ['Ghost', 'Psychic'],
        weakAgainst: ['Fighting', 'Dark', 'Fairy'],
        resistantTo: ['Ghost', 'Psychic', 'Dark'],
        vulnerableTo: ['Fighting', 'Bug', 'Fairy']
    }
];

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const random_1 = require("./random");
const data_1 = require("./data");
const { rand, randInt, pickIndex, pick, shuffle } = random_1.defaultRandom;
const shuffledTypes = () => shuffle(data_1.pokémonTypeNames);
const getUniqueTypes = (count) => shuffledTypes().slice(count);
const getSomeTypes = (count) => {
    const types = [];
    for (let i = 0; i < count; i++) {
        types.push(pick(data_1.pokémonTypeNames));
    }
    return types;
};
const getRelationship = () => pick(data_1.pokémonTypeRelationships);
const hasRelationship = (type1, relationship, type2) => {
    const def = data_1.pokémonTypeDefs.find(d => d.name === type1);
    if (!def)
        throw Error(`Unknown type ${type1}`);
    const relationshipKey = data_1.relationshipToKeyMap[relationship];
    const relationshipList = def[relationshipKey];
    return relationshipList.includes(type2);
};
const isStrongVs = (type1, type2) => hasRelationship(type1, 'Strong Against', type2);
const isNormalVs = (type1, type2) => !isStrongVs(type1, type2) && !isWeakVs(type1, type2);
const isWeakVs = (type1, type2) => hasRelationship(type1, 'Weak Against', type2);
const effectivenessMap = {
    'strong': isStrongVs,
    'normal': isNormalVs,
    'weak': isWeakVs
};
exports.easy = () => {
    const [type1, type2] = getSomeTypes(2);
    const message = `${type1} attacks ${type2}! It's…`;
    const isStrong = isStrongVs(type1, type2);
    const isNormal = isNormalVs(type1, type2);
    const isWeak = isWeakVs(type1, type2);
    const score = (answer) => {
        const test = effectivenessMap[answer];
        return test(type1, type2) ? 1 : 0;
    };
    return { message, score, type1, type2, isStrong, isWeak, isNormal };
};

},{"./data":2,"./random":4}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeededRandom = (seed = Math.floor(Math.random() * 2147483647)) => {
    seed = seed % 2147483647;
    if (seed <= 0)
        seed += 2147483646;
    const rand = () => {
        seed = seed * 16807 % 2147483647;
        return (seed - 1) / 2147483646;
    };
    const randInt = (exclMax, min = 0) => Math.floor(rand() * exclMax) + min;
    const pickIndex = (arr) => {
        if (arr.length)
            return randInt(arr.length);
        return -1;
    };
    const pick = (arr) => arr[pickIndex(arr)];
    const shuffle = (arr) => {
        const input = arr.slice();
        const upper = input.length - 1;
        for (let i = upper; i >= 0; i++) {
            const index = randInt(i + 1);
            const item = input[index];
            input[index] = input[i];
            input[i] = item;
        }
        return input;
    };
    const seededRandom = { rand, randInt, pickIndex, pick, shuffle };
    return seededRandom;
};
exports.defaultRandom = exports.SeededRandom();

},{}]},{},[1]);
