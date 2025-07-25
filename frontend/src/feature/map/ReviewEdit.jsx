import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import axios from "axios";

export function ReviewEdit() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { review } = state;

  const [content, setContent] = useState(review.review);
  const [rating, setRating] = useState(review.rating);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpdate = async () => {
    setIsProcessing(true);

    try {
      await axios.put(`/api/review/update/${review.id}`, {
        facilityName: review.facilityName,
        memberEmail: review.memberEmail, // 작성자 확인
        review: content.trim(),
        rating,
      });

      alert("수정 완료!");
      navigate(`/facility/${encodeURIComponent(review.facilityName)}`);
    } catch (e) {
      alert("수정 실패: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderRatingStars = () => {
    return (
      <div style={{ fontSize: "1.5rem", cursor: "pointer" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            onClick={() => setRating(n)}
            style={{
              color: n <= rating ? "#ffc107" : "#e4e5e9",
              marginRight: "4px",
            }}
          >
            ★
          </span>
        ))}
        <span style={{ marginLeft: "8px", fontSize: "1rem" }}>
          {rating}점
        </span>
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <h3>✏️ 리뷰 수정</h3>

      <Form.Group className="mb-3">
        <Form.Label>내용</Form.Label>
        <Form.Control
          as="textarea"
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isProcessing}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>별점</Form.Label>
        {renderRatingStars()}
      </Form.Group>

      <div className="d-flex gap-2">
        <Button variant="secondary" onClick={() => navigate(-1)} disabled={isProcessing}>
          취소
        </Button>
        <Button variant="primary" onClick={handleUpdate} disabled={isProcessing}>
          {isProcessing ? <Spinner size="sm" animation="border" /> : "수정"}
        </Button>
      </div>
    </div>
  );
}
