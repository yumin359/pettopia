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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      // 서버에 실제로 보내지 않고, 테스트용으로 성공만 처리
      await new Promise((resolve) => setTimeout(resolve, 500)); // 0.5초 대기 (선택사항)

      setSuccessMsg("문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변 드리겠습니다.");
      setForm({ email: "", subject: "", message: "" });
    } catch (err) {
      setErrorMsg("문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div
        className="text-center py-4"
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          borderRadius: "1px",
          margin: "1px auto",
          width: "fit-content",
          paddingLeft: "10px",
          paddingRight: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        SUPPORT
      </div>

      {successMsg && <Alert variant="success">{successMsg}</Alert>}
      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>이메일</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formSubject">
          <Form.Label>제목</Form.Label>
          <Form.Control
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formMessage">
          <Form.Label>문의 내용</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            name="message"
            value={form.message}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button type="submit" disabled={loading}>
          {loading ? "전송 중..." : "문의 보내기"}
        </Button>
      </Form>
    </div>
  );
}
