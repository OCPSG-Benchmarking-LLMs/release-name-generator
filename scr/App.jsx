import React, { useMemo, useState } from "react";

const ADJECTIVES = [
  "amber", "ancient", "autumn", "azure", "bold", "brisk", "calm", "cinder",
  "clear", "crimson", "crystal", "distant", "dry", "ember", "evening", "frozen",
  "gentle", "golden", "granite", "hidden", "ivory", "jade", "lively", "lunar",
  "misty", "noble", "opal", "quiet", "rapid", "red", "royal", "rustic",
  "shadow", "silent", "silver", "solar", "spring", "steady", "stone", "summer",
  "swift", "tidal", "urban", "velvet", "verdant", "violet", "winter", "young"
];

const NOUNS = [
  "anchor", "atlas", "aurora", "bridge", "cedar", "cipher", "comet", "crown",
  "delta", "ember", "falcon", "field", "fjord", "forest", "forge", "garden",
  "glacier", "harbour", "horizon", "isle", "keystone", "lagoon", "lantern",
  "maple", "meadow", "monolith", "oak", "orbit", "orchard", "passage", "peak",
  "phoenix", "pine", "prairie", "quartz", "raven", "reef", "ridge", "river",
  "signal", "spruce", "summit", "thunder", "torch", "vale", "voyage", "wave",
  "willow"
];

