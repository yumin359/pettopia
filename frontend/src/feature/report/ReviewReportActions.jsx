import React, { useState } from "react";
import { Dropdown, Modal, Button } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";

export default function ReviewReportActions({
  reportId,
  reviewId,
  handleDeleteReportOnly,
  handleDeleteReview,
}) {
  const [actionType, setActionType] = useState(null); // "report" | "review"
  const [showModal, setShowModal] = useState(false);

  const handleAction = (e, type) => {
    e.stopPropagation(); // ⭐️ 이벤트 버블링 중지
    setActionType(type);
    setShowModal(true);
  };

  const confirmAction = () => {
    if (actionType === "report") {
      handleDeleteReportOnly(reportId);
    } else if (actionType === "review") {
      handleDeleteReview(reviewId);
    }
    setShowModal(false);
  };

  return (
    <>
      {/* 드롭다운 */}
      <Dropdown onClick={(e) => e.stopPropagation()}>
        <Dropdown.Toggle variant="outline-danger" size="sm">
          <FaTrash /> 삭제
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item onClick={(e) => handleAction(e, "report")}>
            신고 내역만 삭제
          </Dropdown.Item>
          <Dropdown.Item onClick={(e) => handleAction(e, "review")}>
            리뷰 삭제 (신고 포함)
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      {/* 모달 (재사용) */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {actionType === "report" ? "신고 내역 삭제" : "리뷰 삭제"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actionType === "report"
            ? "정말 이 신고 내역을 삭제하시겠습니까?"
            : "리뷰와 관련된 모든 신고가 함께 삭제됩니다. 진행하시겠습니까?"}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            취소
          </Button>
          <Button variant="danger" onClick={confirmAction}>
            확인
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
