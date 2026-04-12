// ── Engine-agnostic simulation state protocol ─────────────────────────────────
// Types live in @simarena/viewport (the bridge layer), not in engine adapters.
// Tier 1: transforms (universal)
// Tier 2: sensors, qpos (most engines)
// Tier 3: contacts (MuJoCo/Isaac only)

export interface SimScene {
	bodies: { name: string; id: number }[];
	actuators: { name: string; range: [number, number] }[];
	/** No engine-specific address offsets — adapters map internally. */
	sensors: { name: string; dim: number }[];
	/** Geom→body mapping for contact name resolution. */
	geoms: { name: string; body: string }[];
	timestep: number;
	nbody: number;
	nq: number;
	nu: number;
}

export interface Contact {
	geom1: string;
	geom2: string;
	pos: [number, number, number];
	/** Scalar contact force magnitude. */
	force: number;
	/** Contact frame normal (unit vector, first row of contact.frame). */
	normal?: [number, number, number];
}

export interface SimFrame {
	time: number;
	/** Flat world-space positions [x0,y0,z0, x1,...] per body. */
	xpos: Float32Array;
	/** Flat world-space quaternions wxyz [w0,x0,y0,z0, w1,...] per body. */
	xquat: Float32Array;
	qpos?: Float64Array;
	ctrl?: Float64Array;
	/** Named sensor readings: Record<sensorName, values[]>. */
	sensors?: Record<string, number[]>;
	/** Per-contact detail — Tier 3 only (MuJoCo/Isaac). */
	contacts?: Contact[];
	/** Engine-agnostic eval result — frontend narrows to EvalResult. */
	output?: unknown;
}

export interface SimSource {
	onScene(cb: (msg: SimScene) => void): void;
	onFrame(cb: (frame: SimFrame) => void): void;
	onStatus(cb: (status: string) => void): void;
	/** scene is SceneDoc in practice; typed unknown to avoid format dependency. */
	start(scene: unknown): Promise<void>;
	sendCtrl(values: Float64Array): void;
	sendCommand(values: Float32Array): void;
	reset(): void;
	stop(): void;
	close(): void;
}
