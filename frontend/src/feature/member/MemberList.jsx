import { useEffect, useState } from "react";
import { Col, Row, Spinner, Table, Alert } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router";

export function MemberList() {
  const [memberList, setMemberList] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/api/member/list")
      .then((res) => setMemberList(res.data))
      .catch((err) => {
        console.error("회원 목록 오류", err);
        setError("회원 목록을 불러오는 중 문제가 발생했습니다.");
      });
  }, []);

  if (error) {
    return (
      <Alert variant="danger" className="my-4">
        {error}
      </Alert>
    );
  }

  if (!memberList) {
    return (
      <div className="d-flex justify-content-center my-5 text-muted small">
        <Spinner animation="border" size="sm" className="me-2" />
        불러오는 중...
      </div>
    );
  }

  return (
    <Row className="justify-content-center">
      <Col
        xs={12}
        md={10}
        lg={8}
        style={{ maxWidth: "900px", margin: "0 auto" }}
      >
        <h4 className="mb-4 fw-bold text-dark">회원 목록</h4>

        {memberList.length > 0 ? (
          <Table
            responsive
            hover
            size="sm"
            className="align-middle text-secondary"
            style={{ fontSize: "0.9rem" }}
          >
            <thead className="text-muted">
              <tr>
                <th>이메일</th>
                <th>별명</th>
                <th>가입일</th>
              </tr>
            </thead>
            <tbody>
              {memberList.map((member) => (
                <tr
                  key={member.email}
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(
                      `/member?email=${encodeURIComponent(member.email)}`,
                    )
                  }
                >
                  <td className="text-muted">{member.email}</td>
                  <td className="text-dark">{member.nickName}</td>
                  <td className="text-muted">
                    {member.insertedAt?.substring(0, 16) ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="text-muted mt-2">등록된 회원이 없습니다.</p>
        )}
      </Col>
    </Row>
  );
}
