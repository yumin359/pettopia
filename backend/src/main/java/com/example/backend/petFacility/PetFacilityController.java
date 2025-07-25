package com.example.backend.petFacility;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/pet_facilities")
@CrossOrigin(origins = "http://localhost:5173")
public class PetFacilityController {

    private final PetFacilityRepository petFacilityRepository;

    public PetFacilityController(PetFacilityRepository petFacilityRepository) {
        this.petFacilityRepository = petFacilityRepository;
    }

    // 통합 검색 엔드포인트 (간소화됨)
    @GetMapping("/search")
    public Page<PetFacility> searchPetFacilities(
            @RequestParam(required = false) String sidoName,
            @RequestParam(required = false) String sigunguName,
            @RequestParam(required = false) Set<String> category2,
            @RequestParam(required = false) Set<String> allowedPetSize,
            @RequestParam(required = false) String parkingAvailable,
            @RequestParam(required = false) String indoorFacility,
            @RequestParam(required = false) String outdoorFacility,
            @PageableDefault(size = 15, sort = "name", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        // 빈 Set은 null로 바꾸기 (JPA IN 절 오류 방지)
        if (category2 != null && category2.isEmpty()) category2 = null;
        if (allowedPetSize != null && allowedPetSize.isEmpty()) allowedPetSize = null;

        return petFacilityRepository.findFacilitiesByFilters(
                sidoName,
                sigunguName,
                category2,
                allowedPetSize,
                parkingAvailable,
                indoorFacility,
                outdoorFacility,
                pageable
        );
    }

    // 기존 단일 조회 엔드포인트들 (필요하다면 유지)
    @GetMapping
    public List<PetFacility> getAllPetFacilities() {
        return petFacilityRepository.findAll();
    }

    @GetMapping("/category2/{category2}")
    public List<PetFacility> getByCategory2(@PathVariable String category2) {
        return petFacilityRepository.findByCategory2ContainingIgnoreCase(category2);
    }

    @GetMapping("/region/{sidoName}")
    public List<PetFacility> getBySido(@PathVariable String sidoName) {
        return petFacilityRepository.findBySidoNameContainingIgnoreCase(sidoName);
    }

    // 프론트엔드에서 필터 옵션을 채우기 위한 DISTINCT 값 조회 엔드포인트들
    @GetMapping("/categories/category2")
    public List<String> getDistinctCategory2() {
        return petFacilityRepository.findDistinctCategory2();
    }

    @GetMapping("/regions")
    public List<String> getDistinctRegions() {
        return petFacilityRepository.findDistinctSidoName();
    }

    // 전체 시군구 조회 또는 지역별 시군구 조회
    @GetMapping("/sigungu")
    public List<String> getDistinctSigungu(@RequestParam(required = false) String region) {
        try {
            if (region != null && !region.equals("전체") && !region.trim().isEmpty()) {
                List<String> result = petFacilityRepository.findDistinctSigunguNameByRegion(region.trim());
                System.out.println("지역별 시군구 조회 - 지역: " + region + ", 결과: " + result.size() + "개");
                return result;
            }
            List<String> result = petFacilityRepository.findDistinctSigunguName();
            System.out.println("전체 시군구 조회 - 결과: " + result.size() + "개");
            return result;
        } catch (Exception e) {
            System.err.println("시군구 조회 오류: " + e.getMessage());
            return List.of(); // 빈 리스트 반환
        }
    }

    @GetMapping("/petsizes")
    public List<String> getDistinctPetSizes() {
        return petFacilityRepository.findDistinctAllowedPetSize();
    }
}