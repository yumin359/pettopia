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
    // Updated search endpoint to support pagination
    @GetMapping("/search")
    public Page<PetFacility> searchPetFacilities( // Return type changed to Page<PetFacility>
                                                  @RequestParam(required = false) String sidoName,
                                                  @RequestParam(required = false) String sigunguName,
                                                  @RequestParam(required = false) Set<String> category1,
                                                  @RequestParam(required = false) Set<String> category2,
                                                  @RequestParam(required = false) Set<String> allowedPetSize,
                                                  @RequestParam(required = false) String parkingAvailable,
                                                  @RequestParam(required = false) String indoorFacility,
                                                  @RequestParam(required = false) String outdoorFacility,
                                                  @PageableDefault(size = 10, sort = "name", direction = Sort.Direction.ASC) Pageable pageable // Add Pageable
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
                pageable // Pass pageable to repository
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

    // Used by frontend to populate filter options
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
}