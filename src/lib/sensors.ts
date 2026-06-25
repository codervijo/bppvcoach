import { useCallback, useEffect, useRef, useState } from "react";

export interface OrientationReading {
  pitch: number; // beta in our mapping
  roll: number;
  yaw: number;
  available: boolean;
  timestamp: number;
}

export interface MotionReading {
  angularVelocity: number; // magnitude deg/sec
  acceleration: number; // magnitude m/s^2
}

export interface CalibrationOffsets {
  pitch: number;
  roll: number;
  yaw: number;
}

export interface SensorSupport {
  orientation: boolean;
  motion: boolean;
  needsPermission: boolean;
  permissionGranted: boolean | null;
}

const SMOOTHING = 0.25; // low-pass alpha

function lowPass(prev: number, next: number, alpha = SMOOTHING) {
  if (Number.isNaN(prev)) return next;
  // shortest angular path
  let delta = next - prev;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return prev + alpha * delta;
}

export function detectSupport(): SensorSupport {
  if (typeof window === "undefined") {
    return { orientation: false, motion: false, needsPermission: false, permissionGranted: null };
  }
  const orientation = "DeviceOrientationEvent" in window;
  const motion = "DeviceMotionEvent" in window;
  const needsPermission =
    orientation &&
    // @ts-ignore
    typeof (window.DeviceOrientationEvent as any).requestPermission === "function";
  return { orientation, motion, needsPermission, permissionGranted: needsPermission ? null : orientation };
}

export async function requestSensorPermission(): Promise<boolean> {
  try {
    // @ts-ignore
    const orientFn = (window.DeviceOrientationEvent as any)?.requestPermission;
    // @ts-ignore
    const motionFn = (window.DeviceMotionEvent as any)?.requestPermission;
    let ok = true;
    if (typeof orientFn === "function") {
      const r = await orientFn();
      ok = ok && r === "granted";
    }
    if (typeof motionFn === "function") {
      const r = await motionFn();
      ok = ok && r === "granted";
    }
    return ok;
  } catch {
    return false;
  }
}

export interface UseSensorsOptions {
  mock?: boolean;
}

