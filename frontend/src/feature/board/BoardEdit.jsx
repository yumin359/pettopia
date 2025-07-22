import {
  Button,
  Card,
  Col,
  FormControl,
  FormGroup,
  ListGroup,
  Modal,
  Row,
  Spinner,
  FormCheck, // ✅ FormCheck 임포트 추가
} from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "react-toastify";
import {
  FaDownload,
  FaFileAlt,
  FaSave,
  FaTimes,
  FaTrashAlt,
} from "react-icons/fa";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";

export function BoardEdit() {
  const [board, setBoard] = useState({
    title: "",
    content: "",
    files: [],
    authorNickName: "",
    id: null,
    isPrivate: false, // ✅ isPrivate 필드 초기값 추가
  });

  const [searchParams] = useSearchParams();
  const [modalShow, setModalShow] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newFiles, setNewFiles] = useState([]);
  const [deleteFileNames, setDeleteFileNames] = useState([]);

  const { user } = useContext(AuthenticationContext);
  const navigate = useNavigate();

  const formattedInsertedAt = board.insertedAt
    ? board.insertedAt.substring(0, 16)
    : "";

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) {
      toast("잘못된 접근입니다.", { type: "warning" });
      navigate("/board/list");
      return;
    }

    axios
      .get(`/api/board/${id}`)
      .then((res) => {
        setBoard(res.data);
        // ✅ 불러온 데이터에서 isPrivate 값을 초기 상태에 설정
        setBoard((prevBoard) => ({
          ...prevBoard,
          isPrivate: res.data.isPrivate || false, // isPrivate 값이 없으면 기본값 false
        }));
      })
      .catch(() => {
        toast("해당 게시물이 존재하지 않습니다.", { type: "warning" });
        navigate("/board/list");
      });
  }, [searchParams, navigate]);

  function handleDeleteFile(idx) {
    setBoard((prev) => {
      const fileName = prev.files[idx].split("/").pop();
      setDeleteFileNames((prevDelete) => [...prevDelete, fileName]);
      return {
        ...prev,
        files: prev.files.filter((_, i) => i !== idx),
      };
    });
  }

  function handleSaveButtonClick() {
    if (!board.id) return; // board.id가 null일 경우 방지

    const id = searchParams.get("id");
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("title", board.title ?? "");
    formData.append("content", board.content ?? "");
    formData.append("isPrivate", board.isPrivate); // ✅ isPrivate 값 추가
    deleteFileNames.forEach((name) => formData.append("deleteFileNames", name));
    newFiles.forEach((file) => formData.append("files", file));
    formData.append("id", board.id); // ✅ id 값도 함께 전송 (컨트롤러 @ModelAttribute용)

    axios
      .put(`/api/board/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        const message = res.data.message || {
          text: "게시물이 성공적으로 수정되었습니다.",
          type: "success",
        };
        toast(message.text, { type: message.type });
        navigate(`/board/${board.id}`); // 수정 후 상세 보기 페이지로 이동
      })
      .catch((err) => {
        const message = err.response?.data?.message || {
          text: "게시물 수정 중 오류가 발생했습니다.",
          type: "warning",
        };
        toast(message.text, { type: message.type });
      })
      .finally(() => {
        setModalShow(false);
        setIsProcessing(false);
      });
  }

  const isValid =
    board.title?.trim() !== "" &&
    (board.content?.trim() !== "" ||
      newFiles.length > 0 ||
      (board.files && board.files.length > 0));

  return (
    <Row className="justify-content-center my-4">
      <Col xs={12} md={8} lg={6}>
        {!board.id ? (
          <div className="text-center my-5">
            <Spinner animation="border" />
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <FormControl
                className="fw-bold text-dark"
                placeholder="제목"
                style={{
                  fontSize: "1.5rem",
                  border: "none",
                  padding: 0,
                  outline: "none",
                  boxShadow: "none",
                }}
                value={board.title ?? ""}
                onChange={(e) => setBoard({ ...board, title: e.target.value })}
              />
              <small className="text-muted" style={{ fontSize: "0.85rem" }}>
                #{board.id}
              </small>
            </div>

            <Card className="shadow-sm rounded-3 border-0">
              <Card.Body>
                <FormGroup className="mb-4">
                  <br />
                  <FormControl
                    as="textarea"
                    rows={6}
                    value={board.content ?? ""}
                    onChange={(e) =>
                      setBoard({ ...board, content: e.target.value })
                    }
                    placeholder="내용을 입력하세요"
                    style={{
                      whiteSpace: "pre-wrap",
                      fontSize: "1rem",
                      lineHeight: 1.5,
                    }}
                  />
                </FormGroup>
                {Array.isArray(board.files) && board.files.length > 0 && (
                  <div className="mb-4">
                    <ListGroup>
                      {board.files.map((file, idx) => {
                        const fileName = file.split("/").pop();
                        return (
                          <ListGroup.Item
                            key={idx}
                            className="d-flex justify-content-between align-items-center"
                          >
                            {/* 미리보기 이미지 왼쪽에 배치 */}
                            {fileName.match(/\.(jpg|jpeg|png|gif)$/i) && (
                              <img
                                src={file}
                                alt={fileName}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                  marginRight: "10px", // 이미지와 파일명 간의 간격 조정
                                }}
                              />
                            )}

                            {/* 파일명과 삭제 버튼 오른쪽에 배치 */}
                            <div className="d-flex justify-content-between align-items-center w-100">
                              <span className="text-truncate d-flex align-items-center gap-2">
                                <FaFileAlt /> {fileName}
                              </span>
                              <div className="d-flex gap-2">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  href={file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 d-flex align-items-center justify-content-center"
                                >
                                  <FaDownload />
                                </Button>

                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="p-1 d-flex align-items-center justify-content-center"
                                  onClick={() => handleDeleteFile(idx)}
                                >
                                  <FaTrashAlt />
                                </Button>
                              </div>
                            </div>
                          </ListGroup.Item>
                        );
                      })}
                    </ListGroup>
                  </div>
                )}

                {newFiles.length > 0 && (
                  <div className="mb-4">
                    <ListGroup>
                      {newFiles.map((file, idx) => (
                        <ListGroup.Item
                          key={idx}
                          className="d-flex justify-content-between align-items-center"
                        >
                          {/* 미리보기 이미지 왼쪽에 배치 */}
                          {file.name.match(/\.(jpg|jpeg|png|gif)$/i) && (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                                marginRight: "10px", // 이미지와 파일명 간의 간격 조정
                              }}
                            />
                          )}

                          {/* 파일명과 삭제 버튼 오른쪽에 배치 */}
                          <div className="d-flex justify-content-between align-items-center w-100">
                            <span className="text-truncate d-flex align-items-center gap-2">
                              <FaFileAlt /> {file.name}
                            </span>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() =>
                                setNewFiles((prev) =>
                                  prev.filter((_, i) => i !== idx),
                                )
                              }
                            >
                              <FaTrashAlt />
                            </Button>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                )}

                <FormGroup className="mb-4">
                  <FormControl
                    type="file"
                    multiple
                    onChange={(e) =>
                      setNewFiles((prev) => [
                        ...prev,
                        ...Array.from(e.target.files),
                      ])
                    }
                  />
                </FormGroup>

                {/* 작성자 / 작성일시 */}
                <Row className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                  <Col xs={6}>
                    <div>
                      <strong>작성자</strong>
                      <div>{user.nickName}</div>
                    </div>
                  </Col>
                  <Col xs={6} className="text-end">
                    <div>
                      <strong>작성일시</strong>
                      <div>{formattedInsertedAt}</div>
                    </div>
                  </Col>
                </Row>

                {/* 공개/비공개 체크박스 추가 */}
                <FormGroup className="mb-3">
                  <FormCheck
                    type="checkbox"
                    id="isPrivateCheck"
                    label="비공개로 설정 (나와 친구만 볼 수 있음)"
                    checked={board.isPrivate} // board.isPrivate 상태에 바인딩
                    onChange={(e) =>
                      setBoard((prev) => ({
                        ...prev,
                        isPrivate: e.target.checked,
                      }))
                    }
                    disabled={isProcessing}
                  />
                </FormGroup>
                <br />
                <div className="d-flex justify-content-end gap-2">
                  <Button
                    className="d-flex align-items-center gap-1"
                    variant="outline-secondary"
                    onClick={() => navigate(-1)}
                    disabled={isProcessing}
                    title="취소"
                  >
                    <FaTimes />
                  </Button>

                  <Button
                    disabled={!isValid || isProcessing}
                    onClick={() => setModalShow(true)}
                    variant="primary"
                    className="d-flex align-items-center gap-1"
                    title="저장"
                  >
                    {isProcessing && <Spinner size="sm" className="me-2" />}
                    <FaSave />
                  </Button>
                </div>
              </Card.Body>
            </Card>

            <Modal show={modalShow} onHide={() => setModalShow(false)} centered>
              <Modal.Header closeButton>
                <Modal.Title>게시물 저장 확인</Modal.Title>
              </Modal.Header>
              <Modal.Body>{board.id}번 게시물을 수정하시겠습니까?</Modal.Body>
              <Modal.Footer>
                <Button
                  variant="outline-dark"
                  onClick={() => setModalShow(false)}
                  disabled={isProcessing}
                >
                  취소
                </Button>
                <Button
                  disabled={isProcessing}
                  variant="primary"
                  onClick={handleSaveButtonClick}
                >
                  {isProcessing && <Spinner size="sm" className="me-2" />}
                  {isProcessing ? "저장 중..." : "저장"}
                </Button>
              </Modal.Footer>
            </Modal>
          </>
        )}
      </Col>
    </Row>
  );
}
