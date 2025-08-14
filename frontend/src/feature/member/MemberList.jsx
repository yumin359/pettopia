import { useEffect, useState } from "react";
import { Col, Row, Spinner, Table, Alert } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router";

export function MemberList() {
  const [memberList, setMemberList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/api/member/list")
      .then((res) => setMemberList(res.data))
      .catch((err) => {
        console.error("회원 목록 오류", err);
        setError("회원 목록을 불러오는 중 문제가 발생했습니다.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" />
        <div>불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-4">
        {error}
      </Alert>
    );
  }

  if (!memberList || memberList.length === 0) {
    return (
      <Alert variant="info" className="my-4">
        등록된 회원이 없습니다.
      </Alert>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2 className="mb-4">회원 목록</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>이메일</th>
            <th>별명</th>
            <th>가입일</th>
          </tr>
        </thead>
        <tbody>
          {memberList.map(({ email, nickName, insertedAt }) => (
            <tr
              key={email}
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(`/member?email=${encodeURIComponent(email)}`)
              }
            >
              <td
                style={{
                  whiteSpace: "pre-wrap",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  maxWidth: "220px",
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                {email}
              </td>
              <td>{nickName}</td>
              <td>{insertedAt ? insertedAt.substring(0, 16) : "-"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
