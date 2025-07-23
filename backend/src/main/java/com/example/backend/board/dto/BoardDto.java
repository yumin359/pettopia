package com.example.backend.board.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BoardDto {
    private Integer id;
    private String title;
    private String content;
    private String authorEmail;
    private String authorNickName;
    private LocalDateTime insertedAt;

    private List<String> files;
}