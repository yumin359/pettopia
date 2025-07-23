package com.example.backend.config;

import com.example.backend.demo.petFacility.PetFacility;
import com.example.backend.demo.petFacility.PetFacilityRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer {

    private final PetFacilityRepository petFacilityRepository;

    // CSV 파일 경로를 application.properties 등에서 주입받습니다.
    @Value("classpath:한국문화정보원_전국 반려동물 동반 가능 문화시설 위치 데이터_20221130.csv") // 파일명 정확히 일치
    private Resource petFacilityCsv;

    public DataInitializer(PetFacilityRepository petFacilityRepository) {
        this.petFacilityRepository = petFacilityRepository;
    }

    @PostConstruct // 애플리케이션 시작 시 한 번 실행됩니다.
    public void initData() {
        if (petFacilityRepository.count() == 0) { // 데이터가 비어있을 때만 로드
            System.out.println("CSV 데이터 로딩 시작...");
            List<PetFacility> facilities = new ArrayList<>();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(petFacilityCsv.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                boolean isFirstLine = true; // 헤더 스킵을 위함

                while ((line = reader.readLine()) != null) {
                    if (isFirstLine) {
                        isFirstLine = false;
                        continue; // 헤더 라인 건너뛰기
                    }

                    // TODO: CSV 파싱 로직 구현 (매우 중요하고 까다로운 부분)
                    // 이 부분은 CSV의 각 필드를 정확히 분리하고, 필요한 타입으로 변환해야 합니다.
                    // 콤마(,)와 큰따옴표(") 처리에 주의해야 합니다.
                    // CSV 파서 라이브러리 (예: Apache Commons CSV, OpenCSV) 사용을 강력히 권장합니다.
                    // 여기서는 간단한 split 예시를 들지만, 실제로는 복잡합니다.
                    String[] data = line.split("\",\""); // 큰 따옴표와 콤마로 분리 시도
                    if (data.length < 13) { // 최소한 필요한 컬럼 수 확인 (예시)
                        System.err.println("Skipping malformed line: " + line);
                        continue;
                    }

                    try {
                        String name = data[0].replace("\"", ""); // 첫 컬럼 "시설명"
                        String category1 = data[1].replace("\"", ""); // 카테고리1
                        String category2 = data[2].replace("\"", ""); // 카테고리2
                        String category3 = data[3].replace("\"", ""); // 카테고리3
                        double latitude = Double.parseDouble(data[11].replace("\"", "")); // 위도 (12번째 컬럼)
                        double longitude = Double.parseDouble(data[12].replace("\"", "")); // 경도 (13번째 컬럼)
                        String roadAddress = data[14].replace("\"", ""); // 도로명주소
                        String jibunAddress = data[15].replace("\"", ""); // 지번주소
                        String phoneNumber = data[16].replace("\"", ""); // 전화번호
                        String homepage = data[17].replace("\"", ""); // 홈페이지
                        String holiday = data[18].replace("\"", ""); // 휴무일
                        String operatingHours = data[19].replace("\"", ""); // 운영시간
                        String petFriendlyInfo = data[22].replace("\"", ""); // 반려동물 동반 가능정보
                        String description = data[28].replace("\"", ""); // 기본 정보_장소설명

                        facilities.add(new PetFacility(name, category1, category2, category3, latitude, longitude,
                                roadAddress, jibunAddress, phoneNumber, homepage, holiday, operatingHours, petFriendlyInfo, description));
                    } catch (NumberFormatException e) {
                        System.err.println("Skipping line due to number format error: " + line + " - " + e.getMessage());
                    } catch (ArrayIndexOutOfBoundsException e) {
                        System.err.println("Skipping line due to missing data (index error): " + line + " - " + e.getMessage());
                    }
                }
                petFacilityRepository.saveAll(facilities); // DB에 한 번에 저장
                System.out.println("CSV 데이터 로딩 완료. 총 " + facilities.size() + "개 시설 저장됨.");
            } catch (Exception e) {
                System.err.println("CSV 데이터 로딩 중 오류 발생: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("데이터베이스에 이미 반려동물 시설 데이터가 존재합니다. CSV 로딩을 건너뜜.");
        }
    }
}