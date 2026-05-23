import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6 text-center">
          <div>
            <p className="text-4xl mb-4">😕</p>
            <h1 className="text-lg font-semibold">Xatolik yuz berdi</h1>
            <p className="text-gray-500 mt-2">Iltimos, sahifani yangilang</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-brand-600 px-6 py-2 text-white"
            >
              Yangilash
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
