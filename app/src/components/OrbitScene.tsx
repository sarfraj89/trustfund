import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
    Shield,
    Coins,
    Zap,
    Lock,
    Globe,
    Cpu
} from 'lucide-react';

const OrbitingIcon = ({ icon: Icon, color, radius, speed, offset }: {
    icon: any,
    color: string,
    radius: number,
    speed: number,
    offset: number
}) => {
    const ref = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.getElapsedTime() * speed + offset;
        ref.current.position.x = Math.cos(t) * radius;
        ref.current.position.z = Math.sin(t) * radius;
        ref.current.position.y = Math.sin(t * 0.5) * (radius * 0.3);
    });

    return (
        <group ref={ref}>
            <Html center transform occlude="blending" distanceFactor={10}>
                <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl flex items-center justify-center`} style={{ color }}>
                    <Icon size={32} strokeWidth={2.5} />
                </div>
            </Html>
            {/* Visual Orbit Path */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[radius - 0.05, radius + 0.05, 64]} />
                <meshBasicMaterial color={color} transparent opacity={0.05} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
};

const CentralOrb = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
        meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    });

    return (
        <group>
            <Float speed={2} rotationIntensity={1} floatIntensity={2}>
                <Sphere ref={meshRef} args={[1, 64, 64]}>
                    <MeshDistortMaterial
                        color="#a855f7"
                        speed={3}
                        distort={0.4}
                        radius={1}
                        roughness={0}
                        emissive="#a855f7"
                        emissiveIntensity={0.5}
                    />
                </Sphere>
            </Float>

            {/* Outer Glow */}
            <Sphere args={[1.2, 32, 32]}>
                <meshBasicMaterial color="#a855f7" transparent opacity={0.1} wireframe />
            </Sphere>

            {/* Ground Glow */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
                <planeGeometry args={[10, 10]} />
                <meshBasicMaterial color="#a855f7" transparent opacity={0.05} />
            </mesh>
        </group>
    );
};

export const OrbitScene = () => {
    const icons = useMemo(() => [
        { icon: Shield, color: '#22d3ee', radius: 4, speed: 0.5, offset: 0 },
        { icon: Coins, color: '#f59e0b', radius: 6, speed: 0.3, offset: Math.PI / 3 },
        { icon: Zap, color: '#8b5cf6', radius: 5, speed: 0.4, offset: Math.PI },
        { icon: Lock, color: '#10b981', radius: 7, speed: 0.2, offset: (Math.PI * 4) / 3 },
        { icon: Globe, color: '#3b82f6', radius: 8, speed: 0.15, offset: Math.PI / 2 },
        { icon: Cpu, color: '#ec4899', radius: 5.5, speed: 0.35, offset: (Math.PI * 3) / 2 },
    ], []);

    return (
        <div className="w-full h-full absolute inset-0 -z-10 pointer-events-none">
            <Canvas camera={{ position: [0, 5, 12], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                <pointLight position={[-10, -10, -10]} color="#a855f7" intensity={1} />

                <CentralOrb />

                {icons.map((item, i) => (
                    <OrbitingIcon key={i} {...item} />
                ))}

                {/* Background Particles */}
                <Stars count={500} size={0.1} />
            </Canvas>
        </div>
    );
};

const Stars = ({ count = 500, size = 0.1 }) => {
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 50;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
        }
        return pos;
    }, [count]);

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial color="#ffffff" size={size} transparent opacity={0.2} sizeAttenuation />
        </points>
    );
};
