package com.example.backend.petFacility.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FavoriteFacilityDto {
    private Long facilityId;
    private String name;
    private Double latitude;
    private Double longitude;
    // 일단 지도에 표시하기 위한 것. 나중에 더 추가하기
//    private String sidoName;
//    private String sigunguName;
}
