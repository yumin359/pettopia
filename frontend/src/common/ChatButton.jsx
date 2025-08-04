import { useState } from "react";
import { FaRobot } from "react-icons/fa";
import { Chatbot } from "../feature/openai/Chatbot";

export function ChatButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 채팅 열기 버튼 */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "80px",
          right: "90px",
          backgroundColor: "#ff944d",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: "70px",
          height: "70px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          zIndex: 9999,
          transition: "right 0.3s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <FaRobot size={30} />
      </button>


      {/* 슬라이딩 챗봇 창 */}
      <div
        style={{
          position: "fixed",
          top: "70px",
          right: open ? "0" : "-420px",
          width: "420px",
          height: "calc(100vh - 100px)",
          backgroundColor: "#fff",
          boxShadow: "-2px 0 10px rgba(0,0,0,0.1)",
          borderLeft: "1px solid #ddd",
          zIndex: 9998,
          transition: "right 0.3s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "10px",
            borderBottom: "1px solid #eee",
            backgroundColor: "#ff944d",
            color: "#fff",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>챗봇</span>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: "1.2rem",
              cursor: "pointer",
            }}
            aria-label="Close chat"
          >
            ×
          </button>
        </div>

        {/* 실제 챗봇 컴포넌트 */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <Chatbot />
        </div>
      </div>
    </>
  );
}
