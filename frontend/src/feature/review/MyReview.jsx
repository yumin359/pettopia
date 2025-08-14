import React, { useEffect, useState } from "react";
import axios from "axios";
import { Col, Image, Row, Spinner, Badge, Carousel } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router";
import { FaChevronRight } from "react-icons/fa";
import { ReviewText } from "../../common/ReviewText.jsx";
import { ReviewLikeContainer } from "../like/ReviewLikeContainer.jsx";
import { FavoriteContainer } from "../kakaoMap/FavoriteContainer.jsx";
import "bootstrap/dist/css/bootstrap.min.css";

// 새로운 카드 스타일을 위한 CSS
const cardStyles = `
  .review-card-custom {
    background-color: #fffafa;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid #fffafa; 
  }
  .review-card-custom:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
    background-color: #fffafc;
  }
`;

export function MyReview() {
  const [reviews, setReviews] = useState(null);
  const navigate = useNavigate();
  const { memberId } = useParams();

  useEffect(() => {
    axios
      .get(`/api/review/myReview/${memberId}`)
      .then((res) => {
        setReviews(res.data);
        console.log(res.data);
      })
      .catch((err) => {
        console.error("리뷰 불러오기 실패", err);
        setReviews([]);
      });
  }, [memberId]);

  const isImageFile = (url) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(url?.split("?")[0]);

  if (!reviews) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center mt-5 text-muted">작성한 리뷰가 없습니다.</div>
    );
  }

  const userNickName = reviews[0].memberEmailNickName ?? "알 수 없음";
  const userProfileImage = reviews[0].profileImageUrl || "/user.png";
  const userCountMemberReview = reviews[0].countMemberReview;
  const userMemberAverageRating = reviews[0].memberAverageRating;

  return (
    <>
      <style>{cardStyles}</style>
      <Row className="justify-content-center mt-4">
        <Col xs={12} md={9} lg={7}>
          <div className="d-flex flex-row align-items-start mb-2">
            <Image
              roundedCircle
              className="me-3"
              src={userProfileImage}
              alt={`${userNickName} 프로필`}
              style={{
                width: "67px",
                height: "67px",
                objectFit: "cover",
              }}
            />
            <div className="d-flex flex-column align-items-start">
              <h3 className="fw-bold mb-1">{userNickName}</h3>
              <span>
                리뷰 <strong>{userCountMemberReview}</strong> 평균 평점{" "}
                <strong>{userMemberAverageRating}</strong>
              </span>
            </div>
          </div>

          <hr className="hr-color-hotpink review-separator" />

          {reviews.map((r, index) => {
            const reviewImages = r.files?.filter(isImageFile) || [];

            return (
              <div
                key={r.id}
                // 기존 클래스에 'review-card-custom' 클래스 추가
                className="card mb-3 rounded-4 review-card-custom"
                // style 속성 제거
              >
                <div className="card-body p-4">
                  {/* ... (이전과 동일) ... */}
                  <div className={reviewImages.length > 0 ? "mb-3" : ""}>
                    {reviewImages.length > 0 && (
                      <div style={{ maxWidth: "400px", margin: "0 auto" }}>
                        {reviewImages.length === 1 ? (
                          <img
                            src={reviewImages[0]}
                            alt="리뷰 이미지"
                            className="d-block w-100 rounded"
                            style={{ height: "400px", objectFit: "cover" }}
                          />
                        ) : (
                          <Carousel
                            className="hover-controls"
                            interval={null}
                            indicators={false}
                          >
                            {reviewImages.map((image, i) => (
                              <Carousel.Item key={i}>
                                <img
                                  src={image}
                                  alt={`리뷰 이미지 ${i + 1}`}
                                  className="d-block w-100"
                                  style={{
                                    height: "400px",
                                    objectFit: "cover",
                                  }}
                                />
                                <div className="carousel-counter">
                                  {i + 1} / {reviewImages.length}
                                </div>
                              </Carousel.Item>
                            ))}
                          </Carousel>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-1">
                    <div className="d-flex align-items-center justify-content-between">
                      <div
                        className="fw-semibold d-flex align-items-center facility-link mb-2"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          navigate(`/facility/${r.petFacility.id}`)
                        }
                      >
                        {r.petFacility.name}
                        <FaChevronRight className="ms-1" size={13} />
                      </div>
                      <div className="small d-flex align-items-center">
                        {r.petFacility && r.petFacility.id && (
                          <FavoriteContainer
                            className="small"
                            facilityName={r.petFacility.name}
                            facilityId={r.petFacility.id}
                          />
                        )}
                      </div>
                    </div>
                    <div style={{ color: "#888", fontSize: "0.85rem" }}>
                      {r.petFacility.sidoName}
                      {r.petFacility.sigunguName}
                    </div>
                    <hr className="my-2 hr-color-hotpink" />

                    <div
                      className="text-muted mb-1"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      <ReviewText text={r.review} />
                    </div>

                    {Array.isArray(r.tags) && r.tags.length > 0 && (
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        {r.tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            bg="light"
                            text="dark"
                            className="fw-normal border"
                          >
                            # {tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                      {r.insertedAt?.split("T")[0]}
                    </div>

                    <ReviewLikeContainer reviewId={r.id} />
                  </div>
                </div>
              </div>
            );
          })}
        </Col>
      </Row>
    </>
  );
}
