export const LogFactory = (seed = Math.random()) => {
    let log = [seed];
    const reset = (newSeed = Math.random()) => {
        seed = newSeed;
        log = [seed];
        save();
    };
    const load = () => {
        const logJson = localStorage.getItem('log');
        if (logJson) {
            log = JSON.parse(logJson);
            seed = log[0];
        }
        else {
            reset();
        }
    };
    const save = () => {
        const logJson = JSON.stringify(log);
        localStorage.setItem('log', logJson);
    };
    const add = (item) => {
        log.push(item);
        save();
    };
    const replay = (io) => {
        const [, ...items] = log;
        items.forEach(item => {
            if (typeof item === 'string') {
                io.input(item, true);
            }
            if (Array.isArray(item)) {
                const [tx, ty] = item;
                io.tap(tx, ty, true);
            }
        });
    };
    const getSeed = () => seed;
    load();
    return { reset, add, replay, getSeed };
};
//# sourceMappingURL=index.js.map