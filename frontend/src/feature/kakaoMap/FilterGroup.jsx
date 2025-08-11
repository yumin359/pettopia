import React from "react";

const FilterGroup = ({
  title,
  type = "checkbox", // "checkbox", "radio", "select"
  options,
  selectedValue, // radio, select용
  selectedSet, // checkbox용
  onChange,
  categoryColors,
  disabled = false,
  placeholder,
}) => {
  // Checkbox 렌더링
  const renderCheckbox = () => (
    <div className="d-flex flex-wrap gap-1">
      {options.map((option) => {
        const isChecked = selectedSet.has(option);
        const bgColor =
          option === "전체" ? "#6c757d" : categoryColors?.[option] || "#0d6efd";

        return (
          <label
            key={option}
            className={`btn ${isChecked ? "text-white" : "btn-outline-secondary"} btn-sm`}
            style={{
              backgroundColor: isChecked ? bgColor : "white",
              borderColor: bgColor,
              fontSize: "10px",
              padding: "2px 6px",
              color: isChecked ? "white" : bgColor,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              className="visually-hidden"
              checked={isChecked}
              onChange={() => onChange(option)}
              autoComplete="off"
            />
            {option}
          </label>
        );
      })}
    </div>
  );

  // Radio 버튼 렌더링
  const renderRadio = () => (
    <div className="btn-group w-100" role="group">
      {options.map(({ value, label }) => (
        <React.Fragment key={value}>
          <input
            type="radio"
            className="btn-check"
            name={title.replace(/[^\w]/g, "")} // 제목에서 특수문자 제거해서 name 생성
            id={`${title}-${value}`}
            value={value}
            checked={selectedValue === value}
            onChange={(e) => onChange(e.target.value)}
            autoComplete="off"
            disabled={disabled}
          />
          <label
            className="btn btn-outline-secondary btn-sm"
            htmlFor={`${title}-${value}`}
            style={{ fontSize: "10px", padding: "2px 4px" }}
          >
            {label}
          </label>
        </React.Fragment>
      ))}
    </div>
  );

  // Select 드롭다운 렌더링
  const renderSelect = () => (
    <select
      className="form-select form-select-sm"
      value={selectedValue}
      onChange={(e) => onChange(e.target.value)}
      style={{ fontSize: "11px" }}
      disabled={disabled}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  return (
    <div className="mb-2">
      <label className="form-label small fw-bold mb-1">{title}</label>
      {type === "checkbox" && renderCheckbox()}
      {type === "radio" && renderRadio()}
      {type === "select" && renderSelect()}
    </div>
  );
};

export default FilterGroup;
