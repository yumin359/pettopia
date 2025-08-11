// ReviewCarousel.jsx (부트스트랩 기반 간소화)
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
import {
  BsGeoAltFill,
  BsHash,
  BsChevronLeft,
  BsChevronRight,
} from "react-icons/bs";

export const ReviewCarousel = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    return date
      .toLocaleDateString("ko-KR")
      .replace(/\. /g, ".")
      .replace(".", "");
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <Spinner animation="border" size="sm" className="me-2" />
        <span>로딩 중...</span>
      </div>
    );

  if (error) return <Alert variant="danger">{error}</Alert>;

  if (reviews.length === 0)
    return <Alert variant="info">등록된 리뷰가 없습니다.</Alert>;

  return (
    <>
      {/* 고정 높이를 위한 CSS */}
      <style>
        {`
          .review-card-fixed {
            height: 220px !important;
          }
          .review-image-area {
            height: 220px;
          }
          .review-content-area {
            height: 220px;
          }
          .review-author-area {
            min-height: 32px;
          }
          .review-tag-area {
            min-height: 28px;
            max-height: 28px;
          }
          .review-text-area {
            min-height: 60px;
            max-height: 80px;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            line-height: 1.4;
          }
          .review-bottom-area {
            min-height: 40px;
          }
          .review-image-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 2px;
            width: 100%;
            height: 100%;
          }
          .review-image-overlay {
            background-color: rgba(0,0,0,0.5);
            color: white;
            font-weight: bold;
            font-size: 1.5rem;
          }
        `}
      </style>

      <Carousel
        indicators={false}
        interval={5000}
        className="shadow-sm"
        prevIcon={<BsChevronLeft className="text-dark fs-1" />}
        nextIcon={<BsChevronRight className="text-dark fs-1" />}
      >
        {reviews.map((review) => {
          const imageFiles = review.files?.filter(isImageFile) || [];
          const totalImages = imageFiles.length;

          return (
            <Carousel.Item key={review.id}>
              <Card
                className="border-0 shadow-sm review-card-fixed bg-warning bg-opacity-25"
                role="button"
                onClick={() =>
                  navigate(
                    `/facility/${review.petFacility.id}?focusReviewId=${review.id}`,
                  )
                }
                style={{ cursor: "pointer" }}
              >
                <Row className="g-0 h-100">
                  {/* 이미지 영역 */}
                  <Col
                    xs={4}
                    className="bg-light d-flex align-items-center justify-content-center p-2 review-image-area"
                  >
                    {totalImages === 0 && (
                      <img
                        src="/PETOPIA-Photoroom.png"
                        alt="이미지 없음"
                        className="w-75 h-75"
                        style={{ objectFit: "contain" }}
                      />
                    )}

                    {totalImages === 1 && (
                      <img
                        src={imageFiles[0]}
                        alt=""
                        className="w-100 h-100 rounded"
                        style={{ objectFit: "cover" }}
                      />
                    )}

                    {totalImages >= 2 && (
                      <div className="review-image-grid rounded overflow-hidden">
                        {imageFiles.slice(0, 3).map((img, i) => (
                          <div key={i} className="overflow-hidden">
                            <img
                              src={img}
                              alt=""
                              className="w-100 h-100"
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                        ))}
                        {totalImages >= 4 && (
                          <div className="review-image-overlay d-flex justify-content-center align-items-center">
                            +{totalImages - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </Col>

                  {/* 본문 영역 */}
                  <Col xs={8}>
                    <Card.Body className="p-3 d-flex flex-column review-content-area">
                      {/* 작성자 정보 */}
                      <div className="d-flex align-items-center mb-2 review-author-area">
                        <img
                          src={review.profileImageUrl || "/user.png"}
                          alt=""
                          className="rounded-circle me-2"
                          width="24"
                          height="24"
                          style={{ objectFit: "cover" }}
                        />
                        <div className="small">
                          <div className="fw-semibold">
                            {review.memberEmailNickName}
                          </div>
                          <div
                            className="text-muted"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {formatDate(review.insertedAt)}
                          </div>
                        </div>
                      </div>

                      {/* 태그 영역 */}
                      <div className="mb-2 review-tag-area overflow-hidden">
                        {review.tags?.length > 0 && (
                          <div className="d-flex flex-wrap gap-1">
                            {review.tags.slice(0, 3).map((tag, i) => (
                              <Badge
                                key={tag.id || i}
                                bg="secondary"
                                className="fw-normal small"
                              >
                                <BsHash size={10} className="me-0" />
                                {tag.name.replace(/#/g, "")}
                              </Badge>
                            ))}
                            {review.tags.length > 3 && (
                              <Badge
                                bg="light"
                                text="dark"
                                className="fw-normal small"
                              >
                                +{review.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 리뷰 내용 */}
                      <div className="flex-grow-1 d-flex align-items-start">
                        <p className="small mb-0 review-text-area">
                          {review.review}
                        </p>
                      </div>

                      {/* 별점 + 시설명 */}
                      <div className="mt-auto review-bottom-area">
                        <div className="text-warning small mb-1">
                          {"★".repeat(review.rating)}
                          <span className="text-muted">
                            {"★".repeat(5 - review.rating)}
                          </span>
                        </div>
                        <div className="d-flex align-items-center text-muted small">
                          <BsGeoAltFill size={10} className="me-1" />
                          <span className="text-truncate">
                            {review.petFacility.name}
                          </span>
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
    </>
  );
};
