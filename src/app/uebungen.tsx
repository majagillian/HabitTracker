// Achtsamkeitsübungen & Rituale – spielerisch: Orakel, Chakra-Atem, Sorgen-Wolken, Atemübungen, geführte Rituale
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Button, Card, Field, IconButton, Note, Progress, Row, Txt } from '@/components/ui';
import { CHAKRAS, ORACLE, RITUALS, type Ritual } from '@/data/mindfulness';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme/useTheme';

// Atem-Kreis, der sich mit dem Atem ausdehnt
const BreathOrb = ({ color, phases }: { color: string; phases: { label: string; sec: number; scale: number }[] }) => {
  const scale = useRef(new Animated.Value(0.6)).current;
  const [i, setI] = useState(0);
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => {});
  }, []);
  useEffect(() => {
    const p = phases[i];
    if (!reduce) Animated.timing(scale, { toValue: p.scale, duration: p.sec * 1000, useNativeDriver: true }).start();
    const t = setTimeout(() => setI((i + 1) % phases.length), p.sec * 1000);
    return () => clearTimeout(t);
  }, [i, phases, reduce, scale]);
  return (
    <View style={{ alignItems: 'center', gap: 14, paddingVertical: 10 }}>
      <Animated.View style={{ width: 200, height: 200, borderRadius: 100, backgroundColor: color, opacity: 0.85, transform: [{ scale }], alignItems: 'center', justifyContent: 'center' }} />
      <Txt size={22} weight="800" center>
        {phases[i].label}
      </Txt>
      <Txt muted>{`${phases[i].sec} Sekunden`}</Txt>
    </View>
  );
};

const RitualPlayer = ({ r, onDone }: { r: Ritual; onDone: () => void }) => {
  const { c } = useTheme();
  const [card, setCard] = useState<number | null>(null);
  const [deck] = useState(() => [...ORACLE].sort(() => Math.random() - 0.5).slice(0, 3));
  const [chakra, setChakra] = useState(0);
  const [worries, setWorries] = useState<{ t: string; gone: boolean }[]>([]);
  const [w, setW] = useState('');
  const [step, setStep] = useState(0);
  const [left, setLeft] = useState(r.steps?.[0]?.sec ?? 0);
  const fg = r.dark ? '#FFFFFF' : '#1F1B2E';

  useEffect(() => {
    if (r.kind !== 'steps' || !r.steps) return;
    if (left <= 0) {
      if (step < r.steps.length - 1) {
        setStep(step + 1);
        setLeft(r.steps[step + 1].sec);
      }
      return;
    }
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left, step, r]);

  return (
    <View style={{ gap: 14 }}>
      <Txt color={fg} center>
        {r.intro}
      </Txt>
      {r.kind === 'oracle' && (
        <>
          <Row gap={10} style={{ justifyContent: 'center' }}>
            {deck.map((o, i) => (
              <Pressable key={o.name} accessibilityRole="button" accessibilityLabel={card === i ? o.name : `Verdeckte Karte ${i + 1}`} onPress={() => setCard(i)} style={{ width: 100, height: 160, borderRadius: 16, borderWidth: 2, borderColor: '#FDE68A', backgroundColor: card === i ? '#FDE68A' : '#4C1D95', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                <Txt weight="800" color={card === i ? '#1E1B4B' : '#FDE68A'} center size={card === i ? 15 : 30}>
                  {card === i ? o.name : '✦'}
                </Txt>
              </Pressable>
            ))}
          </Row>
          {card !== null && (
            <Card style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'transparent' }}>
              <Txt color="#FFFFFF" center size={16}>
                {deck[card].msg}
              </Txt>
            </Card>
          )}
        </>
      )}
      {r.kind === 'chakra' && (
        <>
          <BreathOrb color={CHAKRAS[chakra].color} phases={[{ label: 'Einatmen', sec: 4, scale: 1 }, { label: 'Ausatmen', sec: 6, scale: 0.6 }]} />
          <Txt weight="800" size={20} center>
            {CHAKRAS[chakra].name}
          </Txt>
          <Txt center>{CHAKRAS[chakra].text}</Txt>
          <Row gap={8} style={{ justifyContent: 'center' }}>
            {CHAKRAS.map((k, i) => (
              <Pressable key={k.name} accessibilityRole="button" accessibilityLabel={k.name} accessibilityState={{ selected: chakra === i }} onPress={() => setChakra(i)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: k.color, borderWidth: 3, borderColor: chakra === i ? c.text : 'transparent' }} />
            ))}
          </Row>
          <Button title={chakra < 6 ? 'Nächstes Chakra' : 'Von vorn'} kind="secondary" onPress={() => setChakra((chakra + 1) % 7)} />
        </>
      )}
      {r.kind === 'clouds' && (
        <>
          <Row>
            <View style={{ flex: 1 }}>
              <Field label="Was beschäftigt dich?" value={w} onChangeText={setW} placeholder="z. B. Prüfung nächste Woche" />
            </View>
            <IconButton icon="cloud-outline" label="Wolke hinzufügen" onPress={() => { if (w.trim()) { setWorries([...worries, { t: w.trim(), gone: false }]); setW(''); } }} />
          </Row>
          <View style={{ minHeight: 220, borderRadius: 20, backgroundColor: '#BFDBFE', padding: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'flex-start' }}>
            {worries.filter((x) => !x.gone).map((x, i) => (
              <Pressable key={x.t + i} accessibilityRole="button" accessibilityLabel={`Sorge „${x.t}“ wegpusten`} onPress={() => setWorries(worries.map((y) => (y === x ? { ...y, gone: true } : y)))} style={{ minHeight: 60, paddingHorizontal: 18, borderRadius: 30, backgroundColor: '#FFFFFF', justifyContent: 'center' }}>
                <Txt weight="700" color="#1F1B2E">
                  {x.t}
                </Txt>
              </Pressable>
            ))}
            {worries.length > 0 && worries.every((x) => x.gone) && (
              <Txt weight="800" size={20} color="#1E3A8A" center style={{ width: '100%', paddingTop: 50 }}>
                Klarer Himmel. Du darfst leicht sein.
              </Txt>
            )}
          </View>
        </>
      )}
      {r.kind === 'breath' && (
        <BreathOrb
          color={r.dot}
          phases={r.id === '478' ? [{ label: 'Einatmen', sec: 4, scale: 1 }, { label: 'Halten', sec: 7, scale: 1 }, { label: 'Ausatmen', sec: 8, scale: 0.6 }] : [{ label: 'Einatmen', sec: 4, scale: 1 }, { label: 'Halten', sec: 4, scale: 1 }, { label: 'Ausatmen', sec: 4, scale: 0.6 }, { label: 'Halten', sec: 4, scale: 0.6 }]}
        />
      )}
      {r.kind === 'steps' && r.steps && (
        <>
          <Progress value={((step + 1) / r.steps.length) * 100} color={r.dot} label="Fortschritt" />
          <Card style={{ backgroundColor: r.dark ? 'rgba(255,255,255,0.1)' : c.card, borderColor: 'transparent', minHeight: 140, justifyContent: 'center' }}>
            <Txt size={18} weight="700" center color={fg}>
              {r.steps[step].text}
            </Txt>
            <Txt center color={r.dark ? '#E2E8F0' : c.muted}>{`${left} s`}</Txt>
          </Card>
          <Row>
            <Button title="Zurück" kind="secondary" disabled={step === 0} onPress={() => { setStep(step - 1); setLeft(r.steps![step - 1].sec); }} style={{ flex: 1 }} small />
            <Button title="Weiter" kind="secondary" disabled={step === r.steps.length - 1} onPress={() => { setStep(step + 1); setLeft(r.steps![step + 1].sec); }} style={{ flex: 1 }} small />
          </Row>
        </>
      )}
      <Button title="Fertig · +15 XP" kind="mint" onPress={onDone} />
    </View>
  );
};

