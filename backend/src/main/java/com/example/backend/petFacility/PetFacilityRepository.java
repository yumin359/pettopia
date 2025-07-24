package com.example.backend.petFacility;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set; // Set 타입을 사용하는 다른 필터를 위해 필요

@Repository
public interface PetFacilityRepository extends JpaRepository<PetFacility, Long> {

    @Query(value = """
            SELECT pf FROM PetFacility pf WHERE
            ( :sidoName IS NULL OR lower(pf.sidoName) LIKE lower(concat('%', :sidoName, '%')) ) AND
            ( :sigunguName IS NULL OR lower(pf.sigunguName) LIKE lower(concat('%', :sigunguName, '%')) ) AND
            ( :category1 IS NULL OR :category1 IS EMPTY OR pf.category1 IN :category1 ) AND
            ( :category2 IS NULL OR :category2 IS EMPTY OR pf.category2 IN :category2 ) AND
            ( :allowedPetSize IS NULL OR :allowedPetSize IS EMPTY OR pf.allowedPetSize IN :allowedPetSize ) AND
            ( :parkingAvailable IS NULL OR lower(pf.parkingAvailable) LIKE lower(concat('%', :parkingAvailable, '%')) ) AND
            ( :indoorFacility IS NULL OR lower(pf.indoorFacility) LIKE lower(concat('%', :indoorFacility, '%')) ) AND
            ( :outdoorFacility IS NULL OR lower(pf.outdoorFacility) LIKE lower(concat('%', :outdoorFacility, '%')) ) AND
            ( :holiday IS NULL OR lower(pf.holiday) LIKE lower(concat('%', :holiday, '%')) ) AND
            ( :operatingHours IS NULL OR lower(pf.operatingHours) LIKE lower(concat('%', :operatingHours, '%')) ) AND
            ( :petFriendlyInfo IS NULL OR pf.petFriendlyInfo = :petFriendlyInfo ) AND
            ( :petOnlyInfo IS NULL OR pf.petOnlyInfo = :petOnlyInfo ) AND
            ( :petRestrictions IS NULL OR lower(pf.petRestrictions) LIKE lower(concat('%', :petRestrictions, '%')) )
            """,
            countQuery = """
                    SELECT COUNT(pf) FROM PetFacility pf WHERE
                    ( :sidoName IS NULL OR lower(pf.sidoName) LIKE lower(concat('%', :sidoName, '%')) ) AND
                    ( :sigunguName IS NULL OR lower(pf.sigunguName) LIKE lower(concat('%', :sigunguName, '%')) ) AND
                    ( :category1 IS NULL OR :category1 IS EMPTY OR pf.category1 IN :category1 ) AND
                    ( :category2 IS NULL OR :category2 IS EMPTY OR pf.category2 IN :category2 ) AND
                    ( :allowedPetSize IS NULL OR :allowedPetSize IS EMPTY OR pf.allowedPetSize IN :allowedPetSize ) AND
                    ( :parkingAvailable IS NULL OR lower(pf.parkingAvailable) LIKE lower(concat('%', :parkingAvailable, '%')) ) AND
                    ( :indoorFacility IS NULL OR lower(pf.indoorFacility) LIKE lower(concat('%', :indoorFacility, '%')) ) AND
                    ( :outdoorFacility IS NULL OR lower(pf.outdoorFacility) LIKE lower(concat('%', :outdoorFacility, '%')) ) AND
                    ( :holiday IS NULL OR lower(pf.holiday) LIKE lower(concat('%', :holiday, '%')) ) AND
                    ( :operatingHours IS NULL OR lower(pf.operatingHours) LIKE lower(concat('%', :operatingHours, '%')) ) AND
                    ( :petFriendlyInfo IS NULL OR pf.petFriendlyInfo = :petFriendlyInfo ) AND
                    ( :petOnlyInfo IS NULL OR pf.petOnlyInfo = :petOnlyInfo ) AND
                    ( :petRestrictions IS NULL OR lower(pf.petRestrictions) LIKE lower(concat('%', :petRestrictions, '%')) )
                    """
    )
    Page<PetFacility> findFacilitiesByFilters(
            @Param("sidoName") String sidoName,
            @Param("sigunguName") String sigunguName,
            @Param("category1") Set<String> category1,
            @Param("category2") Set<String> category2,
            @Param("allowedPetSize") Set<String> allowedPetSize,
            @Param("parkingAvailable") String parkingAvailable,
            @Param("indoorFacility") String indoorFacility,
            @Param("outdoorFacility") String outdoorFacility,
            @Param("holiday") String holiday,
            @Param("operatingHours") String operatingHours,
            @Param("petFriendlyInfo") String petFriendlyInfo,
            @Param("petOnlyInfo") String petOnlyInfo,
            @Param("petRestrictions") String petRestrictions,
            Pageable pageable
    );

    // 기존 단일 필드 검색 메서드들 (필요하다면 유지)
    List<PetFacility> findByCategory1ContainingIgnoreCase(String category1);

    List<PetFacility> findByCategory2ContainingIgnoreCase(String category2);

    List<PetFacility> findBySidoNameContainingIgnoreCase(String sidoName);

    List<PetFacility> findBySidoNameContainingIgnoreCaseAndCategory1ContainingIgnoreCase(String sidoName, String category1);

    // 프론트엔드에서 필터 옵션을 채우기 위한 DISTINCT 값 조회 메서드들
    @Query("SELECT DISTINCT pf.category1 FROM PetFacility pf WHERE pf.category1 IS NOT NULL AND pf.category1 != '' ORDER BY pf.category1")
    List<String> findDistinctCategory1();

    @Query("SELECT DISTINCT pf.category2 FROM PetFacility pf WHERE pf.category2 IS NOT NULL AND pf.category2 != '' ORDER BY pf.category2")
    List<String> findDistinctCategory2();

    @Query("SELECT DISTINCT pf.sidoName FROM PetFacility pf WHERE pf.sidoName IS NOT NULL AND pf.sidoName != '' ORDER BY pf.sidoName")
    List<String> findDistinctSidoName();

    @Query("SELECT DISTINCT pf.sigunguName FROM PetFacility pf WHERE pf.sigunguName IS NOT NULL AND pf.sigunguName != '' ORDER BY pf.sigunguName")
    List<String> findDistinctSigunguName();

    @Query("SELECT DISTINCT pf.allowedPetSize FROM PetFacility pf WHERE pf.allowedPetSize IS NOT NULL AND pf.allowedPetSize != '' ORDER BY pf.allowedPetSize")
    List<String> findDistinctAllowedPetSize();

    // --- 새로운 필드에 대한 distinct 값 조회 메서드 ---
    @Query("SELECT DISTINCT pf.holiday FROM PetFacility pf WHERE pf.holiday IS NOT NULL AND pf.holiday != '' ORDER BY pf.holiday")
    List<String> findDistinctHoliday();

    @Query("SELECT DISTINCT pf.operatingHours FROM PetFacility pf WHERE pf.operatingHours IS NOT NULL AND pf.operatingHours != '' ORDER BY pf.operatingHours")
    List<String> findDistinctOperatingHours();

    @Query("SELECT DISTINCT pf.petRestrictions FROM PetFacility pf WHERE pf.petRestrictions IS NOT NULL AND pf.petRestrictions != '' ORDER BY pf.petRestrictions")
    List<String> findDistinctPetRestrictions();
}