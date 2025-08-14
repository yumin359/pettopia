import { useEffect, useState, useContext } from "react";
import { Table, Alert, Spinner } from "react-bootstrap";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";
import { Navigate } from "react-router-dom";
import axios from "axios";

export default function ServiceListPage() {
  const { isAdmin, loading: loadingAuth } = useContext(AuthenticationContext);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [error, setError] = useState("");

  // 🔹 모든 Hooks 최상위에서 호출
  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await axios.get("/api/support/list");
        setServices(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          setError("로그인이 필요합니다.");
        } else {
          setError("서버 오류로 문의 내역을 불러올 수 없습니다.");
        }
      } finally {
        setLoadingServices(false);
      }
    }
    fetchServices();
  }, []);

  // 🔹 인증 상태 로딩 중이면 로딩 화면
  if (loadingAuth || loadingServices) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" />
        <div>불러오는 중...</div>
      </div>
    );
  }

  // 🔹 인증 후 admin 체크
  if (!isAdmin()) {
    return <Navigate to="/login" replace />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (services.length === 0) {
    return <Alert variant="info">등록된 문의가 없습니다.</Alert>;
  }

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/support/${id}`);
      setServices((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2 className="mb-4">문의 내역 목록</h2>
      <Table striped bordered hover>
        <thead>
        <tr>
          <th>이메일</th>
          <th>제목</th>
          <th>내용</th>
          <th>접수일</th>
        </tr>
        </thead>
        <tbody>
        {services.map(({ id, email, title, content, inserted_at }) => (
          <tr key={id}>
            <td style={{ display: "flex", alignItems: "center" }}>
                <span
                  style={{
                    flexGrow: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {email}
                </span>
              <button
                onClick={() => handleDelete(id)}
                style={{
                  background: "none",
                  border: "none",
                  color: "red",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "18px",
                  lineHeight: "1",
                  padding: "0",
                  marginLeft: "8px",
                }}
                aria-label="삭제"
                title="삭제"
              >
                ×
              </button>
            </td>
            <td
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "220px",
                color: "inherit",
                cursor: "default",
              }}
            >
              {title}
            </td>
            <td
              style={{
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
                wordBreak: "break-word",
                maxWidth: "400px",
              }}
            >
              {content}
            </td>
            <td>{new Date(inserted_at).toLocaleString()}</td>
          </tr>
        ))}
        </tbody>
      </Table>
    </div>
  );
}
