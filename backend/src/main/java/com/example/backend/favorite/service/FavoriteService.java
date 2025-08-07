package com.example.backend.favorite.service;

import com.example.backend.favorite.dto.FavoriteDto;
import com.example.backend.favorite.dto.FavoriteForm;
import com.example.backend.favorite.entity.Favorite;
import com.example.backend.favorite.entity.FavoriteId;
import com.example.backend.favorite.repository.FavoriteRepository;
import com.example.backend.member.entity.Member;
import com.example.backend.member.repository.MemberRepository;
import com.example.backend.petFacility.dto.FavoriteFacilityDto;
import com.example.backend.petFacility.entity.PetFacility;
import com.example.backend.petFacility.repository.PetFacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

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

        String email = authentication.getName();
        String facilityName = favoriteForm.getFacilityName();

        var favorite = favoriteRepository.findByFacilityNameAndMemberEmail(facilityName, email);

        if (favorite.isPresent()) {
            favoriteRepository.delete(favorite.get());
        } else {
            var petFacility = petFacilityRepository.findByName(facilityName)
                    .orElseThrow(() -> new RuntimeException("시설명 없음"));
            var member = memberRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("회원 없음"));

            FavoriteId favoriteId = new FavoriteId();
            favoriteId.setMemberId(member.getId());
            favoriteId.setFacilityId(petFacility.getId());

            Favorite newFavorite = new Favorite();
            newFavorite.setId(favoriteId);
            newFavorite.setMember(member);
            newFavorite.setFacility(petFacility);

            favoriteRepository.save(newFavorite);
        }
    }

    public FavoriteDto get(String facilityName, Authentication authentication) {
        boolean isFavorite = false;

        if (authentication != null) {
            var row = favoriteRepository.findByFacilityNameAndMemberEmail(facilityName, authentication.getName());
            isFavorite = row.isPresent();
        }

        FavoriteDto favoriteDto = new FavoriteDto();
        favoriteDto.setIsFavorite(isFavorite);
        return favoriteDto;
    }

    public List<FavoriteFacilityDto> getMyFavorite(Authentication authentication) {
        if (authentication == null) {
            throw new RuntimeException("로그인 하세요");
        }
        String email = authentication.getName();
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));

        List<Favorite> favoriteList = favoriteRepository.findByMember(member);

        if (favoriteList.isEmpty()) {
            return Collections.emptyList();
        }
        
        return favoriteList.stream()
                .map(fav -> {
                    PetFacility facility = fav.getFacility();

                    return FavoriteFacilityDto.builder()
                            .facilityId(facility.getId())
                            .name(facility.getName())
                            .latitude(facility.getLatitude())
                            .longitude(facility.getLongitude())
                            .category2(facility.getCategory2())
                            .category3(facility.getCategory3())
                            .roadAddress(facility.getRoadAddress())
                            .jibunAddress(facility.getJibunAddress())
                            .phoneNumber(facility.getPhoneNumber())
                            .holiday(facility.getHoliday())
                            .operatingHours(facility.getOperatingHours())
                            .parkingAvailable(facility.getParkingAvailable())
                            .petFriendlyInfo(facility.getPetFriendlyInfo())
                            .indoorFacility(facility.getIndoorFacility())
                            .outdoorFacility(facility.getOutdoorFacility())
                            .allowedPetSize(facility.getAllowedPetSize())
                            .petRestrictions(facility.getPetRestrictions())
                            .build();
                })
                .collect(Collectors.toList());
    }
}
