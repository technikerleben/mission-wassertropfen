# Mission Wassertropfen – Three.js-Prototyp

Ein geführter, nicht spielerischer 3D-Prototyp zum Wasserkreislauf.

## Enthalten

- Startbildschirm und Cockpit-HUD
- begrenztes Umsehen per Maus oder Touch
- prozedurales Meer und stilisierte Landschaft
- Wassertropfen mit instanzierten H₂O-Molekülen
- hervorgehobenes Molekül
- Verdunstungssequenz
- Gesamtmodell des Wasserkreislaufs
- Browser-Sprachausgabe auf Deutsch
- synchronisierte Untertitel
- Pause, Kapitelwechsel, Ton, Untertitel und Vollbild
- drei Grafikqualitäten

## Lokal starten

```bash
npm install
npm run dev
```

Vite zeigt anschließend die lokale Adresse an.

## Produktions-Build

```bash
npm run build
```

Der fertige Build liegt danach im Ordner `dist`.

## Vercel

Das Projekt kann ohne zusätzliche Konfiguration als Vite-Projekt importiert werden.

- Build Command: `npm run build`
- Output Directory: `dist`

## Hinweise

- Die Sprecherstimme nutzt die im Browser vorhandene deutsche Systemstimme. Aussehen und Klang unterscheiden sich daher je nach Gerät.
- Der Prototyp verwendet noch keine externen Modelle oder Audiodateien.
- Die Molekül- und Landschaftsdarstellungen sind bewusst vereinfacht und nicht maßstabsgetreu.
