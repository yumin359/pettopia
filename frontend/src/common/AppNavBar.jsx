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

  // --- 상태(State)와 참조(Ref) 선언 ---
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const [expanded, setExpanded] = useState(false); // 햄버거 메뉴 상태 추가
  const dropdownRef = useRef(null);
  const navbarRef = useRef(null); // 네비바 전체 참조 추가
  const hoverTimeoutRef = useRef(null); // 타임아웃 참조 추가

  // 1. 로그인 모달의 열림/닫힘 상태를 관리할 state 추가
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 2. 모달을 열고 닫는 핸들러 함수 추가
  const handleCloseLoginModal = () => setShowLoginModal(false);
  const handleShowLoginModal = () => setShowLoginModal(true);

  // 햄버거 메뉴 토글
  const handleToggle = () => {
    setExpanded(!expanded);
  };

  // 마우스가 네비바 영역에 들어왔을 때
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  // 마우스가 네비바 영역을 벗어났을 때
  const handleMouseLeave = () => {
    // 모바일 크기(992px 이하)에서만 작동
    if (window.innerWidth <= 992 && expanded) {
      // 300ms 후에 메뉴 닫기
      hoverTimeoutRef.current = setTimeout(() => {
        setExpanded(false);
      }, 300);
    }
  };

  // 드롭다운 위치 계산
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

  // 로그인 시 드롭다운 메뉴에 표시될 타이틀
  const userDropdownTitle = (
    <span className="fw-bold">
      <FaUserCircle size={24} className="me-2" />
      {user?.nickName}
    </span>
  );

  // 커스텀 드롭다운 메뉴 (Portal 사용)
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
          color: "white",
          overflow: "hidden",
        }}
      >
        <Link
          to={`/member?email=${user.email}`}
          className="dropdown-item"
          style={{
            display: "block",
            padding: "8px 16px",
            color: "white",
            textDecoration: "none",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "black")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
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
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "black")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
          onClick={() => {
            logout();
            navigate("/");
            toast("로그아웃되었습니다.");
            setShowDropdown(false);
          }}
        >
          로그아웃
        </button>
      </div>,
      document.body,
    );
  };

  // 기본 NavLink 스타일
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

  // 활성화된 NavLink 스타일
  const activeLinkStyle = {
    color: "#d9534f",
    fontWeight: 700,
    borderBottom: "1px solid #d9534f",
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // 네비바 외부 클릭 시 햄버거 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setExpanded(false);
      }
    };

    if (expanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expanded]);

  // 컴포넌트 언마운트 시 타임아웃 정리
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // 화면 크기 변경 시 메뉴 닫기
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992) {
        setExpanded(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <style>
        {`
          /* 드롭다운이 다른 요소를 밀어내지 않도록 절대 위치 설정 */
          .dropdown-menu {
            position: absolute !important;
            z-index: 1050 !important;
            top: 100% !important;
            right: 0 !important;
            left: auto !important;
            transform: none !important;
            border: none !important;
          }
          
          /* 드롭다운 컨테이너의 위치 설정 */
          .nav-dropdown-container {
            position: relative;
            z-index: 1051;
          }
          
          /* 네비바 콜랩스 부드러운 전환 */
          .navbar-collapse {
            transition: all 0.3s ease-in-out !important;
          }
          
          /* 네비바 자체에도 부드러운 전환 효과 */
          .navbar {
            transition: all 0.3s ease-in-out !important;
          }
          
          /* 콜랩스 내용이 나타날 때 부드러운 애니메이션 */
          .navbar-collapse.collapsing {
            transition: height 0.3s ease-in-out !important;
          }
        `}
      </style>
      <Navbar
        expand="xl"
        className="px-4"
        expanded={expanded}
        ref={navbarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Container>
          {/* 로고와 브랜드 이름 */}
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <span
              className=" ms-2 md-3"
              style={{
                fontFamily: "'Poppins'",
                fontSize: "clamp(1.2rem, 4vw, 1.8rem)",
                fontWeight: "bolder",
                color: "black",
              }}
            >
              PET
            </span>
            <div
              className="logo-image"
              style={{ width: "50px", height: "50px" }}
            />
            <span
              className="md-3"
              style={{
                fontFamily: "'Poppins'",
                fontSize: "clamp(1.2rem, 4vw, 1.8rem)",
                fontWeight: "bolder",
                color: "black",
              }}
            >
              TOPIA
            </span>
          </Navbar.Brand>

          {/* 로그인 상태에 따른 UI (오른쪽) */}
          <div className="d-flex align-items-center order-lg-2">
            <Nav className="me-1">
              {user ? (
                <div className="nav-dropdown-container">
                  <Button
                    className="fw-bold"
                    style={{
                      boxShadow: "none",
                      padding: "0.5rem 1.5rem",
                      color: "#D9534F",
                      backgroundColor: "transparent",
                      border: "none",
                      fontSize: "1.25rem",
                    }}
                    onClick={handleDropdownToggle}
                  >
                    {userDropdownTitle}
                  </Button>
                  <CustomDropdown />
                </div>
              ) : (
                <Button
                  onClick={handleShowLoginModal}
                  className="fw-bold"
                  style={{
                    boxShadow: "none",
                    padding: "0.5rem 1.5rem",
                    color: "#D9534F",
                    backgroundColor: "transparent",
                    border: "none",
                    fontSize: "1.25rem",
                  }}
                >
                  LOGIN
                </Button>
              )}
            </Nav>
            <Navbar.Toggle aria-controls="main-nav" onClick={handleToggle} />
          </div>

          {/* 접히는 메뉴 영역 */}
          <Navbar.Collapse id="basic-navbar-nav" className="mt-2">
            <Nav className="mx-auto mb-4 mt-3 gap-3">
              <NavLink
                to="/about"
                style={({ isActive }) =>
                  isActive
                    ? { ...navLinkStyle, ...activeLinkStyle }
                    : navLinkStyle
                }
                onClick={() => setExpanded(false)}
              >
                ABOUT
              </NavLink>
              <NavLink
                to="/kakaoMap"
                style={({ isActive }) =>
                  isActive
                    ? { ...navLinkStyle, ...activeLinkStyle }
                    : navLinkStyle
                }
                onClick={() => setExpanded(false)}
              >
                지도찾기
              </NavLink>
              <NavLink
                to="/review/latest"
                style={({ isActive }) =>
                  isActive
                    ? { ...navLinkStyle, ...activeLinkStyle }
                    : navLinkStyle
                }
                onClick={() => setExpanded(false)}
              >
                최신리뷰
              </NavLink>
              <NavLink
                to="/board/list"
                style={({ isActive }) =>
                  isActive
                    ? { ...navLinkStyle, ...activeLinkStyle }
                    : navLinkStyle
                }
                onClick={() => setExpanded(false)}
              >
                공지사항
              </NavLink>
              <NavLink
                to="/support"
                style={({ isActive }) =>
                  isActive
                    ? { ...navLinkStyle, ...activeLinkStyle }
                    : navLinkStyle
                }
                onClick={() => setExpanded(false)}
              >
                CONTACT
              </NavLink>
              {isAdmin() && (
                <NavLink
                  to="/admin"
                  style={({ isActive }) =>
                    isActive
                      ? { ...navLinkStyle, ...activeLinkStyle }
                      : navLinkStyle
                  }
                  onClick={() => setExpanded(false)}
                >
                  관리자
                </NavLink>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* 4. 화면에 렌더링될 Modal 컴포넌트 추가 */}
      <Modal
        show={showLoginModal}
        onHide={handleCloseLoginModal}
        centered
        className="login-modal-neo"
      >
        <Modal.Header closeButton>
          <Modal.Title
            className="login-title"
            style={{ width: "100%", textAlign: "center" }}
          >
            🐾 PETOPIA
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MemberLogin onLoginSuccess={handleCloseLoginModal} isModal={true} />
        </Modal.Body>
      </Modal>
    </>
  );
}
