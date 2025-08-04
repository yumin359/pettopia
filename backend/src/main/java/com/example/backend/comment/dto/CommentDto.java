package com.example.backend.comment.dto;

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
    private String profileImageUrl;
}