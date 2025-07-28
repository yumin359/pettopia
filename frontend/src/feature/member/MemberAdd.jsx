import {
  Button,
  Col,
  FormControl,
  FormGroup,
  FormLabel,
  FormText,
  ListGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import { useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { FaFileAlt, FaTrashAlt, FaPlus } from "react-icons/fa";

export function MemberAdd() {
  // 입력값 상태 정의
  const [files, setFiles] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [nickName, setNickName] = useState("");
  const [info, setInfo] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  // 숨겨진 파일 인풋을 참조하기 위한 useRef
  const fileInputRef = useRef(null); // 추가: useRef 훅

  // 정규식 (백엔드와 동일한 조건)
  const emailRegex = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=-]).{8,}$/;
  const nickRegex = /^[가-힣a-zA-Z0-9]{2,20}$/;

  // 유효성 검사 결과
  const isEmailValid = emailRegex.test(email);
  const isPasswordValid = passwordRegex.test(password);
  const isNickNameValid = nickRegex.test(nickName);
  const isPasswordMatch = password === password2;

  // 버튼 비활성화 조건
  const disabled = !(
    isEmailValid &&
    isPasswordValid &&
    isNickNameValid &&
    isPasswordMatch &&
    !isProcessing
  );

  // 파일 첨부 시 처리하는 함수 (프로필 사진은 하나만)
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]; // 선택된 파일 중 첫 번째만 가져옵니다.
    if (selectedFile) {
      // 새로운 파일을 받으면 기존 파일들을 대체
      setFiles([
        {
          file: selectedFile,
          previewUrl: URL.createObjectURL(selectedFile), // 이미지 미리보기 URL 생성
        },
      ]);
    } else {
      // 파일 선택이 취소된 경우
      setFiles([]); // 파일 목록 초기화
    }
  };

  // 프로필 이미지 클릭 시 숨겨진 파일 인풋 클릭
  const handleProfileClick = () => {
    fileInputRef.current.click();
  };

  function handleSaveClick() {
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("nickName", nickName);
    formData.append("info", info);

    // files 배열에 프로필 이미지가 있다면 첫 번째 파일만 추가
    if (files.length > 0) {
      formData.append("files", files[0].file);
    }
    // files.forEach((fileObj) => formData.append("files", fileObj.file));

    // 걍 방식 차이인가?
    axios
      .post("/api/member/add", formData, {
        headers: { "Content-type": "multipart/form-data" },
      })
      .then((res) => {
        const message = res.data.message;
        if (message) {
          toast(message.text, { type: message.type });
        }
        navigate("/");
      })
      .catch((err) => {
        const message = err.response.data.message;
        if (message) {
          toast(message.text, { type: message.type });
        }
      })
      .finally(() => {
        setIsProcessing(false);
      });
  }

  // 현재 선택된 프로필 이미지의 미리보기 URL
  const currentProfilePreview = files.length > 0 ? files[0].previewUrl : null;

  return (
    <Row className="justify-content-center">
      <Col xs={12} md={8} lg={6}>
        <h2 className="mb-4">회원 가입</h2>

        {/* 프로필 사진 업로드 섹션 */}
        <FormGroup className="mb-4">
          <FormLabel className="d-block text-center mb-3">
            프로필 사진
          </FormLabel>
          <div className="d-flex justify-content-center">
            {/* 프로필 이미지 미리보기 또는 아이콘 */}
            <div
              className="profile-upload-area shadow rounded-circle d-flex justify-content-center align-items-center"
              onClick={handleProfileClick}
              style={{
                width: "150px", // 원하는 크기
                height: "150px", // 원하는 크기
                border: "2px solid #ddd",
                cursor: "pointer",
                overflow: "hidden", // 이미지가 영역을 벗어나지 않도록
                backgroundColor: currentProfilePreview
                  ? "transparent"
                  : "#f8f9fa", // 배경색
              }}
            >
              {currentProfilePreview ? (
                <img
                  src={currentProfilePreview}
                  alt="프로필 미리보기"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <FaPlus size={40} color="#6c757d" /> // 이미지가 없을 때 + 아이콘
              )}
            </div>

            {/* 실제 파일 선택 input (숨김) */}
            <FormControl
              type="file"
              ref={fileInputRef} // useRef로 참조
              onChange={handleFileChange}
              style={{ display: "none" }} // 숨김
              accept="image/*" // 이미지 파일만 선택하도록 제한
              disabled={isProcessing}
            />
          </div>
        </FormGroup>

        <hr />
        {/* 프로필 사진 섹션과 다른 폼 필드 구분 */}

        {/* 이메일 */}
        <FormGroup className="mb-3" controlId="email1">
          <FormLabel>이메일</FormLabel>
          <FormControl
            type="text"
            value={email}
            maxLength={255}
            placeholder="예: user@example.com"
            onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))}
          />
          {email && !isEmailValid && (
            <FormText className="text-danger">
              이메일 형식이 올바르지 않습니다.
            </FormText>
          )}
        </FormGroup>

        {/* 비밀번호 */}
        <FormGroup className="mb-3" controlId="password1">
          <FormLabel>비밀번호</FormLabel>
          <FormControl
            type="password"
            value={password}
            maxLength={255}
            placeholder="8자 이상, 영문 대/소문자, 숫자, 특수문자 포함"
            onChange={(e) => setPassword(e.target.value.replace(/\s/g, ""))}
          />
          {password && !isPasswordValid && (
            <FormText className="text-danger">
              비밀번호는 8자 이상, 영문 대소문자, 숫자, 특수문자를 포함해야
              합니다.
            </FormText>
          )}
        </FormGroup>

        {/* 비밀번호 확인 */}
        <FormGroup className="mb-3" controlId="password2">
          <FormLabel>비밀번호 확인</FormLabel>
          <FormControl
            type="password"
            value={password2}
            maxLength={255}
            placeholder="비밀번호를 다시 입력하세요"
            onChange={(e) => setPassword2(e.target.value.replace(/\s/g, ""))}
          />
          {password2 && !isPasswordMatch && (
            <FormText className="text-danger">
              비밀번호가 일치하지 않습니다.
            </FormText>
          )}
        </FormGroup>

        <hr />
        {/* 닉네임 */}
        <FormGroup className="mb-3" controlId="nickName1">
          <FormLabel>별명</FormLabel>
          <FormControl
            value={nickName}
            maxLength={20}
            placeholder="2~20자, 한글/영문/숫자만 사용 가능"
            onChange={(e) => setNickName(e.target.value.replace(/\s/g, ""))}
          />
          {nickName && !isNickNameValid && (
            <FormText className="text-danger">
              별명은 2~20자, 한글/영문/숫자만 사용할 수 있습니다.
            </FormText>
          )}
        </FormGroup>

        {/* 자기 소개 */}
        <FormGroup className="mb-3" controlId="info1">
          <FormLabel>자기 소개</FormLabel>
          <FormControl
            as="textarea"
            rows={3}
            value={info}
            maxLength={3000}
            placeholder="자기 소개를 입력하세요. 1000자 이내. (선택)"
            onChange={(e) => setInfo(e.target.value)}
          />
        </FormGroup>

        {/* 가입 버튼 */}
        <div className="mb-3">
          <Button onClick={handleSaveClick} disabled={disabled}>
            {isProcessing && <Spinner size="sm" />}가입
          </Button>
        </div>
      </Col>
    </Row>
  );
}
