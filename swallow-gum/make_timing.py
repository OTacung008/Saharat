# Splits the ElevenLabs take into phrases, places each phrase on the video timeline,
# and estimates per-word timings (syllable-weighted) for word-by-word captions.
import json, re, subprocess
PHRASES = [  # (raw start, raw end, video start, text)
  (0.047, 2.268, 0.30, "This is what happens if you swallow gum."),
  (2.589, 5.448, 3.70, "It slides down your esophagus, straight into your stomach."),
  (5.719, 9.131, 7.50, "Your stomach acid attacks it, but it can't break down the gum base."),
  (9.324, 13.622, 11.90, "So it just keeps moving, through your intestines, and leaves your body in a few days."),
  (13.878, 15.358, 17.10, "Not seven years!"),
]
def syl(w):
    w = re.sub(r"[^a-z]", "", w.lower())
    n = len(re.findall(r"[aeiouy]+", w)) - (1 if w.endswith("e") and not w.endswith("le") and len(w) > 2 else 0)
    return max(1, n)
words = []
for a, b, v, text in PHRASES:
    toks = text.split()
    wts = [syl(t) + (0.8 if t[-1] in ",." else 0) + 0.35 for t in toks]
    tot, acc = sum(wts), 0
    for t, w in zip(toks, wts):
        s = v + (b - a) * acc / tot; acc += w
        words.append({"w": t.strip(",.").upper(), "t": round(s, 3)})
json.dump(words, open("words.json", "w"), indent=0)
# assemble voiceover.wav on a 20 s timeline
inputs, filt = [], []
for i, (a, b, v, _) in enumerate(PHRASES):
    inputs += ["-ss", str(a - 0.04), "-to", str(b + 0.12), "-i", "voiceover_raw.mp3"]
    d = int(v * 1000) - 40
    filt.append(f"[{i}:a]adelay={d}|{d}[p{i}]")
filt.append("".join(f"[p{i}]" for i in range(len(PHRASES))) + f"amix=inputs={len(PHRASES)}:normalize=0,apad=whole_dur=20[o]")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *inputs, "-filter_complex", ";".join(filt), "-map", "[o]", "-t", "20", "voiceover.wav"], check=True)
print(len(words), "words")
