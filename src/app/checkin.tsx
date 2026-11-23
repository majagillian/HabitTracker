// Achtsamkeits-Check-in mit Tagi: 5 spielerische Fragen, Belohnung, Tagesfrage & passende Übung
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Star } from '@/components/Celebration';
import { Screen } from '@/components/Screen';
import { Tagi } from '@/components/Tagi';
import { Button, Card, Field, IconButton, Progress, Row, Txt } from '@/components/ui';
import { DAILY_QUESTIONS, GOOD_TAGS } from '@/data/mindfulness';
import { nowTime, today } from '@/lib/date';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme/useTheme';

const WEATHER = [
  { t: 'Gewitter', sun: 0, cloud: '#64748B', rain: 1, bolt: 1 },
  { t: 'Regen', sun: 0, cloud: '#94A3B8', rain: 1, bolt: 0 },
  { t: 'Wolkig', sun: 0, cloud: '#CBD5E1', rain: 0, bolt: 0 },
  { t: 'Heiter', sun: 1, cloud: '#E2E8F0', rain: 0, bolt: 0 },
  { t: 'Sonnig', sun: 1, cloud: 'transparent', rain: 0, bolt: 0 },
];
const Q = ['Welches Wetter ist gerade in dir?', 'Wie voll ist dein Akku?', 'Wie viele Monde hast du geschlafen?', 'Wie laut ist es in deinem Kopf?', 'Was hat dir heute gutgetan?', 'Check-in geschafft!'];
const BUBBLES = [
  ['Bei Gewitter kuschle ich mich zu dir.', 'Regentage gehören dazu.', 'Ein bisschen grau? Okay.', 'Schön, ein paar Sonnenstrahlen!', 'Juhu, Sonne! Ich tanze mit.'],
  ['Akku leer? Dann laden wir zusammen.', 'Sparmodus heute.', 'Halb voll ist auch voll.', 'Gut geladen!', 'Volle Power!'],
  ['Puh, kurze Nacht.', 'Etwas wenig Schlaf.', 'Ganz okay geschlafen.', 'Gut ausgeruht!', 'Wie ein Murmeltier!'],
  ['Schön ruhig da drin.', 'Leises Summen.', 'Ein paar Gedanken flitzen herum.', 'Ganz schön laut.', 'Sehr laut. Atmen wir zusammen?'],
];
const BAT = ['#F87171', '#FB923C', '#FACC15', '#4ADE80', '#22C55E'];

