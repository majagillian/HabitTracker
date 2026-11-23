// Dashboard & Analyse: alle aktiven Bereiche konsolidiert + gegenseitige Einflüsse
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { HBar, PairBars } from '@/components/Charts';
import { Screen } from '@/components/Screen';
import { Badge, Card, Note, Progress, Row, Segmented, Txt } from '@/components/ui';
import { cycleStats, PHASE_INFO, predict } from '@/lib/cycle';
import { addDays, formatShort, today, WEEKDAYS_SHORT, weekday } from '@/lib/date';
import { completionRate } from '@/lib/habits';
import { areaBalance, buildInsights, wellbeingSeries } from '@/lib/insights';
import { adherence } from '@/lib/meds';
import { formatMinutes } from '@/lib/screenTime';
import { levelFromXp, useStore } from '@/store/useStore';
import { useTheme } from '@/theme/useTheme';

export default function Statistik() {
  const { c } = useTheme();
  const s = useStore();
  const [range, setRange] = useState<7 | 28>(7);
  const series = useMemo(() => wellbeingSeries(s, range), [s, range]);
  const insights = useMemo(() => buildInsights(s), [s]);
  const areas = useMemo(() => areaBalance(s), [s]);
  const lvl = levelFromXp(s.game.xp);
  const M = s.settings.modules;
  const from = addDays(today(), -(range - 1));
  const chart = range === 7
    ? series.map((x) => ({ label: WEEKDAYS_SHORT[weekday(x.date) - 1], a: x.wellbeing, b: x.load }))
    : [0, 1, 2, 3].map((w) => {
        const part = series.slice(w * 7, w * 7 + 7);
        const wb = part.filter((x) => x.wellbeing !== null);
        return { label: `KW −${3 - w}`, a: wb.length ? Math.round(wb.reduce((a, b) => a + (b.wellbeing ?? 0), 0) / wb.length) : null, b: Math.round(part.reduce((a, b) => a + b.load, 0) / part.length) };
      });
  const habits = s.habits.filter((h) => !h.archived);
  const sessions = s.sessions.filter((x) => x.date >= from);
  const foods = s.foods.filter((f) => f.date >= from);
  const foodDays = new Set(foods.map((f) => f.date)).size;
  const st = Object.entries(s.screenTime).filter(([d]) => d >= from).map(([, v]) => v);
  const cyc = M.zyklus ? predict(s.cycle) : null;
  const scoreDays = Array.from({ length: 7 }, (_, i) => addDays(today(), i - 6));

  return (
    <Screen title="Dein Überblick" right={<Segmented value={range} onChange={setRange} options={[{ value: 7, label: 'Woche' }, { value: 28, label: 'Monat' }]} />}>
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt weight="800">Wohlbefinden & Auslastung</Txt>
          <Txt size={12} muted>{`${formatShort(from)} – ${formatShort(today())}`}</Txt>
        </Row>
        <PairBars data={chart} aLabel="Wohlbefinden (Check-ins)" bLabel="Auslastung" />
      </Card>

      <Txt weight="800" size={17}>
        Was zusammenhängt
      </Txt>
      {insights.map((i) => (
        <Card key={i.title} tone={i.tone === 'gut' ? 'ok' : i.tone === 'achtung' ? 'warn' : 'soft'}>
          <Txt weight="800">{i.title}</Txt>
          <Txt size={14}>{i.text}</Txt>
        </Card>
      ))}

      <Card>
        <Txt weight="800">Lebensbereiche im Gleichgewicht (14 Tage)</Txt>
        {areas.map((a) => (
          <HBar key={a.name} label={a.name} value={a.value} color={a.color} />
        ))}
        <Txt size={12} muted>{`Dir tut gut: ${s.profile.goodFor.join(', ') || '–'}`}</Txt>
      </Card>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {[
          M.habits && habits.length ? { t: 'Gewohnheiten', v: `${Math.round((habits.reduce((a, h) => a + completionRate(h, range), 0) / habits.length) * 100)} %`, d: 'Erfüllung' } : null,
          M.fitness ? { t: 'Bewegung', v: `${sessions.reduce((a, b) => a + b.minutes, 0)} Min.`, d: `${sessions.length} Einheiten` } : null,
          M.checkin ? { t: 'Check-ins', v: String(s.checkins.filter((x) => x.date >= from).length), d: 'im Zeitraum' } : null,
          M.ernaehrung && foodDays ? { t: 'Ernährung', v: `${Math.round(foods.reduce((a, b) => a + b.kcal, 0) / foodDays)} kcal`, d: 'Ø pro Tag' } : null,
          M.bildschirmzeit && st.length ? { t: 'Bildschirmzeit', v: formatMinutes(Math.round(st.reduce((a, b) => a + b, 0) / st.length)), d: 'Ø pro Tag' } : null,
          M.medikamente && adherence(s.meds, s.medLog, range) !== null ? { t: 'Medikamente', v: `${adherence(s.meds, s.medLog, range)} %`, d: 'Einnahmetreue' } : null,
          M.todos ? { t: 'To-dos', v: String(s.todos.filter((t) => t.done && t.doneAt && t.doneAt.slice(0, 10) >= from).length), d: 'erledigt' } : null,
          M.momente ? { t: 'Marmeladenglas', v: String(s.moments.length), d: 'Momente' } : null,
        ]
          .filter((x): x is { t: string; v: string; d: string } => !!x)
          .map((x) => (
            <Card key={x.t} tone="soft" style={{ width: '48%', gap: 2 }}>
              <Txt size={12} muted>
                {x.t}
              </Txt>
              <Txt weight="800" size={20}>
                {x.v}
              </Txt>
              <Txt size={12} muted>
                {x.d}
              </Txt>
            </Card>
          ))}
      </View>

      {cyc && (
        <Card>
          <Txt weight="800">{`Zyklus · ${PHASE_INFO[cyc.phase].name}`}</Txt>
          <Txt size={14}>{`Ø Zyklus ${cycleStats(s.cycle).avgCycle} Tage · Ø Periode ${cycleStats(s.cycle).avgPeriod} Tage · nächste Periode ${formatShort(cyc.nextPeriod)}`}</Txt>
        </Card>
      )}

      <Card tone="primary">
        <Txt weight="800" color={c.onPrimary}>{`Level ${lvl.level} · ${s.game.xp} XP`}</Txt>
        <Progress value={(lvl.current / lvl.needed) * 100} label="Fortschritt zum nächsten Level" />
        <Txt size={13} color={c.onPrimary}>{`Tages-Score ${s.game.score}/100 – steigt mit jeder Aktivität und sinkt langsam, wenn du die App mehrere Tage nicht öffnest.`}</Txt>
        <Row gap={4} style={{ alignItems: 'flex-end', height: 44 }}>
          {scoreDays.map((d) => (
            <View key={d} accessible accessibilityLabel={`${formatShort(d)}: Score ${s.game.scoreHistory[d] ?? 'keiner'}`} style={{ flex: 1, height: `${Math.max(6, s.game.scoreHistory[d] ?? 0)}%`, backgroundColor: c.secondary, borderRadius: 4 }} />
          ))}
        </Row>
      </Card>
      {s.game.badges.length > 0 && (
        <>
          <Txt weight="800" size={17}>
            Abzeichen
          </Txt>
          <Row wrap gap={6}>
            {s.game.badges.map((b) => (
              <Badge key={b} text={`★ ${b}`} bg={c.warnBg} />
            ))}
          </Row>
        </>
      )}
      <Note>Zusammenhänge werden aus deinen eigenen Daten berechnet (Vergleich von Durchschnittswerten, mindestens 3 Tage je Gruppe). Sie zeigen Muster, keine Ursachen.</Note>
    </Screen>
  );
}
