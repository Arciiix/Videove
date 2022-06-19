import { useNavigate } from "react-router-dom";
import "./Logo.css";

interface ILogoProps {
  full?: boolean;
  width?: string;
  height?: string;
  dontClick?: boolean;
}

function Logo({ full, width, height, dontClick }: ILogoProps) {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (!dontClick) return navigate("/");
  };

  return (
    <div onClick={handleLogoClick} className="pointer">
      <img
        style={{
          width: width ?? "auto",
          height: height ?? "auto",
        }}
        src={"/api/cdn/" + (full ? "logo-full.png" : "logo.png")}
        className="App-logo"
        alt="logo"
      />
    </div>
  );
}

export default Logo;
