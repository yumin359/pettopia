package com.example.backend.demo;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Make sure to import the Location entity and LocationRepository
import com.example.backend.demo.Location; // Location 엔티티의 실제 패키지 경로에 맞게 수정
import com.example.backend.demo.LocationRepository; // LocationRepository의 실제 패키지 경로에 맞게 수정

@RestController // Indicates this class is a RESTful web service controller
@RequestMapping("/api/locations") // Base path for all endpoints in this controller
@CrossOrigin(origins = "http://localhost:5173") // Allows requests from the React development server (Vite default port)
public class LocationController {

    private final LocationRepository locationRepository; // Injects LocationRepository

    // Constructor injection for LocationRepository
    public LocationController(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    // GET endpoint to return all location data
    @GetMapping // Handles GET requests to /api/locations
    public List<Location> getAllLocations() {
        // Retrieves all Location entities from the database
        return locationRepository.findAll();
    }

    // (Optional) Endpoint to add initial test data
    // This method can be called once to populate the database with some sample locations.
    // In a production environment, this code should be removed or managed differently.
    @GetMapping("/init-data") // Handles GET requests to /api/locations/init-data
    public String initializeData() {
        if (locationRepository.count() == 0) { // Add data only if the table is empty
            // Using the new constructor: Location(String name, double latitude, double longitude)
            locationRepository.save(new Location("카카오 본사", 33.450701, 126.570667));
            locationRepository.save(new Location("제주공항", 33.507000, 126.492500));
            locationRepository.save(new Location("성산일출봉", 33.428580, 126.941975));
            return "Initial data added successfully!";
        }
        return "Data already exists.";
    }
}