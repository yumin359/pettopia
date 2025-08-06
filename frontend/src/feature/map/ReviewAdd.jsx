import { useParams, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";
import { FaSave, FaTimes, FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
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
  const [rating, setRating] = useState(5); // 기본 별점 5
  const [files, setFiles] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    axios
      .get("/api/tags")
      .then((res) => {
        const options = res.data.map((tag) => ({
          value: tag.name,
          label: tag.name,
        }));
        setTagOptions(options);
      })
      .catch((err) => console.error("태그 목록 로딩 실패:", err));
  }, []);

  if (!user) return <p className="text-center mt-4">로그인이 필요합니다.</p>;

  const isValid = content.trim() !== "";

  const handleSave = async () => {
    if (!isValid) {
      toast.warning("내용을 입력하세요.");
      return;
    }

    setModalShow(false);
    setIsProcessing(true);

    try {
      // 1. formdata 객체 생성
      const formData = new FormData();

      // 2. 텍스트 데이터 추가
      formData.append("facilityName", decodedName);
      formData.append("memberEmail", user.email);
      formData.append("review", content.trim());
      formData.append("rating", rating);

      // 3. 파일 데이터 추가
      files.forEach((fileObj) => {
        formData.append("files", fileObj.file);
      });

      selectedTags.forEach((tag) => {
        formData.append("tagNames", tag.value); // 백엔드에서는 List<String> tagNames로 받음
      });

      // 4. 요청
      await axios.post("/api/review/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("리뷰가 저장되었습니다.");
      navigate(`/facility/${encodeURIComponent(decodedName)}`);
    } catch (error) {
      console.error("리뷰 저장 실패:", error);
      toast.error("리뷰 저장에 실패했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) =>
      prev.concat(
        selectedFiles.map((file) => ({
          file,
          previewUrl: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : null,
        })),
      ),
    );
  };

  const handleFileRemove = (idx) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const handleTagClick = (tag) => {
    if (selectedTags.find((t) => t.id === tag.id)) {
      setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <Row className="justify-content-center my-4">
      <Col xs={12} md={8} lg={6}>
        <h3 className="mb-3 text-center">📝 {decodedName} 리뷰</h3>

        <Card className="shadow-sm rounded-3 border-0">
          <Card.Body>
            {/* 태그 */}
            <FormGroup className="mb-3">
              <Form.Label>태그 (입력 후 Enter)</Form.Label>
              <Select
                isMulti // 여러 개 선택 가능
                isClearable
                options={tagOptions} // 추천 태그 목록
                value={selectedTags}
                onChange={(newValue) => setSelectedTags(newValue)}
                placeholder="태그를 입력하거나 선택하세요..."
                formatCreateLabel={(inputValue) => `"${inputValue}" 태그 추가`}
                isDisabled={isProcessing}
              />
            </FormGroup>

            {/* 내용 */}
            <FormGroup className="mb-3">
              <Form.Label>내용</Form.Label>
              <FormControl
                as="textarea"
                rows={6}
                placeholder="내용을 입력하세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isProcessing}
              />
            </FormGroup>

            {/* 별점 */}
            <FormGroup className="mb-3">
              <Form.Label>별점</Form.Label>
              <div>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    style={{
                      fontSize: "1.8rem",
                      color: star <= rating ? "#ffc107" : "#e4e5e9",
                      cursor: "pointer",
                    }}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
                <span className="ms-2 text-muted">({rating}점)</span>
              </div>
            </FormGroup>

            {/* 파일 첨부 목록 */}
            {files.length > 0 && (
              <ListGroup className="mb-3">
                {files.map((f, idx) => (
                  <ListGroup.Item
                    key={idx}
                    className="d-flex justify-content-between"
                  >
                    .0
                    {f.previewUrl && (
                      <img
                        src={f.previewUrl}
                        alt="preview"
                        style={{ width: 40, height: 40, objectFit: "cover" }}
                      />
                    )}
                    <span className="text-truncate">{f.file.name}</span>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleFileRemove(idx)}
                    >
                      <FaTrashAlt />
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}

            {/* 파일 첨부 입력 */}
            <FormGroup className="mb-3">
              <FormControl
                type="file"
                multiple
                onChange={handleFileChange}
                disabled={isProcessing}
              />
            </FormGroup>

            {/* 작성자 정보 */}
            <div className="text-muted mb-3">
              작성자: <strong>{user.nickName}</strong>
            </div>

            {/* 버튼 */}
            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={() => navigate(-1)}>
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
          <Modal.Body>리뷰를 등록하시겠습니까?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setModalShow(false)}>
              취소
            </Button>
            <Button variant="primary" onClick={handleSave}>
              저장
            </Button>
          </Modal.Footer>
        </Modal>
      </Col>
    </Row>
  );
}

export default ReviewAdd;
