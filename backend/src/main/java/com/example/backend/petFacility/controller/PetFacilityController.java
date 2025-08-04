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
import java.util.stream.Collectors; // 이 import는 사용되지 않을 수 있지만, 안전하게 유지합니다.

@RestController
@RequestMapping("/api/pet_facilities")
//@CrossOrigin(origins = "http://localhost:5173")
public class PetFacilityController {

    private final PetFacilityRepository petFacilityRepository;

    // 통일된 4가지 카테고리 목록
    private static final Set<String> SIMPLIFIED_PET_SIZES = Set.of("모두가능", "개", "고양이", "기타");

    // "기타" 카테고리에 포함될 명시적인 키워드 목록
    private static final Set<String> OTHER_PET_KEYWORDS = Set.of(
            "파충류", "특수동물", "새", "물고기", "토끼", "고슴도치", "햄스터", "기니피그",
            "말", "소", "염소", "설치류", "어류", "앵무새", "해양동물", "가금류",
            "하늘다람쥐", "거북이", "도마뱀", "뱀", "페릿", "포유류"
    );

    // 개 카테고리에 해당하는 모든 키워드
    private static final Set<String> DOG_KEYWORDS = Set.of(
            "개", "kg", "소형", "중형", "대형", "특수견"
    );

    public PetFacilityController(PetFacilityRepository petFacilityRepository) {
        this.petFacilityRepository = petFacilityRepository;
    }

    // 통합 검색 엔드포인트 (수정 없음)
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
        if (category2 != null && category2.isEmpty()) category2 = null;

        Set<String> originalPetSizesToSearch = null;
        if (allowedPetSize != null && !allowedPetSize.isEmpty()) {
            originalPetSizesToSearch = mapToOriginalPetSizes(allowedPetSize);
        }

        return petFacilityRepository.findFacilitiesByFilters(
                sidoName,
                sigunguName,
                category2,
                originalPetSizesToSearch,
                parkingAvailable,
                indoorFacility,
                outdoorFacility,
                pageable
        );
    }

    // 기존 단일 조회 엔드포인트들 (유지)
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

    // 프론트엔드에서 필터 옵션을 채우기 위한 DISTINCT 값 조회 엔드포인트들 (유지)
    @GetMapping("/categories/category2")
    public List<String> getDistinctCategory2() {
        return petFacilityRepository.findDistinctCategory2();
    }

    @GetMapping("/regions")
    public List<String> getDistinctRegions() {
        return petFacilityRepository.findDistinctSidoName();
    }

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
            return List.of();
        }
    }

    // 필터 옵션 엔드포인트 (유지)
    @GetMapping("/petsizes")
    public Set<String> getDistinctPetSizes() {
        return SIMPLIFIED_PET_SIZES;
    }

    @GetMapping("/detail")
    public ResponseEntity<PetFacility> getFacilityByName(@RequestParam String name) {
        return petFacilityRepository.findByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // --- 수정된 매핑 로직 ---
    private Set<String> mapToOriginalPetSizes(Set<String> simplifiedSizes) {
        Set<String> originalSizes = new HashSet<>();
        List<String> allDbSizes = petFacilityRepository.findDistinctAllowedPetSize();

        for (String dbSize : allDbSizes) {
            String category = classifyPetSize(dbSize);

            // 💡 category가 null이 아니고, 분류된 카테고리가 사용자의 검색 조건에 포함될 때만 추가
            if (category != null && simplifiedSizes.contains(category)) {
                originalSizes.add(dbSize);
            }
        }
        return originalSizes;
    }

    private String classifyPetSize(String dbSize) {
        // 1. "해당없음"은 어떤 카테고리에도 속하지 않음
        if (dbSize.contains("해당없음")) {
            return null;
        }

        // 2. 우선순위: 모두 가능
        if (dbSize.contains("모두 가능")) {
            return "모두가능";
        }

        // 3. 고양이 (다른 키워드와 함께 있어도 고양이가 있으면 고양이로 분류)
        if (dbSize.contains("고양이")) {
            return "고양이";
        }

        // 4. 개 (다른 키워드와 함께 있어도 개 관련 키워드가 있으면 개로 분류)
        if (DOG_KEYWORDS.stream().anyMatch(dbSize::contains)) {
            return "개";
        }

        // 5. 기타 (명시된 기타 동물 키워드가 있는 경우만)
        if (OTHER_PET_KEYWORDS.stream().anyMatch(dbSize::contains)) {
            return "기타";
        }

        // 6. 위 어떤 명시적인 카테고리에도 속하지 않는 경우 (예: "주말, 공휴일 15kg 이하" 등)
        // 이 경우, 어떤 간소화된 필터에도 포함되지 않도록 null을 반환합니다.
        return null;
    }
}