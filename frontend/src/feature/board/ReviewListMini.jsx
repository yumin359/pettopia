import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Button,
  Card,
  Col,
  Image,
  Row,
  Spinner,
  Pagination,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ReviewLikeContainer } from "../like/ReviewLikeContainer";

export function ReviewListMini() {
  const [reviews, setReviews] = useState(null);
  const [expandedIds, setExpandedIds] = useState([]);
  const [clampedIds, setClampedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const reviewsPerPage = 5;
  const reviewRefs = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/api/review/latest")
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]));
  }, []);

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
  }, [reviews, currentPage]);

  if (!reviews) {
    return (
      <Row className="justify-content-center mt-4">
        <Col xs={12} md={10} lg={8} style={{ maxWidth: "900px" }}>
          <Spinner animation="border" />
        </Col>
      </Row>
    );
  }

  if (reviews.length === 0) {
    return (
      <Row className="justify-content-center mt-4">
        <Col xs={12} md={10} lg={8} style={{ maxWidth: "900px" }}>
          <p className="text-muted text-center">아직 작성된 리뷰가 없습니다.</p>
        </Col>
      </Row>
    );
  }

  const isImageFile = (fileUrl) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl.split("?")[0]);

  function handleFacilityButton(facilityName) {
    navigate(`/facility/${encodeURIComponent(facilityName)}`);
  }

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const defaultProfileImage = "/user.png";

  // 페이징 계산
  const indexOfLast = currentPage * reviewsPerPage;
  const indexOfFirst = indexOfLast - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  return (
    <Row className="justify-content-center mt-4">
      <Col xs={12} md={10} lg={8} style={{ maxWidth: "900px" }}>
        <div className="d-flex flex-column gap-3">
          {currentReviews.map((r) => {
            const isExpanded = expandedIds.includes(r.id);
            const imageFiles = r.files?.filter(isImageFile) || [];
            const firstImage = imageFiles[0] || null;
            const hasImages = !!firstImage;

            return (
              <Card
                key={r.id}
                className="shadow-sm border-0 p-3"
                style={{ backgroundColor: "#fdfaf4" }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div
                    className="fw-semibold hover-underline-on-hover"
                    style={{ cursor: "pointer", color: "#8B4513" }}
                    onClick={() => handleFacilityButton(r.facilityName)}
                  >
                    {r.facilityName}
                  </div>
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
                  </div>
                </div>
                <hr className="mt-1 border-gray-300" />
                <Row className="align-items-start">
                  <Col xs={12} md={hasImages ? 8 : 12}>
                    <div
                      ref={(el) => (reviewRefs.current[r.id] = el)}
                      className={`${!isExpanded ? "line-clamp" : ""}`}
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {r.review}
                    </div>
                    {clampedIds.includes(r.id) && (
                      <div className="mt-2">
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => toggleExpand(r.id)}
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
                  </Col>
                  {hasImages && (
                    <Col
                      xs={12}
                      md={4}
                      className="mt-3 mt-md-0 d-flex justify-content-md-end"
                    >
                      <Image
                        src={firstImage}
                        alt="리뷰 이미지"
                        className="shadow rounded"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                        }}
                      />
                    </Col>
                  )}
                </Row>

                <div className="mt-3 d-flex align-items-center gap-2">
                  <ReviewLikeContainer reviewId={r.id} />
                </div>

                <div className="text-muted mt-3" style={{ fontSize: "0.8rem" }}>
                  <Image
                    roundedCircle
                    className="me-2"
                    src={r.profileImageUrl || defaultProfileImage}
                    alt={`${r.memberEmailNickName ?? "익명"} 프로필`}
                    style={{
                      width: "23px",
                      height: "23px",
                      objectFit: "cover",
                    }}
                  />
                  {r.memberEmailNickName ?? "익명 사용자"} ·{" "}
                  {r.insertedAt?.split("T")[0]}
                </div>
              </Card>
            );
          })}
        </div>

        {/* ✅ 페이징 컨트롤 */}
        {totalPages > 1 && (
          <Pagination className="justify-content-center mt-4">
            <Pagination.Prev
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            />
            {[...Array(totalPages)].map((_, idx) => (
              <Pagination.Item
                key={idx + 1}
                active={idx + 1 === currentPage}
                onClick={() => setCurrentPage(idx + 1)}
              >
                {idx + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            />
          </Pagination>
        )}
      </Col>

      <style>{`
        .line-clamp {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .hover-underline-on-hover:hover {
          text-decoration: underline !important;
        }
      `}</style>
    </Row>
  );
}
