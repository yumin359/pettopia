package com.example.backend.favorite.repository;

import com.example.backend.favorite.entity.Favorite;
import com.example.backend.favorite.entity.FavoriteId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, FavoriteId> {
    Optional<Favorite> findByFacilityNameAndMemberEmail(String facilityName, String email);

}