import React, { ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  // @ts-ignore
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught React error:', error, errorInfo);
  }

  handleReset = () => {
    // @ts-ignore
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    // @ts-ignore
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Something went wrong</h1>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                An unexpected error occurred while rendering this section.
              </p>
              {
                // @ts-ignore
                this.state.error?.message && (
                  <div className="mt-4 p-3 bg-slate-950/80 rounded-xl text-left border border-slate-800 overflow-y-auto max-h-64">
                    <p className="text-[11px] font-mono text-rose-300 break-all mb-2 font-bold">
                      {
                        // @ts-ignore
                        this.state.error.message
                      }
                    </p>
                    <pre className="text-[10px] font-mono text-slate-400 break-all whitespace-pre-wrap">
                      {
                        // @ts-ignore
                        this.state.error.stack
                      }
                    </pre>
                  </div>
                )
              }
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}








