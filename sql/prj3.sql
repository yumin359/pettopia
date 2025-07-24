-- 기존 테이블 제거 (있는 경우만)
DROP TABLE IF EXISTS board_file;
DROP TABLE IF EXISTS board_like;
DROP TABLE IF EXISTS comment;
DROP TABLE IF EXISTS board;
DROP TABLE IF EXISTS auth;
DROP TABLE IF EXISTS member;

-- 회원 테이블
CREATE TABLE member
(
    email       VARCHAR(255)           NOT NULL,
    password    VARCHAR(255)           NOT NULL,
    nick_name   VARCHAR(255) UNIQUE    NOT NULL,
    info        VARCHAR(3000)          NULL,
    inserted_at DATETIME DEFAULT NOW() NOT NULL,
    CONSTRAINT pk_member PRIMARY KEY (email)
);
-- PK 제약 조건 제거
ALTER TABLE member
    DROP PRIMARY KEY;
-- 새로운 PK 설정
ALTER TABLE member
    ADD COLUMN id BIGINT AUTO_INCREMENT PRIMARY KEY FIRST;
-- email에 UNIQUE 제약 조건 추가
ALTER TABLE member
    ADD CONSTRAINT UQ_member_email UNIQUE (email);
-- password NULL 로 설정
ALTER TABLE member
    MODIFY COLUMN password VARCHAR(255) NULL;
-- provider 추가
ALTER TABLE member
    ADD COLUMN provider VARCHAR(50) NULL;
-- provider_id 추가
ALTER TABLE member
    ADD COLUMN provider_id VARCHAR(255) NULL;
-- role 추가
ALTER TABLE member
    ADD COLUMN role VARCHAR(50) DEFAULT 'USER' NOT NULL;
-- 얜 아직 안 함
# ALTER TABLE member
#     ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL;

-- 회원 테이블 아래와 같이 바꿈
CREATE TABLE member
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(255)               NOT NULL UNIQUE,
    password    VARCHAR(255)               NULL,     -- 해싱된 비밀번호 저장, 외부 회원가입 하면 비밀번호 미제공으로 null로 설정
    nick_name   VARCHAR(255)               NOT NULL UNIQUE,
    info        VARCHAR(3000)              NULL,
    provider    VARCHAR(50)                NULL,     -- 'local', 'google', 'kakao' 등, 기본값 NULL
    provider_id VARCHAR(255)               NULL,     -- 소셜 로그인 시 해당 플랫폼의 사용자 고유 ID, 기본값 NULL
    role        VARCHAR(50) DEFAULT 'USER' NOT NULL, -- 'USER', 'ADMIN' 등
    inserted_at DATETIME    DEFAULT NOW()  NOT NULL
#     updated_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    # 아직 얘는 추가 안 함
    -- 만약 provider와 provider_id 조합으로 고유성을 보장하려면 아래와 같이 복합 UNIQUE 제약 조건 추가
    -- UNIQUE (provider, provider_id)
);

-- 권한 테이블
CREATE TABLE auth
(
    member_email VARCHAR(255) NOT NULL,
    auth_name    VARCHAR(255) NOT NULL,
    PRIMARY KEY (member_email, auth_name),
    FOREIGN KEY (member_email) REFERENCES member (email) ON DELETE CASCADE
);

-- 게시판 테이블
CREATE TABLE board
(
    id          INT AUTO_INCREMENT     NOT NULL,
    title       VARCHAR(300)           NOT NULL,
    content     VARCHAR(10000)         NOT NULL,
    author      VARCHAR(255)           NOT NULL,
    is_private  BOOLEAN  DEFAULT FALSE NOT NULL, -- 비공개 여부, 기본값은 공개(false)
    inserted_at DATETIME DEFAULT NOW() NOT NULL,
    CONSTRAINT pk_board PRIMARY KEY (id),
    FOREIGN KEY (author) REFERENCES member (email) ON DELETE CASCADE
);

-- 댓글 테이블
CREATE TABLE comment
(
    id          INT AUTO_INCREMENT     NOT NULL,
    board_id    INT                    NOT NULL,
    author      VARCHAR(255)           NOT NULL,
    comment     VARCHAR(2000)          NOT NULL,
    inserted_at DATETIME DEFAULT NOW() NOT NULL,
    CONSTRAINT pk_comment PRIMARY KEY (id),
    FOREIGN KEY (board_id) REFERENCES board (id) ON DELETE CASCADE,
    FOREIGN KEY (author) REFERENCES member (email) ON DELETE CASCADE
);

-- 대댓글 테이블
CREATE TABLE reply_comment
(
    id            INT AUTO_INCREMENT     NOT NULL,
    comment_id    INT                    NOT NULL, -- 부모 댓글 ID
    author        VARCHAR(255)           NOT NULL,
    reply_comment VARCHAR(2000)          NOT NULL,
    inserted_at   DATETIME DEFAULT NOW() NOT NULL,
    CONSTRAINT pk_reply_comment PRIMARY KEY (id),
    FOREIGN KEY (comment_id) REFERENCES comment (id) ON DELETE CASCADE,
    FOREIGN KEY (author) REFERENCES member (email) ON DELETE CASCADE
);

-- 좋아요 테이블
CREATE TABLE board_like
(
    board_id     INT          NOT NULL,
    member_email VARCHAR(255) NOT NULL,
    PRIMARY KEY (board_id, member_email),
    FOREIGN KEY (board_id) REFERENCES board (id) ON DELETE CASCADE,
    FOREIGN KEY (member_email) REFERENCES member (email) ON DELETE CASCADE
);

-- 파일 첨부 테이블
CREATE TABLE board_file
(
    board_id INT          NOT NULL,
    name     VARCHAR(300) NOT NULL,
    PRIMARY KEY (board_id, name),
    FOREIGN KEY (board_id) REFERENCES board (id) ON DELETE CASCADE
);

-- 관리자 계정 생성
INSERT INTO member (email, nick_name, password, inserted_at)
VALUES ('admin@email.com', 'admin', '1234', NOW());

-- 관리자 권한 부여
INSERT INTO auth (member_email, auth_name)
VALUES ('admin@email.com', 'admin');

-- 관리자 비밀번호 해시로 업데이트 (BCrypt된 비밀번호)
UPDATE member
SET password = '$2a$10$gdx4VSoqzsQ.AOHLIfbr2..zcar8fELPhWhuNiepTQns9GXi7h93u'
WHERE email = 'admin@email.com';