// Animierte Vorturner:in – Skelett-Animation zwischen Posen, Seiten- und/oder Frontansicht
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { FRONT, SIDE } from '@/data/poses';
import { mirrorPose, type Exercise, type Frame } from '@/data/exercises';
import { easeInOut, lerpPose, solve, type Pose, type View as PoseView } from '@/lib/pose';
import { BUILD, figureShapes } from '@/lib/figureShapes';
import type { Gender } from '@/types';

const poseOf = (f: Frame, view: PoseView): Pose | null => {
  const raw = view === 'side' ? (f.side ? SIDE[f.side] : null) : f.front ? FRONT[f.front] : null;
  if (!raw) return null;
  return f.mirror ? mirrorPose(raw) : raw;
};

// Eine Ansicht animieren
const Figure = ({ frames, view, gender, props, size, paused, flip }: { frames: Frame[]; view: PoseView; gender: Gender; props?: Exercise['props']; size: number; paused?: boolean; flip?: boolean }) => {
  const valid = frames.filter((f) => poseOf(f, view));
  const [t, setT] = useState(0);
  const start = useRef(Date.now());
  const total = valid.reduce((s, f) => s + f.ms, 0) || 1;

  useEffect(() => {
    if (paused || valid.length < 2) return;
    start.current = Date.now() - t;
    let raf = 0;
    let last = 0;
    const tick = () => {
      const now = Date.now();
      if (now - last > 33) {
        // ca. 30 Bilder pro Sekunde reichen und schonen den Akku
        last = now;
        setT((now - start.current) % total);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, total, valid.length]);

  if (!valid.length) return null;
  // Position im Ablauf: 35 % der Zeit Übergang, Rest Halten
  let acc = 0;
  let pose = poseOf(valid[0], view)!;
  for (let i = 0; i < valid.length; i++) {
    const f = valid[i];
    if (t < acc + f.ms || i === valid.length - 1) {
      const local = (t - acc) / f.ms;
      const prev = poseOf(valid[(i - 1 + valid.length) % valid.length], view)!;
      const cur = poseOf(f, view)!;
      const k = valid.length < 2 ? 1 : Math.min(1, local / 0.35);
      pose = lerpPose(prev, cur, easeInOut(k));
      break;
    }
    acc += f.ms;
  }
  const g = solve(pose, view, BUILD[gender]);
  const shapes = figureShapes(g, gender, props);
  return (
    <Svg width={size} height={size * (200 / 220)} viewBox="0 0 220 200" style={flip ? { transform: [{ scaleX: -1 }] } : undefined}>
      <Rect x={0} y={188} width={220} height={3} fill="#BDEFDF" />
      {shapes.map((s, i) => {
        if (s.k === 'line') return <Line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={s.stroke} strokeWidth={s.w} strokeLinecap="round" />;
        if (s.k === 'circle') return <Circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill} />;
        if (s.k === 'rect') return <Rect key={i} x={s.x} y={s.y} width={s.width} height={s.height} rx={s.rx} fill={s.fill} />;
        return <Path key={i} d={s.d} fill={s.fill} stroke={s.stroke} strokeWidth={s.w} strokeLinecap="round" strokeLinejoin="round" />;
      })}
    </Svg>
  );
};

export const TrainerFigure = ({ exercise, gender, size = 260, side }: { exercise: Exercise; gender: Gender; size?: number; side?: 'rechts' | 'links' }) => {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => {});
  }, []);
  const who = gender === 'w' ? 'Eine Trainerin' : gender === 'm' ? 'Ein Trainer' : 'Eine Person';
  const view = exercise.view;
  const label = `${who} zeigt ${exercise.name}${view === 'both' ? ' von vorn und von der Seite' : view === 'side' ? ' von der Seite' : ' von vorn'}`;
  // Linke Körperseite: Seitenansicht spiegeln
  const flip = side === 'links';
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label} style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
      {(view === 'side' || view === 'both') && <Figure frames={exercise.frames} view="side" gender={gender} props={exercise.props} size={view === 'both' ? size * 0.55 : size} paused={reduce} flip={flip} />}
      {(view === 'front' || view === 'both') && <Figure frames={exercise.frames} view="front" gender={gender} props={exercise.props} size={view === 'both' ? size * 0.55 : size} paused={reduce} flip={flip} />}
    </View>
  );
};
