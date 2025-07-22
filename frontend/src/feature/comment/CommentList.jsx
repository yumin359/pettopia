import { useState } from "react";
import CommentEdit from "./CommentEdit";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

function CommentList({ comments = [], onDelete, onUpdate, currentUserEmail }) {
  const [editingId, setEditingId] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);

  const handleDeleteConfirm = () => {
    if (selectedCommentId !== null) {
      onDelete(selectedCommentId);
      setModalShow(false);
      setSelectedCommentId(null);
    }
  };

  if (!Array.isArray(comments) || comments.length === 0) {
    return <div className="mt-3 text-muted">아직 댓글이 없습니다.</div>;
  }

  return (
    <div className="mt-3">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="border rounded px-3 py-2 mb-2"
          style={{
            backgroundColor: "#f8f9fa",
            whiteSpace: "pre-wrap",
            position: "relative",
          }}
        >
          {editingId === comment.id ? (
            <CommentEdit
              initialValue={comment.comment}
              onCancel={() => setEditingId(null)}
              onSave={(newContent) => {
                onUpdate(comment.id, newContent);
                setEditingId(null);
              }}
            />
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong style={{ fontSize: "0.9rem" }}>
                    {comment.authorNickName}
                  </strong>{" "}
                  <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                    {comment.insertedAt}
                  </small>
                </div>
                {comment.authorEmail === currentUserEmail && (
                  <div className="d-flex gap-2">
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id={`edit-tooltip-${comment.id}`}>
                          수정
                        </Tooltip>
                      }
                    >
                      <Button
                        variant="link"
                        className="p-0 text-primary"
                        onClick={() => setEditingId(comment.id)}
                        aria-label="댓글 수정"
                      >
                        <FaEdit size={16} />
                      </Button>
                    </OverlayTrigger>

                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id={`delete-tooltip-${comment.id}`}>
                          삭제
                        </Tooltip>
                      }
                    >
                      <Button
                        variant="link"
                        className="p-0 text-danger"
                        onClick={() => {
                          setSelectedCommentId(comment.id);
                          setModalShow(true);
                        }}
                        aria-label="댓글 삭제"
                      >
                        <FaTrashAlt size={16} />
                      </Button>
                    </OverlayTrigger>
                  </div>
                )}
              </div>
              <p
                className="mt-1 mb-0"
                style={{
                  fontSize: "0.9rem",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }}
              >
                {comment.comment || (
                  <span className="text-muted">내용 없음</span>
                )}
              </p>
            </>
          )}
        </div>
      ))}

      <Modal show={modalShow} onHide={() => setModalShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>댓글 삭제 확인</Modal.Title>
        </Modal.Header>
        <Modal.Body>{selectedCommentId}번 댓글을 삭제하시겠습니까?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalShow(false)}>
            취소
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            삭제
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CommentList;
