package com.example.backend.review.repository;

import com.example.backend.review.entity.ReviewFile;
import com.example.backend.review.entity.ReviewFileId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewFileRepository extends JpaRepository<ReviewFile, ReviewFileId> {
}