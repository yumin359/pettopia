import { Outlet } from "react-router";
import { AppNavBar } from "./AppNavBar.jsx";
import { Container } from "react-bootstrap";
import { AppFooter } from "./AppFooter.jsx";
import { ChatButton } from "./ChatButton.jsx"; // ✅ 추가

export function MainLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="mb-3">
        <AppNavBar />
      </div>
      <Container fluid className="flex-grow-1" style={{ paddingTop: "80px" }}>
        <Outlet />
      <Outlet />
      </Container>
      <br />
      <br />
      <AppFooter />

      {/* ✅ 오른쪽 하단 채팅 버튼 */}
      <ChatButton />
    </div>
  );
}
