import { useState } from "react";
import { Button, Form } from "react-bootstrap";

function CommentEdit({ initialValue, onCancel, onSave }) {
  const [value, setValue] = useState(initialValue);

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(value); // 엔터로도 저장 가능
      }}
    >
      <Form.Control
        as="textarea"
        rows={3}
        value={value}
        className="mb-2"
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="d-flex justify-content-end gap-2">
        <Button size="sm" variant="primary" type="submit">
          저장
        </Button>
        <Button size="sm" variant="secondary" type="button" onClick={onCancel}>
          취소
        </Button>
      </div>
    </Form>
  );
}

export default CommentEdit;
