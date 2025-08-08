import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";

export function FavoriteContainer({ facilityName, facilityId }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [favoriteInfo, setFavoriteInfo] = useState(null);
  const { user } = useContext(AuthenticationContext);

  function fetchLikeInfo() {
    if (!facilityName || !facilityName.trim()) {
      return Promise.resolve();
    }

    const trimmedName = facilityName.trim();
    const encodedName = encodeURIComponent(trimmedName);

    return axios
      .get(`/api/favorite/${encodedName}`)
      .then((res) => {
        setFavoriteInfo(res.data);
      })
      .catch((err) => {
        // 404나 401은 정상적인 경우일 수 있음
        if (err.response?.status === 404 || err.response?.status === 401) {
          setFavoriteInfo({ isFavorite: false });
        }
      });
  }

  useEffect(() => {
    if (!user || !facilityName || !facilityName.trim()) {
      setFavoriteInfo({ isFavorite: false });
      return;
    }

    setIsProcessing(true);
    fetchLikeInfo().finally(() => setIsProcessing(false));
  }, [facilityName, user]);

  function handleFavoriteClick() {
    if (isProcessing || !user || !facilityName || !facilityName.trim()) {
      return;
    }

    setIsProcessing(true);

    const requestData = {
      facilityName: facilityName.trim(),
    };

    if (facilityId) {
      requestData.facilityId = facilityId;
    }

    // axios 직접 사용 (인터셉터가 토큰 추가)
    axios
      .put("/api/favorite", requestData)
      .then(() => {
        // 낙관적 업데이트
        setFavoriteInfo((prev) => ({
          ...prev,
          isFavorite: !prev?.isFavorite,
        }));
        // 서버 상태 재확인
        return fetchLikeInfo();
      })
      .catch((err) => {
        console.error("❌ 찜 처리 실패:");
        console.error("- Status:", err.response?.status);
        console.error("- Data:", err.response?.data);
        console.error("- Headers:", err.response?.headers);
        console.error("- Config:", err.config);

        let message = "찜 처리 중 오류가 발생했습니다.";

        if (err.response?.status === 404) {
          // 404 상세 분석
          const responseData = err.response?.data;
          if (
            typeof responseData === "string" &&
            responseData.includes("시설")
          ) {
            message = "시설을 찾을 수 없습니다.";
          } else {
            message = "요청을 처리할 수 없습니다. (404)";
          }
        } else if (err.response?.status === 401) {
          message = "로그인이 필요합니다. 다시 로그인해주세요.";
          // 토큰 제거하고 리로드
          localStorage.removeItem("token");
          window.location.reload();
        } else if (err.response?.status === 403) {
          message = "권한이 없습니다.";
        } else if (err.response?.status === 500) {
          const serverMessage = err.response?.data?.message;
          if (serverMessage) {
            message = serverMessage;
          }
        }

        alert(message);
        fetchLikeInfo();
      })
      .finally(() => setIsProcessing(false));
  }

  const heartStyle = {
    fontSize: "2rem",
    cursor: user ? (isProcessing ? "wait" : "pointer") : "not-allowed",
    color: favoriteInfo?.isFavorite ? "red" : "#ccc",
    transition: "color 0.3s ease",
  };

  // 시설명이 없으면 렌더링하지 않음
  if (!facilityName || !facilityName.trim()) {
    return null;
  }

  return (
    <OverlayTrigger
      placement="top"
      overlay={
        !user ? (
          <Tooltip id="tooltip-login">로그인 하세요</Tooltip>
        ) : (
          <Tooltip id="tooltip-like">
            {favoriteInfo?.isFavorite ? "찜 취소" : "찜"}
          </Tooltip>
        )
      }
    >
      <div
        onClick={user && !isProcessing ? handleFavoriteClick : undefined}
        style={{ display: "flex", alignItems: "center" }}
      >
        {user ? (
          isProcessing ? (
            <Spinner animation="border" size="sm" />
          ) : favoriteInfo?.isFavorite ? (
            <MdFavorite style={heartStyle} />
          ) : (
            <MdFavoriteBorder style={heartStyle} />
          )
        ) : (
          <MdFavoriteBorder style={heartStyle} />
        )}
      </div>
    </OverlayTrigger>
  );
}
