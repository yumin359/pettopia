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

export default function ReviewReportList() {
  const { isAdmin, loading: loadingAuth } = useContext(AuthenticationContext);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null); // 삭제중인 id
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
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

  // 모달 열기
  const handleShowDeleteModal = (event, id) => {
    event.stopPropagation();
    setReportToDelete(id);
    setShowDeleteModal(true);
  };

  // 모달 닫기
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setReportToDelete(null); // 상태 초기화
  };

  // 삭제 처리 함수 (버튼 클릭 시 호출)
  async function handleDeleteReport() {
    if (!reportToDelete) return;

    try {
      setDeletingId(reportToDelete);
      await axios.delete(`/api/review/${reportToDelete}`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      toast.success("신고 삭제 완료되었습니다.");
      // 성공하면 로컬 상태에서 제거
      setReports((prev) =>
        prev.filter((r) => String(r.id) !== String(reportToDelete)),
      );
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        toast.error("로그인이 필요합니다.");
      } else if (err.response?.status === 403) {
        toast.error("권한이 없습니다.");
      } else {
        // 서버가 반환한 텍스트가 있으면 보여주기
        const message =
          err.response?.data ||
          err.response?.data?.message ||
          "삭제 중 오류가 발생했습니다.";
        toast.error(message);
      }
    } finally {
      setDeletingId(null);
      handleCloseDeleteModal();
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
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-delete-${id}`}>신고 삭제</Tooltip>
                      }
                    >
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={(e) => handleShowDeleteModal(e, id)}
                        disabled={deletingId === id}
                        aria-label={`delete-report-${id}`}
                      >
                        {deletingId === id ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <FaTrash />
                        )}
                      </Button>
                    </OverlayTrigger>
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

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>신고 삭제 확인</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          이 신고를 정말 삭제하시겠습니까? (되돌릴 수 없습니다)
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseDeleteModal}>
            취소
          </Button>
          <Button variant="danger" onClick={handleDeleteReport}>
            삭제
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
