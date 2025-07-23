package com.example.backend.demo.petFacility;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PetFacilityRepository extends JpaRepository<PetFacility, Long> {
}