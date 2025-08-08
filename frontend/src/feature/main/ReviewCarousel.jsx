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
import { BsCardImage, BsGeoAltFill, BsImages, BsHash } from "react-icons/bs";

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
    return date
      .toLocaleDateString("ko-KR")
      .replace(/\. /g, ".")
      .replace(".", "");
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "200px" }}
      >
        <Spinner animation="border" size="sm" className="me-2" />
        <span>로딩 중...</span>
      </div>
    );
  }

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (reviews.length === 0)
    return <Alert variant="info">등록된 리뷰가 없습니다.</Alert>;

  return (
    <Carousel indicators={false} interval={5000} className="shadow-sm">
      {reviews.map((review) => {
        const imageFiles =
          review.files?.filter((f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f)) ||
          [];
        const totalImages = imageFiles.length;

        return (
          <Carousel.Item key={review.id} style={{ height: "200px" }}>
            <Card
              className="h-100 border-0 shadow-sm"
              role="button"
              onClick={() =>
                navigate(
                  `/facility/${review.petFacility.id}?focusReviewId=${review.id}`,
                )
              }
              style={{ background: "lightgoldenrodyellow", cursor: "pointer" }}
            >
              <Row className="g-0 h-100">
                {/* 이미지 영역 - 30% */}
                <Col xs={4} className="position-relative bg-light">
                  {totalImages === 0 ? (
                    <div className="d-flex justify-content-center align-items-center h-100">
                      <img
                        src="/PETOPIA-Photoroom.png"
                        alt="이미지 없음"
                        style={{
                          maxWidth: "80%",
                          maxHeight: "80%",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  ) : totalImages === 1 ? (
                    <img
                      src={imageFiles[0]}
                      alt=""
                      className="w-100 h-100 object-fit-cover"
                    />
                  ) : (
                    <div className="row g-1 h-100 m-0">
                      {imageFiles.slice(0, 4).map((img, i) => (
                        <div
                          key={i}
                          className={`${totalImages === 2 ? "col-12" : "col-6"} p-0 position-relative`}
                        >
                          <img
                            src={img}
                            alt=""
                            className="w-100 h-100 object-fit-cover"
                          />
                          {i === 3 && totalImages > 4 && (
                            <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center text-white fw-bold">
                              +{totalImages - 4}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 이미지 개수 뱃지 */}
                  {totalImages > 1 && (
                    <Badge
                      bg="dark"
                      className="position-absolute bottom-0 end-0 m-1 d-flex align-items-center gap-1"
                    >
                      <BsImages size={12} /> {totalImages}
                    </Badge>
                  )}
                </Col>

                {/* 텍스트 영역 - 70% */}
                <Col xs={8}>
                  <Card.Body className="p-3 d-flex flex-column h-100">
                    {/* 유저 정보 */}
                    <div className="d-flex align-items-center mb-2">
                      <img
                        src={review.profileImageUrl || "/user.png"}
                        alt=""
                        className="rounded-circle me-2"
                        style={{
                          width: "24px",
                          height: "24px",
                          objectFit: "cover",
                        }}
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
                    {review.tags && review.tags.length > 0 && (
                      <div className="mb-2 d-flex flex-wrap gap-1">
                        {review.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={tag.id || index}
                            bg="secondary"
                            className="fw-normal"
                            style={{
                              fontSize: "0.7rem",
                              padding: "0.2rem 0.4rem",
                            }}
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
                            style={{
                              fontSize: "0.7rem",
                              padding: "0.2rem 0.4rem",
                            }}
                          >
                            +{review.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* 리뷰 내용 */}
                    <p
                      className="small mb-auto text-truncate-3"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp:
                          review.tags && review.tags.length > 0 ? 2 : 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: "1.4",
                        fontSize: "0.85rem",
                      }}
                    >
                      {review.review}
                    </p>

                    {/* 별점과 시설 */}
                    <div className="mt-2">
                      <div className="text-warning small mb-1">
                        {"★".repeat(review.rating)}
                        <span className="text-muted">
                          {"★".repeat(5 - review.rating)}
                        </span>
                      </div>
                      <div
                        className="d-flex align-items-center text-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
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
  );
}
