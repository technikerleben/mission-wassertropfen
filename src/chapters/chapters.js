export const chapters = [
  {
    id: 'departure',
    title: 'Willkommen an Bord',
    intro: 'Die Aqua Explorer startet über dem Meer.',
    world: 'ocean',
    duration: 25,
    telemetry: { place: 'MEER', process: 'START', state: 'FLÜSSIG', energy: 'NORMAL' },
    narration: 'Willkommen an Bord der Aqua Explorer. Unsere Mission führt uns auf eine Reise, die Wasser jeden Tag unternimmt. Normalerweise sind viele Vorgänge zu groß, zu langsam oder viel zu klein, um sie direkt zu beobachten. Deshalb schrumpfen wir unser Forschungsschiff und begleiten ein einzelnes Wassermolekül.',
    cues: [
      [0, 5.8, 'Willkommen an Bord der Aqua Explorer.'],
      [5.8, 12.8, 'Unsere Mission führt uns auf eine Reise, die Wasser jeden Tag unternimmt.'],
      [12.8, 19.5, 'Viele Vorgänge sind zu groß, zu langsam oder viel zu klein, um sie direkt zu beobachten.'],
      [19.5, 25, 'Deshalb schrumpfen wir und begleiten ein einzelnes Wassermolekül.']
    ]
  },
  {
    id: 'inside-drop',
    title: 'Im Wassertropfen',
    intro: 'Wir wechseln von der Landschaft in die Teilchenwelt.',
    world: 'molecular',
    duration: 31,
    telemetry: { place: 'WASSERTROPFEN', process: 'TEILCHENBEOBACHTUNG', state: 'FLÜSSIG', energy: 'NORMAL' },
    narration: 'Wir befinden uns jetzt in einem Wassertropfen. Wasser besteht aus winzigen Wassermolekülen. Jedes Wassermolekül besteht aus zwei Wasserstoffatomen und einem Sauerstoffatom. In flüssigem Wasser liegen die Moleküle dicht beieinander. Sie stehen aber nicht still, sondern bewegen sich ständig und gleiten aneinander vorbei. Das leuchtende Molekül werden wir auf seiner Reise begleiten.',
    cues: [
      [0, 5, 'Wir befinden uns jetzt in einem Wassertropfen.'],
      [5, 11.5, 'Wasser besteht aus winzigen Wassermolekülen.'],
      [11.5, 18, 'Jedes Wassermolekül besteht aus zwei Wasserstoffatomen und einem Sauerstoffatom.'],
      [18, 25, 'In flüssigem Wasser liegen die Moleküle dicht beieinander und bewegen sich ständig.'],
      [25, 31, 'Das leuchtende Molekül werden wir auf seiner Reise begleiten.']
    ],
    keyword: { at: 10.5, title: 'H₂O', text: 'Ein Wassermolekül besteht aus zwei Wasserstoffatomen und einem Sauerstoffatom.' }
  },
  {
    id: 'evaporation',
    title: 'Die Sonne liefert Energie',
    intro: 'Das markierte Molekül verlässt die Wasseroberfläche.',
    world: 'molecular',
    duration: 39,
    telemetry: { place: 'WASSEROBERFLÄCHE', process: 'VERDUNSTUNG', state: 'FLÜSSIG → GASFÖRMIG', energy: 'STEIGEND' },
    narration: 'Die Sonne überträgt Energie auf das Wasser. Dadurch bewegen sich einige Wassermoleküle immer schneller. Unser markiertes Molekül befindet sich nahe an der Oberfläche. Es erhält genug Energie, um die Flüssigkeit zu verlassen. Das flüssige Wasser wird gasförmig. Diesen Vorgang nennt man Verdunstung. Das Wasser ist nicht verschwunden. Das Molekül befindet sich nun als Teil des unsichtbaren Wasserdampfs in der Luft.',
    cues: [
      [0, 7, 'Die Sonne überträgt Energie auf das Wasser.'],
      [7, 14, 'Dadurch bewegen sich einige Wassermoleküle immer schneller.'],
      [14, 22, 'Unser markiertes Molekül erhält genug Energie, um die Flüssigkeit zu verlassen.'],
      [22, 29, 'Das flüssige Wasser wird gasförmig. Diesen Vorgang nennt man Verdunstung.'],
      [29, 39, 'Das Wasser ist nicht verschwunden. Es befindet sich als unsichtbarer Wasserdampf in der Luft.']
    ],
    keyword: { at: 22, title: 'Verdunstung', text: 'Flüssiges Wasser wird gasförmig.' }
  },
  {
    id: 'overview',
    title: 'Der Kreislauf geht weiter',
    intro: 'Alle Wege des Wassers werden gemeinsam sichtbar.',
    world: 'overview',
    duration: 42,
    telemetry: { place: 'GESAMTMODELL', process: 'WASSERKREISLAUF', state: 'VERÄNDERLICH', energy: 'SONNE' },
    narration: 'Die Sonne treibt den Wasserkreislauf an. Wasser verdunstet über Meeren, Seen und Böden. In kühlerer Luft kondensiert Wasserdampf zu kleinen Tröpfchen und bildet Wolken. Als Niederschlag gelangt Wasser zurück zur Erde. Es versickert, fließt durch Bäche und Flüsse oder wird von Pflanzen aufgenommen. Irgendwann gelangt ein Teil zurück ins Meer. Wasser verschwindet dabei nicht. Es verändert seinen Ort und manchmal seinen Aggregatzustand. Der Kreislauf geht immer weiter.',
    cues: [
      [0, 6, 'Die Sonne treibt den Wasserkreislauf an.'],
      [6, 13, 'Wasser verdunstet über Meeren, Seen und Böden.'],
      [13, 21, 'In kühlerer Luft kondensiert Wasserdampf und bildet Wolken.'],
      [21, 28, 'Als Niederschlag gelangt Wasser zurück zur Erde.'],
      [28, 35, 'Es versickert, fließt durch Bäche und Flüsse oder wird von Pflanzen aufgenommen.'],
      [35, 42, 'Wasser verschwindet nicht. Der Kreislauf geht immer weiter.']
    ],
    keyword: { at: 5.5, title: 'Wasserkreislauf', text: 'Wasser wechselt fortlaufend seinen Ort und seinen Aggregatzustand.' }
  }
];
