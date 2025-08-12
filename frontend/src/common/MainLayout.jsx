// ==================== MainLayout.jsx ====================
import { Outlet } from "react-router";
import { AppNavBar } from "./AppNavBar.jsx";
import { AppFooter } from "./AppFooter.jsx";
import { ChatButton } from "./ChatButton.jsx";

export function MainLayout() {
  return (
    <div className="main-layout">
      <div className="main-container">
        {/* 네비게이션 바 */}
        <AppNavBar />

        {/* 메인 콘텐츠 영역 */}
        <div className="content-wrapper">
          <div className="content-inner">
            <Outlet />
          </div>

          {/* 푸터 */}
          <AppFooter />
        </div>

        {/* 플로팅 채팅 버튼 */}
        <div className="chat-button-container">
          <ChatButton />
        </div>
      </div>
    </div>
  );
}