export default function CheckIn() {
  const { c } = useTheme();
  const router = useRouter();
  const addCheckin = useStore((s) => s.addCheckin);
  const tagiLevel = useStore((s) => s.game.tagiLevel);
  const count = useStore((s) => s.checkins.length);
  const [step, setStep] = useState(0);
  const [v, setV] = useState({ mood: 3, energy: 2, sleep: 3, noise: 2 });
  const [good, setGood] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [flipped, setFlipped] = useState(false);
  const question = useMemo(() => DAILY_QUESTIONS[new Date().getDate() % DAILY_QUESTIONS.length], []);
  const bubble = step < 4 ? BUBBLES[step][[v.mood, v.energy, v.sleep, v.noise][step]] : step === 4 ? 'Tipp alles an, was dir Kraft gegeben hat.' : 'Danke, dass du auf dich achtest!';
  const tagiMood = step === 5 ? 4 : v.mood;

  const finish = () => {
    // Anspannung wird intern als „Ruhe“-Skala gespeichert (0 = sehr laut)
    addCheckin({ date: today(), time: nowTime(), mood: v.mood, energy: v.energy, sleep: v.sleep, noise: v.noise, good, note });
    setStep(5);
  };

  const tip = v.energy <= 1 || v.noise >= 3 ? { text: '1 Minute Box-Atmen: 4 ein, 4 halten, 4 aus, 4 halten. Ich zähle mit.', id: 'box' } : v.mood <= 1 ? { text: 'Eine Selbstmitgefühl-Pause tut jetzt gut.', id: 'selbstmitgefuehl' } : { text: 'Du bist gut drauf. Wie wäre es, jemandem eine liebe Nachricht zu schicken?', id: 'orakel' };

  return (
    <Screen
      title="Check-in"
      right={<IconButton icon="close" label="Check-in schließen" onPress={() => router.navigate('/' as never)} />}
      footer={
        <Row>
          {step > 0 && step < 5 && <IconButton icon="arrow-back" label="Zurück" onPress={() => setStep(step - 1)} size={54} />}
          <Button
            style={{ flex: 1 }}
            title={step === 5 ? 'Zurück zu Heute' : step === 4 ? 'Abschließen' : 'Weiter'}
            onPress={() => (step === 5 ? router.navigate('/' as never) : step === 4 ? finish() : setStep(step + 1))}
          />
        </Row>
      }
    >
      <Progress value={((step + 1) / 6) * 100} label="Fortschritt im Check-in" />
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Tagi mood={tagiMood} level={tagiLevel} />
        <View style={{ backgroundColor: c.soft, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, maxWidth: 320 }}>
          <Txt weight="700" center>
            {bubble}
          </Txt>
        </View>
        <Txt size={22} weight="800" center role="header">
          {Q[step]}
        </Txt>
      </View>

      {step === 0 && (
        <Row gap={6}>
          {WEATHER.map((w, i) => (
            <Pressable key={w.t} accessibilityRole="radio" accessibilityState={{ selected: v.mood === i }} accessibilityLabel={`Stimmung: ${w.t}`} onPress={() => setV({ ...v, mood: i })} style={{ flex: 1, minHeight: 96, borderRadius: 18, borderWidth: 3, borderColor: v.mood === i ? c.primary : c.border, backgroundColor: v.mood === i ? c.soft : c.card, alignItems: 'center', justifyContent: 'center', gap: 4, transform: [{ scale: v.mood === i ? 1.06 : 1 }] }}>
              <Svg width={44} height={44} viewBox="0 0 44 44">
                <Circle cx={27} cy={15} r={9} fill="#FBBF24" opacity={w.sun} />
                <Path d="M8 30 a8 8 0 0 1 6-12 a10 10 0 0 1 19 3 a6 6 0 0 1 0 12 H12 a5 5 0 0 1 -4-3z" fill={w.cloud} />
                <Path d="M15 37 l-2 5 M23 37 l-2 5 M31 37 l-2 5" stroke="#3B82F6" strokeWidth={2.5} strokeLinecap="round" opacity={w.rain} />
                <Path d="M24 32 l-5 7 h5 l-3 5" stroke="#F59E0B" strokeWidth={2.5} fill="none" opacity={w.bolt} />
              </Svg>
              <Txt size={11} weight="700">
                {w.t}
              </Txt>
            </Pressable>
          ))}
        </Row>
      )}

      {step === 1 && (
        <View style={{ alignItems: 'center', gap: 10 }}>
          <Row gap={4}>
            <View style={{ flexDirection: 'row', gap: 6, padding: 8, borderWidth: 5, borderColor: c.text, borderRadius: 18 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Pressable key={i} accessibilityRole="radio" accessibilityState={{ selected: v.energy === i }} accessibilityLabel={`Akku ${i + 1} von 5`} onPress={() => setV({ ...v, energy: i })} style={{ width: 46, height: 88, borderRadius: 8, backgroundColor: i <= v.energy ? BAT[v.energy] : c.soft }} />
              ))}
            </View>
            <View style={{ width: 10, height: 32, borderTopRightRadius: 6, borderBottomRightRadius: 6, backgroundColor: c.text }} />
          </Row>
          <Txt size={18} weight="800">
            {['Leer', 'Wenig', 'Mittel', 'Gut', 'Voll'][v.energy]}
          </Txt>
        </View>
      )}

      {step === 2 && (
        <View style={{ alignItems: 'center', gap: 10 }}>
          <Row gap={8}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Pressable key={i} accessibilityRole="radio" accessibilityState={{ selected: v.sleep === i }} accessibilityLabel={['Unter 5 Stunden', '5 bis 6 Stunden', '6 bis 7 Stunden', '7 bis 8 Stunden', 'Über 8 Stunden'][i]} onPress={() => setV({ ...v, sleep: i })} style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: i <= v.sleep ? '#1F1B2E' : c.soft, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={32} height={32} viewBox="0 0 24 24">
                  <Path d="M20 15A8 8 0 1 1 9 4a7 7 0 0 0 11 11z" fill={i <= v.sleep ? '#FDE68A' : '#CFCBDA'} />
                </Svg>
              </Pressable>
            ))}
          </Row>
          <Txt size={18} weight="800">
            {['Unter 5 h', '5–6 h', '6–7 h', '7–8 h', 'Über 8 h'][v.sleep]}
          </Txt>
        </View>
      )}

      {step === 3 && (
        <View style={{ alignItems: 'center', gap: 10 }}>
          <Row gap={10} style={{ alignItems: 'flex-end', height: 140 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Pressable key={i} accessibilityRole="radio" accessibilityState={{ selected: v.noise === i }} accessibilityLabel={`Innere Lautstärke ${i + 1} von 5`} onPress={() => setV({ ...v, noise: i })} style={{ width: 50, height: 40 + i * 24, borderRadius: 12, backgroundColor: i <= v.noise ? '#A78BFA' : c.soft }} />
            ))}
          </Row>
          <Txt size={18} weight="800">
            {['Still', 'Leise', 'Mittel', 'Laut', 'Sehr laut'][v.noise]}
          </Txt>
        </View>
      )}

      {step === 4 && (
        <>
          <Row wrap gap={8} style={{ justifyContent: 'center' }}>
            {GOOD_TAGS.map((g, i) => {
              const on = good.includes(g);
              return (
                <Pressable key={g} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => setGood(on ? good.filter((x) => x !== g) : [...good, g])} style={{ minHeight: 48, paddingHorizontal: 16, borderRadius: 24, borderWidth: 3, borderColor: on ? '#0D9488' : c.border, backgroundColor: on ? c.secondary : c.card, justifyContent: 'center', transform: [{ rotate: on ? `${[-4, 3, -2, 5, -3, 2][i % 6]}deg` : '0deg' }] }}>
                  <Txt weight="800" color={on ? '#1F1B2E' : c.text}>
                    {g}
                  </Txt>
                </Pressable>
              );
            })}
          </Row>
          <Field label="Möchtest du noch etwas festhalten? (optional)" value={note} onChangeText={setNote} multiline />
        </>
      )}

      {step === 5 && (
        <>
          <Row style={{ justifyContent: 'center' }}>
            <Star size={44} fill="#FFC494" />
            <Star size={56} fill="#7C3AED" />
            <Star size={44} fill="#8FFFD6" />
          </Row>
          <Row gap={8}>
            {[['+20', 'XP'], [String(count), 'Check-ins'], [`Lv ${tagiLevel}`, 'Tagi wächst']].map(([a, b]) => (
              <Card key={b} tone="soft" style={{ flex: 1, alignItems: 'center', padding: 10, gap: 0 }}>
                <Txt weight="800" size={20}>
                  {a}
                </Txt>
                <Txt size={12}>{b}</Txt>
              </Card>
            ))}
          </Row>
          <Pressable accessibilityRole="button" accessibilityLabel="Tagesfrage aufdecken" onPress={() => setFlipped(!flipped)} style={{ minHeight: 96, borderRadius: 20, backgroundColor: flipped ? c.accent : c.primary, padding: 16, justifyContent: 'center' }}>
            <Txt weight="800" size={16} center color={flipped ? '#1F1B2E' : c.onPrimary}>
              {flipped ? `${question} Schreib es ins Tagebuch.` : 'Tagesfrage aufdecken – tippen!'}
            </Txt>
          </Pressable>
          <Card tone="soft" onPress={() => router.navigate(`/uebungen?start=${tip.id}` as never)} label="Übung starten">
            <Txt>
              <Txt weight="800">Tagis Tipp: </Txt>
              {tip.text}
            </Txt>
          </Card>
        </>
      )}
    </Screen>
  );
}
