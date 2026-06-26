"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function LandingPage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (event: MouseEvent) => {
      const x = (window.innerWidth / 2 - event.pageX) / 25;
      const y = (window.innerHeight / 2 - event.pageY) / 25;

      canvas.style.transform = `rotateX(${55 + y / 2}deg) rotateZ(${
        -25 + x / 2
      }deg)`;

      layersRef.current.forEach((layer, index) => {
        const depth = (index + 1) * 15;
        const moveX = x * (index + 1) * 0.2;
        const moveY = y * (index + 1) * 0.2;

        layer.style.transform = `translateZ(${depth}px) translate(${moveX}px, ${moveY}px)`;
      });
    };

    canvas.style.opacity = "0";
    canvas.style.transform = "rotateX(90deg) rotateZ(0deg) scale(0.8)";

    const timeout = window.setTimeout(() => {
      canvas.style.transition = "all 2.5s cubic-bezier(0.16, 1, 0.3, 1)";
      canvas.style.opacity = "1";
      canvas.style.transform = "rotateX(55deg) rotateZ(-25deg) scale(1)";
    }, 300);

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      <style>{`
        .landing-shell {
          --bg: #0a0a0a;
          --silver: #e0e0e0;
          --muted: rgba(224, 224, 224, 0.72);
          --accent: #ff3c00;
          background-color: var(--bg);
          color: var(--silver);
          overflow: hidden;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .landing-grain {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 100;
          opacity: 0.15;
        }

        .landing-viewport {
          perspective: 2000px;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .landing-canvas {
          position: relative;
          width: min(800px, 80vw);
          height: min(500px, 58vw);
          transform-style: preserve-3d;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .landing-layer {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(224, 224, 224, 0.1);
          background-size: cover;
          background-position: center;
          transition: transform 0.5s ease;
        }

        .landing-layer-one {
          background-image: url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200');
          filter: grayscale(1) contrast(1.2) brightness(0.5);
        }

        .landing-layer-two {
          background-image: url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200');
          filter: grayscale(1) contrast(1.1) brightness(0.7);
          opacity: 0.6;
          mix-blend-mode: screen;
        }

        .landing-layer-three {
          background-image: url('https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1200');
          filter: grayscale(1) contrast(1.3) brightness(0.8);
          opacity: 0.4;
          mix-blend-mode: overlay;
        }

        .landing-contours {
          position: absolute;
          width: 200%;
          height: 200%;
          top: -50%;
          left: -50%;
          background-image: repeating-radial-gradient(
            circle at 50% 50%,
            transparent 0,
            transparent 40px,
            rgba(255,255,255,0.05) 41px,
            transparent 42px
          );
          transform: translateZ(120px);
          pointer-events: none;
        }

        .landing-interface {
          position: fixed;
          inset: 0;
          padding: clamp(1.5rem, 5vw, 4rem);
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: auto 1fr auto;
          z-index: 10;
          pointer-events: none;
        }

        .landing-brand {
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .landing-note {
          text-align: right;
          font-family: monospace;
          color: var(--accent);
          font-size: 0.72rem;
          line-height: 1.8;
          letter-spacing: 0.08em;
        }

        .landing-hero {
          grid-column: 1 / -1;
          align-self: center;
        }

        .landing-title {
          font-size: clamp(3rem, 9vw, 9.5rem);
          line-height: 0.85;
          letter-spacing: 0;
          mix-blend-mode: difference;
          margin: 0;
          font-weight: 900;
        }

        .landing-subtitle {
          margin-top: 2rem;
          max-width: 620px;
          font-family: monospace;
          font-size: clamp(0.8rem, 1.3vw, 1rem);
          line-height: 1.8;
          color: var(--muted);
          letter-spacing: 0.04em;
          mix-blend-mode: difference;
        }

        .landing-bottom {
          grid-column: 1 / -1;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 2rem;
        }

        .landing-platform-note {
          font-family: monospace;
          font-size: 0.75rem;
          line-height: 1.8;
          color: var(--muted);
          letter-spacing: 0.06em;
        }

        .landing-cta {
          pointer-events: auto;
          background: var(--silver);
          color: var(--bg);
          padding: 1rem 2rem;
          font-weight: 800;
          clip-path: polygon(0 0, 100% 0, 100% 70%, 85% 100%, 0 100%);
          transition: 0.3s;
          white-space: nowrap;
        }

        .landing-cta:hover {
          background: var(--accent);
          transform: translateY(-5px);
        }

        .landing-scroll {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          width: 1px;
          height: 60px;
          background: linear-gradient(to bottom, var(--silver), transparent);
          animation: landing-flow 2s infinite ease-in-out;
          z-index: 20;
        }

        @keyframes landing-flow {
          0%, 100% {
            transform: scaleY(0);
            transform-origin: top;
          }
          50% {
            transform: scaleY(1);
            transform-origin: top;
          }
          51% {
            transform: scaleY(1);
            transform-origin: bottom;
          }
        }

        @media (max-width: 768px) {
          .landing-interface {
            grid-template-columns: 1fr;
          }

          .landing-note {
            display: none;
          }

          .landing-title {
            font-size: clamp(3rem, 16vw, 5.5rem);
          }

          .landing-bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <main className="app-page-shell landing-shell">
        <svg style={{ position: "absolute", width: 0, height: 0 }}>
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </svg>

        <div className="landing-grain" style={{ filter: "url(#grain)" }} />

        <div className="landing-interface">
          <div className="landing-brand">TEAM RAGNAROK</div>

          <div className="landing-note">
            <div>STUDENT CAREER INTELLIGENCE</div>
            <div>KNOW BEFORE YOU APPLY</div>
          </div>

          <div className="landing-hero">
            <h1 className="landing-title">
              PLACEMENT
              <br />
              INTELLIGENCE
              <br />
              SYSTEM
            </h1>

            <p className="landing-subtitle">
              Know the company before you apply. Explore companies, compare
              opportunities, match your skills, and get guided placement
              intelligence from verified company data.
            </p>
          </div>

          <div className="landing-bottom">
            <div className="landing-platform-note">
              <p>[ STUDENT CAREER PLATFORM ]</p>
              <p>COMPANY RESEARCH / SKILL MATCH / AI GUIDANCE</p>
            </div>

            <Link href="/dashboard" className="landing-cta">
              ENTER PLATFORM
            </Link>
          </div>
        </div>

        <div className="landing-viewport">
          <div className="landing-canvas" ref={canvasRef}>
            <div
              className="landing-layer landing-layer-one"
              ref={(element) => {
                if (element) layersRef.current[0] = element;
              }}
            />
            <div
              className="landing-layer landing-layer-two"
              ref={(element) => {
                if (element) layersRef.current[1] = element;
              }}
            />
            <div
              className="landing-layer landing-layer-three"
              ref={(element) => {
                if (element) layersRef.current[2] = element;
              }}
            />
            <div className="landing-contours" />
          </div>
        </div>

        <div className="landing-scroll" />
      </main>
    </>
  );
}
