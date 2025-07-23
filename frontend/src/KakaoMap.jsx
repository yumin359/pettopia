import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const KakaoMap = () => {
  const mapContainer = useRef(null); // 지도를 표시할 div 엘리먼트 참조
  const mapInstance = useRef(null); // 지도 객체 인스턴스 참조
  const [error, setError] = useState(null); // 에러 상태
  const [isLoading, setIsLoading] = useState(true); // 지도 및 데이터 로딩 상태

  // 1. 카카오맵 SDK 로드 확인 및 지도 초기화
  useEffect(() => {
    const initializeMap = () => {
      // 카카오맵 SDK가 로드되었는지 확인
      if (!window.kakao || !window.kakao.maps) {
        console.warn("카카오맵 SDK가 아직 로드되지 않았습니다. 재시도...");
        setTimeout(initializeMap, 200); // 0.2초 후 다시 시도
        return;
      }

      // 지도를 담을 DOM 요소(mapContainer.current)가 준비되었는지 확인
      if (!mapContainer.current) {
        console.warn(
          "지도 컨테이너(DOM)가 아직 준비되지 않았습니다. 재시도...",
        );
        setTimeout(initializeMap, 200); // 0.2초 후 다시 시도
        return;
      }

      // 지도가 이미 초기화되었다면 중복 생성 방지
      if (mapInstance.current) {
        console.log("지도 인스턴스가 이미 존재합니다. 다시 생성하지 않습니다.");
        setIsLoading(false); // 이미 준비된 것으로 간주
        return;
      }

      try {
        const options = {
          center: new window.kakao.maps.LatLng(37.566826, 126.9786567), // 초기 지도 중심 (서울 시청)
          level: 9, // 초기 지도 확대 레벨 (클수록 넓은 지역)
        };

        mapInstance.current = new window.kakao.maps.Map(
          mapContainer.current,
          options,
        );
        console.log("카카오맵 객체 생성 완료.");
        setIsLoading(false); // 지도 초기화 완료, 이제 데이터 로드 준비
      } catch (err) {
        console.error("카카오맵 초기화 중 오류 발생:", err);
        setError("카카오맵 초기화에 실패했습니다. (앱 키, 네트워크 등 확인)");
        setIsLoading(false);
      }
    };

    initializeMap(); // 컴포넌트 마운트 시 지도 초기화 시도

    // 컴포넌트 언마운트 시 정리 (필요하다면 지도 리소스 해제)
    return () => {
      // mapInstance.current = null; // 지도 인스턴스 참조 해제
      console.log("KakaoMap 컴포넌트 언마운트 시 정리.");
    };
  }, []); // 빈 배열: 컴포넌트가 처음 마운트될 때 한 번만 실행

  // 2. 백엔드에서 데이터 가져오기 및 마커 표시
  useEffect(() => {
    if (!mapInstance.current || isLoading) {
      // 지도가 아직 초기화 중이거나 오류 상태라면 데이터를 가져오지 않음
      return;
    }

    const fetchFacilitiesAndDisplayMarkers = async () => {
      try {
        // *** 중요: 백엔드 API 엔드포인트를 정확히 맞춥니다. ***
        // 님의 백엔드 컨트롤러는 "/api/pet_facilities"로 설정되어 있습니다.
        const response = await axios.get(
          "http://localhost:8080/api/pet_facilities",
        );
        const facilities = response.data; // 데이터를 'facilities' 변수에 저장

        console.log("반려동물 시설 데이터 로드 완료:", facilities);

        const bounds = new window.kakao.maps.LatLngBounds(); // 모든 마커를 포함할 영역

        facilities.forEach((facility) => {
          // 위도와 경도가 유효한 숫자인지 다시 한번 확인
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

            // 마커 생성
            const marker = new window.kakao.maps.Marker({
              map: mapInstance.current,
              position: markerPosition,
              title: facility.name, // 마커에 마우스 오버 시 표시될 이름
            });

            // 인포윈도우 내용 (시설명, 주소, 카테고리 포함)
            const infowindowContent = `
              <div style="padding:10px;font-size:14px;line-height:1.5;">
                <strong>${facility.name || "이름 없음"}</strong><br>
                ${facility.roadAddress || facility.jibunAddress || "주소 정보 없음"}<br>
                <span style="color:#888;">${facility.category1 || ""} ${facility.category2 ? "> " + facility.category2 : ""}</span>
              </div>
            `;
            const infowindow = new window.kakao.maps.InfoWindow({
              content: infowindowContent,
              removable: true, // 닫기 버튼을 표시하여 인포윈도우를 닫을 수 있음
            });

            // 마커 클릭 시 인포윈도우 열기
            window.kakao.maps.event.addListener(marker, "click", () => {
              infowindow.open(mapInstance.current, marker);
            });

            bounds.extend(markerPosition); // 바운드에 마커 위치 추가
          } else {
            console.warn(
              `유효하지 않은 좌표: ${facility.name} (위도: ${facility.latitude}, 경도: ${facility.longitude})`,
            );
          }
        });

        // 모든 마커가 로드된 후 지도의 중심과 확대 레벨 조정
        if (facilities.length > 0) {
          mapInstance.current.setBounds(bounds);
        }
      } catch (err) {
        console.error("데이터 로드 중 오류 발생:", err);
        setError(
          "데이터를 가져오는 데 실패했습니다. 백엔드 서버가 실행 중인지 확인하세요.",
        );
      }
    };

    fetchFacilitiesAndDisplayMarkers();
  }, [isLoading]); // isLoading 상태가 변경(false가 됨)될 때, 즉 지도가 준비되면 실행

  // 에러 발생 시 UI
  if (error) {
    return (
      <div style={{ padding: "20px", color: "red", textAlign: "center" }}>
        <h3>오류 발생</h3>
        <p>{error}</p>
        <p>개발자 도구 (F12) 콘솔에서 자세한 오류 메시지를 확인하세요.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>반려동물 동반 가능 시설 지도</h2>
      {isLoading && (
        <p style={{ textAlign: "center" }}>
          지도를 로딩 중입니다. 잠시만 기다려 주세요...
        </p>
      )}
      <div
        id="kakao-map-container" // 이 ID는 useRef와 연결되며, 지도가 그려질 곳입니다.
        ref={mapContainer}
        style={{
          width: "100%",
          height: "500px",
          border: "1px solid #ddd",
          marginTop: "20px",
          // 지도가 준비되지 않았다면 숨기고, 준비되면 보이게 합니다.
          display: isLoading ? "none" : "block",
        }}
      ></div>
    </div>
  );
};

export default KakaoMap;