export function useSensors(opts: UseSensorsOptions = {}) {
  const [support] = useState<SensorSupport>(() => detectSupport());
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    support.needsPermission ? null : support.orientation
  );
  const [raw, setRaw] = useState<OrientationReading>({
    pitch: 0,
    roll: 0,
    yaw: 0,
    available: false,
    timestamp: 0,
  });
  const [smoothed, setSmoothed] = useState<OrientationReading>({
    pitch: 0,
    roll: 0,
    yaw: 0,
    available: false,
    timestamp: 0,
  });
  const [motion, setMotion] = useState<MotionReading>({ angularVelocity: 0, acceleration: 0 });
  const [calibration, setCalibration] = useState<CalibrationOffsets>({ pitch: 0, roll: 0, yaw: 0 });
  const [sampleRate, setSampleRate] = useState(0);

  const smoothedRef = useRef<OrientationReading>(smoothed);
  const samplesRef = useRef<number[]>([]);
  const lastTickRef = useRef<number>(0);

  // Mock mode for desktop dev
  useEffect(() => {
    if (!opts.mock) return;
    let t = 0;
    const id = window.setInterval(() => {
      t += 0.1;
      const pitch = Math.sin(t) * 30;
      const roll = Math.cos(t * 0.8) * 25;
      const yaw = (t * 10) % 360;
      const now = performance.now();
      const reading: OrientationReading = { pitch, roll, yaw, available: true, timestamp: now };
      setRaw(reading);
      const sp = lowPass(smoothedRef.current.pitch, pitch);
      const sr = lowPass(smoothedRef.current.roll, roll);
      const sy = lowPass(smoothedRef.current.yaw, yaw);
      const next = { pitch: sp, roll: sr, yaw: sy, available: true, timestamp: now };
      smoothedRef.current = next;
      setSmoothed(next);
      setMotion({ angularVelocity: Math.abs(Math.cos(t) * 30), acceleration: 9.8 });
    }, 50);
    setSampleRate(20);
    return () => window.clearInterval(id);
  }, [opts.mock]);

  useEffect(() => {
    if (opts.mock) return;
    if (!permissionGranted) return;

    const onOrient = (e: DeviceOrientationEvent) => {
      const beta = e.beta ?? 0; // x axis, front-back tilt -180..180
      const gamma = e.gamma ?? 0; // y axis, left-right tilt -90..90
      const alpha = e.alpha ?? 0; // z axis, compass 0..360
      const now = performance.now();
      const reading: OrientationReading = {
        pitch: beta,
        roll: gamma,
        yaw: alpha,
        available: true,
        timestamp: now,
      };
      setRaw(reading);
      const sp = lowPass(smoothedRef.current.pitch, beta);
      const sr = lowPass(smoothedRef.current.roll, gamma);
      const sy = lowPass(smoothedRef.current.yaw, alpha);
      const next = { pitch: sp, roll: sr, yaw: sy, available: true, timestamp: now };
      smoothedRef.current = next;
      setSmoothed(next);

      // sample rate (rolling 1s)
      samplesRef.current.push(now);
      samplesRef.current = samplesRef.current.filter((t) => now - t < 1000);
      if (now - lastTickRef.current > 250) {
        setSampleRate(samplesRef.current.length);
        lastTickRef.current = now;
      }
    };

    const onMotion = (e: DeviceMotionEvent) => {
      const r = e.rotationRate;
      const av = r ? Math.hypot(r.alpha ?? 0, r.beta ?? 0, r.gamma ?? 0) : 0;
      const a = e.acceleration;
      const ac = a ? Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0) : 0;
      setMotion({ angularVelocity: av, acceleration: ac });
    };

    window.addEventListener("deviceorientation", onOrient);
    window.addEventListener("devicemotion", onMotion);
    return () => {
      window.removeEventListener("deviceorientation", onOrient);
      window.removeEventListener("devicemotion", onMotion);
    };
  }, [permissionGranted, opts.mock]);

  const requestPermission = useCallback(async () => {
    if (!support.needsPermission) {
      setPermissionGranted(true);
      return true;
    }
    const ok = await requestSensorPermission();
    setPermissionGranted(ok);
    return ok;
  }, [support.needsPermission]);

  const calibrate = useCallback(() => {
    setCalibration({
      pitch: smoothedRef.current.pitch,
      roll: smoothedRef.current.roll,
      yaw: smoothedRef.current.yaw,
    });
  }, []);

  const calibrated: OrientationReading = {
    pitch: smoothed.pitch - calibration.pitch,
    roll: smoothed.roll - calibration.roll,
    yaw: smoothed.yaw - calibration.yaw,
    available: smoothed.available,
    timestamp: smoothed.timestamp,
  };

  return {
    support,
    permissionGranted,
    requestPermission,
    raw,
    smoothed,
    calibrated,
    motion,
    calibration,
    calibrate,
    sampleRate,
  };
}

export type AlignmentState = "green" | "yellow" | "red" | "gray";

export function evaluateAlignment(
  reading: OrientationReading,
  targetPitch: number,
  targetRoll: number,
  pitchTol: number,
  rollTol: number
): { state: AlignmentState; pitchDelta: number; rollDelta: number } {
  if (!reading.available) return { state: "gray", pitchDelta: 0, rollDelta: 0 };
  const pd = reading.pitch - targetPitch;
  const rd = reading.roll - targetRoll;
  const within = Math.abs(pd) <= pitchTol && Math.abs(rd) <= rollTol;
  const close =
    Math.abs(pd) <= pitchTol * 1.75 && Math.abs(rd) <= rollTol * 1.75;
  return {
    state: within ? "green" : close ? "yellow" : "red",
    pitchDelta: pd,
    rollDelta: rd,
  };
}
