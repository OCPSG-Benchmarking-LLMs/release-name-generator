import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoffee } from "@fortawesome/free-solid-svg-icons";

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
  if (!prereleaseTag || prereleaseTag === "release") return base;
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
          Generate a deterministic codename from a seed, with optional Semantic Versioning
        </p>

        <div style={styles.card}>
          <label style={styles.label}>Seed (string or number)</label>
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
                <label style={styles.label}>Major change</label>
                <input
                  type="number"
                  min="0"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Minor change</label>
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
                <label style={styles.label}>Pre-release/release</label>
                <select
                  value={prereleaseTag}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPrereleaseTag(value);
                    
                    if (value === "rc" || value === "release") {
                      setMajor("1");
                      setMinor("0");
                      setPatch("0");
                    }
                  }}
                  style={styles.input}
                >
                  
                  <option value="alpha">alpha</option>
                  <option value="beta">beta</option>
                  <option value="rc">rc</option>
                  <option value="release">release</option>
                </select>
                <p style={styles.helperText}>
                  rc = release candidate
                </p>
              </div>

              <div>
                <label style={styles.label}>Stage N</label>
                <input
                  type="number"
                  min="1"
                  value={prereleaseNumber}
                  onChange={(e) => setPrereleaseNumber(e.target.value)}
                  disabled={prereleaseTag === "release"}
                  style={styles.input}
                />
                <p style={styles.helperText}>
                  Only pre-release
                </p>
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
          <ul style={styles.noteList}>
            <li>The same seed and sequence produce the same codename.</li>
            <li>Disabling the version policy generates only the name.</li>
          </ul>
        </div>

        <footer style={styles.footer}>
          <p style={styles.footerText}>
            Made with <FontAwesomeIcon icon={faCoffee} style={styles.footerIcon} /> by{" "}
            <a href="https://ocpsg-benchmarking-llms.github.io/" target="_blank" rel="noopener noreferrer" style={styles.footerLink} >
            OCPSG-Benchmarking-LLMs
            </a>
          </p>
        </footer>

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
    color: "#002147",
    fontFamily: '"Lora", serif',
    boxSizing: "border-box",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  title: {
    fontSize: "2.4rem",
    marginBottom: "0.5rem",
    color: "#002147",
    fontFamily: '"Roboto", sans-serif',
    fontWeight: 700,
    letterSpacing: "0.01em",
  },
  subtitle: {
    fontSize: "1.05rem",
    color: "#33506b",
    marginBottom: "1.5rem",
    lineHeight: 1.7,
    fontFamily: '"Lora", serif',
  },
  card: {
    background: "#ffffff",
    border: "1px solid #d7e1ea",
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
    color: "#002147",
    fontFamily: '"Roboto", sans-serif',
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #b9c9d8",
    fontSize: "1rem",
    boxSizing: "border-box",
    fontFamily: '"Lora", serif',
    color: "#002147",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "16px",
    color: "#002147",
    fontFamily: '"Lora", serif',
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
    background: "#002147",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontFamily: '"Roboto", sans-serif',
    fontWeight: 500,
  },
  buttonSecondary: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1px solid #00AAB4",
    background: "#ffffff",
    color: "#002147",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontFamily: '"Roboto", sans-serif',
    fontWeight: 500,
  },
  outputCard: {
    background: "#002147",
    color: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
    borderLeft: "6px solid #FE615A",
  },
  outputLabel: {
    fontSize: "0.9rem",
    opacity: 0.85,
    marginBottom: "10px",
    color: "#cfe6ea",
    fontFamily: '"Roboto", sans-serif',
    fontWeight: 500,
  },
  outputText: {
    fontFamily: '"Roboto", sans-serif',
    fontSize: "1.35rem",
    lineHeight: 1.6,
    wordBreak: "break-word",
    fontWeight: 500,
  },
  note: {
    background: "#ffffff",
    border: "1px solid #d7e1ea",
    borderRadius: "16px",
    padding: "16px 20px",
    color: "#33506b",
    lineHeight: 1.7,
    fontFamily: '"Lora", serif',
  },
  code: {
    fontFamily: '"Roboto", sans-serif',
    background: "#eef6f7",
    padding: "2px 6px",
    borderRadius: "6px",
    marginLeft: "6px",
    color: "#002147",
    fontSize: "0.95em",
  },
  footer: {
    marginTop: "48px",
    padding: "24px 0 8px 0",
    textAlign: "center",
  },
  footerText: {
    margin: 0,
    color: "#33506b",
    fontSize: "0.82rem",
    fontFamily: '"Lora", serif',
  },
  footerIcon: {
    color: "#FE615A",
    margin: "0 3px",
    fontSize: "0.8rem",
  },
  footerLink: {
    color: "#00AAB4",
    textDecoration: "none",
    fontWeight: 600,
    fontFamily: '"Roboto", sans-serif',
    fontSize: "0.82rem",
  },
  helperText: {
    marginTop: "6px",
    marginBottom: 0,
    fontSize: "0.72rem",
    lineHeight: 1.5,
    color: "#33506b",
    fontFamily: '"Lora", serif',
  },
  noteList: {
    marginTop: "8px",
    marginBottom: 0,
    paddingLeft: "20px",
    color: "#33506b",
    lineHeight: 1.7,
    fontFamily: '"Lora", serif',
  },
};