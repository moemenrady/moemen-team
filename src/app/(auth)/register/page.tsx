"use client";

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
      const count = Math.min(60, Math.max(20, Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 20000)));
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError("يرجى إدخال الاسم، البريد الإلكتروني وكلمة المرور.");
      return;
    }

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تتكون من 6 خانات على الأقل.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          company: company.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "تعذر إنشاء الحساب، يرجى المحاولة مرة أخرى.");
        setLoading(false);
        return;
      }

      // Automatically sign in with credentials
      setShowTransition(true);
      const signinRes = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
      });

      if (signinRes?.ok) {
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1200);
      } else {
        router.push("/login?registered=true");
      }
    } catch {
      setError("حدث خطأ غير متوقع. يرجى إعادة المحاولة.");
      setLoading(false);
    }
  };

  return (
    <>
      <div id="login-view" className="login-view">
        <canvas id="bg-canvas" ref={canvasRef} aria-hidden="true"></canvas>
        <div className="login-vignette" aria-hidden="true"></div>
        <div className="login-content" style={{ maxWidth: 480 }}>
          <div className="login-brand">
            <div className="logo-badge" style={{ width: 46, height: 46 }}></div>
            <span className="login-wordmark">
              MOEMEN<span>TEAM</span>
            </span>
          </div>

          <div className="login-hero">
            <h1 className="typewriter-heading" style={{ fontSize: "28px" }}>
              إنشاء حساب عميل جديد
            </h1>
            <p className="login-subtitle">
              انضم إلينا لمتابعة مشاريعك، دفعاتك وتواصلك المباشر مع فريقنا والذكاء الاصطناعي.
            </p>
          </div>

          <form
            id="login-form"
            className="login-card"
            onSubmit={handleRegister}
            noValidate
          >
            <div className="field">
              <label htmlFor="reg-name">الاسم بالكامل *</label>
              <input
                id="reg-name"
                type="text"
                required
                placeholder="أحمد محمد"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="reg-email">البريد الإلكتروني *</label>
              <input
                id="reg-email"
                type="email"
                dir="ltr"
                required
                placeholder="ahmed@company.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="reg-company">اسم الشركة أو المشروع</label>
              <input
                id="reg-company"
                type="text"
                placeholder="اسم شركتك أو علامتك التجارية"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="reg-phone">رقم الهاتف / واتساب</label>
              <input
                id="reg-phone"
                type="tel"
                dir="ltr"
                placeholder="+20 100 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="reg-password">كلمة المرور (6 خانات على الأقل) *</label>
              <input
                id="reg-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading && !showTransition ? "جاري إنشاء الحساب..." : "إنشاء حساب وبدء الاستخدام"}
            </button>

            <div className="login-divider">أو</div>

            <Link href="/login" className="btn btn-ghost btn-block" style={{ textAlign: "center" }}>
              لديك حساب بالفعل؟ تسجيل الدخول
            </Link>
          </form>

          <div className="login-footer">
            <a href="https://moemen-team.tech" target="_blank" rel="noopener noreferrer">
              moemen-team.tech
            </a>
            <span>·</span>
            <Link href="/about">About Us</Link>
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
          <p className="transition-text">جاري إعداد مساحة العمل الخاصة بك…</p>
        </div>
      </div>
    </>
  );
}
