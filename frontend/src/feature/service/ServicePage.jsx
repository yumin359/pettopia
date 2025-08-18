import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import "../../styles/service.css";
import { FaPhoneAlt, FaRegBuilding, FaRegEnvelope } from "react-icons/fa";

export default function ServicePage() {
  const [form, setForm] = useState({
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // 필드별 에러 상태
  const [formErrors, setFormErrors] = useState({
    email: "",
    subject: "",
    message: "",
  });

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 길이 제한
    if (name === "subject" && value.length > 20) return;
    if (name === "message" && value.length > 100) return;

    setForm((prev) => ({ ...prev, [name]: value }));

    // 입력 중 유효성 검사 업데이트
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      if (name === "email") {
        newErrors.email = validateEmail(value)
          ? ""
          : "올바른 이메일 형식을 입력하세요.";
      } else if (name === "subject") {
        newErrors.subject =
          value.length > 20 ? "제목은 20자 이하로 작성해주세요." : "";
      } else if (name === "message") {
        newErrors.message =
          value.length > 100 ? "문의 내용은 100자 이하로 작성해주세요." : "";
      }
      return newErrors;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 제출 전 유효성 검사
    const errors = { email: "", subject: "", message: "" };
    let hasError = false;

    if (!validateEmail(form.email)) {
      errors.email = "올바른 이메일 형식을 입력하세요.";
      hasError = true;
    }
    if (form.subject.length === 0 || form.subject.length > 20) {
      errors.subject = "제목은 1자 이상 20자 이하로 작성해주세요.";
      hasError = true;
    }
    if (form.message.length === 0 || form.message.length > 100) {
      errors.message = "문의 내용은 1자 이상 100자 이하로 작성해주세요.";
      hasError = true;
    }

    if (hasError) {
      setFormErrors(errors);
      return; // 에러 있으면 제출 중단
    }

    // 에러 없으면 초기화
    setFormErrors({ email: "", subject: "", message: "" });
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    // 비동기 요청
    (async () => {
      try {
        const response = await fetch("/api/support", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        if (!response.ok) {
          throw new Error("서버 오류");
        }

        const data = await response.text();

        setSuccessMsg(data);
        setForm({ email: "", subject: "", message: "" });
      } catch {
        setErrorMsg(
          "문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        );
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    // 페이지 전체를 감싸는 새로운 레이아웃 컨테이너
    <div className="support-page-container">
      <div className="support-page-header">
        <h1>CONTACT US</h1>
        <p>PETOPIA에 궁금한 점이 있으신가요? 언제든지 편하게 문의해주세요.</p>
      </div>

      {/* 2단 레이아웃을 위한 그리드 */}
      <div className="support-grid">
        {/* 왼쪽 정보 컬럼 */}
        <div className="support-info-panel">
          <h3>문의 정보</h3>
          <p>
            아래 연락처를 통해 직접 문의하시거나, 오른쪽의 양식을 작성하여
            보내주시면 신속하게 답변해 드리겠습니다.
          </p>
          <div className="contact-details">
            <div className="contact-item">
              <FaRegBuilding size={20} />
              <span>PETOPIA Portfolio Project</span>
            </div>
            <div className="contact-item">
              <FaRegEnvelope size={20} />
              <span>jiwan78choi@gmail.com</span>
            </div>
            <div className="contact-item">
              <FaPhoneAlt size={20} />
              <span>TEL: 010-1234-5678</span>
            </div>
          </div>
        </div>

        {/* 오른쪽 폼 컬럼 */}
        <div className="support-form-panel">
          {successMsg && (
            <Alert className="alert-neo alert-success-neo">{successMsg}</Alert>
          )}
          {errorMsg && (
            <Alert className="alert-neo alert-danger-neo">{errorMsg}</Alert>
          )}

          <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-4" controlId="formEmail">
              <Form.Label className="form-label-neo">이메일 주소</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                isInvalid={!!formErrors.email}
                required
                className="form-input-neo"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" controlId="formSubject">
              <Form.Label className="form-label-neo">제목</Form.Label>
              <Form.Control
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                isInvalid={!!formErrors.subject}
                maxLength={50}
                required
                className="form-input-neo"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.subject}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" controlId="formMessage">
              <Form.Label className="form-label-neo">문의 내용</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                name="message"
                value={form.message}
                onChange={handleChange}
                isInvalid={!!formErrors.message}
                maxLength={500}
                required
                className="form-input-neo"
                style={{ resize: "none" }}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.message}
              </Form.Control.Feedback>
              <div
                className="text-end text-muted mt-1"
                style={{ fontSize: "0.8rem" }}
              >
                {form.message.length} / 500
              </div>
            </Form.Group>

            <Button
              type="submit"
              disabled={loading}
              className="btn-neo btn-warning-neo w-100"
            >
              {loading ? "전송 중..." : "문의 보내기"}
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
