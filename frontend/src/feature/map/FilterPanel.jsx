// src/feature/map/FilterPanel.js
import React from "react";
import CheckboxGroup from "./CheckboxGroup.jsx"; // 분리된 CheckboxGroup 임포트

const FilterPanel = ({
  selectedRegion,
  setSelectedRegion,
  regions,
  selectedSigungu,
  setSelectedSigungu,
  sigungus,
  selectedCategories1,
  setSelectedCategories1,
  categories1,
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
  selectedHoliday,
  setSelectedHoliday,
  holidays, // 새 필터 props
  selectedOperatingHours,
  setSelectedOperatingHours,
  operatingHoursOptions, // 새 필터 props
  petFriendlyFilter,
  setPetFriendlyFilter, // 새 필터 props
  petOnlyFilter,
  setPetOnlyFilter, // 새 필터 props
  selectedPetRestrictions,
  setSelectedPetRestrictions,
  petRestrictionsOptions, // 새 필터 props
  categoryColors, // 카테고리 색상 props로 전달
  setCurrentPage, // 페이지 리셋 함수
}) => {
  return (
    <div
      className="col-2 bg-white border rounded p-2 d-flex flex-column"
      style={{ height: "100vh", fontSize: "12px" }}
    >
      <h6 className="text-dark mb-2 flex-shrink-0">🐾 필터</h6>

      <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
        <div className="mb-2">
          <label className="form-label small fw-bold mb-1">📍 지역</label>
          <select
            className="form-select form-select-sm"
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setCurrentPage(0);
            }}
            style={{ fontSize: "11px" }}
          >
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-2">
          <label className="form-label small fw-bold mb-1">🏘️ 시군구</label>
          <select
            className="form-select form-select-sm"
            value={selectedSigungu}
            onChange={(e) => {
              setSelectedSigungu(e.target.value);
              setCurrentPage(0);
            }}
            style={{ fontSize: "11px" }}
          >
            {sigungus.map((sigungu) => (
              <option key={sigungu} value={sigungu}>
                {sigungu}
              </option>
            ))}
          </select>
        </div>

        <CheckboxGroup
          title="🏢 대분류"
          options={categories1}
          selectedSet={selectedCategories1}
          setFunction={setSelectedCategories1}
          categoryColors={categoryColors}
        />

        <CheckboxGroup
          title="🏪 소분류"
          options={categories2}
          selectedSet={selectedCategories2}
          setFunction={setSelectedCategories2}
          categoryColors={categoryColors}
        />

        <CheckboxGroup
          title="🐕 반려동물 크기"
          options={petSizes}
          selectedSet={selectedPetSizes}
          setFunction={setSelectedPetSizes}
        />

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
                  onChange={(e) => {
                    setParkingFilter(e.target.value);
                    setCurrentPage(0);
                  }}
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

        <div className="mb-2">
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
                  onChange={(e) => {
                    setFacilityType(e.target.value);
                    setCurrentPage(0);
                  }}
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

        {/* --- 새로운 필터 UI 추가 --- */}
        <div className="mb-2">
          <label className="form-label small fw-bold mb-1">🗓️ 휴무일</label>
          <select
            className="form-select form-select-sm"
            value={selectedHoliday}
            onChange={(e) => {
              setSelectedHoliday(e.target.value);
              setCurrentPage(0);
            }}
            style={{ fontSize: "11px" }}
          >
            {holidays.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-2">
          <label className="form-label small fw-bold mb-1">⏰ 운영시간</label>
          <select
            className="form-select form-select-sm"
            value={selectedOperatingHours}
            onChange={(e) => {
              setSelectedOperatingHours(e.target.value);
              setCurrentPage(0);
            }}
            style={{ fontSize: "11px" }}
          >
            {operatingHoursOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-2">
          <label className="form-label small fw-bold mb-1">🐶 동반 가능</label>
          <div className="btn-group w-100" role="group">
            {[
              { value: "전체", label: "전체" },
              { value: "Y", label: "가능" },
              { value: "N", label: "불가능" },
            ].map(({ value, label }) => (
              <React.Fragment key={value}>
                <input
                  type="radio"
                  className="btn-check"
                  name="petFriendly"
                  id={`petFriendly-${value}`}
                  value={value}
                  checked={petFriendlyFilter === value}
                  onChange={(e) => {
                    setPetFriendlyFilter(e.target.value);
                    setCurrentPage(0);
                  }}
                  autoComplete="off"
                />
                <label
                  className="btn btn-outline-secondary btn-sm"
                  htmlFor={`petFriendly-${value}`}
                  style={{ fontSize: "10px", padding: "2px 4px" }}
                >
                  {label}
                </label>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="mb-2">
          <label className="form-label small fw-bold mb-1">🐕 전용 여부</label>
          <div className="btn-group w-100" role="group">
            {[
              { value: "전체", label: "전체" },
              { value: "Y", label: "전용" },
              { value: "N", label: "비전용" },
            ].map(({ value, label }) => (
              <React.Fragment key={value}>
                <input
                  type="radio"
                  className="btn-check"
                  name="petOnly"
                  id={`petOnly-${value}`}
                  value={value}
                  checked={petOnlyFilter === value}
                  onChange={(e) => {
                    setPetOnlyFilter(e.target.value);
                    setCurrentPage(0);
                  }}
                  autoComplete="off"
                />
                <label
                  className="btn btn-outline-secondary btn-sm"
                  htmlFor={`petOnly-${value}`}
                  style={{ fontSize: "10px", padding: "2px 4px" }}
                >
                  {label}
                </label>
              </React.Fragment>
            ))}
          </div>
        </div>

        <CheckboxGroup
          title="🚫 제한사항"
          options={petRestrictionsOptions}
          selectedSet={selectedPetRestrictions}
          setFunction={setSelectedPetRestrictions}
        />
        {/* --- 여기까지 새 필터 UI --- */}
      </div>
    </div>
  );
};

export default FilterPanel;
