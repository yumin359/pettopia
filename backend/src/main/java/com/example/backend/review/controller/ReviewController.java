package com.example.backend.review.controller;

import com.example.backend.review.dto.ReviewDto;
import com.example.backend.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/review")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // 리뷰 등록
    @PostMapping("/add")
    public ResponseEntity<String> addReview(@RequestBody ReviewDto dto) {
        reviewService.save(dto);
        return ResponseEntity.ok("리뷰가 등록되었습니다.");
    }

    // 특정 시설 리뷰 조회
    // ✅ 기존 (PathVariable 방식) 유지
    @GetMapping("/facility/{facilityName}")
    public ResponseEntity<List<ReviewDto>> getReviewsByFacilityName(@PathVariable String facilityName) {
        List<ReviewDto> reviews = reviewService.findAllByFacilityName(facilityName);
        return ResponseEntity.ok(reviews);
    }

    // ✅ 추가 (RequestParam 방식) → 메서드 이름만 다르게
    @GetMapping("/list")
    public ResponseEntity<List<ReviewDto>> getReviewsByFacilityNameFromQuery(@RequestParam String facilityName) {
        List<ReviewDto> reviews = reviewService.findAllByFacilityName(facilityName);
        return ResponseEntity.ok(reviews);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateReview(@PathVariable Integer id, @RequestBody ReviewDto dto) {
        reviewService.update(id, dto);
        return ResponseEntity.ok("리뷰가 수정되었습니다.");
    }

    // 리뷰 삭제
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteReview(@PathVariable Integer id, @RequestParam String email) {
        reviewService.delete(id, email);
        return ResponseEntity.ok("리뷰가 삭제되었습니다.");
    }

}
