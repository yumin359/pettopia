import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const KakaoMapWithFilters = () => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]); // 현재 표시된 마커들 저장

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [facilities, setFacilities] = useState([]);

  // 필터 상태
  const [selectedCategory1, setSelectedCategory1] = useState("전체");
  const [selectedRegion, setSelectedRegion] = useState("서울특별시");

  // 필터 옵션들
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);

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
          level: 9,
        };

        mapInstance.current = new window.kakao.maps.Map(
          mapContainer.current,
          options,
        );
        setIsLoading(false);
        console.log("카카오맵 초기화 완료");
      } catch (err) {
        console.error("카카오맵 초기화 오류:", err);
        setError("카카오맵 초기화에 실패했습니다.");
        setIsLoading(false);
      }
    };

    initializeMap();
  }, []);

  // 2. 필터 옵션 로드
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [categoriesRes, regionsRes] = await Promise.all([
          axios.get(
            "http://localhost:8080/api/pet_facilities/categories/category1",
          ),
          axios.get("http://localhost:8080/api/pet_facilities/regions"),
        ]);

        setCategories(["전체", ...categoriesRes.data]);
        setRegions(regionsRes.data);
      } catch (err) {
        console.error("필터 옵션 로드 오류:", err);
      }
    };

    loadFilterOptions();
  }, []);

  // 3. 기존 마커 제거
  const clearMarkers = () => {
    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current = [];
  };

  // 4. 데이터 로드 및 마커 표시
  const loadFacilities = async () => {
    if (!mapInstance.current) return;

    try {
      let url = "http://localhost:8080/api/pet_facilities";

      // 필터 조건에 따라 API 엔드포인트 변경
      if (selectedCategory1 !== "전체" && selectedRegion !== "전체") {
        url += `/region/${encodeURIComponent(selectedRegion)}/category1/${encodeURIComponent(selectedCategory1)}`;
      } else if (selectedRegion !== "전체") {
        url += `/region/${encodeURIComponent(selectedRegion)}`;
      } else if (selectedCategory1 !== "전체") {
        url += `/category1/${encodeURIComponent(selectedCategory1)}`;
      }

      const response = await axios.get(url);
      const facilitiesData = response.data;

      console.log(`필터 적용 결과: ${facilitiesData.length}개 시설`);

      // 기존 마커 제거
      clearMarkers();

      // 성능을 위해 최대 200개로 제한
      const limitedFacilities = facilitiesData.slice(0, 200);

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

          const marker = new window.kakao.maps.Marker({
            map: mapInstance.current,
            position: markerPosition,
            title: facility.name,
          });

          // 마커 배열에 추가
          markersRef.current.push(marker);

          // 클릭 이벤트
          let infowindow = null;
          window.kakao.maps.event.addListener(marker, "click", () => {
            if (!infowindow) {
              const infowindowContent = `
                <div style="padding:10px;font-size:14px;line-height:1.5;max-width:250px;">
                  <strong>${facility.name || "이름 없음"}</strong><br>
                  <span style="color:#0066cc;">${facility.category1 || ""} ${facility.category2 ? ">" + facility.category2 : ""}</span><br>
                  ${facility.roadAddress || facility.jibunAddress || "주소 정보 없음"}<br>
                  ${facility.phoneNumber ? `📞 ${facility.phoneNumber}` : ""}
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
    } catch (err) {
      console.error("데이터 로드 오류:", err);
      setError("데이터를 가져오는데 실패했습니다.");
    }
  };

  // 5. 필터 변경시 데이터 다시 로드
  useEffect(() => {
    if (!isLoading) {
      loadFacilities();
    }
  }, [selectedCategory1, selectedRegion, isLoading]);

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
      <h2>반려동물 동반 가능 시설 지도</h2>

      {/* 필터 UI */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          display: "flex",
          gap: "15px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <label style={{ marginRight: "8px", fontWeight: "bold" }}>
            지역:
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            style={{
              padding: "5px 10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
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
          <label style={{ marginRight: "8px", fontWeight: "bold" }}>
            카테고리:
          </label>
          <select
            value={selectedCategory1}
            onChange={(e) => setSelectedCategory1(e.target.value)}
            style={{
              padding: "5px 10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div style={{ color: "#666", fontSize: "14px" }}>
          검색 결과: {facilities.length}개 시설
        </div>
      </div>

      {isLoading && (
        <p style={{ textAlign: "center" }}>지도를 로딩 중입니다...</p>
      )}

      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "500px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          display: isLoading ? "none" : "block",
        }}
      />
    </div>
  );
};

export default KakaoMapWithFilters;
