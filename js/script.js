"use strict";
const hangul = {
    letterName: "hangul",
    letterNameKorean: "한글",
    defaultName: "설",
    filterRegex: /[^ㄱ-ㅎㅏ-ㅣ가-힣]/g,
    filterRegex2: /[^가-힣]/g,
    codeRange: [[0xAC00, 0xD7A3]],
    letterCount: 11172,
    letterCountText: "11,172자",
    warnLength: 2,
    generateRandomCharacter() {
        const minUnicode = Math.ceil(0xAC00);
        const maxUnicode = Math.floor(0xD7A3);
        const unicode = Math.floor(Math.random() * (maxUnicode - minUnicode + 1)) + minUnicode;
        return String.fromCharCode(unicode);
    }
};
const alphanumeric = {
    letterName: "alphanumeric",
    letterNameKorean: "알파벳과 숫자",
    defaultName: "Icy",
    filterRegex: /[^0-9A-Za-z]/g,
    codeRange: [[0x0030, 0x0039], [0x0041, 0x005A], [0x0061, 0x007A]],
    letterCount: 10 + 26 + 26,
    letterCountText: "10자(숫자) + 26자(대문자) + 26자(소문자)",
    warnLength: 4,
    generateRandomCharacter() {
        const minUnicode = Math.ceil(0x0030);
        const maxUnicode = Math.floor(0x006D);
        let unicode = Math.floor(Math.random() * (maxUnicode - minUnicode + 1)) + minUnicode;
        if (unicode >= 0x003A && unicode <= 0x0053) {
            unicode += 0x0007;
        }
        else if (unicode >= 0x0054 && unicode <= 0x006C) {
            unicode += 0x000D;
        }
        return String.fromCharCode(unicode);
    }
};
const kana = {
    letterName: "kana",
    letterNameKorean: "히라가나와 가타카나",
    defaultName: "ゆき",
    filterRegex: /[^ぁ-ゔァ-ヺ]/g,
    codeRange: [[0x3041, 0x3094], [0x30A1, 0x30FA]],
    letterCount: 84 + 90,
    letterCountText: "84자(히라가나) + 90자(가타카나)",
    warnLength: 3,
    generateRandomCharacter() {
        const minUnicode = Math.ceil(0x3041);
        const maxUnicode = Math.floor(0x30EE);
        let unicode = Math.floor(Math.random() * (maxUnicode - minUnicode + 1)) + minUnicode;
        if (unicode >= 0x3095 && unicode <= 0x30EE) {
            unicode += 0x000C;
        }
        return String.fromCharCode(unicode);
    }
};
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
    //선택된 언어 외 글자 입력시 경고
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
    //filterName에서 경고한거 원상복구
    nameInput.style.outlineColor = 'black';
    letterWarn.style.visibility = "hidden";
    //한글일 때, 자음이나 모음만 있을 경우 제거 및 갱신
    if (writingSystem.filterRegex2) {
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
        requestAnimationFrame(() => {
            monkeySaid.innerHTML = message.data.said;
            letterCount.innerText = message.data.count.toLocaleString();
        });
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
