import { Component } from "react";

/**
 * ErrorBoundary — common
 * Catches render errors in children and shows a fallback.
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error("[ErrorBoundary]", error, info);
    }

    render() {
        const { fallback, children } = this.props;
        if (this.state.hasError) {
            if (fallback) return fallback(this.state.error);
            return (
                <div role="alert" style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "200px",
                    padding: "32px",
                    textAlign: "center",
                    color: "var(--text-secondary)",
                    fontFamily: "inherit",
                }}>
                    <p style={{ fontSize: "14px", marginBottom: "8px" }}>
                        Something went wrong.
                    </p>
                    <button
                        type="button"
                        onClick={() => this.setState({ hasError: false, error: null })}
                        style={{
                            fontSize: "13px",
                            color: "var(--accent)",
                            background: "none",
                            border: "1px solid var(--border)",
                            padding: "8px 16px",
                            borderRadius: "var(--radius-sm)",
                            cursor: "pointer",
                        }}
                    >
                        Try again
                    </button>
                </div>
            );
        }
        return children;
    }
}

export default ErrorBoundary;
