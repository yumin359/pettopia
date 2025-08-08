// ReviewCarousel.jsx (이미지 레이아웃 LatestReviewsList 스타일로 적용)
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Carousel,
  Spinner,
  Alert,
  Card,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { BsImages, BsGeoAltFill, BsHash, BsChevronLeft, BsChevronRight } from "react-icons/bs";

export const ReviewCarousel = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const arrowStyle = {
    color: "#333",
    borderRadius: "50%",
    padding: "6px",
    fontSize: "1.8rem",
    filter: "drop-shadow(0 0 3px rgba(0,0,0,0.4))",
    cursor: "pointer",
    userSelect: "none",
  };

  useEffect(() => {
    const fetchLatestReviews = async () => {
      try {
        const { data } = await axios.get("/api/review/latest");
        setReviews(data);
      } catch (err) {
        console.error("최신 리뷰 조회 실패:", err);
        setError("리뷰를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchLatestReviews();
  }, []);

  const isImageFile = (fileUrl) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl.split("?")[0]);

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("ko-KR").replace(/\. /g, ".").replace(".", "");
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
        <Spinner animation="border" size="sm" className="me-2" />
        <span>로딩 중...</span>
      </div>
    );

  if (error) return <Alert variant="danger">{error}</Alert>;

  if (reviews.length === 0) return <Alert variant="info">등록된 리뷰가 없습니다.</Alert>;

  return (
    <Carousel
      indicators={false}
      interval={5000}
      className="shadow-sm"
      prevIcon={<BsChevronLeft style={arrowStyle} />}
      nextIcon={<BsChevronRight style={arrowStyle} />}
    >
      {reviews.map((review) => {
        const imageFiles = review.files?.filter(isImageFile) || [];
        const totalImages = imageFiles.length;

        return (
          <Carousel.Item key={review.id}>
            <Card
              className="h-100 border-0 shadow-sm"
              role="button"
              onClick={() =>
                navigate(`/facility/${review.petFacility.id}?focusReviewId=${review.id}`)
              }
              style={{ background: "lightgoldenrodyellow", cursor: "pointer" }}
            >
              <Row className="g-0 h-100">
                {/* 이미지 영역 */}
                <Col xs={4} className="bg-light d-flex align-items-center justify-content-center p-2">
                  {totalImages === 0 && (
                    <img
                      src="/PETOPIA-Photoroom.png"
                      alt="이미지 없음"
                      style={{ maxWidth: "80%", maxHeight: "80%", objectFit: "contain" }}
                    />
                  )}

                  {totalImages === 1 && (
                    <img
                      src={imageFiles[0]}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "6px",
                      }}
                    />
                  )}

                  {(totalImages === 2 || totalImages === 3 || totalImages >= 4) && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gridTemplateRows: "1fr 1fr",
                        gap: "2px",
                        width: "100%",
                        height: "100%",
                        borderRadius: "6px",
                        overflow: "hidden",
                      }}
                    >
                      {imageFiles.slice(0, 3).map((img, i) => (
                        <div key={i} style={{ overflow: "hidden" }}>
                          <img
                            src={img}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                      ))}
                      {totalImages >= 4 && (
                        <div
                          style={{
                            backgroundColor: "rgba(0,0,0,0.5)",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "1.5rem",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          +{totalImages - 3}
                        </div>
                      )}
                    </div>
                  )}
                </Col>

                {/* 본문 영역 */}
                <Col xs={8}>
                  <Card.Body className="p-3 d-flex flex-column h-100">
                    {/* 작성자 */}
                    <div className="d-flex align-items-center mb-2">
                      <img
                        src={review.profileImageUrl || "/user.png"}
                        alt=""
                        className="rounded-circle me-2"
                        style={{ width: "24px", height: "24px", objectFit: "cover" }}
                      />
                      <div className="small">
                        <div className="fw-semibold">
                          {review.memberNickname || review.memberEmail}
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                          {formatDate(review.insertedAt)}
                        </div>
                      </div>
                    </div>

                    {/* 태그 */}
                    {review.tags?.length > 0 && (
                      <div className="mb-2 d-flex flex-wrap gap-1">
                        {review.tags.slice(0, 3).map((tag, i) => (
                          <Badge
                            key={tag.id || i}
                            bg="secondary"
                            className="fw-normal"
                            style={{ fontSize: "0.7rem", padding: "0.2rem 0.4rem" }}
                          >
                            <BsHash size={10} className="me-0" />
                            {tag.name.replace(/#/g, "")}
                          </Badge>
                        ))}
                        {review.tags.length > 3 && (
                          <Badge
                            bg="light"
                            text="dark"
                            className="fw-normal"
                            style={{ fontSize: "0.7rem", padding: "0.2rem 0.4rem" }}
                          >
                            +{review.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* 리뷰 내용 */}
                    <p
                      className="small mb-auto"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: review.tags?.length > 0 ? 2 : 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: 1.4,
                        fontSize: "0.85rem",
                      }}
                    >
                      {review.review}
                    </p>

                    {/* 별점 + 시설명 */}
                    <div className="mt-2">
                      <div className="text-warning small mb-1">
                        {"★".repeat(review.rating)}
                        <span className="text-muted">
                          {"★".repeat(5 - review.rating)}
                        </span>
                      </div>
                      <div className="d-flex align-items-center text-muted" style={{ fontSize: "0.75rem" }}>
                        <BsGeoAltFill size={10} className="me-1" />
                        <span className="text-truncate">{review.petFacility.name}</span>
                      </div>
                    </div>
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          </Carousel.Item>
        );
      })}
    </Carousel>
  );
};
