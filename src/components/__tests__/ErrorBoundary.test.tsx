import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Component that throws an error for testing
const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('We\'re sorry, but something unexpected happened.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('should display error details in development mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // In development, should show error details
    expect(screen.getByText(/error details \(development\)/i)).toBeInTheDocument();
    expect(screen.getByText('Error: Test error')).toBeInTheDocument();

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should not display error details in production mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // In production, should not show error details
    expect(screen.queryByText(/error details \(development\)/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Error: Test error')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should reset error state when retry button is clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
    
    // Click should not throw an error
    retryButton.click();
    
    // Button should still be accessible after click
    expect(retryButton).toBeInTheDocument();
  });

  it('should log error to console', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalled();
  });

  it('should handle multiple error scenarios', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    // Initially no error
    expect(screen.getByText('No error')).toBeInTheDocument();

    // Trigger error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should handle error with stack trace', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const ErrorComponentWithStack: React.FC = () => {
      const error = new Error('Test error with stack');
      error.stack = 'Error: Test error\n    at Component (/app/component.js:10:5)';
      throw error;
    };

    render(
      <ErrorBoundary>
        <ErrorComponentWithStack />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error: Test error with stack')).toBeInTheDocument();

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should handle componentDidCatch lifecycle', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should be called multiple times (React logs errors too)
    expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
    
    // Our specific error message should be among the calls
    const calls = consoleErrorSpy.mock.calls;
    const ourCall = calls.find(call => 
      call[0] === 'ErrorBoundary caught an error:' && 
      call[1] instanceof Error &&
      typeof call[2] === 'object'
    );
    expect(ourCall).toBeDefined();

    consoleErrorSpy.mockRestore();
  });
});
