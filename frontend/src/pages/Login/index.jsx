import { useState, useCallback, useEffect, useId, useRef } from "react";
import { useNavigate } from "react-router-dom";

import AnimatedBackground  from "@/components/organisms/AnimatedBackground";
import Navbar              from "@/components/organisms/Navbar";
import Footer              from "@/components/organisms/Footer";
import GlassCard           from "@/components/atoms/GlassCard";
import Input               from "@/components/atoms/Input";
import Button              from "@/components/atoms/Button";
import ThemeToggle         from "@/components/molecules/ThemeToggle";
import LanguageSelector    from "@/components/molecules/LanguageSelector";

import ROUTES from "@/constants/routes";
import "./styles.css";

/* ─────────────────────────────────────────────────────────
   STATIC CONTENT  — outside component, never re-created
───────────────────────────────────────────────────────── */
const DESCRIPTION =
    "Access your intelligent agent workspace. Your team of AI agents is standing by.";

/* ─────────────────────────────────────────────────────────
   ReCaptchaPlaceholder — reusable UI-only widget.
   Drop-in slot for Google reCAPTCHA v2 checkbox.
   When real reCAPTCHA is wired up (auth phase), replace
   the inner mock with the actual <ReCAPTCHA> component and
   forward onVerify / onExpire to the parent via the same
   prop contract.

   Props
   ─────
   onVerify   (token: string) => void   called when "verified"
   onExpire   ()              => void   called when token expires
   error      string | null            shown as error text below
───────────────────────────────────────────────────────── */
function ReCaptchaPlaceholder({ onVerify, onExpire, error }) {
    const [status, setStatus]   = useState("idle");   // idle | verifying | verified | expired
    const timerRef              = useRef(null);

    const handleClick = useCallback(() => {
        if (status === "verified") return;

        setStatus("verifying");
        /* Simulate the reCAPTCHA async verification — replace with real SDK call later */
        timerRef.current = setTimeout(() => {
            const mockToken = `mock-recaptcha-token-${Date.now()}`;
            setStatus("verified");
            onVerify?.(mockToken);
        }, 900);
    }, [status, onVerify]);

    /* Simulate expiry after 90 s (real reCAPTCHA expires after 120 s) */
    const handleExpire = useCallback(() => {
        setStatus("expired");
        onExpire?.();
    }, [onExpire]);

    /* Clean up pending verification timer on unmount */
    useEffect(() => {
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, []);

    return (
        <div
            className={[
                "recaptcha-wrap",
                status === "verified" ? "recaptcha-wrap--verified" : "",
                error ? "recaptcha-wrap--error" : "",
            ].filter(Boolean).join(" ")}
            aria-label="Human verification widget"
        >
            {/* Left — checkbox + label */}
            <div className="recaptcha-left">
                <button
                    type="button"
                    role="checkbox"
                    aria-checked={status === "verified"}
                    aria-label="I am not a robot"
                    className={[
                        "recaptcha-checkbox",
                        status === "verifying" ? "recaptcha-checkbox--spinning" : "",
                        status === "verified"  ? "recaptcha-checkbox--done"     : "",
                    ].filter(Boolean).join(" ")}
                    onClick={handleClick}
                    disabled={status === "verifying" || status === "verified"}
                >
                    {status === "verifying" && (
                        <span className="recaptcha-spinner" aria-hidden="true" />
                    )}
                    {status === "verified" && (
                        <span className="recaptcha-tick" aria-hidden="true">✓</span>
                    )}
                    {status === "expired" && (
                        <span className="recaptcha-expired-icon" aria-hidden="true">↺</span>
                    )}
                </button>

                <span className="recaptcha-text">
                    {status === "verified" ? "Verified" : "I'm not a robot"}
                </span>
            </div>

            {/* Right — reCAPTCHA branding block */}
            <div className="recaptcha-brand" aria-hidden="true">
                <div className="recaptcha-logo">
                    {/* reCAPTCHA icon (simplified) */}
                    <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
                        <circle cx="32" cy="32" r="30" stroke="var(--accent)" strokeWidth="2" opacity="0.4" />
                        <path
                            d="M32 10 C20 10 12 20 12 32 C12 44 20 54 32 54"
                            stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" fill="none"
                        />
                        <path
                            d="M32 10 C44 10 52 20 52 32 C52 44 44 54 32 54"
                            stroke="var(--accent-secondary)" strokeWidth="3" strokeLinecap="round" fill="none"
                            opacity="0.6"
                        />
                        <circle cx="32" cy="32" r="6" fill="var(--accent)" opacity="0.7" />
                    </svg>
                </div>
                <span className="recaptcha-brand-name">reCAPTCHA</span>
                <span className="recaptcha-brand-links">
                    Privacy · Terms
                </span>
            </div>

            {/* Error message */}
            {error && (
                <p className="recaptcha-error" role="alert">{error}</p>
            )}

            {/* Expire trigger — hidden, for future SDK wiring */}
            <button
                type="button"
                style={{ display: "none" }}
                aria-hidden="true"
                onClick={handleExpire}
            />
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   LOGIN PAGE
───────────────────────────────────────────────────────── */
function Login() {
    const navigate   = useNavigate();
    const formId     = useId();

    /* ── Form state ───────────────────────────────────── */
    const [email,       setEmail]       = useState("");
    const [password,    setPassword]    = useState("");
    const [remember,        setRemember]        = useState(false);
    const [showPass,        setShowPass]        = useState(false);
    const [loading,         setLoading]         = useState(false);
    const [errors,          setErrors]          = useState({});
    const [recaptchaToken,  setRecaptchaToken]  = useState(null);

    /* ── Client-side validation (UI only — no backend) ── */
    const validate = useCallback(() => {
        const next = {};
        if (!email.trim())
            next.email = "Email address is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            next.email = "Enter a valid email address.";
        if (!password)
            next.password = "Password is required.";
        else if (password.length < 6)
            next.password = "Password must be at least 6 characters.";
        if (!recaptchaToken)
            next.recaptcha = "Please verify you are not a robot.";
        return next;
    }, [email, password, recaptchaToken]);

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            const errs = validate();
            if (Object.keys(errs).length) {
                setErrors(errs);
                return;
            }
            setErrors({});
            /* Simulate async — UI only, no real auth */
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
                navigate(ROUTES.WORKSPACE);
            }, 1200);
        },
        [validate, navigate]
    );

    const clearError = useCallback(
        (field) =>
            setErrors((prev) => {
                if (!prev[field]) return prev;
                const next = { ...prev };
                delete next[field];
                return next;
            }),
        []
    );

    return (
        <AnimatedBackground showParticles showGrid showNoise interactive>

            {/* ── Navbar — minimal on auth pages ─────── */}
            <Navbar
                navigationItems={[]}
                sticky
                showSearch={false}
                showProfile={false}
                showTheme={false}
                showLanguage={false}
            />

            {/* ── Main content ────────────────────────── */}
            <main className="login-main" id="main-content">

                {/* Controls row — theme + language outside the card */}
                <div className="login-controls" aria-label="Display preferences">
                    <ThemeToggle />
                    <LanguageSelector />
                </div>

                {/* ── Login card ──────────────────────── */}
                <GlassCard
                    blur="lg"
                    padding="lg"
                    hover={false}
                    bordered
                    className="login-card"
                >
                    {/* Ambient glow orbs */}
                    <div className="card-glow card-glow--tl" aria-hidden="true" />
                    <div className="card-glow card-glow--br" aria-hidden="true" />

                    {/* ── Logo mark ─────────────────── */}
                    <div className="login-logo" aria-hidden="true">
                        <div className="logo-ring-wrap">
                            <div className="logo-ring-outer" />
                            <div className="logo-ring-inner" />
                            <span className="logo-symbol">◈</span>
                        </div>
                    </div>

                    {/* ── Heading ───────────────────── */}
                    <div className="login-heading">
                        <h1 className="login-title" id={`${formId}-title`}>
                            Welcome Back
                        </h1>
                        <p className="login-desc">{DESCRIPTION}</p>
                    </div>

                    {/* ── Form ──────────────────────── */}
                    <form
                        id={formId}
                        className="login-form"
                        onSubmit={handleSubmit}
                        aria-labelledby={`${formId}-title`}
                        noValidate
                    >
                        <Input
                            label="Email"
                            id={`${formId}-email`}
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                clearError("email");
                            }}
                            error={errors.email}
                            leftIcon="◎"
                        />

                        <Input
                            label="Password"
                            id={`${formId}-password`}
                            type={showPass ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                clearError("password");
                            }}
                            error={errors.password}
                            leftIcon="◈"
                            rightIcon={
                                <button
                                    type="button"
                                    className="toggle-pass"
                                    aria-label={showPass ? "Hide password" : "Show password"}
                                    aria-pressed={showPass}
                                    onClick={() => setShowPass((v) => !v)}
                                >
                                    {showPass ? "○" : "●"}
                                </button>
                            }
                        />

                        {/* Remember me + Forgot password */}
                        <div className="login-row">
                            <label className="remember-label" htmlFor={`${formId}-remember`}>
                                <input
                                    id={`${formId}-remember`}
                                    type="checkbox"
                                    className="remember-checkbox"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                />
                                <span className="remember-custom" aria-hidden="true" />
                                Remember me
                            </label>

                            <a
                                href="#"
                                className="forgot-link"
                                aria-label="Reset your password"
                            >
                                Forgot password?
                            </a>
                        </div>

                        {/* reCAPTCHA placeholder */}
                        <ReCaptchaPlaceholder
                            onVerify={(token) => {
                                setRecaptchaToken(token);
                                clearError("recaptcha");
                            }}
                            onExpire={() => setRecaptchaToken(null)}
                            error={errors.recaptcha}
                        />

                        {/* Submit */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={loading}
                            disabled={!recaptchaToken}
                            aria-label="Sign in to AI Workspace"
                            className="login-btn"
                        >
                            Sign In
                        </Button>
                    </form>

                    {/* ── Divider ───────────────────── */}
                    <div className="login-divider" aria-hidden="true">
                        <span className="divider-line" />
                        <span className="divider-text">or continue with</span>
                        <span className="divider-line" />
                    </div>

                    {/* ── Social button (UI only) ───── */}
                    <Button
                        variant="outline"
                        size="lg"
                        fullWidth
                        leftIcon={
                            /* Inline Google G mark — no external asset */
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                                focusable="false"
                            >
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                        }
                        aria-label="Continue with Google (UI demonstration only)"
                        className="google-btn"
                    >
                        Continue with Google
                    </Button>

                    {/* ── Create account link ────────── */}
                    <p className="login-footer-text">
                        Don&apos;t have an account?{" "}
                        <a
                            href={ROUTES.REGISTER}
                            className="login-link"
                            aria-label="Create a new account"
                        >
                            Create account
                        </a>
                    </p>
                </GlassCard>
            </main>

            {/* ── Footer ──────────────────────────────── */}
            <Footer
                projectName="AI Workspace"
                version="2.0.0"
                showLinks={false}
                showStatus={false}
            />

        </AnimatedBackground>
    );
}

export default Login;
