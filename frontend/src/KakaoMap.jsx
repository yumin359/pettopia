// frontend/src/KakaoMap.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const KakaoMap = () => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const [mapIsReady, setMapIsReady] = useState(false); // 지도 컨테이너와 SDK가 모두 준비되었는지
  const [error, setError] = useState(null);

  useEffect(() => {
    // 이펙트 시작 시 로딩 상태를 보여주고, 준비되면 숨길 것입니다.
    // mapContainer.current가 유효해질 때까지 기다리는 로직이 중요합니다.

    const initKakaoMap = async () => {
      // 1. 카카오맵 SDK 로드 여부 확인
      if (!window.kakao || !window.kakao.maps) {
        console.error(
          "카카오맵 SDK가 아직 로드되지 않았습니다. index.html을 확인해주세요.",
        );
        setError("카카오맵 SDK 로드 실패. 앱 키 또는 네트워크 문제.");
        return; // SDK가 없으면 더 이상 진행하지 않음
      }

      // 2. mapContainer.current가 DOM에 완전히 마운트되었는지 확인
      // 이 부분은 useEffect의 두 번째 인자(의존성 배열)를 통해
      // mapContainer.current 값이 변경될 때마다 이 훅이 다시 실행되도록 유도하여 처리할 수도 있습니다.
      // 하지만 여기서는 명시적으로 체크하고 재시도를 통해 보장합니다.
      if (!mapContainer.current) {
        console.log(
          "지도 컨테이너(DOM 요소)가 아직 준비되지 않았습니다. 대기 중...",
        );
        // 100ms 후 다시 시도 (DOM 렌더링 대기)
        setTimeout(initKakaoMap, 100);
        return;
      }

      // 3. 지도가 이미 생성되었는지 확인 (Hot Module Replacement 등 중복 방지)
      if (mapInstance.current) {
        console.log("지도 인스턴스가 이미 존재합니다. 새로 생성하지 않습니다.");
        setMapIsReady(true); // 이미 준비된 것으로 간주
        return;
      }

      // 모든 준비가 완료되면 지도 초기화 시작
      try {
        const options = {
          center: new window.kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
          level: 3, // 지도의 확대 레벨
        };

        mapInstance.current = new window.kakao.maps.Map(
          mapContainer.current,
          options,
        );
        console.log("카카오맵 객체 생성 완료.");

        // 백엔드에서 위치 데이터 가져오기
        const response = await axios.get("/api/locations");
        const locations = response.data;
        console.log("위치 데이터 로드 완료:", locations);

        const bounds = new window.kakao.maps.LatLngBounds();
        locations.forEach((location) => {
          const markerPosition = new window.kakao.maps.LatLng(
            location.latitude,
            location.longitude,
          );
          const marker = new window.kakao.maps.Marker({
            map: mapInstance.current,
            position: markerPosition,
            title: location.name,
          });

          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;">${location.name}</div>`,
          });

          window.kakao.maps.event.addListener(marker, "click", () => {
            infowindow.open(mapInstance.current, marker);
          });

          bounds.extend(markerPosition);
        });

        if (locations.length > 0) {
          mapInstance.current.setBounds(bounds);
        }

        setMapIsReady(true); // 지도 초기화 및 마커 로딩 완료
      } catch (err) {
        console.error("카카오맵 초기화 또는 데이터 로드 중 오류 발생:", err);
        setError(
          err.message ||
            "알 수 없는 오류가 발생했습니다. (백엔드 또는 네트워크 확인)",
        );
      }
    };

    // 컴포넌트 마운트 시 초기화 함수 호출
    initKakaoMap();

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (mapInstance.current) {
        mapInstance.current = null;
        console.log("KakaoMap 컴포넌트 언마운트 시 지도 인스턴스 정리.");
      }
    };
  }, []); // 빈 배열: 컴포넌트 마운트 시 한 번만 실행

  // mapIsReady 상태를 사용하여 로딩 UI를 표시
  if (error) {
    return (
      <div style={{ padding: "20px", color: "red" }}>오류 발생: {error}</div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>카카오맵 로드</h2>
      {!mapIsReady && <p>지도를 로딩 중입니다. 잠시만 기다려 주세요...</p>}
      <div
        id="kakao-map-container"
        ref={mapContainer}
        // 지도가 아직 준비되지 않았다면 display: 'none' 등으로 숨길 수 있음
        style={{
          width: "100%",
          height: "500px",
          border: "1px solid #ddd",
          display: mapIsReady ? "block" : "none",
        }}
      ></div>
    </div>
  );
};

export default KakaoMap;
