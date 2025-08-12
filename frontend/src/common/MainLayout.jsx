import { Outlet } from "react-router";
import { AppNavBar } from "./AppNavBar.jsx";
import { AppFooter } from "./AppFooter.jsx";
import { ChatButton } from "./ChatButton.jsx";

export function MainLayout() {
  return (
    <div className="main-layout">
      {/* 큰 흰색 카드 컨테이너 - 그림자 있음 */}
      <div className="main-container">
        {/* 기본 네비게이션 바 - 카드 상단에 위치 */}
        <AppNavBar />

        {/* 메인 콘텐츠와 푸터를 flex로 감싸기 */}
        <div className="main-content-wrapper">
          {/* 메인 콘텐츠 영역 */}
          <div className="content-area">
            <Outlet />
          </div>

          {/* 푸터 - 항상 맨 아래 */}
          <div className="footer-area p-0 mx-0">
            <AppFooter />
          </div>
        </div>

        {/* 플로팅 채팅 버튼 - 우측 하단 고정 */}
        <div className="chat-button-container">
          <ChatButton />
        </div>
      </div>
    </div>
  );
}
