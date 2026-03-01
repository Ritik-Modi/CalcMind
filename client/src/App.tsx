import { useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { API_BASE, postJson, fetchJson } from "./lib/api";

type CalcResponse = {
  expression: string;
  result: number;
  steps: string[];
  createdAt: string;
};

type ExplainResponse = {
  explanation: string;
  source: string;
};

export function App() {
  const [expression, setExpression] = useState("");
  const [status, setStatus] = useState("Safe calculator ready");
  const [lastCalc, setLastCalc] = useState<CalcResponse | null>(null);
  const [history, setHistory] = useState<CalcResponse[]>([]);
  const [explanation, setExplanation] = useState("Run a calculation, then click explain to see the AI breakdown.");
  const [busy, setBusy] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { isAuthenticated, loginWithRedirect, logout, user, getAccessTokenSilently, isLoading } = useAuth0();

  const keyRows = useMemo(
    () => [
      [{ val: "C", text: "C", action: "clear" }, { val: "(", text: "(" }, { val: ")", text: ")" }, { val: "⌫", text: "⌫", action: "backspace" }],
      [{ val: "7", text: "7" }, { val: "8", text: "8" }, { val: "9", text: "9" }, { val: "/", text: "÷", action: "op" }],
      [{ val: "4", text: "4" }, { val: "5", text: "5" }, { val: "6", text: "6" }, { val: "*", text: "×", action: "op" }],
      [{ val: "1", text: "1" }, { val: "2", text: "2" }, { val: "3", text: "3" }, { val: "-", text: "−", action: "op" }],
      [{ val: "0", text: "0" }, { val: ".", text: "." }, { val: "=", text: "=", action: "calc" }, { val: "+", text: "+", action: "op" }],
    ],
    []
  );

  async function loadHistory() {
    if (!isAuthenticated) return;
    try {
      const token = await getAccessTokenSilently();
      const data = await fetchJson<CalcResponse[]>(`${API_BASE}/history`, token);
      setHistory(data);
    } catch {
      setHistory([]);
    }
  }

  useEffect(() => {
    loadHistory();
  }, [isAuthenticated, getAccessTokenSilently]);

  async function calculate() {
    const trimmed = expression.trim();
    if (!trimmed) {
      setStatus("Enter an expression first");
      return;
    }

    try {
      setBusy(true);
      const token = await getAccessTokenSilently();
      const data = await postJson<CalcResponse>(`${API_BASE}/calculate`, { expression: trimmed }, token);
      setLastCalc(data);
      setExpression(String(data.result));
      setStatus("Calculated securely by CalcMind");
      setExplanation("Calculation complete. Click explain for AI breakdown.");
      await loadHistory();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Calculation failed");
    } finally {
      setBusy(false);
    }
  }

  async function explain() {
    if (!lastCalc) {
      setExplanation("Run calculation before requesting explanation.");
      return;
    }

    try {
      setBusy(true);
      setIsGenerating(true);
      const token = await getAccessTokenSilently();
      const data = await postJson<ExplainResponse>(`${API_BASE}/ai/explain`, {
        expression: lastCalc.expression,
        result: lastCalc.result,
        steps: lastCalc.steps,
      }, token);
      setExplanation(`${data.explanation}\n\n[source: ${data.source}]`);
    } catch (error) {
      setExplanation(error instanceof Error ? error.message : "AI explanation failed");
    } finally {
      setBusy(false);
      setIsGenerating(false);
    }
  }

  function keyPress(val: string) {
    if (val === "C") {
      setExpression("");
      setStatus("Cleared");
      return;
    }

    if (val === "⌫") {
      setExpression((prev) => prev.slice(0, -1));
      return;
    }

    if (val === "=") {
      void calculate();
      return;
    }

    setExpression((prev) => `${prev}${val}`);
  }

  if (isLoading) {
    return (
      <main className="app-shell" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
        <h2 style={{ color: 'var(--text-main)' }}>Loading CalcMind...</h2>
      </main>
    );
  }

  return (
    <>
      <div className="bg-gradient-orb orb-1"></div>
      <div className="bg-gradient-orb orb-2"></div>
      <div className="bg-gradient-orb orb-3"></div>

      <main className="app-shell">
        <section className="panel" aria-label="Calculation history">
          <h2>History</h2>
          <ul className="history-list">
            {!isAuthenticated && (
               <li style={{ justifyContent: "center" }}><span>Sign in to view history</span></li>
            )}
            {isAuthenticated && history.length === 0 && <li style={{ justifyContent: "center" }}><span>No calculations yet</span></li>}
            {isAuthenticated && history.map((item, index) => (
              <li key={`${item.expression}-${index}`} onClick={() => setExpression(item.expression)}>
                <span>{item.expression}</span>
                <span>{item.result}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="calculator" aria-label="Calculator">
          <header className="calc-header">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <img src="/logo.png" alt="CalcMind Logo" className="calc-logo" />
              <span className="calc-title">CalcMind</span>
            </div>
            {isAuthenticated ? (
               <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} className="auth-btn">
                 Logout
               </button>
            ) : (
               <button onClick={() => loginWithRedirect()} className="auth-btn highlight">
                 Sign In
               </button>
            )}
          </header>
          
          <div className="display-wrap">
            <input value={expression} readOnly id="display" placeholder={isAuthenticated ? "0" : "Sign in to calculate"} />
            <p className="status">{isAuthenticated ? status : "Authentication required"}</p>
          </div>

          <div id="keys" style={{ opacity: isAuthenticated ? 1 : 0.5, pointerEvents: isAuthenticated ? "auto" : "none" }}>
            {keyRows.flat().map((k) => (
              <button
                key={k.val}
                onClick={() => keyPress(k.val)}
                data-action={k.action}
                className={`
                  ${k.action === "calc" ? "equals-btn" : ""} 
                  ${k.action === "op" ? "operator-btn" : ""}
                `.trim()}
                disabled={busy}
              >
                {k.text}
              </button>
            ))}
          </div>
        </section>

        <section className="panel" aria-label="AI explain">
          <h2>✨ AI Explain</h2>
          {isAuthenticated ? (
            <>
              <p className="panel-subtext">Get a clear, step-by-step reasoning for your last calculation.</p>
              <button onClick={() => void explain()} disabled={busy || !lastCalc} className="explain-btn">
                Explain Last Result
              </button>
              <article className={`explain-output ${isGenerating ? "generating" : ""}`}>
                {explanation}
              </article>
            </>
          ) : (
             <div className="explain-output" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
               <p style={{ marginBottom: "1rem" }}>Sign in to use the powerful AI-driven explanation feature.</p>
               <button onClick={() => loginWithRedirect()} className="auth-btn highlight" style={{ width: "fit-content" }}>Sign In to CalcMind</button>
             </div>
          )}
        </section>
      </main>
    </>
  );
}
