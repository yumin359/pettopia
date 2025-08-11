import React, { useState, useContext } from "react";
import { Badge, Image, Modal, Button } from "react-bootstrap";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";
import ReviewEdit from "./ReviewEdit.jsx";
import { useNavigate } from "react-router";

function ReviewCard({ review, onUpdate, onDelete, showOnlyImages = false }) {
  const { user } = useContext(AuthenticationContext);
  const [isEditing, setIsEditing] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  // 모달 state
  const [modalImageUrl, setModalImageUrl] = useState("");
  const [modalNickName, setModalNickName] = useState("");
  const [modalProfileImageUrl, setModalProfileImageUrl] = useState("");

  const [showAllImages, setShowAllImages] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [isHoverd, setIsHoverd] = useState(false);
  const [showFullReview, setShowFullReview] = useState(false); // 더보기 상태 추가

  const navigate = useNavigate();
  const defaultProfileImage = "/user.png";

  const formatDate = (isoString) => {
    if (!isoString) return "날짜 없음";
    const date = new Date(isoString);
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  };

  // 이미지 정보가 URL 문자열일 수도, 객체일 수도 있으므로 확인 후 처리
  const getImageUrl = (fileInfo) => {
    return typeof fileInfo === "string" ? fileInfo : fileInfo.url;
  };

  const getImageNickName = (fileInfo) => {
    return typeof fileInfo === "string" ? null : fileInfo.nickName;
  };

  const getProfileImageUrl = (fileInfo) => {
    return typeof fileInfo === "string" ? null : fileInfo.profileImageUrl;
  };

  // URL 문자열을 받아서 이미지 파일인지 확인하는 함수
  const isImageUrl = (fileUrl) => {
    if (typeof fileUrl !== "string" || !fileUrl) {
      return false;
    }
    const extension = fileUrl.split(".").pop().split("?")[0];
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(
      extension.toLowerCase(),
    );
  };

  // 모든 이미지 파일을 컴포넌트 상단에서 한 번만 필터링
  const allImages = Array.isArray(review.files)
    ? review.files.filter((fileInfo) => {
        // fileInfo가 객체일 경우 url 속성으로 URL을 가져와서 검사
        const fileUrl = getImageUrl(fileInfo);
        return isImageUrl(fileUrl);
      })
    : [];

  // 리뷰 내용 더보기 처리
  const REVIEW_PREVIEW_LENGTH = 150; // 글자 수 제한
  const REVIEW_PREVIEW_LINES = 5; // 줄 수 제한
  const reviewText = review.review || "";

  // 글자 수 또는 줄 수 기준으로 긴 리뷰 판단
  const lines = reviewText.split("\n");
  const isLongByLength = reviewText.length > REVIEW_PREVIEW_LENGTH;
  const isLongByLines = lines.length > REVIEW_PREVIEW_LINES;
  const isLongReview = isLongByLength || isLongByLines;

  let displayedReview;
  if (showFullReview || !isLongReview) {
    displayedReview = reviewText;
  } else if (isLongByLines) {
    // 줄 수가 많은 경우: 처음 5줄만 표시
    displayedReview = lines.slice(0, REVIEW_PREVIEW_LINES).join("\n") + "\n...";
  } else {
    // 글자 수가 많은 경우: 처음 150자만 표시
    displayedReview = reviewText.substring(0, REVIEW_PREVIEW_LENGTH) + "...";
  }

  const handleImageClick = (imageInfo) => {
    // imageInfo는 URL 문자열이거나 { url, nickName, profileImageUrl } 객체일 수 있음
    const imageUrl = getImageUrl(imageInfo);
    const imageNickName = getImageNickName(imageInfo);
    const imageProfileImageUrl = getProfileImageUrl(imageInfo);

    setModalImageUrl(imageUrl);
    setModalNickName(imageNickName);
    setModalProfileImageUrl(imageProfileImageUrl);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setModalImageUrl("");
  };

  const handleEditStart = () => {
    setIsEditing(true);
  };

  const handleEditSave = (reviewId) => {
    setIsEditing(false);
    if (onUpdate) {
      // 수정한 리뷰 id를 mapDetail로 보냄
      onUpdate(reviewId);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleDeleteConfirmed = () => {
    onDelete?.(review.id);
    setShowDeleteModal(false);
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

  // showOnlyImages prop이 true일 경우, 이미지 파일만 렌더링
  if (showOnlyImages) {
    const imagesToShow = showAllImages ? allImages : allImages.slice(0, 6);
    const hasMoreImages = allImages.length > 6;

    return (
      <>
        <div className="d-flex flex-wrap gap-2">
          {imagesToShow.map((imageInfo, idx) => (
            <Image
              key={idx}
              src={getImageUrl(imageInfo)} // 사진을 가져옴
              alt={`첨부 이미지 ${idx + 1}`}
              className="shadow rounded"
              width="150"
              height="150"
              style={{
                objectFit: "cover",
                cursor: "pointer",
              }}
              onClick={() => handleImageClick(imageInfo)} // 객체 자체를 전달하고
            />
          ))}
          {hasMoreImages && !showAllImages && (
            <Button
              variant="outline-secondary"
              className="d-flex align-items-center justify-content-center fw-bold"
              style={{ width: "150px", height: "150px" }}
              onClick={() => setShowAllImages(true)}
            >
              더보기 ({allImages.length - 6})
            </Button>
          )}
          {hasMoreImages && showAllImages && (
            <Button
              variant="outline-secondary"
              className="d-flex align-items-center justify-content-center fw-bold"
              style={{ width: "150px", height: "150px" }}
              onClick={() => setShowAllImages(false)}
            >
              간략히
            </Button>
          )}
        </div>

        {/* 이미지 확대 모달 */}
        <Modal
          show={showImageModal}
          onHide={handleCloseImageModal}
          centered
          size="xl"
        >
          <Modal.Header closeButton className="border-0 bg-transparent" />
          <Modal.Body
            className="d-flex justify-content-center align-items-center p-0 bg-transparent"
            style={{ minHeight: "400px" }}
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
          <Modal.Footer className="d-flex justify-content-start">
            {modalProfileImageUrl && (
              <Image
                roundedCircle
                src={modalProfileImageUrl}
                alt={`${modalNickName} 프로필 이미지`}
                style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "cover",
                  border: "2px solid #e9ecef",
                }}
              />
            )}
            {modalNickName && (
              <div className="text-muted">
                <strong>{modalNickName}</strong>
              </div>
            )}
          </Modal.Footer>
        </Modal>
      </>
    );
  }

  // 일반 표시 모드
  return (
    <div className="position-relative">
      {/* 프로필 정보 섹션 */}
      <div className="d-flex align-items-start justify-content-between mb-3">
        {/* 작성자 정보 (왼쪽) */}
        <div className="d-flex align-items-center">
          <Image
            roundedCircle
            src={review.profileImageUrl || defaultProfileImage}
            alt={`${review.memberEmailNickName ?? "익명"} 프로필`}
            width="40"
            height="40"
            className="me-3 border border-2 border-light"
            style={{ objectFit: "cover" }}
          />
          <div>
            <div
              className={`fw-medium text-dark ${isHoverd ? "text-decoration-underline" : ""}`}
              style={{ cursor: "pointer" }}
              onMouseOver={() => setIsHoverd(true)}
              onMouseOut={() => setIsHoverd(false)}
              onClick={() => navigate(`/review/my/${review.memberId}`)}
            >
              {review.memberEmailNickName || "알 수 없음"}
            </div>
            <div className="small text-muted">
              {formatDate(review.insertedAt)}
            </div>
          </div>
        </div>

        {/* 수정/삭제 버튼 (오른쪽) */}
        {user?.email === review.memberEmail && (
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleEditStart}
              className="d-flex align-items-center"
            >
              <FaEdit className="me-1" /> 수정
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="d-flex align-items-center"
            >
              <FaTrashAlt className="me-1" /> 삭제
            </Button>
          </div>
        )}
      </div>

      {/* 태그 표시 */}
      {Array.isArray(review.tags) && review.tags.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-3">
          {review.tags.map((tag) => (
            <Badge key={tag.id} bg="secondary" className="fw-normal px-2 py-1">
              # {tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* 리뷰 본문 - 더보기 기능 추가 */}
      <div className="mb-3 p-3 bg-light rounded">
        <p
          className="mb-0 lh-base text-dark"
          style={{ whiteSpace: "pre-wrap" }}
        >
          {displayedReview}
        </p>
        {isLongReview && (
          <Button
            variant="link"
            size="sm"
            className="p-0 mt-2 text-decoration-none"
            onClick={() => setShowFullReview(!showFullReview)}
          >
            {showFullReview ? "간략히 보기" : "더보기"}
          </Button>
        )}
      </div>

      {/* 첨부 이미지 */}
      {allImages.length > 0 && (
        <div className="mb-3">
          <div className="d-flex gap-2 overflow-auto pb-2">
            {allImages.map((fileUrl, idx) => (
              <Image
                key={idx}
                src={fileUrl}
                alt={`첨부 이미지 ${idx + 1}`}
                className="shadow-sm rounded flex-shrink-0"
                width="120"
                height="120"
                style={{
                  objectFit: "cover",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                }}
                onClick={() =>
                  handleImageClick({
                    url: fileUrl,
                    nickName: review.memberEmailNickName,
                    // 이미지 없는데 왜 잘되지? 일반 모드라 그런가?
                  })
                }
                onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
                onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
              />
            ))}
          </div>
        </div>
      )}

      {/* PDF 파일 표시 */}
      {Array.isArray(review.files) &&
        review.files.filter((f) => !isImageUrl(f)).length > 0 && (
          <div className="mb-3">
            <div className="small text-muted mb-2">📎 첨부 파일</div>
            <div className="d-flex flex-wrap gap-2">
              {review.files
                .filter((f) => !isImageUrl(f))
                .map((fileUrl, idx) => {
                  const fileName = fileUrl.split("/").pop().split("?")[0];
                  return (
                    <a
                      key={idx}
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline-secondary btn-sm text-decoration-none"
                    >
                      📄 {fileName}
                    </a>
                  );
                })}
            </div>
          </div>
        )}

      {/* 이미지 확대 모달 */}
      <Modal
        show={showImageModal}
        onHide={handleCloseImageModal}
        centered
        size="xl"
      >
        <Modal.Header closeButton className="border-0 bg-transparent" />
        <Modal.Body
          className="d-flex justify-content-center align-items-center p-0 bg-transparent"
          style={{ minHeight: "400px" }}
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
        <Modal.Footer className="d-flex justify-content-start">
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
          <div className="text-muted">
            <strong>{review.memberEmailNickName}</strong>
          </div>
        </Modal.Footer>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>리뷰 삭제</Modal.Title>
        </Modal.Header>
        <Modal.Body>정말 삭제하시겠습니까?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            취소
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirmed}>
            삭제
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ReviewCard;
