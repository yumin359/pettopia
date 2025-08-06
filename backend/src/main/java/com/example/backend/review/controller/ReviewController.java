package com.example.backend.review.controller;

import com.example.backend.review.dto.ReviewFormDto;
import com.example.backend.review.dto.ReviewListDto;
import com.example.backend.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/review")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // 리뷰 등록
    @PostMapping("/add")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> addReview(@ModelAttribute ReviewFormDto dto, Authentication authentication) {
        dto.setMemberEmail(authentication.getName());
        reviewService.save(dto);
        return ResponseEntity.ok("리뷰가 등록되었습니다.");
    }

    // 특정 시설 리뷰 조회 (PathVariable)
    @GetMapping("/facility/{facilityName}")
    public ResponseEntity<List<ReviewListDto>> getReviewsByFacilityName(@PathVariable String facilityName) {
        List<ReviewListDto> reviews = reviewService.findAllByFacilityName(facilityName);
        return ResponseEntity.ok(reviews);
    }


    // 리뷰 수정
    @PutMapping("/update/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> updateReview(@PathVariable Integer id,
                                               @ModelAttribute ReviewFormDto dto,
                                               Authentication authentication) {
        dto.setMemberEmail(authentication.getName());
        reviewService.update(id, dto);
        return ResponseEntity.ok("리뷰가 수정되었습니다.");
    }

    // 리뷰 삭제
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> deleteReview(@PathVariable Integer id, Authentication authentication) {
        String requesterEmail = authentication.getName();
        reviewService.delete(id, requesterEmail);
        return ResponseEntity.ok("리뷰가 삭제되었습니다.");
    }

    // ✅ 최신 리뷰 조회 - 하나의 메소드로 통합
    @GetMapping("/latest")
    public ResponseEntity<List<ReviewListDto>> getLatestReviews(
            @RequestParam(value = "limit", required = false, defaultValue = "5") Integer limit) {
        List<ReviewListDto> latestReviews = reviewService.getLatestReviews(limit);
        return ResponseEntity.ok(latestReviews);
    }

    // 최신 리뷰 3개 조회
    @GetMapping("/latest3")
    public ResponseEntity<List<ReviewListDto>> getLatest3Reviews() {
        List<ReviewListDto> latest3 = reviewService.getLatest3Reviews();
        return ResponseEntity.ok(latest3);
    }

    // 내가 쓴 리뷰 조회
    @GetMapping("/myReview")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReviewListDto>> getMyReviews(Authentication authentication) {
        String email = authentication.getName();
        List<ReviewListDto> myReviews = reviewService.findReviewsByEmail(email);
        return ResponseEntity.ok(myReviews);
    }
}
