import React, { useState } from "react";
import { Image, Modal } from "react-bootstrap";

function ReviewPreview({ review, showOnlyImages = false }) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");

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

  const defaultProfileImage = "/user.png";

  // showOnlyImages prop이 true일 경우, 이미지 파일만 렌더링
  if (showOnlyImages) {
    return (
      <>
        {Array.isArray(review.files) &&
          review.files.length > 0 &&
          review.files.filter(isImageFile).map((fileUrl, idx) => (
            <Image
              key={idx}
              src={fileUrl}
              alt={`첨부 이미지 ${idx + 1}`}
              className="shadow rounded"
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
                display: "inline-block",
                cursor: "pointer",
              }}
              onClick={() => handleImageClick(fileUrl)}
            />
          ))}

        <Modal
          show={showImageModal}
          onHide={handleCloseImageModal}
          dialogClassName="fullscreen-modal"
          backdropClassName="slightly-dark-backdrop"
          centered
          fullscreen
        >
          <Modal.Body
            className="d-flex justify-content-center align-items-center bg-black"
            onClick={handleCloseImageModal}
            style={{ cursor: "zoom-out" }}
          >
            <Image
              src={modalImageUrl}
              fluid
              alt="확대 이미지"
              style={{
                maxHeight: "70%",
                maxWidth: "70%",
                objectFit: "contain",
              }}
            />
          </Modal.Body>
        </Modal>
      </>
    );
  }

  return (
    <div style={{ marginBottom: "1.5rem", fontSize: "0.95rem" }}>
      {/* 프로필 사진, 작성자, 작성일자 */}
      <div
        style={{
          fontSize: "0.8rem",
          color: "#555",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          paddingTop: "0.4rem",
          paddingBottom: "0.4rem",
        }}
      >
        <Image
          roundedCircle
          src={review.profileImageUrl || defaultProfileImage}
          alt={`${review.memberEmailNickName ?? "익명"} 프로필`}
          style={{
            width: "23px",
            height: "23px",
            objectFit: "cover",
          }}
        />
        <span>
          작성자: {review.memberEmailNickName || "알 수 없음"} |{" "}
          {formatDate(review.insertedAt)}
        </span>
      </div>

      {/* 별점 별 갯수 표시 부분 제거 */}

      {/* 첨부 파일 처리 */}
      {Array.isArray(review.files) && review.files.length > 0 && (
        <div
          className="mb-3"
          style={{ overflowX: "auto", whiteSpace: "nowrap" }}
        >
          {review.files.filter(isImageFile).length > 0 && (
            <div className="d-flex gap-3 mb-3">
              {review.files.filter(isImageFile).map((fileUrl, idx) => (
                <Image
                  key={idx}
                  src={fileUrl}
                  alt={`첨부 이미지 ${idx + 1}`}
                  className="shadow rounded"
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                    display: "inline-block",
                    cursor: "pointer",
                  }}
                  onClick={() => handleImageClick(fileUrl)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 리뷰 본문 */}
      <p style={{ margin: "0.5rem 0", whiteSpace: "pre-wrap" }}>
        {review.review}
      </p>

      {/* 이미지 모달 컴포넌트 */}
      <Modal
        show={showImageModal}
        onHide={handleCloseImageModal}
        dialogClassName="fullscreen-modal"
        backdropClassName="slightly-dark-backdrop"
        centered
        fullscreen
      >
        <Modal.Body
          className="d-flex justify-content-center align-items-center bg-black"
          onClick={handleCloseImageModal}
          style={{ cursor: "zoom-out" }}
        >
          <Image
            src={modalImageUrl}
            fluid
            alt="확대 이미지"
            style={{
              maxHeight: "70%",
              maxWidth: "70%",
              objectFit: "contain",
            }}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default ReviewPreview;
