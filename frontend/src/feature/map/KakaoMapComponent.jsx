// src/feature/map/KakaoMapComponent.js
import React, { useEffect, useRef, useCallback } from "react";
import {
  FaHospital,
  FaHome,
  FaHotel,
  FaCoffee,
  FaUtensils,
  FaMapMarkerAlt,
  FaShoppingBag,
  FaCut,
  FaTree,
  FaCamera,
  FaSwimmingPool,
  FaCar,
  FaDog,
  FaStethoscope,
  FaBed,
  FaGamepad,
  FaGlobe,
  FaStore,
  FaWalking,
  FaMountain,
  FaUmbrella,
  FaBirthdayCake,
} from "react-icons/fa";
import {
  MdLocalHospital,
  MdRestaurant,
  MdLocalCafe,
  MdHotel,
  MdPark,
  MdShopping,
  MdPets,
  MdMuseum,
  MdBeachAccess,
  MdPool,
  MdLocalParking,
} from "react-icons/md";
import {
  IoRestaurant,
  IoHome,
  IoBed,
  IoStorefront,
  IoLeaf,
  IoCamera,
  IoGameController,
} from "react-icons/io5";
import { ReactDOM } from "react";

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

  // 카테고리별 React 아이콘 매핑
  const getCategoryIcon = useCallback((facility) => {
    const category = facility.category2 || facility.category1 || "";

    // 카테고리별 React Icons 정의
    if (category.includes("동물병원") || category.includes("병원"))
      return FaHospital;
    if (category.includes("응급의료") || category.includes("의료"))
      return MdLocalHospital;
    if (category.includes("수의") || category.includes("진료"))
      return FaStethoscope;

    if (category.includes("펜션") || category.includes("민박")) return FaHome;
    if (category.includes("숙박") || category.includes("호텔")) return MdHotel;
    if (category.includes("리조트")) return FaBed;
    if (category.includes("글램핑") || category.includes("캠핑"))
      return FaUmbrella;

    if (category.includes("음식점") || category.includes("식당"))
      return IoRestaurant;
    if (category.includes("카페") || category.includes("커피"))
      return MdLocalCafe;
    if (category.includes("레스토랑") || category.includes("맛집"))
      return FaUtensils;
    if (category.includes("베이커리") || category.includes("제과"))
      return FaBirthdayCake;

    if (category.includes("관광지") || category.includes("명소"))
      return FaCamera;
    if (category.includes("박물관")) return MdMuseum;
    if (category.includes("공원") || category.includes("산책")) return MdPark;
    if (category.includes("테마파크") || category.includes("놀이"))
      return FaGamepad;
    if (category.includes("해변") || category.includes("바다"))
      return MdBeachAccess;

    if (category.includes("쇼핑") || category.includes("마트"))
      return FaShoppingBag;
    if (category.includes("펫샵") || category.includes("애완")) return MdPets;
    if (category.includes("미용") || category.includes("샵")) return FaCut;
    if (category.includes("매장") || category.includes("상점"))
      return IoStorefront;

    if (category.includes("체험") || category.includes("액티비티"))
      return IoGameController;
    if (category.includes("수영장") || category.includes("워터")) return MdPool;
    if (category.includes("산") || category.includes("등반")) return FaMountain;
    if (category.includes("산책로") || category.includes("트레일"))
      return FaWalking;

    return FaMapMarkerAlt; // 기본 아이콘
  }, []);

  // React 아이콘을 SVG 문자열로 변환하는 함수
  const iconToSVG = useCallback(
    (IconComponent, color = "#000000", size = 16) => {
      // React 아이콘을 SVG 문자열로 변환
      // 각 아이콘별로 실제 SVG path를 매핑
      const iconPaths = {
        [FaHospital]:
          "M8 0a8 8 0 100 16A8 8 0 008 0zm.5 4.5a.5.5 0 00-1 0v3h-3a.5.5 0 000 1h3v3a.5.5 0 001 0v-3h3a.5.5 0 000-1h-3v-3z",
        [FaHome]:
          "M8.354 1.146a.5.5 0 00-.708 0l-6 6A.5.5 0 001.5 7.5v7a.5.5 0 00.5.5h4.5a.5.5 0 00.5-.5v-4h2v4a.5.5 0 00.5.5H14a.5.5 0 00.5-.5v-7a.5.5 0 00-.146-.354L8.354 1.146z",
        [MdHotel]:
          "M1 11a1 1 0 011-1h2a1 1 0 011 1v3a1 1 0 01-1 1H2a1 1 0 01-1-1v-3zM7.5 4a.5.5 0 01.5.5v7a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-7a.5.5 0 01.5-.5h1zm2.5.5a.5.5 0 00-1 0v.5a.5.5 0 001 0v-.5zm0 2a.5.5 0 00-1 0v.5a.5.5 0 001 0v-.5zm0 2a.5.5 0 00-1 0v.5a.5.5 0 001 0v-.5z",
        [MdLocalCafe]:
          "M3 2a1 1 0 00-1 1v8a2 2 0 002 2h6a2 2 0 002-2V6h1a1 1 0 001-1V3a1 1 0 00-1-1h-1V1a1 1 0 00-1-1H4a1 1 0 00-1 1v1H3z",
        [IoRestaurant]:
          "M8.5 5.5a2.5 2.5 0 115 0 .5.5 0 01-1 0 1.5 1.5 0 10-3 0v6a.5.5 0 01-1 0v-6zM3 3.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5V9a1 1 0 01-2 0V3.5zM2.5 3a.5.5 0 000 1h.5v5a2 2 0 104 0V4h.5a.5.5 0 000-1h-5z",
        [FaUtensils]:
          "M2.5 1a.5.5 0 00-.5.5v1a.5.5 0 001 0V2a.5.5 0 00-.5-.5zM3 2.5a.5.5 0 01.5-.5h1a.5.5 0 010 1h-1a.5.5 0 01-.5-.5zM3.5 3a.5.5 0 000 1h1a.5.5 0 000-1h-1z",
        [FaCamera]:
          "M15 12a1 1 0 01-1 1H2a1 1 0 01-1-1V6a1 1 0 011-1h1.172a3 3 0 002.828-2h2a3 3 0 002.828 2H14a1 1 0 011 1v6zM8 7a2.5 2.5 0 100 5 2.5 2.5 0 000-5z",
        [MdPark]:
          "M5.5 7a3.5 3.5 0 104.596 1.06L9.5 8.5l.839.894a2.5 2.5 0 11-3.233 3.233L8 12.5l-.894-.839A3.5 3.5 0 015.5 7z",
        [FaShoppingBag]:
          "M8 1a2.5 2.5 0 012.5 2.5V4h-5v-.5A2.5 2.5 0 018 1zm3.5 3v-.5a3.5 3.5 0 10-7 0V4H1v10a2 2 0 002 2h10a2 2 0 002-2V4h-3.5z",
        [MdPets]:
          "M4.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm7-1.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM8 6.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm1.5 6.5a2 2 0 114 0c0 .5-.5.5-.5.5s-.5 0-.5-.5a1 1 0 00-2 0c0 .5-.5.5-.5.5s-.5 0-.5-.5z",
        [FaMapMarkerAlt]: "M8 16s6-5.686 6-10A6 6 0 002 6c0 4.314 6 10 6 10z",
      };

      const path = iconPaths[IconComponent] || iconPaths[FaMapMarkerAlt];

      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="${color}">
      <path d="${path}"/>
    </svg>`;
    },
    [],
  );

  // 카테고리별 색상과 아이콘을 함께 반환
  const getCategoryStyle = useCallback(
    (facility) => {
      const color =
        categoryColors[facility.category1] ||
        categoryColors[facility.category2] ||
        "#6366f1";
      const IconComponent = getCategoryIcon(facility);
      return { color, IconComponent };
    },
    [categoryColors, getCategoryIcon],
  );

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

  // React Icons를 활용한 현대적인 마커 생성
  const createCustomMarker = useCallback(
    (position, facility) => {
      const { color, IconComponent } = getCategoryStyle(facility);
      const shortName =
        facility.name.length > 10
          ? facility.name.substring(0, 10) + "..."
          : facility.name;

      const markerWidth = 100;
      const markerHeight = 50;
      const mainHeight = 36;
      const borderRadius = 18;
      const iconSize = 16;

      // React 아이콘을 SVG로 변환
      const iconSVG = iconToSVG(IconComponent, "white", iconSize);

      const markerSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${markerWidth}" height="${markerHeight}" viewBox="0 0 ${markerWidth} ${markerHeight}">
          <defs>
            <!-- 메인 그라데이션 -->
            <linearGradient id="mainGrad_${facility.id}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${color};stop-opacity:0.85" />
            </linearGradient>
            
            <!-- 아이콘 배경 그라데이션 -->
            <radialGradient id="iconBg_${facility.id}" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style="stop-color:rgba(255,255,255,0.3);stop-opacity:1" />
              <stop offset="100%" style="stop-color:rgba(255,255,255,0.1);stop-opacity:1" />
            </radialGradient>
            
            <!-- 드롭 섀도우 -->
            <filter id="shadow_${facility.id}" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="rgba(0,0,0,0.25)"/>
            </filter>
            
            <!-- 인너 섀도우 효과 -->
            <filter id="innerShadow_${facility.id}">
              <feOffset dx="0" dy="1"/>
              <feGaussianBlur stdDeviation="1" result="offset-blur"/>
              <feFlood flood-color="rgba(0,0,0,0.1)"/>
              <feComposite in2="offset-blur" operator="in"/>
            </filter>
          </defs>
          
          <!-- 메인 배경 -->
          <rect x="3" y="3" 
                width="${markerWidth - 6}" 
                height="${mainHeight}" 
                rx="${borderRadius}" 
                ry="${borderRadius}" 
                fill="url(#mainGrad_${facility.id})" 
                stroke="white" 
                stroke-width="2"
                filter="url(#shadow_${facility.id})"/>
          
          <!-- 포인터 -->
          <path d="M${markerWidth / 2} ${markerHeight - 3} L${markerWidth / 2 - 8} ${mainHeight + 3} L${markerWidth / 2 + 8} ${mainHeight + 3} Z" 
                fill="url(#mainGrad_${facility.id})" 
                stroke="white" 
                stroke-width="2" 
                stroke-linejoin="round"
                filter="url(#shadow_${facility.id})"/>
          
          <!-- 아이콘 배경 원 -->
          <circle cx="24" cy="${mainHeight / 2 + 3}" r="14" 
                  fill="url(#iconBg_${facility.id})" 
                  stroke="rgba(255,255,255,0.3)" 
                  stroke-width="1"/>
          
          <!-- React 아이콘 -->
          <g transform="translate(${24 - iconSize / 2}, ${mainHeight / 2 + 3 - iconSize / 2})">
            ${iconSVG}
          </g>
          
          <!-- 텍스트 -->
          <text x="45" y="${mainHeight / 2 + 7}" 
                font-family="'SF Pro Display', 'Pretendard', -apple-system, sans-serif" 
                font-size="10" 
                font-weight="600" 
                fill="white" 
                text-shadow="0 1px 2px rgba(0,0,0,0.3)">
            ${shortName}
          </text>
          
          <!-- 하이라이트 효과 -->
          <rect x="3" y="3" 
                width="${markerWidth - 6}" 
                height="2" 
                rx="${borderRadius}" 
                ry="1" 
                fill="rgba(255,255,255,0.4)"/>
        </svg>
      `;

      const markerImage = new window.kakao.maps.MarkerImage(
        `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markerSvg)}`,
        new window.kakao.maps.Size(markerWidth, markerHeight),
        {
          offset: new window.kakao.maps.Point(
            markerWidth / 2,
            markerHeight - 3,
          ),
        },
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
    [getCategoryStyle, iconToSVG],
  );

  // 정보창 내용 생성 (React 아이콘 포함)
  const createInfoWindowContent = useCallback(
    (facility) => {
      const { color, IconComponent } = getCategoryStyle(facility);
      const iconSVG = iconToSVG(IconComponent, color, 20);

      return `
      <div class="card border-0 shadow-lg" style="width: 260px; font-size: 12px; border-radius: 12px; overflow: hidden;">
        <div class="card-body p-3">
          <div class="d-flex align-items-center mb-3">
            <div class="d-flex align-items-center justify-content-center rounded-circle me-3" 
                 style="width: 40px; height: 40px; background: linear-gradient(135deg, ${color}20, ${color}10);">
              ${iconSVG}
            </div>
            <div class="flex-grow-1">
              <h6 class="card-title mb-1" style="font-size: 14px; font-weight: 700; color: #1a1a1a;">
                ${facility.name || "이름 없음"}
              </h6>
              <span class="badge rounded-pill" style="background: ${color}; font-size: 9px; padding: 4px 8px;">
                ${facility.category2 || facility.category1 || ""}
              </span>
            </div>
          </div>
          
          <div class="info-items">
            <div class="mb-2 d-flex align-items-start">
              <span class="me-2" style="color: #6b7280; font-size: 14px;">📍</span>
              <span class="text-muted" style="font-size: 11px; line-height: 1.4;">
                ${facility.roadAddress || facility.jibunAddress || "주소 정보 없음"}
              </span>
            </div>
            
            ${
              facility.phoneNumber
                ? `
            <div class="mb-2 d-flex align-items-center">
              <span class="me-2" style="color: #3b82f6; font-size: 14px;">📞</span>
              <span style="color: #3b82f6; font-size: 11px; font-weight: 500;">
                ${facility.phoneNumber}
              </span>
            </div>`
                : ""
            }
            
            ${
              facility.allowedPetSize
                ? `
            <div class="mb-2 d-flex align-items-center">
              <span class="me-2" style="color: #10b981; font-size: 14px;">🐕</span>
              <span style="color: #10b981; font-size: 11px; font-weight: 500;">
                ${facility.allowedPetSize}
              </span>
            </div>`
                : ""
            }
            
            ${
              facility.parkingAvailable === "Y"
                ? `
            <div class="mb-2 d-flex align-items-center">
              <span class="me-2" style="color: #8b5cf6; font-size: 14px;">🅿️</span>
              <span style="color: #8b5cf6; font-size: 11px; font-weight: 500;">
                주차가능
              </span>
            </div>`
                : ""
            }
            
            ${
              facility.operatingHours
                ? `
            <div class="mb-2 d-flex align-items-start">
              <span class="me-2" style="color: #f59e0b; font-size: 14px;">⏰</span>
              <span style="color: #6b7280; font-size: 11px; line-height: 1.4;">
                ${facility.operatingHours}
              </span>
            </div>`
                : ""
            }
            
            ${
              facility.holiday
                ? `
            <div class="mb-2 d-flex align-items-start">
              <span class="me-2" style="color: #6b7280; font-size: 14px;">🗓️</span>
              <span style="color: #6b7280; font-size: 11px;">
                휴무: ${facility.holiday}
              </span>
            </div>`
                : ""
            }
            
            ${
              facility.petRestrictions
                ? `
            <div class="mb-1 d-flex align-items-start">
              <span class="me-2" style="color: #ef4444; font-size: 14px;">🚫</span>
              <span style="color: #ef4444; font-size: 11px; line-height: 1.4;">
                ${facility.petRestrictions}
              </span>
            </div>`
                : ""
            }
          </div>
        </div>
      </div>
    `;
    },
    [getCategoryStyle, iconToSVG],
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
              content: createInfoWindowContent(facility),
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
          markersRef.current.forEach((m) => {
            if (m.infowindow && m.infowindow.getMap()) m.infowindow.close();
          });

          if (!marker.infowindow) {
            marker.infowindow = new window.kakao.maps.InfoWindow({
              content: createInfoWindowContent(facility),
              removable: true,
            });
          }
          marker.infowindow.open(mapInstance.current, marker);

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

    if (markersRef.current.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds();
      markersRef.current.forEach((marker) => {
        bounds.extend(marker.getPosition());
      });
      mapInstance.current.setBounds(bounds);
    }
  }, [facilities, isMapReady, createCustomMarker, createInfoWindowContent]);

  // 리스트에서 클릭된 시설로 지도 이동
  useEffect(() => {
    if (handleListItemClick && mapInstance.current) {
      const handleExternalClick = (facility) => {
        const targetMarker = markersRef.current.find(
          (marker) => marker.facilityId === facility.id,
        );

        if (targetMarker) {
          const moveLatLon = new window.kakao.maps.LatLng(
            facility.latitude,
            facility.longitude,
          );
          mapInstance.current.setCenter(moveLatLon);
          mapInstance.current.setLevel(3);

          markersRef.current.forEach((m) => {
            if (m.infowindow && m.infowindow.getMap()) m.infowindow.close();
          });

          if (!targetMarker.infowindow) {
            targetMarker.infowindow = new window.kakao.maps.InfoWindow({
              content: createInfoWindowContent(facility),
              removable: true,
            });
          }
          targetMarker.infowindow.open(mapInstance.current, targetMarker);
        }
      };

      window.handleMapFacilityClick = handleExternalClick;
    }
  }, [handleListItemClick, createInfoWindowContent]);

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

      {/* 고급스러운 범례 */}
      {isMapReady && facilities && facilities.length > 0 && (
        <div
          className="position-absolute bottom-0 end-0 p-3 m-3 bg-white rounded-3 shadow-lg border-0"
          style={{
            maxWidth: "200px",
            zIndex: 1000,
            backdropFilter: "blur(10px)",
          }}
        >
          <h6
            className="mb-3 text-dark fw-bold"
            style={{ fontSize: "12px", letterSpacing: "0.5px" }}
          >
            카테고리
          </h6>
          <div className="d-flex flex-column gap-2">
            {Object.entries(categoryColors)
              .filter(([category]) =>
                facilities.some(
                  (f) => f.category2 === category || f.category1 === category,
                ),
              )
              .map(([category, color]) => {
                const sampleFacility = facilities.find(
                  (f) => f.category2 === category || f.category1 === category,
                );
                const IconComponent = sampleFacility
                  ? getCategoryIcon(sampleFacility)
                  : FaMapMarkerAlt;
                const iconSVG = iconToSVG(IconComponent, color, 16);

                return (
                  <div
                    key={category}
                    className="d-flex align-items-center p-2 rounded-2"
                    style={{
                      backgroundColor: `${color}08`,
                      border: `1px solid ${color}20`,
                    }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle me-3"
                      style={{
                        width: "28px",
                        height: "28px",
                        backgroundColor: `${color}15`,
                      }}
                    >
                      <div dangerouslySetInnerHTML={{ __html: iconSVG }} />
                    </div>
                    <span
                      className="text-dark fw-medium"
                      style={{ fontSize: "11px" }}
                    >
                      {category}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default KakaoMapComponent;
