import { useState } from "react";
import { Button, Form, InputGroup, Card, Spinner, Stack } from "react-bootstrap";

export function Chatbot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "안녕하세요! 펫토피아 챗봇입니다. 무엇을 도와드릴까요?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const exampleQuestions = [
    "강아지 피부 알레르기 관리법은?",
    "고양이 스트레스 해소 방법 알려주세요.",
    "반려동물과 여행할 때 준비물은?",
    "강아지 건강검진 주기는 어떻게 되나요?",
  ];


  const callClaudeViaBackend = async (userInput) => {
    const response = await fetch("/api/chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 512,
        temperature: 0.7,
        system: "당신은 정중한 말투로 한국어로만 대답하는 친절한 챗봇입니다.",
        messages: [
          {
            role: "user",
            content: userInput,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Claude 프록시 응답 실패");
    }

    const data = await response.json();
    return data?.content?.[0]?.text || "응답 없음";
  };

  const handleSend = async (customInput) => {
    const trimmed = (customInput ?? input).trim();
    if (!trimmed) return;

    const newMessages = [...messages, { sender: "user", text: trimmed }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const reply = await callClaudeViaBackend(trimmed);
      setMessages([...newMessages, { sender: "bot", text: reply }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { sender: "bot", text: `❌ 오류 발생: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExampleClick = (question) => {
    handleSend(question);
  };

  return (
    <div
      style={{
        padding: "1rem",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        width: "90%",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h2 className="mb-4">펫토피아 챗봇</h2>

      {/* 대화창 영역 */}
      <div
        style={{
          flexGrow: 1,
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "1rem",
          overflowY: "auto",
          marginBottom: "1rem",
          backgroundColor: "#f8f9fa",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          height: "500px", // 대화창 세로 길이 크게 조절
        }}
      >
        <div style={{ flexGrow: 1, overflowY: "auto" }}>
          {messages.map((msg, idx) => (
            <Card
              key={idx}
              className={`mb-2 p-2 ${
                msg.sender === "user" ? "text-end bg-light" : "bg-white"
              }`}
            >
              <Card.Text>{msg.text}</Card.Text>
            </Card>
          ))}

          {loading && (
            <div className="text-center mt-3">
              <Spinner animation="border" size="sm" />
            </div>
          )}
        </div>

        {/* 대화창 하단에 예시 질문 버튼들 추가 */}
        <Stack direction="horizontal" gap={2} className="mt-3" style={{ flexShrink: 0, flexWrap: "wrap" }}>
          {exampleQuestions.map((q, i) => (
            <Button
              key={i}
              variant="outline-primary"
              size="sm"
              onClick={() => handleExampleClick(q)}
              disabled={loading}
              style={{ whiteSpace: "normal" }}
            >
              {q}
            </Button>
          ))}
        </Stack>
      </div>

      {/* 입력창 */}
      <InputGroup style={{ flexShrink: 0 }}>
        <Form.Control
          as="textarea"
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요..."
          style={{ resize: "none" }}
          disabled={loading}
        />
        <Button onClick={() => handleSend()} variant="warning" disabled={loading}>
          전송
        </Button>
      </InputGroup>
    </div>
  );
}