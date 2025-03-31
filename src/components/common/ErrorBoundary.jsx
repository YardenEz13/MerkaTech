import React, { Component } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 text-center border border-red-500/20">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-400 mb-4">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <Button onClick={this.handleReset} variant="outline">
              Try Again
            </Button>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 