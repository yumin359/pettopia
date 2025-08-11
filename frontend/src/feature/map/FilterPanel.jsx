import React, { useContext } from "react";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";
import CheckboxGroup from "../kakaoMap/CheckboxGroup.jsx";
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
  searchQuery, // 부모 컴포넌트에서 전달받은 검색어
  onSearchQueryChange, // 부모 컴포넌트의 검색어 변경 핸들러
}) => {
  const { user } = useContext(AuthenticationContext);

  // 검색 실행 핸들러
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
        {/* 지역 */}
        <div className="mb-2">
          <label className="form-label small fw-bold mb-1">📍 지역</label>
          <select
            className="form-select form-select-sm"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            style={{ fontSize: "11px" }}
          >
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* 시군구 */}
        <div className="mb-2">
          <label className="form-label small fw-bold mb-1">🏘️ 시군구</label>
          <select
            className="form-select form-select-sm"
            value={selectedSigungu}
            onChange={(e) => setSelectedSigungu(e.target.value)}
            style={{ fontSize: "11px" }}
            disabled={selectedRegion === "전체"}
          >
            {sigungus.map((sigungu) => (
              <option key={sigungu} value={sigungu}>
                {sigungu}
              </option>
            ))}
          </select>
        </div>

        <CheckboxGroup
          title="🏪 카테고리"
          options={categories2}
          selectedSet={selectedCategories2}
          setFunction={setSelectedCategories2}
          categoryColors={categoryColors}
        />

        <CheckboxGroup
          title="🐕 반려동물 종류"
          options={petSizes}
          selectedSet={selectedPetSizes}
          setFunction={setSelectedPetSizes}
        />

        {/* 주차 */}
        <div className="mb-2">
          <label className="form-label small fw-bold mb-1">🅿️ 주차</label>
          <div className="btn-group w-100" role="group">
            {[
              { value: "전체", label: "전체" },
              { value: "Y", label: "가능" },
              { value: "N", label: "불가" },
            ].map(({ value, label }) => (
              <React.Fragment key={value}>
                <input
                  type="radio"
                  className="btn-check"
                  name="parking"
                  id={`parking-${value}`}
                  value={value}
                  checked={parkingFilter === value}
                  onChange={(e) => setParkingFilter(e.target.value)}
                  autoComplete="off"
                />
                <label
                  className="btn btn-outline-secondary btn-sm"
                  htmlFor={`parking-${value}`}
                  style={{ fontSize: "10px", padding: "2px 4px" }}
                >
                  {label}
                </label>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 유형 */}
        <div className="mb-3">
          <label className="form-label small fw-bold mb-1">🏢 유형</label>
          <div className="btn-group w-100" role="group">
            {[
              { value: "전체", label: "전체" },
              { value: "실내", label: "실내" },
              { value: "실외", label: "실외" },
            ].map(({ value, label }) => (
              <React.Fragment key={value}>
                <input
                  type="radio"
                  className="btn-check"
                  name="facilityType"
                  id={`type-${value}`}
                  value={value}
                  checked={facilityType === value}
                  onChange={(e) => setFacilityType(e.target.value)}
                  autoComplete="off"
                />
                <label
                  className="btn btn-outline-secondary btn-sm"
                  htmlFor={`type-${value}`}
                  style={{ fontSize: "10px", padding: "2px 4px" }}
                >
                  {label}
                </label>
              </React.Fragment>
            ))}
          </div>
        </div>
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
