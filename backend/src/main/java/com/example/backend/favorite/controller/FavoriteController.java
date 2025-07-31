package com.example.backend.favorite.controller;

import com.example.backend.favorite.dto.FavoriteForm;
import com.example.backend.favorite.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/favorite")
public class FavoriteController {
    private final FavoriteService favoriteService;

    // 프론트에서 facilityName으로 보내는데 db는 name임
    @PostMapping
    public void favorite(@RequestBody FavoriteForm favoriteForm, Authentication authentication) {
        favoriteService.update(favoriteForm, authentication);
    }
}
