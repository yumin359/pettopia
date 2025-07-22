import React, { useState, useEffect, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import Spinner from "react-bootstrap/Spinner";
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";

export function MainMap() {
  const containerStyle = {
    width: "100%",
    height: "600px",
  };

  const defaultCenter = { lat: 37.5665, lng: 126.978 }; // 서울 시청
  const [map, setMap] = useState(null);
  const [currentCenter, setCurrentCenter] = useState(defaultCenter);
  const [petData, setPetData] = useState([]);
  const navigate = useNavigate();

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyCRqOMeNtDSYIrnOd9feqOMFtDV54sXzh4",
    libraries: ["places"],
    language: "ko",
    region: "KR",
  });

  // 🐾 CSV 불러오기
  useEffect(() => {
    fetch("/pet.csv")
      .then((res) => res.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        });
        setPetData(parsed.data);
      });
  }, []);

  // 📍 현재 위치 요청
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentCenter(location);
        },
        () => {
          setCurrentCenter(defaultCenter);
        },
      );
    }
  }, []);

  // 📍 현재 위치로 지도 이동
  useEffect(() => {
    if (map && currentCenter) {
      map.panTo(currentCenter);
    }
  }, [map, currentCenter]);

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const getEmoji = (category) => {
    const emojis = {
      동물병원: "🏥",
      동물약국: "💊",
      문예회관: "🎭",
      미술관: "🖼️",
      미용: "✂️",
      박물관: "🏛️",
      반려동물용품: "🛍️",
      식당: "🍽️",
      여행지: "🏕️",
      위탁관리: "🏠",
      카페: "☕",
      펜션: "🛌",
    };
    return emojis[category] || "📍";
  };

  if (loadError) {
    return (
      <div className="text-center my-5 text-danger">
        지도 로딩 중 오류가 발생했습니다.
      </div>
    );
  }

  if (!isLoaded || !currentCenter) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status" />
        <p className="mt-2">지도를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentCenter}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
          restriction: {
            latLngBounds: {
              north: 37.715,
              south: 37.413,
              west: 126.734,
              east: 127.269,
            },
            strictBounds: true,
          },
          minZoom: 10,
          maxZoom: 18,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
            { featureType: "poi.business", stylers: [{ visibility: "off" }] },
            { featureType: "poi.medical", stylers: [{ visibility: "off" }] },
            { featureType: "poi.attraction", stylers: [{ visibility: "off" }] },
          ],
        }}
      >
        {/* 현재 위치 마커 */}
        <Marker position={currentCenter} title="현재 위치" />

        {/* 시설 마커 */}
        {petData.map((place, idx) => {
          const lat = parseFloat(place["위도"]);
          const lng = parseFloat(place["경도"]);
          if (!lat || !lng) return null;

          const category = place["카테고리3"] || "";
          const emoji = getEmoji(category);
          const name = place["시설명"];

          return (
            <Marker
              key={idx}
              position={{ lat, lng }}
              title={name}
              icon={{
                url: `data:image/svg+xml;utf8,
                  <svg xmlns='http://www.w3.org/2000/svg' width='120' height='40'>
                    <text x='5' y='25' font-size='16' fill='black' font-family='sans-serif'>${emoji} ${name}</text>
                  </svg>`,
                scaledSize: new window.google.maps.Size(120, 40),
              }}
              onClick={() => {
                navigate(`/facility/${encodeURIComponent(name)}`);
              }}
            />
          );
        })}
      </GoogleMap>
    </div>
  );
}

export default MainMap;
