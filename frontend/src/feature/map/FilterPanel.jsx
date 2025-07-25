// src/feature/map/FilterPanel.js
import React from "react";

// CheckboxGroup 컴포넌트를 직접 여기에 포함
const CheckboxGroup = ({
  title,
  options,
  selectedSet,
  setFunction,
  categoryColors,
}) => {
  const handleSetFilter = (value) => {
    const newSet = new Set(selectedSet);

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

  return (
    <div className="mb-2">
      <label className="form-label small fw-bold mb-1">{title}</label>
      <div className="d-flex flex-wrap gap-1">
        {options.map((option) => {
          const isChecked = selectedSet.has(option);
          const bgColor =
            option === "전체"
              ? "#6c757d"
              : categoryColors?.[option] || "#0d6efd";

          return (
            <label
              key={option}
              className={`btn ${isChecked ? "text-white" : "btn-outline-secondary"} btn-sm`}
              style={{
                backgroundColor: isChecked ? bgColor : "white",
                borderColor: bgColor,
                fontSize: "10px",
                padding: "2px 6px",
                color: isChecked ? "white" : bgColor,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                className="visually-hidden"
                checked={isChecked}
                onChange={() => handleSetFilter(option)}
                autoComplete="off"
              />
              {option}
            </label>
          );
        })}
      </div>
    </div>
  );
};

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
  onSearch, // 검색 실행 함수
}) => {
  return (
    <div
      className="col-2 bg-white border rounded p-2 d-flex flex-column"
      style={{ height: "100%", fontSize: "12px" }}
    >
      <h6 className="text-dark mb-2 flex-shrink-0">🐾 필터</h6>

      <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
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

      {/* 검색 버튼 */}
      <div className="flex-shrink-0 mt-2">
        <button
          className="btn btn-primary w-100 btn-sm"
          onClick={onSearch}
          style={{ fontSize: "12px" }}
        >
          🔍 검색하기
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
