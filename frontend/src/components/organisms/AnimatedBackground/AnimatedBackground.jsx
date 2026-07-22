import styles from "./AnimatedBackground.module.css";

function AnimatedBackground({ children }) {
    return (
        <div className={styles.background}>
            <div className={styles.blob1}></div>
            <div className={styles.blob2}></div>
            <div className={styles.blob3}></div>

            <div className={styles.grid}></div>

            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
}

export default AnimatedBackground;