import { FaRegThumbsUp, FaThumbsUp } from "react-icons/fa";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { OverlayTrigger, Spinner, Tooltip, Button } from "react-bootstrap";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";

export function LikeContainer({ boardId }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [likeInfo, setLikeInfo] = useState(null);
  const { user } = useContext(AuthenticationContext);

  function fetchLikeInfo() {
    return axios
      .get(`/api/like/board/${boardId}`)
      .then((res) => {
        setLikeInfo(res.data);
      })
      .catch((err) => {
        console.error("좋아요 정보 불러오기 실패:", err);
      });
  }

  useEffect(() => {
    setIsProcessing(true);
    fetchLikeInfo().finally(() => setIsProcessing(false));
  }, [boardId]);

  function handleThumbsClick() {
    if (isProcessing) return;

    setIsProcessing(true);
    axios
      .put("/api/like", { boardId })
      .then(() => fetchLikeInfo())
      .catch((err) => {
        console.error("좋아요 처리 실패:", err);
      })
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
        <span>{likeInfo.count}</span>
      </Button>
    </OverlayTrigger>
  );
}
