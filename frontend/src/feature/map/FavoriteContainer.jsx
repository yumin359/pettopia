import { FaRegThumbsUp, FaThumbsUp } from "react-icons/fa";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { OverlayTrigger, Spinner, Tooltip, Button } from "react-bootstrap";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";

export function FavoriteContainer({ facilityName }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [favoriteInfo, setFavoriteInfo] = useState(null);
  const { user } = useContext(AuthenticationContext);

  function fetchLikeInfo() {
    return axios
      .get(`/api/favorite/${facilityName}`)
      .then((res) => {
        setFavoriteInfo(res.data);
      })
      .catch((err) => {
        console.error("찜 정보 불러오기 실패:", err);
      });
  }

  useEffect(() => {
    setIsProcessing(true);
    fetchLikeInfo().finally(() => setIsProcessing(false));
  }, [facilityName]);

  function handleFavoriteClick() {
    if (isProcessing) return;

    setIsProcessing(true);
    axios
      .put("/api/favorite", { facilityName })
      .then(() => fetchLikeInfo())
      .catch((err) => {
        console.error("찜 처리 실패:", err);
      })
      .finally(() => setIsProcessing(false));
  }

  if (!favoriteInfo) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ height: "2rem" }}
      >
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  const heartStyle = {
    fontSize: "2rem", // Adjust size as needed
    cursor: "pointer",
    color: favoriteInfo.isFavorite ? "red" : "#ccc", // Match button colors
  };

  return (
    <OverlayTrigger
      placement="top"
      overlay={
        !user ? (
          <Tooltip id="tooltip-login">로그인 하세요</Tooltip>
        ) : (
          <Tooltip id="tooltip-like">
            {favoriteInfo.isFavorite ? "찜 취소" : "찜"}
          </Tooltip>
        )
      }
    >
      <div
        onClick={user && !isProcessing ? handleFavoriteClick : undefined}
        style={{ display: "flex", alignItems: "center" }}
      >
        {isProcessing ? (
          <Spinner animation="border" size="sm" />
        ) : favoriteInfo.isFavorite ? (
          <MdFavorite style={heartStyle} />
        ) : (
          <MdFavoriteBorder style={heartStyle} />
        )}
      </div>
      {/*</Button>*/}
    </OverlayTrigger>
  );
}
