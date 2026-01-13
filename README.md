#  [[링크]](https://darkpppet.github.io/infinite-monkey/) 무한 원숭이 정리 시뮬레이터

### 사용기술
* vite with vanilla typescript
* tailwindcss, tailwindcss typography
* daisyui
* pnpm

### 무한 원숭이 정리란?
- [[설명 링크]](https://ko.wikipedia.org/wiki/%EB%AC%B4%ED%95%9C_%EC%9B%90%EC%88%AD%EC%9D%B4_%EC%A0%95%EB%A6%AC)

### 사용법
* 언어를 선택하고
* 이름을 입력한 뒤
* 버튼을 누르면 됩니다!

### 주의
이름이 길면 오래 걸릴 수 있습니다!

---

### history

#### ver 1.1
- 생성 중에는 이름 및 문자 변경이 불가능하도록 변경

#### ver 1.0
- webpack → vite로 변경
  - pnpm 사용
  - typescript 버전 업
- tailwindcss, daisyui 적용
- 속도, 메모리 성능 매우 개선 및 그에 따른 경고 길이/내용 수정
  - worker → main post를 이제 1/60초에 한 번씩 수행합니다.
  - worker 내부 문자열 저장 자료구조를 효율적으로 변경하였습니다. (string → Uint32Array)
- 키릴 문자 추가
- 걸린 시간 추가

#### ver 0.1
- 출시
