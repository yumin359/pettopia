import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { toast } from "react-toastify";
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
  Form, // Import Form component from react-bootstrap
} from "react-bootstrap";
import { FaFileAlt, FaSave, FaTimes, FaTrashAlt } from "react-icons/fa";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";

export function BoardAdd() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [isPrivate, setIsPrivate] = useState(false); // New state for private checkbox
  const [modalShow, setModalShow] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { user } = useContext(AuthenticationContext);
  const navigate = useNavigate();

  if (!user) return null;

  const isValid =
    title.trim() !== "" && (content.trim() !== "" || files.length > 0);

  // 파일 첨부 시 처리하는 함수
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => {
      const newFiles = selectedFiles.map((file) => ({
        file,
        previewUrl: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null, // 이미지 파일일 경우 미리보기 URL 생성
      }));
      return [...prevFiles, ...newFiles];
    });
  };

  // 파일 삭제 시 처리하는 함수
  const handleFileRemove = (idx) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const handleSaveButtonClick = () => {
    if (!isValid) {
      toast.warning(
        "제목은 필수이며, 본문 또는 첨부파일이 하나 이상 있어야 합니다.",
      );
      return;
    }
    setModalShow(false);
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("isPrivate", isPrivate); // Append isPrivate state to formData
    files.forEach((fileObj) => formData.append("files", fileObj.file));

    axios
      .post("/api/board/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        const message = res.data?.message;
        toast(message?.text || "게시글이 등록되었습니다.", {
          type: message?.type || "success",
        });
        navigate("/board/list");
      })
      .catch((err) => {
        const message = err.response?.data?.message;
        toast(message?.text || "오류가 발생했습니다.", {
          type: message?.type || "error",
        });
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  return (
    <Row className="justify-content-center my-4">
      <Col xs={12} md={8} lg={6}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <FormControl
            className="fw-bold text-dark"
            placeholder="제목을 입력하세요"
            style={{
              fontSize: "1.5rem",
              border: "none",
              padding: 0,
              outline: "none",
              boxShadow: "none",
            }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isProcessing}
          />
        </div>

        <Card className="shadow-sm rounded-3 border-0">
          <Card.Body>
            <FormGroup className="mb-4">
              <FormControl
                as="textarea"
                rows={6}
                placeholder="내용을 입력하세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: "1rem",
                  lineHeight: 1.5,
                }}
                disabled={isProcessing}
              />
            </FormGroup>

            {/* 파일 첨부된 목록 먼저 보여줌 */}
            {files.length > 0 && (
              <div className="mb-4">
                <ListGroup>
                  {files.map((fileObj, idx) => (
                    <ListGroup.Item
                      key={idx}
                      className="d-flex justify-content-between align-items-center"
                    >
                      {/* 미리보기 이미지 왼쪽에 배치 */}
                      {fileObj.previewUrl && (
                        <img
                          src={fileObj.previewUrl}
                          alt={fileObj.file.name}
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
                          <FaFileAlt /> {fileObj.file.name}
                        </span>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="p-1 d-flex"
                          onClick={() => handleFileRemove(idx)}
                          disabled={isProcessing}
                        >
                          <FaTrashAlt />
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            )}

            {/* 그리고 나서 파일 선택 input */}
            <FormGroup className="mb-4">
              <FormControl
                type="file"
                multiple
                onChange={handleFileChange}
                disabled={isProcessing}
              />
            </FormGroup>

            {/* 작성자 표시 */}
            <Row className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
              <Col xs={6}>
                <div>
                  <strong>작성자</strong>
                  <div> {user.nickName}</div>
                </div>
              </Col>
            </Row>

            {/* Private/Public Checkbox */}
            <FormGroup className="mb-3">
              <Form.Check
                type="checkbox"
                id="isPrivateCheckbox"
                label="비공개 게시물"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                disabled={isProcessing}
              />
            </FormGroup>

            {/* 저장/취소 버튼 */}
            <div className="d-flex justify-content-end gap-2">
              <Button
                className="d-flex align-items-center gap-1"
                variant="outline-secondary"
                disabled={isProcessing}
                onClick={() => navigate(-1)}
                title="취소"
              >
                <FaTimes />
              </Button>

              <Button
                className="d-flex align-items-center gap-1"
                variant="primary"
                disabled={!isValid || isProcessing}
                onClick={() => setModalShow(true)}
                title="저장"
              >
                {isProcessing && (
                  <Spinner animation="border" size="sm" className="me-2" />
                )}
                <FaSave />
              </Button>
            </div>
          </Card.Body>
        </Card>

        <Modal
          show={modalShow}
          onHide={() => setModalShow(false)}
          centered
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>게시물 저장 확인</Modal.Title>
          </Modal.Header>
          <Modal.Body>게시물을 등록하시겠습니까?</Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-dark"
              onClick={() => setModalShow(false)}
              disabled={isProcessing}
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveButtonClick}
              disabled={isProcessing}
            >
              {isProcessing && (
                <Spinner animation="border" size="sm" className="me-2" />
              )}
              등록
            </Button>
          </Modal.Footer>
        </Modal>
      </Col>
    </Row>
  );
}
