package com.example.backend.review.repository;

import com.example.backend.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Integer> {

    // 기존 메서드 유지
    List<Review> findTop5ByOrderByInsertedAtDesc();

    List<Review> findTop3ByOrderByInsertedAtDesc();

    List<Review> findAllByMemberEmail_Email(String email);

    Page<Review> findAllByOrderByInsertedAtDesc(Pageable pageable);

    List<Review> findAllByMemberEmail_IdOrderByInsertedAtDesc(Long memberId);

    List<Review> findAllByPetFacility_IdOrderByInsertedAtDesc(Long facilityId);

    // 좋아요 수 순 정렬 — 페이징 처리 포함 (Pageable 사용 권장)
    @Query("""
                SELECT r FROM Review r
                LEFT JOIN r.likes rl
                WHERE r.petFacility.id = :facilityId
                GROUP BY r.id, r.insertedAt, r.review, r.rating, r.memberEmail, r.petFacility
                ORDER BY COUNT(rl) DESC, r.insertedAt DESC
            """)
    Page<Review> findByPetFacilityIdOrderByLikesDesc(@Param("facilityId") Long facilityId, Pageable pageable);
    
    Long countByMemberEmail_Id(Long memberId);
}
