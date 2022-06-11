interface IHorizontalDividerProps {
  width?: string;
  color?: string;
  margin?: string;
}

function HorizontalDivider({
  width = "1px",
  color = "#808080",
  margin = "3px",
}: IHorizontalDividerProps) {
  return (
    <div
      style={{
        width: width,
        backgroundColor: color,
        marginLeft: margin,
        marginRight: margin,
      }}
    ></div>
  );
}
export default HorizontalDivider;
