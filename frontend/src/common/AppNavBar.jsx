import { Link, NavLink } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import { useContext, useState, useEffect } from "react";
import { AuthenticationContext } from "./AuthenticationContextProvider.jsx";
import { FaUserCircle } from "react-icons/fa";

export function AppNavBar() {
  const { user, isAdmin } = useContext(AuthenticationContext);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 화면 크기에 따라 값 점진적 조절
  // 예: 1400px 이상: 크게, 1200 이상 조금 작게, 900 이상 중간, 600 이상 작게, 600 미만 매우 작게
  let gap, paddingLR, fontSize;
  if (windowWidth >= 1400) {
    gap = "3rem";
    paddingLR = "1.5rem";
    fontSize = "1.1rem";
  } else if (windowWidth >= 1200) {
    gap = "2.5rem";
    paddingLR = "1.3rem";
    fontSize = "1rem";
  } else if (windowWidth >= 900) {
    gap = "2rem";
    paddingLR = "1rem";
    fontSize = "0.95rem";
  } else if (windowWidth >= 600) {
    gap = "1.3rem";
    paddingLR = "0.7rem";
    fontSize = "0.9rem";
  } else {
    gap = "0.8rem";
    paddingLR = "0.4rem";
    fontSize = "0.8rem";
  }

  const navLinkStyle = {
    paddingLeft: paddingLR,
    paddingRight: paddingLR,
    whiteSpace: "nowrap",
    fontSize: fontSize,
  };

  return (
    <Navbar
      expand={false}
      fixed="top"
      style={{
        backgroundColor: "#FAF0E6",
        borderBottom: "1px solid #ccc",
      }}
    >
      <Container
        className="d-flex justify-content-between align-items-center"
        style={{ flexWrap: "nowrap", overflow: "hidden" }}
      >
        <Navbar.Brand as={Link} to="/" className="fs-3 fw-bold me-4" style={{ flexShrink: 0 }}>
          <img src="/PETOPIA.png" alt="로고" height="40" style={{ marginRight: "10px" }} />
        </Navbar.Brand>

        <Nav
          className="flex-row flex-nowrap"
          style={{
            overflowX: "hidden",
            whiteSpace: "nowrap",
            flexGrow: 1,
            flexShrink: 1,
            justifyContent: "center",
            minWidth: 0,
            gap: gap,
          }}
        >
          <Nav.Link as={NavLink} to="/" style={navLinkStyle}>
            HOME
          </Nav.Link>
          <Nav.Link as={NavLink} to="/kakaoMap" style={navLinkStyle}>
            MAP
          </Nav.Link>
          <Nav.Link as={NavLink} to="/board/list" style={navLinkStyle}>
            NEWS
          </Nav.Link>
          <Nav.Link as={NavLink} to="/service" style={navLinkStyle}>
            SUPPORT
          </Nav.Link>
          {isAdmin() && (
            <Nav.Link as={NavLink} to="/member/list" style={navLinkStyle}>
              MEMBERLIST
            </Nav.Link>
          )}
        </Nav>

        <Nav className="ms-3" style={{ flexShrink: 0 }}>
          {!user ? (
            <Nav.Link as={NavLink} to="/login" style={{ whiteSpace: "nowrap", fontSize: fontSize }}>
              로그인
            </Nav.Link>
          ) : (
            <Nav.Link
              as={NavLink}
              to={`/member?email=${user.email}`}
              style={{ whiteSpace: "nowrap", fontSize: fontSize }}
            >
              <FaUserCircle size={19} className="me-1" />
              {user.nickName}
            </Nav.Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}
