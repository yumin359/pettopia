import { useState, useCallback, useRef, useEffect } from "react";
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
  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const exampleQuestions = [
    "강아지 피부 알레르기 관리법은?",
    "고양이 스트레스 해소 방법 알려주세요.",
    "반려동물과 여행할 때 준비물은?",
    "강아지 건강검진 주기는 어떻게 되나요?",
  ];

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 최적화된 Claude API 호출 - 속도 개선!
  const callClaudeViaBackend = useCallback(async (userInput) => {
    // 이전 요청 취소해서 중복 요청 방지
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-20241022", // 🚀 더 빠른 모델!
          max_tokens: 300, // 🚀 토큰 수 줄여서 속도 UP
          temperature: 0.3, // 🚀 온도 낮춰서 빠른 응답
          system: "당신은 정중한 말투로 한국어로만 대답하는 친절하고 간결한 펫토피아 챗봇입니다. 답변은 3-4문장으로 간단명료하게 해주세요.",
          messages: [
            {
              role: "user",
              content: userInput,
            },
          ],
        }),
        signal: abortControllerRef.current.signal, // 요청 취소 지원
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Claude 프록시 응답 실패");
      }

      const data = await response.json();
      return data?.content?.[0]?.text || "응답을 받을 수 없습니다.";
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error("요청이 취소되었습니다.");
      }
      throw err;
    }
  }, []);

  // 최적화된 메시지 전송 - UI 반응성 UP!
  const handleSend = useCallback(async (customInput) => {
    const trimmed = (customInput ?? input).trim();
    if (!trimmed || loading) return;

    // 🚀 즉시 사용자 메시지 추가 (UI 반응성 향상)
    const userMessage = { sender: "user", text: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const reply = await callClaudeViaBackend(trimmed);
      setMessages(prev => [...prev, { sender: "bot", text: reply }]);
    } catch (err) {
      if (err.message !== "요청이 취소되었습니다.") {
        setMessages(prev => [
          ...prev,
          { sender: "bot", text: `❌ 오류 발생: ${err.message}` },
        ]);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [input, loading, callClaudeViaBackend]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleExampleClick = useCallback((question) => {
    handleSend(question);
  }, [handleSend]);

  // 컴포넌트 언마운트 시 진행 중인 요청 취소
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">펫토피아 챗봇</h2>
        {loading && (
          <div className="d-flex align-items-center text-primary">
            <Spinner animation="border" size="sm" className="me-2" />
            <small>답변 생성 중...</small>
          </div>
        )}
      </div>

      {/* 대화창 영역 */}
      <div
        style={{
          flexGrow: 1,
          border: "1px solid #dee2e6",
          borderRadius: "12px",
          padding: "1rem",
          overflowY: "auto",
          marginBottom: "1rem",
          backgroundColor: "#f8f9fa",
          height: "500px",
          scrollBehavior: "smooth",
        }}
      >
        {messages.map((msg, idx) => (
          <Card
            key={idx}
            className={`mb-3 shadow-sm ${
              msg.sender === "user"
                ? "ms-auto bg-primary text-white"
                : "me-auto bg-white"
            }`}
            style={{
              maxWidth: "75%",
              border: msg.sender === "user" ? "none" : "1px solid #e9ecef",
              borderRadius: "18px",
            }}
          >
            <Card.Body className="py-2 px-3">
              <Card.Text className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                {msg.text}
              </Card.Text>
            </Card.Body>
          </Card>
        ))}

        {/* 예시 질문 버튼들 - 대화 시작 시에만 표시 */}
        {messages.length === 1 && (
          <div className="mt-4">
            <h6 className="text-muted mb-3">💡 이런 질문을 해보세요:</h6>
            <Stack direction="vertical" gap={2}>
              {exampleQuestions.map((q, i) => (
                <Button
                  key={i}
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleExampleClick(q)}
                  disabled={loading}
                  className="text-start"
                  style={{
                    whiteSpace: "normal",
                    borderRadius: "20px",
                    border: "1px solid #e9ecef",
                    backgroundColor: "white",
                  }}
                >
                  {q}
                </Button>
              ))}
            </Stack>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <InputGroup style={{ flexShrink: 0 }}>
        <Form.Control
          as="textarea"
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="궁금한 것을 물어보세요..."
          style={{
            resize: "none",
            borderRadius: "25px 0 0 25px",
            border: "2px solid #e9ecef",
            paddingTop: "12px",
          }}
          disabled={loading}
        />
        <Button
          onClick={() => handleSend()}
          variant="primary"
          disabled={loading || !input.trim()}
          style={{
            borderRadius: "0 25px 25px 0",
            paddingLeft: "20px",
            paddingRight: "20px",
          }}
        >
          {loading ? <Spinner animation="border" size="sm" /> : "전송"}
        </Button>
      </InputGroup>
    </div>
  );
}