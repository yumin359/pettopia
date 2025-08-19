import { useEffect, useState, useContext } from "react";
import {
  Table,
  Alert,
  Spinner,
  OverlayTrigger,
  Tooltip,
  Button,
  Modal,
} from "react-bootstrap";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";
import { Navigate, useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import axios from "axios";
import "../../styles/ReviewReportList.css";
import { ReviewText } from "../../common/ReviewText.jsx";
import { toast } from "react-toastify";
import ReviewReportActions from "./ReviewReportActions.jsx";

export default function ReviewReportList() {
  const { isAdmin, loading: loadingAuth } = useContext(AuthenticationContext);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null); // 삭제할 리뷰 ID -> reviewId
  const [reportToDelete, setReportToDelete] = useState(null); // 신고 ID -> id
  const navigate = useNavigate();

  // 토큰을 읽어 Authorization 헤더 객체 반환 (프로젝트에 맞게 수정 가능)
  function getAuthHeader() {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // 🔹 모든 Hooks 최상위에서 호출
  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await axios.get("/api/review/report/list", {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });
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
        setLoadingReports(false);
      }
    }
    fetchReports();
  }, []);

  // 리뷰 신고 삭제 방법 1 : 신고 내역만 삭제
  async function handleDeleteReportOnly(id) {
    if (reportToDelete) return;
    setReportToDelete(id); // 삭제 중 상태로 설정

    try {
      // API 호출: 신고 내역만 삭제하는 엔드포인트
      // 엔드포인트는 /api/review/report/{id} 와 같이 명확하게 분리하는 것이 좋습니다. -> 백엔드 처리
      await axios.delete(`/api/review/report/${id}`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      toast.success("신고 내역이 성공적으로 삭제되었습니다.");

      // 로컬 상태에서 해당 신고 내역만 제거
      setReports((prev) => prev.filter((r) => String(r.id) !== String(id)));
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "신고 내역 삭제 중 오류가 발생했습니다.",
      );
    } finally {
      setReportToDelete(null); // 삭제 상태 해제
    }
  }

  // 리뷰 신고 삭제 방법 2 : 리뷰와 관련된 모든 신고를 함께 삭제
  async function handleDeleteReview(reviewId) {
    if (deletingId) return;
    setDeletingId(reviewId); // 삭제 중 상태로 설정

    try {
      // API 호출: 리뷰를 삭제하는 엔드포인트
      // 백엔드에서 이 요청을 받으면, 리뷰에 연결된 신고 내역들을 먼저 삭제하고, 리뷰를 삭제해야 합니다.
      await axios.delete(`/api/review/delete/${reviewId}`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      toast.success("리뷰와 관련된 모든 신고가 삭제되었습니다.");

      // 로컬 상태에서 해당 리뷰 ID와 연결된 모든 신고 내역 제거 -> 확인 하기 @@@@@@@@@@@
      setReports((prev) =>
        prev.filter((r) => String(r.reviewId) !== String(reviewId)),
      );
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          "리뷰와 신고 삭제 중 오류가 발생했습니다.",
      );
    } finally {
      setDeletingId(null); // 삭제 상태 해제
    }
  }

  // 🔹 인증 상태 로딩 중이면 로딩 화면
  if (loadingAuth || loadingReports) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
        <div className="mt-2 text-muted">데이터를 불러오는 중입니다...</div>
      </div>
    );
  }

  // 🔹 admin 체크 후 접근 제한
  if (!isAdmin()) {
    return <Navigate to="/login" replace />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (reports.length === 0) {
    return <Alert variant="info">신고된 리뷰가 없습니다.</Alert>;
  }

  const handleRowClick = (reviewWriterId, reviewId) => {
    if (reviewWriterId) {
      navigate(`/review/my/${reviewWriterId}?focusReviewId=${reviewId}`);
    } else {
      toast.error("작성자 정보가 없습니다.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 fw-bold text-muted">리뷰 신고 내역 목록</h2>
      <Table className="review-report-table" responsive>
        <thead>
          <tr>
            <th>신고자 이메일</th>
            <th>리뷰 ID</th>
            <th>신고 사유</th>
            <th>신고일</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(
            ({
              id,
              reporterEmail,
              reviewId,
              reason,
              reportedAt,
              reviewWriterId,
            }) => (
              <tr
                key={id}
                className={reviewWriterId ? "clickable-row" : ""}
                onClick={() => handleRowClick(reviewWriterId, reviewId)}
                title={reviewWriterId ? "작성자 리뷰 보기" : undefined}
              >
                <td className="reporter-email-cell">
                  <div className="d-flex align-items-center">
                    <div
                      className="flex-grow-1 text-truncate me-2"
                      title={reporterEmail}
                    >
                      {reporterEmail}
                    </div>
                    {/* 드롭다운 버튼 컴포넌트 */}
                    <ReviewReportActions
                      reportId={id}
                      reviewId={reviewId}
                      handleDeleteReportOnly={handleDeleteReportOnly}
                      handleDeleteReview={handleDeleteReview}
                    />
                  </div>
                </td>

                <td>{reviewId}</td>
                <td className="reason-cell">
                  <ReviewText text={reason} />
                </td>
                <td>{reportedAt ? reportedAt.substring(0, 10) : "-"}</td>
              </tr>
            ),
          )}
        </tbody>
      </Table>
    </div>
  );
}
