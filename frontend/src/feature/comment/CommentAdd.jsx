import {
  Button,
  FormControl,
  FormLabel,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";
import { FiSend } from "react-icons/fi";

function CommentAdd({ boardId, onCommentSaved }) {
  const [comment, setComment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useContext(AuthenticationContext);

  function handleCommentSaveClick() {
    if (!comment.trim()) {
      alert("댓글 내용을 입력하세요.");
      return;
    }

    setIsProcessing(true);

    axios
      .post("/api/comment", { boardId, comment })
      .then(() => {
        setComment("");
        toast.success("댓글이 등록되었습니다.");
        if (onCommentSaved) {
          onCommentSaved();
        }
      })
      .catch(() => {
        toast.error("댓글 등록 중 오류가 발생했습니다.");
      })
      .finally(() => {
        setIsProcessing(false);
      });
  }

  const saveButtonDisabled = comment.trim().length === 0 || !user;

  return (
    <InputGroup className="mt-2" style={{ maxWidth: "100%" }}>
      <div style={{ position: "relative", flexGrow: 1 }}>
        {/* 라벨을 comment가 비어있을 때만 보여줌 */}
        {!comment && (
          <FormLabel
            htmlFor="commentTextarea"
            style={{
              position: "absolute",
              top: "10px",
              left: "12px",
              color: "#6c757d",
              pointerEvents: "none",
              userSelect: "none",
              fontSize: "0.9rem",
              transition: "opacity 0.2s ease",
            }}
          >
            {user ? "댓글을 작성해보세요." : "댓글을 작성하려면 로그인하세요."}
          </FormLabel>
        )}

        <FormControl
          as="textarea"
          id="commentTextarea"
          placeholder=""
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
          disabled={!user}
          style={{
            resize: "none",
            minHeight: "38px",
            maxHeight: "120px",
            overflow: "hidden",
          }}
        />
      </div>

      <Button
        variant="primary"
        disabled={saveButtonDisabled || isProcessing}
        onClick={handleCommentSaveClick}
        style={{
          minWidth: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label="댓글 등록"
      >
        {isProcessing ? (
          <Spinner size="sm" animation="border" />
        ) : (
          <FiSend size={20} />
        )}
      </Button>
    </InputGroup>
  );
}

export default CommentAdd;
