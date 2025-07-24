import React, { useEffect, useRef, useState, useCallback } from "react";

const ITEMS_PER_PAGE = 10; // 페이지당 표시할 항목 수

const FullFilterKakaoMap = () => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]); // 현재 지도에 있는 마커들을 관리

  const [error, setError] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false); // 맵 초기화 완료 상태
  const [isDataLoading, setIsDataLoading] = useState(false); // 데이터 로딩 중 상태

  const [facilities, setFacilities] = useState([]); // 현재 페이지의 시설 데이터
  const [totalElements, setTotalElements] = useState(0); // 총 시설 개수
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 (0-indexed)

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

  // 필터 옵션들 (초기 로딩 시에만 변경)
  const [regions, setRegions] = useState([]);
  const [sigungus, setSigungus] = useState([]);
  const [categories1, setCategories1] = useState([]);
  const [categories2, setCategories2] = useState([]);
  const [petSizes, setPetSizes] = useState([]);

  // 카테고리별 색상 매핑 (상수이므로 useCallback 의존성에 넣을 필요 없음)
  const categoryColors = {
    숙박: "#FF6B6B",
    음식점: "#4ECDC4",
    문화시설: "#45B7D1",
    반려동물용품: "#96CEB4",
    의료시설: "#FFEAA7",
    체험활동: "#A8E6CF",
    기타: "#DDA0DD",
  };

  // 1. 카카오맵 초기화 (컴포넌트 마운트 시 한 번만 실행)
  useEffect(() => {
    const initializeMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        // Kakao Maps API 스크립트 로드가 완료되지 않았으면 재시도
        setTimeout(initializeMap, 200);
        return;
      }

      if (!mapContainer.current || mapInstance.current) {
        // 이미 맵이 초기화되었거나 컨테이너가 없으면 종료
        if (mapInstance.current) setIsMapReady(true);
        return;
      }

      try {
        const options = {
          center: new window.kakao.maps.LatLng(37.566826, 126.9786567), // 서울 시청
          level: 8, // 확대 레벨
        };
        mapInstance.current = new window.kakao.maps.Map(
          mapContainer.current,
          options,
        );
        setIsMapReady(true); // 맵 초기화 완료
      } catch (err) {
        console.error("카카오맵 초기화 오류:", err);
        setError("카카오맵 초기화에 실패했습니다.");
        setIsMapReady(false);
      }
    };

    initializeMap();
  }, []); // 빈 의존성 배열: 컴포넌트 마운트 시 한 번만 실행

  // 2. 필터 옵션들 로드 (컴포넌트 마운트 시 한 번만 실행)
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
        // API 호출 실패 시 기본값 (개발용)
        setRegions(["전체", "서울특별시", "부산광역시", "인천광역시"]);
        setCategories1(["전체", "숙박", "음식점", "문화시설"]);
        setCategories2(["전체", "펜션", "카페", "박물관"]);
        setPetSizes(["전체", "소형", "중형", "대형"]);
        setSigungus(["전체"]);
      }
    };
    loadFilterOptions();
  }, []);

  // 3. 체크박스/라디오 버튼 핸들러 (공통 함수)
  const handleSetFilter = (currentSet, setFunction) => (value) => {
    const newSet = new Set(currentSet);

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
    setCurrentPage(0); // 필터 변경 시 첫 페이지로 이동
  };

  // 4. 커스텀 마커 생성 (useCallback으로 불필요한 재생성 방지)
  const createCustomMarker = useCallback(
    (position, category, facilityName, facilityId) => {
      const color = categoryColors[category] || "#666666"; // 기본 회색

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
        { offset: new window.kakao.maps.Point(30, 36) },
      );

      const marker = new window.kakao.maps.Marker({
        position: position,
        image: markerImage,
        title: facilityName,
      });
      marker.facilityId = facilityId; // 마커 객체에 facilityId 직접 추가

      // 정보창을 마커 객체에 직접 속성으로 저장하여 관리
      marker.infowindow = null;

      return marker;
    },
    [],
  ); // categoryColors는 상수이므로 의존성 배열에서 제거

  // 5. 복합 필터링을 위한 쿼리 파라미터 빌드 (useCallback으로 불필요한 재생성 방지)
  const buildFilterQuery = useCallback(() => {
    const params = new URLSearchParams();

    if (selectedRegion !== "전체") params.append("sidoName", selectedRegion);
    if (selectedSigungu !== "전체")
      params.append("sigunguName", selectedSigungu);
    if (parkingFilter !== "전체")
      params.append("parkingAvailable", parkingFilter);

    if (facilityType === "실내") {
      params.append("indoorFacility", "Y");
    } else if (facilityType === "실외") {
      params.append("outdoorFacility", "Y");
    }

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

    params.append("page", currentPage.toString());
    params.append("size", ITEMS_PER_PAGE.toString()); // ITEMS_PER_PAGE는 상수

    return params.toString();
  }, [
    selectedRegion,
    selectedSigungu,
    selectedCategories1,
    selectedCategories2,
    selectedPetSizes,
    parkingFilter,
    facilityType,
    currentPage,
  ]);

  // 6. 데이터 로드 및 마커 표시 (useCallback으로 불필요한 재생성 방지)
  const loadFacilities = useCallback(async () => {
    if (!mapInstance.current || !isMapReady) {
      // 맵이 준비되지 않았으면 데이터 로드 시도하지 않음
      return;
    }

    setIsDataLoading(true); // 데이터 로딩 시작

    try {
      const query = buildFilterQuery(); // 쿼리 빌드
      const url = `http://localhost:8080/api/pet_facilities/search?${query}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const pageResult = await response.json();

      setFacilities(pageResult.content);
      setTotalElements(pageResult.totalElements);

      const currentMarkers = markersRef.current;
      const newFacilityIds = new Set(pageResult.content.map((f) => f.id));
      const updatedMarkers = [];
      const markersToRemove = [];

      // 1. 기존 마커 중 유지할 것과 제거할 것 분류
      currentMarkers.forEach((marker) => {
        if (newFacilityIds.has(marker.facilityId)) {
          updatedMarkers.push(marker); // 새 데이터에도 있는 마커는 유지
          marker.setMap(mapInstance.current); // 혹시 지도에서 제거되었다면 다시 추가 (이론상 필요 없지만 안전장치)
          newFacilityIds.delete(marker.facilityId); // 처리된 새 시설 ID 제거
        } else {
          markersToRemove.push(marker); // 새 데이터에 없는 마커는 제거 대상
        }
      });

      // 2. 제거할 마커 실제로 지도에서 제거
      markersToRemove.forEach((marker) => {
        if (marker.infowindow) {
          // 열려있는 정보창이 있다면 닫기
          marker.infowindow.close();
        }
        marker.setMap(null);
      });

      // 3. 새롭게 추가해야 할 시설에 대한 마커 생성
      const newlyAddedMarkers = [];
      pageResult.content.forEach((facility) => {
        // newFacilityIds에 남아있는 ID는 새로운 시설이므로 마커 생성
        if (newFacilityIds.has(facility.id)) {
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
            newlyAddedMarkers.push(marker);

            // 정보창 이벤트 리스너 추가 (마커 객체에 infowindow를 저장하도록 수정)
            window.kakao.maps.event.addListener(marker, "click", () => {
              // 모든 정보창 닫기 (이전 마커의 정보창 포함)
              markersRef.current.forEach((m) => {
                if (m.infowindow && m.infowindow.getMap()) {
                  m.infowindow.close();
                }
              });

              // 현재 마커의 정보창이 없으면 새로 생성
              if (!marker.infowindow) {
                const infowindowContent = `
                              <div class="card shadow-sm p-2" style="width: 250px;">
                                  <h6 class="card-title text-primary mb-1">${facility.name || "이름 없음"}
                                      <span class="badge" style="background-color:${categoryColors[facility.category1] || "#6c757d"}; margin-left:5px;">
                                          ${facility.category1 || ""}
                                      </span>
                                  </h6>
                                  <p class="card-text text-muted mb-1 small">${facility.category2 || ""} ${facility.category3 ? `&gt; ${facility.category3}` : ""}</p>
                                  <p class="card-text mb-1 small">${facility.roadAddress || facility.jibunAddress || "주소 정보 없음"}</p>
                                  ${facility.phoneNumber ? `<p class="card-text text-info mb-1 small">📞 ${facility.phoneNumber}</p>` : ""}
                                  ${facility.allowedPetSize ? `<p class="card-text text-success mb-1 small">🐕 ${facility.allowedPetSize}</p>` : ""}
                                  ${facility.parkingAvailable === "Y" ? `<p class="card-text text-secondary mb-0 small">🅿️ 주차가능</p>` : ""}
                              </div>
                          `;
                marker.infowindow = new window.kakao.maps.InfoWindow({
                  content: infowindowContent,
                  removable: true,
                });
              }
              // 정보창 열기
              marker.infowindow.open(mapInstance.current, marker);
            });
          }
        }
      });

      // 4. markersRef.current 업데이트: 유지된 마커와 새로 추가된 마커들을 병합
      markersRef.current = [...updatedMarkers, ...newlyAddedMarkers];

      // 5. 지도 범위 재설정 (깜빡임의 주 원인이므로 신중하게 적용)
      if (markersRef.current.length > 0) {
        const bounds = new window.kakao.maps.LatLngBounds();
        markersRef.current.forEach((marker) => {
          bounds.extend(marker.getPosition());
        });
        mapInstance.current.setBounds(bounds);
      } else {
        // 표시할 마커가 없는 경우 기본 중심점으로 이동
        mapInstance.current.setCenter(
          new window.kakao.maps.LatLng(37.566826, 126.9786567),
        ); // 서울 시청
        mapInstance.current.setLevel(8);
      }
    } catch (err) {
      console.error("데이터 로드 오류:", err);
      setError("데이터를 가져오는데 실패했습니다.");
    } finally {
      setIsDataLoading(false); // 데이터 로딩 종료
    }
  }, [
    isMapReady, // 맵이 준비되었을 때만 호출되도록
    buildFilterQuery, // 쿼리 빌드 함수가 변경될 때 (즉, 필터가 변경될 때)
    createCustomMarker, // 마커 생성 함수가 변경될 때 (거의 변경되지 않음)
  ]);

  // 7. 필터 및 페이지 변경시 데이터 다시 로드
  useEffect(() => {
    if (isMapReady) {
      // 맵 초기화가 완료된 후에만 데이터 로드 시작
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
    currentPage,
    isMapReady, // 맵 준비 상태가 true로 바뀔 때도 loadFacilities 호출
    loadFacilities, // loadFacilities 함수 자체가 변경될 때 (내부 의존성 변경 시)
  ]);

  // 8. 체크박스 그룹 렌더 함수
  const renderCheckboxGroup = (
    title,
    options,
    selectedSet,
    setFunction,
    emoji,
  ) => (
    <div className="mb-4">
      <h4 className="text-secondary mb-3">
        {emoji} {title}
      </h4>
      <div className="d-flex flex-wrap gap-2">
        {options.map((option) => {
          const isChecked = selectedSet.has(option);
          const bgColor =
            option === "전체" ? "#6c757d" : categoryColors[option] || "#0d6efd";

          return (
            <label
              key={option}
              className={`btn ${
                isChecked ? "text-white" : "btn-outline-secondary"
              } btn-sm rounded-pill d-flex align-items-center`}
              style={{
                backgroundColor: isChecked ? bgColor : "white",
                borderColor: bgColor,
                transition: "all 0.2s ease",
                boxShadow: isChecked
                  ? `0 2px 4px rgba(0,0,0,0.2)`
                  : `0 1px 2px rgba(0,0,0,0.1)`,
                color: isChecked ? "white" : bgColor,
              }}
            >
              <input
                type="checkbox"
                className="btn-check"
                checked={isChecked}
                onChange={() =>
                  handleSetFilter(selectedSet, setFunction)(option)
                }
                autoComplete="off"
              />
              <span className="me-1">{isChecked ? "✓" : "○"}</span>
              {option}
            </label>
          );
        })}
      </div>
    </div>
  );

  // 9. 페이지네이션 컴포넌트
  const totalPages = Math.ceil(totalElements / ITEMS_PER_PAGE);
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    let startPage = Math.max(0, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);

    if (endPage - startPage < 4) {
      if (currentPage - startPage < 2) {
        endPage = Math.min(totalPages - 1, startPage + 4);
      }
      if (endPage - currentPage < 2) {
        startPage = Math.max(0, endPage - 4);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav aria-label="Page navigation">
        <ul className="pagination pagination-sm justify-content-center mt-3">
          <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
            <a
              className="page-link"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage - 1);
              }}
            >
              이전
            </a>
          </li>
          {pageNumbers.map((num) => (
            <li
              key={num}
              className={`page-item ${currentPage === num ? "active" : ""}`}
            >
              <a
                className="page-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(num);
                }}
              >
                {num + 1}
              </a>
            </li>
          ))}
          <li
            className={`page-item ${
              currentPage === totalPages - 1 ? "disabled" : ""
            }`}
          >
            <a
              className="page-link"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage + 1);
              }}
            >
              다음
            </a>
          </li>
        </ul>
      </nav>
    );
  };

  // 10. 리스트 아이템 클릭 시 지도 이동 및 정보창 열기
  const handleListItemClick = useCallback((facility) => {
    if (!mapInstance.current || !facility.latitude || !facility.longitude)
      return;

    const moveLatLon = new window.kakao.maps.LatLng(
      facility.latitude,
      facility.longitude,
    );

    mapInstance.current.panTo(moveLatLon); // 부드럽게 이동

    const targetMarker = markersRef.current.find(
      (m) => m.facilityId === facility.id,
    );
    if (targetMarker) {
      // 모든 정보창 닫기 (새로운 정보창 열기 전에)
      markersRef.current.forEach((m) => {
        if (m.infowindow && m.infowindow.getMap()) {
          m.infowindow.close();
        }
      });
      // 해당 마커의 클릭 이벤트 트리거 (정보창 열기 로직 재사용)
      window.kakao.maps.event.trigger(targetMarker, "click");
    }
  }, []);

  // 에러 발생 시 전체 화면 오류 메시지
  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div
          className="alert alert-danger text-center shadow-lg p-5 rounded-3"
          role="alert"
        >
          <h3 className="alert-heading text-danger mb-4">🚨 오류 발생 🚨</h3>
          <p className="lead mb-4">{error}</p>
          <hr />
          <p className="mb-0">
            페이지를 새로고침하거나 개발자 도구 콘솔을 확인해주세요.
          </p>
          <button
            className="btn btn-primary mt-4 px-4 py-2"
            onClick={() => window.location.reload()}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="d-flex flex-nowrap vw-100 vh-100"
      style={{
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        backgroundColor: "#f4f7f6",
      }}
    >
      {/* 1. 가장 좌측 패널 - 필터 */}
      <div
        className="d-flex flex-column bg-white p-4 shadow-sm border-end"
        style={{ width: "280px", minWidth: "250px", overflowY: "auto" }}
      >
        <h2 className="text-dark mb-3">🐾 필터 선택</h2>
        <p className="text-muted small mb-4">
          원하는 조건으로 시설을 검색해보세요.
        </p>

        <div className="mb-4">
          <div className="mb-3">
            <label
              htmlFor="regionSelect"
              className="form-label fw-bold text-secondary"
            >
              📍 지역
            </label>
            <select
              id="regionSelect"
              className="form-select form-select-sm"
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setCurrentPage(0);
              }}
            >
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label
              htmlFor="sigunguSelect"
              className="form-label fw-bold text-secondary"
            >
              🏘️ 시군구
            </label>
            <select
              id="sigunguSelect"
              className="form-select form-select-sm"
              value={selectedSigungu}
              onChange={(e) => {
                setSelectedSigungu(e.target.value);
                setCurrentPage(0);
              }}
            >
              {sigungus.map((sigungu) => (
                <option key={sigungu} value={sigungu}>
                  {sigungu}
                </option>
              ))}
            </select>
          </div>
        </div>

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

        <div className="mb-4">
          <h4 className="text-secondary mb-3">🅿️ 주차 / 🏢 유형</h4>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <input
              type="radio"
              className="btn-check"
              name="parking"
              id="parkingY"
              value="Y"
              checked={parkingFilter === "Y"}
              onChange={(e) => {
                setParkingFilter(e.target.value);
                setCurrentPage(0);
              }}
              autoComplete="off"
            />
            <label
              className="btn btn-outline-secondary btn-sm rounded-pill"
              htmlFor="parkingY"
            >
              주차 가능
            </label>
            <input
              type="radio"
              className="btn-check"
              name="parking"
              id="parkingN"
              value="N"
              checked={parkingFilter === "N"}
              onChange={(e) => {
                setParkingFilter(e.target.value);
                setCurrentPage(0);
              }}
              autoComplete="off"
            />
            <label
              className="btn btn-outline-secondary btn-sm rounded-pill"
              htmlFor="parkingN"
            >
              주차 불가
            </label>
            <input
              type="radio"
              className="btn-check"
              name="parking"
              id="parkingAll"
              value="전체"
              checked={parkingFilter === "전체"}
              onChange={(e) => {
                setParkingFilter(e.target.value);
                setCurrentPage(0);
              }}
              autoComplete="off"
            />
            <label
              className="btn btn-outline-secondary btn-sm rounded-pill"
              htmlFor="parkingAll"
            >
              주차 전체
            </label>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <input
              type="radio"
              className="btn-check"
              name="facilityType"
              id="indoor"
              value="실내"
              checked={facilityType === "실내"}
              onChange={(e) => {
                setFacilityType(e.target.value);
                setCurrentPage(0);
              }}
              autoComplete="off"
            />
            <label
              className="btn btn-outline-secondary btn-sm rounded-pill"
              htmlFor="indoor"
            >
              실내 시설
            </label>
            <input
              type="radio"
              className="btn-check"
              name="facilityType"
              id="outdoor"
              value="실외"
              checked={facilityType === "실외"}
              onChange={(e) => {
                setFacilityType(e.target.value);
                setCurrentPage(0);
              }}
              autoComplete="off"
            />
            <label
              className="btn btn-outline-secondary btn-sm rounded-pill"
              htmlFor="outdoor"
            >
              실외 시설
            </label>
            <input
              type="radio"
              className="btn-check"
              name="facilityType"
              id="typeAll"
              value="전체"
              checked={facilityType === "전체"}
              onChange={(e) => {
                setFacilityType(e.target.value);
                setCurrentPage(0);
              }}
              autoComplete="off"
            />
            <label
              className="btn btn-outline-secondary btn-sm rounded-pill"
              htmlFor="typeAll"
            >
              시설 유형 전체
            </label>
          </div>
        </div>
      </div>

      {/* 2. 중앙 패널 - 검색 결과 리스트 */}
      <div
        className="d-flex flex-column bg-white p-4 shadow-sm border-end"
        style={{ width: "350px", minWidth: "300px" }}
      >
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
          <h3 className="text-dark mb-0">검색 결과</h3>
          <span className="badge bg-primary fs-6">{totalElements}개 시설</span>
        </div>

        {/* 리스트 영역 (스크롤 제한) */}
        <div
          className="overflow-auto"
          style={{ flexGrow: 1, maxHeight: "calc(100vh - 200px)" }}
        >
          {isDataLoading && facilities.length === 0 ? (
            <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 text-muted py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>데이터를 로딩 중입니다...</p>
            </div>
          ) : facilities.length === 0 ? (
            <div className="text-center text-muted py-5 flex-grow-1">
              <p className="mb-0">필터 조건에 맞는 시설이 없습니다.</p>
            </div>
          ) : (
            <ul className="list-group list-group-flush">
              {facilities.map((facility) => (
                <li
                  key={facility.id}
                  className="list-group-item list-group-item-action py-3 px-2"
                  onClick={() => handleListItemClick(facility)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle me-3"
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor:
                          categoryColors[facility.category1] || "#6c757d",
                        flexShrink: 0,
                      }}
                    ></div>
                    <div>
                      <h6 className="mb-1 text-dark">{facility.name}</h6>
                      <small className="text-muted">
                        {facility.category1} &gt; {facility.category2 || "N/A"}
                      </small>
                      <small className="d-block text-secondary mt-1">
                        {facility.roadAddress || facility.jibunAddress}
                      </small>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {renderPagination()}
      </div>

      {/* 3. 가장 우측 패널 - 지도 (확실히 줄어든 크기) */}
      <div
        className="position-relative shadow-sm"
        style={{ width: "600px", minWidth: "450px", flexShrink: 0 }}
      >
        {" "}
        {(!isMapReady || isDataLoading) && ( // 맵 초기화 중이거나 데이터 로딩 중일 때 오버레이 표시
          <div className="position-absolute top-0 start-0 w-100 h-100 bg-light bg-opacity-75 d-flex justify-content-center align-items-center z-3">
            <div className="text-center text-primary">
              <div className="spinner-border mb-3" role="status">
                <span className="visually-hidden">Loading map...</span>
              </div>
              <p className="fs-5">
                {!isMapReady
                  ? "맵을 초기화 중입니다..."
                  : "시설 데이터를 로딩 중입니다..."}
              </p>
            </div>
          </div>
        )}
        <div
          ref={mapContainer}
          className="w-100 h-100"
          style={{ display: "block" }}
        />
        {/* 범례 */}
        {isMapReady && Object.keys(categoryColors).length > 0 && (
          <div
            className="position-absolute bottom-0 end-0 p-3 m-3 bg-white rounded shadow-sm z-2"
            style={{ maxWidth: "200px" }}
          >
            <h5 className="text-dark mb-3">🎨 마커 색상 범례</h5>
            <div className="d-flex flex-wrap gap-2">
              {Object.entries(categoryColors).map(([category, color]) => (
                <div key={category} className="d-flex align-items-center">
                  <div
                    className="rounded-circle me-2"
                    style={{
                      width: "14px",
                      height: "14px",
                      backgroundColor: color,
                      border: "1px solid rgba(0,0,0,0.1)",
                    }}
                  ></div>
                  <span className="text-muted small">{category}</span>
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
