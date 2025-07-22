// frontend/src/App.jsx
import React from "react";
import KakaoMap from "./KakaoMap"; // 새로 만든 KakaoMap 컴포넌트를 import

function App() {
  return (
    <>
      <div>
        <h1>프론트엔드 메인 페이지</h1>
      </div>
      <KakaoMap /> {/* KakaoMap 컴포넌트를 여기에 렌더링합니다. */}
      {/* ToastContainer는 main.jsx에서 전역적으로 관리되므로 App.jsx에서는 필요 없습니다. */}
    </>
  );
}

export default App;
