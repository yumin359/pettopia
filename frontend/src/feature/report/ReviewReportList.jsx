import { useEffect, useState, useContext } from "react";
import { Table, Alert, Spinner, OverlayTrigger, Tooltip, } from "react-bootstrap";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";
import { Navigate, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { BsCardText, BsCalendar2DateFill } from "react-icons/bs";
import { GoMail } from "react-icons/go";
import axios from "axios";
import "../../styles/ReviewReportList.css";
import { ReviewText } from "../../common/ReviewText.jsx";

export default function ReviewReportList() {
  const { isAdmin, loading: loadingAuth } = useContext(AuthenticationContext);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 🔹 모든 Hooks 최상위에서 호출

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
        setLoadingReports(false);
      }
    }
    fetchReports();
  }, []);

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

  function renderWithLineBreaks(text) {
    return text.split("\n").map((line, i) => (
      <span key={i}>
        {line}
        <br />
      </span>
    ));
  }

  const handleRowClick = (reviewWriterId) => {
    if (reviewWriterId) {
      navigate(`/review/my/${reviewWriterId}`);
    } else {
      alert("작성자 정보가 없습니다.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 fw-bold text-muted">리뷰 신고 내역 목록</h2>
      <Table className="review-report-table" responsive>
        <thead>
          <tr>
            <th>
              {/*<GoMail className="me-2" />*/}
              신고자 이메일
            </th>
            <th>
              {/*<BsCardText className="me-2" />*/}
              리뷰 ID
            </th>
            <th>
              {/*<BsCardText className="me-2" />*/}
              신고 사유
            </th>
            <th>
              {/*<BsCalendar2DateFill className="me-2" />*/}
              신고일
            </th>
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
                onClick={() => {
                  if (reviewWriterId) {
                    navigate(`/review/my/${reviewWriterId}`);
                  } else {
                    console.error("작성자 정보가 없어 이동할 수 없습니다.");
                  }
                }}
                title={reviewWriterId ? "작성자 리뷰 보기" : undefined}
              >
                <td>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-email-${id}`}>
                        {reporterEmail}
                      </Tooltip>
                    }
                  >
                    <span className="text-truncate d-block">
                      {reporterEmail}
                    </span>
                  </OverlayTrigger>
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
