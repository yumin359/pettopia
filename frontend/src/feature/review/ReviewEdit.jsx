import React, { useState, useEffect } from "react";
import { Button, Form, ListGroup, Spinner } from "react-bootstrap";
import { FaSave, FaTimes, FaTrashAlt } from "react-icons/fa";
import Select from "react-select/creatable";
import axios from "axios";
import { toast } from "react-toastify";

function ReviewEdit({ review, onSave, onCancel }) {
  const [content, setContent] = useState(review.review);
  const [rating, setRating] = useState(review.rating);
  const [existingFiles, setExistingFiles] = useState(review.files || []);
  const [newFiles, setNewFiles] = useState([]);
  const [deleteFileNames, setDeleteFileNames] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 태그 상태
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTags, setSelectedTags] = useState(
    (review.tags || []).map((tag) => ({
      value: tag.name.replace(/#/g, ""),
      label: tag.name.replace(/#/g, ""),
    })),
  );
  const [inputValue, setInputValue] = useState("");

  // 태그 옵션 로드
  useEffect(() => {
    const loadTags = async () => {
      try {
        const response = await axios.get("/api/tags");
        const options = response.data.map((tag) => ({
          value: tag.name.replace(/#/g, ""),
          label: tag.name.replace(/#/g, ""),
        }));
        setTagOptions(options);
      } catch (error) {
        console.error("태그 목록 로딩 실패:", error);
      }
    };
    loadTags();
  }, []);

  // 메모리 누수 방지
  useEffect(() => {
    return () => {
      newFiles.forEach((fileObj) => {
        if (fileObj.previewUrl) {
          URL.revokeObjectURL(fileObj.previewUrl);
        }
      });
    };
  }, [newFiles]);

  // 특수기호 및 띄어쓰기 검사 정규식
  const validTagRegex = /^[a-zA-Z0-9가-힣_]+$/;

  // 새 태그 생성 함수 (중복/개수 제한 포함)
  const handleCreateTag = (tagValue) => {
    if (!validTagRegex.test(tagValue)) {
      toast.warning("태그는 띄어쓰기 및 특수문자를 포함할 수 없습니다.");
      return;
    }
    if (selectedTags.find((tag) => tag.value === tagValue)) {
      toast.warning("이미 존재하는 태그입니다.");
      return;
    }
    if (selectedTags.length >= 6) {
      toast.warning("태그는 최대 6개까지만 선택할 수 있습니다.");
      return;
    }
    const newTag = { value: tagValue, label: tagValue };
    setSelectedTags((prev) => [...prev, newTag]);
  };

  // 태그 선택 변경 (6개 제한, # 제거)
  const handleTagChange = (newValue) => {
    if (newValue && newValue.length > 6) {
      toast.warning("태그는 최대 6개까지만 선택할 수 있습니다.");
      return;
    }
    const cleaned = (newValue || []).map((tag) => ({
      ...tag,
      value: tag.value.replace(/#/g, ""),
      label: tag.label.replace(/#/g, ""),
    }));
    setSelectedTags(cleaned);
  };

  // 띄어쓰기 입력 시 태그 생성 및 인풋 초기화
  const handleInputKeyDown = (e) => {
    if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      const val = inputValue.trim();
      if (val) {
        handleCreateTag(val);
        setInputValue("");
      }
    }
  };

  // ReviewEdit.jsx에 인증 토큰 추가
  const handleSave = async () => {
    if (!content.trim()) {
      toast.warning("내용을 입력하세요.");
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();

      formData.append("review", content.trim());
      formData.append("rating", rating);
      formData.append("facilityName", review.facilityName);
      formData.append("memberEmail", review.memberEmail);

      deleteFileNames.forEach((name) =>
        formData.append("deleteFileNames", name),
      );
      newFiles.forEach((fileObj) => formData.append("files", fileObj.file));
      selectedTags.forEach((tag) => formData.append("tagNames", tag.value));

      await axios.put(
        `http://localhost:8080/api/review/update/${review.id}`,
        formData,
      );

      toast.success("수정 완료!");

      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error("수정 실패:", error);
      // 401 에러인 경우 로그인 페이지로 리다이렉트
      if (error.response?.status === 401) {
        toast.error("로그인이 필요합니다.");
      } else {
        toast.error(
          "수정 실패: " + (error.response?.data?.message || error.message),
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    const validFiles = selectedFiles.filter((file) => {
      const isValidType =
        file.type.startsWith("image/") || file.type === "application/pdf";
      const isValidSize = file.size <= 10 * 1024 * 1024;

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

    const filesWithPreview = validFiles.map((file) => ({
      file,
      previewUrl: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    }));

    setNewFiles((prev) => [...prev, ...filesWithPreview]);
    e.target.value = null;
  };

  const handleRemoveExistingFile = (fileUrlToRemove) => {
    const fileName = getFileNameFromUrl(fileUrlToRemove);
    setDeleteFileNames((prev) => [...prev, fileName]);
    setExistingFiles((prev) => prev.filter((url) => url !== fileUrlToRemove));
  };

  const handleRemoveNewFile = (indexToRemove) => {
    setNewFiles((prev) => {
      const fileToRemove = prev[indexToRemove];
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  const handleCancel = () => {
    newFiles.forEach((fileObj) => {
      if (fileObj.previewUrl) {
        URL.revokeObjectURL(fileObj.previewUrl);
      }
    });
    onCancel();
  };

  const getFileNameFromUrl = (fileUrl) => {
    try {
      const url = new URL(fileUrl);
      const pathSegments = url.pathname.split("/");
      const fileNameWithQuery = pathSegments[pathSegments.length - 1];
      return fileNameWithQuery.split("?")[0];
    } catch (error) {
      console.error("Invalid URL:", fileUrl, error);
      return "알 수 없는 파일";
    }
  };

  const isImageFile = (fileUrl) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl.split("?")[0]);
  };

  return (
    <div className="border rounded p-3" style={{ backgroundColor: "#f8f9fa" }}>
      <h5 className="mb-3">📝 리뷰 수정</h5>

      {/* 태그 편집 */}
      <Form.Group className="mb-3">
        <Form.Label>태그</Form.Label>
        <Select
          isMulti
          isClearable
          options={tagOptions}
          value={selectedTags}
          onChange={handleTagChange}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onCreateOption={handleCreateTag}
          onKeyDown={handleInputKeyDown}
          placeholder="태그를 입력하거나 선택하세요..."
          formatCreateLabel={(inputValue) => `"${inputValue}" 태그 추가`}
          noOptionsMessage={() => "태그가 없습니다"}
          isDisabled={isProcessing}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </Form.Group>

      {/* 내용 편집 */}
      <Form.Group className="mb-3">
        <Form.Label>내용 *</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isProcessing}
          maxLength={1000}
          placeholder="리뷰 내용을 입력하세요"
        />
        <Form.Text className="text-muted">{content.length}/1000자</Form.Text>
      </Form.Group>

      {/* 별점 편집 */}
      <Form.Group className="mb-3">
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
      </Form.Group>

      {/* 기존 파일 관리 */}
      {existingFiles.length > 0 && (
        <Form.Group className="mb-3">
          <Form.Label>기존 첨부 파일</Form.Label>
          <ListGroup>
            {existingFiles.map((fileUrl, idx) => (
              <ListGroup.Item
                key={`existing-${idx}`}
                className="d-flex justify-content-between align-items-center"
              >
                <div className="d-flex align-items-center">
                  {isImageFile(fileUrl) && (
                    <img
                      src={fileUrl}
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
                  <span style={{ wordBreak: "break-all" }}>
                    {getFileNameFromUrl(fileUrl)}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => handleRemoveExistingFile(fileUrl)}
                  disabled={isProcessing}
                  aria-label={`${getFileNameFromUrl(fileUrl)} 삭제`}
                >
                  <FaTrashAlt />
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Form.Group>
      )}

      {/* 새 파일 관리 */}
      {newFiles.length > 0 && (
        <Form.Group className="mb-3">
          <Form.Label>새로 추가할 파일</Form.Label>
          <ListGroup>
            {newFiles.map((fileObj, idx) => (
              <ListGroup.Item
                key={`new-${idx}`}
                className="d-flex justify-content-between align-items-center"
              >
                <div className="d-flex align-items-center">
                  {fileObj.previewUrl && (
                    <img
                      src={fileObj.previewUrl}
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
                  <span className="text-truncate">{fileObj.file.name}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => handleRemoveNewFile(idx)}
                  disabled={isProcessing}
                  aria-label={`${fileObj.file.name} 삭제`}
                >
                  <FaTrashAlt />
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Form.Group>
      )}

      {/* 파일 추가 */}
      <Form.Group className="mb-3">
        <Form.Label>파일 추가</Form.Label>
        <Form.Control
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={handleFileChange}
          disabled={isProcessing}
        />
        <Form.Text className="text-muted">
          이미지 파일 또는 PDF 파일만 업로드 가능 (최대 10MB)
        </Form.Text>
      </Form.Group>

      {/* 편집 버튼들 */}
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
          onClick={handleSave}
          disabled={isProcessing || !content.trim()}
        >
          {isProcessing && (
            <Spinner animation="border" size="sm" className="me-2" />
          )}
          <FaSave /> 저장
        </Button>
      </div>
    </div>
  );
}

export default ReviewEdit;
