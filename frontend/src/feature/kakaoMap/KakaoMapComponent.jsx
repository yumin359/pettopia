import React, { useEffect, useRef, useCallback, useState } from "react";
import axios from "axios";
import { createInfoWindowContent } from "./MapUtils.jsx";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa"; // 🆕 FaSearch 아이콘 추가
import { toast } from "react-toastify";

const KakaoMapComponent = ({
  isMapReady,
  setIsMapReady,
  setError,
  facilities,
  categoryColors,
  favoriteMarkers,
  isShowingFavorites,
  onBoundsSearch, // 🆕 추가된 prop
  searchQuery, // 🆕 추가된 prop
}) => {
  // --- Refs: 지도와 관련된 인스턴스 및 요소 참조 ---
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const openInfoWindowRef = useRef(null);
  const myLocationMarkerRef = useRef(null);

  // --- State: 컴포넌트의 상태 관리 ---
  const [myLocation, setMyLocation] = useState(null);
  const [isSearchingBounds, setIsSearchingBounds] = useState(false); // 🆕 추가된 상태

  // --- 콜백 함수: 마커, 인포윈도우 등 생성 로직 (기존 코드 그대로) ---
  const createStyledInfoWindow = useCallback((content) => {
    return `
      <div class="p-2 bg-white rounded shadow-sm" style="max-width: 350px; white-space: normal; word-break: break-word; box-sizing: border-box;">
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

  // 🆕 지도 범위 검색 함수만 추가
  const searchCurrentMapBounds = useCallback(async () => {
    if (!mapInstance.current) {
      toast.warn("지도가 준비되지 않았습니다.");
      return;
    }

    setIsSearchingBounds(true);

    try {
      // 현재 지도 범위 가져오기
      const bounds = mapInstance.current.getBounds();
      const southWest = bounds.getSouthWest();
      const northEast = bounds.getNorthEast();

      const params = {
        southWestLat: southWest.getLat(),
        northEastLat: northEast.getLat(),
        southWestLng: southWest.getLng(),
        northEastLng: northEast.getLng(),
        limit: 50, // 최대 50개
      };

      // 검색어가 있으면 추가
      if (searchQuery && searchQuery.trim()) {
        params.searchQuery = searchQuery.trim();
      }

      console.log("지도 범위 검색 요청:", params);

      const response = await axios.get("/api/pet_facilities/search/bounds", {
        params,
      });

      const facilities = response.data || [];

      // 부모 컴포넌트로 결과 전달
      if (onBoundsSearch) {
        onBoundsSearch(facilities);
      }
    } catch (error) {
      console.error("지도 범위 검색 실패:", error);
      toast.error("현재 화면 검색에 실패했습니다.");
    } finally {
      setIsSearchingBounds(false);
    }
  }, [searchQuery, onBoundsSearch]);

  const handleGetMyLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          setMyLocation({ lat, lng });
          toast.success("현재 위치를 찾았습니다.");
        },
        (error) => {
          console.error("Geolocation 에러:", error);
          toast.error("위치 정보를 가져올 수 없습니다.");
        },
      );
    } else {
      toast.warn("이 브라우저에서는 위치 정보가 지원되지 않습니다.");
    }
  }, []);

  // --- useEffect 훅: 사이드 이펙트 처리 (기존 코드 그대로) ---

  // 1. 지도 초기화 (최초 1회 실행)
  useEffect(() => {
    const initializeMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        setTimeout(initializeMap, 200);
        return;
      }
      if (!mapContainer.current || mapInstance.current) return;
      try {
        const map = new window.kakao.maps.Map(mapContainer.current, {
          center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
          level: 8,
        });
        mapInstance.current = map;
        setIsMapReady(true);
      } catch (err) {
        console.error("카카오맵 초기화 오류:", err);
        setError("카카오맵 초기화에 실패했습니다.");
      }
    };
    initializeMap();
  }, [setIsMapReady, setError]);

  // 2. 시설/찜 목록 마커 처리
  useEffect(() => {
    if (!mapInstance.current || !isMapReady) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

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
          if (openInfoWindowRef.current) openInfoWindowRef.current.close();

          const initialContent = createInfoWindowContent(
            facility,
            categoryColors,
            null,
          );
          const infowindow = new window.kakao.maps.InfoWindow({
            content: createStyledInfoWindow(initialContent),
            removable: true,
          });

          infowindow.open(mapInstance.current, marker);
          openInfoWindowRef.current = infowindow;
          mapInstance.current.panTo(marker.getPosition());

          try {
            const facilityId = facility.id || facility.facilityId;
            if (!facilityId) return;

            const res = await axios.get(`/api/review/facility/${facilityId}`);

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
            if (err.response && err.response.status === 404) {
              const finalContent = createInfoWindowContent(
                facility,
                categoryColors,
                {
                  reviewCount: 0,
                  averageRating: "평가 없음",
                },
              );
              infowindow.setContent(createStyledInfoWindow(finalContent));
            } else {
              console.error("리뷰 조회 실패:", err);
              const finalContent = createInfoWindowContent(
                facility,
                categoryColors,
                {
                  reviewCount: -1,
                  averageRating: "-",
                },
              );
              infowindow.setContent(createStyledInfoWindow(finalContent));
            }
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
    favoriteMarkers,
    isShowingFavorites,
    isMapReady,
    categoryColors,
    createCustomMarker,
    createStyledInfoWindow,
  ]);

  // 3. 내 위치 마커 처리
  useEffect(() => {
    if (mapInstance.current && myLocation) {
      const { lat, lng } = myLocation;
      const currentPos = new window.kakao.maps.LatLng(lat, lng);

      if (myLocationMarkerRef.current) myLocationMarkerRef.current.setMap(null);

      const circle = new window.kakao.maps.Circle({
        center: currentPos,
        radius: 50,
        strokeWeight: 2,
        strokeColor: "#1E90FF",
        strokeOpacity: 0.8,
        fillColor: "#1E90FF",
        fillOpacity: 0.3,
      });

      circle.setMap(mapInstance.current);
      myLocationMarkerRef.current = circle;

      mapInstance.current.setCenter(currentPos);
      mapInstance.current.setLevel(4, { animate: true });
    }
  }, [myLocation]);

  // --- JSX 렌더링 ---
  return (
    <div ref={mapContainer} className="w-100 h-100 position-relative">
      {isMapReady && (
        <>
          {/* 기존 내 위치 버튼 */}
          <button
            onClick={handleGetMyLocation}
            className="btn btn-light position-absolute shadow"
            style={{ zIndex: 10, top: "10px", left: "10px" }}
            title="내 위치 보기"
          >
            <FaMapMarkerAlt />
          </button>

          {/* 🆕 현재 화면 검색 버튼만 추가 */}
          <button
            onClick={searchCurrentMapBounds}
            disabled={isSearchingBounds}
            className="btn btn-primary position-absolute shadow"
            style={{
              zIndex: 10,
              top: "10px",
              right: "10px",
              fontSize: "12px",
              padding: "8px 12px",
            }}
            title="현재 화면에서 검색"
          >
            {isSearchingBounds ? (
              <span className="spinner-border spinner-border-sm me-1" />
            ) : (
              <FaSearch className="me-1" />
            )}
            현재 화면 검색
          </button>
        </>
      )}
    </div>
  );
};

export default KakaoMapComponent;
