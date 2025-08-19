import { Link, NavLink, useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { Button, Container, Nav, Navbar, Modal } from "react-bootstrap";
import { AuthenticationContext } from "./AuthenticationContextProvider.jsx";
import { toast } from "react-toastify";
import { FaUserCircle } from "react-icons/fa";
import { createPortal } from "react-dom";
import { MemberLogin } from "../feature/member/MemberLogin.jsx";

export function AppNavBar() {
  const { user, logout, isAdmin } = useContext(AuthenticationContext);
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const [expanded, setExpanded] = useState(false);
  const dropdownRef = useRef(null);
  const navbarRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const handleCloseLoginModal = () => setShowLoginModal(false);
  const handleShowLoginModal = () => setShowLoginModal(true);

  const handleToggle = () => setExpanded(!expanded);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth <= 992 && expanded) {
      hoverTimeoutRef.current = setTimeout(() => setExpanded(false), 300);
    }
  };

  const handleDropdownToggle = (event) => {
    if (!showDropdown) {
      const rect = event.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right,
      });
    }
    setShowDropdown(!showDropdown);
  };

  const userDropdownTitle = (
    <span className="fw-bold">
      <FaUserCircle size={24} className="me-2" />
      {user?.nickName}
    </span>
  );

  const CustomDropdown = () => {
    if (!showDropdown) return null;
    return createPortal(
      <div
        ref={dropdownRef}
        style={{
          position: "absolute",
          top: dropdownPosition.top,
          right: dropdownPosition.right,
          backgroundColor: "#f6ece6",
          border: "1px solid black",
          boxShadow: "5px 5px 1px 1px black",
          minWidth: "160px",
          zIndex: 9999,
          overflow: "hidden",
        }}
      >
        <Link
          to={`/member?email=${user.email}`}
          className="dropdown-item"
          style={{
            display: "block",
            padding: "8px 16px",
            color: "black",
            textDecoration: "none",
            transition: "background-color 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "black", e.target.style.color = "white")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent", e.target.style.color = "black")}
          onClick={() => setShowDropdown(false)}
        >
          마이페이지
        </Link>
        <button
          className="dropdown-item"
          style={{
            display: "block",
            width: "100%",
            padding: "8px 16px",
            color: "red",
            backgroundColor: "transparent",
            border: "none",
            textAlign: "left",
            cursor: "pointer",
            transition: "background-color 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "black", e.target.style.color = "white")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent", e.target.style.color = "red")}
          onClick={() => {
            logout();
            navigate("/");
            toast.success("로그아웃되었습니다.");
            setShowDropdown(false);
          }}
        >
          로그아웃
        </button>
      </div>,
      document.body
    );
  };

  const navLinkStyle = {
    color: "#555",
    fontFamily: "'Poppins'",
    fontWeight: 500,
    paddingBottom: "0.5rem",
    margin: "0 1.2rem",
    textDecoration: "none",
    position: "relative",
    transition: "color 0.3s ease-in-out",
  };

  const activeLinkStyle = {
    color: "#d9534f",
    fontWeight: 700,
    borderBottom: "1px solid #d9534f",
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setExpanded(false);
      }
    };
    if (expanded) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  useEffect(() => () => hoverTimeoutRef.current && clearTimeout(hoverTimeoutRef.current), []);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth > 992) setExpanded(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <style>
        {`
          /* 네비바 기본 */
          .navbar-collapse { transition: all 0.3s ease-in-out !important; }
          .navbar { transition: all 0.3s ease-in-out !important; }
          .navbar-collapse.collapsing { transition: height 0.3s ease-in-out !important; }

          /* 로고 및 브랜드 텍스트 호버 */
          .navbar-brand:hover span, .navbar-brand:hover .logo-image {
            cursor: pointer;
          }

          /* NavLink 호버 */
          .nav-link:hover { color: #d9534f !important; transition: color 0.2s; }

          /* 드롭다운 */
          .dropdown-menu { position: absolute !important; z-index: 1050 !important; top: 100% !important; right: 0 !important; left: auto !important; transform: none !important; border: none !important; }
          .nav-dropdown-container { position: relative; z-index: 1051; }
        `}
      </style>

      <Navbar expand="xl" className="px-4" expanded={expanded} ref={navbarRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <Container>
          {/* 로고와 브랜드 이름 */}
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <span className="ms-2 md-3" style={{ fontFamily: "'Poppins'", fontSize: "clamp(1.2rem, 4vw, 1.8rem)", fontWeight: "bolder", color: "black" }}>PET</span>
            <div className="logo-image" style={{ width: "50px", height: "50px" }} />
            <span className="md-3" style={{ fontFamily: "'Poppins'", fontSize: "clamp(1.2rem, 4vw, 1.8rem)", fontWeight: "bolder", color: "black" }}>TOPIA</span>
          </Navbar.Brand>

          {/* 로그인/사용자 드롭다운 */}
          <div className="d-flex align-items-center order-lg-2">
            <Nav className="me-1">
              {user ? (
                <div className="nav-dropdown-container">
                  <Button className="fw-bold" style={{ boxShadow: "none", padding: "0.5rem 1.5rem", color: "#D9534F", backgroundColor: "transparent", border: "none", fontSize: "1.25rem" }} onClick={handleDropdownToggle}>
                    {userDropdownTitle}
                  </Button>
                  <CustomDropdown />
                </div>
              ) : (
                <Button onClick={handleShowLoginModal} className="fw-bold" style={{ boxShadow: "none", padding: "0.5rem 1.5rem", color: "#D9534F", backgroundColor: "transparent", border: "none", fontSize: "1.25rem" }}>LOGIN</Button>
              )}
            </Nav>
            <Navbar.Toggle aria-controls="main-nav" onClick={handleToggle} />
          </div>

          {/* 메뉴 */}
          <Navbar.Collapse id="basic-navbar-nav" className="mt-2">
            <Nav className="mx-auto mb-4 mt-3" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "2rem" }}>
              <NavLink to="/kakaoMap" style={({ isActive }) => isActive ? { ...navLinkStyle, ...activeLinkStyle } : navLinkStyle} onClick={() => setExpanded(false)}>지도찾기</NavLink>
              <NavLink to="/review/latest" style={({ isActive }) => isActive ? { ...navLinkStyle, ...activeLinkStyle } : navLinkStyle} onClick={() => setExpanded(false)}>최신리뷰</NavLink>
              <NavLink to="/board/list" style={({ isActive }) => isActive ? { ...navLinkStyle, ...activeLinkStyle } : navLinkStyle} onClick={() => setExpanded(false)}>공지사항</NavLink>
              <NavLink to="/support" style={({ isActive }) => isActive ? { ...navLinkStyle, ...activeLinkStyle } : navLinkStyle} onClick={() => setExpanded(false)}>CONTACT</NavLink>
              {isAdmin() && <NavLink to="/admin" style={({ isActive }) => isActive ? { ...navLinkStyle, ...activeLinkStyle } : navLinkStyle} onClick={() => setExpanded(false)}>관리자</NavLink>}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* 로그인 모달 */}
      <Modal show={showLoginModal} onHide={handleCloseLoginModal} centered className="login-modal-neo">
        <Modal.Header closeButton>
          <Modal.Title className="login-title" style={{ width: "100%", textAlign: "center" }}>🐾 PETOPIA</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MemberLogin onLoginSuccess={handleCloseLoginModal} onNavigateToSignup={handleCloseLoginModal} isModal={true} />
        </Modal.Body>
      </Modal>
    </>
  );
}
