/* 
 * main.ts
 * html에서 바인딩 하는 함수들 정의해놓은 파일
 */

import WritingSystem, { hangul, alphanumeric, kana } from "./language";

//Elements
const nameInput = <HTMLInputElement>document.getElementById("name");
const expectedLetterCount = <HTMLElement>document.getElementById("expected-letter-count");
const totalLetterCount = <HTMLElement>document.getElementById("total-letter-count");
const warnOutput = <HTMLElement>document.getElementById("warn");
const monkeySaid = <HTMLElement>document.getElementById("monkey-said");
const letterCount = <HTMLElement>document.getElementById("said-letter-count");
const startButton = <HTMLButtonElement>document.getElementById("start-button");
const letterWarn = <HTMLElement>document.getElementById("letter-warn");

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
        e.value = e.value.replace(<RegExp>writingSystem.filterRegex2, '');
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
    }

    nameInput.value = writingSystem.defaultName;

    totalLetterCount.innerText = "글자 개수: " + writingSystem.letterCountText;
    expectedLetterCount.innerText = returnExpectedValueString(writingSystem.letterCount, nameInput.value.length);
    warnNameLength(nameInput.value.length);
}

//button's onclick
window.saying = (e: HTMLButtonElement): void => {
    monkeySaid.style.height = "15px";

    let onMonkeySaid: string = "";
    let onLetterCount: string = "0";
    let isFinish: boolean = false;

    const render = (): void => {
        monkeySaid.innerHTML = onMonkeySaid;
        letterCount.innerText = onLetterCount;

        if (!isFinish) {
            requestAnimationFrame(render);
        }
    }

    const webWorker = new Worker(new URL('./worker.ts', import.meta.url));
    webWorker.onmessage = (message) => {
        onMonkeySaid = message.data.said;
        onLetterCount = message.data.count.toLocaleString();

        if (message.data.isFinish) {
            isFinish = true;
            webWorker.terminate();
            warnNameLength(nameInput.value.length);
            startButton.onclick = () => window.saying(startButton);
        };
    };

    e.innerText = "중지";
    e.onclick = () => {
        webWorker.terminate();
        warnNameLength(nameInput.value.length);
        startButton.onclick = () => window.saying(startButton);
    };

    render();

    webWorker.postMessage({
        writingSystem: writingSystem.letterName,
        matchName: nameInput.value,
    });
}
