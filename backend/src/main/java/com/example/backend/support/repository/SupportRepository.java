package com.example.backend.support.repository;

import com.example.backend.support.entity.Support;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportRepository extends JpaRepository<Support, Long> {
}
