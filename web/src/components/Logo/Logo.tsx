import "./Logo.css";

interface ILogoProps {
  full: boolean;
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
      src={
        process.env.PUBLIC_URL + full
          ? "logo-full.png"
          : "android-chrome-512x512.png"
      }
      className="App-logo"
      alt="logo"
    />
  );
}

export default Logo;
