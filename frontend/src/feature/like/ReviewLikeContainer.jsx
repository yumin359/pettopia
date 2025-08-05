import { FaRegThumbsUp, FaThumbsUp } from "react-icons/fa";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { OverlayTrigger, Spinner, Tooltip, Button } from "react-bootstrap";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";

export function ReviewLikeContainer({ reviewId }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [likeInfo, setLikeInfo] = useState(null);
  const { user } = useContext(AuthenticationContext);

  function fetchLikeInfo() {
    return axios
      .get(`/api/reviewlike/review/${reviewId}`)
      .then((res) => setLikeInfo(res.data)) // { liked: true/false, likeCount: number }
      .catch((err) => {
        console.error("리뷰 좋아요 정보 로딩 실패:", err);
        // 에러 발생 시에도 기본값 세팅해서 무한로딩 방지
        setLikeInfo({ liked: false, likeCount: 0 });
      });
  }

  useEffect(() => {
    if (!user) {
      // 로그인 안 했으면 API 호출하지 말고 기본값 세팅
      setLikeInfo({ liked: false, likeCount: 0 });
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    fetchLikeInfo().finally(() => setIsProcessing(false));
  }, [reviewId, user]);

  function handleThumbsClick() {
    if (isProcessing || !user) return;

    setIsProcessing(true);
    axios
      .put("/api/reviewlike", { reviewId })
      .then(() => fetchLikeInfo())
      .catch((err) => console.error("리뷰 좋아요 처리 실패:", err))
      .finally(() => setIsProcessing(false));
  }

  if (!likeInfo) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ height: "2rem" }}
      >
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  return (
    <OverlayTrigger
      placement="top"
      overlay={
        !user ? (
          <Tooltip id="tooltip-login">로그인 하세요</Tooltip>
        ) : (
          <Tooltip id="tooltip-like">
            {likeInfo.liked ? "좋아요 취소" : "좋아요"}
          </Tooltip>
        )
      }
    >
      <Button
        variant={likeInfo.liked ? "primary" : "outline-secondary"}
        size="sm"
        onClick={user && !isProcessing ? handleThumbsClick : undefined}
        disabled={isProcessing || !user}
        className="d-flex align-items-center gap-1"
      >
        {isProcessing ? (
          <Spinner animation="border" size="sm" />
        ) : likeInfo.liked ? (
          <FaThumbsUp />
        ) : (
          <FaRegThumbsUp />
        )}
        <span>{likeInfo.likeCount}</span>
      </Button>
    </OverlayTrigger>
  );
}
