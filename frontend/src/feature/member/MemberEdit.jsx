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
  // 📝 프로필 이미지 관련 상태 변경:
  const [currentProfileUrls, setCurrentProfileUrls] = useState([]); // 현재 멤버가 가진 프로필 이미지 URL 목록
  const [newProfileFiles, setNewProfileFiles] = useState([]); // 새로 추가할 프로필 파일 (MultipartFile)
  const [deleteProfileFileNames, setDeleteProfileFileNames] = useState([]); // 삭제할 프로필 파일 이름 목록
  // kakao 수정 임시코드
  const [tempCode, setTempCode] = useState("");
  // 라우팅 및 인증 관련 훅
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { hasAccess, updateUser } = useContext(AuthenticationContext);
  const isSelf = member ? hasAccess(member.email) : false;

  const fileInputRef = useRef(null);

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
        // 기존 프로필 이미지 URL들을 설정 (res.data.files에서 이미지 파일만 필터링)
        const existingImages = res.data.files?.filter((fileUrl) =>
          /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl),
        );
        setCurrentProfileUrls(existingImages || []); // 이미지 없으면 빈 배열
        setNewProfileFiles([]); // 새로 선택된 파일 없음
        setDeleteProfileFileNames([]); // 삭제할 파일 없음
      })
      .catch((err) => {
        console.error("회원 정보 로딩 실패", err);
        toast.error("회원 정보를 불러오는 중 오류가 발생했습니다.");
      });
  }, [params]);

  // 흠
  // 컴포넌트 언마운트 시 또는 새 파일 선택 시 기존 미리보기 Blob URL 해제 (메모리 관리)
  useEffect(() => {
    // newProfileFiles에 있는 Blob URL들을 추적하고 언마운트 시 해제
    return () => {
      newProfileFiles.forEach((file) => {
        if (file instanceof File && file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, [newProfileFiles]);

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

  // 📝 파일 선택 시 처리하는 함수: newProfileFiles에 추가
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      // 프로필 이미지는 보통 하나만 허용되므로, 기존 새 파일은 제거하고 새 파일만 추가 (단일 파일 제한)
      const file = selectedFiles[0];
      // 미리보기 URL을 파일 객체에 추가하여 관리
      file.previewUrl = URL.createObjectURL(file);
      setNewProfileFiles([file]); // 새로운 파일로 교체
      // 만약 기존 프로필 이미지가 있었다면, 삭제 목록에 추가해야 합니다.
      // 이 부분은 비즈니스 로직에 따라 다릅니다. (교체 = 삭제 후 추가 vs 그냥 대체)
      // 여기서는 '교체' 개념으로, 새로운 파일이 오면 기존 파일은 삭제 목록에 자동으로 추가
      if (
        currentProfileUrls.length > 0 &&
        deleteProfileFileNames.length === 0
      ) {
        // 현재 프로필 이미지가 있고, 아직 삭제 목록에 추가된 적이 없다면
        const fileName = currentProfileUrls[0].split("/").pop(); // 첫 번째 프로필 이미지를 삭제 대상으로 간주
        setDeleteProfileFileNames([fileName]);
      } else if (
        currentProfileUrls.length === 0 &&
        deleteProfileFileNames.length > 0
      ) {
        // 기존 이미지는 없는데 삭제 목록에 이미 파일이 있다면 (이전 삭제 버튼 클릭 후 새 파일 선택)
        // 삭제 목록 초기화 (새로운 파일이 올라왔으므로 삭제 필요 없음)
        setDeleteProfileFileNames([]);
      }
    }
    // 파일 선택 취소 시에는 아무것도 하지 않음 (기존 상태 유지)
  };

  // 📝 프로필 이미지 제거 버튼 클릭 시 처리하는 함수: deleteProfileFileNames에 추가, newProfileFiles 초기화
  const handleRemoveProfile = (fileUrlToRemove) => {
    // Blob URL이면 해제
    if (fileUrlToRemove && fileUrlToRemove.startsWith("blob:")) {
      URL.revokeObjectURL(fileUrlToRemove);
    }

    // 기존 프로필 이미지 URL에서 제거
    setCurrentProfileUrls((prevUrls) => {
      const remainingUrls = prevUrls.filter((url) => url !== fileUrlToRemove);
      return remainingUrls;
    });

    // 삭제할 파일 이름 목록에 추가
    const fileName = fileUrlToRemove.split("/").pop();
    setDeleteProfileFileNames((prevDelete) => [...prevDelete, fileName]);

    // 새로 추가하려던 파일이 있다면 모두 제거 (프로필 이미지를 '지우겠다'는 의도이므로)
    newProfileFiles.forEach((file) => {
      if (file instanceof File && file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
    });
    setNewProfileFiles([]);

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
    if (password.trim() === "") {
      toast.error("비밀번호를 입력해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("email", member.email);
    formData.append("nickName", member.nickName);
    formData.append("info", member.info || ""); // null일 때 빈문자열 전송

    // 현재 비밀번호 확인용 (모달에서 입력받은 경우에만 전송)
    formData.append("password", password);

    // 새로 추가할 프로필 파일들을 FormData에 추가
    newProfileFiles.forEach((file) => {
      formData.append("profileFiles", file); // 백엔드에서 List<MultipartFile> profileFiles로 받을 예정
    });

    // 삭제할 프로필 파일 이름들을 FormData에 추가
    deleteProfileFileNames.forEach((name) => {
      formData.append("deleteProfileFileNames", name); // 백엔드에서 List<String> deleteProfileFileNames로 받을 예정
    });

    axios
      .put(`/api/member`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        const message = res.data.message;
        if (message) toast(message.text, { type: message.type });
        updateUser({ nickName: member.nickName });
        navigate(`/member?email=${member.email}`);
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

  // 모든 프로필 이미지 (기존 + 새로 선택된)
  const allProfileImages = [
    ...currentProfileUrls,
    ...newProfileFiles.map((f) => f.previewUrl),
  ];
  const displayProfileImage =
    allProfileImages.length > 0 ? allProfileImages[0] : null; // 단일 프로필 이미지 가정 시

  const isKakao = member.provider?.includes("kakao");

  function handleModalShowClick() {
    if (isKakao) {
      axios
        .post("/api/member/withdrawalCode", { email: member.email })
        .then((res) => {
          setTempCode(res.data.tempCode);
          setModalShow(true);
        })
        .catch((err) => {
          console.error(err);
          console.log("임시 코드 발급 안 됨");
        })
        .finally(() => setPassword(""));
    } else {
      setModalShow(true);
    }
  }

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
              <FormLabel className="d-block text-center mb-3">
                프로필 사진
              </FormLabel>
              <div className="d-flex justify-content-center flex-column align-items-center gap-2">
                <div
                  className="profile-upload-area shadow rounded-circle d-flex justify-content-center align-items-center position-relative"
                  onClick={
                    isSelf && !displayProfileImage
                      ? handleProfileClick
                      : undefined
                  }
                  style={{
                    width: "150px",
                    height: "150px",
                    border: `2px solid ${isSelf ? "#ddd" : "#eee"}`,
                    cursor:
                      isSelf && !displayProfileImage ? "pointer" : "default",
                    overflow: "visible", // overflow를 visible로 변경
                    backgroundColor: displayProfileImage
                      ? "transparent"
                      : "#f8f9fa",
                  }}
                >
                  {displayProfileImage ? (
                    // 이미지가 있을 때: 이미지와 삭제 버튼을 함께 렌더링
                    <>
                      <img
                        src={displayProfileImage}
                        alt="프로필 미리보기"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "50%", // 이미지도 원형으로
                        }}
                      />
                      {isSelf && (
                        <Button
                          variant="danger"
                          className="position-absolute top-0 end-0 p-1"
                          style={{
                            borderRadius: "50%",
                            lineHeight: 0.8,
                            opacity: 0.8,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveProfile(displayProfileImage);
                          }}
                          aria-label="프로필 사진 제거"
                        >
                          &times;
                        </Button>
                      )}
                    </>
                  ) : (
                    // 이미지가 없을 때: + 아이콘만 렌더링
                    <FaPlus size={40} color="#6c757d" />
                  )}
                </div>

                <FormControl
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  accept="image/*"
                  disabled={!isSelf}
                  onClick={(e) => {
                    e.target.value = null;
                  }}
                />

                {/* 추가적인 파일 업로드 버튼 (옵션) */}
                {/*{isSelf && displayProfileImage && (*/}
                {/*  <Button*/}
                {/*    variant="outline-primary"*/}
                {/*    size="sm"*/}
                {/*    onClick={handleProfileClick}*/}
                {/*    className="mt-2"*/}
                {/*  >*/}
                {/*    사진 변경*/}
                {/*  </Button>*/}
                {/*)}*/}
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
                  onClick={handleModalShowClick}
                  className="d-flex align-items-center gap-1"
                >
                  저장
                </Button>
                {!isKakao && (
                  <Button
                    variant="outline-info"
                    onClick={() => setPasswordModalShow(true)}
                    className="d-flex align-items-center gap-1"
                  >
                    비밀번호 변경
                  </Button>
                )}
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
              <FormLabel>
                {isKakao
                  ? `정보 수정을 원하시면 ${tempCode}를 입력하세요.`
                  : "정보 수정을 원하시면 암호를 입력하세요."}
              </FormLabel>
              <FormControl
                type={isKakao ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  isKakao
                    ? "정보 수정을 원하시면 위의 코드를 입력하세요."
                    : "정보 수정을 원하시면 현재 비밀번호를 입력하세요."
                }
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
