// AppNavBar.jsx

import { Link, NavLink } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useContext } from "react";
import { AuthenticationContext } from "./AuthenticationContextProvider.jsx";
import { FaUserCircle } from "react-icons/fa";

export function AppNavBar() {
  const { user, isAdmin } = useContext(AuthenticationContext);

  // NavLink가 활성화되었을 때 적용할 스타일
  const activeLinkStyle = {
    fontWeight: "bold",
    color: "black", // 활성화 시 색상 고정
  };

  const navLinkStyle = {
    color: "#333", // 비활성화 시 색상
    textDecoration: "none",
    margin: "0 1.5rem", // 메뉴 간 간격
    fontSize: "1.1rem",
  };

  return (
    // ✅ fixed-top 제거하고 카드 내부에서 작동하도록 수정
    <div style={{ position: "sticky", top: 0, zIndex: 1000 }}>
      {/* 1. 상단 바 (로고, 로그인) */}
      <Navbar
        style={{
          backgroundColor: "#FF9D00",
          padding: "0.5rem 0",
          minHeight: "280px",
        }}
      >
        <Container className="d-flex flex-column justify-content-center align-items-center">
          {/* 로고 */}
          <Navbar.Brand
            as={Link}
            to="/"
            className="d-flex flex-column align-items-center"
            style={{ textDecoration: "none" }}
          >
            <img
              src="/PETOPIA-Photoroom.png"
              alt="로고"
              height="250"
              style={{ filter: "brightness(0%)" }}
            />
            <h6
              className="text-center fw-bold fst-italic mb-0"
              style={{ color: "black", marginTop: "-30px" }}
            >
              지금, 펫프렌들리 스팟을 발견하세요!
            </h6>
            <br />
          </Navbar.Brand>
        </Container>
      </Navbar>

      {/* 2. 하단 바 (메인 메뉴) */}
      <Navbar
        style={{
          backgroundColor: "#FF9D00",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Container className="justify-content-center">
          <Nav>
            <NavLink
              to="/"
              style={({ isActive }) =>
                isActive
                  ? { ...navLinkStyle, ...activeLinkStyle }
                  : navLinkStyle
              }
            >
              HOME
            </NavLink>
            <NavLink
              to="/kakaoMap"
              style={({ isActive }) =>
                isActive
                  ? { ...navLinkStyle, ...activeLinkStyle }
                  : navLinkStyle
              }
            >
              MAP
            </NavLink>
            <NavLink
              to="/board/list"
              style={({ isActive }) =>
                isActive
                  ? { ...navLinkStyle, ...activeLinkStyle }
                  : navLinkStyle
              }
            >
              NEWS
            </NavLink>
            <NavLink
              to="/service"
              style={({ isActive }) =>
                isActive
                  ? { ...navLinkStyle, ...activeLinkStyle }
                  : navLinkStyle
              }
            >
              SUPPORT
            </NavLink>
            {isAdmin() && (
              <NavLink
                to="/member/list"
                style={({ isActive }) =>
                  isActive
                    ? { ...navLinkStyle, ...activeLinkStyle }
                    : navLinkStyle
                }
              >
                MEMBERLIST
              </NavLink>
            )}
          </Nav>
          {/* 로그인/사용자 정보 - 우측으로 이동 */}
          <Nav>
            {!user ? (
              <Button as={Link} to="/login" variant="light" size="sm">
                LOGIN
              </Button>
            ) : (
              <Nav.Link
                as={NavLink}
                to={`/member?email=${user.email}`}
                className="d-flex align-items-center"
                style={{ color: "white" }}
              >
                <FaUserCircle size={22} className="me-2" />
                {user.nickName}
              </Nav.Link>
            )}
          </Nav>
        </Container>
      </Navbar>
    </div>
  );
}
