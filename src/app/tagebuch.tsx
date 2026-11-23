// 6-Minuten-Tagebuch, spielerisch: Morgen-Glas (Dankbarkeit, Intentionskarte, Affirmation) & Abendhimmel (Sterne-Momente)
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { Screen } from '@/components/Screen';
import { Badge, Button, Row, Segmented, Txt } from '@/components/ui';
import { AFFIRMATIONS, DAILY_QUESTIONS, INTENTIONS } from '@/data/mindfulness';
import { addDays, formatShort, today } from '@/lib/date';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme/useTheme';

const COLS = ['#A78BFA', '#8FFFD6', '#FFC494'];

export default function Tagebuch() {
  const { c, fs } = useTheme();
  const journal = useStore((s) => s.journal);
  const saveJournal = useStore((s) => s.saveJournal);
  const d = today();
  const [mode, setMode] = useState<'morgen' | 'abend'>(new Date().getHours() >= 16 ? 'abend' : 'morgen');
  const day = journal[d] ?? {};
  const [grat, setGrat] = useState<string[]>(day.morning?.grat ?? ['', '', '']);
  const [intent, setIntent] = useState(day.morning?.intent ?? '');
  const [aff, setAff] = useState(day.morning?.affirmation ?? '');
  const [great, setGreat] = useState(day.morning?.great ?? '');
  const [moments, setMoments] = useState<string[]>(day.evening?.moments ?? ['', '', '']);
  const [deed, setDeed] = useState(day.evening?.goodDeed ?? '');
  const [improve, setImprove] = useState(day.evening?.improve ?? '');
  const [saved, setSaved] = useState(false);
  const cards = useMemo(() => [...INTENTIONS].sort(() => Math.random() - 0.5).slice(0, 3), []);
  const [picked, setPicked] = useState<number | null>(null);
  useEffect(() => setSaved(false), [mode]);

  // Serien zählen
  const streakOf = (key: 'morning' | 'evening') => {
    let n = 0;
    let x = journal[d]?.[key] ? d : addDays(d, -1);
    while (journal[x]?.[key]) {
      n++;
      x = addDays(x, -1);
    }
    return n;
  };
  const morning = mode === 'morgen';
  const bg = morning ? c.bg : '#1E1B4B';
  const fg = morning ? c.text : '#FFFFFF';
  const input = (value: string, onChange: (t: string) => void, ph: string, label: string, color?: string) => (
    <TextInput
      accessibilityLabel={label}
      value={value}
      onChangeText={onChange}
      placeholder={ph}
      placeholderTextColor={morning ? c.muted : '#A5A3C7'}
      style={{ minHeight: 52, borderWidth: 2, borderColor: value ? color ?? c.primary : morning ? c.border : '#4C1D95', borderRadius: 16, paddingHorizontal: 14, fontSize: fs(16), color: fg, backgroundColor: morning ? c.card : 'rgba(255,255,255,0.08)' }}
    />
  );

  const save = () => {
    if (morning) saveJournal(d, { morning: { grat, intent: intent || (picked !== null ? cards[picked] : ''), affirmation: aff, great } });
    else saveJournal(d, { evening: { moments, goodDeed: deed, improve } });
    setSaved(true);
  };

  const filled = grat.filter(Boolean).length;
  const stars = moments.filter(Boolean).length;
  const past = Object.keys(journal).filter((k) => k !== d).sort().reverse().slice(0, 5);

  return (
    <Screen title={morning ? 'Guten Morgen!' : 'Gute Nacht!'} subtitle="6-Minuten-Tagebuch" bg={bg} fg={fg} right={<Badge text={`${streakOf(morning ? 'morning' : 'evening')} Tage`} bg={c.accent} color="#1F1B2E" />} footer={<Button title={saved ? 'Gespeichert ✓' : morning ? 'Glas verschließen' : 'Himmel speichern'} kind={saved ? 'mint' : 'primary'} onPress={save} />}>
      <Segmented value={mode} onChange={setMode} options={[{ value: 'morgen', label: 'Morgen-Glas' }, { value: 'abend', label: 'Abend-Himmel' }]} />
      {morning ? (
        <>
          <Row style={{ alignItems: 'flex-end' }}>
            <Svg width={110} height={130} viewBox="0 0 110 130" accessibilityLabel={`Dankbarkeitsglas mit ${filled} Murmeln`}>
              <Rect x={30} y={4} width={50} height={12} rx={4} fill="#D6C4A8" />
              <Path d="M26 18 H84 Q96 26 96 44 V112 Q96 126 82 126 H28 Q14 126 14 112 V44 Q14 26 26 18 Z" fill={c.soft} stroke="#A78BFA" strokeWidth={3} />
              {grat.map((g, i) => (g ? <Circle key={i} cx={[40, 70, 55][i]} cy={[106, 108, 84][i]} r={13} fill={COLS[i]} /> : null))}
            </Svg>
            <Txt style={{ flex: 1 }}>
              <Txt weight="800">Dein Dankbarkeitsglas. </Txt>Jeder Gedanke wird zu einer Murmel.
            </Txt>
          </Row>
          {grat.map((g, i) => (
            <View key={i}>{input(g, (t) => setGrat(grat.map((x, j) => (j === i ? t : x))), ['Ich bin dankbar für …', 'Und für …', 'Und auch für …'][i], `Dankbar ${i + 1}`, COLS[i])}</View>
          ))}
          <Txt weight="800">Intention des Tages – zieh eine Karte</Txt>
          <Row>
            {cards.map((t, i) => (
              <Pressable key={t} accessibilityRole="button" accessibilityLabel={picked === i ? t : `Karte ${i + 1} ziehen`} onPress={() => { setPicked(i); setIntent(t); }} style={{ flex: 1, minHeight: 84, borderRadius: 16, borderWidth: 2, borderColor: c.primary, backgroundColor: picked === i || intent === t ? c.primary : c.soft, alignItems: 'center', justifyContent: 'center' }}>
                <Txt weight="800" color={picked === i || intent === t ? c.onPrimary : c.primary}>
                  {picked === i || intent === t ? t : '✦'}
                </Txt>
              </Pressable>
            ))}
          </Row>
          {input(great, setGreat, 'Was macht den Tag heute großartig?', 'Was macht den Tag großartig')}
          <Pressable accessibilityRole="button" onPress={() => setAff(AFFIRMATIONS[(AFFIRMATIONS.indexOf(aff) + 1) % AFFIRMATIONS.length])} style={{ minHeight: 56, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: '#0D9488', backgroundColor: c.okBg, padding: 12, justifyContent: 'center' }}>
            <Txt weight="700" center>
              {aff ? `„${aff}“ – nochmal würfeln` : 'Affirmation würfeln'}
            </Txt>
          </Pressable>
        </>
      ) : (
        <>
          <Svg width="100%" height={150} viewBox="0 0 350 150" accessibilityLabel={`Abendhimmel mit ${stars} leuchtenden Sternen`}>
            <Circle cx={300} cy={36} r={20} fill="#FDE68A" />
            <Circle cx={310} cy={30} r={18} fill="#1E1B4B" />
            {[[60, 50], [150, 30], [230, 70]].map(([x, y], i) => (
              <G key={i} transform={`translate(${x} ${y})`}>
                <Path d="M0 -14 L4 -4 L14 -4 L6 3 L9 14 L0 7 L-9 14 L-6 3 L-14 -4 L-4 -4 Z" fill={moments[i] ? '#FDE68A' : '#4C4A7A'} />
              </G>
            ))}
            <Path d="M0 150 Q90 112 180 134 T350 124 V150 Z" fill="#312E81" />
          </Svg>
          <Txt color={fg}>Jeder schöne Moment lässt einen Stern leuchten.</Txt>
          {moments.map((m, i) => (
            <View key={i}>{input(m, (t) => setMoments(moments.map((x, j) => (j === i ? t : x))), ['Ein schöner Moment …', 'Noch einer …', 'Und dieser …'][i], `Schöner Moment ${i + 1}`, '#FDE68A')}</View>
          ))}
          <Txt weight="800" color={fg}>
            Meine gute Tat heute
          </Txt>
          {input(deed, setDeed, 'Auch Kleines zählt', 'Gute Tat')}
          <Txt weight="800" color={fg}>
            Ein Samen für morgen
          </Txt>
          {input(improve, setImprove, 'Das will ich besser machen – ohne Strenge', 'Verbesserung')}
          <Txt size={13} color="#C7C5E8">{`Impuls: ${DAILY_QUESTIONS[new Date().getDate() % DAILY_QUESTIONS.length]}`}</Txt>
        </>
      )}
      {past.length > 0 && (
        <>
          <Txt weight="800" color={fg}>
            Rückblick
          </Txt>
          {past.map((k) => (
            <Txt key={k} size={13} color={morning ? c.muted : '#C7C5E8'}>{`${formatShort(k)}: ${[...(journal[k].morning?.grat ?? []), ...(journal[k].evening?.moments ?? [])].filter(Boolean).slice(0, 3).join(' · ') || '–'}`}</Txt>
          ))}
        </>
      )}
    </Screen>
  );
}
