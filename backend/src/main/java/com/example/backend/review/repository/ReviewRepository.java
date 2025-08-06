package com.example.backend.review.repository;

import com.example.backend.board.dto.BoardListDto;
import com.example.backend.review.dto.ReviewListDto;
import com.example.backend.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Integer> {

    List<Review> findTop5ByOrderByInsertedAtDesc();

    List<Review> findAllByFacilityNameOrderByInsertedAtDesc(String facilityName);

    List<Review> findTop3ByOrderByInsertedAtDesc();

//    List<Review> findAllByMemberEmail_Email(String email);

    // 페이징 지원 메소드 추가
    @Query("SELECT r FROM Review r ORDER BY r.insertedAt DESC")
    List<Review> findAllOrderByInsertedAtDesc(@Param("limit") int limit);

    // 또는 Pageable 사용
    Page<Review> findAllByOrderByInsertedAtDesc(Pageable pageable);

    List<Review> findAllByMemberEmail_EmailOrderByInsertedAtDesc(String email);
}
