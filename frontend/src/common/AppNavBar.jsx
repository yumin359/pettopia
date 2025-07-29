import { Link, NavLink } from "react-router-dom"; // ✅ 수정
import { Navbar, Nav, Container } from "react-bootstrap";
import { useContext } from "react";
import { AuthenticationContext } from "./AuthenticationContextProvider.jsx";
import { FaUserCircle } from "react-icons/fa";

export function AppNavBar() {
  const { user, isAdmin } = useContext(AuthenticationContext);

  return (
    <Navbar
      expand="lg"
      fixed="top"
      style={{
        backgroundColor: "#FAF0E6",
        borderBottom: "1px solid #ccc",
      }}
    >
      <Container>
        {/* 로고 (왼쪽 정렬) */}
        <Navbar.Brand as={Link} to="/" className="fs-3 fw-bold me-4">
          <img
            src="/PETOPIA.png"
            alt="로고"
            height="40"
            style={{ marginRight: "10px" }}
          />
        </Navbar.Brand>

        {/* 로그인/닉네임 (오른쪽) */}
        <div className="d-flex align-items-center order-lg-2">
          <Nav className="me-3">
            {!user ? (
              <Nav.Link as={NavLink} to="/login">로그인</Nav.Link>
            ) : (
              <Nav.Link as={NavLink} to={`/member?email=${user.email}`}>
                <FaUserCircle size={19} className="me-1" />
                {user.nickName}
              </Nav.Link>
            )}
          </Nav>
          <Navbar.Toggle aria-controls="main-nav" />
        </div>

        {/* 메뉴 (가운데 정렬) */}
        <Navbar.Collapse id="main-nav" className="justify-content-center order-lg-1">
          <Nav className="gap-5">
            <Nav.Link as={NavLink} to="/">HOME</Nav.Link>
            <Nav.Link as={NavLink} to="/kakaoMap">MAP</Nav.Link>
            <Nav.Link as={NavLink} to="/board/list">EVENT</Nav.Link>
            {isAdmin() && (
              <Nav.Link as={NavLink} to="/member/list">MEMBERLIST</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
