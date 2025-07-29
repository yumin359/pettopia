import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Button,
  Form,
  FormControl,
  FormGroup,
  Image,
  ListGroup,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import { FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";

export function ReviewEdit() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { review } = state;

  const [content, setContent] = useState(review.review);
  const [rating, setRating] = useState(review.rating);
  const [existingFiles, setExistingFiles] = useState(review.files || []);
  const [newFiles, setNewFiles] = useState([]);
  const [deletefileNames, setDeletefileNames] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 새로 추가된 파일의 미리보기 URL 정리 (메모리 누수 방지)
  useEffect(() => {
    return () => {
      newFiles.forEach((fileObj) => {
        if (fileObj.previewUrl) {
          URL.revokeObjectURL(fileObj.previewUrl);
        }
      });
    };
  }, [newFiles]);

  const handleUpdate = async () => {
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("review", content.trim());
    formData.append("rating", rating);
    formData.append("facilityName", review.facilityName);
    formData.append("memberEmail", review.memberEmail);
    formData.append("id", review.id); // 이거 없어도 되는디

    // 삭제할 기존 파일 목록을 FormData에 추가
    deletefileNames.forEach((fileUrl) => {
      const url = new URL(fileUrl);
      const pathSegments = url.pathname.split("/");
      const fileName = pathSegments[pathSegments.length - 1];
      formData.append("deleteFileNames", fileName); // ✅ 'deleteFileNames' 키로 보내야 backend에서 받음
    });

    // 새로 추가할 파일 목록을 FormData에 추가
    newFiles.forEach((fileObj) => {
      formData.append("newFiles", fileObj.file); // 실제 File 객체를 전송
    });

    try {
      await axios.put(`/api/review/update/${review.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast("수정 완료!");
      navigate(`/facility/${encodeURIComponent(review.facilityName)}`);
    } catch (e) {
      toast("수정 실패: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderRatingStars = () => {
    return (
      <div style={{ fontSize: "1.5rem", cursor: "pointer" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            onClick={() => setRating(n)}
            style={{
              color: n <= rating ? "#ffc107" : "#e4e5e9",
              marginRight: "4px",
            }}
          >
            ★
          </span>
        ))}
        <span style={{ marginLeft: "8px", fontSize: "1rem" }}>{rating}점</span>
      </div>
    );
  };

  // 기존 파일 삭제 처리 (filesToDelete 목록에 추가하고 UI에서 제거)
  const handleRemoveExistingFile = (fileUrlToRemove) => {
    setDeletefileNames((prev) => [...prev, fileUrlToRemove]);
    setExistingFiles((prev) => prev.filter((url) => url !== fileUrlToRemove));
  };

  // 새로 추가한 파일 삭제 처리 (newFiles 목록에서 제거 및 미리보기 URL 해제)
  const handleRemoveNewFile = (indexToRemove) => {
    setNewFiles((prev) => {
      const fileToRemove = prev[indexToRemove];
      if (fileToRemove && fileToRemove.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl); // 미리보기 URL 해제
      }
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  // 파일 선택 시 처리
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const filesWithPreview = selectedFiles.map((file) => ({
      file, // 실제 File 객체
      previewUrl: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null, // 이미지 미리보기 URL
    }));
    setNewFiles((prev) => [...prev, ...filesWithPreview]);
    // 파일 입력 필드 초기화 (동일한 파일을 다시 선택할 수 있도록)
    e.target.value = null;
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
    <div className="container mt-4">
      <h3>✏️ 리뷰 수정</h3>

      <Form.Group className="mb-3">
        <Form.Label>내용</Form.Label>
        <Form.Control
          as="textarea"
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isProcessing}
        />
      </Form.Group>

      {/* 기존 첨부 파일 목록 */}
      {existingFiles.length > 0 && (
        <ListGroup className="mb-3">
          <Form.Label>기존 첨부 파일</Form.Label>
          {existingFiles.map((fileUrl, idx) => (
            <ListGroup.Item
              key={`existing-${idx}`}
              className="d-flex justify-content-between align-items-center"
            >
              {isImageFile(fileUrl) && (
                <img
                  src={fileUrl}
                  alt="preview"
                  style={{
                    width: 40,
                    height: 40,
                    objectFit: "cover",
                    marginRight: "10px",
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/40x40/CCCCCC/333333?text=Err`;
                  }}
                />
              )}
              {/*이거 이름 없애도 되지 않나*/}
              <span className="text-truncate flex-grow-1">
                {getFileNameFromUrl(fileUrl)}
              </span>
              <Button
                size="sm"
                variant="outline-danger"
                onClick={() => handleRemoveExistingFile(fileUrl)}
                disabled={isProcessing}
              >
                <FaTrashAlt />
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* 새로 추가할 파일 목록 */}
      {newFiles.length > 0 && (
        <ListGroup className="mb-3">
          <Form.Label>새로 추가할 파일</Form.Label>
          {newFiles.map((fileObj, idx) => (
            <ListGroup.Item
              key={`new-${idx}`}
              className="d-flex justify-content-between align-items-center"
            >
              {fileObj.previewUrl && ( // 새로 추가하는 파일은 previewUrl이 이미지일 때만 존재
                <img
                  src={fileObj.previewUrl}
                  alt="preview"
                  style={{
                    width: 40,
                    height: 40,
                    objectFit: "cover",
                    marginRight: "10px",
                  }}
                />
              )}
              <span className="text-truncate flex-grow-1">
                {fileObj.file.name}
              </span>
              <Button
                size="sm"
                variant="outline-danger"
                onClick={() => handleRemoveNewFile(idx)}
                disabled={isProcessing}
              >
                <FaTrashAlt />
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* 파일 첨부 입력 */}
      <FormGroup className="mb-3">
        <Form.Label>파일 추가</Form.Label>
        <FormControl
          type="file"
          multiple
          onChange={handleFileChange}
          disabled={isProcessing}
        />
      </FormGroup>

      <Form.Group className="mb-3">
        <Form.Label>별점</Form.Label>
        {renderRatingStars()}
      </Form.Group>

      <div className="d-flex gap-2">
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          disabled={isProcessing}
        >
          취소
        </Button>
        <Button
          variant="primary"
          onClick={handleUpdate}
          disabled={isProcessing}
        >
          {isProcessing ? <Spinner size="sm" animation="border" /> : "수정"}
        </Button>
      </div>
    </div>
  );
}
