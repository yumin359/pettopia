import React from "react";

const CheckboxGroup = ({
  title,
  options,
  selectedSet,
  setFunction,
  categoryColors,
}) => {
  const handleSetFilter = (currentSet, setFunction) => (value) => {
    const newSet = new Set(currentSet);

    if (value === "전체") {
      if (newSet.has("전체") && newSet.size === 1) {
        newSet.clear();
      } else {
        newSet.clear();
        newSet.add("전체");
      }
    } else {
      newSet.delete("전체");
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      if (newSet.size === 0) {
        newSet.add("전체");
      }
    }
    setFunction(newSet);
  };

  return (
    <div className="mb-2">
      <label className="form-label small fw-bold mb-1">{title}</label>
      <div className="d-flex flex-wrap gap-1">
        {options.map((option) => {
          const isChecked = selectedSet.has(option);
          const bgColor =
            option === "전체"
              ? "#6c757d"
              : categoryColors?.[option] || "#0d6efd";

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
              }}
            >
              <input
                type="checkbox"
                className="btn-check"
                checked={isChecked}
                onChange={() =>
                  handleSetFilter(selectedSet, setFunction)(option)
                }
                autoComplete="off"
              />
              {option}
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default CheckboxGroup;
