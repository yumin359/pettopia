import React, { useContext, useEffect, useState, useCallback } from "react";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";
import { FaSave, FaTimes, FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import Select from "react-select/creatable";
import {
  Button,
  Card,
  FormControl,
  FormGroup,
  ListGroup,
  Spinner,
  Form,
} from "react-bootstrap";

// 인라인 리뷰 작성 컴포넌트 (더 이상 별도 페이지가 아님)
export function ReviewAdd({ facility, onSave, onCancel }) {
  const { user } = useContext(AuthenticationContext);

  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [files, setFiles] = useState([]);
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
    e.target.value = null; // 같은 파일 재선택 가능하도록
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

  const isValid = content.trim() !== "";

  const handleSave = async () => {
    if (!isValid) {
      toast.warning("내용을 입력하세요.");
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("facilityName", facility.name);
      formData.append("memberEmail", user.email);
      formData.append("review", content.trim());
      formData.append("rating", rating.toString());

      // 파일 데이터 추가
      files.forEach((fileObj) => {
        formData.append("files", fileObj.file);
      });

      // 태그 데이터 추가 부분
      selectedTags.forEach((tag) => {
        formData.append("tagNames", tag.value);
      });

      if (facility?.id) {
        formData.append("facilityId", facility.id);
      }

      // 시설의 지역 정보도 저장 (중복 구분용)
      if (facility) {
        formData.append("facilitySidoName", facility.sidoName || "");
        formData.append("facilitySigunguName", facility.sigunguName || "");
      }

      await axios.post("/api/review/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("리뷰가 저장되었습니다.");

      // 폼 초기화
      setContent("");
      setRating(5);
      setFiles([]);
      setSelectedTags([]);

      // 부모 컴포넌트에 저장 완료 알림
      onSave?.();
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
    // 작성 중인 내용이 있으면 확인
    if (content.trim() || files.length > 0 || selectedTags.length > 0) {
      if (
        window.confirm("작성 중인 내용이 있습니다. 정말로 취소하시겠습니까?")
      ) {
        // 파일 미리보기 URL 정리
        files.forEach((fileObj) => {
          if (fileObj.previewUrl) {
            URL.revokeObjectURL(fileObj.previewUrl);
          }
        });

        // 폼 초기화
        setContent("");
        setRating(5);
        setFiles([]);
        setSelectedTags([]);

        onCancel?.();
      }
    } else {
      onCancel?.();
    }
  };

  return (
    <Card className="mt-3 shadow-sm" style={{ backgroundColor: "#f8f9fa" }}>
      <Card.Body>
        <h5 className="mb-3">📝 새 리뷰 작성</h5>

        {/* 태그 선택 */}
        <FormGroup className="mb-3">
          <Form.Label>태그</Form.Label>
          <Select
            isMulti
            isClearable
            options={tagOptions}
            value={selectedTags}
            onChange={(newValue) => setSelectedTags(newValue || [])}
            placeholder="태그를 입력하거나 선택하세요..."
            formatCreateLabel={(inputValue) => `"${inputValue}" 태그 추가`}
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
            rows={4}
            placeholder="리뷰 내용을 입력하세요 (필수)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isProcessing}
            maxLength={1000}
          />
          <Form.Text className="text-muted">{content.length}/1000자</Form.Text>
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
                  marginRight: "4px",
                }}
                onClick={() => !isProcessing && setRating(star)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !isProcessing) {
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
            onClick={handleSave}
          >
            {isProcessing && (
              <Spinner animation="border" size="sm" className="me-2" />
            )}
            <FaSave /> 저장
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ReviewAdd;
