package com.example.backend.support.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import com.fasterxml.jackson.annotation.JsonProperty;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SupportResponseDto {
    private Long id;
    private String email;
    private String title;
    private String content;

    @JsonProperty("inserted_at")  // ✅ 프론트와 일치시키기 위해
    private Instant insertedAt;
}

