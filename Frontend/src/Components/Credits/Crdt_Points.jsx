import React, {useRef, useMemo, useEffect} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';

function PointWaves({ count = 1000, speed = 0.5, amplitude = 1, frequency = 2, waveLength = 5 }) {
  const pointsRef = useRef();
  const { scene } = useThree();

  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      positions[i * 3] = x;
      positions[i * 3 + 1] = 0; // Initial Y position is 0
      positions[i * 3 + 2] = z;
    }
    return positions;
  }, [count]);

  useEffect(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      color: 'lightblue',
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    // points.position.x += 15
    // points.position.y += 10
    points.position.z -= 20
    points.rotateY(Math.PI / 2);
    pointsRef.current = points;
    scene.add(points);

    return () => {
      scene.remove(points);
      geometry.dispose();
      material.dispose();
    };
  }, [positions, scene]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;

    const time = clock.getElapsedTime() * speed;
    const positionAttribute = pointsRef.current.geometry.attributes.position;
    const positionsArray = positionAttribute.array;

    for (let i = 0; i < count; i++) {
      const x = positionsArray[i * 3];
      const z = positionsArray[i * 3 + 2];

      // Calculate the wave height using a sinusoidal function based on x and time.
      const wave = Math.sin((x + time) / waveLength * Math.PI * 2) * amplitude;

      positionsArray[i * 3 + 1] = wave; // Set the Y position to the wave height.
    }

    positionAttribute.needsUpdate = true;
  });

  return null;
}

export default PointWaves
