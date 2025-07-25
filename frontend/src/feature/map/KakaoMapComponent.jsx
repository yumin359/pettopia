// src/feature/map/KakaoMapComponent.js
import React, { useEffect, useRef, useCallback } from "react";
import { createInfoWindowContent } from "./mapUtils";

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
          center: new window.kakao.maps.LatLng(37.566826, 126.9786567), // 서울 중심
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
    (position, facility) => {
      const color =
        categoryColors[facility.category1] || // category1 먼저 확인
        categoryColors[facility.category2] ||
        "#666666";
      const shortName =
        facility.name.length > 7 // 글자수를 7자로 늘려 더 많은 정보를 표시
          ? facility.name.substring(0, 7) + "..."
          : facility.name;

      // 마커의 크기 및 구성 요소 정의
      const markerWidth = 80;
      const markerHeight = 35;
      const rectHeight = 28; // 메인 사각형 부분의 높이
      const borderRadius = 8; // 모서리 둥글게

      const pointerWidth = 10; // 아래 삼각형 포인터의 너비
      // const pointerHeight = 7; // 아래 삼각형 포인터의 높이

      const markerSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${markerWidth}" height="${markerHeight}" viewBox="0 0 ${markerWidth} ${markerHeight}">
          <rect x="0" y="0" width="${markerWidth}" height="${rectHeight}" rx="${borderRadius}" ry="${borderRadius}" fill="${color}" stroke="#fff" stroke-width="1.5"/>
          <path d="M${markerWidth / 2} ${markerHeight} L${markerWidth / 2 - pointerWidth / 2} ${rectHeight} L${markerWidth / 2 + pointerWidth / 2} ${rectHeight} Z" fill="${color}" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>
          <text x="${markerWidth / 2}" y="${rectHeight / 2 + 2}" 
                font-family="Pretendard, 'Malgun Gothic', sans-serif" 
                font-size="10" font-weight="bold" fill="white" 
                text-anchor="middle" alignment-baseline="middle">
            ${shortName}
          </text>
        </svg>
      `;

      const markerImage = new window.kakao.maps.MarkerImage(
        `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markerSvg)}`,
        new window.kakao.maps.Size(markerWidth, markerHeight),
        { offset: new window.kakao.maps.Point(markerWidth / 2, markerHeight) }, // 마커 이미지의 중심을 포인터 끝에 맞춤
      );

      const marker = new window.kakao.maps.Marker({
        position: position,
        image: markerImage,
        title: facility.name,
      });
      marker.facilityId = facility.id;
      marker.facility = facility;
      marker.infowindow = null;

      return marker;
    },
    [categoryColors],
  );

  // 시설 데이터가 변경될 때마다 마커 업데이트
  useEffect(() => {
    if (!mapInstance.current || !isMapReady) return;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => {
      if (marker.infowindow) marker.infowindow.close();
      marker.setMap(null);
    });
    markersRef.current = [];

    // facilities가 빈 배열이면 마커를 생성하지 않음 (초기 상태)
    if (!facilities || facilities.length === 0) return;

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
        const marker = createCustomMarker(markerPosition, facility);

        marker.setMap(mapInstance.current);
        newMarkers.push(marker);

        // 호버 이벤트
        window.kakao.maps.event.addListener(marker, "mouseover", () => {
          if (!marker.infowindow) {
            marker.infowindow = new window.kakao.maps.InfoWindow({
              content: createInfoWindowContent(facility, categoryColors),
              removable: false,
            });
          }
          marker.infowindow.open(mapInstance.current, marker);
        });

        window.kakao.maps.event.addListener(marker, "mouseout", () => {
          if (marker.infowindow) marker.infowindow.close();
        });

        // 클릭 이벤트
        window.kakao.maps.event.addListener(marker, "click", () => {
          // 다른 열린 정보창 닫기
          markersRef.current.forEach((m) => {
            if (m.infowindow && m.infowindow.getMap()) m.infowindow.close();
          });

          // 클릭된 마커의 정보창 열기
          if (!marker.infowindow) {
            marker.infowindow = new window.kakao.maps.InfoWindow({
              // mapUtils에서 임포트한 createInfoWindowContent 함수 사용
              content: createInfoWindowContent(facility, categoryColors),
              removable: true,
            });
          }
          marker.infowindow.open(mapInstance.current, marker);

          // 지도 중심 이동
          const moveLatLon = new window.kakao.maps.LatLng(
            facility.latitude,
            facility.longitude,
          );
          mapInstance.current.setCenter(moveLatLon);
          mapInstance.current.setLevel(3);
        });
      }
    });

    markersRef.current = newMarkers;

    // 마커가 있을 때만 지도 범위 재설정
    if (markersRef.current.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds();
      markersRef.current.forEach((marker) => {
        bounds.extend(marker.getPosition());
      });
      mapInstance.current.setBounds(bounds);
    }
  }, [facilities, isMapReady, createCustomMarker, categoryColors]); // categoryColors도 의존성 배열에 추가

  // 리스트에서 클릭된 시설로 지도 이동
  useEffect(() => {
    if (handleListItemClick && mapInstance.current) {
      // handleListItemClick이 호출되면 해당 시설의 마커를 찾아서 클릭 이벤트 실행
      const handleExternalClick = (facility) => {
        const targetMarker = markersRef.current.find(
          (marker) => marker.facilityId === facility.id,
        );

        if (targetMarker) {
          // 지도 중심 이동
          const moveLatLon = new window.kakao.maps.LatLng(
            facility.latitude,
            facility.longitude,
          );
          mapInstance.current.setCenter(moveLatLon);
          mapInstance.current.setLevel(3);

          // 다른 정보창 닫기
          markersRef.current.forEach((m) => {
            if (m.infowindow && m.infowindow.getMap()) m.infowindow.close();
          });

          // 해당 마커의 정보창 열기
          if (!targetMarker.infowindow) {
            targetMarker.infowindow = new window.kakao.maps.InfoWindow({
              // mapUtils에서 임포트한 createInfoWindowContent 함수 사용
              content: createInfoWindowContent(facility, categoryColors),
              removable: true,
            });
          }
          targetMarker.infowindow.open(mapInstance.current, targetMarker);
        }
      };

      // 전역에 함수 등록 (임시 방법)
      window.handleMapFacilityClick = handleExternalClick;
    }
  }, [handleListItemClick, categoryColors]); // categoryColors도 의존성 배열에 추가

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
        style={{ minHeight: "100%" }}
      />

      {/* 범례 - 검색 결과가 있을 때만 표시 */}
      {isMapReady && facilities && facilities.length > 0 && (
        <div
          className="position-absolute bottom-0 end-0 p-2 m-2 bg-white rounded shadow-sm"
          style={{ maxWidth: "150px", zIndex: 1000, fontSize: "10px" }}
        >
          <div className="d-flex flex-wrap gap-1">
            {Object.entries(categoryColors)
              .filter(([category]) =>
                facilities.some(
                  (f) => f.category2 === category || f.category1 === category,
                ),
              )
              .map(([category, color]) => (
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
