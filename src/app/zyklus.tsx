// Zyklus: Tracken oder Kinderwunsch, Prognosen, PMS-Alarm, Beschwerden, Verhütung & Pillenpause
import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { DateField, TimeField } from '@/components/Inputs';
import { Screen } from '@/components/Screen';
import { Badge, Button, Card, Chip, Empty, Field, IconButton, Note, Row, Segmented, Sheet, Stepper, ToggleRow, Txt } from '@/components/ui';
import { cycleStats, isPillBreak, PHASE_INFO, pmsDays, predict, pregnancyHint, SYMPTOMS, typicalPmsSymptoms } from '@/lib/cycle';
import { diffDays, formatShort, today } from '@/lib/date';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme/useTheme';
import type { Contraception } from '@/types';

const CONTRA: { v: Contraception; l: string; hormonal: boolean }[] = [
  { v: 'keine', l: 'Keine', hormonal: false },
  { v: 'pille', l: 'Pille', hormonal: true },
  { v: 'minipille', l: 'Minipille', hormonal: true },
  { v: 'hormonspirale', l: 'Hormonspirale', hormonal: true },
  { v: 'ring', l: 'Vaginalring', hormonal: true },
  { v: 'pflaster', l: 'Pflaster', hormonal: true },
  { v: 'kupferspirale', l: 'Kupferspirale', hormonal: false },
  { v: 'kondom', l: 'Kondom', hormonal: false },
  { v: 'andere', l: 'Andere', hormonal: false },
];

