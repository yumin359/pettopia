import React, { useState, useEffect } from "react";
import { FaRobot } from "react-icons/fa";
import { Chatbot } from "../feature/openai/Chatbot";

export function ChatButton() {
  const [open, setOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 모바일 너비는 90% 또는 최소 280px 중 큰 값을 씀
  const mobileWidth = Math.min(windowWidth * 0.9, 280);

  let drawerWidth;
  if (windowWidth >= 1200) {
    drawerWidth = 600;
  } else if (windowWidth >= 768) {
    drawerWidth = 450;
  } else {
    drawerWidth = mobileWidth;
  }

  return (
    <>
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          position: "fixed",
          bottom: "80px",
          right: open ? drawerWidth + 20 : 20,
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

      <div
        style={{
          position: "fixed",
          top: "70px",
          right: open ? 0 : -drawerWidth,
          width: drawerWidth,
          height: "calc(100vh - 100px)",
          backgroundColor: "#fff",
          boxShadow: "-2px 0 10px rgba(0,0,0,0.1)",
          borderLeft: "1px solid #ddd",
          zIndex: 9998,
          transition: "right 0.3s ease",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
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
              fontSize: "1.5rem",
              cursor: "pointer",
              lineHeight: 1,
            }}
            aria-label="Close chat"
          >
            ×
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          <Chatbot />
        </div>
      </div>
    </>
  );
}
