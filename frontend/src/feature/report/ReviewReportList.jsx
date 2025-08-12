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

  // 관리자 권한 체크
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
      <Table striped bordered hover>
        <thead>
        <tr>
          <th>신고자 이메일</th>
          <th>리뷰 ID</th>
          <th>신고 사유</th>
          <th>신고일</th>
        </tr>
        </thead>
        <tbody>
        {reports.map(({ id, reporterEmail, reviewId, reason, reportedAt }) => (
          <tr key={id}>
            <td
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/member?email=${encodeURIComponent(reporterEmail)}`)}
              title="멤버 상세보기"
              className="text-dark"
            >
              {reporterEmail}
            </td>
            <td>{reviewId}</td>
            <td style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {reason.length > 100 ? reason.substring(0, 100) + "..." : reason}
            </td>
            <td>{new Date(reportedAt).toLocaleString()}</td>
          </tr>
        ))}
        </tbody>
      </Table>
    </div>
  );
}
