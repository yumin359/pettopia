import { Outlet } from "react-router";
import { AppNavBar } from "./AppNavBar.jsx";
import { AppFooter } from "./AppFooter.jsx";
import { ChatButton } from "./ChatButton.jsx";
import { useState, useEffect, useRef } from "react";

export function MainLayout() {
  const [isSticky, setSticky] = useState(false);
  const mainContainerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setSticky(true);
      } else {
        setSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {/* Sticky 네비게이션 - 똑같은 AppNavBar 사용 */}
      {isSticky && (
        <div className="sticky-navbar-wrapper">
          <AppNavBar />
        </div>
      )}

      <div className="main-layout">
        {/* 큰 흰색 카드 컨테이너 - 그림자 있음 */}
        <div className="main-container" ref={mainContainerRef}>
          {/* 기본 네비게이션 바 - 카드 상단에 위치 */}
          <AppNavBar />

          {/* 메인 콘텐츠 영역 */}
          <Outlet />

          {/* 플로팅 채팅 버튼 - 우측 하단 고정 */}
          <div className="chat-button-container">
            <ChatButton />
          </div>

          {/* 푸터 - 카드 하단 */}
          <AppFooter />
        </div>
      </div>
    </>
  );
}
