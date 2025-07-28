package com.example.backend.review.repository;

import com.example.backend.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findTop5ByOrderByInsertedAtDesc();
    List<Review> findAllByFacilityNameOrderByInsertedAtDesc(String facilityName);
}
