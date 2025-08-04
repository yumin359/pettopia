package com.example.backend.support.entity;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupportRepository extends JpaRepository<Support, Long> {
    List<Support> findAllByOrderByInsertedAtDesc();
}
