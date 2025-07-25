import {
  Button,
  Card,
  Col,
  FormControl,
  FormGroup,
  FormLabel,
  ListGroup,
  ListGroupItem,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "react-toastify";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";
import { FaDownload } from "react-icons/fa";

export function MemberDetail() {
  const [member, setMember] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [password, setPassword] = useState("");
  const { logout, hasAccess } = useContext(AuthenticationContext);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`/api/member?email=${params.get("email")}`)
      .then((res) => setMember(res.data))
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

  function handleLogoutClick() {
    logout();
    navigate("/");
  }

  if (!member) {
    return (
      <div className="d-flex justify-content-center my-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  // 가입일시 포맷 통일
  const formattedInsertedAt = member.insertedAt
    ? member.insertedAt.replace("T", " ").substring(0, 16)
    : "";

  return (
    <Row className="justify-content-center my-4">
      <Col xs={12} md={8} lg={6}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold mb-0 text-dark">회원 정보</h3>
          <small className="text-muted" style={{ fontSize: "0.85rem" }}>
            {member.email === "admin@email.com" ? (
              <span className="badge bg-danger">관리자</span>
            ) : (
              <span className="badge bg-secondary">일반 사용자</span>
            )}
          </small>
        </div>

        <Card className="shadow-sm border-0 rounded-3">
          <Card.Body>
            {/* 이미지 미리보기 */}
            {Array.isArray(member.files) &&
              member.files.some((file) =>
                /\.(jpg|jpeg|png|gif|webp)$/i.test(file),
              ) && (
                <div className="mb-4 d-flex flex-column gap-3">
                  {member.files
                    .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
                    .map((file, idx) => (
                      <img
                        key={idx}
                        src={file}
                        alt={`첨부 이미지 ${idx + 1}`}
                        className="shadow rounded"
                        style={{ maxWidth: "100%", objectFit: "contain" }}
                      />
                    ))}
                </div>
              )}
            <br />
            {/* 첨부 파일 목록 */}
            {Array.isArray(member.files) && member.files.length > 0 && (
              <div className="mb-4">
                <ListGroup variant="flush">
                  {member.files.map((file, idx) => {
                    const fileName = file.split("/").pop();
                    return (
                      <ListGroupItem
                        key={idx}
                        className="d-flex justify-content-between align-items-center px-2 py-1 border-0"
                        style={{
                          fontSize: "0.85rem",
                          color: "#6c757d",
                          backgroundColor: "transparent",
                        }}
                      >
                        <span
                          className="text-truncate"
                          style={{
                            maxWidth: "85%",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={fileName}
                        >
                          {fileName}
                        </span>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="d-flex align-items-center justify-content-center p-1"
                          style={{ fontSize: "0.8rem" }}
                        >
                          <FaDownload />
                        </Button>
                      </ListGroupItem>
                    );
                  })}
                </ListGroup>
              </div>
            )}
            
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

            {hasAccess(member.email) && (
              <div className="d-flex justify-content-start gap-2">
                <Button
                  variant="outline-danger"
                  onClick={() => setModalShow(true)}
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
                <Button
                  variant="outline-secondary"
                  onClick={handleLogoutClick}
                  className="d-flex align-items-center gap-1"
                >
                  로그아웃
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* 탈퇴 확인 모달 */}
        <Modal show={modalShow} onHide={() => setModalShow(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>회원 탈퇴 확인</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup controlId="password1">
              <FormLabel>암호</FormLabel>
              <FormControl
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
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
