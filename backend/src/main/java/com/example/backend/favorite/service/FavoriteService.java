package com.example.backend.favorite.service;

import com.example.backend.favorite.dto.FavoriteForm;
import com.example.backend.favorite.repository.FavoriteRepository;
import com.example.backend.member.repository.MemberRepository;
import com.example.backend.petFacility.PetFacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final PetFacilityRepository petFacilityRepository;
    private final MemberRepository memberRepository;

    public void update(FavoriteForm favoriteForm, Authentication authentication) {
        if (authentication == null) {
            throw new RuntimeException("로그인 하세요");
        }
    }
}
