import {
  Button,
  Col,
  FormControl,
  FormGroup,
  FormLabel,
  Row,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";

export function MemberLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { login } = useContext(AuthenticationContext);
  const navigate = useNavigate();

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

      login(token);

      if (res.data.message) {
        toast(res.data.message.text, { type: res.data.message.type });
      }

      navigate("/");
    } catch (err) {
      setErrorMsg("로그인에 실패했습니다. 이메일 또는 비밀번호를 확인하세요.");
    } finally {
      setLoading(false);
    }
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

        {/* 회원가입 버튼 추가 */}
        <div className="d-grid">
          <Button variant="outline-primary" onClick={() => navigate("/signup")}>
            회원가입
          </Button>
        </div>
      </Col>
    </Row>
  );
}
