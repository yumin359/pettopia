// src/feature/map/KakaoMapComponent.jsx

import React, { useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { createInfoWindowContent } from "./MapUtils.jsx";

const KakaoMapComponent = ({
  isMapReady,
  setIsMapReady,
  isDataLoading,
  setError,
  facilities,
  categoryColors,
  handleListItemClick,
  favoriteMarkers,
  isShowingFavorites,
}) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const openInfoWindowRef = useRef(null);

  const createStyledInfoWindow = useCallback((content) => {
    return `
      <div class="p-2 bg-white rounded shadow-sm" style="
        max-width: 350px; 
        white-space: normal; 
        word-break: break-word; 
        box-sizing: border-box;
      ">
        ${content}
      </div>
    `;
  }, []);

  const createCustomMarker = useCallback(
    (position, facility) => {
      const color =
        categoryColors[facility.category1] ||
        categoryColors[facility.category2] ||
        "#666666";
      const shortName =
        facility.name.length > 7
          ? facility.name.substring(0, 7) + "..."
          : facility.name;

      const markerWidth = 80,
        markerHeight = 35,
        rectHeight = 28,
        borderRadius = 8,
        pointerWidth = 10;
      const markerSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${markerWidth}" height="${markerHeight}" viewBox="0 0 ${markerWidth} ${markerHeight}">
          <rect x="0" y="0" width="${markerWidth}" height="${rectHeight}" rx="${borderRadius}" ry="${borderRadius}" fill="${color}" stroke="#fff" stroke-width="1.5"/>
          <path d="M${markerWidth / 2} ${markerHeight} L${markerWidth / 2 - pointerWidth / 2} ${rectHeight} L${markerWidth / 2 + pointerWidth / 2} ${rectHeight} Z" fill="${color}" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>
          <text x="${markerWidth / 2}" y="${rectHeight / 2 + 2}" font-family="Pretendard, 'Malgun Gothic', sans-serif" font-size="10" font-weight="bold" fill="white" text-anchor="middle" alignment-baseline="middle">${shortName}</text>
        </svg>`;

      const markerImage = new window.kakao.maps.MarkerImage(
        `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markerSvg)}`,
        new window.kakao.maps.Size(markerWidth, markerHeight),
        { offset: new window.kakao.maps.Point(markerWidth / 2, markerHeight) },
      );

      return new window.kakao.maps.Marker({
        position,
        image: markerImage,
        title: facility.name,
      });
    },
    [categoryColors],
  );

  useEffect(() => {
    const initializeMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        setTimeout(initializeMap, 200);
        return;
      }
      if (!mapContainer.current || mapInstance.current) return;
      try {
        mapInstance.current = new window.kakao.maps.Map(mapContainer.current, {
          center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
          level: 8,
        });
        setIsMapReady(true);
      } catch (err) {
        console.error("카카오맵 초기화 오류:", err);
        setError("카카오맵 초기화에 실패했습니다.");
      }
    };
    initializeMap();
  }, [setIsMapReady, setError]);

  // 기본 필터 마커 처리
  useEffect(() => {
    if (!mapInstance.current || !isMapReady) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // const allFacilities = [...facilities, ...favoriteMarkers];
    const markersToShow = isShowingFavorites ? favoriteMarkers : facilities;

    if (!markersToShow || markersToShow.length === 0) return;

    const newMarkers = markersToShow
      .map((facility) => {
        if (
          typeof facility.latitude !== "number" ||
          typeof facility.longitude !== "number"
        )
          return null;

        const position = new window.kakao.maps.LatLng(
          facility.latitude,
          facility.longitude,
        );
        const marker = createCustomMarker(position, facility);
        marker.setMap(mapInstance.current);

        window.kakao.maps.event.addListener(marker, "click", async () => {
          if (openInfoWindowRef.current) {
            openInfoWindowRef.current.close();
          }

          const initialContent = createInfoWindowContent(
            facility,
            categoryColors,
            null,
          );
          const styledInitialContent = createStyledInfoWindow(initialContent);
          const infowindow = new window.kakao.maps.InfoWindow({
            content: styledInitialContent,
            removable: true,
          });

          infowindow.open(mapInstance.current, marker);
          openInfoWindowRef.current = infowindow;
          mapInstance.current.panTo(marker.getPosition());

          try {
            const res = await axios.get("/api/review/list", {
              params: { facilityName: facility.name },
            });
            const reviews = res.data || [];
            const reviewCount = reviews.length;
            const averageRating =
              reviewCount > 0
                ? (
                    reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
                  ).toFixed(1)
                : "평가 없음";

            const finalContent = createInfoWindowContent(
              facility,
              categoryColors,
              { reviewCount, averageRating },
            );
            infowindow.setContent(createStyledInfoWindow(finalContent));
          } catch (err) {
            console.error("리뷰 조회 실패:", err);
            const errorContent = createInfoWindowContent(
              facility,
              categoryColors,
              {
                reviewCount: "조회 실패",
                averageRating: "-",
              },
            );
            infowindow.setContent(createStyledInfoWindow(errorContent));
          }
        });
        return marker;
      })
      .filter(Boolean);

    markersRef.current = newMarkers;

    if (newMarkers.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds();
      newMarkers.forEach((marker) => bounds.extend(marker.getPosition()));
      mapInstance.current.setBounds(bounds);
    }
  }, [
    facilities,
    isMapReady,
    createCustomMarker,
    createStyledInfoWindow,
    categoryColors,
    favoriteMarkers,
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
              <span className="visually-hidden">Loading...</span>
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
    </div>
  );
};

export default KakaoMapComponent;
