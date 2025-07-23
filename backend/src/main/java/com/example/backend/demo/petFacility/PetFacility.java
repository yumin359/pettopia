package com.example.backend.demo.petFacility;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PetFacility {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // 시설명
    private String category1; // 카테고리1
    private String category2; // 카테고리2
    private String category3; // 카테고리3
    private double latitude; // 위도
    private double longitude; // 경도
    private String roadAddress; // 도로명주소
    private String jibunAddress; // 지번주소
    private String phoneNumber; // 전화번호
    private String homepage; // 홈페이지
    private String holiday; // 휴무일
    private String operatingHours; // 운영시간
    private String petFriendlyInfo; // 반려동물 동반 가능정보
    private String description; // 기본 정보_장소설명

    // 초기 데이터 로딩을 위한 생성자 (필요한 필드만 포함)
    public PetFacility(String name, String category1, String category2, String category3, double latitude, double longitude, String roadAddress, String jibunAddress, String phoneNumber, String homepage, String holiday, String operatingHours, String petFriendlyInfo, String description) {
        this.name = name;
        this.category1 = category1;
        this.category2 = category2;
        this.category3 = category3;
        this.latitude = latitude;
        this.longitude = longitude;
        this.roadAddress = roadAddress;
        this.jibunAddress = jibunAddress;
        this.phoneNumber = phoneNumber;
        this.homepage = homepage;
        this.holiday = holiday;
        this.operatingHours = operatingHours;
        this.petFriendlyInfo = petFriendlyInfo;
        this.description = description;
    }

    // 여기에 평점과 리뷰 관련 필드 추가 (나중에 구현할 때)
    // private double averageRating;
    // private int reviewCount;
}