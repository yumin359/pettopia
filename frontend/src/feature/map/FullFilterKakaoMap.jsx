import React, { useEffect, useRef, useState } from "react";

const FullFilterKakaoMap = () => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [facilities, setFacilities] = useState([]);

  // 필터 상태들
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

  // 필터 옵션들
  const [regions, setRegions] = useState([]);
  const [sigungus, setSigungus] = useState([]);
  const [categories1, setCategories1] = useState([]);
  const [categories2, setCategories2] = useState([]);
  const [petSizes, setPetSizes] = useState([]);

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

  // 1. 카카오맵 초기화
  useEffect(() => {
    const initializeMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        setTimeout(initializeMap, 200);
        return;
      }

      if (!mapContainer.current || mapInstance.current) {
        if (mapInstance.current) setIsLoading(false);
        return;
      }

      try {
        const options = {
          center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
          level: 8,
        };

        mapInstance.current = new window.kakao.maps.Map(
          mapContainer.current,
          options,
        );
        setIsLoading(false);
      } catch (err) {
        console.error("카카오맵 초기화 오류:", err);
        setError("카카오맵 초기화에 실패했습니다.");
        setIsLoading(false);
      }
    };

    initializeMap();
  }, []);

  // 2. 필터 옵션들 로드
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [
          regionsRes,
          category1Res,
          category2Res,
          petSizesRes,
          sigunguRes,
        ] = await Promise.all([
          fetch("http://localhost:8080/api/pet_facilities/regions").then((r) =>
            r.json(),
          ),
          fetch(
            "http://localhost:8080/api/pet_facilities/categories/category1",
          ).then((r) => r.json()),
          fetch(
            "http://localhost:8080/api/pet_facilities/categories/category2",
          ).then((r) => r.json()),
          fetch("http://localhost:8080/api/pet_facilities/petsizes").then((r) =>
            r.json(),
          ),
          fetch("http://localhost:8080/api/pet_facilities/sigungu").then((r) =>
            r.json(),
          ),
        ]);

        setRegions(["전체", ...regionsRes]);
        setCategories1(["전체", ...category1Res]);
        setCategories2(["전체", ...category2Res]);
        setPetSizes(["전체", ...petSizesRes]);
        setSigungus(["전체", ...sigunguRes]);
      } catch (err) {
        console.error("필터 옵션 로드 오류:", err);
        // API가 없으면 기본값 사용
        setRegions(["전체", "서울특별시", "부산광역시", "인천광역시"]);
        setCategories1(["전체", "숙박", "음식점", "문화시설"]);
        setCategories2(["전체", "펜션", "카페", "박물관"]);
        setPetSizes(["전체", "소형", "중형", "대형"]);
        setSigungus(["전체"]);
      }
    };

    loadFilterOptions();
  }, []);

  // 3. 기존 마커 제거
  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  };

  // 4. 체크박스 핸들러 (공통 함수)
  const handleSetFilter = (currentSet, setFunction) => (value) => {
    const newSet = new Set(currentSet);

    if (value === "전체") {
      if (currentSet.has("전체")) {
        newSet.clear();
      } else {
        newSet.clear();
        newSet.add("전체");
      }
    } else {
      newSet.delete("전체");
      if (currentSet.has(value)) {
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

  // 5. 커스텀 마커 생성
  const createCustomMarker = (position, category) => {
    const color = categoryColors[category] || "#666666";

    const markerImage = new window.kakao.maps.MarkerImage(
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32">
          <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z" fill="${color}"/>
          <circle cx="12" cy="12" r="6" fill="white"/>
        </svg>
      `)}`,
      new window.kakao.maps.Size(24, 32),
      { offset: new window.kakao.maps.Point(12, 32) },
    );

    return new window.kakao.maps.Marker({
      map: mapInstance.current,
      position: position,
      image: markerImage,
    });
  };

  // 6. 복합 필터링 로직
  const buildFilterQuery = () => {
    const params = new URLSearchParams();

    if (selectedRegion !== "전체") params.set("region", selectedRegion);
    if (selectedSigungu !== "전체") params.set("sigungu", selectedSigungu);
    if (parkingFilter !== "전체") params.set("parking", parkingFilter);
    if (facilityType !== "전체") params.set("facility", facilityType);

    if (!selectedCategories1.has("전체")) {
      params.set("category1", Array.from(selectedCategories1).join(","));
    }
    if (!selectedCategories2.has("전체")) {
      params.set("category2", Array.from(selectedCategories2).join(","));
    }
    if (!selectedPetSizes.has("전체")) {
      params.set("petSize", Array.from(selectedPetSizes).join(","));
    }

    return params.toString();
  };

  // 7. 데이터 로드 및 마커 표시
  const loadFacilities = async () => {
    if (!mapInstance.current) return;

    try {
      // 기본 URL (모든 시설)
      let url = "http://localhost:8080/api/pet_facilities";

      // 간단한 필터링부터 구현 (지역 + 카테고리1)
      if (selectedRegion !== "전체" && !selectedCategories1.has("전체")) {
        const category1Array = Array.from(selectedCategories1);
        if (category1Array.length === 1) {
          url += `/region/${encodeURIComponent(selectedRegion)}/category1/${encodeURIComponent(category1Array[0])}`;
        } else {
          // 여러 카테고리 선택시 각각 호출해서 합치기
          const promises = category1Array.map((category) =>
            fetch(
              `http://localhost:8080/api/pet_facilities/region/${encodeURIComponent(selectedRegion)}/category1/${encodeURIComponent(category)}`,
            ).then((r) => r.json()),
          );
          const responses = await Promise.all(promises);
          let facilities = responses.flatMap((data) => data);

          // 중복 제거
          facilities = facilities.reduce((acc, facility) => {
            if (!acc.find((f) => f.id === facility.id)) {
              acc.push(facility);
            }
            return acc;
          }, []);

          displayMarkers(facilities);
          return;
        }
      } else if (selectedRegion !== "전체") {
        url += `/region/${encodeURIComponent(selectedRegion)}`;
      } else if (!selectedCategories1.has("전체")) {
        const category1Array = Array.from(selectedCategories1);
        if (category1Array.length === 1) {
          url += `/category1/${encodeURIComponent(category1Array[0])}`;
        }
      }

      const response = await fetch(url);
      let facilities = await response.json();

      // 프론트엔드에서 추가 필터링
      facilities = applyClientSideFilters(facilities);

      displayMarkers(facilities);
    } catch (err) {
      console.error("데이터 로드 오류:", err);
      setError("데이터를 가져오는데 실패했습니다.");
    }
  };

  // 8. 클라이언트 사이드 필터링
  const applyClientSideFilters = (facilities) => {
    return facilities.filter((facility) => {
      // 시군구 필터
      if (
        selectedSigungu !== "전체" &&
        facility.sigunguName &&
        !facility.sigunguName.includes(selectedSigungu)
      ) {
        return false;
      }

      // 카테고리2 필터
      if (
        !selectedCategories2.has("전체") &&
        facility.category2 &&
        !Array.from(selectedCategories2).some((cat) =>
          facility.category2.includes(cat),
        )
      ) {
        return false;
      }

      // 반려동물 크기 필터
      if (
        !selectedPetSizes.has("전체") &&
        facility.allowedPetSize &&
        !Array.from(selectedPetSizes).some((size) =>
          facility.allowedPetSize.includes(size),
        )
      ) {
        return false;
      }

      // 주차 필터
      if (
        parkingFilter !== "전체" &&
        facility.parkingAvailable &&
        !facility.parkingAvailable.includes(parkingFilter)
      ) {
        return false;
      }

      // 실내/실외 필터
      if (
        facilityType === "실내" &&
        (!facility.indoorFacility || !facility.indoorFacility.includes("Y"))
      ) {
        return false;
      }
      if (
        facilityType === "실외" &&
        (!facility.outdoorFacility || !facility.outdoorFacility.includes("Y"))
      ) {
        return false;
      }

      return true;
    });
  };

  // 9. 마커 표시
  const displayMarkers = (facilities) => {
    clearMarkers();

    const limitedFacilities = facilities.slice(0, 300);

    limitedFacilities.forEach((facility) => {
      if (
        typeof facility.latitude === "number" &&
        typeof facility.longitude === "number" &&
        !isNaN(facility.latitude) &&
        !isNaN(facility.longitude)
      ) {
        const markerPosition = new window.kakao.maps.LatLng(
          facility.latitude,
          facility.longitude,
        );
        const marker = createCustomMarker(markerPosition, facility.category1);
        marker.setTitle(facility.name);

        markersRef.current.push(marker);

        // 정보창
        let infowindow = null;
        window.kakao.maps.event.addListener(marker, "click", () => {
          if (!infowindow) {
            const infowindowContent = `
              <div style="padding:12px;font-size:14px;line-height:1.5;max-width:300px;">
                <div style="margin-bottom:8px;">
                  <strong style="font-size:16px;">${facility.name || "이름 없음"}</strong>
                  <span style="background:${categoryColors[facility.category1] || "#666"};color:white;padding:2px 6px;border-radius:3px;font-size:11px;margin-left:8px;">
                    ${facility.category1 || ""}
                  </span>
                </div>
                <div style="color:#666;margin-bottom:4px;">${facility.category2 || ""} ${facility.category3 ? `> ${facility.category3}` : ""}</div>
                <div style="margin-bottom:8px;">${facility.roadAddress || facility.jibunAddress || "주소 정보 없음"}</div>
                ${facility.phoneNumber ? `<div style="color:#0066cc;margin-bottom:4px;">📞 ${facility.phoneNumber}</div>` : ""}
                ${facility.allowedPetSize ? `<div style="color:#28a745;margin-bottom:4px;">🐕 ${facility.allowedPetSize}</div>` : ""}
                ${facility.parkingAvailable === "Y" ? `<div style="color:#6c757d;font-size:12px;">🅿️ 주차가능</div>` : ""}
              </div>
            `;
            infowindow = new window.kakao.maps.InfoWindow({
              content: infowindowContent,
              removable: true,
            });
          }
          infowindow.open(mapInstance.current, marker);
        });
      }
    });

    setFacilities(limitedFacilities);
  };

  // 10. 필터 변경시 데이터 다시 로드
  useEffect(() => {
    if (!isLoading) {
      loadFacilities();
    }
  }, [
    selectedRegion,
    selectedSigungu,
    selectedCategories1,
    selectedCategories2,
    selectedPetSizes,
    parkingFilter,
    facilityType,
    isLoading,
  ]);

  // 11. 체크박스 렌더 함수
  const renderCheckboxGroup = (
    title,
    options,
    selectedSet,
    setFunction,
    emoji,
  ) => (
    <div style={{ marginBottom: "20px" }}>
      <h4 style={{ marginBottom: "12px", color: "#333" }}>
        {emoji} {title}
      </h4>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {options.map((option) => {
          const isChecked = selectedSet.has(option);
          const bgColor =
            option === "전체" ? "#6c757d" : categoryColors[option] || "#007bff";

          return (
            <label
              key={option}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "6px 12px",
                backgroundColor: isChecked ? bgColor : "white",
                color: isChecked ? "white" : "#333",
                border: `2px solid ${bgColor}`,
                borderRadius: "16px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
                transition: "all 0.2s ease",
                userSelect: "none",
              }}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() =>
                  handleSetFilter(selectedSet, setFunction)(option)
                }
                style={{ display: "none" }}
              />
              <span style={{ marginRight: "4px" }}>
                {isChecked ? "✓" : "○"}
              </span>
              {option}
            </label>
          );
        })}
      </div>
    </div>
  );

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red", textAlign: "center" }}>
        <h3>오류 발생</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>🐾 반려동물 동반 가능 시설 지도 (전체 필터)</h2>

      {/* 필터 UI */}
      <div
        style={{
          marginBottom: "20px",
          padding: "20px",
          backgroundColor: "#f8f9fa",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* 드롭다운 필터들 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              📍 지역
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "2px solid #e9ecef",
                fontSize: "14px",
              }}
            >
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              🏘️ 시군구
            </label>
            <select
              value={selectedSigungu}
              onChange={(e) => setSelectedSigungu(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "2px solid #e9ecef",
                fontSize: "14px",
              }}
            >
              {sigungus.map((sigungu) => (
                <option key={sigungu} value={sigungu}>
                  {sigungu}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              🅿️ 주차 가능
            </label>
            <select
              value={parkingFilter}
              onChange={(e) => setParkingFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "2px solid #e9ecef",
                fontSize: "14px",
              }}
            >
              <option value="전체">전체</option>
              <option value="Y">주차 가능</option>
              <option value="N">주차 불가</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              🏢 시설 유형
            </label>
            <select
              value={facilityType}
              onChange={(e) => setFacilityType(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "2px solid #e9ecef",
                fontSize: "14px",
              }}
            >
              <option value="전체">전체</option>
              <option value="실내">실내</option>
              <option value="실외">실외</option>
            </select>
          </div>
        </div>

        {/* 체크박스 필터들 */}
        {renderCheckboxGroup(
          "대분류",
          categories1,
          selectedCategories1,
          setSelectedCategories1,
          "🏷️",
        )}
        {renderCheckboxGroup(
          "중분류",
          categories2,
          selectedCategories2,
          setSelectedCategories2,
          "🏪",
        )}
        {renderCheckboxGroup(
          "반려동물 크기",
          petSizes,
          selectedPetSizes,
          setSelectedPetSizes,
          "🐕",
        )}

        {/* 결과 요약 */}
        <div
          style={{
            padding: "12px",
            backgroundColor: "white",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
          }}
        >
          <div style={{ color: "#666", fontSize: "14px" }}>
            검색 결과:{" "}
            <strong style={{ color: "#007bff" }}>
              {facilities.length}개 시설
            </strong>
            <span style={{ marginLeft: "16px", fontSize: "12px" }}>
              (최대 300개까지 표시)
            </span>
          </div>
        </div>
      </div>

      {isLoading && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "18px", marginBottom: "10px" }}>
            🗺️ 지도를 로딩 중입니다...
          </div>
        </div>
      )}

      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "600px",
          border: "2px solid #dee2e6",
          borderRadius: "12px",
          display: isLoading ? "none" : "block",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      />

      {/* 범례 */}
      {!isLoading && (
        <div
          style={{
            marginTop: "16px",
            padding: "16px",
            backgroundColor: "white",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
          }}
        >
          <h5 style={{ marginBottom: "12px", color: "#333" }}>
            🎨 카테고리별 마커 색상
          </h5>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            {Object.entries(categoryColors).map(([category, color]) => (
              <div
                key={category}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    backgroundColor: color,
                    borderRadius: "50%",
                    border: "2px solid white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  }}
                ></div>
                <span style={{ fontSize: "13px", color: "#666" }}>
                  {category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FullFilterKakaoMap;
