package com.example.backend.demo.petFacility;

import com.example.backend.demo.petFacility.PetFacility;
import com.example.backend.demo.petFacility.PetFacilityRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pet_facilities")
@CrossOrigin(origins = "http://localhost:5173")
public class PetFacilityController {

    private final PetFacilityRepository petFacilityRepository;

    public PetFacilityController(PetFacilityRepository petFacilityRepository) {
        this.petFacilityRepository = petFacilityRepository;
    }

    // 전체 시설 조회
    @GetMapping
    public List<PetFacility> getAllPetFacilities() {
        return petFacilityRepository.findAll();
    }

    // 카테고리1으로 필터링 (예: 숙박, 음식점, 문화시설 등)
    @GetMapping("/category1/{category1}")
    public List<PetFacility> getByCategory1(@PathVariable String category1) {
        return petFacilityRepository.findByCategory1ContainingIgnoreCase(category1);
    }

    // 카테고리2로 필터링 (예: 펜션, 카페, 박물관 등)
    @GetMapping("/category2/{category2}")
    public List<PetFacility> getByCategory2(@PathVariable String category2) {
        return petFacilityRepository.findByCategory2ContainingIgnoreCase(category2);
    }

    // 지역별 필터링 (서울, 부산 등)
    @GetMapping("/region/{sidoName}")
    public List<PetFacility> getBySido(@PathVariable String sidoName) {
        return petFacilityRepository.findBySidoNameContainingIgnoreCase(sidoName);
    }

    // 복합 필터링: 지역 + 카테고리1
    @GetMapping("/region/{sidoName}/category1/{category1}")
    public List<PetFacility> getBySidoAndCategory1(
            @PathVariable String sidoName,
            @PathVariable String category1) {
        return petFacilityRepository.findBySidoNameContainingIgnoreCaseAndCategory1ContainingIgnoreCase(
                sidoName, category1);
    }

    // 사용 가능한 카테고리1 목록 조회
    @GetMapping("/categories/category1")
    public List<String> getDistinctCategory1() {
        return petFacilityRepository.findDistinctCategory1();
    }

    // 사용 가능한 카테고리2 목록 조회
    @GetMapping("/categories/category2")
    public List<String> getDistinctCategory2() {
        return petFacilityRepository.findDistinctCategory2();
    }

    // 사용 가능한 지역 목록 조회
    @GetMapping("/regions")
    public List<String> getDistinctRegions() {
        return petFacilityRepository.findDistinctSidoName();
    }

    // PetFacilityController.java에 추가할 수 있는 엔드포인트들

    // 시군구별 필터링
    @GetMapping("/sigungu/{sigunguName}")
    public List<PetFacility> getBySigungu(@PathVariable String sigunguName) {
        return petFacilityRepository.findBySigunguNameContainingIgnoreCase(sigunguName);
    }

    // 반려동물 크기별 필터링
    @GetMapping("/petsize/{allowedPetSize}")
    public List<PetFacility> getByPetSize(@PathVariable String allowedPetSize) {
        return petFacilityRepository.findByAllowedPetSizeContainingIgnoreCase(allowedPetSize);
    }

    // 주차 가능 여부별 필터링
    @GetMapping("/parking/{parkingAvailable}")
    public List<PetFacility> getByParking(@PathVariable String parkingAvailable) {
        return petFacilityRepository.findByParkingAvailableContainingIgnoreCase(parkingAvailable);
    }

    // 실내/실외별 필터링
    @GetMapping("/indoor/{indoorFacility}")
    public List<PetFacility> getByIndoor(@PathVariable String indoorFacility) {
        return petFacilityRepository.findByIndoorFacilityContainingIgnoreCase(indoorFacility);
    }

//    // 복합 필터링 (지역 + 카테고리 + 크기)
//    @GetMapping("/region/{sidoName}/category1/{category1}/petsize/{allowedPetSize}")
//    public List<PetFacility> getByMultipleFilters(
//            @PathVariable String sidoName,
//            @PathVariable String category1,
//            @PathVariable String allowedPetSize) {
//        return petFacilityRepository.findBySidoNameContainingIgnoreCaseAndCategory1ContainingIgnoreCaseAndAllowedPetSizeContainingIgnoreCase(
//                sidoName, category1, allowedPetSize);
//    }

//    // 고유 값들 조회
//    @GetMapping("/categories/category2")
//    public List<String> getDistinctCategory2() {
//        return petFacilityRepository.findDistinctCategory2();
//    }

    @GetMapping("/categories/category3")
    public List<String> getDistinctCategory3() {
        return petFacilityRepository.findDistinctCategory3();
    }

    @GetMapping("/sigungu")
    public List<String> getDistinctSigungu() {
        return petFacilityRepository.findDistinctSigunguName();
    }

    @GetMapping("/petsizes")
    public List<String> getDistinctPetSizes() {
        return petFacilityRepository.findDistinctAllowedPetSize();
    }
}