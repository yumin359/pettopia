package com.example.backend.demo.petFacility;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PetFacilityRepository extends JpaRepository<PetFacility, Long> {

    // 카테고리별 검색
    List<PetFacility> findByCategory1ContainingIgnoreCase(String category1);

    List<PetFacility> findByCategory2ContainingIgnoreCase(String category2);

    // 지역별 검색
    List<PetFacility> findBySidoNameContainingIgnoreCase(String sidoName);

    // 복합 검색
    List<PetFacility> findBySidoNameContainingIgnoreCaseAndCategory1ContainingIgnoreCase(
            String sidoName, String category1);

    // 고유 카테고리 목록 조회
    @Query("SELECT DISTINCT pf.category1 FROM PetFacility pf WHERE pf.category1 IS NOT NULL ORDER BY pf.category1")
    List<String> findDistinctCategory1();

    @Query("SELECT DISTINCT pf.category2 FROM PetFacility pf WHERE pf.category2 IS NOT NULL ORDER BY pf.category2")
    List<String> findDistinctCategory2();

    @Query("SELECT DISTINCT pf.sidoName FROM PetFacility pf WHERE pf.sidoName IS NOT NULL ORDER BY pf.sidoName")
    List<String> findDistinctSidoName();

    // PetFacilityRepository.java에 추가
    List<PetFacility> findBySigunguNameContainingIgnoreCase(String sigunguName);

    List<PetFacility> findByAllowedPetSizeContainingIgnoreCase(String allowedPetSize);

    List<PetFacility> findByParkingAvailableContainingIgnoreCase(String parkingAvailable);

    List<PetFacility> findByIndoorFacilityContainingIgnoreCase(String indoorFacility);

    @Query("SELECT DISTINCT pf.sigunguName FROM PetFacility pf WHERE pf.sigunguName IS NOT NULL ORDER BY pf.sigunguName")
    List<String> findDistinctSigunguName();

    @Query("SELECT DISTINCT pf.allowedPetSize FROM PetFacility pf WHERE pf.allowedPetSize IS NOT NULL ORDER BY pf.allowedPetSize")
    List<String> findDistinctAllowedPetSize();

    @Query("SELECT DISTINCT pf.category3 FROM PetFacility pf WHERE pf.category3 IS NOT NULL ORDER BY pf.category3")
    List<String> findDistinctCategory3();
}