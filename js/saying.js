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
//main
const maxLength = 30;
self.onmessage = (e) => {
    let writingSystem = hangul;
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
    let matchName = e.data.matchName;
    let monkeySaid = "";
    let saidCount = 0;
    while (monkeySaid.slice(-matchName.length) !== matchName) {
        monkeySaid += writingSystem.generateRandomCharacter();
        saidCount++;
        if (monkeySaid.length > maxLength) {
            monkeySaid = monkeySaid.slice(-maxLength);
        }
        self.postMessage({
            said: monkeySaid,
            count: saidCount,
            isFinish: false,
        });
    }
    self.postMessage({
        said: monkeySaid.slice(0, -matchName.length) + "<span style='color: red;'><b>" + monkeySaid.slice(-matchName.length) + "</b></span>",
        count: saidCount,
        isFinish: true,
    });
};
