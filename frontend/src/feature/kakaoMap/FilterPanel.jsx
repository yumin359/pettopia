import React, { useContext } from "react";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";
import FilterGroup from "./FilterGroup.jsx"; // 새로운 통합 컴포넌트
import SearchInput from "./SearchInput.jsx";

const FilterPanel = ({
  selectedRegion,
  setSelectedRegion,
  regions,
  selectedSigungu,
  setSelectedSigungu,
  sigungus,
  selectedCategories2,
  setSelectedCategories2,
  categories2,
  selectedPetSizes,
  setSelectedPetSizes,
  petSizes,
  parkingFilter,
  setParkingFilter,
  facilityType,
  setFacilityType,
  categoryColors,
  onSearch,
  onLoadFavorites,
  searchQuery,
  onSearchQueryChange,
}) => {
  const { user } = useContext(AuthenticationContext);

  const handleSearch = (query = null) => {
    onSearch(query || searchQuery);
  };

  return (
    <div
      className="h-100 d-flex flex-column bg-white rounded shadow-sm p-3"
      style={{ fontSize: "12px" }}
    >
      {/* 검색창 */}
      <div className="mb-2">
        <label className="form-label small fw-bold mb-1">🔍 검색</label>
        <SearchInput
          searchQuery={searchQuery}
          onSearchQueryChange={onSearchQueryChange}
          onSearch={handleSearch}
          placeholder="시설명, 주소, 카테고리로 검색..."
        />
      </div>

      <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
        {/* 통합된 FilterGroup 사용 */}
        <FilterGroup
          title="📍 지역"
          type="select"
          options={regions}
          selectedValue={selectedRegion}
          onChange={setSelectedRegion}
        />

        <FilterGroup
          title="🏘️ 시군구"
          type="select"
          options={sigungus}
          selectedValue={selectedSigungu}
          onChange={setSelectedSigungu}
          disabled={selectedRegion === "전체"}
        />

        <FilterGroup
          title="🏪 카테고리"
          type="checkbox"
          options={categories2}
          selectedSet={selectedCategories2}
          onChange={setSelectedCategories2}
          categoryColors={categoryColors}
        />

        <FilterGroup
          title="🐕 반려동물 종류"
          type="checkbox"
          options={petSizes}
          selectedSet={selectedPetSizes}
          onChange={setSelectedPetSizes}
        />

        <FilterGroup
          title="🅿️ 주차"
          type="radio"
          options={[
            { value: "전체", label: "전체" },
            { value: "Y", label: "가능" },
            { value: "N", label: "불가" },
          ]}
          selectedValue={parkingFilter}
          onChange={setParkingFilter}
        />

        <FilterGroup
          title="🏢 유형"
          type="radio"
          options={[
            { value: "전체", label: "전체" },
            { value: "실내", label: "실내" },
            { value: "실외", label: "실외" },
          ]}
          selectedValue={facilityType}
          onChange={setFacilityType}
        />
      </div>

      {/* 찜 목록 버튼 */}
      <div className="mb-1">
        <button
          className="btn btn-danger w-100 btn-sm"
          onClick={onLoadFavorites}
          disabled={!user}
          style={{ fontSize: "12px" }}
        >
          즐겨찾기
        </button>
        {!user && (
          <div className="form-text text-center" style={{ fontSize: "9px" }}>
            로그인 후 이용 가능합니다.
          </div>
        )}
      </div>

      {/* 검색 버튼 */}
      <div className="flex-shrink-0 mt-1">
        <button
          className="btn btn-primary w-100 btn-sm"
          onClick={() => handleSearch()}
          style={{ fontSize: "12px" }}
        >
          검색하기
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
