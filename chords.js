(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ChordKit = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
  const LETTER_PC = [0, 2, 4, 5, 7, 9, 11];
  const NOTE_PC = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11
  };

  const STRING_OPEN_PC = [4, 9, 2, 7, 11, 4];
  const E_ROOT_FRET = {
    0: 8,
    1: 9,
    2: 10,
    3: 11,
    4: 0,
    5: 1,
    6: 2,
    7: 3,
    8: 4,
    9: 5,
    10: 6,
    11: 7
  };
  const A_ROOT_FRET = {
    0: 3,
    1: 4,
    2: 5,
    3: 6,
    4: 7,
    5: 8,
    6: 9,
    7: 10,
    8: 11,
    9: 0,
    10: 1,
    11: 2
  };

  const QUALITY_DEFS = {
    major: {
      suffix: "",
      intervals: [0, 4, 7],
      degrees: [0, 2, 4],
      eShape: [0, 2, 2, 1, 0, 0],
      aShape: [null, 0, 2, 2, 2, 0]
    },
    minor: {
      suffix: "m",
      intervals: [0, 3, 7],
      degrees: [0, 2, 4],
      eShape: [0, 2, 2, 0, 0, 0],
      aShape: [null, 0, 2, 2, 1, 0]
    },
    seven: {
      suffix: "7",
      intervals: [0, 4, 7, 10],
      degrees: [0, 2, 4, 6],
      eShape: [0, 2, 0, 1, 0, 0],
      aShape: [null, 0, 2, 0, 2, 0]
    },
    maj7: {
      suffix: "maj7",
      intervals: [0, 4, 7, 11],
      degrees: [0, 2, 4, 6],
      eShape: [0, 2, 1, 1, 0, 0],
      aShape: [null, 0, 2, 1, 2, 0]
    },
    m7: {
      suffix: "m7",
      intervals: [0, 3, 7, 10],
      degrees: [0, 2, 4, 6],
      eShape: [0, 2, 0, 0, 0, 0],
      aShape: [null, 0, 2, 0, 1, 0]
    },
    m9: {
      suffix: "m9",
      intervals: [0, 3, 7, 10, 14],
      degrees: [0, 2, 4, 6, 8],
      eShape: [0, 2, 0, 0, 0, 2]
    },
    maj9: {
      suffix: "maj9",
      intervals: [0, 4, 7, 11, 14],
      degrees: [0, 2, 4, 6, 8],
      eShape: [0, 2, 1, 1, 0, 2]
    },
    nine: {
      suffix: "9",
      intervals: [0, 4, 7, 10, 14],
      degrees: [0, 2, 4, 6, 8],
      eShape: [0, 2, 0, 1, 0, 2]
    },
    six: {
      suffix: "6",
      intervals: [0, 4, 7, 9],
      degrees: [0, 2, 4, 5],
      eShape: [0, 2, 2, 1, 2, 0],
      aShape: [null, 0, 2, 2, 2, 2]
    },
    m6: {
      suffix: "m6",
      intervals: [0, 3, 7, 9],
      degrees: [0, 2, 4, 5],
      eShape: [0, 2, 2, 0, 2, 0],
      aShape: [null, 0, 2, 2, 1, 2]
    },
    add9: {
      suffix: "add9",
      intervals: [0, 4, 7, 14],
      degrees: [0, 2, 4, 8],
      eShape: [0, 2, 2, 1, 0, 2],
      aShape: [null, 0, 2, 4, 2, 0]
    },
    madd9: {
      suffix: "madd9",
      intervals: [0, 3, 7, 14],
      degrees: [0, 2, 4, 8],
      eShape: [0, 2, 2, 0, 0, 2]
    },
    sus2: {
      suffix: "sus2",
      intervals: [0, 2, 7],
      degrees: [0, 1, 4],
      eShape: [0, 2, 4, 4, 0, 0],
      aShape: [null, 0, 2, 2, 0, 0]
    },
    sus4: {
      suffix: "sus4",
      intervals: [0, 5, 7],
      degrees: [0, 3, 4],
      eShape: [0, 2, 2, 2, 0, 0],
      aShape: [null, 0, 2, 2, 3, 0]
    },
    dim: {
      suffix: "dim",
      intervals: [0, 3, 6],
      degrees: [0, 2, 4],
      preferA: true,
      eShape: [0, 1, 2, 0, null, 0],
      aShape: [null, 0, 1, 2, 1, null]
    },
    dim7: {
      suffix: "dim7",
      intervals: [0, 3, 6, 9],
      degrees: [0, 2, 4, 6],
      eShape: [0, 1, 2, 0, 2, 0]
    },
    aug: {
      suffix: "aug",
      intervals: [0, 4, 8],
      degrees: [0, 2, 4],
      eShape: [0, 3, 2, 1, 1, 0]
    },
    five: {
      suffix: "5",
      intervals: [0, 7],
      degrees: [0, 4],
      eShape: [0, 2, 2, null, null, null],
      aShape: [null, 0, 2, 2, null, null]
    }
  };

  function shape(frets, fingers, barre) {
    return {
      frets: frets,
      fingers: fingers,
      barre: barre || null,
      baseFret: 1
    };
  }

  const OPEN_SHAPES = {
    C: shape([-1, 3, 2, 0, 1, 0], [0, 3, 2, 0, 1, 0]),
    G: shape([3, 2, 0, 0, 0, 3], [2, 1, 0, 0, 0, 3]),
    D: shape([-1, -1, 0, 2, 3, 2], [0, 0, 0, 1, 3, 2]),
    A: shape([-1, 0, 2, 2, 2, 0], [0, 0, 1, 2, 3, 0]),
    E: shape([0, 2, 2, 1, 0, 0], [0, 2, 3, 1, 0, 0]),
    Am: shape([-1, 0, 2, 2, 1, 0], [0, 0, 2, 3, 1, 0]),
    Em: shape([0, 2, 2, 0, 0, 0], [0, 2, 3, 0, 0, 0]),
    Dm: shape([-1, -1, 0, 2, 3, 1], [0, 0, 0, 2, 3, 1]),
    C7: shape([-1, 3, 2, 3, 1, 0], [0, 3, 2, 4, 1, 0]),
    G7: shape([3, 2, 0, 0, 0, 1], [3, 2, 0, 0, 0, 1]),
    D7: shape([-1, -1, 0, 2, 1, 2], [0, 0, 0, 2, 1, 3]),
    A7: shape([-1, 0, 2, 0, 2, 0], [0, 0, 2, 0, 3, 0]),
    E7: shape([0, 2, 0, 1, 0, 0], [0, 2, 0, 1, 0, 0]),
    B7: shape([-1, 2, 1, 2, 0, 2], [0, 2, 1, 3, 0, 4]),
    Cmaj7: shape([-1, 3, 2, 0, 0, 0], [0, 3, 2, 0, 0, 0]),
    Gmaj7: shape([3, 2, 0, 0, 0, 2], [3, 2, 0, 0, 0, 1]),
    Dmaj7: shape([-1, -1, 0, 2, 2, 2], [0, 0, 0, 1, 2, 3]),
    Amaj7: shape([-1, 0, 2, 1, 2, 0], [0, 0, 2, 1, 3, 0]),
    Emaj7: shape([0, 2, 1, 1, 0, 0], [0, 3, 1, 2, 0, 0]),
    Am7: shape([-1, 0, 2, 0, 1, 0], [0, 0, 2, 0, 1, 0]),
    Em7: shape([0, 2, 0, 0, 0, 0], [0, 2, 0, 0, 0, 0]),
    Dm7: shape([-1, -1, 0, 2, 1, 1], [0, 0, 0, 2, 1, 1], {
      fret: 1,
      from: 4,
      to: 5,
      finger: 1
    }),
    Bm7: shape([-1, 2, 0, 2, 0, 2], [0, 1, 0, 2, 0, 3]),
    Dsus2: shape([-1, -1, 0, 2, 3, 0], [0, 0, 0, 1, 3, 0]),
    Dsus4: shape([-1, -1, 0, 2, 3, 3], [0, 0, 0, 1, 2, 3]),
    Asus2: shape([-1, 0, 2, 2, 0, 0], [0, 0, 1, 2, 0, 0]),
    Asus4: shape([-1, 0, 2, 2, 3, 0], [0, 0, 1, 2, 3, 0]),
    Esus4: shape([0, 2, 2, 2, 0, 0], [0, 2, 3, 4, 0, 0]),
    Cadd9: shape([-1, 3, 2, 0, 3, 0], [0, 3, 2, 0, 4, 0]),
    Gadd9: shape([3, 2, 0, 2, 0, 3], [3, 2, 0, 1, 0, 4])
  };

  const QUALITY_RULES = [
    [/^(maj9|M9|Δ9)$/, "maj9"],
    [/^(maj7|M7|Δ7|Δ)$/, "maj7"],
    [/^(maj|M)$/, "major"],
    [/^(m9|min9|-9)$/, "m9"],
    [/^(m7|min7|-7)$/, "m7"],
    [/^(m6|min6|-6)$/, "m6"],
    [/^(madd9|minadd9|-add9)$/, "madd9"],
    [/^(m|min|-)$/, "minor"],
    [/^add9$/, "add9"],
    [/^sus2$/, "sus2"],
    [/^(sus4|sus)$/, "sus4"],
    [/^dim7$/, "dim7"],
    [/^(dim|°|o)$/, "dim"],
    [/^(aug|\+)$/, "aug"],
    [/^6$/, "six"],
    [/^7$/, "seven"],
    [/^9$/, "nine"],
    [/^5$/, "five"],
    [/^$/, "major"]
  ];

  function mod12(n) {
    return ((n % 12) + 12) % 12;
  }

  function parseRoot(text) {
    const match = /^([A-Ga-g])([#b♯♭]?)/.exec(text || "");
    if (!match) return null;
    const letter = match[1].toUpperCase();
    let accidental = match[2] || "";
    if (accidental === "♯") accidental = "#";
    if (accidental === "♭") accidental = "b";
    const pc = mod12(
      NOTE_PC[letter] + (accidental === "#" ? 1 : accidental === "b" ? -1 : 0)
    );
    return {
      letter: letter,
      accidental: accidental,
      ascii: letter + accidental,
      pretty: letter + accidental,
      pc: pc
    };
  }

  function identifyQuality(raw) {
    const value = (raw || "").trim();
    for (let i = 0; i < QUALITY_RULES.length; i += 1) {
      if (QUALITY_RULES[i][0].test(value)) {
        return QUALITY_RULES[i][1];
      }
    }
    return null;
  }

  function parseChord(input) {
    const source = (input || "").trim();
    if (!source) return null;

    const rootMatch = parseRoot(source);
    if (!rootMatch) return null;

    let rest = source.slice(rootMatch.ascii.length).replace(/♯/g, "#").replace(/♭/g, "b");
    let bass = null;
    const slash = rest.indexOf("/");
    if (slash !== -1) {
      const bassSource = rest.slice(slash + 1).trim();
      rest = rest.slice(0, slash);
      bass = parseRoot(bassSource);
      if (!bass) return null;
    }

    const qualityKey = identifyQuality(rest);
    if (!qualityKey) return null;
    const quality = QUALITY_DEFS[qualityKey];
    const display = rootMatch.pretty + quality.suffix + (bass ? "/" + bass.pretty : "");
    const ascii = rootMatch.ascii + quality.suffix + (bass ? "/" + bass.ascii : "");

    return {
      input: source,
      root: rootMatch,
      rootPc: rootMatch.pc,
      qualityKey: qualityKey,
      quality: quality,
      bass: bass,
      bassPc: bass ? bass.pc : null,
      ascii: ascii,
      label: display,
      notes: spellChord(rootMatch, quality)
    };
  }

  function spellChord(root, quality) {
    return quality.intervals.map(function (interval, index) {
      const degree = quality.degrees[index];
      const letterIndex = (LETTERS.indexOf(root.letter) + degree) % 7;
      const letter = LETTERS[letterIndex];
      const naturalPc = LETTER_PC[letterIndex];
      const targetPc = mod12(root.pc + interval);
      let difference = mod12(targetPc - naturalPc);
      if (difference > 6) difference -= 12;
      const accidental = difference > 0
        ? "#".repeat(difference)
        : "b".repeat(Math.abs(difference));
      return {
        letter: letter,
        accidental: accidental,
        name: letter + accidental,
        pretty: letter + accidental,
        interval: interval,
        pc: targetPc
      };
    });
  }

  function buildMovable(template, fret) {
    const frets = template.map(function (offset) {
      return offset === null ? -1 : offset + fret;
    });
    const fingers = [0, 0, 0, 0, 0, 0];
    let barre = null;

    if (fret > 0) {
      const atRoot = [];
      frets.forEach(function (value, stringIndex) {
        if (value === fret) atRoot.push(stringIndex);
      });
      if (atRoot.length > 1) {
        barre = {
          fret: fret,
          from: Math.min.apply(null, atRoot),
          to: Math.max.apply(null, atRoot),
          finger: 1
        };
        atRoot.forEach(function (stringIndex) {
          fingers[stringIndex] = 1;
        });
      } else if (atRoot.length === 1) {
        fingers[atRoot[0]] = 1;
      }
    }

    const groups = new Map();
    frets.forEach(function (value, stringIndex) {
      if (value > 0 && value !== fret) {
        if (!groups.has(value)) groups.set(value, []);
        groups.get(value).push(stringIndex);
      }
    });

    const sortedFrets = Array.from(groups.keys()).sort(function (a, b) {
      return a - b;
    });
    let nextFinger = barre || fingers.indexOf(1) !== -1 ? 2 : 1;
    sortedFrets.forEach(function (value) {
      groups.get(value).forEach(function (stringIndex) {
        fingers[stringIndex] = Math.min(nextFinger, 5);
        nextFinger += 1;
      });
    });

    return {
      frets: frets,
      fingers: fingers,
      barre: barre,
      baseFret: fret > 0 ? fret : 1
    };
  }

  function getGuitarShape(chord) {
    if (!chord) return null;
    const open = OPEN_SHAPES[chord.root.ascii + chord.quality.suffix];
    if (open) {
      return {
        frets: open.frets.slice(),
        fingers: open.fingers.slice(),
        barre: open.barre,
        baseFret: 1
      };
    }

    const quality = chord.quality;
    if (quality.preferA && quality.aShape) {
      return buildMovable(quality.aShape, A_ROOT_FRET[chord.rootPc]);
    }
    const choices = [];
    if (quality.eShape) {
      choices.push({
        template: quality.eShape,
        fret: E_ROOT_FRET[chord.rootPc],
        order: 0
      });
    }
    if (quality.aShape) {
      choices.push({
        template: quality.aShape,
        fret: A_ROOT_FRET[chord.rootPc],
        order: 1
      });
    }
    if (!choices.length) return null;

    choices.sort(function (a, b) {
      if (a.fret === 0 && b.fret !== 0) return -1;
      if (b.fret === 0 && a.fret !== 0) return 1;
      if (a.fret !== b.fret) return a.fret - b.fret;
      return a.order - b.order;
    });

    return buildMovable(choices[0].template, choices[0].fret);
  }

  function guitarNotes(shape) {
    if (!shape) return [];
    const notes = [];
    shape.frets.forEach(function (fret, stringIndex) {
      if (fret < 0) return;
      notes.push({
        string: stringIndex + 1,
        fret: fret,
        pc: mod12(STRING_OPEN_PC[stringIndex] + fret)
      });
    });
    return notes;
  }

  const PIANO_LOW = 60;
  const PIANO_HIGH = 79;
  const WHITE_PCS = [0, 2, 4, 5, 7, 9, 11];

  function getPianoVoicing(chord, hand) {
    if (!chord) return null;
    let notes = [];
    chord.notes.forEach(function (note) {
      let midi = PIANO_LOW + chord.rootPc + note.interval;
      while (midi > PIANO_HIGH) midi -= 12;
      while (midi < PIANO_LOW) midi += 12;
      notes.push({
        midi: midi,
        pc: note.pc,
        name: note.pretty,
        black: WHITE_PCS.indexOf(note.pc) === -1
      });
    });

    const seen = new Set();
    notes = notes.filter(function (note) {
      if (seen.has(note.midi)) return false;
      seen.add(note.midi);
      return true;
    });
    notes.sort(function (a, b) {
      return a.midi - b.midi;
    });

    const baseFingers = fingerPattern(notes.length);
    notes.forEach(function (note, index) {
      note.finger = hand === "left"
        ? baseFingers[baseFingers.length - 1 - index]
        : baseFingers[index];
    });

    return {
      notes: notes,
      hand: hand === "left" ? "left" : "right",
      noteText: notes.map(function (note) { return note.name; }).join(" · "),
      fingerText: notes.map(function (note) { return note.finger; }).join(" · ")
    };
  }

  function fingerPattern(count) {
    if (count <= 1) return [1];
    if (count === 2) return [1, 5];
    if (count === 3) return [1, 3, 5];
    if (count === 4) return [1, 2, 3, 5];
    return [1, 2, 3, 4, 5].slice(0, count);
  }

  const CHORD_SUGGESTIONS = [
    "C", "Cm", "C7", "Cmaj7", "Cm7", "Cadd9", "Csus2", "Csus4", "C6", "Cm6", "Cdim", "Caug",
    "D", "Dm", "D7", "Dmaj7", "Dm7", "Dsus2", "Dsus4",
    "E", "Em", "E7", "Emaj7", "Em7", "Esus4",
    "F", "Fm", "F7", "Fmaj7", "Fm7",
    "G", "Gm", "G7", "Gmaj7", "Gm7", "Gadd9", "Gsus4",
    "A", "Am", "A7", "Amaj7", "Am7", "Asus2", "Asus4",
    "B", "Bm", "B7", "Bmaj7", "Bm7",
    "Bb", "Bbm", "Bb7", "Eb", "Ebm", "Ab", "Abm", "Db", "Dbm",
    "F#", "F#m", "F#m7", "C#", "C#m", "C#m7", "G#m", "Bbmaj7", "Ebmaj7"
  ];

  return {
    QUALITY_DEFS: QUALITY_DEFS,
    OPEN_SHAPES: OPEN_SHAPES,
    CHORD_SUGGESTIONS: CHORD_SUGGESTIONS,
    parseChord: parseChord,
    getGuitarShape: getGuitarShape,
    guitarNotes: guitarNotes,
    getPianoVoicing: getPianoVoicing
  };
});
