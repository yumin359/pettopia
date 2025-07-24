package com.example.backend.petFacility;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface PetFacilityRepository extends JpaRepository<PetFacility, Long> {
    @Query(value = "SELECT pf FROM PetFacility pf WHERE " +
            "( :sidoName IS NULL OR lower(pf.sidoName) LIKE lower(concat('%', :sidoName, '%')) ) AND " +
            "( :sigunguName IS NULL OR lower(pf.sigunguName) LIKE lower(concat('%', :sigunguName, '%')) ) AND " +
            "( :category1 IS NULL OR :category1 IS EMPTY OR pf.category1 IN :category1 ) AND " +
            "( :category2 IS NULL OR :category2 IS EMPTY OR pf.category2 IN :category2 ) AND " +
            "( :allowedPetSize IS NULL OR :allowedPetSize IS EMPTY OR pf.allowedPetSize IN :allowedPetSize ) AND " +
            "( :parkingAvailable IS NULL OR lower(pf.parkingAvailable) LIKE lower(concat('%', :parkingAvailable, '%')) ) AND " +
            "( :indoorFacility IS NULL OR lower(pf.indoorFacility) LIKE lower(concat('%', :indoorFacility, '%')) ) AND " +
            "( :outdoorFacility IS NULL OR lower(pf.outdoorFacility) LIKE lower(concat('%', :outdoorFacility, '%')) ) AND " +
            // --- 새로운 필터 조건 추가 시작 ---
            "( :holiday IS NULL OR lower(pf.holiday) LIKE lower(concat('%', :holiday, '%')) ) AND " + // 휴무일 (부분 일치 검색)
            "( :operatingHours IS NULL OR lower(pf.operatingHours) LIKE lower(concat('%', :operatingHours, '%')) ) AND " + // 운영시간 (부분 일치 검색)
            "( :petFriendlyInfo IS NULL OR pf.petFriendlyInfo = :petFriendlyInfo ) AND " + // 동반 가능 정보 (정확히 일치)
            "( :petOnlyInfo IS NULL OR pf.petOnlyInfo = :petOnlyInfo ) AND " + // 전용 정보 (정확히 일치)
            "( :petRestrictions IS NULL OR :petRestrictions IS EMPTY OR pf.petRestrictions IN :petRestrictions )", // 제한사항 (다중 선택)
            // pf.petRestrictions가 Set이 아니고 단일 String 필드에 콤마 등으로 구분된 값이 저장되어 있다면
            // "( :petRestrictions IS NULL OR lower(pf.petRestrictions) LIKE lower(concat('%', :petRestrictions, '%')) )",
            // 과 같이 LIKE 검색을 고려해야 합니다. 여기서는 `Set<String>`으로 여러 값을 받는다고 가정합니다.
            countQuery = "SELECT COUNT(pf) FROM PetFacility pf WHERE " +
                    "( :sidoName IS NULL OR lower(pf.sidoName) LIKE lower(concat('%', :sidoName, '%')) ) AND " +
                    "( :sigunguName IS NULL OR lower(pf.sigunguName) LIKE lower(concat('%', :sigunguName, '%')) ) AND " +
                    "( :category1 IS NULL OR :category1 IS EMPTY OR pf.category1 IN :category1 ) AND " +
                    "( :category2 IS NULL OR :category2 IS EMPTY OR pf.category2 IN :category2 ) AND " +
                    "( :allowedPetSize IS NULL OR :allowedPetSize IS EMPTY OR pf.allowedPetSize IN :allowedPetSize ) AND " +
                    "( :parkingAvailable IS NULL OR lower(pf.parkingAvailable) LIKE lower(concat('%', :parkingAvailable, '%')) ) AND " +
                    "( :indoorFacility IS NULL OR lower(pf.indoorFacility) LIKE lower(concat('%', :indoorFacility, '%')) ) AND " +
                    "( :outdoorFacility IS NULL OR lower(pf.outdoorFacility) LIKE lower(concat('%', :outdoorFacility, '%')) ) AND " +
                    // --- 새로운 필터 조건 추가 시작 ---
                    "( :holiday IS NULL OR lower(pf.holiday) LIKE lower(concat('%', :holiday, '%')) ) AND " +
                    "( :operatingHours IS NULL OR lower(pf.operatingHours) LIKE lower(concat('%', :operatingHours, '%')) ) AND " +
                    "( :petFriendlyInfo IS NULL OR pf.petFriendlyInfo = :petFriendlyInfo ) AND " +
                    "( :petOnlyInfo IS NULL OR pf.petOnlyInfo = :petOnlyInfo ) AND " +
                    "( :petRestrictions IS NULL OR :petRestrictions IS EMPTY OR pf.petRestrictions IN :petRestrictions )" // Set으로 받는다면 IN :petRestrictions
            // --- 새로운 필터 조건 추가 끝 ---
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
            // --- 새로운 파라미터 선언 시작 ---
            @Param("holiday") String holiday,
            @Param("operatingHours") String operatingHours,
            @Param("petFriendlyInfo") String petFriendlyInfo,
            @Param("petOnlyInfo") String petOnlyInfo,
            @Param("petRestrictions") Set<String> petRestrictions, // Set으로 받을 경우
            // --- 새로운 파라미터 선언 끝 ---
            Pageable pageable
    );

    List<PetFacility> findByCategory1ContainingIgnoreCase(String category1);

    List<PetFacility> findByCategory2ContainingIgnoreCase(String category2);

    List<PetFacility> findBySidoNameContainingIgnoreCase(String sidoName);

    List<PetFacility> findBySidoNameContainingIgnoreCaseAndCategory1ContainingIgnoreCase(String sidoName, String category1);

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

    // --- 새로운 distinct 값 가져오는 메서드 추가 시작 ---
    // 값이 비어있지 않은 경우만 가져오고 정렬합니다.
    @Query("SELECT DISTINCT pf.holiday FROM PetFacility pf WHERE pf.holiday IS NOT NULL AND pf.holiday != '' ORDER BY pf.holiday")
    List<String> findDistinctHoliday();

    @Query("SELECT DISTINCT pf.operatingHours FROM PetFacility pf WHERE pf.operatingHours IS NOT NULL AND pf.operatingHours != '' ORDER BY pf.operatingHours")
    List<String> findDistinctOperatingHours();

    // PetFacility 엔티티의 petRestrictions 필드가 Set<String>이 아니라 단일 String인 경우,
    // 그리고 그 안에 여러 제한사항이 콤마 등으로 구분되어 있다면,
    // 이 메서드는 단일 String 값을 반환하게 될 것이므로, 프론트엔드에서 파싱해야 할 수 있습니다.
    // 만약 데이터베이스에 각 제한사항이 개별 레코드로 저장되어 있거나, petRestrictions가 컬렉션 타입이라면 다릅니다.
    // 여기서는 일단 엔티티의 String 타입 필드라고 가정하고 `LIKE` 검색을 사용할 때의 distinct를 가정합니다.
    // 만약 `Set<String>`으로 필터링한다면, 프론트엔드에서 전달하는 `Set`의 각 요소가 정확히 일치하는지 확인합니다.
    @Query("SELECT DISTINCT pf.petRestrictions FROM PetFacility pf WHERE pf.petRestrictions IS NOT NULL AND pf.petRestrictions != '' ORDER BY pf.petRestrictions")
    List<String> findDistinctPetRestrictions();

    // --- 새로운 distinct 값 가져오는 메서드 추가 끝 ---
}