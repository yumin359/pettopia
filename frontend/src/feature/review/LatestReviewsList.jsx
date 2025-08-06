import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Badge,
  Button,
  Card,
  Col,
  Image,
  Row,
  Spinner,
  Container,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ReviewLikeContainer } from "../like/ReviewLikeContainer.jsx";

export function LatestReviewsList() {
  const [reviews, setReviews] = useState(null);
  const [expandedIds, setExpandedIds] = useState([]);
  const [clampedIds, setClampedIds] = useState([]);

  // 신고 관련 상태들
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportingReviewId, setReportingReviewId] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const reviewRefs = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/api/review/latest")
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]));
  }, []);

  // 더보기 기능
  useEffect(() => {
    if (!reviews) return;
    const newClampedIds = [];
    reviews.forEach((r) => {
      const el = reviewRefs.current[r.id];
      if (!el) return;
      const isClamped = el.scrollHeight > el.clientHeight + 1;
      if (isClamped) newClampedIds.push(r.id);
    });
    setClampedIds(newClampedIds);
  }, [reviews]);

  // 로딩, 에러, 빈 배열 처리
  if (!reviews) {
    return (
      <Container className="my-5">
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      </Container>
    );
  }

  if (reviews.length === 0) {
    return (
      <Container className="my-5">
        <h3 className="text-center mb-4 fw-bold">최신 리뷰</h3>
        <p className="text-muted text-center">아직 작성된 리뷰가 없습니다.</p>
      </Container>
    );
  }

  const isImageFile = (fileUrl) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl.split("?")[0]);

  function handleFacilityButton(facilityName, event) {
    event.stopPropagation();
    navigate(`/facility/${encodeURIComponent(facilityName)}`);
  }

  const toggleExpand = (id, event) => {
    event.stopPropagation();
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // 신고 모달 열기
  const openReportModal = (reviewId, event) => {
    event.stopPropagation();
    setReportingReviewId(reviewId);
    setReportReason("");
    setReportModalOpen(true);
  };

  // 신고 모달 닫기
  const closeReportModal = () => {
    setReportModalOpen(false);
    setReportingReviewId(null);
    setReportReason("");
  };

  // 신고 제출
  const submitReport = async () => {
    if (!reportReason.trim()) {
      alert("신고 사유를 입력해주세요.");
      return;
    }
    setReportLoading(true);
    try {
      await fetch("/api/review/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewId: reportingReviewId,
          reason: reportReason.trim(),
        }),
      });
      alert("신고가 접수되었습니다.");
      closeReportModal();
    } catch (error) {
      alert("신고 실패: " + error.message);
    } finally {
      setReportLoading(false);
    }
  };

  const defaultProfileImage = "/user.png";

  return (
    <Container className="my-5">
      <h3 className="text-center mb-4 fw-bold">최신 리뷰</h3>

      <Row className="g-4">
        {reviews.map((r) => {
          const isExpanded = expandedIds.includes(r.id);
          const imageFiles = r.files?.filter(isImageFile) || [];
          const firstImage = imageFiles[0] || null;
          const hasImages = !!firstImage;

          return (
            <Col key={r.id} xs={12} md={6} lg={4}>
              <Card
                className="shadow-sm border-0 p-3 h-100"
                style={{
                  backgroundColor: "#fdfaf4",
                  cursor: "pointer",
                  transition: "transform 0.2s ease-in-out",
                }}
                onClick={() =>
                  navigate(
                    `/facility/${encodeURIComponent(r.facilityName)}?focusReviewId=${r.id}`,
                  )
                }
                onMouseEnter={(e) =>
                  (e.target.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.transform = "translateY(0)")
                }
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div
                    className="fw-semibold hover-underline-on-hover text-truncate"
                    style={{
                      cursor: "pointer",
                      color: "#8B4513",
                      maxWidth: "60%",
                    }}
                    onClick={(e) => handleFacilityButton(r.facilityName, e)}
                    title={r.facilityName}
                  >
                    {r.facilityName}
                  </div>
                  {/* 별점 UI */}
                  <div
                    className="small"
                    style={{
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#f0ad4e", fontSize: "1.1rem" }}>
                      {"★".repeat(r.rating)}
                    </span>
                    <span className="ms-2 text-dark fw-semibold">
                      {r.rating}
                    </span>
                  </div>
                </div>

                <hr className="mt-1 mb-3 border-gray-300" />

                {/* 이미지가 있는 경우 상단에 표시 */}
                {hasImages && (
                  <div className="mb-3 text-center">
                    <Image
                      src={firstImage}
                      alt="리뷰 이미지"
                      className="shadow rounded"
                      style={{
                        width: "100%",
                        maxWidth: "200px",
                        height: "150px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}

                {/* 리뷰 내용 */}
                <div className="flex-grow-1">
                  <div
                    ref={(el) => (reviewRefs.current[r.id] = el)}
                    className={`${!isExpanded ? "line-clamp" : ""} mb-2`}
                    style={{ whiteSpace: "pre-wrap", fontSize: "0.95rem" }}
                  >
                    {r.review}
                  </div>

                  {clampedIds.includes(r.id) && (
                    <div className="mb-2">
                      <Button
                        variant="link"
                        size="sm"
                        onClick={(e) => toggleExpand(r.id, e)}
                        className="p-0 text-secondary hover-underline-on-hover"
                        style={{
                          textDecoration: "none",
                          fontSize: "0.85rem",
                        }}
                      >
                        {isExpanded ? "간략히 보기" : "더보기"}
                      </Button>
                    </div>
                  )}

                  {/* 태그 */}
                  {r.tags && r.tags.length > 0 && (
                    <div className="mb-3 d-flex flex-wrap gap-1">
                      {r.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          bg="secondary"
                          pill
                          className="small"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* 하단 액션 및 정보 영역 */}
                <div className="mt-auto">
                  {/* 좋아요 및 신고 버튼 */}
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <ReviewLikeContainer reviewId={r.id} />
                    <button
                      onClick={(e) => openReportModal(r.id, e)}
                      title="리뷰 신고하기"
                      style={{
                        background: "none",
                        border: "none",
                        padding: "4px 8px",
                        cursor: "pointer",
                        fontSize: "1.1rem",
                        color: "#dc3545",
                        borderRadius: "4px",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor =
                          "rgba(220, 53, 69, 0.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "transparent")
                      }
                    >
                      🚨
                    </button>
                  </div>

                  {/* 작성자 정보 */}
                  <div
                    className="text-muted d-flex align-items-center"
                    style={{ fontSize: "0.8rem" }}
                  >
                    <Image
                      roundedCircle
                      className="me-2"
                      src={r.profileImageUrl || defaultProfileImage}
                      alt={`${r.memberEmailNickName ?? "익명"} 프로필`}
                      style={{
                        width: "20px",
                        height: "20px",
                        objectFit: "cover",
                      }}
                    />
                    <span className="text-truncate">
                      {r.memberEmailNickName ?? "익명 사용자"} ·{" "}
                      {r.insertedAt?.split("T")[0]}
                    </span>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* 신고 모달 */}
      {reportModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={closeReportModal}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "400px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="mb-3">리뷰 신고하기</h4>
            <textarea
              rows={5}
              placeholder="신고 사유를 작성해주세요."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="form-control mb-3"
              style={{
                resize: "vertical",
              }}
            />
            <div className="d-flex justify-content-end gap-2">
              <button
                onClick={closeReportModal}
                disabled={reportLoading}
                className="btn btn-secondary"
              >
                취소
              </button>
              <button
                onClick={submitReport}
                disabled={reportLoading}
                className="btn btn-warning"
              >
                {reportLoading ? "신고중..." : "신고하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .line-clamp {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .hover-underline-on-hover:hover {
          text-decoration: underline !important;
        }
      `}</style>
    </Container>
  );
}
