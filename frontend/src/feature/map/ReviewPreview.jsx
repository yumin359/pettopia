import React, { useEffect, useState } from "react";
import {
  ListGroup,
  ListGroupItem,
  Button,
  Image,
  Row,
  Col,
  Modal,
} from "react-bootstrap";

function ReviewPreview({ review }) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");

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

  const handleImageClick = (imageUrl) => {
    setModalImageUrl(imageUrl);
    setShowImageModal(true);
  };
  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setModalImageUrl("");
  };

  // 프로필 사진 없는 사람들
  const defaultProfileImage = "/user.png";

  return (
    <div style={{ marginBottom: "1.5rem", fontSize: "0.95rem" }}>
      {/* 프로필 사진, 작성자, 작성일자 */}
      <div style={{ fontSize: "0.8rem", color: "#555" }}>
        <Image
          roundedCircle
          className="me-2"
          src={review.profileImageUrl || defaultProfileImage}
          alt={`${review.memberEmailNickName ?? "익명"} 프로필`}
          style={{
            width: "23px",
            height: "23px",
            objectFit: "cover",
          }}
        />
        작성자: {review.memberEmailNickName || "알 수 없음"} |{" "}
        {formatDate(review.insertedAt)}
      </div>

      {/* 별점 */}
      <div className="mb-2">{renderStars(review.rating)}</div>

      {/* 첨부 파일 처리 */}
      {Array.isArray(review.files) && review.files.length > 0 && (
        <div
          className="mb-3"
          style={{ overflowX: "auto", whiteSpace: "nowrap" }}
        >
          {/* 이미지 미리보기 */}
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

      {/*리뷰 본문*/}
      <p style={{ margin: "0.5rem 0", whiteSpace: "pre-wrap" }}>
        {review.review}
      </p>

      {/* ✅ 이미지 모달 컴포넌트 */}
      <Modal
        show={showImageModal}
        onHide={handleCloseImageModal} // 배경 클릭 또는 Esc 키로 닫기
        dialogClassName="fullscreen-modal" // ✅ 풀스크린 모달을 위한 클래스 추가
        backdropClassName="slightly-dark-backdrop" // ✅ 검은색 배경을 위한 클래스 추가
        centered // 중앙 정렬 (fullscreen에서는 큰 의미 없지만 유지)
        fullscreen // ✅ 화면 전체를 차지하도록 설정
      >
        <Modal.Body
          className="d-flex justify-content-center align-items-center bg-black" // ✅ 배경 검은색, 이미지 중앙 정렬
          onClick={handleCloseImageModal} // ✅ 이미지 클릭 시 모달 닫기 기능 추가
          style={{ cursor: "zoom-out" }} // ✅ 닫을 수 있음을 시각적으로 알림
        >
          {/* 이미지가 모달 너비/높이에 맞춰지고, 비율 유지하며 채움 */}
          <Image
            src={modalImageUrl}
            fluid
            alt="확대 이미지"
            style={{
              maxHeight: "70%", // 모달 바디 높이에 맞춤
              maxWidth: "70%", // 모달 바디 너비에 맞춤
              objectFit: "contain", // 이미지가 잘리지 않고 전체 보이도록
            }}
          />
        </Modal.Body>
        {/* Modal.Footer 제거 */}
      </Modal>

      {/*/!* 더보기 버튼 *!/*/}
      {/*{clampedIds.includes(r.id) && (*/}
      {/*  <div className="mt-2">*/}
      {/*    <Button*/}
      {/*      variant="link"*/}
      {/*      size="sm"*/}
      {/*      onClick={() => toggleExpand(r.id)}*/}
      {/*      className="p-0 text-secondary hover-underline-on-hover"*/}
      {/*      style={{*/}
      {/*        textDecoration: "none",*/}
      {/*        fontSize: "0.85rem",*/}
      {/*      }}*/}
      {/*    >*/}
      {/*      {isExpanded ? "간략히 보기" : "더보기"}*/}
      {/*    </Button>*/}
      {/*  </div>*/}
      {/*)}*/}

      <style>{`
        .line-clamp {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .hover-underline-on-hover:hover {
          text-decoration: underline !important;
        }
      `}</style>
    </div>
  );
}

export default ReviewPreview;
