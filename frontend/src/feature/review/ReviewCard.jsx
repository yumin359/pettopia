import React, { useState, useContext } from "react";
import { Badge, Image, Modal, Button } from "react-bootstrap";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";
import ReviewEdit from "./ReviewEdit.jsx";

function ReviewCard({ review, onUpdate, onDelete }) {
  const { user } = useContext(AuthenticationContext);
  const [isEditing, setIsEditing] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");

  const defaultProfileImage = "/user.png";

  const formatDate = (isoString) => {
    if (!isoString) return "날짜 없음";
    const date = new Date(isoString);
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  };

  const isImageFile = (fileUrl) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl.split("?")[0]);
  };

  const handleImageClick = (imageUrl) => {
    setModalImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setModalImageUrl("");
  };

  const handleEditStart = () => {
    setIsEditing(true);
  };

  const handleEditSave = () => {
    setIsEditing(false);
    if (onUpdate) {
      onUpdate();
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  // 편집 모드일 때는 ReviewEdit 컴포넌트 렌더링
  if (isEditing) {
    return (
      <ReviewEdit
        review={review}
        onSave={handleEditSave}
        onCancel={handleEditCancel}
      />
    );
  }

  // 일반 표시 모드
  return (
    <div style={{ position: "relative" }}>
      {/* 프로필 정보 섹션 */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        {/* 작성자 정보 (왼쪽) */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Image
            roundedCircle
            src={review.profileImageUrl || defaultProfileImage}
            alt={`${review.memberEmailNickName ?? "익명"} 프로필`}
            style={{
              width: "40px",
              height: "40px",
              objectFit: "cover",
              border: "2px solid #e9ecef",
            }}
          />
          <div>
            <div style={{ fontWeight: "500", color: "#212529" }}>
              {review.memberEmailNickName || "알 수 없음"}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#6c757d" }}>
              {formatDate(review.insertedAt)}
            </div>
          </div>
        </div>

        {/* 수정/삭제 버튼 (오른쪽) - 별점과 겹치지 않도록 위치 조정 */}
        {user?.email === review.memberEmail && (
          <div
            className="d-flex gap-2"
            style={{
              marginTop: "0.25rem", // 약간의 상단 여백
            }}
          >
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleEditStart}
              style={{ height: "32px" }}
            >
              <FaEdit /> 수정
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => {
                if (window.confirm("정말 삭제하시겠습니까?")) {
                  onDelete?.(review.id);
                }
              }}
              style={{ height: "32px" }}
            >
              <FaTrashAlt /> 삭제
            </Button>
          </div>
        )}
      </div>

      {/* 태그 표시 */}
      {Array.isArray(review.tags) && review.tags.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-3">
          {review.tags.map((tag) => (
            <Badge
              key={tag.id}
              bg="secondary"
              className="fw-normal"
              style={{ fontSize: "0.85rem", padding: "0.35rem 0.65rem" }}
            >
              # {tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* 리뷰 본문 */}
      <div
        style={{
          marginBottom: "1rem",
          padding: "1rem",
          backgroundColor: "#f8f9fa",
          borderRadius: "6px",
          lineHeight: "1.6",
        }}
      >
        <p style={{ margin: 0, whiteSpace: "pre-wrap", color: "#212529" }}>
          {review.review}
        </p>
      </div>

      {/* 첨부 이미지 */}
      {Array.isArray(review.files) &&
        review.files.filter(isImageFile).length > 0 && (
          <div className="mb-3">
            <div
              className="d-flex gap-2"
              style={{
                overflowX: "auto",
                paddingBottom: "0.5rem",
              }}
            >
              {review.files.filter(isImageFile).map((fileUrl, idx) => (
                <Image
                  key={idx}
                  src={fileUrl}
                  alt={`첨부 이미지 ${idx + 1}`}
                  className="shadow-sm rounded"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "transform 0.2s",
                  }}
                  onClick={() => handleImageClick(fileUrl)}
                  onMouseOver={(e) =>
                    (e.target.style.transform = "scale(1.05)")
                  }
                  onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
                />
              ))}
            </div>
          </div>
        )}

      {/* PDF 파일 표시 */}
      {Array.isArray(review.files) &&
        review.files.filter((f) => !isImageFile(f)).length > 0 && (
          <div className="mb-3">
            <div
              style={{
                fontSize: "0.9rem",
                color: "#6c757d",
                marginBottom: "0.5rem",
              }}
            >
              📎 첨부 파일
            </div>
            {review.files
              .filter((f) => !isImageFile(f))
              .map((fileUrl, idx) => {
                const fileName = fileUrl.split("/").pop().split("?")[0];
                return (
                  <a
                    key={idx}
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="d-inline-block me-2 mb-2"
                    style={{
                      padding: "0.25rem 0.5rem",
                      backgroundColor: "#e9ecef",
                      borderRadius: "4px",
                      color: "#495057",
                      textDecoration: "none",
                      fontSize: "0.85rem",
                    }}
                  >
                    📄 {fileName}
                  </a>
                );
              })}
          </div>
        )}

      {/* 이미지 확대 모달 */}
      <Modal
        show={showImageModal}
        onHide={handleCloseImageModal}
        centered
        size="xl"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: "transparent",
            border: "none",
            position: "absolute",
            right: 0,
            top: 0,
            zIndex: 1000,
          }}
        >
          <button
            type="button"
            className="btn-close btn-close-white"
            aria-label="Close"
            onClick={handleCloseImageModal}
          />
        </Modal.Header>
        <Modal.Body
          className="d-flex justify-content-center align-items-center p-0"
          style={{
            backgroundColor: "transparent",
            minHeight: "400px",
          }}
        >
          <Image
            src={modalImageUrl}
            fluid
            alt="확대 이미지"
            style={{
              maxHeight: "80vh",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default ReviewCard;
