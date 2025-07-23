package com.example.backend.demo.location;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "http://localhost:5173")
public class LocationController {

    private final LocationRepository locationRepository;

    public LocationController(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    @GetMapping // Handles GET requests to /api/locations
    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    @GetMapping("/init-data")
    public String initializeData() {
        if (locationRepository.count() == 0) {
            locationRepository.save(new Location("카카오 본사", 33.450701, 126.570667));
            locationRepository.save(new Location("제주공항", 33.507000, 126.492500));
            locationRepository.save(new Location("성산일출봉", 33.428580, 126.941975));
            return "Initial data added successfully!";
        }
        return "Data already exists.";
    }
}