import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Plane } from '@react-three/drei';
import "./Hostel_Login.css"
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function SkyBox() {
  const mesh = useRef(null);
  const [dayTexture, setDayTexture] = useState(null);
  const [nightTexture, setNightTexture] = useState(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load('/day-sky.jpg', (texture) => setDayTexture(texture));
    loader.load('/night-sky.jpg', (texture) => setNightTexture(texture));
  }, []);

  useFrame(({ clock }) => {
    if (dayTexture && nightTexture && mesh.current.material) {
      const t = (Math.sin(clock.getElapsedTime() * 0.1) + 1) / 2;
      mesh.current.material.uniforms.mixRatio.value = t;
    }
  });

  if (!dayTexture || !nightTexture) {
    return null;
  }

  return (
    <Plane args={[2, 2]} ref={mesh}>
      <shaderMaterial
        uniforms={{
          dayTexture: { value: dayTexture },
          nightTexture: { value: nightTexture },
          mixRatio: { value: 0 },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform sampler2D dayTexture;
          uniform sampler2D nightTexture;
          uniform float mixRatio;
          varying vec2 vUv;
          
          void main() {
            vec4 dayColor = texture2D(dayTexture, vUv);
            vec4 nightColor = texture2D(nightTexture, vUv);
            gl_FragColor = mix(dayColor, nightColor, mixRatio);
          }
        `}
      />
    </Plane>
  );
}

function DynamicBackground() {
  return (
    <div className="HL-dynamic-background">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <SkyBox />
      </Canvas>
    </div>
  );
}

function AnimatedLogo() {
  return (
    <motion.div
      className="HL-animated-logo"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="HL-logo-icon"
        initial={{ opacity: 0, rotate: -90 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </motion.svg>
    </motion.div>
  );
}

function LoginForm() {
  const [registration_number, setRegistrationNumber] = useState('');
  const [password, setPassword] = useState('');
  const [type, setLoginType] = useState('student');
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh
  
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Needed for session authentication
        body: JSON.stringify({ registration_number, password, type }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setMessage(`Success: ${data.message}`);
        Swal.fire({
          title: "Login Successful",
          text: `${data.message} for ${data.user.name || "warden"}`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          willClose: () => {
            Swal.close();
            navigate(data.redirect);
          },
        });
      } else {
        // Custom alerts based on error response
        if (data.error === "User Not Found") {
          Swal.fire({
            title: "User Not Found",
            text: "The provided username or ID does not exist in our system.",
            icon: "warning",
            confirmButtonText: "Try Again",
          });
        } else if (data.error === "Invalid credentials") {
          Swal.fire({
            title: "Incorrect Password",
            text: "The password you entered is incorrect. Please try again.",
            icon: "error",
            confirmButtonText: "Retry",
          });
        } else if (data.error === "Invalid user type") {
          Swal.fire({
            title: "Invalid User Type",
            text: "Please select the correct login type before signing in.",
            icon: "info",
            confirmButtonText: "OK",
          });
        } else {
          Swal.fire({
            title: "Login Failed",
            text: data.error || "An unknown error occurred. Please try again later.",
            icon: "error",
            confirmButtonText: "Close",
          });
        }
      }
    } catch (error) {
      setMessage("Error connecting to the server");
      Swal.fire({
        title: "Server Error",
        text: "Could not connect to the server. Please check your internet connection or try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
      console.error("Login Error:", error);
    }
  };  

  return (
    <motion.div
      className="HL-login-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="HL-form-title">Welcome Back</h2>
      <form onSubmit={handleSubmit} className="HL-form-content">
        <motion.div className="HL-form-group" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <label htmlFor="loginType" className="HL-form-label">Login Type</label>
          <select
            id="loginType"
            value={type}
            onChange={(e) => setLoginType(e.target.value)}
            className="HL-form-input"
          >
            <option value="student">Student</option>
            <option value="warden">Warden</option>
            <option value="superior">Superior Warden</option>
            <option value="security">Security</option>
          </select>
        </motion.div>

        <motion.div className="HL-form-group" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <label htmlFor="username" className="HL-form-label">Username or ID</label>
          <input
            id="username"
            type="text"
            name="registration_number"
            placeholder="Enter your username or ID"
            value={registration_number}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            required
            className="HL-form-input"
          />
        </motion.div>

        <motion.div className="HL-form-group" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <label htmlFor="password" className="HL-form-label">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="HL-form-input"
          />
        </motion.div>

        {/* {(type === 'warden') && (
          <motion.div className="HL-form-links" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <a href="/hostel/forget-password" className="HL-form-link">Forgot Password?</a>
          </motion.div>
        )} */}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <button type="submit" className="HL-form-button">Log In</button>
        </motion.div>
      </form>
    </motion.div>
  );
}

export default function HostelLoginDigital() {

  return (
    <div className="HL-hostel-login">
      <DynamicBackground />
      <main className="HL-main-content">
        <div className="HL-logo-container">
          <AnimatedLogo />
        </div>
        <LoginForm />
      </main>
    </div>
  );
}
