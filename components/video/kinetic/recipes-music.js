/* ============================================================================
   MUSIC MODULE — a synthesized groove under the whole film (no audio files).
   Config: music: { bpm: 120, anchor: 0, volume: 1, chords, riff, parts: [{ from, to, style }] }
   Styles:
     'groove' four-on-the-floor, claps on 2 & 4, off-beat hats, bouncy octave bass,
              plucked chord arpeggio and the bell riff every other bar;
     'drive'  the groove without the riff, busier hats (under dense scenes);
     'half'   half-time: kick 1 + "and" of 3, clap on 3, long bass notes;
     'soft'   hats + bass roots only (under talky scenes);
     'build'  kicks on every eighth, snare-roll claps, rising plucks (last bar before a hit);
     'hit'    one crash + boom + chord on `from`;
     'tension' no kick: a pulsing low root on every eighth + ticks (cold opens, breakdowns);
     'house'  four-on-the-floor, off-beat bass, sixteenth hats, chord stabs, the hook;
     'stutter' sixteenth glitches + a kick roll (the half bar before a drop);
     'pulse'  just the heartbeat: kick on the quarters, a syncopated bass root, faint hats;
     'synth'  synthwave: kick on the quarters, a big snare on 2 & 4, an octave-pulsing bass in
              eighths, a 16th-note arpeggio and a detuned-saw pad per chord;
     'walk'   noir jazz: a walking bass in quarters (root · third · fifth · chromatic approach),
              swung brushes, a soft rim on 2 & 4, a sparse piano voicing every other bar.
   Presets: Trailer.music.MINOR (Am – F – C – G) and RIFF_MINOR (A minor pentatonic).
   Chords default to C – G – Am – F (one per bar). Everything is placed on the master
   timeline at build time (the plugin's `done` hook), so it scrubs with the film.

   HANDY — lo que agrega esta copia del módulo (js/partitura.js lo usa):
   Cada parte puede pisar la armonía y la melodía de la partitura: `chords` (una tríada midi por
   compás, p.chords || M.chords || CHORDS) y `riff` (corcheas, p.riff || M.riff || RIFF; los estilos de
   arriba). Los acordes con nombre están en Trailer.music.ACORDES (C G Am F Dm Em).
   Estilos nuevos: sus compases cuentan desde `from` (o `anchor`), así cada sección arranca su progresión
   en el primer acorde. Todo en la grilla de semicorcheas (0,125 s a 120 BPM).
     'coro'    el estribillo de los drops: bombo en negras, palmas en 2 y 4, hats en semicorcheas con el
               contratiempo acentuado, bajo que salta de octava en corcheas, arpegio pulsado del acorde en
               semicorcheas, un pad sostenido por compás (SFX.pad / padStop) y el gancho. `lleno: true` (el
               drop más grande): el pad suma la octava de arriba y abre el filtro (2000 Hz) y el bajo galopa
               (octava en la última semicorchea de cada tiempo); `pad: false`, sin pad;
     'verso'   lo liviano de las escenas de app: bombo en 1, 3 y "y" del 3, palmas suaves en 2 y 4, hats a
               contratiempo, bajo sincopado y un arpegio en corcheas, sobre una cama de pad muy baja y opaca
               (0,009 · v, 900 Hz, por compás) que sostiene el compás entre los golpes, bajito: deja lugar a los
               toques, "ding" y barridos de las escenas. `full: true` sube el pad (0,016 · v, 1100 Hz) y suma
               hats en semicorcheas; `answer: true`, una respuesta de dos notas del acorde al final de cada
               compás impar;
     'quiebre' el corte: pad + campanas del gancho que suenan más largas, hats suaves, sin bombo;
     'subida'  la subida al drop: SFX.riser sobre toda la parte, redoble de palmas que acelera (corcheas en
               la primera mitad, semicorcheas en la segunda; la última semicorchea queda muda), bombo que
               crece, pedal de bajo en corcheas, campanitas que suben por la pentatónica del acorde (sin
               semitonos contra él) hasta su raíz en la octava 5, y un pad que se hincha;
     'frio'    el arranque en frío: pad oscuro, un latido grave (raíz + eco a la semicorchea) en 1 y 3;
     'latido'  el pulso que crece: bombo en negras que sube, bajo sincopado, hats que aparecen, el pad;
     'final'   el golpe final en `from` (crash, boom, bombo, bajo) y el último acorde sostenido: pad +
               campanas que suenan hasta `to`. El pad se apaga solo y nada queda programado en `to` ni después.
   `ligado: true` ('coro', 'verso', 'quiebre', 'frio', 'latido'): la parte sigue con el pad de la anterior: no
   arranca uno propio en `from` (solo en los compases) y la parte de esos estilos que termina en ese `from` no
   apaga el suyo (events() le pone `sigue`; 'subida' y 'final' apagan siempre el suyo). Sirve cuando el cambio
   de parte cae a mitad de compás con el mismo acorde: sin hueco en el pad.
   El gancho ("cinco Handys, cinco notas"): Trailer.music.HOOK, cuatro compases sobre C – G – Am – F hechos
   con las cinco notas de la pentatónica de Do (C D E G A): sube por las cinco, contesta bajando, vuelve a
   subir más alto y cierra en Do. Formato: [[semicorchea, midi, largo en semicorcheas], …]; se repite cada
   tantos compases como ocupe. Lo tocan 'coro', 'quiebre', 'frio' y 'final' si la parte lo pide:
     hook        la melodía (default HOOK en 'coro' y 'quiebre'; false = sin gancho)
     hookBar     en qué compás del gancho arranca la parte (default 0)
     hookOct     octavas extra, ej. [0, 12] = doblado una octava arriba (default [0])
     hookOctDesde  tiempo (absoluto, como from/to) desde el que vale hookOct; antes, solo la melodía (default: toda la parte)
     hookVol     volumen de cada campana (default 0.1)
   Los acordes y el gancho van en registros separados: bajo A1–G#2 (+ octava), pad G3–F#4 (con `lleno` y en
   'final', también G4–F#5), arpegio C4–D5, gancho C5–C6 (HOOK; doblado con hookOct [0, 12] llega a C7; la
   firma del final, C6–A6). Así el bajo queda abajo y en el centro, y las campanas arriba.
   ========================================================================== */
