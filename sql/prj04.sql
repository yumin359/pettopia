# -- 회원 테이블
# CREATE TABLE member
# (
#     email       VARCHAR(255)           NOT NULL,
#     password    VARCHAR(255)           NOT NULL,
#     nick_name   VARCHAR(255) UNIQUE    NOT NULL,
#     info        VARCHAR(3000)          NULL,
#     inserted_at DATETIME DEFAULT NOW() NOT NULL,
#     CONSTRAINT pk_member PRIMARY KEY (email)
# );
# -- PK 제약 조건 제거
# ALTER TABLE member
#     DROP PRIMARY KEY;
# -- 새로운 PK 설정
# ALTER TABLE member
#     ADD COLUMN id BIGINT AUTO_INCREMENT PRIMARY KEY FIRST;
# -- email에 UNIQUE 제약 조건 추가
# ALTER TABLE member
#     ADD CONSTRAINT UQ_member_email UNIQUE (email);
# -- password NULL 로 설정
# ALTER TABLE member
#     MODIFY COLUMN password VARCHAR(255) NULL;
# -- provider 추가
# ALTER TABLE member
#     ADD COLUMN provider VARCHAR(50) NULL;
# -- provider_id 추가
# ALTER TABLE member
#     ADD COLUMN provider_id VARCHAR(255) NULL;
# -- role 추가
# ALTER TABLE member
#     ADD COLUMN role VARCHAR(50) DEFAULT 'USER' NOT NULL;
# -- 얜 아직 안 함
# # ALTER TABLE member
# #     ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL;
#
# -- 회원 테이블 아래와 같이 바꿈
# CREATE TABLE member
# (
#     id          BIGINT AUTO_INCREMENT PRIMARY KEY,
#     email       VARCHAR(255)               NOT NULL UNIQUE,
#     password    VARCHAR(255)               NULL,     -- 해싱된 비밀번호 저장, 외부 회원가입 하면 비밀번호 미제공으로 null로 설정
#     nick_name   VARCHAR(255)               NOT NULL UNIQUE,
#     info        VARCHAR(3000)              NULL,
#     provider    VARCHAR(50)                NULL,     -- 'local', 'google', 'kakao' 등, 기본값 NULL
#     provider_id VARCHAR(255)               NULL,     -- 소셜 로그인 시 해당 플랫폼의 사용자 고유 ID, 기본값 NULL
#     role        VARCHAR(50) DEFAULT 'USER' NOT NULL, -- 'USER', 'ADMIN' 등
#     inserted_at DATETIME    DEFAULT NOW()  NOT NULL
# );
# #     updated_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
# # 아직 얘는 추가 안 함
# -- 만약 provider와 provider_id 조합으로 고유성을 보장하려면 아래와 같이 복합 UNIQUE 제약 조건 추가
# -- UNIQUE (provider, provider_id)
#
# # ---------------------------------------------------------------------------------
#
# -- 권한 테이블
# CREATE TABLE auth
# (
#     member_email VARCHAR(255) NOT NULL,
#     auth_name    VARCHAR(255) NOT NULL,
#     PRIMARY KEY (member_email, auth_name),
#     FOREIGN KEY (member_email) REFERENCES member (email) ON DELETE CASCADE
# );
# -- 1. 기존 FK 제약 조건 제거 (제약 조건 이름은 SHOW CREATE TABLE auth; 로 확인)
# SHOW CREATE TABLE auth; -- auth_ibfk_1 이거 나옴
# ALTER TABLE auth
#     DROP FOREIGN KEY auth_ibfk_1;
# -- 삭제 돼서 빨간줄 뜬다
#
# -- 2. 기존 PK 제약 조건 제거
# ALTER TABLE auth
#     DROP PRIMARY KEY;
#
# -- 3. member_id 컬럼 추가
# ALTER TABLE auth
#     ADD COLUMN member_id BIGINT NOT NULL;
#
# -- 4. 데이터 마이그레이션: member_email을 통해 member_id 채우기
# UPDATE auth a
#     JOIN member m ON a.member_email = m.email
# SET a.member_id = m.id;
# -- email도, 그리고 id도 unique 니까 그냥 다 바꿔도 됨
#
# -- 5. member_email 컬럼 제거 (선택 사항, 필요 없으면 제거)
# ALTER TABLE auth
#     DROP COLUMN member_email;
# -- 지움 얘는 그래도 지워도 상관없을 것 같긴 함
#
# -- 6. 새로운 PK 제약 조건 추가
# ALTER TABLE auth
#     ADD PRIMARY KEY (member_id, auth_name);
#
# -- 7. 새로운 FK 제약 조건 추가
# ALTER TABLE auth
#     ADD CONSTRAINT FK_auth_member_id
#         FOREIGN KEY (member_id) REFERENCES member (id) ON DELETE CASCADE;
#
# # 완성된 auth 테이블
# create table prj04.auth
# (
#     auth_name varchar(255) not null,
#     member_id bigint       not null,
#     primary key (member_id, auth_name),
#     constraint FK_auth_member_id
#         foreign key (member_id) references prj04.member (id)
#             on delete cascade
# );
# create table prj04.auth
# (
#     auth_name    varchar(255) not null,
#     member_id    bigint       not null,
#     member_email varchar(255) not null,
#     primary key (member_id, auth_name),
#     constraint FK_auth_member_id
#         foreign key (member_id) references prj04.member (id)
#             on delete cascade
# );
#
# ALTER TABLE auth
#     DROP COLUMN member_email;
#
# create table prj04.auth
# (
#     auth_name varchar(255) not null,
#     member_id bigint       not null,
#     primary key (member_id, auth_name),
#     constraint FK_auth_member_id
#         foreign key (member_id) references prj04.member (id)
#             on delete cascade
# );
#
#
# # ---------------------------------------------------------------------------------
#
# -- 게시판 테이블
# CREATE TABLE board
# (
#     id          INT AUTO_INCREMENT     NOT NULL,
#     title       VARCHAR(300)           NOT NULL,
#     content     VARCHAR(10000)         NOT NULL,
#     author      VARCHAR(255)           NOT NULL,
#     is_private  BOOLEAN  DEFAULT FALSE NOT NULL, -- 비공개 여부, 기본값은 공개(false)
#     inserted_at DATETIME DEFAULT NOW() NOT NULL,
#     CONSTRAINT pk_board PRIMARY KEY (id),
#     FOREIGN KEY (author) REFERENCES member (email) ON DELETE CASCADE
# );
# -- 1. 기존 FK 제약 조건 제거 (제약 조건 이름은 SHOW CREATE TABLE board; 로 확인)
# SHOW CREATE TABLE board;
# ALTER TABLE board
#     DROP FOREIGN KEY board_ibfk_1;
#
# -- 2. author_member_id 컬럼 추가 (충돌 방지를 위해 author_member_id로 명명)
# ALTER TABLE board
#     ADD COLUMN author_member_id BIGINT NOT NULL;
#
# -- 3. 데이터 마이그레이션: author(email)를 통해 member_id 채우기
# UPDATE board b
#     JOIN member m ON b.author = m.email
# SET b.author_member_id = m.id;
#
# -- 4. author 컬럼 제거 (선택 사항, 필요 없으면 제거)
# ALTER TABLE board
#     DROP COLUMN author;
# -- 일단 냅둠 아마 나중에 지워야하지 않을까
#
# -- 5. 새로운 FK 제약 조건 추가
# ALTER TABLE board
#     ADD CONSTRAINT FK_board_author_member_id
#         FOREIGN KEY (author_member_id) REFERENCES member (id) ON DELETE CASCADE;
#
#
# -- author fk 삭제
# ALTER TABLE board
#     DROP FOREIGN KEY FKhcuk8g1so4urnbhi2mtq0gw82;
# -- author 컬럼 삭제
# ALTER TABLE board
#     DROP COLUMN author;
#
# -- 작성자 컬럼명 변경
# ALTER TABLE board RENAME COLUMN author_member_id TO author;
#
# # 완성된 board
# create table prj04.board
# (
#     id          int auto_increment
#         primary key,
#     title       varchar(255)                           null,
#     content     varchar(255)                           null,
#     is_private  tinyint(1) default 0                   not null,
#     inserted_at datetime   default current_timestamp() not null,
#     author      bigint                                 not null,
#     constraint FK_board_author_member_id
#         foreign key (author) references prj04.member (id)
#             on delete cascade
# );
# -- 참조하는 거는 타입이 같아야 한대서 author 가 bigint로 되어있음
# -- 가져올 때만 잘 가져오면 되는 듯
#
# SHOW CREATE TABLE board;
# ALTER TABLE board
#     DROP FOREIGN KEY FKr892y1856tug5ylld6ytg2akw;
# ALTER TABLE board
#     DROP COLUMN author_member_id;
#
# create table prj04.board
# (
#     id          int auto_increment
#         primary key,
#     title       varchar(255)                           null,
#     content     varchar(255)                           null,
#     is_private  tinyint(1) default 0                   not null,
#     inserted_at datetime   default current_timestamp() not null,
#     author      bigint                                 not null,
#     constraint FK_board_author_member_id
#         foreign key (author) references prj04.member (id)
#             on delete cascade
# );
#
#
#
# # ---------------------------------------------------------------------------------
# -- 댓글 테이블
# CREATE TABLE comment
# (
#     id          INT AUTO_INCREMENT     NOT NULL,
#     board_id    INT                    NOT NULL,
#     author      VARCHAR(255)           NOT NULL,
#     comment     VARCHAR(2000)          NOT NULL,
#     inserted_at DATETIME DEFAULT NOW() NOT NULL,
#     CONSTRAINT pk_comment PRIMARY KEY (id),
#     FOREIGN KEY (board_id) REFERENCES board (id) ON DELETE CASCADE,
#     FOREIGN KEY (author) REFERENCES member (email) ON DELETE CASCADE
# );
# -- 1. 기존 FK 제약 조건 제거
# SHOW CREATE TABLE comment;
# ALTER TABLE comment
#     DROP FOREIGN KEY comment_ibfk_2;
#
# -- 2. author_member_id 컬럼 추가
# ALTER TABLE comment
#     ADD COLUMN author_member_id BIGINT NOT NULL;
#
# -- 3. 데이터 마이그레이션
# UPDATE comment c
#     JOIN member m ON c.author = m.email
# SET c.author_member_id = m.id;
#
# -- 4. author 컬럼 제거 (선택 사항)
# ALTER TABLE comment
#     DROP COLUMN author;
# -- 안 지움 얘도 필요할듯?
#
# -- 5. 새로운 FK 제약 조건 추가
# ALTER TABLE comment
#     ADD CONSTRAINT FK_comment_author_member_id
#         FOREIGN KEY (author_member_id) REFERENCES member (id) ON DELETE CASCADE;
#
# SHOW CREATE TABLE comment;
# -- author 에 있는 참조 제거
# ALTER TABLE comment
#     DROP FOREIGN KEY FK1p7wco1f9ni3w0rrbl5opcs5;
# -- author 컬럼 제거
# ALTER TABLE comment
#     DROP COLUMN author;
# -- 컬럼명 변경
# ALTER TABLE comment
#     CHANGE author_member_id author BIGINT NOT NULL;
# # 완성된 comment
# create table prj04.comment
# (
#     id          int auto_increment
#         primary key,
#     board_id    int                                  not null,
#     comment     varchar(255)                         null,
#     inserted_at datetime default current_timestamp() not null,
#     author      bigint                               not null,
#     constraint FK_comment_author_member_id
#         foreign key (author) references prj04.member (id)
#             on delete cascade,
#     constraint comment_ibfk_1
#         foreign key (board_id) references prj04.board (id)
#             on delete cascade
# );
#
# create index board_id
#     on prj04.comment (board_id);
#
#
#
# # ---------------------------------------------------------------------------------
# -- 대댓글 테이블 -> 아직 안 만든 듯?
# CREATE TABLE reply_comment
# (
#     id            INT AUTO_INCREMENT     NOT NULL,
#     comment_id    INT                    NOT NULL, -- 부모 댓글 ID
#     author        VARCHAR(255)           NOT NULL,
#     reply_comment VARCHAR(2000)          NOT NULL,
#     inserted_at   DATETIME DEFAULT NOW() NOT NULL,
#     CONSTRAINT pk_reply_comment PRIMARY KEY (id),
#     FOREIGN KEY (comment_id) REFERENCES comment (id) ON DELETE CASCADE,
#     FOREIGN KEY (author) REFERENCES member (email) ON DELETE CASCADE
# );
# # SHOW CREATE TABLE reply_comment;
# # -- 1. 기존 FK 제약 조건 제거
# # ALTER TABLE reply_comment
# #     DROP FOREIGN KEY reply_comment_ibfk_2;
# # -- 또는 실제 제약 조건 이름
# #
# # -- 2. author_member_id 컬럼 추가
# # ALTER TABLE reply_comment
# #     ADD COLUMN author_member_id BIGINT NOT NULL;
# #
# # -- 3. 데이터 마이그레이션
# # UPDATE reply_comment rc
# #     JOIN member m ON rc.author = m.email
# # SET rc.author_member_id = m.id;
# #
# # -- 4. author 컬럼 제거 (선택 사항)
# # ALTER TABLE reply_comment
# #     DROP COLUMN author;
# #
# # -- 5. 새로운 FK 제약 조건 추가
# # ALTER TABLE reply_comment
# #     ADD CONSTRAINT FK_reply_comment_author_member_id
# #         FOREIGN KEY (author_member_id) REFERENCES member (id) ON DELETE CASCADE;
#
#
# # ---------------------------------------------------------------------------------
# -- 좋아요 테이블
# CREATE TABLE board_like
# (
#     board_id  INT    NOT NULL,
#     member_id BIGINT NOT NULL,
#     PRIMARY KEY (board_id, member_id),
#     FOREIGN KEY (board_id) REFERENCES board (id) ON DELETE CASCADE,
#     FOREIGN KEY (member_id) REFERENCES member (id) ON DELETE CASCADE
# );
# -- 제약사항 확인 후 board_like에 있던 member_email 삭제 후 member_id로
# SHOW CREATE TABLE board_like;
# ALTER TABLE board_like
#     DROP FOREIGN KEY FKbqb0t5x7xin0ikshr6cnm8puj;
# ALTER TABLE board_like
#     DROP COLUMN member_email;
# # ---------------------------------------------------------------------------------
#
# -- 파일 첨부 테이블
# CREATE TABLE board_file
# (
#     board_id INT          NOT NULL,
#     name     VARCHAR(300) NOT NULL,
#     PRIMARY KEY (board_id, name),
#     FOREIGN KEY (board_id) REFERENCES board (id) ON DELETE CASCADE
# );
# # 얘는 member 직접 참조 안 해서 수정 X
#
# # ---------------------------------------------------------------------------------
#
# -- 회원 프로필 사진 첨부 테이블
# CREATE TABLE member_file
# (
#     member_id BIGINT       NOT NULL,
#     name      VARCHAR(300) NOT NULL,
#     PRIMARY KEY (member_id, name),
#     FOREIGN KEY (member_id) REFERENCES member (id) ON DELETE CASCADE
# );
#
#
# # ---------------------------------------------------------------------------------
#
# SHOW CREATE TABLE auth;
# ALTER TABLE auth
#     DROP COLUMN member_email;
# SHOW CREATE TABLE board_like;
# ALTER TABLE board_like
#     DROP COLUMN member_email;
#
#
# # ---------------------------------------------------------------------------------
# create table prj04.review
# (
#     id            int auto_increment
#         primary key,
#     facility_name varchar(255)                         not null,
#     member_email  varchar(255)                         not null,
#     review        varchar(2000)                        not null,
#     rating        int                                  not null,
#     inserted_at   datetime default current_timestamp() not null,
#     constraint review_ibfk_1
#         foreign key (member_email) references prj04.member (email)
#             on delete cascade
# );
#
# create index member_email
#     on prj04.review (member_email);
#
#
# # ---------------------------------------------------------------------------------
# # 리뷰 사진
# CREATE TABLE review_file
# (
#     review_id INT          NOT NULL,
#     name      VARCHAR(300) NOT NULL,
#     PRIMARY KEY (review_id, name),
#     FOREIGN KEY (review_id) REFERENCES review (id) ON DELETE CASCADE
# );
# # ---------------------------------------------------------------------------------
#
# CREATE TABLE review_like
# (
#     review_id INT    NOT NULL,
#     member_id BIGINT NOT NULL,
#     PRIMARY KEY (review_id, member_id),
#     FOREIGN KEY (review_id) REFERENCES review (id) ON DELETE CASCADE,
#     FOREIGN KEY (member_id) REFERENCES member (id) ON DELETE CASCADE
# );
#
# CREATE TABLE support
# (
#     id          BIGINT AUTO_INCREMENT PRIMARY KEY,
#     email       VARCHAR(255)   NOT NULL,
#     title       VARCHAR(300)   NOT NULL,
#     content     VARCHAR(10000) NOT NULL,
#     inserted_at DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
# );
#
# # ---------------------------------------------------------------------------------
# -- 관리자 계정 생성
# INSERT INTO member (email, nick_name, password, inserted_at)
# VALUES ('admin@email.com', 'admin', '1234', NOW());
#
# -- 관리자 권한 부여
# INSERT INTO auth (member_email, auth_name)
# VALUES ('admin@email.com', 'admin');
#
# -- 관리자 비밀번호 해시로 업데이트 (BCrypt된 비밀번호)
# UPDATE member
# SET password = '$2a$10$gdx4VSoqzsQ.AOHLIfbr2..zcar8fELPhWhuNiepTQns9GXi7h93u'
# WHERE email = 'admin@email.com';
# # ---------------------------------------------------------------------------------
#
#
# SHOW CREATE TABLE auth;
# SHOW CREATE TABLE board;
# SHOW CREATE TABLE board_file;
# SHOW CREATE TABLE board_like;
# SHOW CREATE TABLE comment;
# SHOW CREATE TABLE member;
# SHOW CREATE TABLE member_file;
# SHOW CREATE TABLE notice;
# SHOW CREATE TABLE notice_file;
# SHOW CREATE TABLE pet_facility;
# SHOW CREATE TABLE reply_comment;
# SHOW CREATE TABLE review;
# SHOW CREATE TABLE review_file;
# SHOW CREATE TABLE review_like;
# SHOW CREATE TABLE support;
