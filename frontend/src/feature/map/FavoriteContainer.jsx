import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";

export function FavoriteContainer({ facilityName, facilityId }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [favoriteInfo, setFavoriteInfo] = useState(null);
  const { user } = useContext(AuthenticationContext);

  // 🔍 디버깅 로그 추가 : 오류 없는 거 확인했으니 없애볼까나 콘솔 개더러워짐.
  // useEffect(() => {
  //   console.log("=== FavoriteContainer Debug ===");
  //   console.log("1. User:", user);
  //   console.log("2. Token:", localStorage.getItem("token"));
  //   console.log("3. FacilityName:", facilityName);
  //   console.log("4. FacilityId:", facilityId);
  //   console.log("==============================");
  // }, [user, facilityName, facilityId]);

  function fetchLikeInfo() {
    if (!facilityName || !facilityName.trim()) {
      console.log("fetchLikeInfo: No facility name");
      return Promise.resolve();
    }

    const trimmedName = facilityName.trim();
    const encodedName = encodeURIComponent(trimmedName);

    console.log("Fetching favorite info for:", encodedName);

    return axios
      .get(`/api/favorite/${encodedName}`)
      .then((res) => {
        console.log("Favorite info response:", res.data);
        setFavoriteInfo(res.data);
      })
      .catch((err) => {
        console.error("찜 정보 불러오기 실패:", err.response || err);
        // 404나 401은 정상적인 경우일 수 있음
        if (err.response?.status === 404 || err.response?.status === 401) {
          setFavoriteInfo({ isFavorite: false });
        }
      });
  }

  useEffect(() => {
    if (!user || !facilityName || !facilityName.trim()) {
      console.log("Skip fetch - user:", !!user, "facilityName:", facilityName);
      setFavoriteInfo({ isFavorite: false });
      return;
    }

    setIsProcessing(true);
    fetchLikeInfo().finally(() => setIsProcessing(false));
  }, [facilityName, user]);

  function handleFavoriteClick() {
    console.log("=== Handle Favorite Click ===");
    console.log("isProcessing:", isProcessing);
    console.log("user:", user);
    console.log("facilityName:", facilityName);
    console.log("Token before request:", localStorage.getItem("token"));

    if (isProcessing || !user || !facilityName || !facilityName.trim()) {
      console.log("Click blocked!");
      return;
    }

    setIsProcessing(true);

    const requestData = {
      facilityName: facilityName.trim(),
    };

    if (facilityId) {
      requestData.facilityId = facilityId;
    }

    console.log("Request data:", requestData);

    // axios 직접 사용 (인터셉터가 토큰 추가)
    axios
      .put("/api/favorite", requestData)
      .then((res) => {
        console.log("✅ 찜 처리 성공:", res);
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
