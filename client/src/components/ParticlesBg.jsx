// src/components/ParticlesBg.jsx
import React, { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function ParticlesBg() {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const options = {
    fullScreen: { enable: false }, // fill parent element, not the entire screen
    background: { color: { value: "transparent" } },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: { enable: true, mode: "repulse" },
        onClick: { enable: true, mode: "push" },
        resize: true
      },
      modes: {
        repulse: { distance: 120, duration: 0.4 },
        push: { quantity: 4 }
      }
    },
    particles: {
      number: { value: 70, density: { enable: true, area: 900 } },
      color: { value: ["#60A5FA", "#93C5FD", "#A78BFA"] },
      shape: { type: "circle" },
      opacity: { value: 0.9 },
      size: { value: { min: 1.5, max: 4 } },
      links: {
        enable: true,
        distance: 140,
        color: "#60A5FA",
        opacity: 0.55,
        width: 1
      },
      move: {
        enable: true,
        speed: 1.2,
        direction: "none",
        outModes: { default: "bounce" }
      }
    },
    detectRetina: true
  };

  return (
    <div className="absolute inset-0 -z-10">
      {/* background gradient (behind the particles) */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700" />

      {/* particles canvas (sits on top of gradient but below content) */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={options}
        className="absolute inset-0 pointer-events-none"
      />
    </div>
  );
}
