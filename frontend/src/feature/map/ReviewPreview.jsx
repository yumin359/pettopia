// src/feature/board/ReviewPreview.jsx
import React from "react";
import { ListGroup, ListGroupItem, Button, Image } from "react-bootstrap";
import { FaDownload } from "react-icons/fa";

function ReviewPreview({ review }) {
  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <span
        key={i}
        style={{
          color: i < rating ? "#ffc107" : "#e4e5e9",
          fontSize: "1.1rem",
        }}
      >
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

  const isImageFile = (fileUrl) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl.split("?")[0]);
  };

  return (
    <div style={{ marginBottom: "1.5rem", fontSize: "0.95rem" }}>
      <div>{renderStars(review.rating)}</div>
      <p style={{ margin: "0.5rem 0", whiteSpace: "pre-wrap" }}>
        {review.review}
      </p>

      {/* 첨부 파일 처리 */}
      {Array.isArray(review.files) && review.files.length > 0 && (
        <div className="mb-4">
          {/* 이미지 미리보기 */}
          {review.files.filter(isImageFile).length > 0 && (
            <div className="d-flex flex-column gap-3 mb-3">
              {review.files.filter(isImageFile).map((fileUrl, idx) => (
                <Image
                  key={idx}
                  src={fileUrl}
                  alt={`첨부 이미지 ${idx + 1}`}
                  className="shadow rounded"
                  style={{ maxWidth: "100%", objectFit: "contain" }}
                />
              ))}
            </div>
          )}

          {/* 모든 첨부 파일 (다운로드 링크) */}
          <ListGroup variant="flush">
            {review.files.map((fileUrl, idx) => {
              const fileName = fileUrl.split("/").pop().split("?")[0];
              return (
                <ListGroupItem
                  key={idx}
                  className="d-flex justify-content-between align-items-center px-2 py-1 border-0"
                  style={{
                    fontSize: "0.85rem",
                    color: "#6c757d",
                    backgroundColor: "transparent",
                  }}
                >
                  <span
                    className="text-truncate"
                    style={{
                      maxWidth: "85%",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={fileName}
                  >
                    {fileName}
                  </span>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="d-flex align-items-center justify-content-center p-1"
                    style={{ fontSize: "0.8rem" }}
                  >
                    <FaDownload />
                  </Button>
                </ListGroupItem>
              );
            })}
          </ListGroup>
        </div>
      )}

      <div style={{ fontSize: "0.8rem", color: "#555" }}>
        작성자: {review.memberEmailNickName || "알 수 없음"} |{" "}
        {formatDate(review.insertedAt)}
      </div>
    </div>
  );
}

export default ReviewPreview;
