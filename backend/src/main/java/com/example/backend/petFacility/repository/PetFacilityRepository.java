package com.example.backend.petFacility.repository;

import com.example.backend.petFacility.entity.PetFacility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface PetFacilityRepository extends JpaRepository<PetFacility, Long> {

    // 간소화된 필터 검색 쿼리
    @Query(value = """
            SELECT pf FROM PetFacility pf WHERE
            (:sidoName IS NULL OR lower(pf.sidoName) LIKE lower(concat('%', :sidoName, '%')))
            AND (:sigunguName IS NULL OR lower(pf.sigunguName) LIKE lower(concat('%', :sigunguName, '%')))
            AND (:category2 IS NULL OR pf.category2 IN :category2)
            AND (:allowedPetSize IS NULL OR pf.allowedPetSize IN :allowedPetSize)
            AND (:parkingAvailable IS NULL OR lower(pf.parkingAvailable) LIKE lower(concat('%', :parkingAvailable, '%')))
            AND (:indoorFacility IS NULL OR lower(pf.indoorFacility) LIKE lower(concat('%', :indoorFacility, '%')))
            AND (:outdoorFacility IS NULL OR lower(pf.outdoorFacility) LIKE lower(concat('%', :outdoorFacility, '%')))
            """,
            countQuery = """
                    SELECT COUNT(pf) FROM PetFacility pf WHERE
                    (:sidoName IS NULL OR lower(pf.sidoName) LIKE lower(concat('%', :sidoName, '%')))
                    AND (:sigunguName IS NULL OR lower(pf.sigunguName) LIKE lower(concat('%', :sigunguName, '%')))
                    AND (:category2 IS NULL OR pf.category2 IN :category2)
                    AND (:allowedPetSize IS NULL OR pf.allowedPetSize IN :allowedPetSize)
                    AND (:parkingAvailable IS NULL OR lower(pf.parkingAvailable) LIKE lower(concat('%', :parkingAvailable, '%')))
                    AND (:indoorFacility IS NULL OR lower(pf.indoorFacility) LIKE lower(concat('%', :indoorFacility, '%')))
                    AND (:outdoorFacility IS NULL OR lower(pf.outdoorFacility) LIKE lower(concat('%', :outdoorFacility, '%')))
                    """
    )
    Page<PetFacility> findFacilitiesByFilters(
            @Param("sidoName") String sidoName,
            @Param("sigunguName") String sigunguName,
            @Param("category2") Set<String> category2,
            @Param("allowedPetSize") Set<String> allowedPetSize,
            @Param("parkingAvailable") String parkingAvailable,
            @Param("indoorFacility") String indoorFacility,
            @Param("outdoorFacility") String outdoorFacility,
            Pageable pageable
    );

    // 단일 필드 검색용
    List<PetFacility> findByCategory2ContainingIgnoreCase(String category2);

    List<PetFacility> findBySidoNameContainingIgnoreCase(String sidoName);

    // DISTINCT 조회용
    @Query("SELECT DISTINCT pf.category2 FROM PetFacility pf WHERE pf.category2 IS NOT NULL AND pf.category2 != '' ORDER BY pf.category2")
    List<String> findDistinctCategory2();

    @Query("SELECT DISTINCT pf.sidoName FROM PetFacility pf WHERE pf.sidoName IS NOT NULL AND pf.sidoName != '' ORDER BY pf.sidoName")
    List<String> findDistinctSidoName();

    @Query("SELECT DISTINCT pf.sigunguName FROM PetFacility pf WHERE pf.sigunguName IS NOT NULL AND pf.sigunguName != '' ORDER BY pf.sigunguName")
    List<String> findDistinctSigunguName();

    // 지역별 시군구 조회 - 정확한 매칭
    @Query("SELECT DISTINCT pf.sigunguName FROM PetFacility pf WHERE pf.sidoName = :sidoName AND pf.sigunguName IS NOT NULL AND TRIM(pf.sigunguName) != '' ORDER BY pf.sigunguName")
    List<String> findDistinctSigunguNameByRegion(@Param("sidoName") String sidoName);

    @Query("SELECT DISTINCT pf.allowedPetSize FROM PetFacility pf WHERE pf.allowedPetSize IS NOT NULL AND pf.allowedPetSize != '' ORDER BY pf.allowedPetSize")
    List<String> findDistinctAllowedPetSize();

    // 단일 시설명으로 조회 (추가)
    Optional<PetFacility> findByName(String facilityName);

    List<PetFacility> findByNameAndSidoNameAndSigunguName(String name, String sidoName, String sigunguName);
}
