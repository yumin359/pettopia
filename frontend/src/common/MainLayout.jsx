import { Outlet } from "react-router";
import { AppNavBar } from "./AppNavBar.jsx";
import { Card, Container } from "react-bootstrap";
import { AppFooter } from "./AppFooter.jsx";
import { ChatButton } from "./ChatButton.jsx";

export function MainLayout() {
  return (
    <div
      className="min-vh-100"
      style={{
        backgroundColor: "#033C33", // 초록색 배경
        padding: "20px 0",
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
            }}
          >
            <ChatButton />
          </div>
        </Card>
      </Container>
    </div>
  );
}
