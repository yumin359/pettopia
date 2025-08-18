import { Button, Form, FormText, Spinner } from "react-bootstrap";
import { useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { FaCheckCircle, FaPaw, FaPlus } from "react-icons/fa";
import "../../styles/MemberAdd.css";

export function MemberAdd() {
  // 입력값 상태 정의
  const [files, setFiles] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [nickName, setNickName] = useState("");
  const [info] = useState("");
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
    <>
      <div className="signup-page-wrapper">
        <div className="signup-container-v2">
          {/* 왼쪽: 환영 패널 */}
          <div className="signup-welcome-panel">
            <div className="welcome-content">
              <h1 className="welcome-logo">🐾 PETOPIA</h1>
              {/* 2. 환영 메시지를 더 따뜻하게 변경 */}
              <h2>
                펫토피아의
                <br />
                가족이 되세요!
              </h2>
              <p>따뜻한 커뮤니티가 당신을 기다립니다.</p>
              <ul className="welcome-benefits">
                {/* 3. 아이콘을 FaPaw로 변경 */}
                <li>
                  <FaPaw /> 전국의 펫플레이스 정보 탐색
                </li>
                <li>
                  <FaPaw /> 나만의 장소 리뷰 및 공유
                </li>
                <li>
                  <FaPaw /> 다른 반려인들과의 소통
                </li>
              </ul>
            </div>
          </div>

          {/* 오른쪽: 가입 폼 패널 */}
          <div className="signup-form-panel">
            <Form>
              <Form.Group className="mb-4 text-center">
                <div
                  className="profile-uploader-neo rounded-circle"
                  onClick={handleProfileClick}
                >
                  {currentProfilePreview ? (
                    <img
                      src={currentProfilePreview}
                      alt="프로필 미리보기"
                      className="profile-preview-img"
                    />
                  ) : (
                    <FaPlus size={40} color="#999" />
                  )}
                </div>
                <p className="form-label-neo mb-3 mt-4">프로필 사진 (선택)</p>
                <Form.Control
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  accept="image/*"
                  disabled={isProcessing}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="form-label-neo">이메일</Form.Label>
                <Form.Control
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))}
                  className="form-input-neo"
                  placeholder="user@example.com"
                />
                {email && !isEmailValid && (
                  <FormText className="text-danger fw-bold">
                    이메일 형식이 올바르지 않습니다.
                  </FormText>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="form-label-neo">비밀번호</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value.replace(/\s/g, ""))
                  }
                  className="form-input-neo"
                  placeholder="8자 이상, 대/소문자, 숫자, 특수문자 포함"
                />
                {password && !isPasswordValid && (
                  <FormText className="text-danger fw-bold">
                    비밀번호는 8자 이상, 영문 대소문자, 숫자, 특수문자를
                    포함해야 합니다.
                  </FormText>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="form-label-neo">
                  비밀번호 확인
                </Form.Label>
                <Form.Control
                  type="password"
                  value={password2}
                  onChange={(e) =>
                    setPassword2(e.target.value.replace(/\s/g, ""))
                  }
                  className="form-input-neo"
                  placeholder="비밀번호를 다시 한번 입력해주세요"
                />
                {password2 && !isPasswordMatch && (
                  <FormText className="text-danger fw-bold">
                    비밀번호가 일치하지 않습니다.
                  </FormText>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="form-label-neo">별명</Form.Label>
                <Form.Control
                  value={nickName}
                  onChange={(e) =>
                    setNickName(e.target.value.replace(/\s/g, ""))
                  }
                  className="form-input-neo"
                  placeholder="2~20자, 한글/영문/숫자"
                />
                {nickName && !isNickNameValid && (
                  <FormText className="text-danger fw-bold">
                    별명은 2~20자, 한글/영문/숫자만 사용할 수 있습니다.
                  </FormText>
                )}
              </Form.Group>

              <div className="mt-4">
                <Button
                  onClick={handleSaveClick}
                  disabled={disabled}
                  className="btn-neo btn-primary-neo w-100"
                >
                  {isProcessing && <Spinner size="sm" className="me-2" />}
                  가입하기
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
