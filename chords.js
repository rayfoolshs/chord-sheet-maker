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

  function isNoChord(input) {
    const value = (input || "").trim();
    if (!value) return false;
    const simplified = value.replace(/[\s.]/g, "").toLowerCase();
    return simplified === "nc" || simplified === "nochord";
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

  /* Highest fret a movable voicing may start on, so diagrams stay readable. */
  const MAX_VOICING_FRET = 15;

  /* Root positions on the D string, for the four-string (D G B E) shapes. */
  const D_ROOT_FRET = {
    0: 10,
    1: 11,
    2: 0,
    3: 1,
    4: 2,
    5: 3,
    6: 4,
    7: 5,
    8: 6,
    9: 7,
    10: 8,
    11: 9
  };
  const FOUR_STRING_STRINGS = [2, 3, 4, 5];
  const MAX_FOUR_STRING_SPAN = 4;

  function shapeSignature(shape) {
    return shape.frets.join(",") + "|" + (shape.baseFret || 1);
  }

  function describeVoicing(shape, family) {
    const baseFret = shape.baseFret || 1;
    const familyName = family === "Open" ? "Open shape" : family + " shape";
    if (shape.barre) return "Barre · " + baseFret + "fr · " + familyName;
    if (baseFret === 1) return "Open shape";
    return baseFret + "fr · " + familyName;
  }

  /* The tones a voicing should try to keep: drop the perfect fifth, keep the colour. */
  function voicingCore(quality) {
    const intervals = quality.intervals;
    const hasThird = intervals.indexOf(3) !== -1 || intervals.indexOf(4) !== -1;
    if (!hasThird) return intervals;
    return intervals.filter(function (interval) { return interval !== 7; });
  }

  function buildPartialShape(stringIndexes, frets) {
    const allFrets = [-1, -1, -1, -1, -1, -1];
    const fingers = [0, 0, 0, 0, 0, 0];
    const runs = [];

    stringIndexes.forEach(function (stringIndex, position) {
      allFrets[stringIndex] = frets[position];
    });

    let position = 0;
    while (position < stringIndexes.length) {
      const fret = frets[position];
      if (fret <= 0) {
        position += 1;
        continue;
      }
      let end = position;
      while (end + 1 < frets.length && frets[end + 1] === fret) end += 1;
      if (end > position) {
        runs.push({
          fret: fret,
          from: stringIndexes[position],
          to: stringIndexes[end]
        });
      }
      position = end + 1;
    }

    runs.sort(function (a, b) {
      return (b.to - b.from) - (a.to - a.from) || a.fret - b.fret;
    });

    let barre = null;
    if (runs.length) {
      barre = { fret: runs[0].fret, from: runs[0].from, to: runs[0].to, finger: 1 };
      for (let index = barre.from; index <= barre.to; index += 1) fingers[index] = 1;
    }

    const remaining = [];
    stringIndexes.forEach(function (stringIndex, position) {
      if (allFrets[stringIndex] <= 0 || fingers[stringIndex]) return;
      remaining.push({ stringIndex: stringIndex, fret: allFrets[stringIndex] });
    });
    remaining.sort(function (a, b) {
      return a.fret - b.fret || a.stringIndex - b.stringIndex;
    });

    let nextFinger = barre ? 2 : 1;
    remaining.forEach(function (note) {
      fingers[note.stringIndex] = nextFinger;
      nextFinger += 1;
    });

    const lowestFret = Math.min.apply(null, frets);
    return {
      frets: allFrets,
      fingers: fingers,
      barre: barre,
      baseFret: lowestFret > 0 ? lowestFret : 1
    };
  }

  /*
   * Compact root-position voicings on the top four strings (D G B E).
   * Enumerates every playable combination inside a four-fret window whose
   * lowest note is the root, then keeps the two that hold most of the chord's
   * character tones with the tightest stretch.
   */
  function fourStringVoicings(chord) {
    if (!chord) return [];
    const chordPcs = chord.notes.map(function (note) { return note.pc; });
    const corePcs = voicingCore(chord.quality).map(function (interval) {
      return mod12(chord.rootPc + interval);
    });
    const rootFret = D_ROOT_FRET[chord.rootPc];
    const lowest = Math.max(0, rootFret - MAX_FOUR_STRING_SPAN);
    const highest = rootFret + MAX_FOUR_STRING_SPAN;
    const candidates = [];
    const seen = new Set();

    for (let gFret = lowest; gFret <= highest; gFret += 1) {
      for (let bFret = lowest; bFret <= highest; bFret += 1) {
        for (let eFret = lowest; eFret <= highest; eFret += 1) {
          const frets = [rootFret, gFret, bFret, eFret];
          const span = Math.max.apply(null, frets) - Math.min.apply(null, frets);
          if (span > MAX_FOUR_STRING_SPAN) continue;

          const pcs = frets.map(function (fret, index) {
            return mod12(STRING_OPEN_PC[FOUR_STRING_STRINGS[index]] + fret);
          });
          const inChord = pcs.every(function (pc) {
            return chordPcs.indexOf(pc) !== -1;
          });
          if (!inChord) continue;

          const signature = frets.join(",");
          if (seen.has(signature)) continue;
          seen.add(signature);

          const hits = new Set(pcs.filter(function (pc) {
            return corePcs.indexOf(pc) !== -1;
          })).size;
          candidates.push({
            frets: frets,
            hits: hits,
            distinct: new Set(pcs).size,
            span: span,
            lowest: Math.min.apply(null, frets)
          });
        }
      }
    }

    candidates.sort(function (a, b) {
      return b.hits - a.hits ||
        b.distinct - a.distinct ||
        a.span - b.span ||
        a.lowest - b.lowest;
    });

    /* One shape per neck position: a second voicing at the same frets is noise. */
    const usedPositions = new Set();
    const chosen = [];
    for (let index = 0; index < candidates.length && chosen.length < 2; index += 1) {
      const candidate = candidates[index];
      if (usedPositions.has(candidate.lowest)) continue;
      usedPositions.add(candidate.lowest);
      chosen.push(candidate);
    }

    return chosen.map(function (candidate) {
      const shape = buildPartialShape([2, 3, 4, 5], candidate.frets);
      return {
        id: "d" + candidate.frets.join("-"),
        label: "4-string · " + (candidate.lowest > 0 ? candidate.lowest + "fr" : "open"),
        shape: shape
      };
    });
  }

  const THREE_STRING_GROUPS = [
    { name: "DGB", strings: [2, 3, 4] },
    { name: "GBE", strings: [3, 4, 5] }
  ];
  const MAX_THREE_STRING_SPAN = 4;
  const INVERSION_NAMES = ["root", "1st inv", "2nd inv", "3rd inv", "4th inv"];

  /*
   * Three-note voicings on adjacent string groups (D G B and G B E), one per
   * inversion. Keeping the root and the third (or every character tone for
   * sus/dim/aug/power chords) means an inversion reads as the same chord, only
   * with a different note in the bass.
   */
  function threeStringVoicings(chord) {
    if (!chord) return [];
    const quality = chord.quality;
    const chordPcs = chord.notes.map(function (note) { return note.pc; });
    const corePcs = voicingCore(quality).map(function (interval) {
      return mod12(chord.rootPc + interval);
    });
    const requiredHits = corePcs.length <= 3 ? corePcs.length : corePcs.length - 1;
    const requiredNotes = Math.min(3, new Set(chordPcs).size);
    const voicings = [];

    THREE_STRING_GROUPS.forEach(function (group) {
      const bestForInversion = new Map();

      for (let start = 0; start + MAX_THREE_STRING_SPAN <= MAX_VOICING_FRET; start += 1) {
        const options = group.strings.map(function (stringIndex) {
          const frets = [];
          for (let fret = start; fret <= start + MAX_THREE_STRING_SPAN; fret += 1) {
            if (chordPcs.indexOf(mod12(STRING_OPEN_PC[stringIndex] + fret)) !== -1) {
              frets.push(fret);
            }
          }
          return frets;
        });

        options[0].forEach(function (firstFret) {
          options[1].forEach(function (secondFret) {
            options[2].forEach(function (thirdFret) {
              const frets = [firstFret, secondFret, thirdFret];
              const pcs = frets.map(function (fret, index) {
                return mod12(STRING_OPEN_PC[group.strings[index]] + fret);
              });
              if (new Set(pcs).size < requiredNotes) return;

              const hits = new Set(pcs.filter(function (pc) {
                return corePcs.indexOf(pc) !== -1;
              })).size;
              if (hits < requiredHits) return;
              if (pcs.indexOf(chord.rootPc) === -1) return;

              const bassPc = pcs[0];
              const inversion = quality.intervals.findIndex(function (interval) {
                return mod12(chord.rootPc + interval) === bassPc;
              });
              if (inversion < 0) return;

              const highestInterval = Math.max.apply(null, quality.intervals.filter(function (interval) {
                return pcs.indexOf(mod12(chord.rootPc + interval)) !== -1;
              }));
              const candidate = {
                frets: frets,
                hits: hits,
                highestInterval: highestInterval,
                span: Math.max.apply(null, frets) - Math.min.apply(null, frets),
                lowest: Math.min.apply(null, frets)
              };

              const previous = bestForInversion.get(inversion);
              if (!previous ||
                candidate.hits > previous.hits ||
                (candidate.hits === previous.hits && candidate.highestInterval < previous.highestInterval) ||
                (candidate.hits === previous.hits && candidate.highestInterval === previous.highestInterval &&
                  (candidate.span < previous.span ||
                    (candidate.span === previous.span && candidate.lowest < previous.lowest)))) {
                bestForInversion.set(inversion, candidate);
              }
            });
          });
        });
      }

      Array.from(bestForInversion.keys())
        .sort(function (a, b) { return a - b; })
        .slice(0, 3)
        .forEach(function (inversion) {
          const candidate = bestForInversion.get(inversion);
          voicings.push({
            id: "t" + group.name.toLowerCase() + "-" + inversion + "-" + candidate.frets.join("-"),
            label: "3-string · " + group.name + " · " + (INVERSION_NAMES[inversion] || inversion + "th inv") +
              " · " + (candidate.lowest > 0 ? candidate.lowest + "fr" : "open"),
            shape: buildPartialShape(group.strings, candidate.frets)
          });
        });
    });

    return voicings;
  }

  /*
   * Every shape that plays this chord: the curated open shape where one exists,
   * then the movable E- and A-shape barre forms (plus the octave-up position
   * when it still fits on the neck), then compact top-four-string voicings.
   * The shape the app would pick by default is always first, so callers can
   * treat index 0 as "unchanged".
   */
  function getGuitarVoicings(chord) {
    if (!chord) return [];
    const quality = chord.quality;
    const candidates = [];

    const open = OPEN_SHAPES[chord.root.ascii + quality.suffix];
    if (open) {
      candidates.push({
        id: "open",
        family: "Open",
        shape: {
          frets: open.frets.slice(),
          fingers: open.fingers.slice(),
          barre: open.barre,
          baseFret: 1
        }
      });
    }

    [
      { family: "E", template: quality.eShape, roots: E_ROOT_FRET },
      { family: "A", template: quality.aShape, roots: A_ROOT_FRET }
    ].forEach(function (choice) {
      if (!choice.template) return;
      const baseFret = choice.roots[chord.rootPc];
      const positions = [baseFret];
      if (baseFret + 12 <= MAX_VOICING_FRET) positions.push(baseFret + 12);
      positions.forEach(function (fret) {
        candidates.push({
          id: choice.family.toLowerCase() + fret,
          family: choice.family,
          shape: buildMovable(choice.template, fret)
        });
      });
    });

    fourStringVoicings(chord).forEach(function (voicing) {
      candidates.push({
        id: voicing.id,
        label: voicing.label,
        shape: voicing.shape
      });
    });

    threeStringVoicings(chord).forEach(function (voicing) {
      candidates.push({
        id: voicing.id,
        label: voicing.label,
        shape: voicing.shape
      });
    });

    const defaultShape = getGuitarShape(chord);
    const defaultKey = defaultShape ? shapeSignature(defaultShape) : null;
    const seen = new Set();
    const voicings = [];

    candidates.forEach(function (candidate) {
      const key = shapeSignature(candidate.shape);
      if (seen.has(key)) return;
      seen.add(key);
      voicings.push({
        id: candidate.id,
        label: candidate.label ||
          describeVoicing(candidate.shape, candidate.family),
        shape: candidate.shape
      });
    });

    const defaultIndex = voicings.findIndex(function (voicing) {
      return shapeSignature(voicing.shape) === defaultKey;
    });
    if (defaultIndex > 0) {
      voicings.unshift(voicings.splice(defaultIndex, 1)[0]);
    }
    return voicings;
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
    "NC",
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
    isNoChord: isNoChord,
    getGuitarShape: getGuitarShape,
    getGuitarVoicings: getGuitarVoicings,
    guitarNotes: guitarNotes,
    getPianoVoicing: getPianoVoicing
  };
});
