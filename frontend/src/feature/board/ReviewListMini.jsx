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

  // 프로필 사진 없는 사람들
  const defaultProfileImage = "/user.png";

  return (
    <Row className="justify-content-center mt-4">
      <Col xs={12} md={10} lg={8} style={{ maxWidth: "900px" }}>
        <h3 className="mb-4 fw-bold text-center" style={{ color: "#8B4513" }}>
          최신 리뷰
        </h3>
        <div className="d-flex flex-column gap-3">
          {reviews.map((r) => {
            // TODO 날짜(몇시간전 그런식으로 바꾸기)

            const isExpanded = expandedIds.includes(r.id);
            // Card 내부
            const rawFiles = r.files;

            // 문자열이면 쉼표 기준으로 나누기
            const fileList =
              typeof rawFiles === "string" ? rawFiles.split(",") : rawFiles;

            // 이미지 파일만 필터링
            const imageFiles = fileList ? fileList.filter(isImageFile) : [];

            const firstImage = imageFiles.length > 0 ? imageFiles[0] : null;
            const hasImages = !!firstImage;

            return (
              <Card
                key={r.id}
                className="shadow-sm border-0 p-3"
                style={{ backgroundColor: "#fdfaf4" }}
              >
                {/* 상단: 시설명 + 별점 */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div
                    className="fw-semibold hover-underline-on-hover"
                    style={{ cursor: "pointer", color: "#8B4513" }}
                    onClick={() => handleFacilityButton(r.facilityName)}
                  >
                    {r.facilityName}
                  </div>
                  <div className="text-warning small">
                    {"★".repeat(r.rating)}{" "}
                  </div>
                </div>
                <hr className="mt-1 border-gray-300" />

                {/* ✅ 리뷰 본문과 이미지를 위한 새로운 Row */}
                <Row className="align-items-start">
                  {" "}
                  {/* 이미지와 텍스트의 상단을 정렬 */}
                  {/* 리뷰 본문 (왼쪽) */}
                  <Col xs={12} md={hasImages ? 8 : 12}>
                    {" "}
                    {/* 이미지가 있으면 8칸, 없으면 12칸 차지 */}
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
                  {hasImages && ( // firstImage가 있을 때만 Col 렌더링
                    <Col
                      xs={12}
                      md={4}
                      className="mt-3 mt-md-0 d-flex justify-content-md-end"
                    >
                      <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-md-end">
                        <Image
                          src={firstImage} // ✅ 첫 번째 이미지만 사용
                          alt={`리뷰 이미지`}
                          className="shadow rounded"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    </Col>
                  )}
                </Row>

                {/* 작성자 & 날짜 (하단 작게) */}
                <div className="text-muted mt-3" style={{ fontSize: "0.8rem" }}>
                  {/*<FiUser className="me-1" size="1.2em" />*/}
                  <Image
                    roundedCircle
                    className="me-1"
                    // src={defaultProfileImage}
                    // 바꿔야함
                    src={r.files || defaultProfileImage}
                    alt={`${r.memberEmailNickName ?? "익명"} 프로필`}
                    style={{
                      width: "15px",
                      height: "15px",
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
      </Col>

      {/* ✅ line-clamp용 스타일 */}
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
