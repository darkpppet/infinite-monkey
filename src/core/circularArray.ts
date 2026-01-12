
export class CircularArray {
    private readonly buffer: Uint32Array;
    private readonly capacity: number;
    private cursor: number = 0;
    public totalLength: number = 0;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.buffer = new Uint32Array(capacity);
    }

    push(char: string) {
        this.buffer[this.cursor] = char.codePointAt(0) as number;
        this.cursor = (this.cursor + 1) % this.capacity;
        this.totalLength++;
    }

    at(index: number) {
        const idx = (this.cursor + index) % this.capacity;
        return this.buffer[idx];
    }

    generateString() {
        const actualSize = Math.min(this.totalLength, this.capacity);
        const stringArray = new Array(actualSize); // 메모리 미리 확보

        const startIdx = this.totalLength < this.capacity ? 0 : this.cursor;

        for (let i = 0; i < actualSize; i++) {
            const idx = (startIdx + i) % this.capacity;
            stringArray[i] = String.fromCodePoint(this.buffer[idx]);
        }

        return stringArray.join('');
    }
}