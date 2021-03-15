const a = 1103515245;
const c = 12345;
const mod = Math.pow(2, 31) - 1;
export const SeededRandom = (seed) => {
    if (!Number.isFinite(seed))
        throw Error('Expected numeric seed');
    const seededRandom = function* () {
        seed = (+seed) % mod;
        while (true) {
            seed = (seed * a + c) % mod;
            yield (seed & 0x3fffffff) / 0x3fffffff;
        }
    };
    const next = () => seededRandom().next().value;
    const randInt = exclMax => Math.floor(next() * exclMax);
    const pick = arr => arr[randInt(arr.length)];
    const dice = (exclMax, count = 3) => {
        let sum = 0;
        for (let i = 0; i < count; i++) {
            sum += next() * exclMax;
        }
        return Math.floor(sum / count);
    };
    const pickDice = (arr, count = 3) => arr[dice(arr.length, count)];
    const random = { next, randInt, pick, dice, pickDice };
    return random;
};
//# sourceMappingURL=index.js.map