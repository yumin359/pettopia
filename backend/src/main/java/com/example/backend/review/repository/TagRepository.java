package com.example.backend.review.repository;

import com.example.backend.review.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface TagRepository extends JpaRepository<Tag, Integer> {
    Set<Tag> findAllByIdIn(List<Integer> ids);

    Optional<Tag> findByName(String name);  // ✅ 추가

    Set<Tag> findAllByNameIn(List<String> names);  // ✅ 추가
}
