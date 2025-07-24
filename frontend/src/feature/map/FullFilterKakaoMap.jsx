import React, { useEffect, useRef, useState } from "react";

const FullFilterKakaoMap = () => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [facilities, setFacilities] = useState([]); // 검색된 시설 데이터

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
      if (currentSet.has("전체") && newSet.size === 1) {
        // If "전체" is already selected and it's the only one, unselect it.
        newSet.clear();
      } else {
        // Otherwise, select "전체" and clear others.
        newSet.clear();
        newSet.add("전체");
      }
    } else {
      newSet.delete("전체"); // If a specific item is selected, remove "전체"
      if (currentSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }

      if (newSet.size === 0) {
        // If all specific items are unselected, re-select "전체"
        newSet.add("전체");
      }
    }

    setFunction(newSet);
  };

  // 5. 커스텀 마커 생성
  const createCustomMarker = (position, category, facilityName) => {
    const color = categoryColors[category] || "#666666";

    // 마커 이미지를 SVG로 직접 생성하여 텍스트 포함
    const markerSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="60" height="36" viewBox="0 0 60 36">
        <rect x="0" y="0" width="60" height="36" rx="8" ry="8" fill="${color}" stroke="#fff" stroke-width="2"/>
        <text x="30" y="22" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle" alignment-baseline="middle">
          ${facilityName}
        </text>
        <path d="M30 36 L25 31 L35 31 Z" fill="${color}"/>
      </svg>
    `;

    const markerImage = new window.kakao.maps.MarkerImage(
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markerSvg)}`,
      new window.kakao.maps.Size(60, 36),
      { offset: new window.kakao.maps.Point(30, 36) }, // 마커의 중심을 아래쪽으로 조정
    );

    return new window.kakao.maps.Marker({
      map: mapInstance.current,
      position: position,
      image: markerImage,
      title: facilityName, // 마우스 오버 시 표시될 텍스트
    });
  };

  // 6. 복합 필터링을 위한 쿼리 파라미터 빌드
  const buildFilterQuery = () => {
    const params = new URLSearchParams();

    if (selectedRegion !== "전체") params.append("sidoName", selectedRegion);
    if (selectedSigungu !== "전체")
      params.append("sigunguName", selectedSigungu);
    if (parkingFilter !== "전체")
      params.append("parkingAvailable", parkingFilter);

    // Facility Type (실내/실외)
    if (facilityType === "실내") {
      params.append("indoorFacility", "Y");
    } else if (facilityType === "실외") {
      params.append("outdoorFacility", "Y");
    }

    // Checkbox filters (comma-separated values for multiple selections)
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

    return params.toString();
  };

  // 7. 데이터 로드 및 마커 표시
  const loadFacilities = async () => {
    if (!mapInstance.current) return;

    try {
      const query = buildFilterQuery();
      const url = `http://localhost:8080/api/pet_facilities/search?${query}`; // Updated endpoint

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      let fetchedFacilities = await response.json();

      setFacilities(fetchedFacilities); // 검색된 전체 시설 데이터 저장
      displayMarkers(fetchedFacilities); // 지도에 마커 표시
    } catch (err) {
      console.error("데이터 로드 오류:", err);
      setError("데이터를 가져오는데 실패했습니다.");
    }
  };

  // 8. 마커 표시
  const displayMarkers = (facilitiesToDisplay) => {
    clearMarkers();

    const limitedFacilities = facilitiesToDisplay.slice(0, 300); // 최대 300개 표시 제한

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
        // 마커 생성 시 facility.name을 전달하여 SVG 내에 표시
        const marker = createCustomMarker(
          markerPosition,
          facility.category1,
          facility.name || "이름 없음",
        );
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

    // 모든 마커를 포함하는 경계 가져오기 및 지도 이동 (선택 사항)
    if (mapInstance.current && limitedFacilities.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds();
      limitedFacilities.forEach((f) => {
        bounds.extend(new window.kakao.maps.LatLng(f.latitude, f.longitude));
      });
      mapInstance.current.setBounds(bounds);
    }
  };

  // 9. 필터 변경시 데이터 다시 로드
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

  // 10. 체크박스 렌더 함수
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
                boxShadow: isChecked
                  ? `0 2px 4px rgba(0,0,0,0.2)`
                  : `0 1px 2px rgba(0,0,0,0.1)`,
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

  // 리스트 항목 클릭 시 지도 이동 및 정보창 열기
  const handleListItemClick = (facility) => {
    if (!mapInstance.current) return;

    const moveLatLon = new window.kakao.maps.LatLng(
      facility.latitude,
      facility.longitude,
    );
    mapInstance.current.setCenter(moveLatLon);
    mapInstance.current.setLevel(2); // 좀 더 확대해서 보여주기

    // 해당 마커 찾아 정보창 열기
    const targetMarker = markersRef.current.find(
      (marker) => marker.getTitle() === facility.name,
    );
    if (targetMarker) {
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
      const infowindow = new window.kakao.maps.InfoWindow({
        content: infowindowContent,
        removable: true,
      });
      infowindow.open(mapInstance.current, targetMarker);
    }
  };

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red", textAlign: "center" }}>
        <h3>오류 발생</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh", // 전체 화면 높이 사용
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        backgroundColor: "#f4f7f6",
      }}
    >
      {/* 좌측 사이드바 - 필터 및 검색 결과 리스트 */}
      <div
        style={{
          width: "400px", // 사이드바 너비
          minWidth: "350px", // 최소 너비
          maxWidth: "450px", // 최대 너비
          flexShrink: 0, // 사이드바가 줄어들지 않도록
          backgroundColor: "#fff",
          padding: "20px",
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
          overflowY: "auto", // 내용이 많을 경우 스크롤
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <h2 style={{ fontSize: "24px", color: "#333", marginBottom: "15px" }}>
          🐾 반려동물 시설 찾기
        </h2>

        {/* 필터 UI */}
        <div
          style={{
            paddingBottom: "10px",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              color: "#555",
              marginBottom: "15px",
            }}
          >
            필터
          </h3>
          {/* 드롭다운 필터들 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr", // 두 열로 배치
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
                  fontSize: "14px",
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
                  border: "1px solid #ced4da",
                  fontSize: "14px",
                  backgroundColor: "#f8f9fa",
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
                  fontSize: "14px",
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
                  border: "1px solid #ced4da",
                  fontSize: "14px",
                  backgroundColor: "#f8f9fa",
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
                  fontSize: "14px",
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
                  border: "1px solid #ced4da",
                  fontSize: "14px",
                  backgroundColor: "#f8f9fa",
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
                  fontSize: "14px",
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
                  border: "1px solid #ced4da",
                  fontSize: "14px",
                  backgroundColor: "#f8f9fa",
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
        </div>

        {/* 검색 결과 리스트 */}
        <div style={{ flexGrow: 1, paddingTop: "10px" }}>
          <div
            style={{
              paddingBottom: "12px",
              borderBottom: "1px solid #e0e0e0",
              marginBottom: "15px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ fontSize: "18px", color: "#555" }}>검색 결과</h3>
            <span style={{ color: "#007bff", fontWeight: "bold" }}>
              {facilities.length}개 시설
            </span>
            <span
              style={{ marginLeft: "10px", fontSize: "12px", color: "#888" }}
            >
              (최대 300개 표시)
            </span>
          </div>

          {isLoading ? (
            <div
              style={{ textAlign: "center", padding: "20px", color: "#777" }}
            >
              <p>데이터를 로딩 중입니다...</p>
            </div>
          ) : facilities.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "20px", color: "#777" }}
            >
              <p>필터 조건에 맞는 시설이 없습니다.</p>
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {facilities.slice(0, 300).map((facility) => (
                <li
                  key={facility.id}
                  style={{
                    padding: "12px 10px",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#eef")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "white")
                  }
                  onClick={() => handleListItemClick(facility)}
                >
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor:
                        categoryColors[facility.category1] || "#666",
                      flexShrink: 0,
                    }}
                  ></div>
                  <div>
                    <strong style={{ fontSize: "15px", color: "#333" }}>
                      {facility.name}
                    </strong>
                    <div style={{ fontSize: "12px", color: "#777" }}>
                      {facility.category1} {">"} {facility.category2 || "N/A"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#999" }}>
                      {facility.roadAddress || facility.jibunAddress}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 우측 메인 영역 - 지도 */}
      <div style={{ flexGrow: 1, position: "relative" }}>
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255,255,255,0.8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
              fontSize: "18px",
              color: "#555",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #3498db",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                animation: "spin 1s linear infinite",
                marginBottom: "15px",
              }}
            ></div>
            맵 데이터를 로딩 중입니다...
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        )}
        <div
          ref={mapContainer}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "0", // 전체 영역을 채우므로 둥근 모서리 제거
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            display: "block",
          }}
        />

        {/* 범례 (지도 위에 오버레이) */}
        {!isLoading && (
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              padding: "16px",
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: "8px",
              border: "1px solid #dee2e6",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              zIndex: 5,
              maxWidth: "200px",
            }}
          >
            <h5
              style={{
                marginBottom: "12px",
                color: "#333",
                fontSize: "15px",
              }}
            >
              🎨 마커 색상 범례
            </h5>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {Object.entries(categoryColors).map(([category, color]) => (
                <div
                  key={category}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      backgroundColor: color,
                      borderRadius: "50%",
                      border: "1px solid white",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                    }}
                  ></div>
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    {category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FullFilterKakaoMap;
