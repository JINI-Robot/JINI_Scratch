# Scartch for JINI

## 차례
* 개발 전 확인
* 개발 환경 설정
    *  코드 준비
    *  scratch-l10n 준비
    *  scratch-vm 준비
    *  scratch-gui 준비
    *  UI 확인
* 프로젝트 빌드 및 패키징
    * 빌드
    * 패키징

<br>

## 개발 전 확인

* main 브랜치 : 배포 코드
* develop 브랜치(default) : 배포 전 최종 병합 코드
  
|작업|병합 및 테스트|배포|tag|
|----|:------------:|-----|-----|
|개별 브랜치 1|develop|main|release-vx.x.x|
|개별 브랜치 2|develop|main|release-vx.x.y|
|개별 브랜치 3|develop|main|release-vx.x.z|

### 개발 환경 설정 전 사전 준비(개발 환경 구축 당시 버전)
* python&nbsp;&nbsp;v3.7.4
* node.js&nbsp;&nbsp;v16.9.1
* npm&nbsp;&nbsp;v8.19.3
* yarn&nbsp;&nbsp;v1.22.19
* electron&nbsp;&nbsp;v26.2.2
* git&nbsp;&nbsp;v2.42.0

<br>

## 개발 환경 설정
### 1. 코드 준비
* Git 원격저장소에서 코드 다운로드
    ```bash
    $ git clone https://github.com/JINI-Robot/JINI_Scratch.git
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
* ml5 라이브러리 설치(인공지능 관련 라이브러리)
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

### 5. UI 및 기능 동작 확인
* Chromium 기반 브라우저(chrome, Edge)에서 아래 주소로 접속
    * http://localhost:8601<br>
    또는
    * http://127.0.0.1:8601<br>

## 프로젝트 빌드 및 패키징
### 1. 빌드
* scratch-gui 폴더로 이동 후 프로젝트 빌드
    ```bash
    $ cd scratch-gui
    $ yarn build
    ```

### 2. 패키징
* scratch-gui > build 폴더를 scratch-app 폴더로 복사
* scratch-app 폴더로 이동
    ```bash
    $ cd ..          // scratch-gui의 상위 폴더로 이동
    $ cd scratch-app // scratch-app 폴더로 이동
    ```

* scratch-app에 node_modules 설치
    ```bash
    $ yarn
    ```

* 복사된 scratch-app > build 폴더의 프로그램 실행 확인(생략 가능)
    ```bash
    $ yarn start
    ```

* 패키징(아래 명령어 중 해당 OS에 맞게 입력)
    ```bash
    $ yarn dist:osx    // MAC
    $ yarn dist:linux  // linux x32 and x64
    $ yarn dist:win    // windows x32 and x64 
    ```

* 생성된 설치 파일 확인
    - 경로 : [project path]\scratch-app\dist