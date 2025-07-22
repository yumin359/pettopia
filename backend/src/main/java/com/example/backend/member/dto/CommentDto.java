package com.example.backend.member.dto;

import com.example.backend.comment.entity.Comment;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.ZoneId;
import java.time.ZonedDateTime;


import java.time.format.DateTimeFormatter;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDto {
    private Integer id;
    private String comment;
    private String authorNickName;
    private String authorEmail;  // 추가
    private String insertedAt;

    // Comment 엔티티 → DTO 변환 생성자 수정
    public CommentDto(Comment comment) {
        this.id = comment.getId();
        this.comment = comment.getComment();
        this.authorNickName = comment.getAuthor().getNickName();

        // authorEmail 추가
        this.authorEmail = comment.getAuthor().getEmail();

        if (comment.getInsertedAt() != null) {
            ZonedDateTime seoulTime = comment.getInsertedAt()
                    .atZone(ZoneId.systemDefault()) // 또는 UTC
                    .withZoneSameInstant(ZoneId.of("Asia/Seoul"));
            this.insertedAt = seoulTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        }
    }
}