// Sterne: Horoskop aus echten Planetenständen, Geburtshoroskop, Tarot-Legungen und Abgleich mit deinen Daten
import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { DateField, TimeField } from '@/components/Inputs';
import { Screen } from '@/components/Screen';
import { Badge, Button, Card, Chip, Field, Row, Segmented, Sheet, Txt } from '@/components/ui';
import { CITIES, SIGN_SYMBOLS, SIGNS } from '@/lib/astro';
import { astroMatch } from '@/lib/astroInsights';
import { formatShort, today } from '@/lib/date';
import { horoscopeFor, natalFromProfile } from '@/lib/horoscope';
import { DECK, drawCards, interpret, SPREADS } from '@/data/tarot';
import { useStore } from '@/store/useStore';

const NIGHT = '#1E1B4B';
const GOLD = '#FDE68A';
const glass = { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'transparent' };
const stars = (n: number) => '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);

export default function Sterne() {
  const s = useStore();
  const [tab, setTab] = useState<'horoskop' | 'tarot' | 'abgleich'>('horoskop');
  const [setup, setSetup] = useState(false);
  const [spread, setSpread] = useState(SPREADS[1]);
  const [question, setQuestion] = useState('');
  const [cards, setCards] = useState<{ card: number; reversed: boolean }[] | null>(null);
  const [open, setOpen] = useState<number[]>([]);
  const natal = natalFromProfile(s.astro);
  const horo = useMemo(() => horoscopeFor(s.astro, today()), [s.astro]);
  const match = useMemo(() => (tab === 'abgleich' ? astroMatch(s) : null), [tab, s]);
  const signChip = (label: string, key: 'sun' | 'moon' | 'asc') => (
    <View style={{ gap: 6 }}>
      <Txt weight="700" color="#FFFFFF">{label}</Txt>
      <Row wrap gap={6}>
        <Chip label="Berechnen" selected={!s.astro.manual?.[key]} color={GOLD} onPress={() => s.setAstro({ manual: { ...s.astro.manual, [key]: undefined } })} />
        {SIGNS.map((z, i) => (
          <Chip key={z} label={`${SIGN_SYMBOLS[i]} ${z}`} selected={s.astro.manual?.[key] === z} color={GOLD} onPress={() => s.setAstro({ manual: { ...s.astro.manual, [key]: z } })} />
        ))}
      </Row>
    </View>
  );

  const lay = () => {
    setCards(drawCards(spread.positions.length));
    setOpen([]);
  };
  const reveal = (i: number) => {
    const next = [...open, i];
    setOpen(next);
    if (cards && next.length === cards.length) s.addTarot({ date: today(), spread: spread.name, question, cards });
  };

  return (
    <Screen title="Sterne" subtitle="Horoskop & Tarot" bg={NIGHT} fg="#FFFFFF">
      <Segmented value={tab} onChange={setTab} options={[{ value: 'horoskop', label: 'Horoskop' }, { value: 'tarot', label: 'Tarot' }, { value: 'abgleich', label: 'Abgleich' }]} />

      {tab === 'horoskop' && !natal && (
        <Card style={glass}>
          <Txt weight="800" color="#FFFFFF" size={17}>Dein Geburtshoroskop</Txt>
          <Txt color="#E2E8F0">Mit Geburtsdatum, -zeit und -ort berechne ich Sternzeichen, Mondzeichen und Aszendent. Ohne Uhrzeit fehlt der Aszendent.</Txt>
          <Button title="Geburtsdaten eingeben" kind="mint" onPress={() => setSetup(true)} />
        </Card>
      )}

      {tab === 'horoskop' && natal && horo && (
        <>
          <Row gap={8}>
            {[['Sonne', natal.sunSign], ['Mond', natal.moonSign], ['Aszendent', natal.ascSign]].map(([l, z]) => (
              <Card key={l} style={[glass, { flex: 1, alignItems: 'center', padding: 10, gap: 2 }]}>
                <Txt size={22} color="#FFFFFF">{z ? SIGN_SYMBOLS[SIGNS.indexOf(z as (typeof SIGNS)[number])] : '?'}</Txt>
                <Txt size={11} color="#CBD5E1">{l}</Txt>
                <Txt weight="800" color="#FFFFFF">{z ?? 'Uhrzeit fehlt'}</Txt>
              </Card>
            ))}
          </Row>
          <Card style={{ backgroundColor: '#312E81', borderColor: 'transparent' }}>
            <Txt weight="800" color="#FFFFFF">{`Himmel heute · ${horo.headline}`}</Txt>
            <Txt size={13} color="#E2E8F0">
              {horo.sky.map((p) => `${p.planet} ${p.deg}° ${p.sign}${p.retro ? ' (rückläufig)' : ''}`).join(' · ')}
            </Txt>
            <Txt size={12} color="#CBD5E1">{`Mond zu ${Math.round(horo.phase.illumination * 100)} % beleuchtet · Positionen werden auf deinem Gerät berechnet`}</Txt>
          </Card>
          <Card style={glass}>
            <Txt color="#FFFFFF" size={15}>{horo.main}</Txt>
          </Card>
          {horo.areas.map((a) => (
            <Card key={a.key} style={glass}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Txt weight="800" color="#FFFFFF">{a.title}</Txt>
                <Txt color={GOLD} accessibilityLabel={`${a.score} von 5 Sternen`}>{stars(a.score)}</Txt>
              </Row>
              <Txt color="#E2E8F0" size={14}>{a.text}</Txt>
            </Card>
          ))}
          <Button title="Geburtsdaten bearbeiten" kind="secondary" onPress={() => setSetup(true)} />
        </>
      )}

      {tab === 'tarot' && (
        <>
          <Row wrap gap={6}>
            {SPREADS.map((sp) => (
              <Chip key={sp.id} label={sp.name} color={GOLD} selected={spread.id === sp.id} onPress={() => { setSpread(sp); setCards(null); }} />
            ))}
          </Row>
          <Txt color="#E2E8F0">{spread.description}</Txt>
          <Field labelColor="#FFFFFF" label="Deine Frage (optional)" value={question} onChangeText={setQuestion} placeholder="z. B. Worauf darf ich diese Woche achten?" />
          <Button title={cards ? 'Neu mischen & legen' : 'Karten mischen & legen'} kind="mint" icon="shuffle" onPress={lay} />
          {cards && (
            <>
              <Txt color="#E2E8F0">Denk an deine Frage und decke die Karten nacheinander auf.</Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                {cards.map((cd, i) => {
                  const card = DECK[cd.card];
                  const shown = open.includes(i);
                  return (
                    <View key={i} style={{ alignItems: 'center', gap: 4, width: 96 }}>
                      <Pressable accessibilityRole="button" accessibilityLabel={shown ? `${card.name}${cd.reversed ? ', umgekehrt' : ''}` : `Karte für ${spread.positions[i]} aufdecken`} onPress={() => !shown && reveal(i)} style={{ width: 92, height: 150, borderRadius: 14, borderWidth: 2, borderColor: GOLD, backgroundColor: shown ? '#FFFBEB' : '#4C1D95', alignItems: 'center', justifyContent: 'space-between', padding: 8 }}>
                        <Txt weight="800" size={12} color="#1E1B4B">{shown ? card.numeral : ''}</Txt>
                        <Txt size={30} color={shown ? (card.suit === 'Kelche' || card.suit === 'Münzen' ? '#B91C1C' : '#4C1D95') : GOLD} style={{ transform: [{ rotate: shown && cd.reversed ? '180deg' : '0deg' }] }}>
                          {shown ? card.symbol : '✦'}
                        </Txt>
                        <Txt weight="800" size={11} center color="#1E1B4B">{shown ? card.name : ''}</Txt>
                      </Pressable>
                      <Txt size={11} color="#CBD5E1" center>{spread.positions[i]}</Txt>
                    </View>
                  );
                })}
              </View>
              {open.map((i) => {
                const cd = cards[i];
                const card = DECK[cd.card];
                return (
                  <Card key={i} style={glass}>
                    <Txt weight="800" color="#FFFFFF">{`${spread.positions[i]} · ${card.name}${cd.reversed ? ' (umgekehrt)' : ''}`}</Txt>
                    <Txt size={12} color="#CBD5E1">{card.keywords}</Txt>
                    <Txt color="#E2E8F0">{cd.reversed ? card.reversed : card.upright}</Txt>
                  </Card>
                );
              })}
              {open.length === cards.length && (
                <Card style={{ backgroundColor: GOLD, borderColor: GOLD }}>
                  <Txt weight="800" color="#1E1B4B">Gesamtdeutung</Txt>
                  <Txt color="#1E1B4B">{interpret(cards)}</Txt>
                </Card>
              )}
            </>
          )}
          {s.tarot.length > 0 && (
            <>
              <Txt weight="800" color="#FFFFFF">Deine letzten Legungen</Txt>
              {s.tarot.slice(0, 5).map((r) => (
                <Txt key={r.id} size={13} color="#CBD5E1">{`${formatShort(r.date)} · ${r.spread}: ${r.cards.map((x) => DECK[x.card].name).join(', ')}`}</Txt>
              ))}
            </>
          )}
        </>
      )}

      {tab === 'abgleich' && match && (
        <>
          <Card style={glass}>
            <Txt weight="800" color="#FFFFFF" size={17}>Stimmen Sterne und Alltag überein?</Txt>
            <Txt color="#E2E8F0">Ich vergleiche die Tages-Prognose (Gesamt & Energie) mit deinen Check-ins (Stimmung & Energie) der letzten 90 Tage.</Txt>
            {match.agreement !== null && (
              <Row style={{ justifyContent: 'space-between' }}>
                <Txt color="#FFFFFF">Übereinstimmung</Txt>
                <Badge text={`${match.agreement} % von ${match.days} Tagen`} bg={GOLD} color="#1E1B4B" />
              </Row>
            )}
            <Txt color="#E2E8F0">{match.verdict}</Txt>
          </Card>
          {match.patterns.map((p) => (
            <Card key={p.title} style={glass}>
              <Txt weight="800" color="#FFFFFF">{p.title}</Txt>
              <Txt color="#E2E8F0">{p.text}</Txt>
            </Card>
          ))}
          {!natal && <Button title="Geburtsdaten eingeben" kind="mint" onPress={() => setSetup(true)} />}
        </>
      )}

      <Txt size={12} color="#CBD5E1">Horoskop und Tarot dienen der Unterhaltung und Selbstreflexion. Die Planetenpositionen sind astronomisch berechnet (Genauigkeit ca. 1°); ihre Deutung ist keine wissenschaftliche Vorhersage.</Txt>

      <Sheet visible={setup} onClose={() => setSetup(false)} title="Geburtsdaten" footer={<Button title="Fertig" onPress={() => setSetup(false)} />}>
        <DateField label="Geburtsdatum" value={s.astro.birthDate} onChange={(birthDate) => s.setAstro({ birthDate, utcOffsetMin: undefined })} quick={false} optional />
        <TimeField label="Geburtszeit (für Aszendent & genaues Mondzeichen)" value={s.astro.birthTime ?? ''} onChange={(birthTime) => s.setAstro({ birthTime })} />
        <Txt weight="700">Geburtsort</Txt>
        <Row wrap gap={6}>
          {CITIES.map((ci) => (
            <Chip key={ci.name} label={ci.name} selected={s.astro.place?.name === ci.name} onPress={() => s.setAstro({ place: ci })} />
          ))}
        </Row>
        <Txt size={12}>Nicht dabei? Wähle die nächstgelegene Stadt – für den Aszendenten reicht das meist.</Txt>
        <Field
          label="Zeitzone bei Geburt (Minuten zu UTC, optional)"
          keyboardType="numbers-and-punctuation"
          value={s.astro.utcOffsetMin !== undefined ? String(s.astro.utcOffsetMin) : ''}
          onChangeText={(t) => s.setAstro({ utcOffsetMin: t.trim() === '' ? undefined : Number(t) || 0 })}
          hint="Leer lassen = automatisch (Zeitzone deines Handys inkl. Sommerzeit). Deutschland: 60, im Sommer 120."
        />
        <View style={{ backgroundColor: NIGHT, borderRadius: 18, padding: 12, gap: 12 }}>
          <Txt weight="800" color="#FFFFFF">Oder selbst angeben</Txt>
          {signChip('Sternzeichen', 'sun')}
          {signChip('Mondzeichen', 'moon')}
          {signChip('Aszendent', 'asc')}
        </View>
        {natal && <Txt weight="700">{`Ergebnis: Sonne ${natal.sunSign} · Mond ${natal.moonSign ?? '–'} · Aszendent ${natal.ascSign ?? 'Uhrzeit & Ort fehlen'}`}</Txt>}
      </Sheet>
    </Screen>
  );
}
