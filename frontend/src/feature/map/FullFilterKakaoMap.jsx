// src/map/FullFilterKakaoMap.js
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import FilterPanel from "./FilterPanel.jsx";
import SearchResultList from "./SearchResultList";
import KakaoMapComponent from "./KakaoMapComponent";
import { useFilters } from "./data/UseFilters";
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

  // 검색 쿼리 파라미터 생성 (검색어 포함)
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

  // 시설 데이터 로드
  const loadFacilities = useCallback(async () => {
    if (!isMapReady || !hasSearched) return;
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
  }, [isMapReady, hasSearched, buildFilterQuery]);

  useEffect(() => {
    if (hasSearched && !isShowingFavorites) {
      loadFacilities();
    }
  }, [hasSearched, isShowingFavorites, currentPage, loadFacilities]);

  // 검색어 변경 핸들러
  const handleSearchQueryChange = (query) => {
    setSearchQuery(query);
  };

  // 검색 버튼 핸들러 (검색어 파라미터 추가)
  const handleSearch = (query = "") => {
    if (query !== undefined && query !== searchQuery) {
      setSearchQuery(query);
    }
    setHasSearched(true);
    setIsShowingFavorites(false);
    setCurrentPage(0);
  };

  // 검색어 변경 시 자동으로 검색 실행 (디바운스 적용)
  useEffect(() => {
    if (!hasSearched || isShowingFavorites) return;

    const timeoutId = setTimeout(() => {
      loadFacilities();
    }, 300); // 300ms 디바운스

    return () => clearTimeout(timeoutId);
  }, [searchQuery, loadFacilities, hasSearched, isShowingFavorites]);

  // 찜 목록 로드 핸들러
  const handleLoadFavorites = async () => {
    setIsDataLoading(true);
    try {
      const data = await fetchMyFavorites();
      setFavoriteMarkers(data || []);
      setHasSearched(false);
      setIsShowingFavorites(true);
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
  const totalPages = Math.ceil(totalDataCount / ITEMS_PER_PAGE);

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
