"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function DriverPOVBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = canvas.clientWidth;
    const H = canvas.clientHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x07070d, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x07070d, 22, 65);

    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 200);
    camera.position.set(0, 1.6, 0);
    camera.lookAt(0, 1.4, -10);

    // Road
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 300),
      new THREE.MeshStandardMaterial({ color: 0x161618, roughness: 1 })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, -100);
    scene.add(road);

    // Shoulders
    [-5.5, 5.5].forEach(x => {
      const sh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 300),
        new THREE.MeshStandardMaterial({ color: 0x111113, roughness: 1 })
      );
      sh.rotation.x = -Math.PI / 2;
      sh.position.set(x, 0.001, -100);
      scene.add(sh);
    });

    // Center dashes
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xeeeedd });
    const dashes: THREE.Mesh[] = [];
    for (let i = 0; i < 40; i++) {
      const d = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 2.6), dashMat);
      d.rotation.x = -Math.PI / 2;
      d.position.set(0, 0.002, -i * 7);
      scene.add(d);
      dashes.push(d);
    }

    // Lane lines
    [-3.5, 3.5].forEach(x => {
      const l = new THREE.Mesh(
        new THREE.PlaneGeometry(0.07, 300),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 })
      );
      l.rotation.x = -Math.PI / 2;
      l.position.set(x, 0.002, -100);
      scene.add(l);
    });

    // Street lights
    const poleMatSL = new THREE.MeshStandardMaterial({ color: 0x222222 });
    for (let i = 0; i < 20; i++) {
      [-4.8, 4.8].forEach(x => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 4, 6), poleMatSL);
        pole.position.set(x, 2, -i * 14 - 5);
        scene.add(pole);

        const bulb = new THREE.PointLight(0xffaa33, 1.3, 16);
        bulb.position.set(x * 0.85, 4.2, -i * 14 - 5);
        scene.add(bulb);

        const glow = new THREE.Mesh(
          new THREE.SphereGeometry(0.14, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xffbb44 })
        );
        glow.position.copy(bulb.position);
        scene.add(glow);
      });
    }

    // Headlight beams
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.07 });
    [-0.6, 0.6].forEach(x => {
      const beam = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 18), beamMat);
      beam.rotation.x = -Math.PI / 2;
      beam.position.set(x, 0.003, -9);
      scene.add(beam);
    });

    // City glow
    const cityGlow = new THREE.PointLight(0x5577ff, 3.5, 100);
    cityGlow.position.set(0, 10, -130);
    scene.add(cityGlow);

    // Lights
    scene.add(new THREE.AmbientLight(0x1a1a2e, 1.4));
    const roadBounce = new THREE.PointLight(0x222233, 1.2, 20);
    roadBounce.position.set(0, -0.5, -8);
    scene.add(roadBounce);

    // Steering wheel group attached to camera
    const swGroup = new THREE.Group();
    camera.add(swGroup);
    scene.add(camera);

    const swMat = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.3, metalness: 0.85 });

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.025, 12, 64), swMat);
    swGroup.add(ring);

    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + Math.PI / 6;
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.34, 6), swMat);
      spoke.position.set(Math.sin(angle) * 0.17, Math.cos(angle) * 0.17, 0);
      spoke.rotation.z = -angle;
      swGroup.add(spoke);
    }

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16), swMat);
    hub.rotation.x = Math.PI / 2;
    swGroup.add(hub);

    const dashStrip = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.18, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9, metalness: 0.4 })
    );
    swGroup.add(dashStrip);

    const dashLight = new THREE.PointLight(0x00ff88, 0.4, 1.2);
    dashLight.position.set(0, -0.2, 0);
    swGroup.add(dashLight);

    swGroup.position.set(0, -0.42, -0.72);
    swGroup.rotation.x = 0.38;

    // Speed lines
    const speedLines: { line: THREE.Line }[] = [];
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.8 + Math.random() * 3.8;
      const x = Math.cos(angle) * radius;
      const y = 0.5 + Math.random() * 2.5;
      const len = 1.0 + Math.random() * 2.8;
      const opacity = 0.15 + Math.random() * 0.12;
      const pts = [new THREE.Vector3(x, y, -2), new THREE.Vector3(x * 1.05, y, -2 - len)];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity });
      const line = new THREE.Line(geo, mat);
      scene.add(line);
      speedLines.push({ line });
    }

    // Vignette
    const vignette = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 4),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.26 })
    );
    camera.add(vignette);
    vignette.position.set(0, 0, -1.01);

    let t = 0;
    const SPEED = 0.55;
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += SPEED;

      dashes.forEach(d => {
        d.position.z += SPEED;
        if (d.position.z > 5) d.position.z -= 280;
      });

      swGroup.rotation.z = Math.sin(t * 0.012) * 0.04;
      swGroup.rotation.x = 0.38 + Math.sin(t * 0.018) * 0.012;
      camera.position.y = 1.6 + Math.sin(t * 0.08) * 0.006;

      speedLines.forEach(sl => {
        sl.line.position.z += SPEED * 1.8;
        if (sl.line.position.z > 5) sl.line.position.z = -40;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 right-0 w-1/2 h-full pointer-events-none opacity-60"
      style={{ zIndex: 0 }}
    />
  );
}