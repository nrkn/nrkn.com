export const getFrame = (first, timestamp) => {
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
//# sourceMappingURL=index.js.map