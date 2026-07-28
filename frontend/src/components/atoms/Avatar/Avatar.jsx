import clsx from "clsx";
import styles from "./Avatar.module.css";

/**
 * Avatar — Atom
 * size:   "xs" | "sm" | "md" | "lg" | "xl"
 * status: "online" | "busy" | "offline" | null
 * src:    image URL (falls back to initials)
 * name:   used for initials and alt text
 */
function getInitials(name = "") {
    return name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("");
}

function Avatar({
    src,
    name = "",
    size = "md",
    status = null,
    className,
}) {
    const initials = getInitials(name);

    return (
        <div
            className={clsx(styles.root, styles[size], className)}
            role="img"
            aria-label={name || "User avatar"}
            title={name}
        >
            {src ? (
                <img
                    src={src}
                    alt={name || "avatar"}
                    className={styles.image}
                    onError={(e) => {
                        e.currentTarget.style.display = "none";
                    }}
                />
            ) : (
                <span aria-hidden="true">{initials || "?"}</span>
            )}

            {status && (
                <span
                    className={clsx(styles.status, styles[status])}
                    aria-label={`Status: ${status}`}
                />
            )}
        </div>
    );
}

export default Avatar;
