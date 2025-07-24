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

  // 필터 상태들 (기존)
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [selectedSigungu, setSelectedSigungu] = useState("전체");
  const [selectedCategories1, setSelectedCategories1] = useState(
    new Set(["전체"]),
  );
  const [selectedCategories2, setSelectedCategories2] = useState(
    new Set(["전체"]),
  );
  const [selectedPetSizes, setSelectedPetSizes] = useState(new Set(["전체"]));
  const [parkingFilter, setParkingFilter] = useState("전체");
  const [facilityType, setFacilityType] = useState("전체");

  // 필터 상태들 (새로 추가)
  const [selectedHoliday, setSelectedHoliday] = useState("전체");
  const [selectedOperatingHours, setSelectedOperatingHours] = useState("전체");
  const [petFriendlyFilter, setPetFriendlyFilter] = useState("전체"); // "Y", "N", "전체"
  const [petOnlyFilter, setPetOnlyFilter] = useState("전체"); // "Y", "N", "전체"
  const [selectedPetRestrictions, setSelectedPetRestrictions] = useState(
    new Set(["전체"]),
  );

  // 필터 옵션들 (기존)
  const [regions, setRegions] = useState([]);
  const [sigungus, setSigungus] = useState([]);
  const [categories1, setCategories1] = useState([]);
  const [categories2, setCategories2] = useState([]);
  const [petSizes, setPetSizes] = useState([]);

  // 필터 옵션들 (새로 추가)
  const [holidays, setHolidays] = useState([]);
  const [operatingHoursOptions, setOperatingHoursOptions] = useState([]);
  const [petRestrictionsOptions, setPetRestrictionsOptions] = useState([]);

  // 카테고리별 색상 매핑
  const categoryColors = {
    숙박: "#FF6B6B",
    음식점: "#4ECDC4",
    문화시설: "#45B7D1",
    반려동물용품: "#96CEB4",
    의료시설: "#FFEAA7",
    체험활동: "#A8E6CF",
    기타: "#DDA0DD",
  };

  // 필터 옵션들 로드 (새로운 API 엔드포인트 포함)
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const responses = await Promise.all([
          fetch("http://localhost:8080/api/pet_facilities/regions"),
          fetch(
            "http://localhost:8080/api/pet_facilities/categories/category1",
          ),
          fetch(
            "http://localhost:8080/api/pet_facilities/categories/category2",
          ),
          fetch("http://localhost:8080/api/pet_facilities/petsizes"),
          fetch("http://localhost:8080/api/pet_facilities/sigungu"),
          fetch("http://localhost:8080/api/pet_facilities/holidays"), // 휴무일
          fetch("http://localhost:8080/api/pet_facilities/operatingHours"), // 운영시간
          fetch("http://localhost:8080/api/pet_facilities/petrestrictions"), // 제한사항
        ]);

        const [
          regionsRes,
          category1Res,
          category2Res,
          petSizesRes,
          sigunguRes,
          holidaysRes,
          operatingHoursRes,
          petRestrictionsRes,
        ] = await Promise.all(responses.map((r) => r.json()));

        setRegions(["전체", ...regionsRes]);
        setCategories1(["전체", ...category1Res]);
        setCategories2(["전체", ...category2Res]);
        setPetSizes(["전체", ...petSizesRes]);
        setSigungus(["전체", ...sigunguRes]);
        setHolidays(["전체", ...holidaysRes]);
        setOperatingHoursOptions(["전체", ...operatingHoursRes]);
        setPetRestrictionsOptions(["전체", ...petRestrictionsRes]);
      } catch (err) {
        console.error("필터 옵션 로드 오류:", err);
        // Fallback options
        setRegions(["전체", "서울특별시", "부산광역시", "인천광역시"]);
        setCategories1([
          "전체",
          "숙박",
          "음식점",
          "문화시설",
          "반려동물용품",
          "의료시설",
        ]);
        setCategories2(["전체", "펜션", "카페", "박물관"]);
        setPetSizes(["전체", "소형", "중형", "대형"]);
        setSigungus(["전체"]);
        setHolidays(["전체", "연중무휴", "매주 월요일"]); // 예시
        setOperatingHoursOptions(["전체", "24시간", "10:00~20:00"]); // 예시
        setPetRestrictionsOptions(["전체", "목줄 필수", "맹견 제한"]); // 예시
      }
    };
    loadFilterOptions();
  }, []);

  // 쿼리 파라미터 빌드 (새로운 필터 포함)
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

    if (!selectedCategories1.has("전체")) {
      Array.from(selectedCategories1).forEach((cat) =>
        params.append("category1", cat),
      );
    }

    if (!selectedCategories2.has("전체")) {
      Array.from(selectedCategories2).forEach((cat) =>
        params.append("category2", cat),
      );
    }

    if (!selectedPetSizes.has("전체")) {
      Array.from(selectedPetSizes).forEach((size) =>
        params.append("allowedPetSize", size),
      );
    }

    // --- 새로운 필터 파라미터 추가 ---
    if (selectedHoliday !== "전체") params.append("holiday", selectedHoliday);
    if (selectedOperatingHours !== "전체")
      params.append("operatingHours", selectedOperatingHours);
    if (petFriendlyFilter !== "전체")
      params.append("petFriendlyInfo", petFriendlyFilter); // "Y" or "N"
    if (petOnlyFilter !== "전체") params.append("petOnlyInfo", petOnlyFilter); // "Y" or "N"
    if (!selectedPetRestrictions.has("전체")) {
      Array.from(selectedPetRestrictions).forEach((restriction) =>
        params.append("petRestrictions", restriction),
      );
    }

    params.append("page", currentPage.toString());
    params.append("size", ITEMS_PER_PAGE.toString());

    return params.toString();
  }, [
    selectedRegion,
    selectedSigungu,
    selectedCategories1,
    selectedCategories2,
    selectedPetSizes,
    parkingFilter,
    facilityType,
    currentPage,
    selectedHoliday,
    selectedOperatingHours,
    petFriendlyFilter,
    petOnlyFilter,
    selectedPetRestrictions,
  ]);

  // 데이터 로드
  const loadFacilities = useCallback(async () => {
    if (!isMapReady) return; // 맵이 준비되지 않았다면 로드하지 않음

    setIsDataLoading(true);

    try {
      const query = buildFilterQuery();
      const url = `http://localhost:8080/api/pet_facilities/search?${query}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const pageResult = await response.json();

      setFacilities(pageResult.content);
      setTotalElements(pageResult.totalElements);
    } catch (err) {
      console.error("데이터 로드 오류:", err);
      setError("데이터를 가져오는데 실패했습니다.");
    } finally {
      setIsDataLoading(false);
    }
  }, [isMapReady, buildFilterQuery]);

  // 필터 변경시 실시간으로 데이터 로드
  useEffect(() => {
    loadFacilities();
  }, [
    selectedRegion,
    selectedSigungu,
    selectedCategories1,
    selectedCategories2,
    selectedPetSizes,
    parkingFilter,
    facilityType,
    currentPage,
    selectedHoliday,
    selectedOperatingHours,
    petFriendlyFilter,
    petOnlyFilter,
    selectedPetRestrictions,
    loadFacilities, // buildFilterQuery가 loadFacilities의 의존성에 있으므로, loadFacilities만 여기에 추가해도 됨
  ]);

  // 리스트 아이템 클릭 (KakaoMapComponent로 전달)
  const handleListItemClick = useCallback((facility) => {
    // KakaoMapComponent 내부에서 지도 이동 및 마커 클릭 로직 처리
    // 이 함수는 단순히 KakaoMapComponent에 전달되어 마커 클릭 시 사용됩니다.
    // 지도 중심 이동 로직은 KakaoMapComponent 내부의 useEffect에서 처리됩니다.
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
    setCurrentPage(0);
  };

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
    <div className="container-fluid vh-100 p-1">
      <div className="row h-100 g-1">
        <FilterPanel
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          regions={regions}
          selectedSigungu={selectedSigungu}
          setSelectedSigungu={setSelectedSigungu}
          sigungus={sigungus}
          selectedCategories1={selectedCategories1}
          setSelectedCategories1={handleSetFilter(
            selectedCategories1,
            setSelectedCategories1,
          )}
          categories1={categories1}
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
          petSizes={petSizes}
          parkingFilter={parkingFilter}
          setParkingFilter={setParkingFilter}
          facilityType={facilityType}
          setFacilityType={setFacilityType}
          selectedHoliday={selectedHoliday} // 새 필터 props
          setSelectedHoliday={setSelectedHoliday} // 새 필터 props
          holidays={holidays} // 새 필터 props
          selectedOperatingHours={selectedOperatingHours} // 새 필터 props
          setSelectedOperatingHours={setSelectedOperatingHours} // 새 필터 props
          operatingHoursOptions={operatingHoursOptions} // 새 필터 props
          petFriendlyFilter={petFriendlyFilter} // 새 필터 props
          setPetFriendlyFilter={setPetFriendlyFilter} // 새 필터 props
          petOnlyFilter={petOnlyFilter} // 새 필터 props
          setPetOnlyFilter={setPetOnlyFilter} // 새 필터 props
          selectedPetRestrictions={selectedPetRestrictions} // 새 필터 props
          setSelectedPetRestrictions={handleSetFilter(
            selectedPetRestrictions,
            setSelectedPetRestrictions,
          )} // 새 필터 props
          petRestrictionsOptions={petRestrictionsOptions} // 새 필터 props
          categoryColors={categoryColors}
          setCurrentPage={setCurrentPage}
        />

        <SearchResultList
          facilities={facilities}
          totalElements={totalElements}
          isDataLoading={isDataLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={setCurrentPage} // setCurrentPage 직접 전달
          handleListItemClick={handleListItemClick} // KakaoMapComponent로 전달됨
          categoryColors={categoryColors}
          ITEMS_PER_PAGE={ITEMS_PER_PAGE}
        />

        <KakaoMapComponent
          isMapReady={isMapReady}
          setIsMapReady={setIsMapReady}
          isDataLoading={isDataLoading}
          setError={setError}
          facilities={facilities}
          categoryColors={categoryColors}
          handleListItemClick={handleListItemClick} // 검색 결과 리스트에서 클릭 시 맵에 전달
        />
      </div>
    </div>
  );
};

export default FullFilterKakaoMap;
