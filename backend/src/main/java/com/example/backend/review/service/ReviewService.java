package com.example.backend.review.service;

import com.example.backend.member.entity.Member;
import com.example.backend.member.repository.MemberRepository;
import com.example.backend.review.dto.ReviewDto;
import com.example.backend.review.entity.Review;
import com.example.backend.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MemberRepository memberRepository;

    // 리뷰 저장
    public void save(ReviewDto dto) {
        Member member = memberRepository.findByEmail(dto.getMemberEmail())
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다: " + dto.getMemberEmail()));

        Review review = Review.builder()
                .facilityName(dto.getFacilityName())
                .memberEmail(member)
                .review(dto.getReview())
                .rating(dto.getRating())
                .insertedAt(Instant.now())
                .build();

        reviewRepository.save(review);
    }

    // 특정 시설 리뷰 목록 조회
    public List<ReviewDto> findAllByFacilityName(String facilityName) {
        return reviewRepository.findAllByFacilityNameOrderByInsertedAtDesc(facilityName)
                .stream()
                .map(review -> ReviewDto.builder()
                        .id(review.getId())
                        .facilityName(review.getFacilityName())
                        .memberEmail(review.getMemberEmail().getEmail())
                        .memberEmailNickName(review.getMemberEmail().getNickName()) // ✅ 닉네임 포함
                        .review(review.getReview())
                        .rating(review.getRating())
                        .insertedAt(review.getInsertedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // 리뷰 수정
    public void update(Integer id, ReviewDto dto) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("리뷰를 찾을 수 없습니다: " + id));

        if (!review.getMemberEmail().getEmail().equals(dto.getMemberEmail())) {
            throw new SecurityException("자신이 작성한 리뷰만 수정할 수 있습니다.");
        }

        review.setReview(dto.getReview());
        review.setRating(dto.getRating());
        reviewRepository.save(review);
    }

    // 리뷰 삭제
    public void delete(Integer id, String requesterEmail) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("리뷰를 찾을 수 없습니다: " + id));

        if (!review.getMemberEmail().getEmail().equals(requesterEmail)) {
            throw new SecurityException("자신이 작성한 리뷰만 삭제할 수 있습니다.");
        }

        reviewRepository.deleteById(id);
    }

    // ✅ 최신 리뷰 5개 조회
    public List<ReviewDto> getLatestReviews() {
        return reviewRepository.findTop5ByOrderByInsertedAtDesc()
                .stream()
                .map(review -> ReviewDto.builder()
                        .id(review.getId())
                        .facilityName(review.getFacilityName())
                        .memberEmail(review.getMemberEmail().getEmail())
                        .memberEmailNickName(review.getMemberEmail().getNickName())
                        .review(review.getReview())
                        .rating(review.getRating())
                        .insertedAt(review.getInsertedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
