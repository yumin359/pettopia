import { Outlet } from "react-router";
import { AppNavBar } from "./AppNavBar.jsx";
import { Card, Container, Button } from "react-bootstrap";
import { AppFooter } from "./AppFooter.jsx";
import { ChatButton } from "./ChatButton.jsx";
import { useContext } from "react";
import { AuthenticationContext } from "./AuthenticationContextProvider.jsx";
import { useNavigate } from "react-router";

export function MainLayout() {
  const { isAdmin } = useContext(AuthenticationContext);
  const navigate = useNavigate();

  return (
    <div
      className="min-vh-100"
      style={{
        backgroundColor: "#033C33", // 초록색 배경
        padding: "20px 0",
        position: "relative", // 플로팅 버튼 절대 위치 기준
      }}
    >
      {/* 전체를 감싸는 카드 */}
      <Container className="h-100">
        <Card
          className="shadow-lg mx-auto"
          style={{
            maxWidth: "1000px", // 카드 최대 너비
            minHeight: "calc(100vh - 40px)", // 화면 높이에서 패딩 제외
            borderRadius: "12px",
            overflow: "hidden",
            position: "relative", // 플로팅 버튼 절대 위치 기준
          }}
        >
          {/* 카드 내부 레이아웃 */}
          <div className="d-flex flex-column h-100">
            {/* 헤더 - 카드 상단 */}
            <AppNavBar />

            {/* 메인 콘텐츠 영역 */}
            <div className="flex-grow-1 p-4">
              <Outlet />
            </div>

            {/* 푸터 - 카드 하단 */}
            <AppFooter />
          </div>

          {/* 플로팅 채팅 버튼 - 카드 내부 우하단 */}
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "10px",
            }}
          >
            {/* 관리자 회원목록 버튼 - isAdmin 체크 */}
            {isAdmin() && (
              <Button
                variant="outline-warning"
                size="sm"
                onClick={() => navigate("/member/list")}
                style={{ minWidth: "120px" }}
              >
                회원목록 (관리자)
              </Button>
            )}

            <ChatButton />
          </div>
        </Card>
      </Container>
    </div>
  );
}
