package com.example.backend.support.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SupportRequestDto {
    private String email;
    private String subject;  // 프론트의 'subject' 필드명과 매칭
    private String message;  // 프론트의 'message' 필드명과 매칭
}
