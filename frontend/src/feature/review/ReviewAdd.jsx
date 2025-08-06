import { useParams, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState, useCallback } from "react";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";
import { FaSave, FaTimes, FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import Select from "react-select";
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
  Form,
} from "react-bootstrap";

export function ReviewAdd() {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);
  const navigate = useNavigate();
  const { user } = useContext(AuthenticationContext);

  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [files, setFiles] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  // 태그 목록 로드
  useEffect(() => {
    const loadTags = async () => {
      try {
        const response = await axios.get("/api/tags");
        const options = response.data.map((tag) => ({
          value: tag.name,
          label: tag.name,
        }));
        setTagOptions(options);
      } catch (error) {
        console.error("태그 목록 로딩 실패:", error);
        toast.error("태그 목록을 불러오는데 실패했습니다.");
      }
    };

    loadTags();
  }, []);

  // 메모리 누수 방지를 위한 cleanup
  useEffect(() => {
    return () => {
      files.forEach((fileObj) => {
        if (fileObj.previewUrl) {
          URL.revokeObjectURL(fileObj.previewUrl);
        }
      });
    };
  }, [files]);

  // 파일 변경 핸들러
  const handleFileChange = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);

    // 파일 타입 및 크기 검증
    const validFiles = selectedFiles.filter((file) => {
      const isValidType =
        file.type.startsWith("image/") || file.type === "application/pdf";
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB 제한

      if (!isValidType) {
        toast.warning(`${file.name}은(는) 지원하지 않는 파일 형식입니다.`);
        return false;
      }
      if (!isValidSize) {
        toast.warning(`${file.name}은(는) 파일 크기가 10MB를 초과합니다.`);
        return false;
      }
      return true;
    });

    const newFiles = validFiles.map((file) => ({
      file,
      previewUrl: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  // 파일 제거 핸들러
  const handleFileRemove = useCallback((idx) => {
    setFiles((prevFiles) => {
      const fileToRemove = prevFiles[idx];
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prevFiles.filter((_, i) => i !== idx);
    });
  }, []);

  // 로그인 체크 - 모든 Hook 호출 이후에 위치
  if (!user) {
    return (
      <Row className="justify-content-center my-4">
        <Col xs={12} className="text-center">
          <p>로그인이 필요합니다.</p>
        </Col>
      </Row>
    );
  }

  const isValid = content.trim() !== "";

  const handleSave = async () => {
    if (!isValid) {
      toast.warning("내용을 입력하세요.");
      return;
    }

    setModalShow(false);
    setIsProcessing(true);

    try {
      const formData = new FormData();

      // 텍스트 데이터 추가
      formData.append("facilityName", decodedName);
      formData.append("memberEmail", user.email);
      formData.append("review", content.trim());
      formData.append("rating", rating.toString());

      // 파일 데이터 추가
      files.forEach((fileObj) => {
        formData.append("files", fileObj.file);
      });

      // 태그 데이터 추가
      selectedTags.forEach((tag) => {
        formData.append("tagNames", tag.value);
      });

      await axios.post("/api/review/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("리뷰가 저장되었습니다.");
      navigate(`/facility/${encodeURIComponent(decodedName)}`);
    } catch (error) {
      console.error("리뷰 저장 실패:", error);
      const errorMessage =
        error.response?.data?.message || "리뷰 저장에 실패했습니다.";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    if (content.trim() || files.length > 0 || selectedTags.length > 0) {
      if (
        window.confirm("작성 중인 내용이 있습니다. 정말로 취소하시겠습니까?")
      ) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  return (
    <Row className="justify-content-center my-4">
      <Col xs={12} md={8} lg={6}>
        <h3 className="mb-3 text-center">📝 {decodedName} 리뷰</h3>

        <Card className="shadow-sm rounded-3 border-0">
          <Card.Body>
            {/* 태그 선택 */}
            <FormGroup className="mb-3">
              <Form.Label>태그</Form.Label>
              <Select
                isMulti
                isClearable
                options={tagOptions}
                value={selectedTags}
                onChange={(newValue) => setSelectedTags(newValue || [])}
                placeholder="태그를 선택하세요..."
                noOptionsMessage={() => "태그가 없습니다"}
                isDisabled={isProcessing}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </FormGroup>

            {/* 내용 */}
            <FormGroup className="mb-3">
              <Form.Label>내용 *</Form.Label>
              <FormControl
                as="textarea"
                rows={6}
                placeholder="리뷰 내용을 입력하세요 (필수)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isProcessing}
                maxLength={1000}
              />
              <Form.Text className="text-muted">
                {content.length}/1000자
              </Form.Text>
            </FormGroup>

            {/* 별점 */}
            <FormGroup className="mb-3">
              <Form.Label>별점</Form.Label>
              <div className="d-flex align-items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    style={{
                      fontSize: "1.8rem",
                      color: star <= rating ? "#ffc107" : "#e4e5e9",
                      cursor: isProcessing ? "default" : "pointer",
                    }}
                    onClick={() => !isProcessing && setRating(star)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (
                        (e.key === "Enter" || e.key === " ") &&
                        !isProcessing
                      ) {
                        setRating(star);
                      }
                    }}
                  >
                    ★
                  </span>
                ))}
                <span className="ms-2 text-muted">({rating}점)</span>
              </div>
            </FormGroup>

            {/* 파일 첨부 목록 */}
            {files.length > 0 && (
              <FormGroup className="mb-3">
                <Form.Label>첨부 파일</Form.Label>
                <ListGroup>
                  {files.map((f, idx) => (
                    <ListGroup.Item
                      key={idx}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div className="d-flex align-items-center">
                        {f.previewUrl && (
                          <img
                            src={f.previewUrl}
                            alt="미리보기"
                            style={{
                              width: 40,
                              height: 40,
                              objectFit: "cover",
                              marginRight: "10px",
                              borderRadius: "4px",
                            }}
                          />
                        )}
                        <span className="text-truncate">{f.file.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleFileRemove(idx)}
                        disabled={isProcessing}
                        aria-label={`${f.file.name} 파일 삭제`}
                      >
                        <FaTrashAlt />
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </FormGroup>
            )}

            {/* 파일 첨부 입력 */}
            <FormGroup className="mb-3">
              <Form.Label>파일 첨부</Form.Label>
              <FormControl
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileChange}
                disabled={isProcessing}
              />
              <Form.Text className="text-muted">
                이미지 파일 또는 PDF 파일만 업로드 가능 (최대 10MB)
              </Form.Text>
            </FormGroup>

            {/* 작성자 정보 */}
            <div className="text-muted mb-3">
              작성자: <strong>{user.nickName}</strong>
            </div>

            {/* 버튼 */}
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="outline-secondary"
                onClick={handleCancel}
                disabled={isProcessing}
              >
                <FaTimes /> 취소
              </Button>
              <Button
                variant="primary"
                disabled={!isValid || isProcessing}
                onClick={() => setModalShow(true)}
              >
                {isProcessing && (
                  <Spinner animation="border" size="sm" className="me-2" />
                )}
                <FaSave /> 저장
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* 확인 모달 */}
        <Modal show={modalShow} onHide={() => setModalShow(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>리뷰 등록 확인</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>다음 내용으로 리뷰를 등록하시겠습니까?</p>
            <ul>
              <li>별점: {rating}점</li>
              <li>
                태그:{" "}
                {selectedTags.length > 0
                  ? selectedTags.map((tag) => tag.label).join(", ")
                  : "없음"}
              </li>
              <li>첨부파일: {files.length}개</li>
            </ul>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setModalShow(false)}
              disabled={isProcessing}
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isProcessing}
            >
              {isProcessing && (
                <Spinner animation="border" size="sm" className="me-2" />
              )}
              저장
            </Button>
          </Modal.Footer>
        </Modal>
      </Col>
    </Row>
  );
}

export default ReviewAdd;
