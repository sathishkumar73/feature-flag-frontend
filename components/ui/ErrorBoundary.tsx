import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    // Optionally log error to an error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-8">
          <h1 className="text-2xl font-bold mb-2 text-red-600">Something went wrong</h1>
          <p className="mb-4">An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.</p>
          {this.state.error && (
            <details className="whitespace-pre-wrap text-left bg-gray-100 p-4 rounded text-xs max-w-xl mx-auto">
              <summary className="cursor-pointer font-semibold">Error details</summary>
              {this.state.error.toString()}
              {this.state.errorInfo && <pre>{this.state.errorInfo.componentStack}</pre>}
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
