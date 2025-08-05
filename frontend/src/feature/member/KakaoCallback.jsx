import React, { useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider"; // 경로 확인 필요
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

export function KakaoCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 1. AuthenticationContext에서 login 함수를 가져옵니다.
  const { login } = useContext(AuthenticationContext);

  useEffect(() => {
    // 2. URL에서 인가 코드(code)를 추출합니다.
    const code = searchParams.get("code");

    if (code) {
      // 3. 백엔드에 코드를 보내 JWT 토큰을 요청합니다.
      axios
        .post("/api/member/login/kakao", { code })
        .then((response) => {
          const { token } = response.data;
          if (token) {
            // 4. 성공적으로 토큰을 받으면, Context의 login 함수를 호출합니다.
            login(token);
            toast.success("카카오 계정으로 로그인되었습니다.");
            navigate("/"); // 로그인 성공 후 메인 페이지로 이동
          } else {
            throw new Error("토큰이 수신되지 않았습니다.");
          }
        })
        .catch((error) => {
          console.error("카카오 로그인 처리 중 오류 발생:", error);
          toast.error("로그인에 실패했습니다. 다시 시도해주세요.");
          navigate("/login"); // 실패 시 로그인 페이지로 이동
        });
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Spinner animation="border" />
      <span className="ms-3">카카오 로그인 처리 중입니다...</span>
    </div>
  );
}
