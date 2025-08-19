import React, { useState } from "react";
import { Dropdown, Modal, Button } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";

export default function ReviewReportActions({
  reportId,
  reviewId,
  handleDeleteReportOnly,
  handleDeleteReview,
  isDropdownOpen, // 드롭다운 상태
  handleToggleDropdown, // 토글 함수
}) {
  const [actionType, setActionType] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 이벤트 버블링을 중지하는 헬퍼 함수
  const stopBubbling = (e) => {
    e.stopPropagation();
  };

  const handleAction = (e, type) => {
    stopBubbling(e);
    setActionType(type);
    setShowModal(true);
  };

  const handleCloseModal = (e) => {
    if (e) stopBubbling(e);
    setShowModal(false);
  };

  const confirmAction = (e) => {
    stopBubbling(e);
    if (actionType === "report") {
      handleDeleteReportOnly(reportId);
    } else if (actionType === "review") {
      handleDeleteReview(reviewId);
    }
    setShowModal(false);
  };

  return (
    <div className="review-actions-container">
      {/* show와 onToggle prop으로 부모의 상태와 함수를 제어합니다. */}
      <Dropdown
        show={isDropdownOpen}
        onToggle={() => handleToggleDropdown(reportId)}
        container={document.body}
      >
        <Dropdown.Toggle variant="outline-danger" size="sm">
          <FaTrash /> 삭제
        </Dropdown.Toggle>

        <Dropdown.Menu renderOnMount popperConfig={{ strategy: "fixed" }}>
          <Dropdown.Item onClick={(e) => handleAction(e, "report")}>
            신고 내역만 삭제
          </Dropdown.Item>
          <Dropdown.Item onClick={(e) => handleAction(e, "review")}>
            리뷰 삭제 (신고 포함)
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      {/* 모달 (재사용) */}
      <Modal
        show={showModal}
        centered
        onHide={handleCloseModal}
        onClick={stopBubbling}
      >
        <Modal.Header closeButton onClick={handleCloseModal}>
          <Modal.Title className="fw-bold">
            {actionType === "report"
              ? "⚠️ 신고 내역 삭제 ⚠️"
              : "🚨 리뷰 삭제 🚨"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actionType === "report"
            ? "정말 이 신고 내역을 삭제하시겠습니까?"
            : "리뷰와 관련된 모든 신고가 함께 삭제됩니다. 진행하시겠습니까?"}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            취소
          </Button>
          {actionType === "report" ? (
            <Button variant="warning" onClick={confirmAction}>
              확인
            </Button>
          ) : (
            <Button variant="danger" onClick={confirmAction}>
              확인
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
