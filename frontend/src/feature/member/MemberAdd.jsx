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
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { FaFileAlt, FaTrashAlt } from "react-icons/fa";

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

  function handleSaveClick() {
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("nickName", nickName);
    formData.append("info", info);
    files.forEach((fileObj) => formData.append("files", fileObj.file));

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

  return (
    <Row className="justify-content-center">
      <Col xs={12} md={8} lg={6}>
        <h2 className="mb-4">회원 가입</h2>

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

        {/* 그리고 나서 파일 선택 input */}
        <FormGroup className="mb-4">
          <FormLabel>프로필 사진</FormLabel>
          <FormControl
            type="file"
            multiple
            onChange={handleFileChange}
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
