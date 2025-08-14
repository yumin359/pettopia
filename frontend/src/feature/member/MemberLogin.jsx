import {
  Button,
  Col,
  Form,
  FormControl,
  FormGroup,
  FormLabel,
  Row,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
// 사용자의 기존 경로를 유지합니다.
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";

// --- MemberLogin 컴포넌트 ---
// 이 컴포넌트는 로그인 UI를 보여주고, 로그인 액션을 처리하는 역할만 담당합니다.
export function MemberLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // AuthenticationContext에서 login 함수를 가져옵니다.
  const { login } = useContext(AuthenticationContext);
  const navigate = useNavigate();

  // 이메일/비밀번호 로그인 핸들러 (기존 코드와 동일하며, 아주 좋습니다)
  async function handleLogInButtonClick() {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMsg("이메일과 비밀번호를 모두 입력하세요.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await axios.post("/api/member/login", {
        email: trimmedEmail,
        password: trimmedPassword,
      });

      const token = res.data.token;
      if (!token) {
        setErrorMsg("로그인에 실패했습니다. 토큰이 없습니다.");
        setLoading(false);
        return;
      }

      // 로그인 성공 시 Context의 login 함수 호출
      login(token);
      toast.success("로그인 되었습니다.");
      navigate("/");
    } catch (err) {
      const message =
        err.response?.data?.message?.text ||
        "로그인에 실패했습니다. 이메일 또는 비밀번호를 확인하세요.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }

  // 카카오 로그인 핸들러
  function handleKakaoLoginClick() {
    const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_APP_KEY;
    const KAKAO_REDIRECT_URI = "http://localhost:5173/auth/kakao/callback";

    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;

    // 카카오 인증 페이지로 이동
    window.location.href = kakaoAuthUrl;
  }

  // 구글 로그인 핸들러 (기존 코드와 동일)
  function handleGoogleLoginClick() {
    toast.info("Google 로그인 기능은 아직 구현되지 않았습니다.");
  }

  return (
    <Row className="justify-content-center mt-4">
      <Col xs={12} md={8} lg={6}>
        <h2 className="mb-4">로그인</h2>

        {errorMsg && (
          <Alert variant="danger" className="mb-3">
            {errorMsg}
          </Alert>
        )}

        {/* --- 폼 그룹 --- */}
        {/* FormGroup, FormControl 등은 최신 react-bootstrap에서 Form.Group, Form.Control로 사용하는 것을 권장합니다. */}
        {/* 하지만 기존 코드가 동작한다면 그대로 두어도 괜찮습니다. */}
        <FormGroup controlId="email1" className="mb-3">
          <FormLabel>이메일</FormLabel>
          <FormControl
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </FormGroup>

        <FormGroup controlId="password1" className="mb-3">
          <FormLabel>비밀번호</FormLabel>
          <FormControl
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </FormGroup>

        {/* --- 버튼 그룹 --- */}
        <div className="d-grid mb-3">
          <Button
            variant="primary"
            onClick={handleLogInButtonClick}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                로그인 중...
              </>
            ) : (
              "로그인"
            )}
          </Button>
        </div>

        {/* 카카오 로그인 버튼 */}
        <div className="d-grid mb-3">
          <Button
            onClick={handleKakaoLoginClick}
            disabled={loading}
            style={{
              backgroundColor: "#FEE500",
              color: "#191919",
              border: "none",
              fontWeight: "bold",
            }}
          >
            <img
              src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_small.png"
              alt="카카오 로고"
              style={{
                width: "22px",
                marginRight: "8px",
                verticalAlign: "middle",
              }}
            />
            카카오로 로그인
          </Button>
        </div>


        <hr />

        {/* 회원가입 버튼 */}
        <div className="d-grid">
          <Button variant="outline-primary" onClick={() => navigate("/signup")}>
            회원가입
          </Button>
        </div>
      </Col>
    </Row>
  );
}
