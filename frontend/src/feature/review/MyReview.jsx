import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Col, Row, Spinner, Badge, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ReviewCard from "../review/ReviewCard.jsx";
import { ReviewLikeContainer } from "../like/ReviewLikeContainer.jsx";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

export function MyReview() {
  const [reviews, setReviews] = useState(null);
  const navigate = useNavigate();

  // ✨ 리뷰 목록을 다시 불러오는 함수
  const fetchMyReviews = () => {
    axios
      .get("/api/review/myReview")
      .then((res) => setReviews(res.data))
      .catch((err) => {
        console.error("리뷰 불러오기 실패", err);
        setReviews([]);
      });
  };

  useEffect(() => {
    fetchMyReviews();
  }, []);

  // ✨ 리뷰 삭제를 위한 핸들러 함수 추가
  const handleDelete = async (reviewId, event) => {
    event.stopPropagation();
    if (window.confirm("정말 이 리뷰를 삭제하시겠습니까?")) {
      try {
        await axios.delete(`/api/review/delete/${reviewId}`);
        alert("리뷰가 삭제되었습니다.");
        fetchMyReviews();
      } catch (err) {
        console.error("리뷰 삭제 실패", err);
        alert("리뷰 삭제에 실패했습니다.");
      }
    }
  };

  // TODO: 수정 기능 구현 시 사용
  const handleEdit = (reviewId, event) => {
    event.stopPropagation();
    // alert(`${reviewId}번 리뷰 수정 기능은 구현 예정입니다.`);
    // navigate(`/review/edit/${reviewId}`); 와 같은 로직 추가
  };

  useEffect(() => {
    axios
      .get("/api/review/myReview")
      .then((res) => setReviews(res.data))
      .catch((err) => {
        console.error("리뷰 불러오기 실패", err);
        setReviews([]);
      });
  }, []);

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

  return (
    <Container className="my-4">
      <h2 className="fw-bold mb-4">내가 쓴 리뷰 ({reviews.length}개)</h2>

      {reviews.length === 0 ? (
        <div className="text-center mt-5 p-5 bg-light rounded text-muted">
          작성한 리뷰가 없습니다.
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} xl={4} className="g-4">
          {reviews.map((r) => {
            const facilityInfo = r.petFacility;
            const firstImage = r.files?.[0] || null;

            return (
              <Col key={r.id}>
                <Card
                  className="h-100 shadow-sm"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (facilityInfo && facilityInfo.id) {
                      navigate(
                        `/facility/${facilityInfo.id}?focusReviewId=${r.id}`,
                      );
                    }
                  }}
                >
                  {firstImage && (
                    <Card.Img
                      variant="top"
                      src={firstImage}
                      style={{
                        height: "180px",
                        objectFit: "cover",
                      }}
                    />
                  )}

                  <Card.Body className="d-flex flex-column">
                    {/* 시설명과 별점 */}
                    <div className="mb-2">
                      <div className="fw-bold text-truncate">
                        📍 {facilityInfo?.name || "시설 정보 없음"}
                      </div>
                      <div style={{ color: "#f0ad4e" }}>
                        {"★".repeat(r.rating)}
                        <span className="text-muted">
                          {"☆".repeat(5 - r.rating)}
                        </span>
                      </div>
                    </div>

                    {/* 리뷰 내용 (최대 3줄) */}
                    <Card.Text
                      className="text-muted"
                      style={{
                        fontSize: "0.9rem",
                        flexGrow: 1,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {r.review}
                    </Card.Text>

                    {/* 태그 */}
                    {Array.isArray(r.tags) && r.tags.length > 0 && (
                      <div className="d-flex flex-wrap gap-1 mt-2">
                        {r.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag.id} bg="info" className="fw-normal">
                            #{tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card.Body>

                  {/* 카드 하단 푸터 */}
                  <Card.Footer className="d-flex justify-content-between align-items-center bg-white border-top-0">
                    <ReviewLikeContainer reviewId={r.id} compact={true} />
                    <div>
                      {/* TODO: 수정 기능 연결 */}
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={(e) => handleEdit(r.id, e)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={(e) => handleDelete(r.id, e)}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
}
