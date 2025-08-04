// src/map/FullFilterKakaoMap.js
import React, { useEffect, useState, useCallback } from "react";
import FilterPanel from "./FilterPanel.jsx";
import SearchResultList from "./SearchResultList";
import KakaoMapComponent from "./KakaoMapComponent";
import {
  fallbackSigunguData,
  fallbackCategories2,
  fallbackRegions,
} from "./data/fallbackSigunguData.jsx";
import axios from "axios";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 15;

const FullFilterKakaoMap = () => {
  const [error, setError] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const [facilities, setFacilities] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasSearched, setHasSearched] = useState(false); // 검색 여부 상태 추가
  const [isShowingFavorites, setIsShowingFavorites] = useState(false); // 찜 목록 표시 전용 상태

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

  // 찜(저장) 목록 가져오는
  const [favoriteMarkers, setFavoriteMarkers] = useState([]);

  // ⚠️ 반려동물 크기 옵션 (정리가 안되었어..)
  const petSizeOptions = ["전체", "개", "고양이", "기타동물"];

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

  // 필터 옵션들 로드 (지역과 카테고리2)
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
        // API 호출 실패 시, 분리된 폴백 데이터 사용
        setRegions(fallbackRegions);
        setCategories2(fallbackCategories2);
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

  // Fallback 시군구 데이터 함수 (분리된 파일에서 가져옴)
  const getFallbackSigungus = useCallback((region) => {
    return fallbackSigunguData[region] || [];
  }, []);

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
    setIsShowingFavorites(false); // 검색하기로 전환
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

  // 찜 목록 불러오기 함수
  async function loadFavoriteMarkers() {
    try {
      const response = await axios.get("/api/favorite/mine", {
        withCredentials: true,
      });
      const data = response.data;
      if (!data || data.length === 0) {
        setFavoriteMarkers([]);
        setIsShowingFavorites(true);
        return;
      }
      console.log(data);
      setFavoriteMarkers(data);
      setIsShowingFavorites(true); // 찜 목록 모드로 전환
    } catch (error) {
      console.error("찜 목록 불러오기 실패", error);
      toast.error("찜 목록을 불러오지 못했습니다.");
    }
  }

  // --- 렌더링 ---
  if (error) {
    return (
      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
        {/* ... 에러 화면 ... */}
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

  const responsiveStyles = `
  .map-row-container {
    flex: 0 0 30vh; /* 모바일 지도 높이 */
  }
  .list-column-container {
    /* 모바일에서는 높이를 자동으로 설정 */
  }

  @media (min-width: 768px) {
    .map-row-container {
      flex: 0 0 40vh; /* 데스크톱 지도 높이 */
    }
    .list-column-container {
      height: 100%; /* 데스크톱에서만 높이 100% 적용 */
    }
  }
`;

  return (
    <>
      <style>{responsiveStyles}</style>
      <div className="container-fluid vh-100 d-flex flex-column p-3 bg-light-subtle">
        {/* --- 1. 지도 Row --- */}
        <div className="row map-row-container">
          <div className="col-12 h-100 p-0">
            <div className="w-100 h-100 rounded shadow-sm overflow-hidden">
              <KakaoMapComponent
                isMapReady={isMapReady}
                setIsMapReady={setIsMapReady}
                isDataLoading={isDataLoading}
                setError={setError}
                facilities={hasSearched ? facilities : []}
                isShowingFavorites={isShowingFavorites}
                categoryColors={categoryColors}
                favoriteMarkers={favoriteMarkers}
              />
            </div>
          </div>
        </div>

        {/* --- 세로 간격 Spacer --- */}
        <div style={{ height: "1rem" }}></div>

        {/* --- 2. 컨텐츠 Row (필터 + 리스트) --- */}
        <div
          className="row flex-grow-1 overflow-y-auto"
          style={{ minHeight: "0" }}
        >
          {/* 필터 Column */}
          <div className="col-12 col-md-4 align-self-md-start mb-3 mb-md-0">
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
              onLoadFavorites={loadFavoriteMarkers}
            />
          </div>

          {/* 리스트 Column */}
          {/* 이 컬럼은 부모의 기본 stretch 동작에 따라 높이가 꽉 찹니다. */}
          <div className="col-12 col-md-8 list-column-container">
            <SearchResultList
              facilities={isShowingFavorites ? favoriteMarkers : facilities}
              totalElements={
                isShowingFavorites ? favoriteMarkers.length : totalElements
              }
              isDataLoading={isDataLoading}
              currentPage={currentPage}
              totalPages={Math.ceil(
                (isShowingFavorites ? favoriteMarkers.length : totalElements) /
                  ITEMS_PER_PAGE,
              )}
              handlePageChange={setCurrentPage}
              categoryColors={categoryColors}
              ITEMS_PER_PAGE={ITEMS_PER_PAGE}
              hasSearched={hasSearched || isShowingFavorites}
              isShowingFavorites={isShowingFavorites}
              favoriteMarkers={favoriteMarkers}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default FullFilterKakaoMap;
