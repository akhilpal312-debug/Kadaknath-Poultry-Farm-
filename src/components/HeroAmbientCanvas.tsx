import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { afterDraw, detectSoftwareWebGL } from '../three/webglUtils';

export const HeroAmbientCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      const isSoftwareGl = detectSoftwareWebGL();
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.setPixelRatio(
        isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
      );
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        45,
        Math.max(1, container.clientWidth) / Math.max(1, container.clientHeight),
        0.1,
        50
      );
      camera.position.z = 6;

      // Soft warm golden dust motes floating across the parchment hero
      const count = 48;
      const positions = new Float32Array(count * 3);
      const speeds = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (((i * 61) % 100) / 100 - 0.5) * 10;
        positions[i * 3 + 1] = (((i * 37) % 100) / 100 - 0.5) * 6;
        positions[i * 3 + 2] = (((i * 19) % 100) / 100 - 0.5) * 3;
        speeds[i] = 0.12 + (i % 5) * 0.04;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const mat = new THREE.PointsMaterial({
        color: 0xc89b3c,
        size: 0.065,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
      });

      const points = new THREE.Points(geo, mat);
      scene.add(points);

      let frameId = 0;
      let isVisible = true;
      let contextLost = false;
      let prevTime = performance.now();

      const onLost = (e: Event) => {
        e.preventDefault();
        contextLost = true;
      };
      const onRestored = () => {
        contextLost = false;
      };
      renderer.domElement.addEventListener('webglcontextlost', onLost);
      renderer.domElement.addEventListener('webglcontextrestored', onRestored);

      const observer = new IntersectionObserver(
        (entries) => {
          isVisible = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0.05 }
      );
      observer.observe(container);

      const onResize = () => {
        if (!container || !renderer) return;
        const w = Math.max(1, container.clientWidth);
        const h = Math.max(1, container.clientHeight);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      const tick = () => {
        const now = performance.now();
        const dt = Math.min((now - prevTime) / 1000, 0.1);
        prevTime = now;
        if (isVisible && !contextLost && renderer) {
          const pos = geo.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < count; i++) {
            let y = pos.getY(i) + speeds[i] * dt;
            if (y > 3.1) y = -3.1;
            pos.setY(i, y);
          }
          pos.needsUpdate = true;
          points.rotation.z += dt * 0.02;
          renderer.render(scene, camera);
        }

        if (isSoftwareGl && renderer) {
          afterDraw(renderer, tick, (id) => {
            frameId = id;
          });
        } else {
          frameId = requestAnimationFrame(tick);
        }
      };

      tick();

      return () => {
        cancelAnimationFrame(frameId);
        clearTimeout(frameId);
        observer.disconnect();
        window.removeEventListener('resize', onResize);
        if (renderer) {
          renderer.domElement.removeEventListener('webglcontextlost', onLost);
          renderer.domElement.removeEventListener(
            'webglcontextrestored',
            onRestored
          );
          if (renderer.domElement.parentNode === container) {
            container.removeChild(renderer.domElement);
          }
          renderer.dispose();
        }
        geo.dispose();
        mat.dispose();
      };
    } catch {
      // Graceful no-op if WebGL is unavailable
    }
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none z-0 opacity-75"
    />
  );
};
