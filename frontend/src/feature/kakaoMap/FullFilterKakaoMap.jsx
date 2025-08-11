// src/map/FullFilterKakaoMap.js
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import FilterPanel from "./FilterPanel.jsx";
import SearchResultList from "./SearchResultList.jsx";
import KakaoMapComponent from "./KakaoMapComponent.jsx";
import { useFilters } from "./data/UseFilters.jsx";
import { fetchMyFavorites, searchFacilities } from "./data/api.jsx";
import {
  CATEGORY_COLORS,
  ITEMS_PER_PAGE,
  PET_SIZE_OPTIONS,
  RESPONSIVE_STYLES,
} from "./data/config.jsx";

const FullFilterKakaoMap = () => {
  const [error, setError] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isShowingFavorites, setIsShowingFavorites] = useState(false);

  // 검색어 상태 추가
  const [searchQuery, setSearchQuery] = useState("");

  // 🆕 지도 범위 검색 관련 상태만 추가
  const [isMapBoundsSearch, setIsMapBoundsSearch] = useState(false);

  const [facilities, setFacilities] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [favoriteMarkers, setFavoriteMarkers] = useState([]);

  const { filterStates, filterSetters, filterOptions } = useFilters();
  const {
    selectedRegion,
    selectedSigungu,
    selectedCategories2,
    selectedPetSizes,
    parkingFilter,
    facilityType,
  } = filterStates;

  // 검색 쿼리 파라미터 생성 (검색어 포함) - 기존 코드 그대로
  const buildFilterQuery = useCallback(() => {
    const params = new URLSearchParams();

    // 검색어 추가
    if (searchQuery && searchQuery.trim()) {
      params.append("searchQuery", searchQuery.trim());
    }

    if (selectedRegion !== "전체") params.append("sidoName", selectedRegion);
    if (selectedSigungu !== "전체")
      params.append("sigunguName", selectedSigungu);
    if (parkingFilter !== "전체")
      params.append("parkingAvailable", parkingFilter);
    if (facilityType === "실내") params.append("indoorFacility", "Y");
    if (facilityType === "실외") params.append("outdoorFacility", "Y");

    selectedCategories2.forEach(
      (cat) => cat !== "전체" && params.append("category2", cat),
    );
    selectedPetSizes.forEach(
      (size) => size !== "전체" && params.append("allowedPetSize", size),
    );

    params.append("page", currentPage.toString());
    params.append("size", ITEMS_PER_PAGE.toString());
    return params;
  }, [
    searchQuery, // 검색어 의존성 추가
    selectedRegion,
    selectedSigungu,
    selectedCategories2,
    selectedPetSizes,
    parkingFilter,
    facilityType,
    currentPage,
  ]);

  // 🆕 지도 범위 검색 핸들러만 추가
  const handleBoundsSearch = useCallback((boundsResults) => {
    console.log("지도 범위 검색 결과:", boundsResults);

    // 검색 결과를 시설 목록에 설정
    setFacilities(boundsResults);
    setTotalElements(boundsResults.length);

    // 지도 범위 검색 모드로 설정
    setIsMapBoundsSearch(true);
    setHasSearched(true);
    setIsShowingFavorites(false);
    setCurrentPage(0);
  }, []);

  // 🆕 전체 검색으로 전환 핸들러만 추가
  const handleSwitchToFullSearch = () => {
    setIsMapBoundsSearch(false);
    setHasSearched(true);
    setCurrentPage(0);
  };

  // 시설 데이터 로드 - 기존 코드에 isMapBoundsSearch 조건만 추가
  const loadFacilities = useCallback(async () => {
    if (!isMapReady || !hasSearched || isMapBoundsSearch) return; // 🆕 isMapBoundsSearch 조건 추가
    setIsDataLoading(true);
    try {
      const params = buildFilterQuery();
      const pageResult = await searchFacilities(params);
      setFacilities(pageResult.content || []);
      setTotalElements(pageResult.totalElements || 0);
    } catch (err) {
      setError("데이터를 가져오는데 실패했습니다: " + err.message);
      setFacilities([]);
      setTotalElements(0);
    } finally {
      setIsDataLoading(false);
    }
  }, [isMapReady, hasSearched, isMapBoundsSearch, buildFilterQuery]); // 🆕 isMapBoundsSearch 의존성 추가

  useEffect(() => {
    if (hasSearched && !isShowingFavorites) {
      loadFacilities();
    }
  }, [hasSearched, isShowingFavorites, currentPage, loadFacilities]);

  // 검색어 변경 핸들러 - 기존 코드 그대로
  const handleSearchQueryChange = (query) => {
    setSearchQuery(query);
  };

  // 검색 버튼 핸들러에 isMapBoundsSearch 리셋만 추가
  const handleSearch = (query = "") => {
    if (query !== undefined && query !== searchQuery) {
      setSearchQuery(query);
    }
    setHasSearched(true);
    setIsShowingFavorites(false);
    setIsMapBoundsSearch(false); // 🆕 일반 검색 시 지도 범위 검색 모드 해제
    setCurrentPage(0);
  };

  // 검색어 변경 시 자동으로 검색 실행 (디바운스 적용) - 기존 코드에 조건만 추가
  useEffect(() => {
    if (!hasSearched || isShowingFavorites || isMapBoundsSearch) return; // 🆕 isMapBoundsSearch 조건 추가

    const timeoutId = setTimeout(() => {
      loadFacilities();
    }, 300); // 300ms 디바운스

    return () => clearTimeout(timeoutId);
  }, [
    searchQuery,
    loadFacilities,
    hasSearched,
    isShowingFavorites,
    isMapBoundsSearch,
  ]); // 🆕 isMapBoundsSearch 의존성 추가

  // 찜 목록 로드 핸들러에 isMapBoundsSearch 리셋만 추가
  const handleLoadFavorites = async () => {
    setIsDataLoading(true);
    try {
      const data = await fetchMyFavorites();
      setFavoriteMarkers(data || []);
      setHasSearched(false);
      setIsShowingFavorites(true);
      setIsMapBoundsSearch(false); // 🆕 찜 목록 시 지도 범위 검색 모드 해제
      setFacilities([]);
      setTotalElements(data?.length || 0);
      setSearchQuery(""); // 찜 목록 로드 시 검색어 초기화
    } catch (error) {
      toast.error("찜 목록을 불러오지 못했습니다.", error.message);
      setFavoriteMarkers([]);
    } finally {
      setIsDataLoading(false);
    }
  };

  const totalDataCount = isShowingFavorites
    ? favoriteMarkers.length
    : totalElements;

  // 🆕 지도 범위 검색일 때는 페이지네이션 비활성화
  const totalPages = isMapBoundsSearch
    ? 1
    : Math.ceil(totalDataCount / ITEMS_PER_PAGE);

  if (error) {
    return (
      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
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
    <>
      <style>{RESPONSIVE_STYLES}</style>
      <div className="container-fluid vh-100 d-flex flex-column p-3 bg-light-subtle">
        {/* --- 1. 지도 Row --- */}
        <div className="row map-row-container">
          <div className="col-12 h-100 p-0">
            <KakaoMapComponent
              isMapReady={isMapReady}
              setIsMapReady={setIsMapReady}
              isDataLoading={isDataLoading}
              facilities={facilities}
              favoriteMarkers={favoriteMarkers}
              isShowingFavorites={isShowingFavorites}
              categoryColors={CATEGORY_COLORS}
              setError={setError}
              onBoundsSearch={handleBoundsSearch} // 🆕 지도 범위 검색 핸들러 전달
              searchQuery={searchQuery} // 🆕 검색어 전달
            />
          </div>
        </div>

        <div style={{ height: "1rem" }}></div>

        {/* --- 2. 컨텐츠 Row (필터 + 리스트) --- */}
        <div
          className="row flex-grow-1 overflow-y-auto"
          style={{ minHeight: "0" }}
        >
          {/* 필터 Column */}
          <div className="col-12 col-md-4 align-self-md-start mb-3 mb-md-0">
            <FilterPanel
              {...filterStates}
              {...filterSetters}
              {...filterOptions}
              petSizes={PET_SIZE_OPTIONS}
              categoryColors={CATEGORY_COLORS}
              onSearch={handleSearch}
              onLoadFavorites={handleLoadFavorites}
              searchQuery={searchQuery} // 검색어 상태 전달
              onSearchQueryChange={handleSearchQueryChange} // 검색어 변경 핸들러 전달
            />
          </div>

          {/* 리스트 Column */}
          <div className="col-12 col-md-8 list-column-container">
            {/* 🆕 지도 범위 검색 모드 표시만 추가 */}
            {isMapBoundsSearch && (
              <div
                className="alert alert-info mb-2 p-2 d-flex justify-content-between align-items-center"
                style={{ fontSize: "11px" }}
              >
                <span>📍 현재 지도 화면 기준 검색 결과입니다.</span>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleSwitchToFullSearch}
                  style={{ fontSize: "10px", padding: "2px 8px" }}
                >
                  전체 검색으로 전환
                </button>
              </div>
            )}

            <SearchResultList
              facilities={facilities}
              favoriteMarkers={favoriteMarkers}
              totalElements={totalDataCount}
              isDataLoading={isDataLoading}
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={setCurrentPage}
              categoryColors={CATEGORY_COLORS}
              ITEMS_PER_PAGE={ITEMS_PER_PAGE}
              hasSearched={hasSearched || isShowingFavorites}
              isShowingFavorites={isShowingFavorites}
              searchQuery={searchQuery} // 검색어 전달
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default FullFilterKakaoMap;
