export default function Navbar() {
  return (
    <header
      style={{
        backgroundColor: "#0f766e",
        color: "white",
        padding: "10px 30px",
        display: "flex",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <img
        src="/handa-logo.png.jpg"
        alt="Handa Logo"
        style={{
          width: "70px",
          height: "70px",
          objectFit: "contain",
        }}
      />

      <h2>Handa Careers</h2>

    </header>
  );
}