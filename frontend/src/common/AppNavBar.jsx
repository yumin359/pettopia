import { Link, NavLink } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useContext } from "react";
import { AuthenticationContext } from "./AuthenticationContextProvider.jsx";
import { FaUserCircle } from "react-icons/fa";

export function AppNavBar() {
  const { user } = useContext(AuthenticationContext);

  // 활성화된 NavLink 스타일
  const activeLinkStyle = {
    fontWeight: "bold",
    color: "black",
  };

  const navLinkStyle = {
    color: "#333",
    textDecoration: "none",
    margin: "0 1.5rem",
    fontSize: "1.1rem",
  };

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 1000 }}>
      {/* 상단 로고 + 로그인 */}
      <Navbar
        style={{
          backgroundColor: "#FF9D00",
          padding: "0.5rem 0",
          minHeight: "280px",
        }}
      >
        <Container className="position-relative">
          {/* 로그인 버튼 - 오른쪽 상단 */}
          <div style={{ position: "absolute", top: 10, right: 20 }}>
            {!user ? (
              <Button as={Link} to="/login" variant="light" size="sm">
                LOGIN
              </Button>
            ) : (
              <Nav.Link
                as={NavLink}
                to={`/member?email=${user.email}`}
                className="d-flex align-items-center text-white"
              >
                <FaUserCircle size={22} className="me-2" />
                {user.nickName}
              </Nav.Link>
            )}
          </div>

          {/* 로고와 문구 - 가운데 정렬 */}
          <Navbar.Brand
            as={Link}
            to="/"
            className="d-flex flex-column align-items-center w-100"
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
          </Navbar.Brand>
        </Container>
      </Navbar>

      {/* 하단 메뉴 바 */}
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
                isActive ? { ...navLinkStyle, ...activeLinkStyle } : navLinkStyle
              }
            >
              HOME
            </NavLink>
            <NavLink
              to="/kakaoMap"
              style={({ isActive }) =>
                isActive ? { ...navLinkStyle, ...activeLinkStyle } : navLinkStyle
              }
            >
              MAP
            </NavLink>
            <NavLink
              to="review/latest"
              style={({ isActive }) =>
                isActive ? { ...navLinkStyle, ...activeLinkStyle } : navLinkStyle
              }
            >
              REVIEWS
            </NavLink>
            <NavLink
              to="/board/list"
              style={({ isActive }) =>
                isActive ? { ...navLinkStyle, ...activeLinkStyle } : navLinkStyle
              }
            >
              NEWS
            </NavLink>

            <NavLink
              to="/service"
              style={({ isActive }) =>
                isActive ? { ...navLinkStyle, ...activeLinkStyle } : navLinkStyle
              }
            >
              SUPPORT
            </NavLink>
          </Nav>
        </Container>
      </Navbar>
    </div>
  );
}
