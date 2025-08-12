import React, { useEffect, useState } from "react";
import axios from "axios";
import { Col, Image, Row, Spinner, Badge, Carousel } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router";
import { FaChevronRight } from "react-icons/fa";
import "./Review.css";
import "../../common/Carousel.css";
import { ReviewText } from "../../common/ReviewText.jsx";

export function MyReview() {
  const [reviews, setReviews] = useState(null);
  const navigate = useNavigate();
  const { memberId } = useParams();

  useEffect(() => {
    axios
      .get(`/api/review/myReview/${memberId}`)
      .then((res) => {
        setReviews(res.data);
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
    <Row className="justify-content-center mt-4">
      <Col xs={12} md={9} lg={7} style={{ maxWidth: "900px" }}>
        {/* 간단 프로필 - 이 부분은 유지 */}
        <div className="d-flex flex-row align-items-start">
          <Image
            roundedCircle
            className="me-3"
            src={userProfileImage}
            alt={`${userNickName} 프로필`}
            style={{
              width: "70px",
              height: "70px",
              objectFit: "cover",
            }}
          />
          <div className="d-flex flex-column align-items-start">
            <h3 className="fw-bold">{userNickName}</h3>
            <span>
              리뷰 <strong>{userCountMemberReview}</strong> 평균 평점{" "}
              <strong>{userMemberAverageRating}</strong>
            </span>
          </div>
        </div>
        <hr className="hr-color" />

        <div className="d-flex flex-column gap-4">
          {reviews.map((r, index) => {
            const reviewImages = r.files?.filter(isImageFile) || [];

            return (
              <div key={r.id} className="review-item">
                <div className={reviewImages.length > 0 ? "mb-3" : ""}>
                  {/* 1. 사진: 캐러셀로 여러 장 표시 한장이면 이미지만 */}
                  <div style={{ maxWidth: "300px", margin: "0 auto" }}>
                    {reviewImages.length === 1 && (
                      <img
                        src={reviewImages[0]}
                        alt="리뷰 이미지"
                        className="d-block"
                        style={{
                          height: "400px",
                          width: "300px",
                          objectFit: "cover",
                          margin: "0 auto",
                        }}
                      />
                    )}
                  </div>

                  {reviewImages.length > 1 && (
                    <Carousel
                      className="rounded"
                      interval={null}
                      slide={false}
                      style={{ maxWidth: "300px", margin: "0 auto" }}
                    >
                      {reviewImages.map((image, i) => (
                        <Carousel.Item key={i}>
                          <img
                            src={image}
                            alt={`리뷰 이미지 ${i + 1}`}
                            className="d-block"
                            style={{
                              height: "400px",
                              width: "300px",
                              objectFit: "cover",
                              margin: "0 auto",
                            }}
                          />
                          {reviewImages.length > 1 && (
                            <div className="carousel-counter">
                              {i + 1} / {reviewImages.length}
                            </div>
                          )}
                        </Carousel.Item>
                      ))}
                    </Carousel>
                  )}
                </div>

                <div className="p-1">
                  {/* 2. 시설명 */}
                  <div
                    className="fw-semibold d-flex align-items-center facility-link"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/facility/${r.petFacility.id}`)}
                  >
                    {r.petFacility.name}
                    <FaChevronRight className="ms-1" size={13} />
                    {/*별점 표시 ㅎㄻㄹ*/}
                    {/*<div className="small d-flex align-items-center">*/}
                    {/*  <span style={{ color: "#f0ad4e", fontSize: "1.1rem" }}>*/}
                    {/*    {"★".repeat(r.rating)}*/}
                    {/*  </span>*/}
                    {/*  <span className="ms-2 text-dark fw-semibold">*/}
                    {/*    {r.rating}*/}
                    {/*  </span>*/}
                    {/*</div>*/}
                  </div>

                  {/* 3. 본문 */}
                  <div
                    className="text-muted mb-2"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    <ReviewText text={r.review} />
                  </div>

                  {/* 4. 태그 */}
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

                  {/* 5. 날짜 */}
                  <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                    {r.insertedAt?.split("T")[0]}
                  </div>
                </div>

                {/* 마지막 리뷰가 아니면 구분선 추가 */}
                {index < reviews.length - 1 && <hr className="mb-2 hr-color" />}
              </div>
            );
          })}
          <hr className="hr-color" />
        </div>
      </Col>
    </Row>
  );
}
