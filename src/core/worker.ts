/*
 * Web Worker에서 호출하는 파일
 * 원숭이의 말 생성
 */

import type WritingSystem from "./language.ts";
import { getWritingSystem } from "./language.ts";
import { CircularArray } from "./circularArray.ts";

const config = {
    updatePeriod: 1000 / 60,
    maxLength: 30,
}

interface State {
    matchName: Uint32Array,
    monkeySaid: CircularArray,
    saidCount: number,
    isFinish: boolean,
}
let state: State;
const initializeState = (matchName: string) => {
    let matchNameArray = new Uint32Array(matchName.length);
    for (let i = 0; i < matchName.length; i++) {
        matchNameArray[i] = matchName[i].codePointAt(0)!;
    }

    state = {
        matchName: matchNameArray,
        monkeySaid: new CircularArray(config.maxLength),
        saidCount: 0,
        isFinish: false,
    };
}

onmessage = (e) => {
    let writingSystem: WritingSystem = getWritingSystem(e.data.writingSystem);
    let matchName: string = e.data.matchName;

    start(writingSystem, matchName);
}

const start = (writingSystem: WritingSystem, matchName: string) => {
    initializeState(matchName);

    let lastTime = performance.now();
    while (!isMatch()) {
        state.monkeySaid.push(writingSystem.generateRandomCharacter());
        state.saidCount++;

        const currentTime = performance.now();
        if (currentTime - lastTime >= config.updatePeriod) {
            postUpdate();
            lastTime = currentTime;
        }
    }
    state.isFinish = true;
    postUpdate();
}

const postUpdate = () => {
    postMessage({
        said: generateSaid(),
        count: state.saidCount,
        isFinish: state.isFinish,
    });
}

const generateSaid = () => {
    let said = state.monkeySaid.generateString();
    if (state.isFinish) {
        const whitePart = said.slice(0, -state.matchName.length);
        const redPart = said.slice(-state.matchName.length);
        said = `${whitePart}<span style='color: red;'><b>${redPart}</b></span>`
    }
    return said;
}

const isMatch = () => {
    const length = state.matchName.length;
    if (state.monkeySaid.totalLength < length) {
        return false;
    }

    const offset = config.maxLength - state.matchName.length;
    for (let i = 0; i < length; i++) {
        if (state.monkeySaid.at(offset + i) !== state.matchName[i]) {
            return false;
        }
    }
    return true;
}