(() => {
  'use strict';
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  const CHORDS = [[48, 52, 55], [43, 47, 50], [45, 48, 52], [41, 45, 48]]; // C3 E3 G3 · G2 B2 D3 · A2 C3 E3 · F2 A2 C3
  // a 2-bar hook in C major pentatonic (midi, null = rest), eighth notes
  const RIFF = [76, null, 79, 81, 79, null, 76, 74, 72, null, 74, 76, null, 79, 76, null];
  const MINOR = [[45, 48, 52], [41, 45, 48], [48, 52, 55], [43, 47, 50]]; // Am · F · C · G
  const RIFF_MINOR = [76, null, 79, 81, 79, null, 76, 74, 72, null, 74, 76, null, 72, 69, null];

  // ── HANDY ────────────────────────────────────────────────────────────────────────────────────
  const ACORDES = {
    C: [48, 52, 55], G: [43, 47, 50], Am: [45, 48, 52], F: [41, 45, 48], Dm: [50, 53, 57], Em: [52, 55, 59],
  };
  // el gancho: "cinco Handys, cinco notas" (C5 = 72). [semicorchea, midi, largo en semicorcheas]
  const HOOK = [
    [0, 72, 2], [2, 74, 2], [4, 76, 2], [6, 79, 2], [8, 81, 6], [14, 79, 6],      // C: do re mi sol LA~ · sol~
    [20, 81, 2], [22, 79, 2], [24, 76, 2], [26, 74, 6],                          // G: (sol) la sol mi RE~
    [32, 72, 2], [34, 74, 2], [36, 76, 2], [38, 79, 2], [40, 84, 4], [44, 81, 2], [46, 79, 6], // Am: …sube a DO agudo
    [52, 81, 2], [54, 79, 2], [56, 74, 2], [58, 72, 6],                          // F: (sol) la sol re DO~ (cierra)
  ];
  const mod = (a, n) => ((a % n) + n) % n;
  /** cada nota del acorde dentro de [lo, lo + 12), de grave a agudo */
  const enRango = (ch, lo) => ch.map(n => lo + mod(n - lo, 12)).sort((a, b) => a - b);
  const PENTA = [0, 2, 4, 7, 9]; // pentatónica mayor desde la raíz del acorde, para las campanitas de la subida
  const grado = g => 12 * Math.floor(g / 5) + PENTA[mod(g, 5)];
  const ESTILOS_HANDY = new Set(['coro', 'verso', 'quiebre', 'subida', 'frio', 'latido', 'final']);

  /** los estilos nuevos: una parte, nota por nota, en semicorcheas desde su `anchor` (default `from`) */
  function estiloHandy(p, st, v, chords, beat, sfx) {
    const s16 = beat / 4, bar = 16 * s16, a0 = p.anchor ?? p.from, to = p.to ?? p.from;
    const acorde = k => chords[mod(k, chords.length)];
    const grave = ch => 33 + mod(ch[0] - 33, 12);              // raíz del bajo: A1 … G#2
    const PAD = 'hdr-musica';
    // el gancho: semicorchea (relativa a a0) → notas
    const hook = p.hook === false ? null : (p.hook || ((st === 'coro' || st === 'quiebre') ? HOOK : null));
    const notas = new Map(), largoHook = hook ? 16 * Math.max(1, Math.ceil(Math.max(...hook.map(n => n[0] + 1)) / 16)) : 16;
    if (hook) hook.forEach(([s, n, l]) => { if (!notas.has(s)) notas.set(s, []); notas.get(s).push([n, l]); });
    const octs = p.hookOct || [0], hv = (p.hookVol ?? 0.1) * v, hookLargo = st === 'quiebre' ? 2 : 1.25;
    const gancho = (t, i) => {
      if (!hook) return;
      const q = mod(i + 16 * (p.hookBar || 0), largoHook);
      const os = p.hookOctDesde != null && t < p.hookOctDesde - 1e-6 ? [0] : octs; // el doblado, desde hookOctDesde
      (notas.get(q) || []).forEach(([n, l]) => os.forEach((o, k) =>
        sfx('bell', t, hz(n + o), hv * (k ? 0.6 : 1), Math.min(1.6, l * s16 * hookLargo))));
    };
    const first = Math.ceil((p.from - a0) / s16 - 1e-6), last = Math.ceil((to - a0) / s16 - 1e-6) - 1, n16 = last - first + 1;

    if (st === 'final') {
      const ch = acorde(0), r = grave(ch), t = p.from, largo = to - t;
      sfx('crash', t, 0.32 * v);
      sfx('boom', t, 0.75 * v);
      sfx('kick', t, 0.6 * v);
      sfx('bass', t, hz(r), 0.3 * v);
      sfx('bass', t, hz(r + 12), 0.2 * v);
      sfx('pad', t, PAD, [...enRango(ch, 55), ...enRango(ch, 67)].map(hz), 0.02, 0.045 * v, 2200);
      enRango(ch, 72).forEach(n => sfx('bell', t, hz(n), 0.06 * v, largo * 0.92));
      sfx('bell', t, hz(enRango(ch, 84)[0]), 0.04 * v, largo * 0.92);
      for (let i = first; i <= last; i++) gancho(a0 + i * s16, i);
      // el acorde suena y se apaga antes del final: nada programado en `to` ni después
      sfx('padStop', to - 5 * s16, PAD, 0.55); // con to = 56: se apaga de 55,375 a 55,925 (los osciladores paran en 55,975)
      return;
    }
    if (st === 'subida') {
      const ch = acorde(0), r = grave(ch), largo = to - p.from;
      sfx('riser', p.from, largo, 0.3 * v);
      sfx('pad', p.from, PAD, enRango(ch, 55).map(hz), largo * 0.9, 0.022 * v, 1400);
      const mitad = Math.floor(n16 / 2), slots = Math.ceil(n16 / 2), tramo = Math.min(slots - 1, 8); // hasta una octava y media
      const raiz4 = 60 + mod(ch[0] - 60, 12);
      for (let k = 0; k < n16 - 1; k++) {                       // la última semicorchea, muda: el aire antes del drop
        const t = a0 + (first + k) * s16, x = k / (n16 - 1);
        if (k >= mitad || k % 2 === 0) sfx('clap', t, (0.06 + 0.2 * x) * v);
        if (k % 4 === 0 || (k >= mitad && k % 2 === 0)) sfx('kick', t, (0.32 + 0.25 * x) * v);
        if (k % 2 === 0) {
          sfx('bass', t, hz(r), (0.12 + 0.12 * x) * v);
          // las campanitas suben un grado por corchea y llegan a la raíz en la octava 5 (Sol 5 sobre G) en la última
          const g = 5 - Math.round(tramo * (1 - k / 2 / Math.max(1, slots - 1)));
          sfx('bell', t, hz(raiz4 + grado(g)), (0.025 + 0.035 * x) * v, 0.16);
        }
      }
      sfx('padStop', to, PAD, 0.03);
      return;
    }
    for (let i = first; i <= last; i++) {
      const t = a0 + i * s16, pos = mod(i, 16), sub = pos & 3, k = Math.floor(i / 16);
      const ch = acorde(k), r = grave(ch), arp = enRango(ch, 60), x = (i - first) / Math.max(1, n16 - 1);
      // el pad entra en cada compás y al arrancar la parte (con `ligado`, solo en los compases: sigue el de la anterior)
      const pie = pos === 0 || (i === first && !p.ligado);
      const finDeFrase = mod(k, 4) === 3 || a0 + (k + 1) * bar >= to - 1e-6; // último compás de la frase o de la parte
      if (st === 'coro') {
        if (sub === 0) sfx('kick', t, 0.52 * v);
        if (pos === 4 || pos === 12) sfx('clap', t, 0.28 * v);
        if (finDeFrase && pos >= 13) sfx('clap', t, (0.08 + 0.04 * (pos - 13)) * v); // un remate de palmas
        sfx('hat', t, (sub === 2 ? 0.11 : sub === 0 ? 0.045 : 0.035) * v);
        if (sub === 0) sfx('bass', t, hz(r), 0.2 * v);
        if (sub === 2) sfx('bass', t, hz(r + 12), 0.28 * v);
        if (p.lleno && sub === 3) sfx('bass', t, hz(r + 12), 0.13 * v); // `lleno`: el bajo galopa (octava en la "a")
        const PAT = [0, 1, 2, 3, 2, 1, 2, 3], nota = PAT[pos % 8] === 3 ? arp[0] + 12 : arp[PAT[pos % 8]];
        sfx('bell', t, hz(nota), (sub === 0 ? 0.04 : 0.028) * v, 0.16);
        if (pie && p.pad !== false) {
          // `lleno`: el pad suma la octava de arriba y abre el filtro (el drop más grande)
          const voces = p.lleno ? [...enRango(ch, 55), ...enRango(ch, 67)] : enRango(ch, 55);
          sfx('pad', t, PAD, voces.map(hz), 0.06, (p.lleno ? 0.04 : 0.045) * v, p.lleno ? 2000 : 1300);
        }
        gancho(t, i);
      } else if (st === 'verso') {
        if (pos === 0 || pos === 8) sfx('kick', t, 0.56 * v);
        if (pos === 10) sfx('kick', t, 0.3 * v);
        if (pos === 4 || pos === 12) sfx('clap', t, 0.2 * v);
        if (sub === 2) sfx('hat', t, 0.05 * v);
        else if (p.full && sub !== 0) sfx('hat', t, 0.02 * v);
        const BAJO = { 0: 0, 6: 12, 8: 0, 12: 7, 14: 12 };
        if (pos in BAJO) sfx('bass', t, hz(r + BAJO[pos]), (pos === 0 ? 0.28 : 0.22) * v);
        if (sub === 2) sfx('bell', t, hz(arp[(pos >> 2) % 3] + (pos === 14 ? 12 : 0)), 0.022 * v, 0.3);
        // el pad: con `full`, presente; sin `full`, una cama muy baja y opaca que sostiene el compás entre los golpes
        if (pie) sfx('pad', t, PAD, enRango(ch, 55).map(hz), 0.25, (p.full ? 0.016 : 0.009) * v, p.full ? 1100 : 900);
        if (p.answer && mod(k, 2) === 1 && (pos === 12 || pos === 14)) {
          const alto = enRango(ch, 72);
          sfx('bell', t, hz(pos === 12 ? alto[2] : alto[1]), 0.035 * v, 0.5);
        }
      } else if (st === 'quiebre') {
        if (pie) {
          sfx('pad', t, PAD, enRango(ch, 55).map(hz), 0.4, 0.026 * v, 1600);
          sfx('bass', t, hz(r), 0.2 * v);
        }
        if (sub === 2) sfx('hat', t, 0.025 * v);
        gancho(t, i);
      } else if (st === 'frio') {
        if (pie) sfx('pad', t, PAD, enRango(ch, 55).map(hz), i === first ? 1.2 : 0.4, 0.016 * v, 520);
        if (pos === 0 || pos === 8) sfx('bass', t, hz(r), 0.15 * v);
        if (pos === 1 || pos === 9) sfx('bass', t, hz(r), 0.07 * v);
        gancho(t, i);
      } else if (st === 'latido') {
        if (sub === 0) sfx('kick', t, (0.16 + 0.22 * x) * v);
        if (pos === 0 || pos === 6) sfx('bass', t, hz(r), 0.14 * v);
        if (pos === 12 && x > 0.4) sfx('bass', t, hz(r + 12), 0.15 * v);
        if (sub === 2) sfx('hat', t, (0.012 + 0.04 * x) * v);
        if (pie) sfx('pad', t, PAD, enRango(ch, 55).map(hz), i === first ? 0.25 : 0.4, (0.014 + 0.008 * x) * v, 600 + 500 * x);
      }
    }
    // el pad de la parte se apaga en su fin (si la próxima trae otro, entra encima: un fundido corto), salvo que la
    // próxima sea `ligado` (p.sigue, lo pone events()): ahí el mismo pad sigue sonando sin cortarse
    if (!p.sigue && (st === 'coro' || st === 'quiebre' || st === 'frio' || st === 'latido' || st === 'verso')) sfx('padStop', to, PAD, 0.25);
  }

  /** The score as data: every note of cfg.music as { t, voice, a } (sorted by time). Pure — the
   *  same list the timeline plays, so visuals can react to the music exactly (see recipes-beat.js). */
  function events(M) {
    const beat = 60 / (M.bpm || 120), e8 = beat / 2, V = M.volume ?? 1;
    const list = [];
    const sfx = (name, at, ...a) => { list.push({ t: at, voice: name, a }); };
    // HANDY: los tiempos donde arranca una parte `ligado`: la parte que termina ahí no apaga su pad
    const clave = x => Math.round(x * 1e6), ligados = new Set((M.parts || []).filter(p => p.ligado).map(p => clave(p.from)));
    (M.parts || []).forEach(p => {
      const st = p.style || 'groove', v = V * (p.volume ?? 1), anchor = p.anchor ?? (M.anchor || 0); // bars count from here
      const chords = p.chords || M.chords || CHORDS, riff = p.riff || M.riff || RIFF; // la parte puede pisar armonía y riff
      if (ESTILOS_HANDY.has(st)) return estiloHandy(p.to != null && ligados.has(clave(p.to)) ? { ...p, sigue: true } : p, st, v, chords, beat, sfx);
      if (st === 'synth' && p.to) sfx('padStop', p.to, 'synpad', 0.6);
      if (st === 'hit') {
        sfx('crash', p.from, 0.3 * v);
        sfx('boom', p.from, 0.7 * v);
        chords[0].forEach(n => sfx('bell', p.from, hz(n + 24), 0.05 * v, 2));
        return;
      }
      const first = Math.ceil((p.from - anchor) / e8 - 1e-6), last = Math.floor((p.to - anchor) / e8 - 1e-6);
      for (let i = first; i <= last; i++) {
        const t = anchor + i * e8;
        if (t < p.from - 1e-6 || t >= p.to - 1e-6) continue;
        const bar = Math.floor(i / 8), e = ((i % 8) + 8) % 8, ch = chords[((bar % chords.length) + chords.length) % chords.length];
        const root = ch[0] - 12;
        if (st === 'groove' || st === 'drive') {
          if (e % 2 === 0) sfx('kick', t, 0.5 * v);
          if (e === 2 || e === 6) sfx('clap', t, 0.28 * v);
          if (e % 2 === 1) sfx('hat', t, 0.07 * v);
          if (st === 'drive' && e % 2 === 0) sfx('hat', t, 0.035 * v);
          const bassPat = { 0: 0, 3: 12, 4: 0, 6: 7, 7: 12 };
          if (e in bassPat) sfx('bass', t, hz(root + bassPat[e]), 0.26 * v);
          if (e % 2 === 1) sfx('plip', t, 0.03 * v, hz(ch[(e >> 1) % 3] + 24));
          // the hook answers in the second half of every 4-bar phrase
          const ph = ((bar % 4) + 4) % 4;
          if (st === 'groove' && ph >= 2) {
            const note = riff[(ph - 2) * 8 + e];
            if (note != null) sfx('bell', t, hz(note), 0.045 * v, 0.9);
          }
        } else if (st === 'half') {
          if (e === 0 || e === 5) sfx('kick', t, 0.45 * v);
          if (e === 4) sfx('clap', t, 0.26 * v);
          sfx('hat', t, (e % 2 ? 0.05 : 0.03) * v);
          if (e === 0) sfx('bass', t, hz(root), 0.3 * v);
          if (e === 0) ch.forEach(n => sfx('bell', t, hz(n + 12), 0.025 * v, 2.2));
        } else if (st === 'soft') {
          if (e % 2 === 1) sfx('hat', t, 0.045 * v);
          if (e === 0) sfx('bass', t, hz(root), 0.24 * v);
          if (e === 4) sfx('plip', t, 0.03 * v, hz(ch[1] + 24));
        } else if (st === 'tension') {
          sfx('bass', t, hz(root + (e === 7 ? 12 : 0)), (e % 2 ? 0.1 : 0.17) * v);
          if (e % 2 === 0) sfx('tick', t, 0.035 * v);
          if (e === 0 && bar % 2 === 0) ch.forEach(n => sfx('bell', t, hz(n + 12), 0.018 * v, 3));
        } else if (st === 'house') {
          if (e % 2 === 0) sfx('kick', t, 0.55 * v);
          if (e === 2 || e === 6) sfx('clap', t, 0.3 * v);
          sfx('hat', t, (e % 2 ? 0.09 : 0.035) * v);
          sfx('hat', t + e8 / 2, 0.03 * v);
          if (e % 2 === 1) sfx('bass', t, hz(root + (e === 7 ? 12 : 0)), 0.3 * v);
          if (e === 3 || e === 6) ch.forEach(n => sfx('bell', t, hz(n + 12), 0.022 * v, 0.35));
          const ph = ((bar % 4) + 4) % 4;
          if (ph >= 2) { const note = riff[(ph - 2) * 8 + e]; if (note != null) sfx('bell', t, hz(note), 0.045 * v, 0.8); }
        } else if (st === 'stutter') {
          sfx('glitch', t, 0.08, 0.12 * v);
          sfx('glitch', t + e8 / 2, 0.06, 0.09 * v);
          sfx('kick', t, 0.32 * v);
          sfx('kick', t + e8 / 2, 0.26 * v);
        } else if (st === 'pulse') {
          if (e % 2 === 0) sfx('kick', t, 0.55 * v);
          if (e === 0 || e === 3) sfx('bass', t, hz(root), 0.26 * v);
          if (e % 2 === 1) sfx('hat', t, 0.03 * v);
        } else if (st === 'synth') {
          if (e % 2 === 0) sfx('kick', t, 0.5 * v);
          if (e === 2 || e === 6) { sfx('clap', t, 0.34 * v); sfx('boom', t, 0.06 * v); }
          sfx('bass', t, hz(root + (e % 2 ? 12 : 0)), 0.22 * v);
          for (let h = 0; h < 2; h++) sfx('plip', t + (h * e8) / 2, 0.032 * v, hz([ch[0], ch[1], ch[2], ch[1] + 12][(e * 2 + h) % 4] + 24));
          if (e === 0) sfx('pad', t, 'synpad', ch.map(n => hz(n + 12)), 0.25, 0.028 * v, 1600);
        } else if (st === 'walk') {
          const next = chords[(((bar + 1) % chords.length) + chords.length) % chords.length][0] - 12;
          if (e % 2 === 0) { const q = e >> 1, n = [root, ch[1] - 12, ch[2] - 12, next + (next > ch[2] - 12 ? -1 : 1)][q]; sfx('bass', t, hz(n), 0.24 * v); }
          sfx('hat', e % 2 ? t + e8 * 0.33 : t, (e % 2 ? 0.035 : 0.05) * v); // swung brushes
          if (e === 2 || e === 6) sfx('clap', t, 0.05 * v);
          if (e === 0 && bar % 2 === 0) ch.forEach((n, i) => sfx('bell', t + i * 0.03, hz(n + 12), 0.022 * v, 1.8));
        } else if (st === 'build') {
          sfx('kick', t, (0.3 + 0.3 * ((t - p.from) / Math.max(0.01, p.to - p.from))) * v);
          sfx('clap', t, 0.12 * v);
          sfx('plip', t, 0.04 * v, hz(60 + (i - first) * 2));
        }
      }
    });
    return list.sort((x, y) => x.t - y.t);
  }
  /** Parts with `at` are placed relative to a region of a branching film (engine: D.segs): a branch id
   *  ('a') or 'end' (the shared part after the branches). Their bars count from that region, so the
   *  music is the same in the interactive film and in any linear path. Parts of absent branches drop. */
  function resolve(M, segs = []) {
    const firstBranch = segs.findIndex(s => s.branch), end = firstBranch < 0 ? null : segs.slice(firstBranch).find(s => !s.branch);
    const parts = (M.parts || []).map(p => {
      if (!p.at) return p;
      const seg = p.at === 'end' ? end : segs.find(s => s.branch === p.at);
      if (!seg) return null;
      return { ...p, from: seg.start + p.from, to: p.to == null ? undefined : seg.start + p.to, anchor: seg.start };
    }).filter(Boolean);
    return { ...M, parts };
  }
  function schedule(D, M) { events(resolve(M, D.segs)).forEach(e => D.sfx(e.voice, e.t, ...e.a)); }
  Trailer.plugin({ done: (D, cfg) => { if (cfg.music) schedule(D, cfg.music); } });
  const NOIR = [[50, 53, 57], [43, 46, 50], [45, 49, 52], [50, 53, 57]]; // Dm · Gm · A · Dm
  Trailer.music = { schedule, events, resolve, hz, CHORDS, RIFF, MINOR, RIFF_MINOR, NOIR, ACORDES, HOOK };
})();
