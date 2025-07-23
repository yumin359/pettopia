package com.example.backend.demo.petFacility;

import com.example.backend.demo.petFacility.PetFacility;
import com.example.backend.demo.petFacility.PetFacilityRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/pet-facilities") // 새로운 엔드포인트
@CrossOrigin(origins = "http://localhost:5173")
public class PetFacilityController {

    private final PetFacilityRepository petFacilityRepository;

    public PetFacilityController(PetFacilityRepository petFacilityRepository) {
        this.petFacilityRepository = petFacilityRepository;
    }

    @GetMapping
    public List<PetFacility> getAllPetFacilities() {
        return petFacilityRepository.findAll();
    }

    // TODO: 나중에 카테고리별 필터링 엔드포인트도 여기에 추가할 수 있습니다.
    // 예: @GetMapping("/category/{category1}") public List<PetFacility> getByCategory(@PathVariable String category1) { ... }
}