package com.example.backend.review.service;

import com.example.backend.review.dto.ReviewLikeDto;
import com.example.backend.review.dto.ReviewLikeForm;
import com.example.backend.review.entity.ReviewLike;
import com.example.backend.review.entity.ReviewLikeId;
import com.example.backend.review.repository.ReviewLikeRepository;
import com.example.backend.review.repository.ReviewRepository;
import com.example.backend.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewLikeService {

    private final ReviewLikeRepository reviewLikeRepository;
    private final ReviewRepository reviewRepository;
    private final MemberRepository memberRepository;

    public ReviewLikeDto update(ReviewLikeForm likeForm, Authentication authentication) {
        if (authentication == null) {
            throw new RuntimeException("로그인 하세요");
        }

        String email = authentication.getName();
        Integer reviewId = likeForm.getReviewId();

        var reviewLikeOpt = reviewLikeRepository.findByReviewIdAndMemberEmail(reviewId, email);

        if (reviewLikeOpt.isPresent()) {
            reviewLikeRepository.delete(reviewLikeOpt.get());
        } else {
            var review = reviewRepository.findById(reviewId)
                    .orElseThrow(() -> new RuntimeException("게시물 없음"));
            var member = memberRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("회원 없음"));

            ReviewLikeId reviewLikeId = new ReviewLikeId();
            reviewLikeId.setReviewId(reviewId);
            reviewLikeId.setMemberId(member.getId());

            ReviewLike newLike = new ReviewLike();
            newLike.setId(reviewLikeId);
            newLike.setReview(review);
            newLike.setMember(member);

            reviewLikeRepository.save(newLike);
        }

        // 좋아요 최신 상태 조회
        int count = reviewLikeRepository.countByReviewId(reviewId).intValue();
        boolean liked = reviewLikeRepository.findByReviewIdAndMemberEmail(reviewId, email).isPresent();
        Long memberId = memberRepository.findByEmail(email).map(m -> m.getId()).orElse(null);

        return ReviewLikeDto.builder()
                .reviewId(reviewId)
                .memberId(memberId)
                .liked(liked)
                .likeCount(count)
                .build();
    }

    @Transactional(readOnly = true)
    public ReviewLikeDto get(Integer reviewId, Authentication authentication) {
        int count = reviewLikeRepository.countByReviewId(reviewId).intValue();
        boolean liked = false;
        Long memberId = null;

        if (authentication != null && authentication.isAuthenticated()) {
            var memberOpt = memberRepository.findByEmail(authentication.getName());
            if (memberOpt.isPresent()) {
                memberId = memberOpt.get().getId();
                liked = reviewLikeRepository.findByReviewIdAndMemberEmail(reviewId, authentication.getName()).isPresent();
            }
        }

        return ReviewLikeDto.builder()
                .reviewId(reviewId)
                .memberId(memberId)
                .liked(liked)
                .likeCount(count)
                .build();
    }
}
