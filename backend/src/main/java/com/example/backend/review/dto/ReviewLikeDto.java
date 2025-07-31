package com.example.backend.review.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReviewLikeDto {
    private Integer reviewId;
    private Long memberId;
    private boolean liked;
    private int likeCount;
}
