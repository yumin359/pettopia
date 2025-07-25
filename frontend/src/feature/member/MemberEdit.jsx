import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  FormControl,
  FormGroup,
  FormLabel,
  FormText,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";
import { FaPlus, FaTrashAlt } from "react-icons/fa";

export function MemberEdit() {
  // 상태 정의
  // 회원 정보 상태
  const [member, setMember] = useState(null);
  // 모달 및 비밀번호 관련 상태
  const [modalShow, setModalShow] = useState(false);
  const [passwordModalShow, setPasswordModalShow] = useState(false);
  const [password, setPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword1, setNewPassword1] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  // 라우팅 및 인증 관련 훅
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { hasAccess } = useContext(AuthenticationContext);
  const isSelf = member ? hasAccess(member.email) : false;

  // 프로필 이미지 관련 상태
  const [currentProfileDisplayUrl, setCurrentProfileDisplayUrl] =
    useState(null); // 현재 표시될 이미지 URL (기존 또는 새로 선택된 Blob URL)
  const [fileToUpload, setFileToUpload] = useState(null); // 백엔드로 전송할 실제 파일 객체 (새로 선택된 경우)
  const [isProfileImageDeleted, setIsProfileImageDeleted] = useState(false); // 프로필 이미지가 명시적으로 삭제되었는지 여부
  const fileInputRef = useRef(null); // 숨겨진 파일 input 참조

  // 정규식
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=-]).{8,}$/;
  const nickRegex = /^[가-힣a-zA-Z0-9]{2,20}$/;

  // 최초 회원 정보 로딩
  useEffect(() => {
    axios
      .get(`/api/member?email=${params.get("email")}`)
      .then((res) => {
        setMember(res.data);
        // 기존 프로필 이미지가 있다면 미리보기에 설정
        const existingProfileImage = res.data.files?.find((fileUrl) =>
          /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl),
        );
        if (existingProfileImage) {
          setCurrentProfileDisplayUrl(existingProfileImage); // 기존 이미지 URL 설정
        } else {
          setCurrentProfileDisplayUrl(null); // 기존 이미지가 없으면 null로 초기화
        }
        setFileToUpload(null); // 새로 선택된 파일 없음
        setIsProfileImageDeleted(false); // 삭제 상태 아님
      })
      .catch((err) => {
        console.error("회원 정보 로딩 실패", err);
        toast.error("회원 정보를 불러오는 중 오류가 발생했습니다.");
      });
  }, [params]);

  // 흠
  // 컴포넌트 언마운트 시 또는 새 파일 선택 시 기존 미리보기 Blob URL 해제 (메모리 관리)
  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 현재 표시 중인 URL이 Blob URL이면 해제
      if (
        currentProfileDisplayUrl &&
        currentProfileDisplayUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(currentProfileDisplayUrl);
      }
    };
  }, [currentProfileDisplayUrl]); // currentProfileDisplayUrl이 변경될 때마다 cleanup 함수가 다시 등록됨

  if (!member) {
    return (
      <div className="d-flex justify-content-center my-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  // 유효성
  const isNickNameValid = nickRegex.test(member.nickName);
  const isPasswordValid = passwordRegex.test(newPassword1);
  const isPasswordMatch = newPassword1 === newPassword2;

  // 버튼 비활성화
  const isSaveDisabled = !isNickNameValid;
  const isChangePasswordDisabled =
    !oldPassword ||
    !newPassword1 ||
    !newPassword2 ||
    !isPasswordValid ||
    !isPasswordMatch;

  // 프로필 이미지 클릭 시 숨겨진 파일 input 활성화
  const handleProfileClick = () => {
    if (isSelf && fileInputRef.current) {
      // 본인만 클릭 가능
      fileInputRef.current.click();
    }
  };

  // 파일 선택 시 처리하는 함수
  const handleFileChange = (e) => {
    const file = e.target.files[0]; // 선택된 파일 중 첫 번째만 가져옴
    if (file) {
      // 기존 미리보기 URL이 Blob URL이었다면 해제
      if (
        currentProfileDisplayUrl &&
        currentProfileDisplayUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(currentProfileDisplayUrl);
      }
      setFileToUpload(file); // 백엔드로 전송할 파일 객체 설정
      setCurrentProfileDisplayUrl(URL.createObjectURL(file)); // 새 파일의 미리보기 URL 설정
      setIsProfileImageDeleted(false); // 파일이 선택되었으므로 삭제 상태 해제
    } else {
      // 파일 선택이 취소된 경우: 현재 상태 유지 (기존 이미지가 있었다면 그대로 보임)
      // setFileToUpload(null); // 이 경우 null로 설정하지 않음
      // setIsProfileImageDeleted(false); // 이 경우 삭제 상태 해제하지 않음
    }
  };

  // 프로필 이미지 제거 버튼 클릭 시 처리하는 함수
  const handleRemoveProfile = () => {
    if (
      currentProfileDisplayUrl &&
      currentProfileDisplayUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(currentProfileDisplayUrl); // 생성된 Blob URL 해제
    }
    setFileToUpload(null); // 백엔드로 보낼 파일 없음
    setCurrentProfileDisplayUrl(null); // 미리보기 비움
    setIsProfileImageDeleted(true); // 프로필 이미지가 명시적으로 삭제됨을 표시
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // 파일 input 값 초기화
    }
  };

  // 가입일시 포맷 통일
  const formattedInsertedAt = member.insertedAt
    ? member.insertedAt.replace("T", " ").substring(0, 16)
    : "";

  // 정보 수정 요청
  const handleSaveButtonClick = () => {
    const formData = new FormData();
    formData.append("email", member.email);
    formData.append("nickName", member.nickName);
    formData.append("info", member.info || ""); // null일때 빈문자열 전송

    // 현재 비밀번호 확인용 (모달에서 입력받은 경우에만 전송)
    if (password) {
      formData.append("password", password);
    }

    // 파일 처리 로직 (가장 중요!)
    if (fileToUpload) {
      // 1. 새 파일이 선택된 경우 (기존 이미지 대체 또는 새로 추가)
      formData.append("profileImage", fileToUpload); // 백엔드에서 받을 파라미터 이름 ("profileImage"로 가정)
    } else if (isProfileImageDeleted) {
      // 2. 프로필 이미지를 명시적으로 삭제한 경우
      formData.append("deleteProfileImage", "true"); // 백엔드에 삭제 플래그 전송
    }
    // 3. else: fileToUpload도 없고 isProfileImageDeleted도 false인 경우
    //    -> 프로필 이미지 변경 없음 (기존 이미지가 있다면 유지, 없다면 계속 없음)
    //    이 경우에는 formData에 파일 관련 아무것도 추가하지 않음

    axios
      .put(`/api/member`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        const message = res.data.message;
        if (message) toast(message.text, { type: message.type });
        navigate("/member/detail?email=${member.email}");
      })
      .catch((err) => {
        const message = err.response?.data?.message;
        if (message) toast(message.text, { type: message.type });
      })
      .finally(() => {
        setModalShow(false);
        setPassword("");
      });
  };

  // 비밀번호 변경 요청
  const handleChangePasswordButtonClick = () => {
    axios
      .put(`/api/member/changePassword`, {
        email: member.email,
        oldPassword,
        newPassword: newPassword1,
      })
      .then((res) => {
        const message = res.data.message;
        if (message) toast(message.text, { type: message.type });
        setPasswordModalShow(false);
        setOldPassword("");
        setNewPassword1("");
        setNewPassword2("");
      })
      .catch((err) => {
        const message = err.response?.data?.message;
        if (message) toast(message.text, { type: message.type });
      });
  };

  return (
    <Row className="justify-content-center my-4">
      <Col xs={12} md={8} lg={6}>
        {/* 상단 제목 및 이메일+관리자 배지 */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold mb-0 text-dark">회원 정보</h3>
          <small className="text-muted" style={{ fontSize: "0.85rem" }}>
            {member.email === "admin@email.com" ? (
              <span className="badge bg-danger">관리자</span>
            ) : (
              <span className="badge bg-secondary">일반 사용자</span>
            )}
          </small>
        </div>

        <Card className="shadow-sm border-0 rounded-3 mb-4">
          <Card.Body>
            {/* 프로필 사진 업로드 섹션 */}
            <FormGroup className="mb-4">
              <div className="d-flex justify-content-center flex-column align-items-center gap-2">
                {/* 프로필 이미지 미리보기 또는 아이콘 */}
                <div
                  className="profile-upload-area shadow rounded-circle d-flex justify-content-center align-items-center"
                  onClick={handleProfileClick} // 본인만 클릭 가능 로직은 handleProfileClick 내에서 처리
                  style={{
                    width: "150px", // 원하는 크기
                    height: "150px", // 원하는 크기
                    border: `2px solid ${isSelf ? "#ddd" : "#eee"}`, // 수정 권한 없으면 테두리 색 다르게
                    cursor: isSelf ? "pointer" : "default", // 본인만 커서 변경
                    overflow: "hidden", // 이미지가 영역을 벗어나지 않도록
                    backgroundColor: currentProfileDisplayUrl
                      ? "transparent"
                      : "#f8f9fa", // 배경색
                  }}
                >
                  {currentProfileDisplayUrl ? (
                    <img
                      src={currentProfileDisplayUrl}
                      alt="프로필 미리보기"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
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
                  disabled={!isSelf} // 본인만 파일 선택 가능
                  // 이전에 선택된 파일을 다시 선택해도 onChange 이벤트가 발생하도록 value를 초기화
                  onClick={(e) => {
                    e.target.value = null;
                  }}
                />

                {/* 프로필 사진 제거 버튼 */}
                {isSelf &&
                  currentProfileDisplayUrl && ( // 본인이고 현재 표시될 이미지가 있을 때만 보임
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={handleRemoveProfile}
                      className="mt-2 d-flex align-items-center gap-1"
                    >
                      <FaTrashAlt /> 프로필 사진 제거
                    </Button>
                  )}
              </div>
            </FormGroup>

            <hr />

            <FormGroup controlId="email1" className="mb-3">
              <FormLabel>이메일</FormLabel>
              <FormControl
                disabled
                value={member.email}
                className="bg-secondary bg-opacity-10 border-0"
                style={{ userSelect: "text", color: "#6c757d" }}
              />
            </FormGroup>

            <FormGroup controlId="nickName1" className="mb-3">
              <FormLabel>별명</FormLabel>
              <FormControl
                value={member.nickName}
                maxLength={20}
                placeholder="2~20자, 한글/영문/숫자만 사용 가능"
                onChange={(e) =>
                  setMember({
                    ...member,
                    nickName: e.target.value.replace(/\s/g, ""),
                  })
                }
                className="bg-light border-0"
                style={{ userSelect: "text" }}
                disabled={!isSelf}
              />
              {member.nickName && !isNickNameValid && (
                <FormText className="text-danger">
                  별명은 2~20자, 한글/영문/숫자만 사용할 수 있습니다.
                </FormText>
              )}
            </FormGroup>

            <FormGroup controlId="info1" className="mb-3">
              <FormLabel>자기소개</FormLabel>
              <FormControl
                as="textarea"
                value={member.info || ""}
                maxLength={3000}
                onChange={(e) => setMember({ ...member, info: e.target.value })}
                className="bg-light border-0"
                style={{
                  minHeight: "120px",
                  resize: "none",
                  userSelect: "text",
                }}
                disabled={!isSelf}
              />
            </FormGroup>

            <FormGroup controlId="insertedAt1" className="mb-3">
              <FormLabel>가입일시</FormLabel>
              <FormControl
                disabled
                value={formattedInsertedAt}
                className="bg-secondary bg-opacity-10 border-0"
                style={{ userSelect: "text", color: "#6c757d" }}
              />
            </FormGroup>

            {/* 버튼 3개 - 탈퇴, 수정, 로그아웃과 같은 스타일과 위치 */}
            {hasAccess(member.email) && (
              <div className="d-flex justify-content-start gap-2">
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate(-1)}
                  className="d-flex align-items-center gap-1"
                >
                  취소
                </Button>
                <Button
                  variant="primary"
                  disabled={isSaveDisabled}
                  onClick={() => setModalShow(true)}
                  className="d-flex align-items-center gap-1"
                >
                  저장
                </Button>
                <Button
                  variant="outline-info"
                  onClick={() => setPasswordModalShow(true)}
                  className="d-flex align-items-center gap-1"
                >
                  비밀번호 변경
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* 회원 정보 수정 확인 모달 */}
        <Modal show={modalShow} onHide={() => setModalShow(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>회원 정보 수정 확인</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup controlId="password1">
              <FormLabel>암호</FormLabel>
              <FormControl
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="현재 비밀번호를 입력하세요"
                autoFocus
              />
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setModalShow(false)}
            >
              취소
            </Button>
            <Button variant="primary" onClick={handleSaveButtonClick}>
              저장
            </Button>
          </Modal.Footer>
        </Modal>

        {/* 비밀번호 변경 모달 */}
        <Modal
          show={passwordModalShow}
          onHide={() => setPasswordModalShow(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>비밀번호 변경</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup className="mb-3" controlId="password2">
              <FormLabel>현재 비밀번호</FormLabel>
              <FormControl
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="bg-light border-0"
                style={{ userSelect: "text" }}
              />
            </FormGroup>

            <FormGroup className="mb-3" controlId="password3">
              <FormLabel>변경할 비밀번호</FormLabel>
              <FormControl
                type="password"
                value={newPassword1}
                maxLength={255}
                placeholder="8자 이상, 영문 대/소문자, 숫자, 특수문자 포함"
                onChange={(e) => setNewPassword1(e.target.value)}
                className="bg-light border-0"
                style={{ userSelect: "text" }}
              />
              {newPassword1 && !isPasswordValid && (
                <FormText className="text-danger">
                  비밀번호는 8자 이상, 영문 대소문자, 숫자, 특수문자를 포함해야
                  합니다.
                </FormText>
              )}
            </FormGroup>

            <FormGroup className="mb-3" controlId="password4">
              <FormLabel>변경할 비밀번호 확인</FormLabel>
              <FormControl
                type="password"
                value={newPassword2}
                maxLength={255}
                placeholder="변경할 비밀번호를 다시 입력하세요"
                onChange={(e) => setNewPassword2(e.target.value)}
                className="bg-light border-0"
                style={{ userSelect: "text" }}
              />
              {newPassword2 && !isPasswordMatch && (
                <FormText className="text-danger">
                  비밀번호가 일치하지 않습니다.
                </FormText>
              )}
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setPasswordModalShow(false)}
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleChangePasswordButtonClick}
              disabled={isChangePasswordDisabled}
            >
              변경
            </Button>
          </Modal.Footer>
        </Modal>
      </Col>
    </Row>
  );
}
