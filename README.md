# Scartch for JINI

### 차례
* 개발 전 주의사항
* 개발 환경 설정
    *  코드 준비 및 yarn  설치
    *  scratch-l10n 준비
    *  scratch-vm 준비
    *  scratch-gui 준비
    *  UI 확인

<br>

## 개발 전 주의사항
**&nbsp;&nbsp;모든 작업은 main, develop 브랜치에서 직접 하지 말고 개별 브랜치를 생성하여 작업 후 pull request를 이용하여 Merge 할 것.**
```bash
    $ git checkout -b [your branch name]
```

### 개발에 필요한 프로그램
* python&nbsp;&nbsp;v3.10.9
* node.js&nbsp;&nbsp;v16.19.1
* npm&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;v8.19.1

### 추천 코드 편집기
* Visual Studio Code

<br>

## 개발 환경 설정
### 1. 코드 준비 및 yarn 설치
* Git 원격저장소에서 코드 다운로드
    ```bash
    $ git clone https://github.com/JiniRobots/Scratch_for_JINI
    ```
* yarn 설치
    ```bash
    $ npm install -g yarn
    ```

### 2. scratch-l10n 준비
**&nbsp;&nbsp;&nbsp;scratch-l10n에서 언어 번역 관련 코드 수정 시 반드시 'yarn build 및 'yarn link'를 진행할 것.**

* scratch-l10n 폴더로 이동
    ```bash
    $ cd scratch-l10n
    ```
* scratch-l10n에 node_modules 설치
    ```bash
    $ yarn
    ```
* yarn 빌드
    ```bash
    $ yarn build
    ```
* 프로젝트 연결
    ```
    $ yarn link
    ```

### 3. scratch-vm 준비

* scratch-vm 폴더로 이동
    ```bash
    $ cd scratch-vm
    ```
* scratch-vm에 node_modules 설치
    ```bash
    $ yarn
    ```
* ml5 라이브러리 설치(인공지능 관련 라이브러리).
    ```bash
    $ npm install ml5
    ```
* 프로젝트 연결
    ```bash
    $ yarn link
    ```

### 4. scratch-gui 준비

* scratch-gui 폴더로 이동
    ```bash
    $ cd scratch-gui
    ```
* scratch-gui에 node_modules 설치
    ```bash
    $ yarn
    ```
* scratch-vm을 연결
    ```bash
    $ yarn link scratch-l10n scratch-vm
    ```
* yarn 실행
    ```bash
    $ yarn start
    ```

### 5. UI 확인
* Chromium 기반 브라우저(chrome, Edge)에서 아래 주소로 접속
    * http://localhost:8601<br>
    또는
    * http://127.0.0.1:8601<br>