"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function TrafficLightBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = canvas.clientWidth;
    const H = canvas.clientHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x080808, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080808, 0.038);

    const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 100);
    camera.position.set(-5.5, 3.5, 7);
    camera.lookAt(-1, 1.5, 0);

    scene.add(new THREE.AmbientLight(0x222222, 1.2));
    const dir = new THREE.DirectionalLight(0x333333, 1.0);
    dir.position.set(-4, 6, 3);
    scene.add(dir);

    const redPL    = new THREE.PointLight(0xff2200, 0, 7);
    const yellowPL = new THREE.PointLight(0xffaa00, 0, 7);
    const greenPL  = new THREE.PointLight(0x00ff44, 0, 7);
    redPL.position.set(-1.95, 5.26, 0.5);
    yellowPL.position.set(-1.95, 4.76, 0.5);
    greenPL.position.set(-1.95, 4.26, 0.5);
    scene.add(redPL, yellowPL, greenPL);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: 0x131313, roughness: 1, metalness: 0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue;
      const line = new THREE.Mesh(
        new THREE.PlaneGeometry(0.12, 6),
        new THREE.MeshStandardMaterial({ color: 0x2a2a2a })
      );
      line.rotation.x = -Math.PI / 2;
      line.position.set(i * 1.5, 0.001, 0);
      scene.add(line);
    }

    const tlGroup = new THREE.Group();
    scene.add(tlGroup);

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9, metalness: 0.4 });

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 5.5, 8), poleMat);
    pole.position.set(0, 2.75, 0);
    tlGroup.add(pole);

    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 2.0, 8), poleMat);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(-1.0, 5.3, 0);
    tlGroup.add(arm);

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 1.6, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.95, metalness: 0.3 })
    );
    box.position.set(-1.95, 4.8, 0);
    tlGroup.add(box);

    for (let i = 0; i < 3; i++) {
      const fin = new THREE.Mesh(
        new THREE.BoxGeometry(0.58, 0.06, 0.25),
        new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1 })
      );
      fin.position.set(-1.95, 5.52 - i * 0.52, 0.22);
      tlGroup.add(fin);
    }

    const redOnMat    = new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff2200, emissiveIntensity: 2.8, roughness: 0.2 });
    const yellowOnMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xffaa00, emissiveIntensity: 2.8, roughness: 0.2 });
    const greenOnMat  = new THREE.MeshStandardMaterial({ color: 0x00ff44, emissive: 0x00ff44, emissiveIntensity: 2.8, roughness: 0.2 });
    const redOffMat    = new THREE.MeshStandardMaterial({ color: 0x1a0400, roughness: 0.9 });
    const yellowOffMat = new THREE.MeshStandardMaterial({ color: 0x1a0e00, roughness: 0.9 });
    const greenOffMat  = new THREE.MeshStandardMaterial({ color: 0x001a08, roughness: 0.9 });

    const bulbGeo = new THREE.SphereGeometry(0.13, 16, 16);
    const redBulb    = new THREE.Mesh(bulbGeo, redOnMat);
    const yellowBulb = new THREE.Mesh(bulbGeo, yellowOffMat);
    const greenBulb  = new THREE.Mesh(bulbGeo, greenOffMat);
    redBulb.position.set(-1.95, 5.26, 0.13);
    yellowBulb.position.set(-1.95, 4.76, 0.13);
    greenBulb.position.set(-1.95, 4.26, 0.13);
    tlGroup.add(redBulb, yellowBulb, greenBulb);

    const dirtMat = new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 1 });
    [[2.5,0.04,1.2,0.4,0.08,0.3],[-3,0.03,2,0.25,0.06,0.2],[1,0,-0.8,0.5,0.05,0.4],[-1.5,0.03,-1.5,0.2,0.07,0.15]].forEach(([x,y,z,w,h,d]) => {
      const g = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), dirtMat);
      g.position.set(x,y,z);
      scene.add(g);
    });

    tlGroup.position.set(-0.5, 0, 0);

    const CYCLE = [
      { name: "red",    duration: 3.5 },
      { name: "yellow", duration: 2.0 },
      { name: "green",  duration: 3.5 },
    ];

    let cycleIndex = 0;
    let cycleTimer = 0;
    let pulse = 0;
    let currentAngle = 0;
    let rotDir = 1;

    const setLight = (name: string) => {
      redBulb.material    = name === "red"    ? redOnMat    : redOffMat;
      yellowBulb.material = name === "yellow" ? yellowOnMat : yellowOffMat;
      greenBulb.material  = name === "green"  ? greenOnMat  : greenOffMat;
      redPL.intensity    = name === "red"    ? 4.2 : 0;
      yellowPL.intensity = name === "yellow" ? 4.2 : 0;
      greenPL.intensity  = name === "green"  ? 4.2 : 0;
    };

    setLight("red");

    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      pulse += 0.04;

      cycleTimer += delta;
      if (cycleTimer >= CYCLE[cycleIndex].duration) {
        cycleTimer = 0;
        cycleIndex = (cycleIndex + 1) % CYCLE.length;
        setLight(CYCLE[cycleIndex].name);
      }

      const pulseMod = 0.5 + Math.sin(pulse) * 0.25;
      const active = CYCLE[cycleIndex].name;
      if (active === "red")    redPL.intensity    = 3.8 + pulseMod;
      if (active === "yellow") yellowPL.intensity = 3.8 + pulseMod;
      if (active === "green")  greenPL.intensity  = 3.8 + pulseMod;

      currentAngle += 0.003 * rotDir;
      if (currentAngle >= Math.PI) rotDir = -1;
      if (currentAngle <= 0)       rotDir = 1;
      tlGroup.rotation.y = currentAngle;

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
      className="fixed top-0 left-0 w-1/2 h-full pointer-events-none opacity-60"
      style={{ zIndex: 0 }}
    />
  );
}