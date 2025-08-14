import { useEffect, useState, useContext } from "react";
import { Table, Alert, Spinner } from "react-bootstrap";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ReviewReportList() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAdmin } = useContext(AuthenticationContext);
  const navigate = useNavigate();

  if (!(typeof isAdmin === "function" ? isAdmin() : isAdmin)) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await axios.get("/api/review/report/list");
        setReports(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          setError("로그인이 필요합니다.");
        } else if (err.response?.status === 403) {
          setError("권한이 없습니다.");
        } else {
          setError("서버 오류로 신고 내역을 불러올 수 없습니다.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  function renderWithLineBreaks(text) {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        <br />
      </span>
    ));
  }

  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" />
        <div>불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (reports.length === 0) {
    return <Alert variant="info">신고된 리뷰가 없습니다.</Alert>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2 className="mb-4">리뷰 신고 내역 목록</h2>
      <Table striped bordered hover style={{ tableLayout: "fixed", width: "100%" }}>
        <thead>
        <tr style={{ cursor: "default" }}>
          <th style={{ width: "25%", wordBreak: "break-word" }}>신고자 이메일</th>
          <th style={{ width: "10%", wordBreak: "break-word" }}>리뷰 ID</th>
          <th style={{ width: "45%", wordBreak: "break-word" }}>신고 사유</th>
          <th style={{ width: "20%", wordBreak: "break-word" }}>신고일</th>
        </tr>
        </thead>
        <tbody>
        {reports.map(({ id, reporterEmail, reviewId, reason, reportedAt, reviewWriterId }) => (
          <tr
            key={id}
            style={{ cursor: reviewWriterId ? "pointer" : "default" }}
            onClick={() => {
              if (reviewWriterId) {
                navigate(`/review/my/${reviewWriterId}`);
              } else {
                alert("작성자 정보가 없습니다.");
              }
            }}
            title={reviewWriterId ? "작성자 리뷰 보기" : undefined}
          >
            <td style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{reporterEmail}</td>
            <td style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{reviewId}</td>
            <td style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {reason.length > 100
                ? renderWithLineBreaks(reason.substring(0, 100)) + "..."
                : renderWithLineBreaks(reason)}
            </td>
            <td style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
              {new Date(reportedAt).toLocaleString()}
            </td>
          </tr>
        ))}
        </tbody>
      </Table>
    </div>
  );
}
