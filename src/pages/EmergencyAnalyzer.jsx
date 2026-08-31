import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AiIcon,
  AmbulanceIcon,
  PoliceIcon,
  FireIcon,
  AlertIcon,
  RouteIcon,
} from "../components/Icons";
import "./EmergencyAnalyzer.css";
const examples = [
  {
    text: "Someone is bleeding after a road accident",
    icon: "🩸",
     color: "medical"
  },
  {
    text: "There is smoke and fire in the building",
    icon: "🔥",
     color: "fire"
  },
  {
    text: "A robbery just happened nearby",
    icon: "🚔",
    color: "police"
  },
  {
    text: "A person collapsed and is unconscious",
     icon: "🩺",
    color: "health"
  },
];
const EmergencyAnalyzer = () => {
  const navigate = useNavigate();
  const [incident, setIncident] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
const ResultIcon = aiResult?.Icon;

  const analyzeEmergency = (textInput) => {
    const text = (textInput ?? incident).toLowerCase();
    if (!text.trim()) return;
     setLoading(true); 
      setTimeout(() => {
    if (
      text.includes("bleeding") ||
      text.includes("accident") ||
      text.includes("injury") ||
      text.includes("unconscious") ||
      text.includes("collapse")
    ) {
      setAiResult({
        type: "Medical Emergency",
        severity: "HIGH",
        tone: "red",
        Icon: AmbulanceIcon,
        action:
          "Call an ambulance immediately, provide first aid if trained, and keep the person safe and still.",
        route: "/map?type=hospital",
        cta: "Find nearest hospital",
        call: "102",
      });
    } else if (
      text.includes("fire") ||
      text.includes("smoke") ||
      text.includes("burn") ||
      text.includes("explosion")
    ) {
      setAiResult({
        type: "Fire Emergency",
        severity: "HIGH",
        tone: "amber",
        Icon: FireIcon,
        action:
          "Call the fire department immediately, evacuate the area, and stay low to avoid smoke inhalation.",
        route: "/map?type=fire",
        cta: "Find nearest fire station",
        call: "101",
      });
    } else if (
      text.includes("theft") ||
      text.includes("assault") ||
      text.includes("robbery") ||
      text.includes("fight") ||
      text.includes("attack")
    ) {
      setAiResult({
        type: "Police Emergency",
        severity: "MEDIUM",
        tone: "blue",
        Icon: PoliceIcon,
        action:
          "Call the police immediately, move to a safe location, and provide clear incident details.",
        route: "/map?type=police",
        cta: "Find nearest police station",
        call: "100",
      });
    } else {
      setAiResult({
        type: "General Emergency",
        severity: "UNKNOWN",
        tone: "green",
        Icon: AlertIcon,
        action:
          "Contact emergency services on 112 and explain the situation clearly so they can dispatch the right help.",
        route: "/nearby",
        cta: "View nearby services",
        call: "112",
      });
    }
    setLoading(false);
  },1500);
};
  
  return (
    <div className="analyzer-page">

      <section className="analyzer-hero">
      <div className="hero-left" >
    <div className="ai-badge">✨ AI Powered</div>
      <h2>Describe the <span>emergency</span></h2>
        <p>
          Our analyzer reads your description, classifies the emergency type and
          severity, and guides you to the right help instantly.
        </p>
       <div className="hero-features">

  <div className="feature-card">
    <div className="feature-icon">🧠</div>
    <div className="feature-content">
      <h4>Smart Analysis</h4>
      <p>AI detects severity and type</p>
    </div>
  </div>

  <div className="feature-card">
    <div className="feature-icon">⚡</div>
    <div className="feature-content">
      <h4>Instant Guidance</h4>
      <p>Get actionable steps immediately</p>
    </div>
  </div>

  <div className="feature-card">
    <div className="feature-icon">🛡️</div>
     <div className="feature-content">
      <h4>Stay Safe</h4>
      <p>Accurate help when needed most</p>
    </div>
  </div>
</div>
        </div>
         <div className="hero-right">
            <img
         src="/1st.png"
         alt="AI Analyzer"
         className="hero-image"
         />
        </div>
        </section>
      <section className="analyzer-grid">
        <div className="analyzer-input-panel">
      <div className="input-header">
  <div className="input-icon">
    📝
  </div>

  <div className="input-content">
    <h3>Incident Description</h3>
    <p>
      Tell us what happened and AI will
      recommend the right emergency service.
    </p>
  </div>
</div>
          <textarea
            id="incident"
            value={incident}
            onChange={(e) => setIncident(e.target.value)}
            placeholder="e.g. A car accident with an injured person who is bleeding..."
            rows={6}
          />
          <div className="input-tip">
            💡 Be specific for better analysis
         </div>
         <div className="example-title">
           Try an example:
       </div>
      <div className="example-grid">
     {examples.map((ex) => (
    <button
      key={ex.text}
      className="example-card"
      onClick={() => {
        setIncident(ex.text);
        analyzeEmergency(ex.text);
      }}
    >
    <span className={`example-icon ${ex.color}`}>
  {ex.icon}
</span>
<span className="example-text">
  {ex.text}
</span>
    </button>
  ))}
</div>
          <button
            className="analyze-btn"
            onClick={() => analyzeEmergency()}
            disabled={!incident.trim() || loading}
          >
            {loading ? (
          <>🔄 Analyzing...</>
           ) : (
          <>
          🤖
          Analyze Emergency
         </>
       )}
      </button>
        </div>
         <div className="analyzer-result-panel">
  {loading ? (

    <div className="result-empty">
      <img
        src="/2nd.png"
        alt="AI Loading"
        className="empty-image"
      />
      <h3>Analyzing Emergency...</h3>
      <p>
        AI is processing the incident details and
        determining the best response.
      </p>
    </div>

  ) : !aiResult ? (

    <div className="result-empty">
      <img
        src="/2nd.png"
        alt="AI Ready"
        className="empty-image"
      />
      <h3>AI Ready to Analyze</h3>
      <p>
        Enter details about the situation and our AI
        will identify the emergency type, severity
        level and recommended actions.
      </p>
    </div>

  ) : (     

  <div className={`result-card result-card--${aiResult.tone}`}>
    <div className="result-top">
      <span className="result-icon">
        <ResultIcon size={24} />
      </span>

      <div>
        <h3>{aiResult.type}</h3>

        <span className={`sev sev--${aiResult.tone}`}>
          Severity: {aiResult.severity}
        </span>
      </div>
    </div>

    <div className="result-action">
      <h4>Recommended Action</h4>
      <p>{aiResult.action}</p>
    </div>

    <div className="result-buttons">
      <a
        className="result-call-btn"
        href={`tel:${aiResult.call}`}
      >
        Call {aiResult.call}
      </a>

      <button
        className="result-nav-btn"
        onClick={() => navigate(aiResult.route)}
      >
        <RouteIcon size={16} />
        {aiResult.cta}
      </button>
    </div>
  </div>

)}
      </div>
    </section>
  </div>
);
};

export default EmergencyAnalyzer;