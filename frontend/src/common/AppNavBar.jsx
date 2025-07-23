import { Link, NavLink } from "react-router";
import { Navbar, Nav, Container } from "react-bootstrap";
import { useContext } from "react";
import { AuthenticationContext } from "./AuthenticationContextProvider.jsx";

export function AppNavBar() {
  const { user, isAdmin } = useContext(AuthenticationContext);

  return (
    <Navbar expand="lg" bg="light" fixed="top" className="bg-body-tertiary">
      <Container className="d-flex align-items-center">
        {/* 1. 로고 */}
        <Navbar.Brand as={Link} to="/" className="fs-3 fw-bold me-4">
          <img
            src="/kuromi.png"
            alt="로고"
            height="40"
            style={{ marginRight: "10px" }}
          />
        </Navbar.Brand>

        {/* 2. 로그인/닉네임 + 햄버거 토글 (항상 고정, Collapse 밖) */}
        <div className="d-flex align-items-center order-lg-2">
          <Nav className="me-3">
            {!user ? (
              <Nav.Link as={NavLink} to="/login">
                로그인
              </Nav.Link>
            ) : (
              <Nav.Link as={NavLink} to={`/member?email=${user.email}`}>
                {user.nickName}
              </Nav.Link>
            )}
          </Nav>

          <Navbar.Toggle aria-controls="main-nav" />
        </div>

        {/* 3. 메뉴 (Collapse 안, order-lg-1로 로고 옆에 위치) */}
        <Navbar.Collapse id="main-nav" className="order-lg-1">
          <Nav>
            <Nav.Link as={NavLink} to="/KakaoMap">
              지도
            </Nav.Link>
            <Nav.Link as={NavLink} to="/board/list">
              게시판 목록
            </Nav.Link>
            {user && (
              <Nav.Link as={NavLink} to="/board/add">
                게시글 작성
              </Nav.Link>
            )}
            {isAdmin() && (
              <Nav.Link as={NavLink} to="/member/list">
                회원 목록
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
