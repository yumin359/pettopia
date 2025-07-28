package com.example.backend.review.controller;

import com.example.backend.review.dto.ReviewFormDto;
import com.example.backend.review.dto.ReviewListDto;
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
    public ResponseEntity<String> addReview(@ModelAttribute ReviewFormDto dto) {
        reviewService.save(dto);
        return ResponseEntity.ok("리뷰가 등록되었습니다.");
    }

    // 특정 시설 리뷰 조회 (PathVariable)
    @GetMapping("/facility/{facilityName}")
    public ResponseEntity<List<ReviewListDto>> getReviewsByFacilityName(@PathVariable String facilityName) {
        List<ReviewListDto> reviews = reviewService.findAllByFacilityName(facilityName);
        return ResponseEntity.ok(reviews);
    }

    // 특정 시설 리뷰 조회 (RequestParam)
//    @GetMapping("/list")
//    public ResponseEntity<List<ReviewListDto>> getReviewsByFacilityNameFromQuery(@RequestParam String facilityName) {
//        List<ReviewListDto> reviews = reviewService.findAllByFacilityName(facilityName);
//        return ResponseEntity.ok(reviews);
//    }

    // 리뷰 수정
    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateReview(@PathVariable Integer id, @RequestBody ReviewFormDto dto) {
        reviewService.update(id, dto);
        return ResponseEntity.ok("리뷰가 수정되었습니다.");
    }

    // 리뷰 삭제
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteReview(@PathVariable Integer id, @RequestParam String email) {
        reviewService.delete(id, email);
        return ResponseEntity.ok("리뷰가 삭제되었습니다.");
    }

    // 최신 리뷰 5개 조회
    @GetMapping("/latest")
    public ResponseEntity<List<ReviewListDto>> getLatestReviews() {
        List<ReviewListDto> latestReviews = reviewService.getLatestReviews();
        return ResponseEntity.ok(latestReviews);
    }
}
