"use client";

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const typewriterRef = useRef<HTMLSpanElement | null>(null);

  // Typewriter effect
  useEffect(() => {
    const el = typewriterRef.current;
    if (!el) return;

    const phrases = [
      "Welcome back to your tech partner.",
      "Sign in and follow your journey, step by step.",
      "Chat with AI. Solve it in seconds.",
      "Your projects, your progress, your control.",
      "Built with you. Built for growth."
    ];

    let pi = 0;
    let ci = 0;
    let deleting = false;
    let timeoutId: NodeJS.Timeout;

    function tick() {
      const word = phrases[pi];
      if (!deleting) {
        ci++;
        if (el) el.textContent = word.slice(0, ci);
        if (ci === word.length) {
          deleting = true;
          timeoutId = setTimeout(tick, 1900);
          return;
        }
        timeoutId = setTimeout(tick, 38 + Math.random() * 40);
      } else {
        ci--;
        if (el) el.textContent = word.slice(0, ci);
        if (ci === 0) {
          deleting = false;
          pi = (pi + 1) % phrases.length;
          timeoutId = setTimeout(tick, 350);
          return;
        }
        timeoutId = setTimeout(tick, 20);
      }
    }

    tick();
    return () => clearTimeout(timeoutId);
  }, []);

  // Particle network canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    interface Point {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
    }

    let points: Point[] = [];

    function resize() {
      if (!canvas) return;
      w = canvas.width = canvas.offsetWidth * dpr;
      h = canvas.height = canvas.offsetHeight * dpr;
    }

    function makePoints() {
      if (!canvas) return;
      const count = Math.min(65, Math.max(20, Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 20000)));
      points = [];
      for (let i = 0; i < count; i++) {
        points.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3 * dpr,
          vy: (Math.random() - 0.5) * 0.3 * dpr,
          r: (Math.random() * 1.4 + 1) * dpr,
        });
      }
    }

    resize();
    makePoints();

    const handleResize = () => {
      resize();
      makePoints();
    };
    window.addEventListener("resize", handleResize);

    function tick() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(167,183,167,0.55)";
        ctx.fill();
      }

      for (let a = 0; a < points.length; a++) {
        for (let b = a + 1; b < points.length; b++) {
          const pa = points[a];
          const pb = points[b];
          const dx = pa.x - pb.x;
          const dy = pa.y - pb.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 135 * dpr;
          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.strokeStyle = `rgba(80,96,85,${0.32 * (1 - dist / maxDist)})`;
            ctx.lineWidth = dpr;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(tick);
    }

    tick();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleLogin = async (loginEmail?: string, loginPassword?: string) => {
    const finalEmail = (loginEmail || email).trim();
    const finalPassword = loginPassword || password;

    if (!finalEmail || !finalPassword) {
      setError("Please enter both your email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: finalEmail,
        password: finalPassword,
      });

      if (res?.error) {
        setError("Invalid email or password. Try the demo account below.");
        setLoading(false);
      } else {
        setShowTransition(true);
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1200);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail("ahmed@cairofresh.eg");
    setPassword("demo1234");
    handleLogin("ahmed@cairofresh.eg", "demo1234");
  };

  return (
    <>
      <div id="login-view" className="login-view">
        <canvas id="bg-canvas" ref={canvasRef} aria-hidden="true"></canvas>
        <div className="login-vignette" aria-hidden="true"></div>
        <div className="login-content">
          <div className="login-brand">
            <div className="logo-badge" style={{ width: 46, height: 46 }}></div>
            <span className="login-wordmark">
              MOEMEN<span>TEAM</span>
            </span>
          </div>

          <div className="login-hero">
            <h1 className="typewriter-heading">
              <span id="typewriter-text" ref={typewriterRef}></span>
              <span className="cursor" aria-hidden="true">
                |
              </span>
            </h1>
            <p className="login-subtitle">We build solutions that grow businesses.</p>
          </div>

          <form
            id="login-form"
            className="login-card"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            noValidate
          >
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading && !showTransition ? "Signing in..." : "Sign in"}
            </button>

            <div className="login-divider">or</div>

            <button
              type="button"
              id="demo-btn"
              className="btn btn-ghost btn-block"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              Use demo account
            </button>

            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <a
                href="/register"
                style={{
                  fontSize: "13px",
                  color: "var(--light-sage)",
                  textDecoration: "underline",
                  fontWeight: 500,
                  display: "inline-block",
                  padding: "4px 8px",
                }}
              >
                ليس لديك حساب؟ إنشاء حساب عميل جديد
              </a>
            </div>
          </form>

          <div className="login-footer">
            <a href="https://moemen-team.tech" target="_blank" rel="noopener noreferrer">
              moemen-team.tech
            </a>
            <span>·</span>
            <a href="/about">About Us</a>
            <span>·</span>
            <span>Software · Web · Mobile · Automation · Cloud</span>
          </div>
        </div>
      </div>

      {/* Branded Transition Overlay */}
      <div
        id="transition-overlay"
        className={`transition-overlay ${showTransition ? "active" : ""}`}
        role="status"
        aria-live="polite"
      >
        <div className="transition-content">
          <div className="transition-logo-wrap">
            <div className="logo-badge"></div>
            <div className="transition-ring" aria-hidden="true"></div>
          </div>
          <p className="transition-text">Setting up your workspace…</p>
        </div>
      </div>
    </>
  );
}
