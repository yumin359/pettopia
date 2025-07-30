import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Col, Row, Spinner } from "react-bootstrap";
import { FaUser } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export function ReviewListMini() {
  const [reviews, setReviews] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/api/review/latest")
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]));
  }, []);

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

  function handleFacilityButton(facilityName) {
    navigate(`/facility/${encodeURIComponent(facilityName)}`);
  }

  return (
    <Row className="justify-content-center mt-4">
      <Col xs={12} md={10} lg={8} style={{ maxWidth: "900px" }}>
        <h5 className="mb-3">📝 최신 리뷰 피드</h5>
        <div className="d-flex flex-column gap-3">
          {reviews.map((r) => (
            <Card key={r.id} className="shadow-sm border-0 p-3">
              {/* 작성자 & 날짜 */}
              <div className="d-flex justify-content-between mb-2">
                <div className="fw-bold">
                  <FiUser />
                  {r.memberEmailNickName ?? "익명 사용자"}
                </div>
                <small className="text-muted">
                  {r.insertedAt?.split("T")[0]}
                </small>
              </div>

              {/* 시설 이름 */}
              {/* TODO 아이콘 병원이면 병원으로 그렇게 나눠서 보이게? */}
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

              {/* 리뷰 내용 */}
              <div style={{ whiteSpace: "pre-wrap" }}>
                {r.review.length > 200
                  ? r.review.slice(0, 200) + "..."
                  : r.review}
              </div>
            </Card>
          ))}
        </div>
      </Col>
    </Row>
  );
}
