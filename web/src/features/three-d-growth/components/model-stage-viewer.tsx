"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Box3, Vector3 } from "three";

export function ModelStageViewer({
  modelPath = "/models/plant.glb",
}: {
  modelPath?: string;
}) {
  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [0, 3.6, 4.4], fov: 20 }}>
        <ambientLight intensity={1.3} />
        <directionalLight position={[2, 3, 2]} intensity={1.8} />
        <directionalLight position={[-2, -1, -2]} intensity={0.45} />
        <Suspense fallback={null}>
          <Environment preset="park" />
          <PlantModel modelPath={modelPath} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={1.18}
          maxPolarAngle={1.32}
          target={[0, -0.22, 0]}
        />
      </Canvas>
    </div>
  );
}

function PlantModel({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath);
  const normalizedScene = useMemo(() => {
    const clone = scene.clone();
    const box = new Box3().setFromObject(clone);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const targetSpan = 1.9;
    const scale = targetSpan / maxDim;
    const raisedY = size.y * scale * 0.02;

    return {
      clone,
      position: [
        -center.x * scale,
        -center.y * scale + raisedY,
        -center.z * scale,
      ] as [number, number, number],
      rotation: [0.04, -0.24, 0] as [number, number, number],
      scale,
    };
  }, [scene]);

  return (
    <primitive
      object={normalizedScene.clone}
      position={normalizedScene.position}
      rotation={normalizedScene.rotation}
      scale={normalizedScene.scale}
    />
  );
}

useGLTF.preload("/models/plant.glb");
