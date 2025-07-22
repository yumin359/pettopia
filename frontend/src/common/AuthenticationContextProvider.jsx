import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

// 토큰 만료되었으면 삭제
const token = localStorage.getItem("token");
if (token) {
  const decoded = jwtDecode(token);
  if (decoded.exp * 1000 < Date.now()) {
    localStorage.removeItem("token");
  }
}

// Axios 요청 인터셉터
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AuthenticationContext = createContext(null);

export function AuthenticationContextProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = jwtDecode(token);
      console.log("Decoded payload on mount:", payload);
      axios.get("/api/member?email=" + payload.sub).then((res) => {
        const scopes = payload?.scp?.split(" ") ?? [];
        console.log("User scopes on mount:", scopes);
        setUser({
          email: res.data.email,
          nickName: res.data.nickName,
          scope: scopes,
        });
      });
    }
  }, []);

  function login(token) {
    localStorage.setItem("token", token);
    const payload = jwtDecode(token);
    console.log("Decoded payload on login:", payload);
    axios.get("/api/member?email=" + payload.sub).then((res) => {
      const scopes = payload?.scp?.split(" ") ?? [];
      console.log("User scopes on login:", scopes);
      setUser({
        email: res.data.email,
        nickName: res.data.nickName,
        scope: scopes,
      });
    });
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  function hasAccess(email) {
    return user && user.email === email;
  }

  function isAdmin() {
    console.log("Checking admin scope for user:", user);
    return user && user.scope.includes("admin");
  }

  return (
    <AuthenticationContext.Provider
      value={{
        user,
        login,
        logout,
        hasAccess,
        isAdmin,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
}

export { AuthenticationContext };
