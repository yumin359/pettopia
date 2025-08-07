package com.example.backend.review.dto;

import com.example.backend.review.entity.ReviewReport;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class ReviewReportDto {
    private Long id;
    private Integer reviewId;
    private String reporterEmail;
    private String reason;
    private Instant reportedAt;

    // Entity → DTO 변환
    public static ReviewReportDto fromEntity(ReviewReport report) {
        ReviewReportDto dto = new ReviewReportDto();
        dto.setId(report.getId());
        dto.setReviewId(report.getReview().getId().intValue()); // Integer로 캐스팅
        dto.setReporterEmail(report.getReporterEmail());
        dto.setReason(report.getReason());
        dto.setReportedAt(report.getReportedAt());
        return dto;
    }
}
