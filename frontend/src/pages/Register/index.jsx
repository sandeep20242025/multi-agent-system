import {
    useState,
    useCallback,
    useEffect,
    useId,
    useRef,
} from "react";
import { useNavigate } from "react-router-dom";

import AnimatedBackground from "@/components/organisms/AnimatedBackground";
import Navbar             from "@/components/organisms/Navbar";
import Footer             from "@/components/organisms/Footer";
import GlassCard          from "@/components/atoms/GlassCard";
import Input              from "@/components/atoms/Input";
import Button             from "@/components/atoms/Button";
import Badge              from "@/components/atoms/Badge";
import ThemeToggle        from "@/components/molecules/ThemeToggle";
import LanguageSelector   from "@/components/molecules/LanguageSelector";

import ROUTES from "@/constants/routes";
import "./styles.css";

/* ─────────────────────────────────────────────────────────
   STATIC DATA — outside component, never re-created
───────────────────────────────────────────────────────── */
const COUNTRIES = [
    "India", "United States", "United Kingdom", "Canada",
    "Australia", "Germany", "France", "Japan", "Singapore", "Other",
];

/* ─────────────────────────────────────────────────────────
   ReCaptchaPlaceholder
   Identical contract to Login's widget so it can be
   extracted to a shared atom later without prop changes.
───────────────────────────────────────────────────────── */
function ReCaptchaPlaceholder({ onVerify, onExpire, error }) {
    const [status, setStatus] = useState("idle");
    const timerRef = useRef(null);

    const handleClick = useCallback(() => {
        if (status === "verified") return;
        setStatus("verifying");
        timerRef.current = setTimeout(() => {
            setStatus("verified");
            onVerify?.(`mock-recaptcha-token-${Date.now()}`);
        }, 900);
    }, [status, onVerify]);

    const handleExpire = useCallback(() => {
        setStatus("expired");
        onExpire?.();
    }, [onExpire]);

    useEffect(() => {
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, []);

    return (
        <div
            className={[
                "recaptcha-wrap",
                status === "verified" ? "recaptcha-wrap--verified" : "",
                error               ? "recaptcha-wrap--error"    : "",
            ].filter(Boolean).join(" ")}
            aria-label="Human verification widget"
        >
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
                    {status === "verifying" && <span className="recaptcha-spinner" aria-hidden="true" />}
                    {status === "verified"  && <span className="recaptcha-tick"    aria-hidden="true">✓</span>}
                    {status === "expired"   && <span className="recaptcha-expired-icon" aria-hidden="true">↺</span>}
                </button>
                <span className="recaptcha-text">
                    {status === "verified" ? "Verified" : "I'm not a robot"}
                </span>
            </div>

            <div className="recaptcha-brand" aria-hidden="true">
                <div className="recaptcha-logo">
                    <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
                        <circle cx="32" cy="32" r="30" stroke="var(--accent)" strokeWidth="2" opacity="0.4" />
                        <path d="M32 10 C20 10 12 20 12 32 C12 44 20 54 32 54"
                            stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" fill="none" />
                        <path d="M32 10 C44 10 52 20 52 32 C52 44 44 54 32 54"
                            stroke="var(--accent-secondary)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
                        <circle cx="32" cy="32" r="6" fill="var(--accent)" opacity="0.7" />
                    </svg>
                </div>
                <span className="recaptcha-brand-name">reCAPTCHA</span>
                <span className="recaptcha-brand-links">Privacy · Terms</span>
            </div>

            {error && <p className="recaptcha-error" role="alert">{error}</p>}
            <button type="button" style={{ display: "none" }} aria-hidden="true" onClick={handleExpire} />
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   OTP INPUT — six individual digit boxes
───────────────────────────────────────────────────────── */
function OtpInput({ value, onChange, error, disabled }) {
    const inputsRef = useRef([]);
    const digits    = value.split("").concat(Array(6).fill("")).slice(0, 6);

    const update = useCallback((index, char) => {
        const next = [...digits];
        next[index] = char.replace(/\D/, "").slice(-1);
        const joined = next.join("");
        onChange(joined);
        /* Auto-advance */
        if (char && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    }, [digits, onChange]);

    const handleKey = useCallback((e, index) => {
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
        if (e.key === "ArrowLeft"  && index > 0) inputsRef.current[index - 1]?.focus();
        if (e.key === "ArrowRight" && index < 5) inputsRef.current[index + 1]?.focus();
    }, [digits]);

    const handlePaste = useCallback((e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        onChange(pasted.padEnd(6, "").slice(0, 6).replace(/\s/g, ""));
        /* Focus last filled or first empty */
        const focusIdx = Math.min(pasted.length, 5);
        inputsRef.current[focusIdx]?.focus();
    }, [onChange]);

    return (
        <div
            className={["otp-group", error ? "otp-group--error" : ""].filter(Boolean).join(" ")}
            role="group"
            aria-label="One-time passcode, 6 digits"
        >
            {digits.map((d, i) => (
                <input
                    key={i}
                    ref={(el) => { inputsRef.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    value={d}
                    disabled={disabled}
                    aria-label={`Digit ${i + 1}`}
                    className={["otp-box", d ? "otp-box--filled" : ""].filter(Boolean).join(" ")}
                    onChange={(e) => update(i, e.target.value)}
                    onKeyDown={(e) => handleKey(e, i)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    autoComplete="one-time-code"
                />
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   COUNTDOWN TIMER HOOK
───────────────────────────────────────────────────────── */
function useCountdown(initialSeconds) {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [running, setRunning] = useState(true);

    useEffect(() => {
        if (!running) return;
        if (seconds <= 0) { setRunning(false); return; }
        const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
        return () => clearTimeout(id);
    }, [seconds, running]);

    const reset = useCallback((s = initialSeconds) => {
        setSeconds(s);
        setRunning(true);
    }, [initialSeconds]);

    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");

    return { seconds, label: `${mm}:${ss}`, expired: seconds <= 0, reset };
}

/* ─────────────────────────────────────────────────────────
   VALIDATION HELPERS
───────────────────────────────────────────────────────── */
const RE_EMAIL    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_PHONE    = /^\+?[0-9\s\-().]{7,20}$/;
const RE_USERNAME = /^[a-zA-Z0-9_]{3,20}$/;

function validateStep1(f) {
    const e = {};
    if (!f.firstName.trim())          e.firstName       = "First name is required.";
    if (!f.lastName.trim())           e.lastName        = "Last name is required.";
    if (!RE_USERNAME.test(f.username))e.username        = "3–20 chars: letters, numbers, underscores.";
    if (!RE_EMAIL.test(f.email))      e.email           = "Enter a valid email address.";
    if (!RE_PHONE.test(f.mobile))     e.mobile          = "Enter a valid mobile number.";
    if (!f.country)                   e.country         = "Please select your country.";
    if (!f.state.trim())              e.state           = "State is required.";
    if (!f.city.trim())               e.city            = "City is required.";
    if (!f.address.trim())            e.address         = "Address is required.";
    if (f.password.length < 8)        e.password        = "Minimum 8 characters.";
    if (f.confirmPassword !== f.password)
                                      e.confirmPassword = "Passwords do not match.";
    if (!f.terms)                     e.terms           = "You must accept the terms.";
    if (!f.recaptchaToken)            e.recaptcha       = "Please verify you are not a robot.";
    return e;
}

function validateStep2(otp) {
    if (otp.length < 6 || otp.includes(" "))
        return { otp: "Enter the complete 6-digit code." };
    return {};
}

/* ─────────────────────────────────────────────────────────
   REGISTER PAGE
───────────────────────────────────────────────────────── */
const STEP_LABELS = ["Registration", "OTP Verification"];
const OTP_SECONDS = 120;

function Register() {
    const navigate = useNavigate();
    const formId   = useId();

    /* ── Step ─────────────────────────────────────────── */
    const [step, setStep] = useState(1); // 1 = form, 2 = otp

    /* ── Step 1 fields ────────────────────────────────── */
    const [fields, setFields] = useState({
        firstName:       "",
        lastName:        "",
        username:        "",
        email:           "",
        mobile:          "",
        country:         "",
        state:           "",
        city:            "",
        address:         "",
        password:        "",
        confirmPassword: "",
        terms:           false,
        recaptchaToken:  null,
    });
    const [showPass,    setShowPass]    = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [step1Errors, setStep1Errors] = useState({});
    const [sendingOtp,  setSendingOtp]  = useState(false);

    /* ── Step 2 ───────────────────────────────────────── */
    const [otp,       setOtp]       = useState("");
    const [otpErrors, setOtpErrors] = useState({});
    const [verifying, setVerifying] = useState(false);
    const [otpSentCount, setOtpSentCount] = useState(0);

    const countdown = useCountdown(OTP_SECONDS);

    /* ── Field updater ────────────────────────────────── */
    const set = useCallback((name, value) => {
        setFields((prev) => ({ ...prev, [name]: value }));
        setStep1Errors((prev) => {
            if (!prev[name]) return prev;
            const next = { ...prev }; delete next[name]; return next;
        });
    }, []);

    /* ── Step 1 submit → "send OTP" ─────────────────── */
    const handleSendOtp = useCallback((e) => {
        e.preventDefault();
        const errs = validateStep1(fields);
        if (Object.keys(errs).length) { setStep1Errors(errs); return; }
        setStep1Errors({});
        setSendingOtp(true);
        /* UI only — simulate network delay */
        setTimeout(() => {
            setSendingOtp(false);
            setOtpSentCount((n) => n + 1);
            setStep(2);
            countdown.reset();
        }, 1000);
    }, [fields, countdown]);

    /* ── Resend OTP ──────────────────────────────────── */
    const handleResend = useCallback(() => {
        setOtp("");
        setOtpErrors({});
        setOtpSentCount((n) => n + 1);
        countdown.reset();
    }, [countdown]);

    /* ── Step 2 submit → "verify OTP" ───────────────── */
    const handleVerify = useCallback((e) => {
        e.preventDefault();
        const errs = validateStep2(otp);
        if (Object.keys(errs).length) { setOtpErrors(errs); return; }
        setOtpErrors({});
        setVerifying(true);
        /* UI only — simulate verification delay then navigate */
        setTimeout(() => {
            setVerifying(false);
            navigate(ROUTES.WORKSPACE);
        }, 1200);
    }, [otp, navigate]);

    /* ── Smooth transition class ─────────────────────── */
    const [transitioning, setTransitioning] = useState(false);
    const goStep = useCallback((n) => {
        setTransitioning(true);
        setTimeout(() => { setStep(n); setTransitioning(false); }, 280);
    }, []);

    /* ─────────────────────────────────────────────────
       RENDER
    ───────────────────────────────────────────────── */
    return (
        <AnimatedBackground showParticles showGrid showNoise>

            <Navbar
                navigationItems={[]}
                sticky
                showSearch={false}
                showProfile={false}
                showTheme={false}
                showLanguage={false}
            />

            <main className="reg-main" id="main-content">

                {/* Controls */}
                <div className="reg-controls" aria-label="Display preferences">
                    <ThemeToggle />
                    <LanguageSelector />
                </div>

                {/* Step indicator */}
                <div className="reg-steps" aria-label="Registration progress">
                    {STEP_LABELS.map((label, i) => {
                        const n   = i + 1;
                        const done = step > n;
                        const active = step === n;
                        return (
                            <div
                                key={n}
                                className={[
                                    "reg-step",
                                    active ? "reg-step--active" : "",
                                    done   ? "reg-step--done"   : "",
                                ].filter(Boolean).join(" ")}
                                aria-current={active ? "step" : undefined}
                            >
                                <div className="reg-step-circle" aria-hidden="true">
                                    {done ? "✓" : n}
                                </div>
                                <span className="reg-step-label">{label}</span>
                                {i < STEP_LABELS.length - 1 && (
                                    <div className={["reg-step-line", done ? "reg-step-line--done" : ""].filter(Boolean).join(" ")} aria-hidden="true" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* ═══════════════════════════════════════
                    STEP 1 — Registration form
                ═══════════════════════════════════════ */}
                {step === 1 && (
                    <GlassCard
                        blur="lg"
                        padding="lg"
                        hover={false}
                        bordered
                        className={["reg-card", transitioning ? "reg-card--out" : "reg-card--in"].join(" ")}
                    >
                        <div className="card-glow card-glow--tl" aria-hidden="true" />
                        <div className="card-glow card-glow--br" aria-hidden="true" />

                        {/* Heading */}
                        <div className="reg-heading">
                            <Badge variant="primary" dot>New Account</Badge>
                            <h1 className="reg-title" id={`${formId}-title`}>
                                Create Account
                            </h1>
                            <p className="reg-desc">
                                Join the AI Workspace. Fill in your details below.
                            </p>
                        </div>

                        {/* Form */}
                        <form
                            id={formId}
                            className="reg-form"
                            onSubmit={handleSendOtp}
                            aria-labelledby={`${formId}-title`}
                            noValidate
                        >
                            {/* Row: First + Last name */}
                            <div className="reg-row-2">
                                <Input
                                    label="First Name"
                                    id={`${formId}-first`}
                                    type="text"
                                    placeholder="Jane"
                                    autoComplete="given-name"
                                    required
                                    value={fields.firstName}
                                    onChange={(e) => set("firstName", e.target.value)}
                                    error={step1Errors.firstName}
                                />
                                <Input
                                    label="Last Name"
                                    id={`${formId}-last`}
                                    type="text"
                                    placeholder="Doe"
                                    autoComplete="family-name"
                                    required
                                    value={fields.lastName}
                                    onChange={(e) => set("lastName", e.target.value)}
                                    error={step1Errors.lastName}
                                />
                            </div>

                            {/* Username */}
                            <Input
                                label="Username"
                                id={`${formId}-username`}
                                type="text"
                                placeholder="jane_doe"
                                autoComplete="username"
                                required
                                value={fields.username}
                                onChange={(e) => set("username", e.target.value)}
                                error={step1Errors.username}
                                leftIcon="◈"
                                hint="3–20 characters. Letters, numbers, underscores only."
                            />

                            {/* Email */}
                            <Input
                                label="Email"
                                id={`${formId}-email`}
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                                value={fields.email}
                                onChange={(e) => set("email", e.target.value)}
                                error={step1Errors.email}
                                leftIcon="◎"
                            />

                            {/* Mobile */}
                            <Input
                                label="Mobile Number"
                                id={`${formId}-mobile`}
                                type="tel"
                                placeholder="+91 98765 43210"
                                autoComplete="tel"
                                required
                                value={fields.mobile}
                                onChange={(e) => set("mobile", e.target.value)}
                                error={step1Errors.mobile}
                                leftIcon="◇"
                            />

                            {/* Country (native select wrapped to match Input visual) */}
                            <div className="reg-field">
                                <label
                                    className="reg-select-label"
                                    htmlFor={`${formId}-country`}
                                >
                                    Country
                                    <span className="reg-required" aria-hidden="true">*</span>
                                </label>
                                <div className={["reg-select-wrap", step1Errors.country ? "reg-select-wrap--error" : ""].filter(Boolean).join(" ")}>
                                    <span className="reg-select-icon" aria-hidden="true">◉</span>
                                    <select
                                        id={`${formId}-country`}
                                        className="reg-select"
                                        required
                                        value={fields.country}
                                        onChange={(e) => set("country", e.target.value)}
                                        aria-invalid={!!step1Errors.country}
                                        aria-describedby={step1Errors.country ? `${formId}-country-error` : undefined}
                                    >
                                        <option value="">Select country…</option>
                                        {COUNTRIES.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <span className="reg-select-chevron" aria-hidden="true">▾</span>
                                </div>
                                {step1Errors.country && (
                                    <p id={`${formId}-country-error`} className="reg-field-error" role="alert">
                                        {step1Errors.country}
                                    </p>
                                )}
                            </div>

                            {/* Row: State + City */}
                            <div className="reg-row-2">
                                <Input
                                    label="State"
                                    id={`${formId}-state`}
                                    type="text"
                                    placeholder="Maharashtra"
                                    autoComplete="address-level1"
                                    required
                                    value={fields.state}
                                    onChange={(e) => set("state", e.target.value)}
                                    error={step1Errors.state}
                                />
                                <Input
                                    label="City"
                                    id={`${formId}-city`}
                                    type="text"
                                    placeholder="Mumbai"
                                    autoComplete="address-level2"
                                    required
                                    value={fields.city}
                                    onChange={(e) => set("city", e.target.value)}
                                    error={step1Errors.city}
                                />
                            </div>

                            {/* Address */}
                            <div className="reg-field">
                                <label className="reg-select-label" htmlFor={`${formId}-address`}>
                                    Address
                                    <span className="reg-required" aria-hidden="true">*</span>
                                </label>
                                <div className={["reg-textarea-wrap", step1Errors.address ? "reg-textarea-wrap--error" : ""].filter(Boolean).join(" ")}>
                                    <textarea
                                        id={`${formId}-address`}
                                        className="reg-textarea"
                                        placeholder="Street, building, area…"
                                        rows={2}
                                        required
                                        autoComplete="street-address"
                                        value={fields.address}
                                        onChange={(e) => set("address", e.target.value)}
                                        aria-invalid={!!step1Errors.address}
                                        aria-describedby={step1Errors.address ? `${formId}-address-error` : undefined}
                                    />
                                </div>
                                {step1Errors.address && (
                                    <p id={`${formId}-address-error`} className="reg-field-error" role="alert">
                                        {step1Errors.address}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <Input
                                label="Password"
                                id={`${formId}-password`}
                                type={showPass ? "text" : "password"}
                                placeholder="Min. 8 characters"
                                autoComplete="new-password"
                                required
                                value={fields.password}
                                onChange={(e) => set("password", e.target.value)}
                                error={step1Errors.password}
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

                            {/* Confirm Password */}
                            <Input
                                label="Confirm Password"
                                id={`${formId}-confirm`}
                                type={showConfirm ? "text" : "password"}
                                placeholder="Repeat password"
                                autoComplete="new-password"
                                required
                                value={fields.confirmPassword}
                                onChange={(e) => set("confirmPassword", e.target.value)}
                                error={step1Errors.confirmPassword}
                                leftIcon="◈"
                                rightIcon={
                                    <button
                                        type="button"
                                        className="toggle-pass"
                                        aria-label={showConfirm ? "Hide password" : "Show password"}
                                        aria-pressed={showConfirm}
                                        onClick={() => setShowConfirm((v) => !v)}
                                    >
                                        {showConfirm ? "○" : "●"}
                                    </button>
                                }
                            />

                            {/* Terms checkbox */}
                            <div className="reg-terms-row">
                                <label
                                    className="remember-label"
                                    htmlFor={`${formId}-terms`}
                                >
                                    <input
                                        id={`${formId}-terms`}
                                        type="checkbox"
                                        className="remember-checkbox"
                                        checked={fields.terms}
                                        onChange={(e) => set("terms", e.target.checked)}
                                        aria-invalid={!!step1Errors.terms}
                                    />
                                    <span className="remember-custom" aria-hidden="true" />
                                    I agree to the{" "}
                                    <a href="#" className="reg-inline-link">Terms of Service</a>
                                    {" "}and{" "}
                                    <a href="#" className="reg-inline-link">Privacy Policy</a>
                                </label>
                                {step1Errors.terms && (
                                    <p className="reg-field-error" role="alert">{step1Errors.terms}</p>
                                )}
                            </div>

                            {/* reCAPTCHA */}
                            <ReCaptchaPlaceholder
                                onVerify={(token) => set("recaptchaToken", token)}
                                onExpire={() => set("recaptchaToken", null)}
                                error={step1Errors.recaptcha}
                            />

                            {/* Submit */}
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                fullWidth
                                loading={sendingOtp}
                                disabled={!fields.recaptchaToken}
                                aria-label="Send OTP to verify your email"
                                className="reg-submit-btn"
                            >
                                Send OTP  ›
                            </Button>
                        </form>

                        {/* Login link */}
                        <p className="reg-footer-text">
                            Already have an account?{" "}
                            <a href={ROUTES.LOGIN} className="login-link" aria-label="Sign in to existing account">
                                Sign in
                            </a>
                        </p>
                    </GlassCard>
                )}

                {/* ═══════════════════════════════════════
                    STEP 2 — OTP Verification
                ═══════════════════════════════════════ */}
                {step === 2 && (
                    <GlassCard
                        blur="lg"
                        padding="lg"
                        hover={false}
                        bordered
                        className={["reg-card reg-card--otp", transitioning ? "reg-card--out" : "reg-card--in"].join(" ")}
                    >
                        <div className="card-glow card-glow--tl" aria-hidden="true" />
                        <div className="card-glow card-glow--br" aria-hidden="true" />

                        {/* OTP icon */}
                        <div className="otp-icon-wrap" aria-hidden="true">
                            <div className="otp-ring">
                                <span className="otp-ring-symbol">◉</span>
                            </div>
                        </div>

                        {/* Heading */}
                        <div className="reg-heading">
                            <Badge variant="success" dot pulse>OTP Sent</Badge>
                            <h1 className="reg-title">Verify Your Email</h1>
                            <p className="reg-desc">
                                A 6-digit code was sent to{" "}
                                <strong className="reg-email-highlight">{fields.email}</strong>.
                                Enter it below to complete registration.
                            </p>
                        </div>

                        {/* OTP form */}
                        <form
                            className="reg-form"
                            onSubmit={handleVerify}
                            aria-label="OTP verification form"
                            noValidate
                        >
                            <OtpInput
                                value={otp}
                                onChange={(v) => {
                                    setOtp(v);
                                    if (otpErrors.otp) setOtpErrors({});
                                }}
                                error={otpErrors.otp}
                                disabled={verifying}
                            />
                            {otpErrors.otp && (
                                <p className="reg-field-error otp-error" role="alert">
                                    {otpErrors.otp}
                                </p>
                            )}

                            {/* Countdown */}
                            <div className="otp-timer-row" aria-live="polite" aria-atomic="true">
                                {countdown.expired ? (
                                    <span className="otp-timer-expired">Code expired</span>
                                ) : (
                                    <>
                                        <span className="otp-timer-label">Expires in</span>
                                        <span className="otp-timer-value">{countdown.label}</span>
                                    </>
                                )}
                            </div>

                            {/* Resend */}
                            <div className="otp-resend-row">
                                <span className="otp-resend-label">Didn't receive the code?</span>
                                <button
                                    type="button"
                                    className={["otp-resend-btn", !countdown.expired ? "otp-resend-btn--disabled" : ""].filter(Boolean).join(" ")}
                                    onClick={countdown.expired ? handleResend : undefined}
                                    disabled={!countdown.expired}
                                    aria-label="Resend OTP code"
                                >
                                    Resend OTP
                                    {otpSentCount > 1 && (
                                        <span className="otp-resend-count" aria-label={`Sent ${otpSentCount} times`}>
                                            ×{otpSentCount}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Verify button */}
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                fullWidth
                                loading={verifying}
                                disabled={otp.length < 6}
                                aria-label="Verify OTP and create account"
                                className="reg-submit-btn"
                            >
                                Verify &amp; Create Account
                            </Button>

                            {/* Back */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="md"
                                fullWidth
                                onClick={() => goStep(1)}
                                aria-label="Go back to registration form"
                            >
                                ‹ Back to Registration
                            </Button>
                        </form>
                    </GlassCard>
                )}

            </main>

            <Footer
                projectName="AI Workspace"
                version="2.0.0"
                showLinks={false}
                showStatus={false}
            />

        </AnimatedBackground>
    );
}

export default Register;
