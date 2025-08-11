import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Badge,
  Button,
  Card,
  Col,
  Row,
  Container,
  Form,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ReviewLikeContainer } from "../like/ReviewLikeContainer.jsx";

export function LatestReviewsList() {
  const [reviews, setReviews] = useState(null);
  const [displayCount, setDisplayCount] = useState(12);
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

  const isImageFile = (fileUrl) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl.split("?")[0]);

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

  const filteredReviews =
    reviews?.filter((r) => {
      if (!tagFilter.trim()) return true;
      return r.tags?.some((tag) => tag.name.includes(tagFilter.trim()));
    }) || [];

  if (!reviews) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border" role="status" />
      </Container>
    );
  }

  return (
    <Container className="my-4 p-4 bg-light rounded shadow">
      <h2 className="text-center mb-4 fw-bold">
        📝 최신 리뷰
        <span className="ms-2 fs-6 text-muted">
          ({filteredReviews.length}개)
        </span>
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
          const imageFiles = r.files?.filter(isImageFile) || [];
          const facilityInfo = r.petFacility;
          const hasImages = imageFiles.length > 0;

          return (
            <Col key={r.id} xs={12} sm={6} md={4} lg={3}>
              <Card
                className="h-100 border shadow-sm position-relative"
                onClick={() => {
                  if (!facilityInfo || !facilityInfo.id) return;
                  const url = `/facility/${facilityInfo.id}`;
                  const params = new URLSearchParams();
                  params.append("focusReviewId", r.id);
                  navigate(`${url}?${params.toString()}`);
                }}
                style={{ cursor: "pointer" }}
              >
                <Card.Body className="d-flex flex-column">
                  {/* 1. 시설명 */}
                  <div
                    className="fw-semibold text-truncate text-secondary mb-1"
                    // 시설명 누르면 포커스 없음. 나중에 확정으로 안 쓰게 된다면 지우기. 주석으로 둘게여
                    // onClick={(e) => {
                    //   e.stopPropagation();
                    //   if (facilityInfo?.id)
                    //     navigate(`/facility/${facilityInfo.id}`);
                    // }}
                  >
                    📍 {facilityInfo?.name || "정보 없음"}
                  </div>

                  {/* 2. 별점 */}
                  <div
                    className="mb-2"
                    style={{ color: "#f0ad4e", fontSize: "1.1rem" }}
                  >
                    {"★".repeat(r.rating)}
                  </div>

                  {/* 3. 사진 */}
                  {hasImages && (
                    <>
                      {imageFiles.length === 1 && (
                        <Card.Img
                          variant="top"
                          src={imageFiles[0]}
                          style={{
                            objectFit: "cover",
                            height: "150px",
                            borderRadius: "6px",
                            marginBottom: "8px",
                          }}
                        />
                      )}

                      {(imageFiles.length === 2 ||
                        imageFiles.length === 3 ||
                        imageFiles.length >= 4) && (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gridTemplateRows: "1fr 1fr",
                            gap: "4px",
                            height: "150px",
                            borderRadius: "6px",
                            overflow: "hidden",
                            marginBottom: "8px",
                          }}
                        >
                          {imageFiles.slice(0, 3).map((img, i) => (
                            <div
                              key={i}
                              style={{
                                width: "100%",
                                height: "100%",
                                overflow: "hidden",
                              }}
                            >
                              <img
                                src={img}
                                alt=""
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  display: "block",
                                }}
                              />
                            </div>
                          ))}

                          {imageFiles.length === 2 && <div />}

                          {imageFiles.length === 3 && <div />}

                          {imageFiles.length >= 4 && (
                            <div
                              style={{
                                backgroundColor: "rgba(0,0,0,0.5)",
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "1.5rem",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                userSelect: "none",
                              }}
                            >
                              +{imageFiles.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* 4. 리뷰 본문 (2줄 clamp with ellipsis) */}
                  <div
                    ref={(el) => (reviewRefs.current[r.id] = el)}
                    className="mb-2 text-muted"
                    style={{
                      fontSize: "0.85rem",
                      lineHeight: "1.0em",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "normal",
                      maxHeight: "2.0em",
                      background: "#f9f9f9",
                      borderRadius: "6px",
                      padding: "0 8px",
                      cursor: "default",
                      userSelect: "text",
                    }}
                  >
                    {r.review}
                  </div>

                  {/* 태그 */}
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
                        <Badge
                          bg="light"
                          text="dark"
                          className="small"
                          style={{ fontSize: "0.7rem" }}
                        >
                          +{r.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* 좋아요 버튼 */}
                  <div
                    className="d-flex align-items-center gap-2 mt-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ReviewLikeContainer reviewId={r.id} compact={true} />
                  </div>
                </Card.Body>

                {/* 신고 버튼 - 카드 하단 오른쪽 고정 */}
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openReportModal(r.id, e);
                  }}
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    right: "10px",
                    padding: "0.25rem 0.4rem",
                    fontSize: "0.75rem",
                    lineHeight: "1",
                    borderRadius: "4px",
                    backgroundColor: "transparent",
                    border: "none",
                    color: "red",
                    zIndex: 10,
                  }}
                  title="신고"
                >
                  🚨
                </Button>
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
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "400px",
            }}
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
              <Button
                variant="secondary"
                onClick={closeReportModal}
                disabled={reportLoading}
              >
                취소
              </Button>
              <Button
                variant="danger"
                onClick={submitReport}
                disabled={reportLoading || !reportReason.trim()}
              >
                {reportLoading ? "신고 중..." : "신고하기"}
              </Button>
            </div>
          </div>
          제
        </div>
      )}
    </Container>
  );
}
