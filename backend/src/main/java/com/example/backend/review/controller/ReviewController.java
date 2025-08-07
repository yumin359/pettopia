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

    // 특정 시설 리뷰 조회 - 정렬방식과 페이징 옵션 추가
    @GetMapping("/facility/{facilityId}")
    public ResponseEntity<List<ReviewListDto>> getReviewsByFacilityId(
            @PathVariable Long facilityId,
            @RequestParam(defaultValue = "latest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<ReviewListDto> reviews;
        if ("likes".equalsIgnoreCase(sort)) {
            // 좋아요순 정렬 + 페이징
            reviews = reviewService.findByFacilityIdOrderByLikesDesc(facilityId, page, size);
        } else {
            // 기본 최신순 정렬 (모두 조회, 페이징 없는 기존 메서드)
            reviews = reviewService.findAllByFacilityId(facilityId);
        }
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

    // 최신 리뷰 조회 - limit 옵션
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
    @GetMapping("/myReview/{memberId}")
    public ResponseEntity<List<ReviewListDto>> getMyReviews(@PathVariable Long memberId) {
        List<ReviewListDto> myReviews = reviewService.findReviewsByMemberId(memberId);
        return ResponseEntity.ok(myReviews);
    }
}
