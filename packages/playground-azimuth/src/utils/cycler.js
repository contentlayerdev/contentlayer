export default function cycler() {
    const args = Array.prototype.slice.call(arguments);
    let index = 0;
    return {
        next: () => args[index++ % args.length]
    };
};
