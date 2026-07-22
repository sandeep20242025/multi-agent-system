import AnimatedBackground from "@/components/organisms/AnimatedBackground";
import GlassCard from "@/components/atoms/GlassCard";
import Button from "@/components/atoms/Button";

function Landing() {
    return (
        <AnimatedBackground>
            <div
                style={{
                    minHeight: "100vh",
                    display: "grid",
                    placeItems: "center",
                    padding: "40px",
                }}
            >
                <GlassCard>
                    <h1
                        style={{
                            fontFamily: "Orbitron",
                            marginBottom: "20px",
                        }}
                    >
                        AI Workspace
                    </h1>

                    <Button>
                        Enter Workspace
                    </Button>
                </GlassCard>
            </div>
        </AnimatedBackground>
    );
}

export default Landing;