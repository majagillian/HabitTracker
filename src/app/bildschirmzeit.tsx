// Bildschirmzeit: automatische Messung (Android), Top-Apps, Limit mit Warnung, Verlauf
import React, { useCallback, useEffect, useState } from 'react';
import { AppState as RNAppState, View } from 'react-native';
import { HBar } from '@/components/Charts';
import { Screen } from '@/components/Screen';
import { Button, Card, Note, Progress, Row, Stepper, ToggleRow, Txt } from '@/components/ui';
import { addDays, formatShort, today } from '@/lib/date';
import { formatMinutes, hasScreenTimePermission, openScreenTimeSettings, screenTimeSupported, usageForDay } from '@/lib/screenTime';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/theme/useTheme';
import type { AppUsage } from '../../modules/screen-time/src/ExpoScreenTime.types';

export default function Bildschirmzeit() {
  const { c } = useTheme();
  const s = useStore();
  const [perm, setPerm] = useState(hasScreenTimePermission());
  const [apps, setApps] = useState<AppUsage[]>([]);
  const supported = screenTimeSupported();
  const minutes = s.screenTime[today()] ?? 0;
  const limit = s.settings.screenTimeLimitMin;

  const refresh = useCallback(async () => {
    const p = hasScreenTimePermission();
    setPerm(p);
    if (!p) return;
    const u = await usageForDay();
    setApps(u.apps.slice(0, 8));
    s.setScreenTime(today(), u.totalMin);
    // Vortage nachtragen
    for (let i = 1; i <= 6; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const r = await usageForDay(d);
      s.setScreenTime(addDays(today(), -i), r.totalMin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refresh();
    const sub = RNAppState.addEventListener('change', (st) => st === 'active' && refresh());
    return () => sub.remove();
  }, [refresh]);

  return (
    <Screen title="Bildschirmzeit">
      {!supported && (
        <Card tone="warn">
          <Txt weight="800">Automatische Messung nicht verfügbar</Txt>
          <Txt size={14}>Die Messung funktioniert in der installierten Android-App (Development Build oder Store-Version). In Expo Go, im Browser und auf iOS kannst du die Zeit manuell eintragen.</Txt>
        </Card>
      )}
      {supported && !perm && (
        <Card tone="soft">
          <Txt weight="800">Zugriff erlauben</Txt>
          <Txt size={14}>Damit die App deine Bildschirmzeit messen kann, aktiviere „Nutzungsdatenzugriff“ für „Dein Tag“. Die Daten bleiben auf deinem Gerät.</Txt>
          <Button title="Einstellungen öffnen" onPress={openScreenTimeSettings} />
        </Card>
      )}
      <Card tone={minutes > limit ? 'warn' : undefined}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt weight="800">Heute</Txt>
          <Txt weight="800" size={22} color={minutes > limit ? c.danger : c.text}>
            {formatMinutes(minutes)}
          </Txt>
        </Row>
        <Progress value={(minutes / limit) * 100} color={minutes > limit ? '#F97316' : c.primary} label="Anteil am Tageslimit" />
        <Txt size={13} muted>{minutes > limit ? `${formatMinutes(minutes - limit)} über deinem Limit. Wie wäre eine Pause ohne Handy?` : `Noch ${formatMinutes(limit - minutes)} bis zu deinem Limit.`}</Txt>
      </Card>
      {!perm && (
        <Stepper label="Manuell eintragen (Min.)" value={minutes} onChange={(v) => s.setScreenTime(today(), v)} min={0} max={1440} step={15} />
      )}
      {apps.length > 0 && (
        <>
          <Txt weight="800" size={17}>
            Meistgenutzte Apps heute
          </Txt>
          {apps.map((a) => (
            <HBar key={a.packageName} label={a.appName} value={Math.round(a.totalMs / 60000)} max={Math.max(60, Math.round(apps[0].totalMs / 60000))} color={c.primary} suffix=" min" />
          ))}
        </>
      )}
      <Txt weight="800" size={17}>
        Letzte 7 Tage
      </Txt>
      {Array.from({ length: 7 }, (_, i) => addDays(today(), i - 6)).map((d) => (
        <HBar key={d} label={formatShort(d)} value={s.screenTime[d] ?? 0} max={Math.max(limit * 1.5, 60)} color={(s.screenTime[d] ?? 0) > limit ? '#F97316' : c.secondary} suffix=" min" />
      ))}
      <View style={{ gap: 6 }}>
        <Stepper label="Tageslimit" value={limit} onChange={(screenTimeLimitMin) => s.setSettings({ screenTimeLimitMin })} min={15} max={720} step={15} suffix=" min" />
        <ToggleRow title="Warnen bei Überschreitung" value={s.settings.notifications.bildschirmzeit.on} onChange={(on) => s.setNotif('bildschirmzeit', { on })} />
      </View>
      <Note>Gemessen wird die Zeit, in der Apps im Vordergrund waren. Die App prüft alle 15 Minuten, solange sie geöffnet ist oder im Hintergrund läuft.</Note>
    </Screen>
  );
}
