package com.example.backend.demo.petFacility;

import com.example.backend.demo.petFacility.PetFacility; // 님의 실제 패키지 경로에 맞게 수정
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PetFacilityRepository extends JpaRepository<PetFacility, Long> {
    // 카테고리별 검색을 위한 메서드 추가 (나중에 구현)
    // List<PetFacility> findByCategory1(String category);
    // List<PetFacility> findByCategory2(String category);
}