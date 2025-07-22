import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import CommentAdd from "./CommentAdd";
import CommentList from "./CommentList";
import { useContext } from "react";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider";
import { Badge } from "react-bootstrap";

export function CommentContainer({ boardId }) {
  const [commentList, setCommentList] = useState([]);
  const { user } = useContext(AuthenticationContext); // 현재 로그인한 사용자
  const currentUserEmail = user?.email;

  function fetchComments() {
    axios
      .get(`/api/comment/list?boardId=${boardId}`)
      .then((res) => {
        setCommentList(Array.isArray(res.data) ? res.data : res.data.comments);
      })
      .catch(() => {
        toast.error("댓글 목록 불러오기 실패");
      });
  }

  function handleDelete(commentId) {
    axios
      .delete(`/api/comment/${commentId}`)
      .then(() => {
        toast.success("댓글이 삭제되었습니다.");
        fetchComments();
      })
      .catch(() => {
        toast.error("댓글 삭제 실패");
      });
  }

  function handleUpdate(commentId, newContent) {
    axios
      .put(`/api/comment/${commentId}`, { id: commentId, comment: newContent })
      .then(() => {
        toast.success("댓글이 수정되었습니다.");
        fetchComments();
      })
      .catch(() => {
        toast.error("댓글 수정 실패");
      });
  }

  useEffect(() => {
    fetchComments();
  }, [boardId]);

  return (
    <div>
      <h5 className="mb-0" style={{ fontWeight: "600" }}>
        댓글
        <Badge
          bg="primary"
          pill
          className="ms-1"
          style={{ fontSize: "0.7rem" }}
        >
          {commentList.length}
        </Badge>
      </h5>
      <CommentList
        comments={commentList}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        currentUserEmail={currentUserEmail}
      />
      <br />
      <CommentAdd boardId={boardId} onCommentSaved={fetchComments} />
    </div>
  );
}
