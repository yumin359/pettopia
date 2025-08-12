import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";

export default function ServicePage() {
  const [form, setForm] = useState({
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // 추가: 폼 오류 상태
  const [formErrors, setFormErrors] = useState({
    email: "",
    subject: "",
    message: "",
  });

  const validateEmail = (email) => {
    // 간단한 이메일 정규식 검사
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 길이 제한 적용
    if (name === "subject" && value.length > 20) return;
    if (name === "message" && value.length > 100) return;

    setForm((prev) => ({ ...prev, [name]: value }));

    // 유효성 검사 후 에러 상태 업데이트
    setFormErrors((prev) => {
      const newErrors = { ...prev };

      if (name === "email") {
        if (!validateEmail(value)) {
          newErrors.email = "올바른 이메일 형식을 입력하세요.";
        } else {
          newErrors.email = "";
        }
      } else if (name === "subject") {
        newErrors.subject = value.length > 20 ? "제목은 20자 이하로 작성해주세요." : "";
      } else if (name === "message") {
        newErrors.message = value.length > 100 ? "문의 내용은 100자 이하로 작성해주세요." : "";
      }

      return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 제출 전 최종 유효성 검사
    if (!validateEmail(form.email)) {
      setErrorMsg("올바른 이메일 형식을 입력하세요.");
      return;
    }
    if (form.subject.length === 0 || form.subject.length > 20) {
      setErrorMsg("제목은 1자 이상 20자 이하로 작성해주세요.");
      return;
    }
    if (form.message.length === 0 || form.message.length > 100) {
      setErrorMsg("문의 내용은 1자 이상 100자 이하로 작성해주세요.");
      return;
    }

    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          subject: form.subject,
          message: form.message,
        }),
      });

      if (!response.ok) {
        throw new Error("서버 오류");
      }

      const data = await response.text();

      setSuccessMsg(data);
      setForm({ email: "", subject: "", message: "" });
      setFormErrors({ email: "", subject: "", message: "" });
    } catch (err) {
      setErrorMsg("문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      {successMsg && <Alert variant="success">{successMsg}</Alert>}
      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

      <Form onSubmit={handleSubmit} noValidate>
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>이메일</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            isInvalid={!!formErrors.email}
            required
          />
          <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formSubject">
          <Form.Label>제목 (최대 20자)</Form.Label>
          <Form.Control
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            isInvalid={!!formErrors.subject}
            maxLength={20}
            required
          />
          <Form.Control.Feedback type="invalid">{formErrors.subject}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formMessage">
          <Form.Label>문의 내용 (최대 100자)</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            name="message"
            value={form.message}
            onChange={handleChange}
            isInvalid={!!formErrors.message}
            maxLength={100}
            required
            style={{ resize: "none" }}  // 여기 추가
          />
          <Form.Control.Feedback type="invalid">{formErrors.message}</Form.Control.Feedback>
          <div className="text-end text-muted" style={{ fontSize: "0.8rem" }}>
            {form.message.length} / 100
          </div>
        </Form.Group>

        <Button type="submit" disabled={loading} variant="warning">
          {loading ? "전송 중..." : "문의 보내기"}
        </Button>
      </Form>
    </div>
  );
}
