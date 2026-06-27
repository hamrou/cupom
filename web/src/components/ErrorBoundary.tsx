import { Component, type ReactNode } from "react";
import { clientLog } from "../lib/clientLog";

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    clientLog("error", error.message, { stack: error.stack, componentStack: info.componentStack });
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: "2rem", color: "#b3261e" }}>
          <strong>Something went wrong.</strong>
          <pre style={{ fontSize: "0.8rem", marginTop: "1rem", whiteSpace: "pre-wrap" }}>
            {this.state.error.message}
          </pre>
          <button onClick={() => this.setState({ error: null })}>Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}
