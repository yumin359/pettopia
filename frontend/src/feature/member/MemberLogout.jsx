import { Spinner } from "react-bootstrap";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";

export function MemberLogout() {
  // 2️⃣ use context
  const { logout } = useContext(AuthenticationContext);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("✅ 로그아웃 성공:");
    logout();

    toast("로그아웃 되었습니다.", { type: "success" });
    navigate("/login");
  }, []);
  return <Spinner />;
}
