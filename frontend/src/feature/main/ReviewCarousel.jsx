import React, { useState, useEffect } from "react";
import axios from "axios";
import { Carousel, Spinner, Alert, Card, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { BsCardImage, BsGeoAltFill } from "react-icons/bs"; // 아이콘 추가

export function ReviewCarousel() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestReviews = async () => {
      try {
        const response = await axios.get("/api/review/latest");
        setReviews(response.data);
      } catch (err) {
        console.error("최신 리뷰 조회 실패:", err);
        setError("리뷰를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchLatestReviews();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return `${date.getFullYear()}.${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}.${date.getDate().toString().padStart(2, "0")}`;
  };

  // 로딩, 에러, 빈 배열 처리는 기존과 동일
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "300px" }}
      >
        <Spinner animation="border" />
        <span className="ms-2">최신 리뷰를 불러오는 중...</span>
      </div>
    );
  }
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (reviews.length === 0)
    return <Alert variant="info">아직 등록된 리뷰가 없습니다.</Alert>;

  // --- 🎨 최종 디자인 적용 캐러셀 UI ---
  return (
    <>
      <style type="text/css">
        {`
        .review-carousel-item {
          height: 300px; /* 👈 모든 슬라이드 아이템의 높이를 300px로 고정! */
          padding: 0.5rem 0;
        }

        .review-card-custom {
          height: 100%;
          border: 1px solid #e9ecef;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }

        .review-card-custom:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.1);
        }

        .review-card-img-col {
          height: 100%;
          object-fit: cover;
        }
        
        .review-card-img-placeholder {
            background-color: #f8f9fa;
            color: #adb5bd;
            height: 100%;
        }
        
        .review-card-body-custom {
          padding: 1.25rem;
        }

        .review-text-truncate {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 4; /* 👈 보여줄 줄 수를 4줄로 늘림 */
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.5;
        }
        `}
      </style>

      <Carousel indicators={false} interval={5000}>
        {reviews.map((review) => {
          const firstImage = review.files?.find((file) =>
            /\.(jpg|jpeg|png|gif|webp)$/i.test(file),
          );

          return (
            <Carousel.Item key={review.id} className="review-carousel-item">
              <Card
                className="review-card-custom"
                onClick={() =>
                  navigate(
                    `/map/detail/${review.petFacility.id}?focusReviewId=${review.id}`,
                  )
                }
              >
                <Row g={0} className="h-100">
                  {/* 왼쪽: 이미지 영역 (너비 40%) */}
                  <Col xs={5}>
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt="리뷰 대표 이미지"
                        className="review-card-img-col w-100 rounded-start"
                      />
                    ) : (
                      <div className="d-flex justify-content-center align-items-center rounded-start review-card-img-placeholder">
                        <BsCardImage size={40} />
                      </div>
                    )}
                  </Col>

                  {/* 오른쪽: 텍스트 영역 (너비 60%) */}
                  <Col xs={7}>
                    <Card.Body className="d-flex flex-column h-100 review-card-body-custom">
                      {/* 1. 상단: 유저 정보 */}
                      <div className="d-flex align-items-center mb-2">
                        <img
                          src={review.profileImageUrl || "/user.png"}
                          alt="profile"
                          style={{
                            width: "28px",
                            height: "28px",
                            objectFit: "cover",
                          }}
                          className="rounded-circle me-2"
                        />
                        <div>
                          <span className="fw-bold fs-6">
                            {review.memberEmailNickName}
                          </span>
                          <small className="d-block text-muted">
                            {formatDate(review.insertedAt)}
                          </small>
                        </div>
                      </div>

                      {/* 2. 중간: 리뷰 제목/내용 (남는 공간을 모두 차지) */}
                      <div
                        className="flex-grow-1 my-2"
                        style={{ overflow: "hidden" }}
                      >
                        <p className="review-text-truncate m-0">
                          {review.review}
                        </p>
                      </div>

                      {/* 3. 하단: 별점과 시설 정보 */}
                      <div className="mt-auto">
                        <div className="mb-2">
                          <span
                            style={{ color: "#f0ad4e", letterSpacing: "2px" }}
                          >
                            {"★".repeat(review.rating)}
                          </span>
                          <span
                            style={{ color: "#e9ecef", letterSpacing: "2px" }}
                          >
                            {"★".repeat(5 - review.rating)}
                          </span>
                        </div>
                        <div
                          className="d-flex align-items-center text-muted"
                          style={{ fontSize: "0.85rem" }}
                        >
                          <BsGeoAltFill className="me-1" />
                          <span>{review.petFacility.name}</span>
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
}
