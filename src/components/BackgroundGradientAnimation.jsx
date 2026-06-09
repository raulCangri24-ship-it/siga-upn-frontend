import { useEffect, useRef, useState } from "react";

export const BackgroundGradientAnimation = ({
  gradientBackgroundStart = "rgb(30, 20, 0)",
  gradientBackgroundEnd = "rgb(80, 50, 0)",
  firstColor = "245, 173, 39",
  secondColor = "255, 200, 50",
  thirdColor = "200, 120, 10",
  fourthColor = "255, 180, 0",
  fifthColor = "180, 100, 0",
  pointerColor = "255, 210, 80",
  size = "80%",
  blendingValue = "hard-light",
  children,
  interactive = true,
  containerStyle = {},
}) => {
  const interactiveRef = useRef(null);
  const containerRef = useRef(null);

  const [curX, setCurX] = useState(0);
  const [curY, setCurY] = useState(0);
  const [tgX, setTgX] = useState(0);
  const [tgY, setTgY] = useState(0);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    setIsSafari(/^((?!chrome|android).)*safari/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.style.setProperty("--gradient-background-start", gradientBackgroundStart);
    el.style.setProperty("--gradient-background-end", gradientBackgroundEnd);
    el.style.setProperty("--first-color", firstColor);
    el.style.setProperty("--second-color", secondColor);
    el.style.setProperty("--third-color", thirdColor);
    el.style.setProperty("--fourth-color", fourthColor);
    el.style.setProperty("--fifth-color", fifthColor);
    el.style.setProperty("--pointer-color", pointerColor);
    el.style.setProperty("--size", size);
    el.style.setProperty("--blending-value", blendingValue);
  }, []);

  useEffect(() => {
    function move() {
      if (!interactiveRef.current) return;
      setCurX((prev) => prev + (tgX - prev) / 20);
      setCurY((prev) => prev + (tgY - prev) / 20);
      interactiveRef.current.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
    }
    move();
  }, [tgX, tgY]);

  const handleMouseMove = (event) => {
    if (interactiveRef.current) {
      const rect = interactiveRef.current.getBoundingClientRect();
      setTgX(event.clientX - rect.left);
      setTgY(event.clientY - rect.top);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(40deg, var(--gradient-background-start), var(--gradient-background-end))",
        ...containerStyle,
      }}
    >
      {/* SVG filter para el efecto goo */}
      <svg style={{ display: "none" }}>
        <defs>
          <filter id="blurMe">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Contenido encima del gradiente */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", height: "100%" }}>
        {children}
      </div>

      {/* Gradientes animados */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: isSafari ? "blur(40px)" : "url(#blurMe) blur(40px)",
        }}
      >
        {/* Gradiente 1 */}
        <div style={{
          position: "absolute",
          background: `radial-gradient(circle at center, rgba(var(--first-color), 1) 0, rgba(var(--first-color), 0) 50%) no-repeat`,
          mixBlendMode: blendingValue,
          width: size, height: size,
          top: `calc(50% - ${size} / 2)`,
          left: `calc(50% - ${size} / 2)`,
          transformOrigin: "center center",
          animation: "moveVertical 30s ease infinite",
          opacity: 1,
        }} />

        {/* Gradiente 2 */}
        <div style={{
          position: "absolute",
          background: `radial-gradient(circle at center, rgba(var(--second-color), 0.8) 0, rgba(var(--second-color), 0) 50%) no-repeat`,
          mixBlendMode: blendingValue,
          width: size, height: size,
          top: `calc(50% - ${size} / 2)`,
          left: `calc(50% - ${size} / 2)`,
          transformOrigin: "calc(50% - 400px)",
          animation: "moveInCircle 20s reverse infinite",
          opacity: 1,
        }} />

        {/* Gradiente 3 */}
        <div style={{
          position: "absolute",
          background: `radial-gradient(circle at center, rgba(var(--third-color), 0.8) 0, rgba(var(--third-color), 0) 50%) no-repeat`,
          mixBlendMode: blendingValue,
          width: size, height: size,
          top: `calc(50% - ${size} / 2)`,
          left: `calc(50% - ${size} / 2)`,
          transformOrigin: "calc(50% + 400px)",
          animation: "moveInCircle 40s linear infinite",
          opacity: 1,
        }} />

        {/* Gradiente 4 */}
        <div style={{
          position: "absolute",
          background: `radial-gradient(circle at center, rgba(var(--fourth-color), 0.8) 0, rgba(var(--fourth-color), 0) 50%) no-repeat`,
          mixBlendMode: blendingValue,
          width: size, height: size,
          top: `calc(50% - ${size} / 2)`,
          left: `calc(50% - ${size} / 2)`,
          transformOrigin: "calc(50% - 200px)",
          animation: "moveHorizontal 40s ease infinite",
          opacity: 0.7,
        }} />

        {/* Gradiente 5 */}
        <div style={{
          position: "absolute",
          background: `radial-gradient(circle at center, rgba(var(--fifth-color), 0.8) 0, rgba(var(--fifth-color), 0) 50%) no-repeat`,
          mixBlendMode: blendingValue,
          width: size, height: size,
          top: `calc(50% - ${size} / 2)`,
          left: `calc(50% - ${size} / 2)`,
          transformOrigin: "calc(50% - 800px) calc(50% + 800px)",
          animation: "moveInCircle 20s ease infinite",
          opacity: 1,
        }} />

        {/* Gradiente interactivo con el mouse */}
        {interactive && (
          <div
            ref={interactiveRef}
            style={{
              position: "absolute",
              background: `radial-gradient(circle at center, rgba(var(--pointer-color), 0.8) 0, rgba(var(--pointer-color), 0) 50%) no-repeat`,
              mixBlendMode: blendingValue,
              width: "100%", height: "100%",
              top: "-50%", left: "-50%",
              opacity: 0.7,
            }}
          />
        )}
      </div>

      {/* Keyframes de animación inyectados en el DOM */}
      <style>{`
        @keyframes moveVertical {
          0%   { transform: translateY(-50%); }
          50%  { transform: translateY(50%); }
          100% { transform: translateY(-50%); }
        }
        @keyframes moveInCircle {
          0%   { transform: rotate(0deg); }
          50%  { transform: rotate(180deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes moveHorizontal {
          0%   { transform: translateX(-50%) translateY(-10%); }
          50%  { transform: translateX(50%) translateY(10%); }
          100% { transform: translateX(-50%) translateY(-10%); }
        }
      `}</style>
    </div>
  );
};

export default BackgroundGradientAnimation;