export default function Uebungen() {
  const params = useLocalSearchParams<{ start?: string }>();
  const finishExercise = useStore((s) => s.finishExercise);
  const [active, setActive] = useState<Ritual | null>(null);
  useEffect(() => {
    if (params.start) setActive(RITUALS.find((r) => r.id === params.start) ?? null);
  }, [params.start]);

  if (active) {
    return (
      <Screen title={active.name} subtitle={`${active.minutes} Min. · ${active.tag}`} bg={active.dark ? active.color : undefined} fg={active.dark ? '#FFFFFF' : undefined} right={<IconButton icon="close" label="Übung schließen" onPress={() => setActive(null)} />}>
        <RitualPlayer
          r={active}
          onDone={() => {
            finishExercise(active.name);
            setActive(null);
          }}
        />
      </Screen>
    );
  }
  return (
    <Screen title="Übungen & Rituale" subtitle="Kleine Inseln der Ruhe">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {RITUALS.map((r) => (
          <Pressable key={r.id} accessibilityRole="button" accessibilityLabel={`${r.name}, ${r.minutes} Minuten`} onPress={() => setActive(r)} style={({ pressed }) => ({ width: '48%', minHeight: 130, borderRadius: 22, backgroundColor: r.color, padding: 14, justifyContent: 'space-between', opacity: pressed ? 0.85 : 1 })}>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: r.dot, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' }} />
            <View>
              <Txt weight="800" color={r.dark ? '#FFFFFF' : '#1F1B2E'}>
                {r.name}
              </Txt>
              <Txt size={12} color={r.dark ? '#E2E8F0' : '#3B3650'}>{`${r.minutes} Min. · ${r.tag}`}</Txt>
            </View>
          </Pressable>
        ))}
      </View>
      <Note>Rituale wie Orakel- und Chakra-Übungen sind Impulse zur Selbstreflexion – keine Therapie und keine medizinische Behandlung. Wenn es dir länger schlecht geht, sprich mit einer Ärztin, einem Therapeuten oder ruf die Telefonseelsorge an (0800 111 0 111, kostenlos, rund um die Uhr).</Note>
    </Screen>
  );
}
