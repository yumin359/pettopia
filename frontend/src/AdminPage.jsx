import { Button, Col, Row } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthenticationContext } from "./common/AuthenticationContextProvider.jsx";

export function AdminPage() {
  const navigate = useNavigate();
  const { isAdmin } = useContext(AuthenticationContext);

  if (!(typeof isAdmin === "function" ? isAdmin() : isAdmin)) {
    alert("권한없음");
    return <Navigate to="/" replace />;
  }

  return (
    <Row className="mt-4">
      {/* 왼쪽 사이드바 */}
      <Col md={3} className="border-end">
        <div className="d-flex flex-column gap-2">
          <Button
            variant="outline-warning"
            size="sm"
            onClick={() => navigate("/admin/member/list")}
          >
            회원 목록
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => navigate("/admin/support/list")}
          >
            문의 내역
          </Button>
        </div>
      </Col>

      {/* 오른쪽 콘텐츠 영역 */}
      <Col md={9}>
        <Outlet /> {/* 여기에 하위 라우트 컴포넌트가 렌더링됨 */}
      </Col>
    </Row>
  );
}