export default function Zyklus() {
  const { c } = useTheme();
  const s = useStore();
  const cyc = s.cycle;
  const [settings, setSettings] = useState(false);
  const [logDate, setLogDate] = useState(today());
  const [startDate, setStartDate] = useState<string | undefined>(today());
  const p = predict(cyc);
  const stats = cycleStats(cyc);
  const wish = s.settings.cycleMode === 'kinderwunsch';
  const log = cyc.logs[logDate] ?? { symptoms: [] };
  const hint = pregnancyHint(cyc);
  const pms = typicalPmsSymptoms(cyc);
  const hormonal = CONTRA.find((x) => x.v === cyc.contraception)?.hormonal;
  const lastPeriod = cyc.periods.at(-1);
  const inPeriod = lastPeriod && !lastPeriod.end && diffDays(today(), lastPeriod.start) < 12;

  const toggleSym = (sym: string) => s.logDay(logDate, { symptoms: log.symptoms.includes(sym) ? log.symptoms.filter((x) => x !== sym) : [...log.symptoms, sym] });

  if (!cyc.periods.length) {
    return (
      <Screen title="Zyklus">
        <Empty icon="water-outline" title="Lass uns starten" text="Wann hat deine letzte Periode begonnen? Daraus berechnet die App deine Prognosen." />
        <DateField label="Beginn der letzten Periode" value={startDate} onChange={setStartDate} quick={false} />
        <Stepper label="Periode dauert im Schnitt" value={cyc.avgPeriodLen} onChange={(avgPeriodLen) => s.setCycle({ avgPeriodLen })} min={2} max={10} suffix=" Tage" />
        <Stepper label="Zyklus dauert im Schnitt" value={cyc.avgCycleLen} onChange={(avgCycleLen) => s.setCycle({ avgCycleLen })} min={20} max={45} suffix=" Tage" />
        <Button title="Speichern" disabled={!startDate} onPress={() => startDate && (s.startPeriod(startDate), s.setCycle({ setupDone: true }))} />
        <Note>Alle Angaben sind Schätzungen aus deinen Daten. Sie sind keine Verhütungsmethode und ersetzen keine ärztliche Beratung oder einen Schwangerschaftstest.</Note>
      </Screen>
    );
  }

  // Ring: Anteil der Phasen am Zyklus
  const L = stats.avgCycle;
  const R = 48, CIRC = 2 * Math.PI * R;
  const seg = (from: number, len: number) => ({ strokeDasharray: `${(len / L) * CIRC} ${CIRC}`, strokeDashoffset: -((from / L) * CIRC) });
  const ovDay = L - 14;

  return (
    <Screen title="Zyklus" right={<IconButton icon="settings-outline" label="Zyklus-Einstellungen" onPress={() => setSettings(true)} />}>
      <Segmented value={s.settings.cycleMode} onChange={(v) => s.setSettings({ cycleMode: v })} options={[{ value: 'tracken', label: 'Zyklus tracken' }, { value: 'kinderwunsch', label: 'Kinderwunsch' }]} />
      {p && (
        <Row style={{ alignItems: 'center' }}>
          <Svg width={150} height={150} viewBox="0 0 120 120" accessibilityLabel={`Zyklustag ${p.cycleDay} von etwa ${L}, ${PHASE_INFO[p.phase].name}`}>
            <Circle cx={60} cy={60} r={R} stroke={c.soft} strokeWidth={14} fill="none" />
            <Circle cx={60} cy={60} r={R} stroke="#E11D48" strokeWidth={14} fill="none" transform="rotate(-90 60 60)" {...seg(0, stats.avgPeriod)} />
            <Circle cx={60} cy={60} r={R} stroke="#0D9488" strokeWidth={14} fill="none" transform="rotate(-90 60 60)" {...seg(ovDay - 5, 7)} />
            <Circle cx={60} cy={60} r={R} stroke="#A78BFA" strokeWidth={14} fill="none" transform="rotate(-90 60 60)" {...seg(ovDay + 2, L - ovDay - 2)} />
            <Circle cx={60 + R * Math.sin(((p.cycleDay - 0.5) / L) * 2 * Math.PI)} cy={60 - R * Math.cos(((p.cycleDay - 0.5) / L) * 2 * Math.PI)} r={8} fill={c.text} stroke={c.bg} strokeWidth={3} />
            <SvgText x={60} y={58} textAnchor="middle" fontSize={20} fontWeight="800" fill={c.text}>{`Tag ${p.cycleDay}`}</SvgText>
            <SvgText x={60} y={74} textAnchor="middle" fontSize={9} fill={c.muted}>{`von ca. ${L}`}</SvgText>
          </Svg>
          <View style={{ flex: 1, gap: 6 }}>
            <Txt weight="800" size={18}>
              {PHASE_INFO[p.phase].name}
            </Txt>
            <Txt size={13} muted>
              {`${PHASE_INFO[p.phase].energy}. ${PHASE_INFO[p.phase].tip}`}
            </Txt>
            {wish ? (
              <Badge text={p.late > 0 ? `${p.late} Tage überfällig – Test möglich` : `Fruchtbar: ${formatShort(p.fertileStart)}–${formatShort(p.fertileEnd)}`} bg={c.okBg} />
            ) : (
              <Badge text={p.late > 0 ? `Periode ${p.late} Tage überfällig` : `Periode in ca. ${p.daysToPeriod} Tagen (${formatShort(p.nextPeriod)})`} bg="#FDE7EC" color="#1F1B2E" />
            )}
          </View>
        </Row>
      )}

      {p && (p.pmsActive || p.pmsSoon || diffDays(p.pmsStart, today()) <= 3) && p.late === 0 && (
        <Card tone="warn" style={{ borderWidth: 2, borderColor: '#FB923C' }}>
          <Txt weight="800">{p.pmsActive ? 'PMS-Tage: sei sanft mit dir' : `PMS-Alarm: ab ${p.pmsSoon ? 'morgen' : formatShort(p.pmsStart)}`}</Txt>
          <Txt size={14}>
            {`In deinen letzten Zyklen begannen Beschwerden etwa ${pmsDays(cyc)} Tage vor der Periode${pms.length ? ` – typisch für dich: ${pms.join(', ')}` : ''}. Plane Puffer ein, iss regelmäßig, gönn dir Wärme und früh Schlaf.`}
          </Txt>
        </Card>
      )}

      {hint.level !== 'keiner' && (
        <Card tone={hint.level === 'test' ? 'warn' : 'soft'}>
          <Txt weight="800">{wish ? 'Kinderwunsch' : 'Hinweis'}</Txt>
          <Txt size={14}>{hint.text}</Txt>
        </Card>
      )}

      <Row gap={8}>
        {[
          ['Ø Zyklus', `${stats.avgCycle} Tage`],
          ['Ø Periode', `${stats.avgPeriod} Tage`],
          ['Eisprung', p ? `ca. ${formatShort(p.ovulation)}` : '–'],
        ].map(([a, b]) => (
          <Card key={a} tone="soft" style={{ flex: 1, padding: 10, gap: 2 }}>
            <Txt size={12} muted>
              {a}
            </Txt>
            <Txt weight="800">{b}</Txt>
          </Card>
        ))}
      </Row>
      <Txt size={12} muted>
        {stats.basedOn ? `Automatisch berechnet aus ${stats.basedOn} Zyklen${stats.variability > 7 ? ` · Schwankung ${stats.variability} Tage – Prognosen sind unsicherer` : ''}.` : 'Noch basierend auf deinen Angaben – mit jedem Zyklus wird es genauer.'}
      </Txt>

      {inPeriod ? <Button title="Periode ist vorbei" kind="secondary" onPress={() => s.endPeriod(today())} /> : <Button title="Periode hat heute begonnen" kind="danger" icon="water" onPress={() => s.startPeriod(today())} />}

      <Txt weight="800" size={17}>
        Eintragen
      </Txt>
      <DateField label="Für welchen Tag?" value={logDate} onChange={(d) => d && setLogDate(d)} />
      <Txt weight="700">Blutung</Txt>
      <Row wrap gap={6}>
        {(['Keine', 'Schmierblutung', 'Leicht', 'Mittel', 'Stark'] as const).map((l, i) => {
          const v = i === 0 ? undefined : ((i - 1) as 0 | 1 | 2 | 3);
          return <Chip key={l} label={l} color="#E11D48" selected={log.flow === v} onPress={() => s.logDay(logDate, { flow: v })} />;
        })}
      </Row>
      <Txt weight="700">Beschwerden & Befinden</Txt>
      <Row wrap gap={6}>
        {SYMPTOMS.map((x) => (
          <Chip key={x} label={x} color="#E11D48" selected={log.symptoms.includes(x)} onPress={() => toggleSym(x)} />
        ))}
      </Row>
      <Txt weight="700">Geschlechtsverkehr</Txt>
      <Segmented
        value={log.sex ?? 'nein'}
        onChange={(v) => s.logDay(logDate, { sex: v === 'nein' ? undefined : (v as 'verhuetet' | 'unverhuetet') })}
        options={[{ value: 'nein', label: 'Keiner' }, { value: 'verhuetet', label: 'Verhütet' }, { value: 'unverhuetet', label: 'Unverhütet' }]}
      />
      {wish && (
        <>
          <Txt weight="700">Schwangerschaftstest</Txt>
          <Segmented value={log.test ?? 'kein'} onChange={(v) => s.logDay(logDate, { test: v === 'kein' ? undefined : (v as 'positiv' | 'negativ') })} options={[{ value: 'kein', label: 'Kein Test' }, { value: 'negativ', label: 'Negativ' }, { value: 'positiv', label: 'Positiv' }]} />
          <Field label="Basaltemperatur (°C, optional)" keyboardType="decimal-pad" value={log.temp ? String(log.temp).replace('.', ',') : ''} onChangeText={(t) => s.logDay(logDate, { temp: parseFloat(t.replace(',', '.')) || undefined })} placeholder="36,5" />
        </>
      )}
      {['pille', 'minipille'].includes(cyc.contraception) && (
        <ToggleRow title={isPillBreak(cyc, logDate) ? 'Pillenpause (heute keine Pille)' : 'Pille genommen'} desc={`Pillenwecker ${String(cyc.pillHour).padStart(2, '0')}:${String(cyc.pillMinute).padStart(2, '0')}`} value={!!log.pillTaken} onChange={(pillTaken) => s.logDay(logDate, { pillTaken })} />
      )}

      <Txt weight="800" size={17}>
        Verlauf
      </Txt>
      {[...cyc.periods].reverse().slice(0, 6).map((per, i, arr) => {
        const next = i > 0 ? arr[i - 1] : null;
        return (
          <Row key={per.start} style={{ justifyContent: 'space-between', minHeight: 36 }}>
            <Txt>{`${formatShort(per.start)}${per.end ? ' – ' + formatShort(per.end) : ''}`}</Txt>
            <Txt muted size={13}>{[per.end ? `${diffDays(per.end, per.start) + 1} Tage Periode` : null, next ? `Zyklus ${diffDays(next.start, per.start)} Tage` : 'aktuell'].filter(Boolean).join(' · ')}</Txt>
          </Row>
        );
      })}
      <Note>Alle Angaben sind Schätzungen aus deinen Daten. Sie sind keine Verhütungsmethode und ersetzen keine ärztliche Beratung oder einen Schwangerschaftstest.{hormonal ? ' Bei hormoneller Verhütung findet kein natürlicher Eisprung statt – die Phasen sind dann nur eine Orientierung.' : ''}</Note>

      <Sheet visible={settings} onClose={() => setSettings(false)} title="Zyklus-Einstellungen" footer={<Button title="Fertig" onPress={() => setSettings(false)} />}>
        <Stepper label="Periode (Startwert)" value={cyc.avgPeriodLen} onChange={(avgPeriodLen) => s.setCycle({ avgPeriodLen })} min={2} max={10} suffix=" T." />
        <Stepper label="Zyklus (Startwert)" value={cyc.avgCycleLen} onChange={(avgCycleLen) => s.setCycle({ avgCycleLen })} min={20} max={45} suffix=" T." />
        <Txt weight="700">Verhütungsmethode</Txt>
        <Row wrap gap={6}>
          {CONTRA.map((x) => (
            <Chip key={x.v} label={x.l} selected={cyc.contraception === x.v} onPress={() => s.setCycle({ contraception: x.v })} />
          ))}
        </Row>
        {hormonal && (
          <>
            <ToggleRow title="Ich mache eine Pause (z. B. 21+7)" value={cyc.hormonalBreak.enabled} onChange={(enabled) => s.setCycle({ hormonalBreak: { ...cyc.hormonalBreak, enabled } })} />
            {cyc.hormonalBreak.enabled && (
              <>
                <Stepper label="Pausentage" value={cyc.hormonalBreak.days} onChange={(days) => s.setCycle({ hormonalBreak: { ...cyc.hormonalBreak, days } })} min={1} max={7} />
                <DateField label="Beginn der letzten Pause" value={cyc.hormonalBreak.startDate} onChange={(startDate) => s.setCycle({ hormonalBreak: { ...cyc.hormonalBreak, startDate } })} quick={false} optional />
              </>
            )}
          </>
        )}
        {['pille', 'minipille'].includes(cyc.contraception) && (
          <>
            <TimeField
              label="Pillenwecker um"
              value={`${String(cyc.pillHour).padStart(2, '0')}:${String(cyc.pillMinute).padStart(2, '0')}`}
              onChange={(t) => {
                const [h, m] = t.split(':').map(Number);
                s.setCycle({ pillHour: h, pillMinute: m });
              }}
            />
            <ToggleRow title="Pillenwecker aktiv" value={s.settings.notifications.pille.on} onChange={(on) => s.setNotif('pille', { on })} />
          </>
        )}
        <ToggleRow title="PMS-Alarm" desc="Einen Tag bevor deine typischen PMS-Tage beginnen" value={s.settings.notifications.pms.on} onChange={(on) => s.setNotif('pms', { on })} />
        <ToggleRow title="Nächste Periode" desc="2 Tage vorher" value={s.settings.notifications.periode.on} onChange={(on) => s.setNotif('periode', { on })} />
        <ToggleRow title={wish ? 'Fruchtbare Tage' : 'Eisprung'} value={s.settings.notifications.eisprung.on} onChange={(on) => s.setNotif('eisprung', { on })} />
        <ToggleRow title="Stimmung & Beschwerden im Zyklus" value={s.settings.notifications.zyklusHinweise.on} onChange={(on) => s.setNotif('zyklusHinweise', { on })} />
      </Sheet>
    </Screen>
  );
}
