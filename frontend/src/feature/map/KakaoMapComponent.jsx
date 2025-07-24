// src/feature/map/KakaoMapComponent.js
import React, { useEffect, useRef, useCallback } from "react";

const KakaoMapComponent = ({
  isMapReady,
  setIsMapReady,
  isDataLoading,
  setError,
  facilities,
  categoryColors,
  handleListItemClick,
}) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  // 카카오맵 초기화
  useEffect(() => {
    const initializeMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        setTimeout(initializeMap, 200);
        return;
      }

      if (!mapContainer.current || mapInstance.current) {
        if (mapInstance.current) setIsMapReady(true);
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
        setIsMapReady(true);
      } catch (err) {
        console.error("카카오맵 초기화 오류:", err);
        setError("카카오맵 초기화에 실패했습니다.");
        setIsMapReady(false);
      }
    };

    initializeMap();
  }, [setIsMapReady, setError]);

  // 커스텀 마커 생성
  const createCustomMarker = useCallback(
    (position, category, facilityName, facilityId) => {
      const color = categoryColors[category] || "#666666";
      const shortName =
        facilityName.length > 5
          ? facilityName.substring(0, 5) + "..."
          : facilityName;

      const markerSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="24" viewBox="0 0 40 24">
          <rect x="0" y="0" width="40" height="20" rx="4" ry="4" fill="${color}" stroke="#fff" stroke-width="1"/>
          <text x="20" y="13" font-family="Arial, sans-serif" font-size="9" fill="white" text-anchor="middle" alignment-baseline="middle">
            ${shortName}
          </text>
          <path d="M20 24 L17 20 L23 20 Z" fill="${color}"/>
        </svg>
      `;

      const markerImage = new window.kakao.maps.MarkerImage(
        `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markerSvg)}`,
        new window.kakao.maps.Size(40, 24),
        { offset: new window.kakao.maps.Point(20, 24) },
      );

      const marker = new window.kakao.maps.Marker({
        position: position,
        image: markerImage,
        title: facilityName,
      });
      marker.facilityId = facilityId;
      marker.infowindow = null;

      return marker;
    },
    [categoryColors],
  );

  // 시설 데이터가 변경될 때마다 마커 업데이트
  useEffect(() => {
    if (!mapInstance.current || !isMapReady || !facilities) return;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => {
      if (marker.infowindow) marker.infowindow.close();
      marker.setMap(null);
    });
    markersRef.current = [];

    // 새 마커 생성
    const newMarkers = [];
    facilities.forEach((facility) => {
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
        const marker = createCustomMarker(
          markerPosition,
          facility.category1,
          facility.name || "이름 없음",
          facility.id,
        );

        marker.setMap(mapInstance.current);
        newMarkers.push(marker);

        // 호버 이벤트 및 클릭 이벤트 (handleListItemClick 활용)
        window.kakao.maps.event.addListener(marker, "mouseover", () => {
          if (!marker.infowindow) {
            const infowindowContent = `
              <div class="card shadow p-2" style="width: 200px; font-size: 11px;">
                <div class="card-body p-1">
                  <h6 class="card-title mb-1" style="font-size: 12px;">${facility.name || "이름 없음"}
                    <span class="badge ms-1" style="background-color:${categoryColors[facility.category1] || "#6c757d"}; font-size: 8px;">
                      ${facility.category1 || ""}
                    </span>
                  </h6>
                  <p class="text-muted mb-1 small">${facility.category2 || ""}</p>
                  <p class="mb-1 small">${facility.roadAddress || facility.jibunAddress || "주소 정보 없음"}</p>
                  ${facility.phoneNumber ? `<p class="text-info mb-1 small">📞 ${facility.phoneNumber}</p>` : ""}
                  ${facility.allowedPetSize ? `<p class="text-success mb-1 small">🐕 ${facility.allowedPetSize}</p>` : ""}
                  ${facility.parkingAvailable === "Y" ? `<p class="text-secondary mb-1 small">🅿️ 주차가능</p>` : ""}
                  <div class="d-flex align-items-center">
                    <span class="text-warning small me-1">⭐⭐⭐⭐☆</span>
                    <span class="text-muted small">(4.2) 리뷰 23개</span>
                  </div>
                </div>
              </div>
            `;
            marker.infowindow = new window.kakao.maps.InfoWindow({
              content: infowindowContent,
              removable: false,
            });
          }
          marker.infowindow.open(mapInstance.current, marker);
        });

        window.kakao.maps.event.addListener(marker, "mouseout", () => {
          if (marker.infowindow) marker.infowindow.close();
        });

        window.kakao.maps.event.addListener(marker, "click", () => {
          // 다른 열린 정보창 닫기
          markersRef.current.forEach((m) => {
            if (m.infowindow && m.infowindow.getMap()) m.infowindow.close();
          });
          // 클릭된 마커의 정보창 열기
          if (marker.infowindow) {
            marker.infowindow.open(mapInstance.current, marker);
          }
          // handleListItemClick 호출 (지도 중심 이동)
          handleListItemClick(facility);
        });
      }
    });

    markersRef.current = newMarkers;

    // 지도 범위 재설정
    if (markersRef.current.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds();
      markersRef.current.forEach((marker) => {
        bounds.extend(marker.getPosition());
      });
      mapInstance.current.setBounds(bounds);
    }
  }, [
    facilities,
    isMapReady,
    createCustomMarker,
    handleListItemClick,
    categoryColors,
  ]);

  return (
    <div className="col-7 position-relative p-0">
      {(!isMapReady || isDataLoading) && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 bg-light bg-opacity-75 d-flex justify-content-center align-items-center rounded"
          style={{ zIndex: 1000 }}
        >
          <div className="text-center text-primary">
            <div className="spinner-border mb-2" role="status">
              <span className="visually-hidden">Loading map...</span>
            </div>
            <p className="small mb-0">
              {!isMapReady ? "맵 초기화 중..." : "데이터 로딩 중..."}
            </p>
          </div>
        </div>
      )}
      <div
        ref={mapContainer}
        className="w-100 h-100 rounded"
        style={{ minHeight: "100vh" }}
      />

      {/* 범례 */}
      {isMapReady && facilities.length > 0 && (
        <div
          className="position-absolute bottom-0 end-0 p-2 m-2 bg-white rounded shadow-sm"
          style={{ maxWidth: "120px", zIndex: 1000, fontSize: "10px" }}
        >
          <h6 className="small mb-1">🎨 카테고리</h6>
          <div className="d-flex flex-wrap gap-1">
            {Object.entries(categoryColors).map(([category, color]) => (
              <div key={category} className="d-flex align-items-center mb-1">
                <div
                  className="rounded-circle me-1"
                  style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: color,
                    border: "1px solid rgba(0,0,0,0.1)",
                  }}
                ></div>
                <span className="text-muted" style={{ fontSize: "9px" }}>
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

export default KakaoMapComponent;
