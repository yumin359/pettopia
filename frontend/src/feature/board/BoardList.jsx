import {
  Alert,
  Badge,
  Button,
  Col,
  Form,
  FormControl,
  InputGroup,
  Pagination,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router";
import { FaRegComments, FaRegImages, FaThumbsUp } from "react-icons/fa";

export function BoardList() {
  const [boardList, setBoardList] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageInfo, setPageInfo] = useState(null);
  const keyword = searchParams.get("q") ?? "";
  const navigate = useNavigate();
  const [keywords, setKeywords] = useState("");

  useEffect(() => {
    setKeywords(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const page = searchParams.get("p") ?? "1";
    axios
      .get("/api/board/list", { params: { q: keyword, p: page } })
      .then((res) => {
        setBoardList(res.data.boardList);
        setPageInfo(res.data.pageInfo);
        setErrorMsg("");
      })
      .catch((err) => {
        setBoardList(null);
        setErrorMsg(
          err.response?.status === 401
            ? "권한이 없습니다. 로그인 후 다시 시도하세요."
            : "게시글을 불러오는 중 오류가 발생했습니다.",
        );
      });
  }, [keyword, searchParams]);

  function handleSearchFormSubmit(e) {
    e.preventDefault();
    navigate("/board/list?q=" + encodeURIComponent(keywords));
  }

  function handleTableRowClick(id) {
    navigate(`/board/${id}`);
  }

  function handlePageNumberClick(pageNumber) {
    const next = new URLSearchParams(searchParams);
    next.set("p", pageNumber);
    setSearchParams(next);
  }

  const pageNumbers = [];
  if (pageInfo) {
    for (let i = pageInfo.leftPageNumber; i <= pageInfo.rightPageNumber; i++) {
      pageNumbers.push(i);
    }
  }

  if (errorMsg) {
    return (
      <Row>
        <Col>
          <Alert variant="danger" className="mt-4">
            {errorMsg}
          </Alert>
        </Col>
      </Row>
    );
  }

  if (!boardList) {
    return (
      <Row>
        <Col className="text-center mt-4">
          <Spinner animation="border" />
        </Col>
      </Row>
    );
  }

  return (
    <>
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
        NEWS
      </div>
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8} style={{ maxWidth: "900px", margin: "0 auto" }}>
          <br className="mb-4 h2" />
          {boardList.length > 0 ? (
            <Table
              striped
              hover
              responsive
              style={{ tableLayout: "fixed", width: "100%", fontSize: "0.95rem" }}
              className="align-middle"
            >
              <thead>
              <tr style={{ fontSize: "0.85rem", color: "#6c757d" }}>
                <th style={{ width: "45px" }}>#</th>
                <th style={{ width: "45px" }}>
                  <FaThumbsUp size={14} className="text-secondary" />
                </th>
                <th style={{ width: "100%" }}>제목</th>
                <th style={{ width: "35%" }}>작성자</th>
                <th style={{ width: "50%" }}>작성일시</th>
              </tr>
              </thead>
              <tbody>
              {boardList.map((board) => (
                <tr
                  key={board.id}
                  style={{ cursor: "pointer", fontSize: "0.95rem", verticalAlign: "middle" }}
                  onClick={() => handleTableRowClick(board.id)}
                >
                  <td className="text-muted">{board.id}</td>
                  <td className="text-muted" style={{ fontSize: "0.85em" }}>
                    {board.countLike}
                  </td>
                  <td>
                    <div className="d-flex gap-2 align-items-center">
                        <span
                          className="fw-semibold text-dark"
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "calc(100% - 40px)",
                          }}
                        >
                          {board.title}
                        </span>

                      {board.countComment > 0 && (
                        <Badge bg="light" text="dark">
                          <div className="d-flex gap-1">
                            <FaRegComments />
                            <span>{board.countComment}</span>
                          </div>
                        </Badge>
                      )}

                      {board.countFile > 0 && (
                        <Badge bg="info">
                          <div className="d-flex gap-1">
                            <FaRegImages />
                            <span>{board.countFile}</span>
                          </div>
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td
                    className="text-muted"
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontSize: "0.85rem",
                    }}
                    title={board.nickName}
                  >
                    {board.nickName}
                  </td>
                  <td className="text-muted" style={{ fontSize: "0.85rem" }}>
                    {board.timesAgo}
                  </td>
                </tr>
              ))}
              </tbody>
            </Table>
          ) : (
            <p>
              작성된 글이 없습니다. <br />새 글을 작성해 보세요.
            </p>
          )}
        </Col>
      </Row>

      {pageInfo && (
        <Row className="my-4 justify-content-center mx-0">
          <Col xs={12} md={10} lg={8} style={{ maxWidth: "900px", margin: "0 auto", paddingRight: 0 }}>
            <div className="d-flex flex-column gap-3 align-items-center">
              <div className="d-flex justify-content-end w-100">
                <Button
                  variant="primary"
                  size="sm"
                  className="mb-2"
                  onClick={() => navigate("/board/add")}
                  style={{ minWidth: "100px" }}
                >
                  공지 작성
                </Button>
              </div>



              {/* 🔵 Pagination 버튼 */}
              <Pagination className="mb-2" size="sm">
                <Pagination.First
                  disabled={pageInfo.currentPageNumber === 1}
                  onClick={() => handlePageNumberClick(1)}
                  className="rounded"
                />
                <Pagination.Prev
                  disabled={pageInfo.leftPageNumber <= 1}
                  onClick={() => handlePageNumberClick(pageInfo.leftPageNumber - 10)}
                  className="rounded"
                />
                {pageNumbers.map((num) => (
                  <Pagination.Item
                    key={num}
                    active={pageInfo.currentPageNumber === num}
                    onClick={() => handlePageNumberClick(num)}
                    className="rounded"
                    variant={
                      pageInfo.currentPageNumber === num ? "primary" : "outline-secondary"
                    }
                  >
                    {num}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  disabled={pageInfo.rightPageNumber >= pageInfo.totalPages}
                  onClick={() => handlePageNumberClick(pageInfo.rightPageNumber + 1)}
                  className="rounded"
                />
                <Pagination.Last
                  disabled={pageInfo.currentPageNumber === pageInfo.totalPages}
                  onClick={() => handlePageNumberClick(pageInfo.totalPages)}
                  className="rounded"
                />
              </Pagination>

              {/* 🔍 검색창 */}
              <Form onSubmit={handleSearchFormSubmit} style={{ width: "100%" }}>
                <InputGroup size="sm">
                  <FormControl
                    placeholder="(제목+내용)"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="rounded-start"
                  />
                  <Button type="submit" className="rounded-end">
                    검색
                  </Button>
                </InputGroup>
              </Form>
            </div>
          </Col>
        </Row>
      )}
    </>
  );
}
