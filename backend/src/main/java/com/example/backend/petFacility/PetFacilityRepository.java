package com.example.backend.petFacility;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;

public interface PetFacilityRepository extends JpaRepository<PetFacility, Long> {

    // New custom query for combined filtering
    @Query("SELECT pf FROM PetFacility pf WHERE " +
            "( :sidoName IS NULL OR lower(pf.sidoName) LIKE lower(concat('%', :sidoName, '%')) ) AND " +
            "( :sigunguName IS NULL OR lower(pf.sigunguName) LIKE lower(concat('%', :sigunguName, '%')) ) AND " +
            "( :category1 IS NULL OR pf.category1 IN :category1 ) AND " + // Use IN for Set
            "( :category2 IS NULL OR pf.category2 IN :category2 ) AND " + // Use IN for Set
            "( :allowedPetSize IS NULL OR pf.allowedPetSize IN :allowedPetSize ) AND " + // Use IN for Set
            "( :parkingAvailable IS NULL OR lower(pf.parkingAvailable) LIKE lower(concat('%', :parkingAvailable, '%')) ) AND " +
            "( :indoorFacility IS NULL OR lower(pf.indoorFacility) LIKE lower(concat('%', :indoorFacility, '%')) ) AND " +
            "( :outdoorFacility IS NULL OR lower(pf.outdoorFacility) LIKE lower(concat('%', :outdoorFacility, '%')) )")
    List<PetFacility> findFacilitiesByFilters(
            @Param("sidoName") String sidoName,
            @Param("sigunguName") String sigunguName,
            @Param("category1") Set<String> category1,
            @Param("category2") Set<String> category2,
            @Param("allowedPetSize") Set<String> allowedPetSize,
            @Param("parkingAvailable") String parkingAvailable,
            @Param("indoorFacility") String indoorFacility,
            @Param("outdoorFacility") String outdoorFacility
    );

    // Existing methods (keep them)
    List<PetFacility> findByCategory1ContainingIgnoreCase(String category1);

    List<PetFacility> findByCategory2ContainingIgnoreCase(String category2);

    List<PetFacility> findBySidoNameContainingIgnoreCase(String sidoName);

    List<PetFacility> findBySidoNameContainingIgnoreCaseAndCategory1ContainingIgnoreCase(String sidoName, String category1);

    @Query("SELECT DISTINCT pf.category1 FROM PetFacility pf WHERE pf.category1 IS NOT NULL ORDER BY pf.category1")
    List<String> findDistinctCategory1();

    @Query("SELECT DISTINCT pf.category2 FROM PetFacility pf WHERE pf.category2 IS NOT NULL ORDER BY pf.category2")
    List<String> findDistinctCategory2();

    @Query("SELECT DISTINCT pf.sidoName FROM PetFacility pf WHERE pf.sidoName IS NOT NULL ORDER BY pf.sidoName")
    List<String> findDistinctSidoName();

    @Query("SELECT DISTINCT pf.sigunguName FROM PetFacility pf WHERE pf.sigunguName IS NOT NULL ORDER BY pf.sigunguName")
    List<String> findDistinctSigunguName();

    @Query("SELECT DISTINCT pf.allowedPetSize FROM PetFacility pf WHERE pf.allowedPetSize IS NOT NULL ORDER BY pf.allowedPetSize")
    List<String> findDistinctAllowedPetSize();
}