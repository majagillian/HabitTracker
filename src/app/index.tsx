// Startseite „Heute“: Level, Kapazität, Zyklus, Gewohnheiten, Termine & To-dos, Medikamente
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Badge, Button, Card, Dot, H2, Progress, Row, Txt } from '@/components/ui';
import { PHASE_INFO, predict, typicalPmsSymptoms } from '@/lib/cycle';
import { formatLong, greeting, relativeLabel, today } from '@/lib/date';
import { streak } from '@/lib/habits';
import { horoscopeFor } from '@/lib/horoscope';
import { dayLoad } from '@/lib/load';
import { dosesOn } from '@/lib/meds';
import { levelFromXp, useStore } from '@/store/useStore';
import { categoryColors, priorityColors } from '@/theme/colors';
import { useTheme } from '@/theme/useTheme';

export default function Heute() {
  const { c } = useTheme();
  const router = useRouter();
  const s = useStore();
  const d = today();
  const lvl = levelFromXp(s.game.xp);
  const load = useMemo(() => dayLoad(s, d), [s, d]);
  const cyc = s.settings.modules.zyklus ? predict(s.cycle) : null;
  const habits = s.habits.filter((h) => !h.archived);
  const bestStreak = habits.reduce((m, h) => Math.max(m, streak(h).value), 0);
  const events = s.events.filter((e) => e.date === d).sort((a, b) => (a.start < b.start ? -1 : 1));
  const todos = s.todos.filter((t) => !t.done && t.due && t.due <= d).sort((a, b) => a.priority - b.priority).slice(0, 5);
  const doses = s.settings.modules.medikamente ? dosesOn(s.meds, s.medLog, d) : [];
  const horo = s.settings.modules.sterne ? horoscopeFor(s.astro, d) : null;
  const memory = s.settings.modules.momente && s.moments.length ? s.moments[new Date().getDate() % s.moments.length] : null;
  const capacityBars = Array.from({ length: 10 }, (_, i) => i < Math.round((load.points / load.capacity) * 10));

  return (
    <Screen
      title={`${greeting()}${s.profile.name ? ', ' + s.profile.name : ''}`}
      subtitle={formatLong(d)}
      right={
        <Pressable accessibilityRole="button" accessibilityLabel="Profil öffnen" onPress={() => router.navigate('/einstellungen' as never)} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>
          <Txt weight="800" color="#1F1B2E">
            {(s.profile.name || 'D').charAt(0).toUpperCase()}
          </Txt>
        </Pressable>
      }
    >
      {/* Level & Score */}
      <Card tone="primary" onPress={() => router.navigate('/statistik' as never)} label="Dein Fortschritt">
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt weight="800" size={17} color={c.onPrimary}>{`Level ${lvl.level}`}</Txt>
          <Badge text={bestStreak > 0 ? `${bestStreak}-Tage-Serie` : 'Starte deine Serie'} bg={c.secondary} color="#1F1B2E" />
        </Row>
        <Progress value={(lvl.current / lvl.needed) * 100} label="Fortschritt zum nächsten Level" />
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt size={13} color={c.onPrimary}>{`${lvl.current} / ${lvl.needed} XP`}</Txt>
          <Txt size={13} color={c.onPrimary}>{`Tages-Score ${s.game.score}`}</Txt>
        </Row>
      </Card>

      {/* Kapazität */}
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt weight="800">Deine Kapazität heute</Txt>
          <Badge text={load.label} bg={load.level >= 2 ? c.warnBg : c.okBg} />
        </Row>
        <Row gap={4} style={{ height: 14 }}>
          {capacityBars.map((on, i) => (
            <View key={i} style={{ flex: 1, height: 14, borderRadius: 4, backgroundColor: on ? (load.level >= 3 ? '#F97316' : c.primary) : c.soft }} />
          ))}
        </Row>
        <Txt size={14} muted>{`${String(load.points).replace('.', ',')} von ${load.capacity} Energiepunkten verplant · ${load.events} Termine, ${load.todos} To-dos`}</Txt>
        {load.warning ? (
          <Txt size={13} color={c.danger}>
            {load.warning}
          </Txt>
        ) : null}
        {cyc ? (
          <Pressable accessibilityRole="button" onPress={() => router.navigate('/zyklus' as never)} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: c.soft, borderRadius: 14, padding: 10 }}>
            <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: PHASE_INFO[cyc.phase].color, alignItems: 'center', justifyContent: 'center' }}>
              <Txt weight="800" color="#FFFFFF" size={13}>
                {cyc.cycleDay}
              </Txt>
            </View>
            <View style={{ flex: 1 }}>
              <Txt size={13} weight="800">
                {PHASE_INFO[cyc.phase].name}
                {cyc.pmsActive ? ' · PMS-Tage' : cyc.pmsSoon ? ' · PMS-Alarm ab morgen' : ''}
              </Txt>
              <Txt size={13} muted>
                {cyc.pmsActive || cyc.pmsSoon
                  ? `Typisch für dich: ${typicalPmsSymptoms(s.cycle).join(', ') || 'Stimmungsschwankungen'}. Plane Puffer ein.`
                  : cyc.late > 0
                    ? `Periode ${cyc.late} Tage überfällig.`
                    : `Periode in ca. ${cyc.daysToPeriod} Tagen. ${PHASE_INFO[cyc.phase].tip}`}
              </Txt>
            </View>
          </Pressable>
        ) : null}
      </Card>

      {/* Medikamente */}
      {doses.length > 0 && (
        <>
          <H2 right={<Button small kind="ghost" title="Plan" onPress={() => router.navigate('/medikamente' as never)} />}>Medikamente heute</H2>
          {doses.map((x) => (
            <Pressable
              key={x.key}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: x.status === 'genommen' }}
              accessibilityLabel={`${x.med.name} um ${x.time}`}
              onPress={() => s.logMed(x.key, x.status === 'genommen' ? null : 'genommen')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, padding: 10, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: x.status === 'genommen' ? c.okBg : c.card }}
            >
              <Ionicons name={x.status === 'genommen' ? 'checkmark-circle' : 'ellipse-outline'} size={30} color={c.primary} />
              <View style={{ flex: 1 }}>
                <Txt weight="700">{x.med.name}</Txt>
                <Txt size={12} muted>{`${x.time} · ${x.med.dose}`}</Txt>
              </View>
            </Pressable>
          ))}
        </>
      )}

      {/* Gewohnheiten */}
      {s.settings.modules.habits && (
        <>
          <H2 right={<Button small kind="ghost" title="Alle" onPress={() => router.navigate('/habits' as never)} />}>Gewohnheiten heute</H2>
          {habits.length === 0 ? (
            <Card tone="soft" onPress={() => router.navigate('/habits' as never)} label="Erste Gewohnheit anlegen">
              <Txt weight="700">Lege deine erste Gewohnheit an</Txt>
              <Txt size={13} muted>
                Zum Beispiel „2 Liter Wasser“ oder „10 Minuten draußen“.
              </Txt>
            </Card>
          ) : (
            habits.map((h) => {
              const done = h.log.includes(d);
              return (
                <Pressable
                  key={h.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: done }}
                  accessibilityLabel={h.title}
                  onPress={() => s.toggleHabit(h.id)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 58, padding: 10, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: done ? c.soft : c.card }}
                >
                  <View style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: h.color, backgroundColor: done ? h.color : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                    {done && <Ionicons name="checkmark" size={20} color="#FFFFFF" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt weight="700">{h.title}</Txt>
                    <Txt size={12} muted>{`Serie: ${streak(h).value} ${streak(h).unit}`}</Txt>
                  </View>
                  <Txt size={13} weight="700" color={c.primary}>
                    +15 XP
                  </Txt>
                </Pressable>
              );
            })
          )}
        </>
      )}

      {/* Termine & fällige To-dos */}
      <H2 right={<Button small kind="ghost" title="Kalender" onPress={() => router.navigate('/kalender' as never)} />}>Als Nächstes</H2>
      {events.length === 0 && todos.length === 0 ? <Txt muted>Heute stehen keine Termine oder fälligen Aufgaben an. Zeit für dich.</Txt> : null}
      {events.map((e) => (
        <Row key={e.id} style={{ padding: 12, borderRadius: 16, backgroundColor: c.soft }}>
          <Txt weight="800" style={{ width: 52 }}>
            {e.start}
          </Txt>
          <View style={{ flex: 1 }}>
            <Txt weight="700">{e.title}</Txt>
            <Txt size={12} muted>
              {e.notes || e.category}
            </Txt>
          </View>
          <Dot color={categoryColors[e.category]} />
        </Row>
      ))}
      {todos.map((t) => (
        <Pressable key={t.id} accessibilityRole="checkbox" accessibilityState={{ checked: false }} accessibilityLabel={t.title} onPress={() => s.toggleTodo(t.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, backgroundColor: c.soft }}>
          <Ionicons name="square-outline" size={24} color={priorityColors[t.priority]} />
          <View style={{ flex: 1 }}>
            <Txt weight="700">{t.title}</Txt>
            <Txt size={12} muted>{`${t.area} · ${relativeLabel(t.due!)}`}</Txt>
          </View>
        </Pressable>
      ))}

      {horo && (
        <Card onPress={() => router.navigate('/sterne' as never)} label="Horoskop öffnen" style={{ backgroundColor: '#1E1B4B', borderColor: '#1E1B4B' }}>
          <Txt weight="800" color="#FDE68A">{`Sterne heute · ${horo.headline}`}</Txt>
          <Txt size={13} color="#FFFFFF" numberOfLines={3}>
            {horo.main}
          </Txt>
        </Card>
      )}

      {memory && (
        <Card tone="warn" onPress={() => router.navigate('/momente' as never)} label="Erinnerung öffnen">
          <Txt size={12} weight="700" muted>
            Aus deinem Marmeladenglas
          </Txt>
          <Txt weight="800">{memory.title}</Txt>
          <Txt size={13} muted numberOfLines={2}>
            {memory.text}
          </Txt>
        </Card>
      )}

      {s.settings.modules.checkin && <Button kind="mint" title="Wie geht es dir? Check-in starten" icon="happy-outline" onPress={() => router.navigate('/checkin' as never)} />}
    </Screen>
  );
}
