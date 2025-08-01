package com.example.backend.favorite.controller;

import com.example.backend.favorite.dto.FavoriteDto;
import com.example.backend.favorite.dto.FavoriteForm;
import com.example.backend.favorite.entity.Favorite;
import com.example.backend.favorite.service.FavoriteService;
import com.example.backend.petFacility.dto.FavoriteFacilityDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/favorite")
public class FavoriteController {
    private final FavoriteService favoriteService;

    // 프론트에서 facilityName으로 보내는데 db는 name임
    @PutMapping
    public void favorite(@RequestBody FavoriteForm favoriteForm, Authentication authentication) {
        favoriteService.update(favoriteForm, authentication);
    }

    @GetMapping("/{facilityName}")
    public FavoriteDto get(@PathVariable("facilityName") String facilityName, Authentication authentication) {
        return favoriteService.get(facilityName, authentication);
    }

    @GetMapping("/mine")
    public List<FavoriteFacilityDto> getMine(Authentication authentication) {
        return favoriteService.getMyFavorite(authentication);
    }
}
