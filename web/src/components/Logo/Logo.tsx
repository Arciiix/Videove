import "./Logo.css";

interface ILogoProps {
  full?: boolean;
  width?: string;
  height?: string;
}

function Logo({ full, width, height }: ILogoProps) {
  return (
    <img
      style={{
        width: width ?? "auto",
        height: height ?? "auto",
      }}
      src={"/api/cdn/" + (full ? "logo-full.png" : "logo.png")}
      className="App-logo"
      alt="logo"
    />
  );
}

export default Logo;
