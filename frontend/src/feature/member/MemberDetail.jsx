import {
  Button,
  Card,
  Col,
  FormControl,
  FormGroup,
  FormLabel,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "react-toastify";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";
import { FiUser } from "react-icons/fi";

export function MemberDetail() {
  const [member, setMember] = useState(null);
  const [, setReviews] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [password, setPassword] = useState("");
  const [tempCode, setTempCode] = useState("");
  const { logout, hasAccess, isAdmin } = useContext(AuthenticationContext);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`/api/member?email=${params.get("email")}`)
      .then((res) => {
        setMember(res.data);
        if (res.data?.id) {
          axios
            .get(`/api/review/myReview/${res.data.id}`)
            .then((res2) => setReviews(res2.data))
            .catch((err) => {
              console.error("리뷰 목록 로드 실패:", err);
              setReviews([]);
            });
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("회원 정보를 불러오는 중 오류가 발생했습니다.");
      });
  }, [params]);

  function handleDeleteButtonClick() {
    axios
      .delete("/api/member", { data: { email: member.email, password } })
      .then((res) => {
        toast(res.data.message.text, { type: res.data.message.type });
        navigate("/");
        logout();
      })
      .catch((err) => {
        toast(err.response?.data?.message?.text || "오류가 발생했습니다.", {
          type: "danger",
        });
      })
      .finally(() => {
        setModalShow(false);
        setPassword("");
      });
  }

  function handleModalButtonClick() {
    if (isKakao) {
      axios
        .post("/api/member/withdrawalCode", { email: member.email })
        .then((res) => {
          setTempCode(res.data.tempCode);
          setModalShow(true);
        })
        .catch((err) => {
          console.error(err);
          console.log("임시 코드 못 받음");
        })
        .finally(() => setPassword(""));
    } else {
      setModalShow(true);
    }
  }

  function handleLogoutClick() {
    logout();
    navigate("/login");
    toast("로그아웃 되었습니다.", { type: "success" });
  }

  if (!member) {
    return (
      <div className="d-flex justify-content-center my-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  const formattedInsertedAt = member.insertedAt
    ? member.insertedAt.replace("T", " ").substring(0, 16)
    : "";

  const profileImageUrl = member.files?.find((file) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(file),
  );

  const isAdminFlag = isAdmin(); // 함수 호출
  const isKakao = member.provider?.includes("kakao");

  return (
    <Row className="justify-content-center my-4">
      <Col xs={12} md={8} lg={6}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold mb-0 text-dark">회원 정보</h3>
          <small className="text-muted" style={{ fontSize: "0.85rem" }}>
            {isAdminFlag ? (
              <span className="badge bg-danger">관리자</span>
            ) : (
              <span className="badge bg-secondary">일반 사용자</span>
            )}
          </small>
        </div>

        <Card className="shadow-sm border-0 rounded-3">
          <Card.Body>
            <div className="mb-4 d-flex justify-content-center">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="프로필 이미지"
                  className="shadow rounded-circle"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                    border: "2px solid #ddd",
                  }}
                />
              ) : (
                <div
                  className="shadow rounded-circle d-flex justify-content-center align-items-center"
                  style={{
                    width: "120px",
                    height: "120px",
                    backgroundColor: "#e9ecef",
                    border: "2px solid #ddd",
                    color: "#6c757d",
                  }}
                >
                  <FiUser size={80} />
                </div>
              )}
            </div>

            {!profileImageUrl && <br />}

            <FormGroup controlId="email1" className="mb-3">
              <FormLabel>이메일</FormLabel>
              <FormControl
                readOnly
                value={member.email}
                className="bg-light border-0"
                style={{
                  userSelect: "text",
                  boxShadow: "none",
                  outline: "none",
                }}
                onFocus={(e) => e.target.blur()}
              />
            </FormGroup>

            <FormGroup controlId="nickName1" className="mb-3">
              <FormLabel>별명</FormLabel>
              <FormControl
                readOnly
                value={member.nickName}
                className="bg-light border-0"
                style={{
                  userSelect: "text",
                  boxShadow: "none",
                  outline: "none",
                }}
                onFocus={(e) => e.target.blur()}
              />
            </FormGroup>

            <FormGroup controlId="info1" className="mb-3">
              <FormLabel>자기소개</FormLabel>
              <FormControl
                as="textarea"
                readOnly
                value={member.info || ""}
                className="bg-light border-0"
                style={{
                  minHeight: "120px",
                  resize: "none",
                  userSelect: "text",
                  fontSize: "1rem",
                  lineHeight: 1.5,
                }}
                onFocus={(e) => e.target.blur()}
              />
            </FormGroup>

            <FormGroup controlId="inserted1" className="mb-3">
              <FormLabel>가입일시</FormLabel>
              <FormControl
                readOnly
                value={formattedInsertedAt}
                className="bg-light border-0"
                style={{
                  userSelect: "text",
                  boxShadow: "none",
                  outline: "none",
                }}
                onFocus={(e) => e.target.blur()}
              />
            </FormGroup>

            {(hasAccess(member.email) || isAdminFlag) && (
              <div className="d-flex justify-content-start gap-2">
                <Button
                  variant="outline-danger"
                  onClick={handleModalButtonClick}
                  className="d-flex align-items-center gap-1"
                >
                  탈퇴
                </Button>
                <Button
                  variant="outline-info"
                  onClick={() => navigate(`/member/edit?email=${member.email}`)}
                  className="d-flex align-items-center gap-1"
                >
                  수정
                </Button>

                {/* 관리자면 로그아웃 버튼 숨김 */}
                {!isAdminFlag && (
                  <Button
                    variant="outline-secondary"
                    onClick={handleLogoutClick}
                    className="d-flex align-items-center gap-1"
                  >
                    로그아웃
                  </Button>
                )}

                <Button
                  variant="outline-success"
                  onClick={() => navigate(`/review/my/${member.id}`)}
                  className="d-flex align-items-center gap-1"
                >
                  내가 쓴 리뷰
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* 탈퇴 확인 모달 */}
        <Modal show={modalShow} onHide={() => setModalShow(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              {isKakao ? "카카오 회원 탈퇴" : "회원 탈퇴 확인"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup controlId="password1">
              <FormLabel>
                {isKakao
                  ? `탈퇴를 원하시면 ${tempCode}를 아래에 작성하세요.`
                  : "탈퇴를 원하시면 암호를 입력하세요"}
              </FormLabel>
              <FormControl
                type={isKakao ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  isKakao
                    ? "탈퇴를 원하시면 위의 코드를 작성하세요."
                    : "탈퇴를 원하시면 비밀번호를 입력하세요"
                }
                autoFocus
              />
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setModalShow(false)}
            >
              취소
            </Button>
            <Button variant="danger" onClick={handleDeleteButtonClick}>
              탈퇴
            </Button>
          </Modal.Footer>
        </Modal>
      </Col>
    </Row>
  );
}
