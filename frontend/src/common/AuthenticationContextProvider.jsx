import { createContext, useCallback, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

// 유효기간을 넘긴 토큰 삭제
const token = localStorage.getItem("token");
if (token) {
  const decoded = jwtDecode(token);
  const exp = decoded.exp;
  if (exp * 1000 < Date.now()) {
    localStorage.removeItem("token");
  }
}

// axios interceptor
// token 이 있으면 Authorization 헤더에 'Bearer token' 붙이기
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// step1. create context
const AuthenticationContext = createContext(null);

export function AuthenticationContextProvider({ children }) {
  const [user, setUser] = useState(null);

  const updateUser = useCallback((newUserInfo) => {
    // 현재 user 상태를 기반으로 새로운 정보를 덮어씁니다.
    setUser((currentUser) => {
      if (!currentUser) return null; // 혹시 로그아웃된 상태면 아무것도 안 함
      return {
        ...currentUser, // email, scope 등 기존 정보는 그대로 유지
        ...newUserInfo, // nickName 등 새로 들어온 정보만 변경
      };
    });
  }, []);

  // ✅ login 함수를 하나로 통합하고 정리합니다.
  // 이 함수는 토큰을 받아 저장하고, 사용자 정보를 가져와 상태를 업데이트합니다.
  const login = (token) => {
    localStorage.setItem("token", token);
    const payload = jwtDecode(token);
    axios
      .get("/api/member?email=" + payload.sub)
      .then((res) => {
        setUser({
          email: res.data.email,
          nickName: res.data.nickName,
          scope: payload.scp.split(" "),
        });
      })
      .catch((err) => {
        console.error("사용자 정보 로딩 실패:", err);
        // 토큰은 유효하지만 사용자 정보를 가져오지 못한 경우 로그아웃 처리
        logout();
      });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // ✅ 페이지가 처음 로드될 때 토큰이 있으면 로그인 상태를 복원합니다.
  useEffect(() => {
    const tokenInStorage = localStorage.getItem("token");
    if (tokenInStorage) {
      login(tokenInStorage); // 기존 login 함수를 재활용
    }
  }, []); // []를 사용하여 처음 한 번만 실행되도록 합니다.

  function hasAccess(email) {
    return user && user.email === email;
  }

  function isAdmin() {
    return user && user.scope && user.scope.includes("admin");
  }

  return (
    <AuthenticationContext.Provider
      value={{
        user,
        login, // 정리된 login 함수 제공
        logout,
        hasAccess,
        isAdmin,
        updateUser,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
}

export { AuthenticationContext };
