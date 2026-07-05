export const chapters = [
  {
    id: 'island-arrival', title: 'Die Insel im Meer', intro: 'Unsere Forschungsreise beginnt an einer kleinen Insel.', world: 'island', duration: 24,
    telemetry: { place: 'INSELKÜSTE', process: 'ANFLUG', state: 'FLÜSSIG', energy: 'SONNE' },
    narration: 'Vor uns liegt eine kleine Insel im Meer. Rund um den Sandstrand wachsen Palmen. Hier beginnt unsere Forschungsreise. Wasser ist ständig unterwegs. Es verdunstet, bildet Wolken, fällt als Regen und fließt wieder zum Meer. Heute begleiten wir ein einzelnes Wassermolekül auf diesem Weg.',
    cues: [[0,5,'Vor uns liegt eine kleine Insel im Meer.'],[5,10,'Rund um den Sandstrand wachsen Palmen.'],[10,16,'Wasser ist ständig unterwegs.'],[16,24,'Heute begleiten wir ein einzelnes Wassermolekül auf seinem Weg.']]
  },
  {
    id: 'boarding', title: 'Einsteigen in die Aqua Explorer', intro: 'Die Einstiegsluke öffnet sich und das Cockpit erwacht.', world: 'island', duration: 26,
    telemetry: { place: 'AQUA EXPLORER', process: 'EINSTIEG', state: 'BEREIT', energy: 'SYSTEMSTART' },
    narration: 'Die Aqua Explorer wartet am Strand. Die Einstiegsluke öffnet sich. Wir fahren langsam in das Forschungsschiff hinein und nehmen im Cockpit Platz. Die Anzeigen leuchten auf. Navigation, Molekülscanner und Schrumpfantrieb sind bereit. Wir starten in Richtung Wasseroberfläche.',
    cues: [[0,6,'Die Aqua Explorer wartet am Strand.'],[6,12,'Die Einstiegsluke öffnet sich.'],[12,19,'Wir fahren in das Forschungsschiff hinein und nehmen im Cockpit Platz.'],[19,26,'Alle Systeme sind bereit.']]
  },
  {
    id: 'shrinking', title: 'Der Schrumpfstrahl', intro: 'Die Umgebung wird riesig und ein Wassertropfen zum Reiseziel.', world: 'island', duration: 28,
    telemetry: { place: 'WASSEROBERFLÄCHE', process: 'SCHRUMPFEN', state: 'GRÖSSE SINKT', energy: 'HOCH' },
    narration: 'Schrumpfstrahlen aktiv. Unser Schiff wird immer kleiner. Die Insel verändert sich nicht, aber für uns wirken Palmen, Sandkörner und Wellen plötzlich riesig. Ein einzelner Wassertropfen füllt nun fast das ganze Sichtfeld. Wir fliegen durch seine Oberfläche und wechseln in die Teilchenwelt.',
    cues: [[0,5,'Schrumpfstrahlen aktiv.'],[5,12,'Unser Schiff wird immer kleiner.'],[12,19,'Palmen, Sandkörner und Wellen wirken plötzlich riesig.'],[19,28,'Wir fliegen in einen Wassertropfen hinein.']],
    keyword: { at: 3, title: 'Maßstab', text: 'Die Umgebung bleibt gleich groß. Nur unser Forschungsschiff schrumpft.' }
  },
  {
    id: 'inside-drop', title: 'Im Wassertropfen', intro: 'Wir sehen Wasser aus der Teilchenperspektive.', world: 'molecular', duration: 31,
    telemetry: { place: 'WASSERTROPFEN', process: 'TEILCHENBEOBACHTUNG', state: 'FLÜSSIG', energy: 'NORMAL' },
    narration: 'Wir befinden uns in einem Wassertropfen. Wasser besteht aus winzigen Wassermolekülen. Jedes davon besteht aus zwei Wasserstoffatomen und einem Sauerstoffatom. In flüssigem Wasser liegen die Moleküle dicht beieinander. Sie bewegen sich ständig und gleiten aneinander vorbei. Das leuchtende Molekül begleiten wir weiter.',
    cues: [[0,5,'Wir befinden uns in einem Wassertropfen.'],[5,12,'Wasser besteht aus winzigen Wassermolekülen.'],[12,19,'Ein Wassermolekül besteht aus zwei Wasserstoffatomen und einem Sauerstoffatom.'],[19,26,'Die Moleküle bewegen sich ständig.'],[26,31,'Das leuchtende Molekül begleiten wir weiter.']],
    keyword: { at: 10, title: 'H₂O', text: 'Zwei Wasserstoffatome und ein Sauerstoffatom bilden ein Wassermolekül.' }
  },
  {
    id: 'evaporation', title: 'Verdunstung', intro: 'Sonnenenergie lässt unser Molekül die Wasseroberfläche verlassen.', world: 'molecular', duration: 38,
    telemetry: { place: 'WASSEROBERFLÄCHE', process: 'VERDUNSTUNG', state: 'FLÜSSIG → GASFÖRMIG', energy: 'STEIGEND' },
    narration: 'Die Sonne erwärmt das Wasser. Dadurch bewegen sich einige Moleküle immer schneller. Unser Molekül erhält genug Energie, um die Flüssigkeit zu verlassen. Es steigt als Teil des unsichtbaren Wasserdampfs in die Luft. Diesen Übergang von flüssigem zu gasförmigem Wasser nennt man Verdunstung. Das Wasser ist nicht verschwunden.',
    cues: [[0,7,'Die Sonne erwärmt das Wasser.'],[7,14,'Einige Moleküle bewegen sich immer schneller.'],[14,22,'Unser Molekül verlässt die Flüssigkeit.'],[22,30,'Diesen Vorgang nennt man Verdunstung.'],[30,38,'Das Wasser ist nicht verschwunden.']],
    keyword: { at: 22, title: 'Verdunstung', text: 'Flüssiges Wasser wird gasförmig.' }
  },
  {
    id: 'cloud', title: 'Eine Wolke entsteht', intro: 'In kühlerer Luft wird unser Molekül wieder Teil eines Tröpfchens.', world: 'cloud', duration: 34,
    telemetry: { place: 'ATMOSPHÄRE', process: 'KONDENSATION', state: 'GASFÖRMIG → FLÜSSIG', energy: 'SINKEND' },
    narration: 'Warme Luft trägt unser Wassermolekül nach oben. Dort ist es kühler. Die Moleküle bewegen sich langsamer und sammeln sich an winzigen Schwebeteilchen. Unser Molekül wird mit vielen Nachbarn wieder Teil eines kleinen flüssigen Tröpfchens. Millionen solcher Tröpfchen bilden gemeinsam eine Wolke. Dieser Vorgang heißt Kondensation.',
    cues: [[0,7,'Warme Luft trägt unser Molekül nach oben.'],[7,14,'In der Höhe ist es kühler.'],[14,22,'Unser Molekül wird wieder Teil eines kleinen Tröpfchens.'],[22,29,'Viele Tröpfchen bilden gemeinsam eine Wolke.'],[29,34,'Dieser Vorgang heißt Kondensation.']],
    keyword: { at: 27, title: 'Kondensation', text: 'Gasförmiges Wasser wird wieder flüssig.' }
  },
  {
    id: 'cloud-travel', title: 'Die Wolke zieht über das Land', intro: 'Der Wind transportiert das Wasser von der Insel ins Landesinnere.', world: 'cloud', duration: 30,
    telemetry: { place: 'WOLKE', process: 'TRANSPORT DURCH WIND', state: 'FLÜSSIGE TRÖPFCHEN', energy: 'KÜHL' },
    narration: 'Der Wind bewegt die Wolke von der Küste über das Land. Unser Wassermolekül reist in einem winzigen Wolkentröpfchen mit. Unter uns ziehen Strand, Palmen, Wiesen und Wälder vorbei. In der Wolke stoßen kleine Tröpfchen zusammen. Sie verbinden sich und werden immer größer und schwerer.',
    cues: [[0,7,'Der Wind bewegt die Wolke über das Land.'],[7,14,'Unser Molekül reist in einem Wolkentröpfchen mit.'],[14,21,'Unter uns zieht die Landschaft vorbei.'],[21,30,'Die Tröpfchen werden größer und schwerer.']]
  },
  {
    id: 'rain', title: 'Es beginnt zu regnen', intro: 'Unser Molekül fällt mit seinen Nachbarn als Regentropfen zur Erde.', world: 'rain', duration: 31,
    telemetry: { place: 'ÜBER DEM LAND', process: 'NIEDERSCHLAG', state: 'FLÜSSIG', energy: 'FALLEND' },
    narration: 'Der Tropfen ist nun zu schwer, um in der Wolke zu schweben. Er fällt zur Erde. Unser Molekül ist zusammen mit vielen Nachbarn wieder Teil eines flüssigen Regentropfens. Wasser, das aus Wolken zur Erde fällt, nennt man Niederschlag. Unser Tropfen landet auf einer Wiese und fließt langsam bergab.',
    cues: [[0,7,'Der Tropfen ist zu schwer und fällt zur Erde.'],[7,15,'Unser Molekül ist Teil eines flüssigen Regentropfens.'],[15,23,'Das nennt man Niederschlag.'],[23,31,'Der Tropfen landet auf einer Wiese und fließt bergab.']],
    keyword: { at: 15, title: 'Niederschlag', text: 'Wasser fällt aus Wolken zur Erdoberfläche.' }
  },
  {
    id: 'land-routes', title: 'Viele Wege auf dem Land', intro: 'Unser Wasser fließt im Bach, andere Tropfen versickern oder gelangen in Pflanzen.', world: 'land', duration: 42,
    telemetry: { place: 'BACH UND BODEN', process: 'ABFLUSS UND VERSICKERUNG', state: 'FLÜSSIG', energy: 'BEWEGUNG' },
    narration: 'Unser Tropfen fließt mit anderen Tropfen zu einer kleinen Rinne. Daraus wird ein Bach. Gleichzeitig nehmen andere Wassertropfen andere Wege. Einige versickern zwischen Sand und Steinen und werden zu Grundwasser. Andere werden von Pflanzenwurzeln aufgenommen und bis in die Blätter transportiert. Unser Molekül bleibt im Bach. Weitere Bäche kommen hinzu, und aus dem Bach wird ein Fluss.',
    cues: [[0,8,'Aus vielen Tropfen entsteht eine kleine Rinne und dann ein Bach.'],[8,17,'Andere Tropfen versickern im Boden.'],[17,25,'Ein Teil wird zu Grundwasser.'],[25,33,'Pflanzen nehmen Wasser über ihre Wurzeln auf.'],[33,42,'Unser Bach wächst zu einem Fluss.']],
    keyword: { at: 9, title: 'Versickerung', text: 'Wasser dringt durch Zwischenräume in den Boden ein.' }
  },
  {
    id: 'river-sea', title: 'Zurück ins Meer', intro: 'Der Fluss trägt unser Molekül zurück zur Insel und ins Meer.', world: 'land', duration: 34,
    telemetry: { place: 'FLUSS UND MÜNDUNG', process: 'RÜCKKEHR ZUM MEER', state: 'FLÜSSIG', energy: 'STRÖMUNG' },
    narration: 'Der Fluss wird breiter und fließt in Richtung Küste. Er transportiert unser Wassermolekül gemeinsam mit unzähligen anderen Molekülen. Schließlich erreicht der Fluss das Meer. Am Horizont sehen wir wieder unsere kleine Insel. Wir sind am Ausgangspunkt angekommen. Doch die Sonne scheint weiter, und der Wasserkreislauf kann von Neuem beginnen.',
    cues: [[0,8,'Der Fluss wird breiter und fließt zur Küste.'],[8,16,'Er transportiert unser Molekül zurück zum Meer.'],[16,24,'Am Horizont erscheint wieder die kleine Insel.'],[24,34,'Der Wasserkreislauf kann von Neuem beginnen.']]
  },
  {
    id: 'overview', title: 'Der ganze Wasserkreislauf', intro: 'Zum Abschluss sehen wir alle Stationen unserer Reise gleichzeitig.', world: 'overview', duration: 35,
    telemetry: { place: 'GESAMTMODELL', process: 'WASSERKREISLAUF', state: 'VERÄNDERLICH', energy: 'SONNE' },
    narration: 'Unsere Reise zeigt einen möglichen Weg durch den Wasserkreislauf. Die Sonne lässt Wasser verdunsten. In kühler Luft entstehen Wolken. Wind trägt sie über das Land. Niederschlag bringt Wasser zur Erde. Dort fließt es in Bächen und Flüssen, versickert als Grundwasser oder wird von Pflanzen aufgenommen. Schließlich gelangt ein Teil zurück ins Meer. Wasser verschwindet nicht. Es wechselt seinen Ort und manchmal seinen Aggregatzustand.',
    cues: [[0,7,'Die Sonne lässt Wasser verdunsten.'],[7,14,'In kühler Luft entstehen Wolken.'],[14,21,'Niederschlag bringt Wasser zur Erde.'],[21,28,'Wasser fließt, versickert oder wird von Pflanzen aufgenommen.'],[28,35,'Schließlich gelangt es zurück ins Meer.']],
    keyword: { at: 2, title: 'Wasserkreislauf', text: 'Wasser bewegt sich fortlaufend zwischen Meer, Luft und Land.' }
  }
];
