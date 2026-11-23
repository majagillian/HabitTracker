// Trainings-Begleiter: zeigt jede Übung mit Vorturner:in, zählt Zeit/Atemzüge, Pausen und Seiten
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, View } from 'react-native';
import { TrainerFigure } from '@/components/TrainerFigure';
import { Badge, Button, Card, IconButton, Progress, Row, Txt } from '@/components/ui';
import { EXERCISES } from '@/data/exercises';
import { buildSteps, type Workout } from '@/data/workouts';
import { useTheme } from '@/theme/useTheme';
import type { Gender } from '@/types';

export const WorkoutPlayer = ({ workout, level, gender, onFinish, onCancel }: { workout: Workout; level: 1 | 2 | 3; gender: Gender; onFinish: (minutes: number) => void; onCancel: () => void }) => {
  const { c } = useTheme();
  const steps = useMemo(() => buildSteps(workout, level), [workout, level]);
  const [idx, setIdx] = useState(0);
  const [resting, setResting] = useState(false);
  const [left, setLeft] = useState(steps[0]?.seconds ?? 0);
  const [running, setRunning] = useState(true);
  const [started] = useState(Date.now());
  const step = steps[idx];
  const ex = EXERCISES[step?.block.ex];
  const timed = !!(step?.block.sec || step?.block.breaths);
  const restSec = step?.block.rest ?? 0;

  const next = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (!resting && restSec > 0 && idx < steps.length - 1) {
      setResting(true);
      setLeft(restSec);
      return;
    }
    setResting(false);
    if (idx >= steps.length - 1) {
      onFinish(Math.max(1, Math.round((Date.now() - started) / 60000)));
      return;
    }
    setIdx(idx + 1);
    setLeft(steps[idx + 1].seconds);
  };

  useEffect(() => {
    if (!running || (!timed && !resting)) return;
    if (left <= 0) {
      next();
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, running, timed, resting]);

  if (!step || !ex) return null;
  const upcoming = steps[idx + 1] ? EXERCISES[steps[idx + 1].block.ex] : null;
  const mmss = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;

  return (
    <View style={{ gap: 12 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt size={13} weight="700" color={c.primary}>{`${workout.name} · ${idx + 1} / ${steps.length}`}</Txt>
        <IconButton icon="close" label="Training beenden" onPress={onCancel} />
      </Row>
      <Progress value={(idx / steps.length) * 100} color={c.primary} label="Trainingsfortschritt" />
      {resting ? (
        <Card tone="ok" style={{ alignItems: 'center', paddingVertical: 28 }}>
          <Txt size={22} weight="800">
            Pause
          </Txt>
          <Txt size={44} weight="800" color={c.primary}>
            {mmss}
          </Txt>
          <Txt muted>{`Als Nächstes: ${upcoming?.name ?? ex.name}`}</Txt>
          <Txt size={13} muted center>
            Locker atmen, Schultern lösen, etwas trinken.
          </Txt>
        </Card>
      ) : (
        <Card tone="ok" style={{ alignItems: 'center' }}>
          <Row wrap gap={6} style={{ justifyContent: 'center' }}>
            <Badge text={step.block.phase} />
            {step.sets > 1 && <Badge text={`Satz ${step.set}/${step.sets}`} />}
            {step.side && <Badge text={`Seite: ${step.side}`} bg={c.warnBg} />}
          </Row>
          <TrainerFigure exercise={ex} gender={gender} size={280} side={step.side} />
          <Txt size={22} weight="800" center>
            {ex.name}
          </Txt>
          {ex.sanskrit ? (
            <Txt size={13} muted center>
              {ex.sanskrit}
            </Txt>
          ) : null}
          {step.block.note ? (
            <Txt size={14} center>
              {step.block.note}
            </Txt>
          ) : null}
          <Txt size={40} weight="800" color={c.primary}>
            {timed ? mmss : step.label}
          </Txt>
          <Txt size={14} center>
            {ex.how[0]}
          </Txt>
          {ex.breath ? (
            <Txt size={13} muted center>{`Atem: ${ex.breath}`}</Txt>
          ) : null}
        </Card>
      )}
      <Row>
        <IconButton icon="play-back" label="Vorherige Übung" onPress={() => { if (idx > 0) { setIdx(idx - 1); setResting(false); setLeft(steps[idx - 1].seconds); } }} />
        {timed || resting ? (
          <Button title={running ? 'Pause' : 'Weiter'} icon={running ? 'pause' : 'play'} kind="secondary" onPress={() => setRunning(!running)} style={{ flex: 1 }} />
        ) : null}
        <Button title={resting ? 'Pause überspringen' : timed ? 'Überspringen' : 'Geschafft'} icon="play-forward" onPress={next} style={{ flex: 1 }} />
      </Row>
    </View>
  );
};
