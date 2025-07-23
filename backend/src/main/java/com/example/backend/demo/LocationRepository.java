package com.example.backend.demo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Make sure to import the Location entity
import com.example.backend.demo.Location; // Location 엔티티의 실제 패키지 경로에 맞게 수정해주세요.
// 현재는 같은 패키지이므로 'Location' 만으로도 가능하지만, 명확성을 위해 전체 경로를 썼습니다.

@Repository // Marks this interface as a Spring Data JPA repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    // JpaRepository provides basic CRUD operations (save, findById, findAll, delete)
}