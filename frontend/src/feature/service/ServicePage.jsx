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

        <Button type="submit" disabled={loading} variant="warning">
          {loading ? "전송 중..." : "문의 보내기"}
        </Button>
      </Form>
    </div>
  );
}
