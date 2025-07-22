package com.example.backend.demo;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor; // 이 어노테이션이 모든 필드를 포함하는 생성자를 만들어주지만,
// 특정 인자만 받는 생성자는 직접 추가하는 것이 명확합니다.

@Entity // This class maps to a database table
@Getter // Lombok: Generates getters for all fields
@Setter // Lombok: Generates setters for all fields
@NoArgsConstructor // Lombok: Generates a no-argument constructor (required by JPA)
@AllArgsConstructor // Lombok: Generates a constructor with all fields (including 'id')
public class Location {

    @Id // Specifies the primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment strategy for MariaDB
    private Long id;

    private String name; // Name of the place
    private double latitude; // Latitude for map coordinates
    private double longitude; // Longitude for map coordinates

    // Constructor to be used for creating new Location objects without an ID (ID is auto-generated)
    // This constructor resolves the "no suitable constructor found" error in LocationController.
    public Location(String name, double latitude, double longitude) {
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}