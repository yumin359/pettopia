package com.example.backend.review.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
public class ReviewListDto {
    private Integer id;
    private String facilityName;
    private String memberEmail;            // 작성자 이메일
    private String memberEmailNickName;    // 작성자 닉네임 ✅ 추가
    private String review;
    private Integer rating;
    private Instant insertedAt;
    private List<String> files;
}
