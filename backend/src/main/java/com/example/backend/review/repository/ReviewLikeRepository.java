package com.example.backend.review.repository;

import com.example.backend.review.entity.ReviewLike;
import com.example.backend.member.entity.Member;
import com.example.backend.review.entity.ReviewLikeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface ReviewLikeRepository extends JpaRepository<ReviewLike, ReviewLikeId> {
  Optional<ReviewLike> findByReviewIdAndMemberEmail(Integer reviewId, String memberEmail);

  Long countByReviewId(Integer reviewId);

  @Transactional
  @Modifying
  @Query("delete from ReviewLike bl where bl.review.id = :reviewId")
  void deleteByBoardId(Integer reviewId);

  @Transactional
  @Modifying
  @Query("delete from ReviewLike bl where bl.member.email = :memberEmail")
  void deleteByMemberEmail(String memberEmail);  // 수정된 부분
}