package com.example.backend.member.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MemberDto {
    private String email;
    private String nickName;
    private String info;
    private LocalDateTime insertedAt;
}