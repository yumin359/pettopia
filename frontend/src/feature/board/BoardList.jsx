import {
  Alert,
  Badge,
  Button,
  Col,
  Form,
  FormControl,
  Image,
  InputGroup,
  Pagination,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router";
import { FaRegComments, FaRegImages, FaThumbsUp } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";

export function BoardList() {
  const [boardList, setBoardList] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageInfo, setPageInfo] = useState(null);
  const keyword = searchParams.get("q") ?? "";
  const [keywords, setKeywords] = useState("");
  const navigate = useNavigate();
  const { isAdmin } = useContext(AuthenticationContext);

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

  // 프로필 사진 없는 사람들
  const defaultProfileImage = "/user.png";

  return (
    <>
      <Row className="justify-content-center">
        <Col
          xs={12}
          md={10}
          lg={8}
          style={{ maxWidth: "900px", margin: "0 auto" }}
        >
          <br className="mb-4 h2" />
          {boardList.length > 0 ? (
            <Table
              striped
              hover
              responsive
              style={{
                tableLayout: "fixed",
                width: "100%",
                fontSize: "0.95rem",
              }}
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
                    style={{
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      verticalAlign: "middle",
                    }}
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
                          <Badge bg="light" text="dark" >
                            <div className="d-flex gap-1">
                              <FaRegComments />
                              <span>{board.countComment}</span>
                            </div>
                          </Badge>
                        )}
                        {/* ✅ 여기만 남기고 중복된 board.countFile Badge는 제거했습니다. */}
                        {board.countFile > 0 && (
                          <Badge bg="warning">
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
                      {/* ✅ FiUser 아이콘은 필요하다면 여기에 다시 추가할 수 있습니다. */}
                      {/* <div><FiUser /></div> */}
                      <Image
                        roundedCircle
                        className="me-2"
                        src={board.profileImageUrl || defaultProfileImage}
                        alt={`${board.nickName ?? "익명"} 프로필`}
                        style={{
                          width: "20px",
                          height: "20px",
                        }}
                      />
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

      {/* ... (생략) */}
    </>
  );
}
