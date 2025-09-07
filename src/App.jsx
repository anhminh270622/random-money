import { useEffect, useRef, useState } from "react";
import Wheel from "./Wheel";

function App() {
  const [result, setResult] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [playConfetti, setPlayConfetti] = useState(false);
  const confettiRef = useRef(null);
  const segments = [
    "5k",
    "10k",
    "20k",
    "50k",
    "100k",
    "200k",
    "500k",
  ];

  const colors = [
    "#FF5733", // đỏ cam
    "#FFBD33", // vàng
    "#75FF33", // xanh lá
    "#33FFBD", // xanh ngọc
    "#3380FF", // xanh dương
    "#8333FF", // tím
    "#FF33A8", // hồng
  ];

  useEffect(() => {
    if (!playConfetti) return;
    const canvas = confettiRef.current;
    const ctx = canvas.getContext("2d");
    let id;
    const colors = ["#f94144", "#f3722c", "#f8961e", "#90be6d", "#43aa8b", "#577590", "#f9c74f", "#9b5de5"];
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
    setResult(winner);
    setShowModal(true);
    setPlayConfetti(true);
  };

  const wheelRef = useRef(null);

  return (
    <div style={{ background: "#1e1f22", minHeight: "100vh", color: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, position: "relative" }}>
      <h1 style={{ margin: 0 }}>🎰 Random Money</h1>
      <Wheel
        ref={wheelRef}
        segments={segments}
        colors={colors}
        blacklist={["500k", "200k"]}
        onFinished={handleFinished}
      />
      <canvas ref={confettiRef} style={{ position: "fixed", inset: 0, pointerEvents: "none" }} />
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}>
          <div style={{ background: "#0f1114", borderRadius: 16, border: "2px solid #fff", padding: 24, minWidth: 320, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>🎉 Chúc mừng! 🎉</div>
            <div style={{ fontSize: 18, marginBottom: 16 }}>Bạn nhận được:</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#00e5ff", marginBottom: 20 }}>{result}</div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => setShowModal(false)} style={{ background: "#222", border: "2px solid #fff" }}>Đóng</button>
              <button onClick={() => { setShowModal(false); setResult(""); setTimeout(() => wheelRef.current?.spin(), 50); }} style={{ background: "#4caf50", border: "2px solid #fff" }}>Quay tiếp</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
