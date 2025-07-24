package com.example.backend.petFacility;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set; // 다른 Set 타입 파라미터를 위해 필요

@RestController
@RequestMapping("/api/pet_facilities")
@CrossOrigin(origins = "http://localhost:5173")
public class PetFacilityController {

    private final PetFacilityRepository petFacilityRepository;

    public PetFacilityController(PetFacilityRepository petFacilityRepository) {
        this.petFacilityRepository = petFacilityRepository;
    }

    // 통합 검색 엔드포인트
    @GetMapping("/search")
    public Page<PetFacility> searchPetFacilities(
            @RequestParam(required = false) String sidoName,
            @RequestParam(required = false) String sigunguName,
            @RequestParam(required = false) Set<String> category1,
            @RequestParam(required = false) Set<String> category2,
            @RequestParam(required = false) Set<String> allowedPetSize,
            @RequestParam(required = false) String parkingAvailable,
            @RequestParam(required = false) String indoorFacility,
            @RequestParam(required = false) String outdoorFacility,
            // --- 새로운 필터 파라미터 시작 (petRestrictions 변경됨) ---
            @RequestParam(required = false) String holiday,
            @RequestParam(required = false) String operatingHours,
            @RequestParam(required = false) String petFriendlyInfo,
            @RequestParam(required = false) String petOnlyInfo,
            @RequestParam(required = false) String petRestrictions, // <-- 변경! Set<String> -> String
            // --- 새로운 필터 파라미터 끝 ---
            @PageableDefault(size = 10, sort = "name", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return petFacilityRepository.findFacilitiesByFilters(
                sidoName,
                sigunguName,
                category1,
                category2,
                allowedPetSize,
                parkingAvailable,
                indoorFacility,
                outdoorFacility,
                // --- 새로운 필터 파라미터 전달 시작 (petRestrictions 변경됨) ---
                holiday,
                operatingHours,
                petFriendlyInfo,
                petOnlyInfo,
                petRestrictions, // <-- 변경! Set<String> -> String
                // --- 새로운 필터 파라미터 전달 끝 ---
                pageable
        );
    }

    // 기존 단일 조회 엔드포인트들 (필요하다면 유지)
    @GetMapping
    public List<PetFacility> getAllPetFacilities() {
        return petFacilityRepository.findAll();
    }

    @GetMapping("/category1/{category1}")
    public List<PetFacility> getByCategory1(@PathVariable String category1) {
        return petFacilityRepository.findByCategory1ContainingIgnoreCase(category1);
    }

    @GetMapping("/category2/{category2}")
    public List<PetFacility> getByCategory2(@PathVariable String category2) {
        return petFacilityRepository.findByCategory2ContainingIgnoreCase(category2);
    }

    @GetMapping("/region/{sidoName}")
    public List<PetFacility> getBySido(@PathVariable String sidoName) {
        return petFacilityRepository.findBySidoNameContainingIgnoreCase(sidoName);
    }

    @GetMapping("/region/{sidoName}/category1/{category1}")
    public List<PetFacility> getBySidoAndCategory1(
            @PathVariable String sidoName,
            @PathVariable String category1) {
        return petFacilityRepository.findBySidoNameContainingIgnoreCaseAndCategory1ContainingIgnoreCase(
                sidoName, category1);
    }

    // 프론트엔드에서 필터 옵션을 채우기 위한 DISTINCT 값 조회 엔드포인트들
    @GetMapping("/categories/category1")
    public List<String> getDistinctCategory1() {
        return petFacilityRepository.findDistinctCategory1();
    }

    @GetMapping("/categories/category2")
    public List<String> getDistinctCategory2() {
        return petFacilityRepository.findDistinctCategory2();
    }

    @GetMapping("/regions")
    public List<String> getDistinctRegions() {
        return petFacilityRepository.findDistinctSidoName();
    }

    @GetMapping("/sigungu")
    public List<String> getDistinctSigungu() {
        return petFacilityRepository.findDistinctSigunguName();
    }

    @GetMapping("/petsizes")
    public List<String> getDistinctPetSizes() {
        return petFacilityRepository.findDistinctAllowedPetSize();
    }

    // --- 새로운 필드에 대한 distinct 값 조회 엔드포인트 ---
    @GetMapping("/holidays")
    public List<String> getDistinctHolidays() {
        return petFacilityRepository.findDistinctHoliday();
    }

    @GetMapping("/operatingHours")
    public List<String> getDistinctOperatingHours() {
        return petFacilityRepository.findDistinctOperatingHours();
    }

    // petFriendlyInfo와 petOnlyInfo는 "Y", "N"으로 고정될 가능성이 높으므로,
    // 별도의 distinct 엔드포인트 없이 프론트엔드에서 옵션을 직접 정의하는 것이 효율적일 수 있습니다.
    // 필요하다면 아래처럼 추가할 수 있습니다.
    /*
    @GetMapping("/petfriendlyinfo")
    public List<String> getDistinctPetFriendlyInfo() {
        // 이 필드가 String 타입이라고 가정하고, 실제 DB 값을 조회
        return petFacilityRepository.findDistinctPetFriendlyInfo();
    }

    @GetMapping("/petonlyinfo")
    public List<String> getDistinctPetOnlyInfo() {
        // 이 필드가 String 타입이라고 가정하고, 실제 DB 값을 조회
        return petFacilityRepository.findDistinctPetOnlyInfo();
    }
    */

    @GetMapping("/petrestrictions")
    public List<String> getDistinctPetRestrictions() {
        return petFacilityRepository.findDistinctPetRestrictions();
    }
}