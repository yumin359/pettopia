package com.example.backend.petFacility;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set; // Import Set for checkbox parameters

@RestController
@RequestMapping("/api/pet_facilities")
@CrossOrigin(origins = "http://localhost:5173")
public class PetFacilityController {

    private final PetFacilityRepository petFacilityRepository;

    public PetFacilityController(PetFacilityRepository petFacilityRepository) {
        this.petFacilityRepository = petFacilityRepository;
    }

    // New unified search endpoint
    // Updated search endpoint to support pagination and new filters
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
            // --- 새로운 필터 파라미터 추가 시작 ---
            @RequestParam(required = false) String holiday, // 휴무일
            @RequestParam(required = false) String operatingHours, // 운영시간
            @RequestParam(required = false) String petFriendlyInfo, // 반려동물 동반 가능 정보 (Y/N)
            @RequestParam(required = false) String petOnlyInfo, // 반려동물 전용 정보 (Y/N)
            @RequestParam(required = false) Set<String> petRestrictions, // 반려동물 제한사항 (다중 선택 가능성 고려 Set<String>)
            // --- 새로운 필터 파라미터 추가 끝 ---
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
                // --- 새로운 필터 파라미터 전달 시작 ---
                holiday,
                operatingHours,
                petFriendlyInfo,
                petOnlyInfo,
                petRestrictions,
                // --- 새로운 필터 파라미터 전달 끝 ---
                pageable
        );
    }

    // Existing endpoints (keep them if you still need them, but the /search endpoint will be primary for the map)
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

    // Used by frontend to populate filter options (existing)
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

    // --- 새로운 distinct 값 가져오는 엔드포인트 추가 시작 ---
    @GetMapping("/holidays")
    public List<String> getDistinctHolidays() {
        return petFacilityRepository.findDistinctHoliday();
    }

    @GetMapping("/operatingHours")
    public List<String> getDistinctOperatingHours() {
        return petFacilityRepository.findDistinctOperatingHours();
    }

    // petFriendlyInfo와 petOnlyInfo는 보통 "Y", "N" 값으로 고정되므로, distinct 엔드포인트가 필요 없을 수 있습니다.
    // 프론트엔드에서 직접 "전체", "가능"(Y), "불가능"(N) 등으로 옵션을 정의하는 것이 효율적입니다.
    // 필요하다면 아래와 같이 추가할 수 있습니다.
    /*
    @GetMapping("/petfriendlyinfo")
    public List<String> getDistinctPetFriendlyInfo() {
        return petFacilityRepository.findDistinctPetFriendlyInfo();
    }

    @GetMapping("/petonlyinfo")
    public List<String> getDistinctPetOnlyInfo() {
        return petFacilityRepository.findDistinctPetOnlyInfo();
    }
    */

    @GetMapping("/petrestrictions")
    public List<String> getDistinctPetRestrictions() {
        return petFacilityRepository.findDistinctPetRestrictions();
    }
    // --- 새로운 distinct 값 가져오는 엔드포인트 추가 끝 ---
}