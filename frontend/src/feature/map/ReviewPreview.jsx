// src/feature/board/ReviewPreview.jsx
import React from "react";

function ReviewPreview({ review }) {
  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < rating ? "#ffc107" : "#e4e5e9", fontSize: "1.1rem" }}>
        ★
      </span>
    ));

  const formatDate = (isoString) => {
    if (!isoString) return "날짜 없음";
    const date = new Date(isoString);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
      .getDate()
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div style={{ marginBottom: "1.5rem", fontSize: "0.95rem" }}>
      <div>{renderStars(review.rating)}</div>
      <p style={{ margin: "0.5rem 0", whiteSpace: "pre-wrap" }}>{review.review}</p>
      <div style={{ fontSize: "0.8rem", color: "#555" }}>
        작성자: {review.memberEmailNickName || "알 수 없음"} | {formatDate(review.insertedAt)}
      </div>
    </div>
  );
}

export default ReviewPreview;
