"use strict";
//Elements
const nameInput = document.getElementById("name");
const expectedLetterCount = document.getElementById("expected-letter-count");
const totalLetterCount = document.getElementById("total-letter-count");
const warnOutput = document.getElementById("warn");
const monkeySaid = document.getElementById("monkey-said");
const letterCount = document.getElementById("said-letter-count");
const startButton = document.getElementById("start-button");
const letterWarn = document.getElementById("letter-warn");
let writingSystem = hangul;
nameInput.value = writingSystem.defaultName;
//기댓값 문자열로 반환 함수; '기댓값: xx글자'
function returnExpectedValueString(letterCount, nameLength) {
    return `기댓값: ${Math.pow(letterCount, nameLength).toLocaleString()}글자`;
}
//입력 길이에 따른 경고 출력 함수
function warnNameLength(nameLength) {
    startButton.innerText = nameLength >= writingSystem.warnLength ? "⚠️시작" : "시작";
    warnOutput.style.display = nameLength >= writingSystem.warnLength ? "block" : "none";
}
//input's oninput
function filterName(e) {
    //선택된 언어 외 글자 입력시 빨갛게 만듬
    if (writingSystem.filterRegex.test(e.value)) {
        nameInput.style.outlineColor = 'red';
        letterWarn.innerText = `※${writingSystem.letterNameKorean}만 입력할 수 있습니다.※`;
        letterWarn.style.visibility = "visible";
    }
    else {
        nameInput.style.outlineColor = 'black';
        letterWarn.style.visibility = "hidden";
    }
    e.value = e.value.replace(writingSystem.filterRegex, ''); //선택된 언어 외 글자 입력 차단
    expectedLetterCount.innerText = returnExpectedValueString(writingSystem.letterCount, e.value.length); //입력에 따라 기댓값 갱신
    warnNameLength(e.value.length); //입력에 따라 길이 경고 갱신
}
//input's onfocusout
function changeName(e) {
    nameInput.style.outlineColor = 'black'; //filterName에서 빨갛게 만들었던거 원상복구
    letterWarn.style.visibility = "hidden";
    //한글일 경우, 자음이나 모음만 있을 경우 제거 및 갱신
    if (writingSystem.letterName === "hangul") {
        e.value = e.value.replace(writingSystem.filterRegex2, '');
        warnNameLength(e.value.length);
        expectedLetterCount.innerText = returnExpectedValueString(writingSystem.letterCount, e.value.length);
    }
}
//radio's onchange
function changeWritingSystem(e) {
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
function saying(e) {
    monkeySaid.style.height = "15px";
    const webWorker = new Worker("js/saying.js");
    webWorker.onmessage = (message) => {
        monkeySaid.innerHTML = message.data.said;
        letterCount.innerText = message.data.count.toLocaleString();
        if (message.data.isFinish) {
            webWorker.terminate();
            warnNameLength(nameInput.value.length);
            startButton.onclick = () => saying(startButton);
        }
        ;
    };
    e.innerText = "중지";
    e.onclick = () => {
        webWorker.terminate();
        warnNameLength(nameInput.value.length);
        startButton.onclick = () => saying(startButton);
    };
    webWorker.postMessage({
        writingSystem: writingSystem.letterName,
        matchName: nameInput.value,
    });
}
