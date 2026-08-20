import React, { memo, useMemo } from "react";
import { useLottie } from "lottie-react";
import aiParticlesAnimation from "../assets/lottie/ai-particles.json";
import aiWaveAnimation from "../assets/lottie/ai-wave.json";
import "./LottieBackground.css";

const AmbientParticles = memo(() => {
  const options = useMemo(() => ({
    animationData: aiParticlesAnimation,
    loop: true,
    autoplay: true,
  }), []);

  const style = useMemo(() => ({
    width: "100%",
    height: "100%",
  }), []);

  const { View } = useLottie(options, style);
  return <div className="lottie-layer-ambient">{View}</div>;
});

const AmbientWave = memo(() => {
  const options = useMemo(() => ({
    animationData: aiWaveAnimation,
    loop: true,
    autoplay: true,
  }), []);

  const style = useMemo(() => ({
    width: "100%",
    height: "100%",
  }), []);

  const { View } = useLottie(options, style);
  return <div className="lottie-layer-wave">{View}</div>;
});

const LottieBackground = () => {
  return (
    <div className="lottie-background-container" aria-hidden="true">
      <AmbientParticles />
      <AmbientWave />
    </div>
  );
};

export default memo(LottieBackground);
