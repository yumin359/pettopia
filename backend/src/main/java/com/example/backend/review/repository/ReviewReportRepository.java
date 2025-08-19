package com.example.backend.review.repository;

import com.example.backend.review.dto.ReviewReportDto;
import com.example.backend.review.entity.ReviewReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ReviewReportRepository extends JpaRepository<ReviewReport, Long> {
    @Query("select rr from ReviewReport rr join fetch rr.review r join fetch r.memberEmail where r.id = :reviewId")
    ReviewReport findByReviewIdWithMember(@Param("reviewId") Integer reviewId);

    void deleteByReview_Id(Integer reviewId);

    List<ReviewReport> findAllByOrderByReportedAtDesc();
}
