// src/feature/board/ReviewListMini.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { ListGroup, Spinner } from "react-bootstrap";

export function ReviewListMini() {
  const [reviews, setReviews] = useState(null);

  useEffect(() => {
    axios.get("/api/review/latest") // ⭐ 최신 리뷰 목록 API
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]));
  }, []);

  if (!reviews) {
    return <Spinner animation="border" />;
  }

  if (reviews.length === 0) {
    return <p>아직 작성된 리뷰가 없습니다.</p>;
  }

  return (
    <ListGroup>
      {reviews.map((r) => (
        <ListGroup.Item key={r.id}>
          <strong>{r.facilityName}</strong> - {r.review.slice(0, 50)}...
          <br />
          <small>{r.insertedAt?.split("T")[0]}</small>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}
