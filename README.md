# Mission Wassertropfen – Three.js-Prototyp

Eine geführte, nicht spielerische 3D-Reise durch den Wasserkreislauf für den
Einsatz im Unterricht. Schülerinnen und Schüler steigen in die **Aqua
Explorer**, wechseln von der Landschafts- in die Teilchenperspektive und
begleiten ein Wassermolekül bei der Verdunstung.

## Zweite Iteration

- zuverlässigere Initialisierung deutscher Systemstimmen
- verständlicher Hinweis, wenn Sprachausgabe fehlt
- Behandlung eines WebGL-Kontextverlusts mit Reload-Hinweis
- erneute Anpassung der Renderauflösung bei Größen- oder Displaywechseln
- Kapitelübersicht mit direkter Sprungnavigation
- vollständiges Transkript aller Sprechertexte
- Glossar zentraler Fachbegriffe
- Lernzusammenfassung nach Abschluss der Mission
- optimierte Untertitel-Cue-Suche ohne lineare Suche in jedem Frame
- Schatten nur in der hohen Qualitätsstufe
- reproduzierbare Installation über `package-lock.json`
- automatischer GitHub-Actions-Build bei Pushes und Pull Requests

## Enthaltene Kapitel

1. Willkommen an Bord
2. Im Wassertropfen
3. Die Sonne liefert Energie – Verdunstung
4. Der Kreislauf geht weiter

## Bedienung

- Maus oder Finger ziehen: leicht im Cockpit umsehen
- **← / →**: vorheriges oder nächstes Kapitel
- **Pause / Weiter**: Reise anhalten oder fortsetzen
- **☰**: Kapitelübersicht
- **Text**: vollständiges Transkript
- **ABC**: Glossar
- **CC**: Untertitel ein- oder ausschalten
- **♫**: Sprachausgabe ein- oder ausschalten
- **⛶**: Vollbild

Tastatur: Leertaste pausiert, Pfeiltasten wechseln Kapitel, `F` schaltet
Vollbild und `M` den Ton.

## Technische Mindestanforderungen

### Browser

Benötigt wird ein aktueller Browser mit:

- WebGL 2
- ES-Modulen
- CSS `backdrop-filter` ist optional; ohne Unterstützung bleibt die Anwendung nutzbar
- Fullscreen API ist optional

Die Web Speech API ist **optional**. Ist sie nicht verfügbar, funktioniert die
Mission vollständig mit Untertiteln und Transkript.

Empfohlen werden aktuelle Versionen von Safari/iPadOS, Chrome, Edge oder
Firefox. Auf Schul-iPads sollte vor dem Unterricht ein kurzer Test im später
verwendeten Browser erfolgen, da Systemstimmen und WebGL-Ressourcen durch
Geräteverwaltung eingeschränkt sein können.

### Lokale Entwicklung

- Node.js 20.19 oder neuer
- npm 10 oder neuer empfohlen

```bash
npm ci
npm run dev
```

Vite zeigt anschließend die lokale Adresse an.

## Produktions-Build

```bash
npm ci
npm run build
```

Der fertige Build liegt danach im Ordner `dist`.

## Vercel

Das Repository kann direkt als Vite-Projekt importiert werden.

- Build Command: `npm run build`
- Output Directory: `dist`

## Qualitätsstufen

- **Niedrig:** weniger Moleküle und Wolken, keine Schatten
- **Mittel:** Standard für Tablets und aktuelle iPads, keine Schatten
- **Hoch:** mehr Moleküle und zusätzliche Schattenberechnung

Die interne Renderauflösung wird bewusst begrenzt und bei einem Display- oder
Fensterwechsel neu berechnet.

## Barrierefreiheit

- synchronisierte Untertitel
- vollständiges Transkript zum Nachlesen
- Glossar mit Fachbegriffen
- Dialogfenster sind per Tastatur schließbar und halten den Fokus im Dialog
- fehlende Sprachausgabe wird sichtbar gemeldet
- die Mission pausiert, während Lerntexte oder Menüs geöffnet sind

## Projektstruktur

```text
src/
├── chapters/   Kapiteltexte und GSAP-Regie
├── content/    Glossar und weitere Lerninhalte
├── core/       App-, Ereignis- und Sprachsteuerung
├── three/      Kamera, Landschaften und Molekülsystem
└── ui/         Bedienoberfläche und Lernfenster
```

## Lizenz

- Quellcode: MIT
- selbst erstellte Bildungsinhalte: CC BY-SA 4.0

Details stehen in [`LICENSE.md`](LICENSE.md).

## Fachlicher Hinweis

Die Molekül- und Landschaftsdarstellungen sind bewusst vereinfacht und nicht
maßstabsgetreu. Wasserdampf wird als unsichtbar erklärt; das hervorgehobene
Molekül ist ausschließlich eine didaktische Markierung.
