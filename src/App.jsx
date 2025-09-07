import { useEffect, useRef, useState } from "react";
import Wheel from "./Wheel";
import "./App.css"; // nhớ import CSS

function App() {
  const [result, setResult] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [playConfetti, setPlayConfetti] = useState(false);
  const confettiRef = useRef(null);
  const wheelRef = useRef(null);

  const segments = ["5k", "10k", "20k", "50k", "100k", "200k", "500k", ""];
  const colors = [
    "#D32F2F", // đỏ đậm lì xì
    "#F44336", // đỏ tươi
    "#FF7043", // cam đỏ
    "#FFC107", // vàng đậm
    "#6A1B9A", // tím đậm
    "#E91E63", // hồng đào
    "#F06292", // hồng nhạt
    "#000000"  // đen
  ];

  // hiệu ứng confetti khi quay xong
  useEffect(() => {
    if (!playConfetti) return;
    const canvas = confettiRef.current;
    const ctx = canvas.getContext("2d");
    let id;
    const colors = [
      "#f94144", "#f3722c", "#f8961e",
      "#90be6d", "#43aa8b", "#577590",
      "#f9c74f", "#9b5de5"
    ];
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);
    const particles = Array.from({ length: 200 }, () => ({
      x: Math.random() * width,
      y: -20,
      size: 6 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: -3 + Math.random() * 6,
      vy: 2 + Math.random() * 3,
      ay: 0.05 + Math.random() * 0.05,
      rot: Math.random() * Math.PI,
      vr: -0.2 + Math.random() * 0.4,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.vy += p.ay;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      id = requestAnimationFrame(draw);
    };
    draw();

    const stop = setTimeout(() => {
      cancelAnimationFrame(id);
      ctx.clearRect(0, 0, width, height);
      setPlayConfetti(false);
    }, 3000);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      clearTimeout(stop);
      cancelAnimationFrame(id);
    };
  }, [playConfetti]);

  const handleFinished = (winner) => {
    const custom = winner === "" ? "+1 lần" : winner;
    setResult(custom);
    setShowModal(true);
    setPlayConfetti(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        position: "relative",
        backgroundImage: `radial-gradient(circle at 30% 20%, #ffcccc 0%, #ff5757 40%, #b71c1c 70%),
                          radial-gradient(circle at 75% 85%, #ffe082 0%, #880e4f 60%),
                          repeating-radial-gradient(circle at 50% 50%, rgba(255,215,0,0.35) 0px,
                          rgba(255,215,0,0.35) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 6px)`,
        backgroundColor: "#7a0000",
        backgroundBlendMode: "screen, overlay, normal",
      }}
    >
      {/* <div className="image-container">
        <img style={{ width: "100%", height: "100%" }} src="../../public/tet.png" alt="background" />
      </div> */}
      <h1
        style={{
          margin: 0,
          fontSize: 30,
          color: "#ffffff",
          WebkitTextStroke: "1px #ffd700",
          textShadow: "0 3px 10px rgba(0,0,0,0.35)",
        }}
      >
        🎰 Lì xì may mắn
      </h1>

      <Wheel
        ref={wheelRef}
        segments={segments}
        colors={colors}
        blacklist={["500k", "200k"]}
        onFinished={handleFinished}
      />

      {/* Confetti */}
      <canvas
        ref={confettiRef}
        style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
      />

      {/* Hoa đào rơi */}
      <div className="falling-flowers">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="flower"
            style={{
              left: `${Math.random() * 100}vw`,
              animationDuration: `${5 + Math.random() * 5}s`,
              animationDelay: `${Math.random() * 5}s`,
              fontSize: `${16 + Math.random() * 20}px`,
            }}
          >
            🌸
          </span>
        ))}
      </div>

      {/* Modal kết quả */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
          }}
        >
          <div
            style={{
              background: "linear-gradient(180deg, #b00000 0%, #7a0000 100%)",
              borderRadius: 18,
              border: "2px solid #ffd700",
              padding: 24,
              minWidth: 320,
              textAlign: "center",
              boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
              color: "#fff",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "radial-gradient(circle at 30% 20%, rgba(255,215,0,0.25) 0, rgba(255,215,0,0) 50%), radial-gradient(circle at 80% 80%, rgba(255,215,0,0.2) 0, rgba(255,215,0,0) 55%)",
              }}
            />
            <div style={{ position: "relative" }}>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  marginBottom: 8,
                  color: "#ffd700",
                }}
              >
                🎉 Chúc mừng! 🎉
              </div>
              <div style={{ fontSize: 18, marginBottom: 16 }}>Bạn nhận được:</div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  color: "#00ffe6",
                  marginBottom: 20,
                  textShadow: "0 2px 0 rgba(0,0,0,0.3)",
                }}
              >
                {result}
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "#8b0000",
                    border: "2px solid #ffd700",
                    color: "#fff",
                  }}
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setResult("");
                    setTimeout(() => wheelRef.current?.spin(), 50);
                  }}
                  style={{
                    background: "#00c853",
                    border: "2px solid #ffd700",
                    color: "#fff",
                  }}
                >
                  Quay tiếp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
