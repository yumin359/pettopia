import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { createInfoWindowContent } from "./MapUtils.jsx";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";
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
  isMapBoundsSearch, // 🆕 지도 범위 검색 모드 상태
  // 🆕 필터 상태들 (지역 제외, 실제 사용하는 것들만)
  selectedCategories2,
  selectedPetSizes,
  parkingFilter,
  facilityType,
  // 🆕 지역 설정 함수들 추가 (optional)
  setSelectedRegion,
  setSelectedSigungu,
}) => {
  // --- Refs: 지도와 관련된 인스턴스 및 요소 참조 ---
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const openInfoWindowRef = useRef(null);
  const myLocationMarkerRef = useRef(null);

  // --- State: 컴포넌트의 상태 관리 ---
  const [myLocation, setMyLocation] = useState(null);
  const [isSearchingBounds, setIsSearchingBounds] = useState(false);

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

  // 🆕 카카오 지역명을 백엔드 지역명으로 매핑하는 함수
  const mapKakaoToBackendRegion = useCallback((kakaoRegion) => {
    if (!kakaoRegion) return null;

    const regionMappings = {
      // 카카오 API 반환값 → 드롭다운 옵션과 일치하도록 수정
      서울특별시: "서울특별시",
      서울시: "서울특별시",
      서울: "서울특별시",
      부산광역시: "부산광역시",
      부산시: "부산광역시",
      부산: "부산광역시",
      대구광역시: "대구광역시",
      대구시: "대구광역시",
      대구: "대구광역시",
      인천광역시: "인천광역시",
      인천시: "인천광역시",
      인천: "인천광역시",
      광주광역시: "광주광역시",
      광주시: "광주광역시",
      광주: "광주광역시",
      대전광역시: "대전광역시",
      대전시: "대전광역시",
      대전: "대전광역시",
      울산광역시: "울산광역시",
      울산시: "울산광역시",
      울산: "울산광역시",
      세종특별자치시: "세종특별자치시",
      세종시: "세종특별자치시",
      세종: "세종특별자치시",
      경기도: "경기도",
      경기: "경기도",
      강원도: "강원특별자치도", // fallbackRegions와 일치
      강원특별자치도: "강원특별자치도",
      강원: "강원특별자치도",
      충청북도: "충청북도",
      충북: "충청북도",
      충청남도: "충청남도",
      충남: "충청남도",
      전라북도: "전북특별자치도", // fallbackRegions와 일치
      전북특별자치도: "전북특별자치도",
      전북: "전북특별자치도",
      전라남도: "전라남도",
      전남: "전라남도",
      경상북도: "경상북도",
      경북: "경상북도",
      경상남도: "경상남도",
      경남: "경상남도",
      제주특별자치도: "제주특별자치도",
      제주도: "제주특별자치도",
      제주시: "제주특별자치도",
      제주: "제주특별자치도",
    };

    // 정확한 매핑이 있으면 사용, 없으면 원본 반환
    return regionMappings[kakaoRegion] || kakaoRegion;
  }, []);

  // 🆕 시군구명 정리 함수
  const cleanSigunguName = useCallback((sigungu) => {
    if (!sigungu) return null;

    // "구", "시", "군" 등이 이미 포함되어 있으면 그대로 반환
    // 필요시 추가 정리 로직 구현
    return sigungu;
  }, []);
  // 🆕 카카오 지오코딩으로 좌표 → 주소 변환 (새로 추가)
  const getAddressFromCoords = useCallback(
    (lat, lng) => {
      return new Promise((resolve) => {
        if (!window.kakao?.maps?.services) {
          resolve({ sido: null, sigungu: null });
          return;
        }

        const geocoder = new window.kakao.maps.services.Geocoder();
        const coord = new window.kakao.maps.LatLng(lat, lng);

        geocoder.coord2Address(
          coord.getLng(),
          coord.getLat(),
          (result, status) => {
            if (status === window.kakao.maps.services.Status.OK && result[0]) {
              const address = result[0].address;
              const rawSido = address.region_1depth_name || null;
              const rawSigungu = address.region_2depth_name || null;

              // 🆕 지역명 매핑 적용
              const mappedSido = mapKakaoToBackendRegion(rawSido);
              const cleanedSigungu = cleanSigunguName(rawSigungu);

              console.log("🗺️ 주소 변환 결과:");
              console.log(
                "  원본 지역:",
                rawSido,
                "→ 매핑된 지역:",
                mappedSido,
              );
              console.log(
                "  원본 시군구:",
                rawSigungu,
                "→ 정리된 시군구:",
                cleanedSigungu,
              );

              resolve({
                sido: mappedSido,
                sigungu: cleanedSigungu,
              });
            } else {
              resolve({ sido: null, sigungu: null });
            }
          },
        );
      });
    },
    [mapKakaoToBackendRegion, cleanSigunguName],
  );

  // 🆕 지도 범위 검색 함수 (기존 함수 개선)
  const searchCurrentMapBounds = useCallback(async () => {
    if (!mapInstance.current) {
      toast.warn("지도가 준비되지 않았습니다.");
      return;
    }

    console.log("🗺️ 현재 화면 검색 시작...");
    setIsSearchingBounds(true);

    try {
      // 현재 지도 범위 가져오기
      const bounds = mapInstance.current.getBounds();
      const southWest = bounds.getSouthWest();
      const northEast = bounds.getNorthEast();

      // 🆕 지도 중심점의 주소 가져오기
      const center = mapInstance.current.getCenter();
      const { sido, sigungu } = await getAddressFromCoords(
        center.getLat(),
        center.getLng(),
      );

      console.log("📍 현재 지도 위치:", { sido, sigungu });

      // 🆕 지역 자동 설정 (순차적으로 처리)
      console.log("🔍 설정하려는 값:");
      console.log("  sido:", sido);
      console.log("  sigungu:", sigungu);

      if (sido && setSelectedRegion) {
        console.log("🔄 지역 설정 시도:", sido);
        setSelectedRegion(sido);
        console.log("✅ setSelectedRegion 호출 완료");

        // 🆕 지역 설정 후 시군구 설정 (딜레이)
        if (sigungu && setSelectedSigungu) {
          setTimeout(() => {
            console.log("🔄 시군구 설정 시도 (딜레이 후):", sigungu);
            setSelectedSigungu(sigungu);
            console.log("✅ setSelectedSigungu 호출 완료 (딜레이 후)");
          }, 100); // 100ms 딜레이
        }
      } else if (sigungu && setSelectedSigungu) {
        // 지역 설정이 없는 경우에만 바로 시군구 설정
        console.log("🔄 시군구 설정 시도:", sigungu);
        setSelectedSigungu(sigungu);
        console.log("✅ setSelectedSigungu 호출 완료");
      }

      // URLSearchParams로 파라미터 구성 (배열 문제 해결)
      const urlParams = new URLSearchParams();

      urlParams.append("southWestLat", southWest.getLat().toString());
      urlParams.append("northEastLat", northEast.getLat().toString());
      urlParams.append("southWestLng", southWest.getLng().toString());
      urlParams.append("northEastLng", northEast.getLng().toString());
      urlParams.append("limit", "100");

      if (searchQuery && searchQuery.trim()) {
        urlParams.append("searchQuery", searchQuery.trim());
      }

      // 🆕 자동 설정된 지역 사용 (우선적으로 적용)
      if (sido) {
        urlParams.append("sidoName", sido);
      }
      if (sigungu) {
        urlParams.append("sigunguName", sigungu);
      }

      // 다른 필터들 적용
      if (selectedCategories2 && selectedCategories2.size > 0) {
        selectedCategories2.forEach((cat) => {
          if (cat !== "전체") {
            urlParams.append("category2", cat);
          }
        });
      }
      if (selectedPetSizes && selectedPetSizes.size > 0) {
        selectedPetSizes.forEach((size) => {
          if (size !== "전체") {
            urlParams.append("allowedPetSize", size);
          }
        });
      }
      if (parkingFilter && parkingFilter !== "전체") {
        urlParams.append("parkingAvailable", parkingFilter);
      }
      if (facilityType === "실내") {
        urlParams.append("indoorFacility", "Y");
      } else if (facilityType === "실외") {
        urlParams.append("outdoorFacility", "Y");
      }

      console.log("📡 API 요청 파라미터:", Object.fromEntries(urlParams));

      // API 호출
      let response;
      try {
        response = await axios.get(
          "/api/pet_facilities/search/bounds/filtered",
          {
            params: urlParams,
          },
        );
        console.log("✅ 필터 적용된 범위 검색 성공");
      } catch (error) {
        if (error.response?.status === 404) {
          console.log("⚠️ 필터 API가 없어서 기본 범위 검색 사용");
          // 기본 파라미터만으로 재시도
          const basicParams = {
            southWestLat: southWest.getLat(),
            northEastLat: northEast.getLat(),
            southWestLng: southWest.getLng(),
            northEastLng: northEast.getLng(),
            limit: 100,
          };
          if (searchQuery && searchQuery.trim()) {
            basicParams.searchQuery = searchQuery.trim();
          }
          response = await axios.get("/api/pet_facilities/search/bounds", {
            params: basicParams,
          });
        } else {
          throw error;
        }
      }

      const facilities = response.data || [];
      console.log("✅ 검색 결과:", facilities.length + "개");

      // 부모 컴포넌트로 결과 전달
      if (onBoundsSearch) {
        onBoundsSearch(facilities, { sido, sigungu }); // 지역 정보도 함께 전달
      }

      // 토스트 메시지
      const locationText =
        sido && sigungu ? `${sido} ${sigungu}` : sido || "현재 화면";
      toast.success(
        `${locationText}에서 ${facilities.length}개 시설을 찾았습니다!`,
      );
    } catch (error) {
      console.error("❌ 지도 범위 검색 실패:", error);
      toast.error("현재 화면 검색에 실패했습니다.");
    } finally {
      setIsSearchingBounds(false);
    }
  }, [
    searchQuery,
    onBoundsSearch,
    selectedCategories2,
    selectedPetSizes,
    parkingFilter,
    facilityType,
    getAddressFromCoords,
    setSelectedRegion,
    setSelectedSigungu,
  ]);

  const handleGetMyLocation = useCallback(async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          setMyLocation({ lat, lng });

          // 🆕 내 위치의 주소도 자동으로 필터에 설정
          try {
            const { sido, sigungu } = await getAddressFromCoords(lat, lng);
            console.log("📍 내 위치:", { sido, sigungu });

            if (sido && setSelectedRegion) {
              console.log("🔄 내 위치 지역 설정:", sido);
              setSelectedRegion(sido);

              // 🆕 지역 설정 후 시군구 설정 (딜레이)
              if (sigungu && setSelectedSigungu) {
                setTimeout(() => {
                  console.log("🔄 내 위치 시군구 설정 (딜레이 후):", sigungu);
                  setSelectedSigungu(sigungu);
                }, 100);
              }
            } else if (sigungu && setSelectedSigungu) {
              console.log("🔄 내 위치 시군구 설정:", sigungu);
              setSelectedSigungu(sigungu);
            }

            const locationText =
              sido && sigungu ? `${sido} ${sigungu}` : "현재 위치";
            toast.success(`${locationText}로 이동했습니다.`);
          } catch (error) {
            console.error("주소 변환 실패:", error);
            toast.success("현재 위치를 찾았습니다.");
          }
        },
        (error) => {
          console.error("Geolocation 에러:", error);
          toast.error("위치 정보를 가져올 수 없습니다.");
        },
      );
    } else {
      toast.warn("이 브라우저에서는 위치 정보가 지원되지 않습니다.");
    }
  }, [getAddressFromCoords, setSelectedRegion, setSelectedSigungu]);

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
          {/* 🆕 상단 알림 메시지 (지도 범위 검색 모드일 때) */}
          {isMapBoundsSearch && (
            <div
              className="position-absolute alert alert-success shadow"
              style={{
                zIndex: 10,
                top: "10px",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "11px",
                padding: "8px 12px",
                margin: 0,
                maxWidth: "400px",
                textAlign: "center",
              }}
            >
              📍 현재 화면 기준 검색 결과입니다. 다른 지역을 보려면 지도 이동 후
              "현재 화면 검색"을 다시 눌러주세요.
            </div>
          )}

          {/* 좌측 하단 - 내 위치 버튼 */}
          <button
            onClick={handleGetMyLocation}
            className="btn btn-light position-absolute shadow"
            style={{ zIndex: 10, bottom: "20px", left: "10px" }}
            title="내 위치 보기"
          >
            <FaMapMarkerAlt />
          </button>

          {/* 우측 하단 - 현재 화면 검색 버튼 */}
          <button
            onClick={searchCurrentMapBounds}
            disabled={isSearchingBounds}
            className="btn btn-primary position-absolute shadow"
            style={{
              zIndex: 10,
              bottom: "20px",
              right: "10px",
              fontSize: "12px",
              padding: "8px 12px",
            }}
            title="현재 화면에서 검색 (지역 자동 설정)"
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
