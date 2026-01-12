/* 
 * main.ts
 * html에서 바인딩 하는 함수들 정의해놓은 파일
 */

import type WritingSystem from "./core/language.ts";
import { hangul, alphanumeric, kana, cyrillic } from "./core/language.ts";

//Elements
const nameInput = document.getElementById("name") as HTMLInputElement;
const expectedLetterCount = document.getElementById("expected-letter-count") as HTMLElement;
const totalLetterCount = document.getElementById("total-letter-count") as HTMLElement;
const warnOutput = document.getElementById("warn") as HTMLElement;
const monkeySaid = document.getElementById("monkey-said") as HTMLElement;
const letterCount = document.getElementById("said-letter-count") as HTMLElement;
const saidTime = document.getElementById("said-time") as HTMLElement;
const startButton = document.getElementById("start-button") as HTMLButtonElement;
const letterWarn = document.getElementById("letter-warn") as HTMLElement;

let writingSystem: WritingSystem = hangul;
nameInput.value = writingSystem.defaultName;

//기댓값 문자열로 반환 함수; '기댓값: xx글자'
const returnExpectedValueString = (letterCount: number, nameLength: number): string => (
    `기댓값: ${Math.pow(letterCount, nameLength).toLocaleString()}글자`
);

//입력 길이에 따른 경고 출력 함수
const warnNameLength = (nameLength: number): void => {
    startButton.innerText = nameLength >= writingSystem.warnLength ? "⚠️시작" : "시작";
    warnOutput.style.display = nameLength >= writingSystem.warnLength ? "block" : "none";
};

//input's oninput
window.filterName = (e: HTMLInputElement): void => {
     //선택된 언어 외 글자 입력시 경고
    if (writingSystem.filterRegex.test(e.value)) {
        nameInput.style.outlineColor = 'red';
        letterWarn.innerText = `※${writingSystem.letterNameKorean}만 입력할 수 있습니다.※`;
        letterWarn.style.visibility = "visible";
    } else {
        nameInput.style.outlineColor = 'black';
        letterWarn.style.visibility = "hidden";
    }

    e.value = e.value.replace(writingSystem.filterRegex, ''); //선택된 언어 외 글자 입력 차단
    expectedLetterCount.innerText = returnExpectedValueString(writingSystem.letterCount, e.value.length); //입력에 따라 기댓값 갱신
    warnNameLength(e.value.length); //입력에 따라 길이 경고 갱신
}

//input's onfocusout
window.changeName = (e: HTMLInputElement): void => {
    //filterName에서 경고한거 원상복구
    nameInput.style.outlineColor = 'black';
    letterWarn.style.visibility = "hidden";
    //한글일 때, 자음이나 모음만 있을 경우 제거 및 갱신
    if (writingSystem.filterRegex2) {
        e.value = e.value.replace(writingSystem.filterRegex2 as RegExp, '');
        expectedLetterCount.innerText = returnExpectedValueString(writingSystem.letterCount, e.value.length);
        warnNameLength(e.value.length);
    }
}

//radio's onchange
window.changeWritingSystem = (e: HTMLInputElement): void => {
    switch (e.value) {
        case "hangul": //한글
            writingSystem = hangul;
            break;

        case "alphanumeric": //영숫자
            writingSystem = alphanumeric;
            break;
        
        case "kana": //가나
            writingSystem = kana;
            break;

        case "cyrillic": //키릴
            writingSystem = cyrillic;
            break;
    }

    nameInput.value = writingSystem.defaultName;

    totalLetterCount.innerText = "글자 개수: " + writingSystem.letterCountText;
    expectedLetterCount.innerText = returnExpectedValueString(writingSystem.letterCount, nameInput.value.length);
    warnNameLength(nameInput.value.length);
}

//button's onclick
window.saying = (e: HTMLButtonElement): void => {
    const webWorker = new Worker(new URL('./core/worker.ts', import.meta.url), { type: 'module' });
    webWorker.onmessage = (message) => {
        monkeySaid.innerHTML = message.data.said;
        letterCount.innerText = message.data.count.toLocaleString();
        saidTime.innerText = ((performance.now() - startTime) / 1000).toLocaleString('ko-KR', { minimumFractionDigits: 3 }) + '초';

        if (message.data.isFinish) {
            webWorker.terminate();
            warnNameLength(nameInput.value.length);
            startButton.onclick = () => window.saying(startButton);
        }
    };

    e.innerText = "중지";
    e.onclick = () => {
        webWorker.terminate();
        warnNameLength(nameInput.value.length);
        startButton.onclick = () => window.saying(startButton);
    };

    let startTime = performance.now();
    webWorker.postMessage({
        writingSystem: writingSystem.letterName,
        matchName: nameInput.value
    });
}
