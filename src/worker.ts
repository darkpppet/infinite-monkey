/*
 * Web Worker에서 호출하는 파일
 * 원숭이의 말 생성
 */

import WritingSystem, { hangul, alphanumeric, kana } from "./language";

const maxLength = 30;

onmessage = (e) => {
    let writingSystem: WritingSystem = hangul;
    switch (e.data.writingSystem) {
        case "hangul":
            writingSystem = hangul;
            break;

        case "alphanumeric":
            writingSystem = alphanumeric;
            break;
        
        case "kana":
            writingSystem = kana;
            break;
    }

    let matchName: string = e.data.matchName;
    
    let monkeySaid: string = "";
    let saidCount: number = 0;
    let isFinish: boolean = false;

    const post = () => {
        postMessage({
            said: isFinish ? `${monkeySaid.slice(0, -matchName.length)}<span style='color: red;'><b>${monkeySaid.slice(-matchName.length)}</b></span>` : monkeySaid,
            count: saidCount,
            isFinish: isFinish,
        });
    }

    while (monkeySaid.slice(-matchName.length) !== matchName) {
        monkeySaid += writingSystem.generateRandomCharacter();
        saidCount++;
        
        if (monkeySaid.length > maxLength) {
            monkeySaid = monkeySaid.slice(-maxLength);
        }

        post();
    }

    isFinish = true;
    post(); 
}
