import { BrowserRouter, Route, Routes } from "react-router-dom"; // react-router-dom으로 변경하는 것이 좋습니다.
import { MainLayout } from "./common/MainLayout.jsx";
import { BoardLayout } from "./feature/board/BoardLayout.jsx";
import { BoardAdd } from "./feature/board/BoardAdd.jsx";
import { BoardList } from "./feature/board/BoardList.jsx";
import { BoardDetail } from "./feature/board/BoardDetail.jsx";
import { BoardEdit } from "./feature/board/BoardEdit.jsx";
import { MemberAdd } from "./feature/member/MemberAdd.jsx";
import { MemberDetail } from "./feature/member/MemberDetail.jsx";
import { MemberList } from "./feature/member/MemberList.jsx";
import { MemberEdit } from "./feature/member/MemberEdit.jsx";
import { MemberLogin } from "./feature/member/MemberLogin.jsx";
// import { MemberLogout } from "./feature/member/MemberLogout.jsx";
import { AuthenticationContextProvider } from "./common/AuthenticationContextProvider.jsx";
import { MapDetail } from "./feature/map/MapDetail.jsx";
import FullFilterKakaoMap from "./feature/map/FullFilterKakaoMap";
import { ReviewAdd } from "./feature/map/ReviewAdd.jsx";
import { Chatbot } from "./feature/openai/Chatbot";
import { ReviewEdit } from "./feature/map/ReviewEdit.jsx";
import { ReviewListMini } from "./feature/board/ReviewListMini.jsx";
import ServicePage from "./feature/service/ServicePage.jsx";
import ServiceListPage from "./feature/service/ServiceListPage.jsx";
import { MyReview } from "./feature/review/MyReview.jsx";

// ✅ 1. KakaoCallback 컴포넌트를 import 합니다.
import { KakaoCallback } from "./feature/member/KakaoCallback.jsx";
import { AdminPage } from "./AdminPage.jsx";

function App() {
  return (
    // ✅ 2. 불필요한 value={{}} prop을 제거합니다.
    <AuthenticationContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<BoardLayout />} />
            <Route path="/board/add" element={<BoardAdd />} />
            <Route path="/board/list" element={<BoardList />} />
            <Route path="/board/:id" element={<BoardDetail />} />
            <Route path="/board/edit" element={<BoardEdit />} />
            <Route path="/signup" element={<MemberAdd />} />
            <Route path="/login" element={<MemberLogin />} />

            {/* 카카오 로그인 콜백 라우트가 정확하게 설정되었습니다. */}
            <Route path="/auth/kakao/callback" element={<KakaoCallback />} />

            <Route path="/member" element={<MemberDetail />} />
            <Route path="/member/edit" element={<MemberEdit />} />
            <Route path="/facility/:name" element={<MapDetail />} />
            <Route path="/KakaoMap" element={<FullFilterKakaoMap />} />
            <Route path="/facility/:name/review/add" element={<ReviewAdd />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/review/my" element={<MyReview />} />
            <Route path="/review/edit/:id" element={<ReviewEdit />} />
            <Route path="/review/latest" element={<ReviewListMini />} />
            <Route path="/support" element={<ServicePage />} />

            <Route path="/admin" element={<AdminPage />}>
              <Route path="member/list" element={<MemberList />} />
              <Route path="support/list" element={<ServiceListPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthenticationContextProvider>
  );
}

export default App;
