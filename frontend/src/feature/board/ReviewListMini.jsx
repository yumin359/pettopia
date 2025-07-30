import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Button, Card, Col, Image, Row, Spinner } from "react-bootstrap";
import { FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export function ReviewListMini() {
  const [reviews, setReviews] = useState(null);
  const [expandedIds, setExpandedIds] = useState([]);
  // 줄 수 확인용
  const [clampedIds, setClampedIds] = useState([]);
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

      // clamp된 경우: 실제 scrollHeight가 clientHeight보다 큼
      const isClamped = el.scrollHeight > el.clientHeight + 1;
      if (isClamped) {
        newClampedIds.push(r.id);
      }
    });

    setClampedIds(newClampedIds);
  }, [reviews]);

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

  const isImageFile = (fileUrl) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl.split("?")[0]);
  };

  function handleFacilityButton(facilityName) {
    navigate(`/facility/${encodeURIComponent(facilityName)}`);
  }

  // ✅ 더보기 토글 핸들러
  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <Row className="justify-content-center mt-4">
      <Col xs={12} md={10} lg={8} style={{ maxWidth: "900px" }}>
        <h5 className="mb-3">📝 최신 리뷰 피드</h5>
        <div className="d-flex flex-column gap-3">
          {reviews.map((r) => {
            // TODO 날짜(몇시간전 그런식으로 바꾸기)

            const isExpanded = expandedIds.includes(r.id);

            return (
              <Card key={r.id} className="shadow-sm border-0 p-3">
                <Row>
                  {/* 작성자 + 날짜 */}
                  <Col md={4} className="border-end pe-3 text-muted">
                    <div className="fw-bold mb-2">
                      <FiUser className="me-1" />
                      {r.memberEmailNickName ?? "익명 사용자"}
                    </div>
                    <div>{r.insertedAt?.split("T")[0]}</div>
                  </Col>

                  {/* 리뷰 내용 */}
                  <Col md={8} className="ps-3">
                    {/* 시설 이름 */}
                    <div
                      className="mb-1 text-primary fw-semibold"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleFacilityButton(r.facilityName)}
                    >
                      📍 {r.facilityName}
                    </div>

                    {/* 평점 */}
                    <div className="mb-2 text-warning">
                      {"⭐️".repeat(r.rating)} ({r.rating}점)
                    </div>

                    {/* 이미지가 있으면 */}
                    {Array.isArray(r.files) &&
                      r.files.filter(isImageFile).length > 0 && (
                        <div className="d-flex flex-wrap gap-3 mb-3">
                          {r.files.filter(isImageFile).map((file, idx) => (
                            <Image
                              key={idx}
                              src={file}
                              alt={`첨부 이미지 ${idx + 1}`}
                              className="shadow rounded"
                              style={{ maxWidth: "100px", objectFit: "cover" }}
                            />
                          ))}
                        </div>
                      )}

                    {/* 리뷰 본문 */}
                    <div
                      ref={(el) => (reviewRefs.current[r.id] = el)}
                      className={`${!isExpanded ? "line-clamp" : ""}`}
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {r.review}
                    </div>

                    {/* 더보기 버튼 */}
                    {clampedIds.includes(r.id) && (
                      <div className="mt-2">
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => toggleExpand(r.id)}
                          className="p-0 text-secondary"
                          style={{ textDecoration: "none" }}
                        >
                          {isExpanded ? "간략히 보기" : "더보기"}
                        </Button>
                      </div>
                    )}
                  </Col>
                </Row>
              </Card>
            );
          })}
        </div>
      </Col>

      {/* ✅ line-clamp용 스타일 */}
      <style>{`
        .line-clamp {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </Row>
  );
}
