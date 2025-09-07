import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";

const Wheel = forwardRef(({ segments, colors, blacklist = [], onFinished }, ref) => {
  const canvasRef = useRef(null);
  const angleRef = useRef(0);       // góc hiện tại (radian)
  const [angle, setAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const audioCtxRef = useRef(null);
  const lastTickIndexRef = useRef(null);

  const size = 350;
  const radius = size / 2;
  const arc = (2 * Math.PI) / segments.length;
  const POINTER_RAD = -Math.PI / 2; // 12 giờ

  useEffect(() => {
    angleRef.current = angle;
    drawWheel(angle);
  }, [angle]);

  const BORDER_WIDTH = 9;

  const drawOuterRing = (ctx) => {
    ctx.save();
    ctx.lineWidth = BORDER_WIDTH; // mỏng hơn một nửa
    ctx.strokeStyle = "#ffd700"; // viền vàng thay cho màu đen
    ctx.beginPath();
    ctx.arc(radius, radius, radius - ctx.lineWidth / 2, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
  };

  const drawPointer = (ctx) => {
    // mũi tên nhỏ phía trên hub
    ctx.save();
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    const hubOuterR = 48; // giảm kích thước vòng trắng ngoài
    const baseY = radius - hubOuterR;
    ctx.beginPath();
    ctx.moveTo(radius, baseY - 18);      // đỉnh chỉ lên trên (12h)
    ctx.lineTo(radius - 18, baseY + 8);
    ctx.lineTo(radius + 18, baseY + 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  const drawCenterHub = (ctx) => {
    ctx.beginPath();
    ctx.arc(radius, radius, 48, 0, 2 * Math.PI); // giảm kích thước hub
    ctx.fillStyle = "#fff";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(radius, radius, 38, 0, 2 * Math.PI); // tăng bán kính vòng đen để viền trắng mỏng hơn
    ctx.fillStyle = "#000";
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px Arial"; // chữ Spin nhỏ hơn
    ctx.textAlign = "center";
    ctx.fillText("Quay", radius, radius + 8);
  };

  const drawWheel = (startAngle) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, size, size);

    // các phần quạt
    const rSlices = radius - BORDER_WIDTH / 2 - 1; // sát mép trong của viền vàng
    segments.forEach((text, i) => {
      const a0 = startAngle + i * arc;

      ctx.beginPath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.moveTo(radius, radius);
      ctx.arc(radius, radius, rSlices, a0, a0 + arc);
      ctx.closePath();
      ctx.fill();

      // vạch ngăn
      ctx.save();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.lineTo(
        radius + Math.cos(a0) * rSlices,
        radius + Math.sin(a0) * rSlices
      );
      ctx.stroke();
      ctx.restore();

      // chữ
      ctx.save();
      ctx.translate(
        radius + Math.cos(a0 + arc / 2) * (radius * 0.55),
        radius + Math.sin(a0 + arc / 2) * (radius * 0.55)
      );
      ctx.rotate(a0 + arc / 2);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.fillText(text, 0, 0);
      ctx.restore();
    });

    drawOuterRing(ctx);
    drawCenterHub(ctx);
    drawPointer(ctx);
  };

  // >>> FIX CHÍNH Ở ĐÂY: chọn sẵn index trúng & tính góc đích trùng tâm ô với mũi tên
  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) { }
    }

    const current = angleRef.current;     // góc hiện tại
    const minSpins = 6;                   // quay tối thiểu N vòng cho “đã”
    const dur = 4500;                     // thời gian quay (ms)

    // 1) chọn ngẫu nhiên ô sẽ trúng (loại trừ blacklist)
    const allowedSegments = segments.filter((segment, index) => !blacklist.includes(segment));
    const allowedIndices = segments.map((segment, index) => blacklist.includes(segment) ? -1 : index).filter(i => i !== -1);
    const randomAllowedIndex = allowedIndices[Math.floor(Math.random() * allowedIndices.length)];
    const winIndex = randomAllowedIndex;

    // 2) góc đích để tâm ô winIndex nằm đúng dưới mũi tên (12h)
    //    Tâm ô i tại góc: startAngle + i*arc + arc/2
    //    Cần: startAngle_end + i*arc + arc/2 = POINTER_RAD
    let target = POINTER_RAD - (winIndex * arc + arc / 2); // góc đích cơ sở

    // 3) đảm bảo quay theo chiều kim đồng hồ và >= current + minSpins*2π
    while (target <= current + minSpins * 2 * Math.PI) {
      target += 2 * Math.PI;
    }

    // 4) animate từ current -> target (easeOutCubic)
    const start = performance.now();
    const delta = target - current;

    const playTick = () => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square";
      o.frequency.value = 1000; // Hz
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.09);
    };

    const playWin = () => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      // "ting tong" 2 nốt dạng chuông: cao -> trầm, có chút ngân
      const notes = [783.99, 523.25]; // G5 -> C5
      let t = ctx.currentTime;
      notes.forEach((freq) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator(); // tạo hoà âm chuông
        const gain = ctx.createGain();
        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.value = freq;
        osc2.frequency.value = freq * 2; // bội âm để ra tiếng chuông
        osc2.detune.value = 10;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.4, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 0.65);
        osc2.stop(t + 0.65);
        t += 0.32; // khoảng cách giữa "ting" và "tong"
      });
    };

    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const a = current + delta * ease;
      setAngle(a);
      angleRef.current = a;

      // phát âm tick mỗi khi con trỏ đi qua một ô
      const normalized = ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const diff = ((POINTER_RAD - normalized) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const idx = Math.floor((diff + arc / 2) / arc) % segments.length;
      if (lastTickIndexRef.current !== idx) {
        lastTickIndexRef.current = idx;
        playTick();
      }

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        // đảm bảo chốt đúng góc đích
        angleRef.current = target;
        setAngle(target);
        setIsSpinning(false);
        playWin();
        onFinished(segments[winIndex]);
      }
    };

    requestAnimationFrame(tick);
  };

  useImperativeHandle(ref, () => ({
    spin,
    isSpinning: () => isSpinning,
  }));

  const onCanvasClick = (e) => {
    if (isSpinning) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - radius;
    const dy = y - radius;
    const distance = Math.hypot(dx, dy);
    if (distance <= 38) spin(); // khớp với bán kính hub mới (đen: 38)
  };

  return (
    <div style={{ textAlign: "center" }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        onClick={onCanvasClick}
        style={{ cursor: isSpinning ? "default" : "pointer" }}
      />
    </div>
  );
});

export default Wheel;
