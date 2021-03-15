(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
const resultsEl = document.querySelector('.results');
const randomizeButtonEl = document.querySelector('button');
const formEl = document.querySelector('form');
const progressContainer = document.querySelector('.progress');
const progressEl = document.querySelector('progress');
progressContainer.remove();
const randInt = (exclMax) => Math.floor(Math.random() * exclMax);
const createSequenceProgress = (length, cb, done, perStep = 1000) => {
    progressEl.value = 0;
    progressEl.max = length;
    document.body.appendChild(progressContainer);
    let created = length;
    let values = [];
    const next = () => {
        for (let i = 0; i < perStep; i++) {
            if (!created) {
                progressEl.value = 0;
                progressEl.max = 0;
                progressContainer.remove();
                return done(values);
            }
            values.push(cb());
            created--;
            progressEl.value++;
        }
        setTimeout(() => next(), 0);
    };
    next();
};
const simulatePerson = (numEncounters, shinyRate) => {
    let shinies = 0;
    for (let i = 0; i < numEncounters; i++) {
        // the number generated will be 0..shinyRate-1 - if it's zero, you got a
        // shiny
        if (!randInt(shinyRate)) {
            shinies++;
        }
    }
    return shinies;
};
const median = (arr) => {
    const mid = Math.floor(arr.length / 2);
    const nums = [...arr].sort((a, b) => a - b);
    return (arr.length % 2 ?
        (nums[mid - 1] + nums[mid]) / 2 :
        nums[mid]);
};
const average = (arr) => {
    const sum = arr.reduce((a, b) => a + b);
    return sum / arr.length;
};
const addPeopleToDom = () => {
    if (!formEl.checkValidity())
        return;
    const formData = new FormData(formEl);
    const numPeople = Number(formData.get('numPeople'));
    const numEncounters = Number(formData.get('numEncounters'));
    const shinyRate = Number(formData.get('shinyRate'));
    resultsEl.innerHTML = '<h2>Results</h2>';
    const getRate = (count, total = numEncounters) => (count === 0 ?
        `0:${total}` :
        `1:${Math.floor(total / count)}`);
    createSequenceProgress(numPeople, () => simulatePerson(numEncounters, shinyRate), people => {
        let worstCount = Number.MAX_SAFE_INTEGER;
        let bestCount = Number.MIN_SAFE_INTEGER;
        let zeroes = 0;
        people.forEach(shinies => {
            if (shinies === 0)
                zeroes++;
            if (shinies > bestCount) {
                bestCount = shinies;
            }
            if (shinies < worstCount) {
                worstCount = shinies;
            }
        });
        const medianShinies = median(people);
        const averageShinies = average(people);
        const summaryP = document.createElement('p');
        summaryP.innerHTML = `
        The difference between the best and worst luck was <strong>
        ${bestCount - worstCount}</strong> shiny Pokémon

        <br><br>

        The person with the best luck got <strong>${bestCount}</strong> shiny
        Pokémon and their rate was <strong>${getRate(bestCount)}</strong>

        <br><br>

        The person with the worst luck got <strong>${worstCount}</strong>
        shiny Pokémon and their rate was <strong>${getRate(worstCount)}
        </strong>

        <br></br>

        The average number of shiny Pokémon was <strong>
        ${averageShinies.toFixed(1)}</strong> and the average rate was
        <strong>${getRate(averageShinies)}</strong>

        <br><br>

        The median number of shiny Pokémon was <strong>
        ${medianShinies.toFixed(1)}</strong> and the median rate was
        <strong>${getRate(medianShinies)}</strong>
      `;
        if (zeroes > 0) {
            summaryP.innerHTML += `
          <br><br>

          ${zeroes} ${zeroes === 1 ? 'person' : 'people'} got no shiny
          Pokémon. This is <strong> ${getRate(zeroes, numPeople)}</strong>
          people, or <strong>
          ${((100 / numPeople) * zeroes).toFixed(1)}%</strong>
        `;
        }
        resultsEl.appendChild(summaryP);
    });
};
randomizeButtonEl.addEventListener('click', () => {
    addPeopleToDom();
});

},{}]},{},[1]);
