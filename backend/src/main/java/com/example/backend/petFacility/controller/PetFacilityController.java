package com.example.backend.petFacility.controller;

import com.example.backend.petFacility.repository.PetFacilityRepository;
import com.example.backend.petFacility.entity.PetFacility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/pet_facilities")
//@CrossOrigin(origins = "http://localhost:5173")
public class PetFacilityController {

    private final PetFacilityRepository petFacilityRepository;

    // 통일된 4가지 카테고리 목록
    private static final Set<String> SIMPLIFIED_PET_SIZES = Set.of("모두가능", "개", "고양이", "기타");

    public PetFacilityController(PetFacilityRepository petFacilityRepository) {
        this.petFacilityRepository = petFacilityRepository;
    }

    // 통합 검색 엔드포인트 (수정됨)
    @GetMapping("/search")
    public Page<PetFacility> searchPetFacilities(
            @RequestParam(required = false) String sidoName,
            @RequestParam(required = false) String sigunguName,
            @RequestParam(required = false) Set<String> category2,
            @RequestParam(required = false) Set<String> allowedPetSize, // 이제 4가지 카테고리 중 하나가 들어옴
            @RequestParam(required = false) String parkingAvailable,
            @RequestParam(required = false) String indoorFacility,
            @RequestParam(required = false) String outdoorFacility,
            @PageableDefault(size = 15, sort = "name", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        if (category2 != null && category2.isEmpty()) category2 = null;

        // 프론트에서 받은 4가지 카테고리를 DB의 실제 값으로 변환
        Set<String> originalPetSizesToSearch = null;
        if (allowedPetSize != null && !allowedPetSize.isEmpty()) {
            originalPetSizesToSearch = mapToOriginalPetSizes(allowedPetSize);
        }

        return petFacilityRepository.findFacilitiesByFilters(
                sidoName,
                sigunguName,
                category2,
                originalPetSizesToSearch, // 변환된 DB 값을 전달
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

    // 필터 옵션 엔드포인트 (수정됨)
    @GetMapping("/petsizes")
    public Set<String> getDistinctPetSizes() {
        // DB의 95개 값을 그대로 반환하는 대신, 통일된 4가지 카테고리만 반환
        return SIMPLIFIED_PET_SIZES;
    }

    @GetMapping("/detail")
    public ResponseEntity<PetFacility> getFacilityByName(@RequestParam String name) {
        return petFacilityRepository.findByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // --- 새로운 매핑 로직 ---

    /**
     * 프론트엔드에서 받은 4가지 통일된 카테고리를 DB의 실제 값들로 변환합니다.
     *
     * @param simplifiedSizes "모두가능", "개", "고양이", "기타" 등의 Set
     * @return DB에서 검색해야 할 allowed_pet_size 값들의 Set
     */
    private Set<String> mapToOriginalPetSizes(Set<String> simplifiedSizes) {
        Set<String> originalSizes = new HashSet<>();
        List<String> allDbSizes = petFacilityRepository.findDistinctAllowedPetSize(); // 95개 값 가져오기

        for (String dbSize : allDbSizes) {
            // "모두가능"이 검색 조건에 있으면
            if (simplifiedSizes.contains("모두가능") && dbSize.contains("모두 가능")) {
                originalSizes.add(dbSize);
            }
            // "고양이"가 검색 조건에 있으면
            if (simplifiedSizes.contains("고양이") && dbSize.contains("고양이")) {
                originalSizes.add(dbSize);
            }
            // "개"가 검색 조건에 있으면 (개, kg, 소형 등 포함)
            if (simplifiedSizes.contains("개") && (
                    dbSize.contains("개") || dbSize.contains("kg") || dbSize.contains("소형") ||
                            dbSize.contains("중형") || dbSize.contains("대형")
            )) {
                originalSizes.add(dbSize);
            }
            // "기타"가 검색 조건에 있으면 (위 3가지에 속하지 않는 모든 경우)
            boolean isOther = !(dbSize.contains("모두 가능") || dbSize.contains("고양이") ||
                    dbSize.contains("개") || dbSize.contains("kg") ||
                    dbSize.contains("소형") || dbSize.contains("중형") ||
                    dbSize.contains("대형"));
            if (simplifiedSizes.contains("기타") && isOther) {
                originalSizes.add(dbSize);
            }
        }
        return originalSizes;
    }
}