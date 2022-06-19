//If the background color is black, the font color should be white, and vice versa.
//Background color is a hex string
function getFontColor(backgroundColor: string) {
  const color =
    backgroundColor.charAt(0) === "#"
      ? backgroundColor.substring(1, 7)
      : backgroundColor;
  const r = parseInt(color.substring(0, 2), 16); // red
  const g = parseInt(color.substring(2, 4), 16); // green
  const b = parseInt(color.substring(4, 6), 16); // blue
  return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "#000000" : "#ffffff";
}

export default getFontColor;
