//package com.example.backend.demo.location;
//
//import org.springframework.web.bind.annotation.CrossOrigin;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/locations")
//@CrossOrigin(origins = "http://localhost:5173")
//public class LocationController {
//
//    private final LocationRepository locationRepository;
//
//    public LocationController(LocationRepository locationRepository) {
//        this.locationRepository = locationRepository;
//    }
//
//    @GetMapping // Handles GET requests to /api/locations
//    public List<Location> getAllLocations() {
//        return locationRepository.findAll();
//    }
//
//    @GetMapping("/init-data")
//    public String initializeData() {
//        if (locationRepository.count() == 0) {
//            // 서울 지역 데이터로 변경!
//            locationRepository.save(new Location("서울시청", 37.566826, 126.9786567));
//            locationRepository.save(new Location("강남역", 37.497175, 127.027926));
//            locationRepository.save(new Location("홍대입구역", 37.557527, 126.925394));
//            return "Initial data added successfully!";
//        }
//        return "Data already exists.";
//    }
//}