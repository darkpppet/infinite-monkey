/*
 * window.ts
 * gloabl의 window에 정의 추가해주는 모듈
 * html에서 이벤트 바로 바인딩 할 수 있도록 만들어줌
 */

export {};

declare global {
    interface Window {
        filterName: (e: HTMLInputElement) => void;
        changeName: (e: HTMLInputElement) => void;
        changeWritingSystem: (e: HTMLInputElement) => void;
        saying: (e: HTMLButtonElement) => void;
    }
}
