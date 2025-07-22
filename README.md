# 🐾 Pet-topia: 우리 동네 반려동물 정보 플랫폼 🐾

---

## 💡 프로젝트 소개

우리 동네 반려동물을 위한 모든 정보를 한곳에서! `Pet-topia`는 반려동물 보호자와 예비 보호자들을 위한 올인원 정보 제공 서비스입니다. 유기동물 입양 정보부터 반려동물 동반 시설, 병원, 미용실, 펫시터 등 다양한 정보를 손쉽게 찾아보고 공유할 수 있는 커뮤니티 플랫폼을 목표로 합니다.

* **서비스 주요 기능:**
    * **유기동물 입양 정보:** 보호소별 유기동물 정보 조회 및 입양 신청 지원
    * **반려동물 동반 시설 정보:** 카페, 식당, 숙소 등 반려동물 동반 가능 시설 검색 및 정보 제공
    * **반려동물 전문 서비스:** 병원, 미용실, 펫시터 등 주변 서비스 업체 검색 및 예약 기능 (예정)
    * **커뮤니티:** 정보 공유, Q&A, 자랑하기 등 보호자 간 소통 공간

---

## 🚀 기술 스택

이 프로젝트는 자바 풀스택 개발을 기반으로 안정적이고 확장 가능한 서비스를 구축합니다.

### Backend
* **Java 17**
* **Spring Boot 3.x**
    * Spring Data JPA
    * Spring Security
    * Spring Web
    * Lombok
* **MariaDB (AWS RDS)**
* **Gradle** (빌드 도구)

### Frontend
* **React.js**
* **JavaScript (ES6+)**
* **HTML5 / CSS3**
* **Axios** (API 통신)
* **NPM / Yarn** (패키지 매니저)

### Deployment & Tools
* **AWS EC2** (애플리케이션 배포)
* **AWS RDS** (데이터베이스)
* **Git / GitHub** (버전 관리 및 협업)
* **IntelliJ IDEA** (개발 환경)
* **DBeaver / MySQL Workbench** (DB 관리 툴)
* **Postman** (API 테스트)

---

## 🛠️ 개발 환경 설정

프로젝트를 로컬에서 실행하기 위한 개발 환경 설정 가이드입니다.

1.  **Java Development Kit (JDK) 17 설치:**
    * [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) 또는 [Adoptium Temurin](https://adoptium.net/temurin/releases/) 등 선호하는 JDK 17 버전을 설치합니다.
    * `JAVA_HOME` 환경 변수를 설정합니다.
2.  **Node.js 및 NPM/Yarn 설치:**
    * [Node.js 공식 웹사이트](https://nodejs.org/en/download/)에서 LTS 버전을 설치합니다. NPM은 Node.js 설치 시 자동으로 포함됩니다.
    * (선택 사항) Yarn을 사용하려면 `npm install -g yarn` 명령어로 설치합니다.
3.  **IntelliJ IDEA 설치 및 설정:**
    * [IntelliJ IDEA Community 또는 Ultimate 버전](https://www.jetbrains.com/idea/download/)을 설치합니다.
    * `Lombok Plugin`을 설치합니다.
    * Gradle 프로젝트로 Import 합니다.
4.  **데이터베이스 설정 (MariaDB):**
    * **AWS RDS MariaDB 인스턴스 정보:**
        * **엔드포인트:** `your-rds-endpoint.ap-northeast-2.rds.amazonaws.com` (예시)
        * **포트:** `3306`
        * **데이터베이스명:** `pet-topia-db` (또는 팀에서 정한 이름)
        * **애플리케이션 사용자명:** `pet_app_user` (예시)
        * **애플리케이션 비밀번호:** `your_app_password` (예시)
    * DBeaver 등 DB 클라이언트를 이용하여 위 정보로 RDS에 접속한 후, `pet-topia-db` 스키마(데이터베이스)를 생성하고 `pet_app_user`에게 해당 스키마에 대한 권한을 부여합니다.
    * **`application.properties` (또는 `application.yml`) 설정:**
        ```properties
        spring.datasource.url=jdbc:mariadb://[your-rds-endpoint.ap-northeast-2.rds.amazonaws.com:3306/pet-topia-db?useSSL=false](https://your-rds-endpoint.ap-northeast-2.rds.amazonaws.com:3306/pet-topia-db?useSSL=false)
        spring.datasource.username=pet_app_user
        spring.datasource.password=your_app_password
        spring.jpa.hibernate.ddl-auto=update # 개발 단계에서만 사용, 운영 시에는 none 또는 validate
        spring.jpa.show-sql=true
        spring.jpa.properties.hibernate.format_sql=true
        ```
        **주의:** 민감한 정보(비밀번호)는 실제 배포 시 환경 변수나 AWS Secrets Manager를 사용해야 합니다.
5.  **백엔드 (Spring Boot) 실행:**
    * IntelliJ IDEA에서 `PetTopiaApplication.java` 파일을 열고 Run 버튼을 클릭합니다.
    * 또는 프로젝트 루트에서 터미널을 열고 `./gradlew bootRun` 명령어를 실행합니다.
6.  **프론트엔드 (React) 실행:**
    * 프로젝트의 `frontend` (또는 `client`, `web`) 디렉토리로 이동합니다.
    * 터미널에서 `npm install` 또는 `yarn install`을 실행하여 의존성을 설치합니다.
    * `npm start` 또는 `yarn start` 명령어를 실행합니다. (기본적으로 `http://localhost:3000`에서 실행됩니다.)

---

## 👥 팀원

저희 `Pet-topia` 프로젝트는 다음 팀원들과 함께합니다.

* **팀장:** 최지원
* **팀원:** 신유민
* **팀원:** 전석윤

---

## 📝 커밋 컨벤션

Git 커밋 메시지는 다음 컨벤션을 따릅니다.

* **feat:** 새로운 기능 추가
* **fix:** 버그 수정
* **docs:** 문서 수정 (README, 주석 등)
* **style:** 코드 스타일, 포맷 변경 (코드 로직 변경 없음)
* **refactor:** 코드 리팩토링 (기능 변경 없음)
* **test:** 테스트 코드 추가 또는 수정
* **build:** 빌드 관련 파일 수정 (gradle, dependency 등)
* **ci:** CI/CD 설정 변경
* **chore:** 기타 변경 사항 (설정 파일, 라이브러리 설치 등)
* **design:** UI/UX 디자인 변경

**예시:**
