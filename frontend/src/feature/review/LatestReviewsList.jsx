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
  Form,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ReviewLikeContainer } from "../like/ReviewLikeContainer.jsx";

export function LatestReviewsList() {
  const [reviews, setReviews] = useState(null);
  const [displayCount, setDisplayCount] = useState(12);
  const [expandedIds, setExpandedIds] = useState([]);
  const [clampedIds, setClampedIds] = useState([]);
  const [tagFilter, setTagFilter] = useState("");

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportingReviewId, setReportingReviewId] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const reviewRefs = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/api/review/latest?limit=50")
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]));
  }, []);

  useEffect(() => {
    if (!reviews) return;
    const newClampedIds = [];
    const visibleReviews = filteredReviews.slice(0, displayCount);
    visibleReviews.forEach((r) => {
      const el = reviewRefs.current[r.id];
      if (!el) return;
      const isClamped = el.scrollHeight > el.clientHeight + 1;
      if (isClamped) newClampedIds.push(r.id);
    });
    setClampedIds(newClampedIds);
  }, [reviews, displayCount, tagFilter]);

  const isImageFile = (fileUrl) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl.split("?")[0]);

  const toggleExpand = (id, event) => {
    event.stopPropagation();
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const openReportModal = (reviewId, event) => {
    event.stopPropagation();
    setReportingReviewId(reviewId);
    setReportReason("");
    setReportModalOpen(true);
  };

  const closeReportModal = () => {
    setReportModalOpen(false);
    setReportingReviewId(null);
    setReportReason("");
  };

  const submitReport = async () => {
    if (!reportReason.trim()) {
      alert("신고 사유를 입력해주세요.");
      return;
    }
    setReportLoading(true);
    try {
      await axios.post("/api/review/report", {
        reviewId: reportingReviewId,
        reason: reportReason.trim(),
      });
      alert("신고가 접수되었습니다.");
      closeReportModal();
    } catch (error) {
      alert("신고 실패: " + error.message);
    } finally {
      setReportLoading(false);
    }
  };

  const loadMoreReviews = () => {
    setDisplayCount((prev) => Math.min(prev + 12, filteredReviews.length));
  };

  const filteredReviews = reviews?.filter((r) => {
    if (!tagFilter.trim()) return true;
    return r.tags?.some((tag) => tag.name.includes(tagFilter.trim()));
  }) || [];

  if (!reviews) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="my-4 p-4 bg-light rounded shadow">
      <h2 className="text-center mb-4 fw-bold">
        📝 최신 리뷰
        <span className="ms-2 fs-6 text-muted">({filteredReviews.length}개)</span>
      </h2>

      <Form className="mb-4">
        <Form.Control
          type="text"
          placeholder="#태그 검색"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
        />
      </Form>

      <Row className="g-3">
        {filteredReviews.slice(0, displayCount).map((r) => {
          const isExpanded = expandedIds.includes(r.id);
          const imageFiles = r.files?.filter(isImageFile) || [];
          const facilityInfo = r.petFacility;
          const hasImages = imageFiles.length > 0;

          return (
            <Col key={r.id} xs={12} sm={6} md={4} lg={3}>
              <Card
                className="h-100 border shadow-sm"
                onClick={() => {
                  if (!facilityInfo || !facilityInfo.id) return;
                  const url = `/facility/${facilityInfo.id}`;
                  const params = new URLSearchParams();
                  params.append("focusReviewId", r.id);
                  navigate(`${url}?${params.toString()}`);
                }}
              >
                {hasImages && (
                  <Card.Img
                    variant="top"
                    src={imageFiles[0]}
                    style={{ objectFit: "cover", height: "150px" }}
                  />
                )}

                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div
                      className="fw-semibold text-truncate text-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (facilityInfo?.id)
                          navigate(`/facility/${facilityInfo.id}`);
                      }}
                    >
                      📍 {facilityInfo?.name || "정보 없음"}
                    </div>
                    <div className="text-nowrap">
                      <span style={{ color: "#f0ad4e" }}>{"★".repeat(r.rating)}</span>
                    </div>
                  </div>

                  <div
                    ref={(el) => (reviewRefs.current[r.id] = el)}
                    className={`${!isExpanded ? "line-clamp-2" : ""} mb-2 text-muted`}
                    style={{ fontSize: "0.85rem", background: "#f9f9f9", borderRadius: "6px", padding: "8px" }}
                  >
                    {r.review}
                  </div>

                  {clampedIds.includes(r.id) && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0"
                      onClick={(e) => toggleExpand(r.id, e)}
                    >
                      {isExpanded ? "접기" : "더보기"}
                    </Button>
                  )}

                  {r.tags?.length > 0 && (
                    <div className="mb-2 d-flex flex-wrap gap-1">
                      {r.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag.id}
                          bg="light"
                          text="dark"
                          className="small"
                          style={{ fontSize: "0.7rem" }}
                        >
                          #{tag.name}
                        </Badge>
                      ))}
                      {r.tags.length > 3 && (
                        <Badge bg="light" text="dark" className="small" style={{ fontSize: "0.7rem" }}>
                          +{r.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <div className="d-flex align-items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <ReviewLikeContainer reviewId={r.id} compact={true} />
                      <button
                        onClick={(e) => openReportModal(r.id, e)}
                        title="신고"
                        className="btn btn-link text-danger p-0"
                        style={{ fontSize: "0.9rem" }}
                      >
                        🚨
                      </button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {filteredReviews.length > displayCount && (
        <div className="text-center mt-4">
          <Button variant="outline-primary" onClick={loadMoreReviews}>
            더 많은 리뷰 보기 ({filteredReviews.length - displayCount}개 남음)
          </Button>
        </div>
      )}

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
            style={{ backgroundColor: "white", padding: "2rem", borderRadius: "12px", width: "90%", maxWidth: "400px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="mb-3">🚨 리뷰 신고하기</h4>
            <textarea
              rows={5}
              placeholder="신고 사유를 작성해주세요."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="form-control mb-3"
            />
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={closeReportModal} disabled={reportLoading}>취소</Button>
              <Button variant="danger" onClick={submitReport} disabled={reportLoading || !reportReason.trim()}>
                {reportLoading ? "신고 중..." : "신고하기"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </Container>
  );
}