function hashStringToUint32(input) {
  const str = String(input ?? "");
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function titleCase(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function generateCodename(seedInput, sequence = 0) {
  const baseSeed = hashStringToUint32(`${seedInput}::${sequence}`);
  const rand = mulberry32(baseSeed);
  const adjective = ADJECTIVES[Math.floor(rand() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(rand() * NOUNS.length)];
  return `${adjective}-${noun}`;
}

function buildVersionString({ major, minor, patch, prereleaseTag, prereleaseNumber }) {
  const base = `v${major}.${minor}.${patch}`;
  if (!prereleaseTag || prereleaseTag === "none") return base;
  return `${base}-${prereleaseTag}.${prereleaseNumber}`;
}

function buildReleaseLabel({ includeVersionPolicy, versionConfig, codename }) {
  if (!includeVersionPolicy) {
    return `"${titleCase(codename)}"`;
  }
  return `${buildVersionString(versionConfig)} "${titleCase(codename)}"`;
}

export default function App() {
  const [seed, setSeed] = useState("test_seed");
  const [sequence, setSequence] = useState(0);
  const [includeVersionPolicy, setIncludeVersionPolicy] = useState(true);
  const [major, setMajor] = useState("0");
  const [minor, setMinor] = useState("1");
  const [patch, setPatch] = useState("0");
  const [prereleaseTag, setPrereleaseTag] = useState("beta");
  const [prereleaseNumber, setPrereleaseNumber] = useState("1");
  const [copied, setCopied] = useState(false);

  const codename = useMemo(() => generateCodename(seed, sequence), [seed, sequence]);

  const output = useMemo(() => {
    return buildReleaseLabel({
      includeVersionPolicy,
      versionConfig: {
        major: Number(major || 0),
        minor: Number(minor || 0),
        patch: Number(patch || 0),
        prereleaseTag,
        prereleaseNumber: Number(prereleaseNumber || 1),
      },
      codename,
    });
  }, [
    includeVersionPolicy,
    major,
    minor,
    patch,
    prereleaseTag,
    prereleaseNumber,
    codename
  ]);

  const generateNext = () => {
    setSequence((prev) => prev + 1);
  };

  const resetForm = () => {
    setSeed("test_seed");
    setSequence(0);
    setIncludeVersionPolicy(true);
    setMajor("0");
    setMinor("1");
    setPatch("0");
    setPrereleaseTag("beta");
    setPrereleaseNumber("1");
    setCopied(false);
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Release name generator</h1>
        <p style={styles.subtitle}>
          Generate a deterministic codename from a seed, with optional Semantic Versioning.
        </p>

        <div style={styles.card}>
          <label style={styles.label}>Seed</label>
          <input
            type="text"
            value={seed}
            onChange={(e) => {
              setSeed(e.target.value);
              setSequence(0);
            }}
            placeholder="Enter a string or number"
            style={styles.input}
          />

          <label style={styles.label}>Sequence</label>
          <input
            type="number"
            min="0"
            step="1"
            value={sequence}
            onChange={(e) => setSequence(Math.max(0, Number(e.target.value || 0)))}
            style={styles.input}
          />

          <div style={styles.checkboxRow}>
            <input
              id="includeVersionPolicy"
              type="checkbox"
              checked={includeVersionPolicy}
              onChange={(e) => setIncludeVersionPolicy(e.target.checked)}
            />
            <label htmlFor="includeVersionPolicy">Include version policy</label>
          </div>

          {includeVersionPolicy && (
            <div style={styles.grid}>
              <div>
                <label style={styles.label}>Major</label>
                <input
                  type="number"
                  min="0"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Minor</label>
                <input
                  type="number"
                  min="0"
                  value={minor}
                  onChange={(e) => setMinor(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Patch</label>
                <input
                  type="number"
                  min="0"
                  value={patch}
                  onChange={(e) => setPatch(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Pre-release</label>
                <select
                  value={prereleaseTag}
                  onChange={(e) => setPrereleaseTag(e.target.value)}
                  style={styles.input}
                >
                  <option value="none">none</option>
                  <option value="alpha">alpha</option>
                  <option value="beta">beta</option>
                  <option value="rc">rc</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>Stage N</label>
                <input
                  type="number"
                  min="1"
                  value={prereleaseNumber}
                  onChange={(e) => setPrereleaseNumber(e.target.value)}
                  disabled={prereleaseTag === "none"}
                  style={styles.input}
                />
              </div>
            </div>
          )}

          <div style={styles.buttonRow}>
            <button onClick={generateNext} style={styles.button}>
              Generate
            </button>
            <button onClick={copyOutput} style={styles.buttonSecondary}>
              {copied ? "Copied" : "Copy"}
            </button>
            <button onClick={resetForm} style={styles.buttonSecondary}>
              Reset
            </button>
          </div>
        </div>

        <div style={styles.outputCard}>
          <div style={styles.outputLabel}>Output</div>
          <div style={styles.outputText}>{output}</div>
        </div>

        <div style={styles.note}>
          <p style={{ marginTop: 0 }}>
            Policy:
            <code style={styles.code}>
              {" "}vMAJOR.MINOR.PATCH[-alpha.N|-beta.N|-rc.N] "Name"
            </code>
          </p>
          <p style={{ marginBottom: 0 }}>
            The same seed and sequence produce the same codename. Disabling the version policy generates only the name.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    margin: 0,
    padding: "32px 16px",
    background: "#f8fafc",
    color: "#0f172a",
    fontFamily: "Inter, Arial, sans-serif",
    boxSizing: "border-box",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  title: {
    fontSize: "2.2rem",
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#475569",
    marginBottom: "1.5rem",
    lineHeight: 1.6,
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    marginTop: "12px",
    fontWeight: 600,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "1rem",
    boxSizing: "border-box",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "12px",
    marginTop: "12px",
  },
  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "20px",
  },
  button: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
    background: "#0f172a",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  buttonSecondary: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  outputCard: {
    background: "#0f172a",
    color: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
  },
  outputLabel: {
    fontSize: "0.9rem",
    opacity: 0.8,
    marginBottom: "10px",
  },
  outputText: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "1.35rem",
    lineHeight: 1.6,
    wordBreak: "break-word",
  },
  note: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "16px 20px",
    color: "#334155",
    lineHeight: 1.7,
  },
  code: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    background: "#f1f5f9",
    padding: "2px 6px",
    borderRadius: "6px",
    marginLeft: "6px",
  },
};