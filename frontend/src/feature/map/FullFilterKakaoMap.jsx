// src/map/FullFilterKakaoMap.js
import React, { useEffect, useState, useCallback } from "react";
import FilterPanel from "./FilterPanel.jsx";
import SearchResultList from "./SearchResultList";
import KakaoMapComponent from "./KakaoMapComponent";

const ITEMS_PER_PAGE = 15;

const FullFilterKakaoMap = () => {
  const [error, setError] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const [facilities, setFacilities] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasSearched, setHasSearched] = useState(false); // 검색 여부 상태 추가

  // 기본 필터 상태들
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [selectedSigungu, setSelectedSigungu] = useState("전체");
  const [selectedCategories2, setSelectedCategories2] = useState(
    new Set(["전체"]),
  );
  const [selectedPetSizes, setSelectedPetSizes] = useState(new Set(["전체"]));
  const [parkingFilter, setParkingFilter] = useState("전체");
  const [facilityType, setFacilityType] = useState("전체");

  // 필터 옵션들
  const [regions, setRegions] = useState([]);
  const [sigungus, setSigungus] = useState([]);
  const [categories2, setCategories2] = useState([]);

  // 반려동물 크기 옵션 (정리된 버전)
  const petSizeOptions = [
    "전체",
    "개",
    "고양이",
    "기타동물",
    "소형",
    "중형",
    "대형",
  ];

  // 카테고리별 색상 매핑 (소분류 기준)
  const categoryColors = {
    반려문화시설: "#088804",
    반려동반여행: "#003fff",
    반려동물식당카페: "#FF6B6B",
    반려의료: "#96CEB4",
    "반려동물 서비스": "#45B7D1",
    여행: "#4ECDC4",
    펜션: "#FF6B6B",
    호텔: "#FF8E8E",
    모텔: "#FFB6B6",
    게스트하우스: "#FFCCCC",
    카페: "#4ECDC4",
    레스토랑: "#7FDDDD",
    베이커리: "#A0E8E8",
    박물관: "#45B7D1",
    미술관: "#6BC5E5",
    도서관: "#8DD3F0",
    문화센터: "#B0E1FA",
    반려동물용품점: "#96CEB4",
    펫샵: "#A8D5C4",
    동물병원: "#FFEAA7",
    동물약국: "#FFF2CC",
    체험활동: "#A8E6CF",
    펜션체험: "#B8F0DF",
    기타: "#DDA0DD",
  };

  // 필터 옵션들 로드 (개선된 버전)
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const responses = await Promise.all([
          fetch("http://localhost:8080/api/pet_facilities/regions"),
          fetch(
            "http://localhost:8080/api/pet_facilities/categories/category2",
          ),
        ]);

        const [regionsRes, category2Res] = await Promise.all(
          responses.map(async (r) => {
            if (r.ok) {
              return await r.json();
            } else {
              console.error(`API 오류: ${r.url} - ${r.status}`);
              return [];
            }
          }),
        );

        setRegions(["전체", ...regionsRes]);
        setCategories2(["전체", ...category2Res]);

        // 초기 시군구는 전체만
        setSigungus(["전체"]);
      } catch (err) {
        console.error("필터 옵션 로드 오류:", err);
        // 확장된 Fallback options - 모든 광역시도 포함
        setRegions([
          "전체",
          "서울특별시",
          "부산광역시",
          "대구광역시",
          "인천광역시",
          "광주광역시",
          "대전광역시",
          "울산광역시",
          "세종특별자치시",
          "경기도",
          "강원특별자치도",
          "충청북도",
          "충청남도",
          "전북특별자치도",
          "전라남도",
          "경상북도",
          "경상남도",
          "제주특별자치도",
        ]);
        setCategories2([
          "전체",
          "펜션",
          "호텔",
          "모텔",
          "게스트하우스",
          "카페",
          "레스토랑",
          "베이커리",
          "박물관",
          "미술관",
          "도서관",
          "문화센터",
          "반려동물용품점",
          "펫샵",
          "동물병원",
          "동물약국",
          "체험활동",
          "펜션체험",
          "기타",
        ]);
        setSigungus(["전체"]);
      }
    };
    loadFilterOptions();
  }, []);

  // 지역 변경시 시군구 필터링 (개선된 버전)
  useEffect(() => {
    const loadSigungus = async () => {
      if (selectedRegion === "전체") {
        setSigungus(["전체"]);
        setSelectedSigungu("전체");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/api/pet_facilities/sigungu?region=${encodeURIComponent(selectedRegion)}`,
        );
        if (response.ok) {
          const sigungusRes = await response.json();
          setSigungus(["전체", ...sigungusRes]);
        } else {
          console.error("시군구 로드 실패:", response.status);
          // 각 지역별 fallback 시군구 데이터
          const fallbackSigungus = getFallbackSigungus(selectedRegion);
          setSigungus(["전체", ...fallbackSigungus]);
        }
        setSelectedSigungu("전체");
      } catch (err) {
        console.error("시군구 로드 오류:", err);
        const fallbackSigungus = getFallbackSigungus(selectedRegion);
        setSigungus(["전체", ...fallbackSigungus]);
        setSelectedSigungu("전체");
      }
    };
    loadSigungus();
  }, [selectedRegion]);

  // Fallback 시군구 데이터 함수
  const getFallbackSigungus = (region) => {
    const fallbackData = {
      서울특별시: [
        "강남구",
        "강동구",
        "강북구",
        "강서구",
        "관악구",
        "광진구",
        "구로구",
        "금천구",
        "노원구",
        "도봉구",
        "동대문구",
        "동작구",
        "마포구",
        "서대문구",
        "서초구",
        "성동구",
        "성북구",
        "송파구",
        "양천구",
        "영등포구",
        "용산구",
        "은평구",
        "종로구",
        "중구",
        "중랑구",
      ],
      경기도: [
        "수원시",
        "성남시",
        "안양시",
        "안산시",
        "용인시",
        "부천시",
        "광명시",
        "평택시",
        "과천시",
        "오산시",
        "시흥시",
        "군포시",
        "의왕시",
        "하남시",
        "이천시",
        "안성시",
        "김포시",
        "화성시",
        "광주시",
        "양주시",
        "포천시",
        "여주시",
        "연천군",
        "가평군",
        "양평군",
        "고양시",
        "파주시",
        "남양주시",
        "구리시",
        "의정부시",
        "동두천시",
      ],
      부산광역시: [
        "중구",
        "서구",
        "동구",
        "영도구",
        "부산진구",
        "동래구",
        "남구",
        "북구",
        "해운대구",
        "사하구",
        "금정구",
        "강서구",
        "연제구",
        "수영구",
        "사상구",
        "기장군",
      ],
      대구광역시: [
        "중구",
        "동구",
        "서구",
        "남구",
        "북구",
        "수성구",
        "달서구",
        "달성군",
      ],
      인천광역시: [
        "중구",
        "동구",
        "미추홀구",
        "연수구",
        "남동구",
        "부평구",
        "계양구",
        "서구",
        "강화군",
        "옹진군",
      ],
      광주광역시: ["동구", "서구", "남구", "북구", "광산구"],
      대전광역시: ["동구", "중구", "서구", "유성구", "대덕구"],
      울산광역시: ["중구", "남구", "동구", "북구", "울주군"],
      세종특별자치시: ["세종시"],
      강원특별자치도: [
        "춘천시",
        "원주시",
        "강릉시",
        "동해시",
        "태백시",
        "속초시",
        "삼척시",
        "홍천군",
        "횡성군",
        "영월군",
        "평창군",
        "정선군",
        "철원군",
        "화천군",
        "양구군",
        "인제군",
        "고성군",
        "양양군",
      ],
      충청북도: [
        "청주시",
        "충주시",
        "제천시",
        "보은군",
        "옥천군",
        "영동군",
        "증평군",
        "진천군",
        "괴산군",
        "음성군",
        "단양군",
      ],
      충청남도: [
        "천안시",
        "공주시",
        "보령시",
        "아산시",
        "서산시",
        "논산시",
        "계룡시",
        "당진시",
        "금산군",
        "부여군",
        "서천군",
        "청양군",
        "홍성군",
        "예산군",
        "태안군",
      ],
      전북특별자치도: [
        "전주시",
        "군산시",
        "익산시",
        "정읍시",
        "남원시",
        "김제시",
        "완주군",
        "진안군",
        "무주군",
        "장수군",
        "임실군",
        "순창군",
        "고창군",
        "부안군",
      ],
      전라남도: [
        "목포시",
        "여수시",
        "순천시",
        "나주시",
        "광양시",
        "담양군",
        "곡성군",
        "구례군",
        "고흥군",
        "보성군",
        "화순군",
        "장흥군",
        "강진군",
        "해남군",
        "영암군",
        "무안군",
        "함평군",
        "영광군",
        "장성군",
        "완도군",
        "진도군",
        "신안군",
      ],
      경상북도: [
        "포항시",
        "경주시",
        "김천시",
        "안동시",
        "구미시",
        "영주시",
        "영천시",
        "상주시",
        "문경시",
        "경산시",
        "군위군",
        "의성군",
        "청송군",
        "영양군",
        "영덕군",
        "청도군",
        "고령군",
        "성주군",
        "칠곡군",
        "예천군",
        "봉화군",
        "울진군",
        "울릉군",
      ],
      경상남도: [
        "창원시",
        "진주시",
        "통영시",
        "사천시",
        "김해시",
        "밀양시",
        "거제시",
        "양산시",
        "의령군",
        "함안군",
        "창녕군",
        "고성군",
        "남해군",
        "하동군",
        "산청군",
        "함양군",
        "거창군",
        "합천군",
      ],
      제주특별자치도: ["제주시", "서귀포시"],
    };
    return fallbackData[region] || [];
  };

  // 쿼리 파라미터 빌드 (수정된 버전 - Set 객체 처리 개선)
  const buildFilterQuery = useCallback(() => {
    const params = new URLSearchParams();

    if (selectedRegion !== "전체") params.append("sidoName", selectedRegion);
    if (selectedSigungu !== "전체")
      params.append("sigunguName", selectedSigungu);
    if (parkingFilter !== "전체")
      params.append("parkingAvailable", parkingFilter);

    if (facilityType === "실내") {
      params.append("indoorFacility", "Y");
    } else if (facilityType === "실외") {
      params.append("outdoorFacility", "Y");
    }

    // Set 객체를 올바르게 처리
    if (!selectedCategories2.has("전체")) {
      Array.from(selectedCategories2).forEach((cat) => {
        if (cat !== "전체") {
          params.append("category2", cat);
        }
      });
    }

    if (!selectedPetSizes.has("전체")) {
      Array.from(selectedPetSizes).forEach((size) => {
        if (size !== "전체") {
          params.append("allowedPetSize", size);
        }
      });
    }

    params.append("page", currentPage.toString());
    params.append("size", ITEMS_PER_PAGE.toString());

    return params.toString();
  }, [
    selectedRegion,
    selectedSigungu,
    selectedCategories2,
    selectedPetSizes,
    parkingFilter,
    facilityType,
    currentPage,
  ]);

  // 데이터 로드 - 검색이 실행된 경우에만
  const loadFacilities = useCallback(async () => {
    if (!isMapReady || !hasSearched) return;

    setIsDataLoading(true);

    try {
      const query = buildFilterQuery();
      const url = `http://localhost:8080/api/pet_facilities/search?${query}`;

      console.log("API 호출:", url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const pageResult = await response.json();

      console.log("검색 결과:", pageResult);

      setFacilities(pageResult.content || []);
      setTotalElements(pageResult.totalElements || 0);
    } catch (err) {
      console.error("데이터 로드 오류:", err);
      setError("데이터를 가져오는데 실패했습니다: " + err.message);
      setFacilities([]);
      setTotalElements(0);
    } finally {
      setIsDataLoading(false);
    }
  }, [isMapReady, hasSearched, buildFilterQuery]);

  // 검색 실행 함수
  const handleSearch = () => {
    setHasSearched(true);
    setCurrentPage(0);
    console.log("검색 실행 - 필터 상태:", {
      selectedRegion,
      selectedSigungu,
      selectedCategories2: Array.from(selectedCategories2),
      selectedPetSizes: Array.from(selectedPetSizes),
      parkingFilter,
      facilityType,
    });
  };

  // 검색이 실행된 후에만 데이터 로드
  useEffect(() => {
    if (hasSearched) {
      loadFacilities();
    }
  }, [
    hasSearched,
    selectedRegion,
    selectedSigungu,
    selectedCategories2,
    selectedPetSizes,
    parkingFilter,
    facilityType,
    currentPage,
    loadFacilities,
  ]);

  // 리스트 아이템 클릭 핸들러
  const handleListItemClick = useCallback((facility) => {
    // 전역 함수를 통해 지도 컴포넌트와 연동
    if (window.handleMapFacilityClick) {
      window.handleMapFacilityClick(facility);
    }
  }, []);

  const totalPages = Math.ceil(totalElements / ITEMS_PER_PAGE);

  const handleSetFilter = (currentSet, setFunction) => (value) => {
    const newSet = new Set(currentSet);

    if (value === "전체") {
      if (newSet.has("전체") && newSet.size === 1) {
        newSet.clear();
      } else {
        newSet.clear();
        newSet.add("전체");
      }
    } else {
      newSet.delete("전체");
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      if (newSet.size === 0) {
        newSet.add("전체");
      }
    }
    setFunction(newSet);
  };

  if (error) {
    return (
      <div
        className="container-fluid d-flex align-items-center justify-content-center"
        style={{ height: "80vh" }}
      >
        <div className="alert alert-danger text-center">
          <h5>오류 발생</h5>
          <p>{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-1" style={{ height: "80vh" }}>
      <div className="row h-100 g-1">
        <FilterPanel
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          regions={regions}
          selectedSigungu={selectedSigungu}
          setSelectedSigungu={setSelectedSigungu}
          sigungus={sigungus}
          selectedCategories2={selectedCategories2}
          setSelectedCategories2={handleSetFilter(
            selectedCategories2,
            setSelectedCategories2,
          )}
          categories2={categories2}
          selectedPetSizes={selectedPetSizes}
          setSelectedPetSizes={handleSetFilter(
            selectedPetSizes,
            setSelectedPetSizes,
          )}
          petSizes={petSizeOptions}
          parkingFilter={parkingFilter}
          setParkingFilter={setParkingFilter}
          facilityType={facilityType}
          setFacilityType={setFacilityType}
          categoryColors={categoryColors}
          onSearch={handleSearch}
        />

        <SearchResultList
          facilities={facilities}
          totalElements={totalElements}
          isDataLoading={isDataLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={setCurrentPage}
          handleListItemClick={handleListItemClick}
          categoryColors={categoryColors}
          ITEMS_PER_PAGE={ITEMS_PER_PAGE}
          hasSearched={hasSearched}
        />

        <KakaoMapComponent
          isMapReady={isMapReady}
          setIsMapReady={setIsMapReady}
          isDataLoading={isDataLoading}
          setError={setError}
          facilities={hasSearched ? facilities : []} // 검색 전에는 빈 배열
          categoryColors={categoryColors}
          handleListItemClick={handleListItemClick}
        />
      </div>
    </div>
  );
};

export default FullFilterKakaoMap;
