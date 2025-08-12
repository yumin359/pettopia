import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Col, Image, Row, Spinner, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { LikeContainer } from "../like/LikeContainer.jsx";
import { ReviewLikeContainer } from "../like/ReviewLikeContainer.jsx";
import { useParams } from "react-router";

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
  const defaultProfileImage = "/user.png";

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

  // 첫번째 리뷰에서 공통으로 가져올 것
  const userNickName = reviews[0].memberEmailNickName ?? "알 수 없음";
  const userProfileImage = reviews[0].profileImageUrl || "/user.png";
  const userCountMemberReview = reviews[0].countMemberReview;
  const userMemberAverageRating = reviews[0].memberAverageRating;

  return (
    <Row className="justify-content-center mt-4">
      <Col xs={12} md={10} lg={8} style={{ maxWidth: "900px" }}>
        {/*간단 프로필*/}
        <div className="d-flex flex-row align-items-start">
          <Image
            roundedCircle
            className="me-2"
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
        <hr />

        <div className="d-flex flex-column gap-3">
          {reviews.map((r) => {
            const firstImage = r.files?.find(isImageFile) || null;

            return (
              <Card
                key={r.id}
                className="shadow-sm border-0 p-3"
                style={{ backgroundColor: "#fffdf7", cursor: "pointer" }}
                onClick={() =>
                  navigate(
                    `/facility/${r.petFacility.id}?focusReviewId=${r.id}`,
                  )
                }
              >
                {/* 상단: 시설명 + 별점 */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div
                    className="fw-semibold"
                    style={{ color: "#5a3600", cursor: "pointer" }}
                  >
                    {r.petFacility.name}
                  </div>
                  <div className="small d-flex align-items-center">
                    <span style={{ color: "#f0ad4e", fontSize: "1.1rem" }}>
                      {"★".repeat(r.rating)}
                    </span>
                    <span className="ms-2 text-dark fw-semibold">
                      {r.rating}
                    </span>
                  </div>
                </div>

                <hr className="mt-1 border-gray-300" />

                {/* 본문 + 이미지 */}
                <Row>
                  <Col xs={12} md={firstImage ? 8 : 12}>
                    <div style={{ whiteSpace: "pre-wrap" }}>{r.review}</div>
                  </Col>
                  {firstImage && (
                    <Col xs={12} md={4} className="mt-3 mt-md-0 text-end">
                      <Image
                        src={firstImage}
                        alt="리뷰 이미지"
                        className="rounded shadow"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                        }}
                      />
                    </Col>
                  )}
                </Row>

                {/* 태그 */}
                {Array.isArray(r.tags) && r.tags.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mt-3">
                    {r.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        bg="info" // 마이페이지에서는 다른 색상으로 구분감을 줄 수도 있습니다.
                        className="fw-normal"
                      >
                        # {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* 하단: 날짜 + 프로필 */}
                <div
                  className="text-muted mt-2"
                  style={{ fontSize: "0.85rem" }}
                >
                  {/* 리뷰 좋아요 */}
                  {/*<ReviewLikeContainer reviewId={r.id} />*/}
                  <Image
                    roundedCircle
                    className="me-2"
                    src={r.profileImageUrl || defaultProfileImage}
                    alt={`${r.memberEmailNickName ?? "익명"} 프로필`}
                    style={{
                      width: "24px",
                      height: "24px",
                      objectFit: "cover",
                    }}
                  />
                  {r.insertedAt?.split("T")[0]}
                </div>
              </Card>
            );
          })}
        </div>
      </Col>
    </Row>
  );
}
