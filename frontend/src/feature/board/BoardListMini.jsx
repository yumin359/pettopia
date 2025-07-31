import { Alert, Badge, Spinner, Table } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { FaRegComments, FaRegImages, FaThumbsUp } from "react-icons/fa";

export function BoardListMini() {
  const [boardList, setBoardList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);

    axios
      .get("/api/board/latest")
      .then((res) => setBoardList(res.data))
      .catch(() => {
        setError("게시글을 불러오는 중 오류가 발생했습니다.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center my-3 text-secondary small">
        <Spinner animation="border" size="sm" /> 불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-3 py-2 px-3 small">
        {error}
      </Alert>
    );
  }

  if (boardList.length === 0) {
    return <p className="text-muted mt-2 small">작성된 글이 없습니다.</p>;
  }

  return (
    <Table
      hover
      responsive
      size="sm"
      className="align-middle text-secondary"
      style={{ fontSize: "1.2rem", tableLayout: "fixed" }} // 글씨 크기 더 키움
    >
      <thead>
      <tr className="text-muted" style={{ height: "45px" }}>
        <th style={{ width: "50px" }}>#</th>
        <th style={{ width: "50px" }}>
          <FaThumbsUp size={18} />
        </th>
        <th>제목</th>
        <th style={{ width: "100px" }}>작성자</th>
        <th style={{ width: "120px" }}>작성일</th>
      </tr>
      </thead>
      <tbody>
      {boardList.map((board) => (
        <tr
          key={board.id}
          onClick={() => navigate(`/board/${board.id}`)}
          style={{ cursor: "pointer", height: "55px" }} // 행 높이도 더 키움
        >
          <td className="text-muted">{board.id}</td>
          <td className="text-muted">{board.countLike}</td>
          <td
            className="text-dark"
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            <div
              className="d-flex gap-2 align-items-center"
              style={{ overflow: "hidden" }}
            >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "inline-block",
                maxWidth: "100%",
              }}
            >
              {board.title}
            </span>

              {board.countFile > 0 && (
                <Badge bg="warning" text="dark">
                  <div className="d-flex gap-1">
                    <FaRegImages />
                    <span>{board.countFile}</span>
                  </div>
                </Badge>
              )}
            </div>
          </td>
          <td className="text-truncate text-muted" title={board.nickName}>
            {board.nickName}
          </td>
          <td className="text-muted">{board.timesAgo}</td>
        </tr>
      ))}
      </tbody>
    </Table>
  );
}
