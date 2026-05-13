'use client';

import { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorInfo: error.message 
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🔴 Game Error Caught:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/learn';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-metaverse-black flex items-center justify-center p-4">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-metaverse-gradient opacity-20"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          </div>

          {/* Error Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark rounded-3xl p-8 max-w-md w-full border border-red-500/30 relative z-10"
          >
            {/* Icon */}
            <motion.div
              className="flex justify-center mb-6"
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
              }}
              transition={{ 
                duration: 0.5,
              }}
            >
              <div className="p-4 bg-red-500/20 rounded-full">
                <AlertTriangle className="w-16 h-16 text-red-400" />
              </div>
            </motion.div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white text-center mb-4">
              เกิดข้อผิดพลาด
            </h2>

            {/* Description */}
            <div className="glass bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-white/80 text-center text-sm mb-2">
                ขออภัย เกมพบปัญหาบางอย่าง
              </p>
              {this.state.errorInfo && (
                <p className="text-red-400 text-xs text-center font-mono break-all">
                  {this.state.errorInfo.substring(0, 100)}
                  {this.state.errorInfo.length > 100 && '...'}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <motion.button
                onClick={this.handleRefresh}
                className="w-full py-3 metaverse-button text-white font-bold rounded-xl flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="w-5 h-5" />
                รีเฟรชหน้าเว็บ
              </motion.button>

              <motion.button
                onClick={this.handleGoHome}
                className="w-full py-3 glass-dark border border-metaverse-purple/30 text-white font-medium rounded-xl hover:bg-white/5 transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                กลับหน้าเกม
              </motion.button>
            </div>

            {/* Help Text */}
            <p className="text-white/40 text-xs text-center mt-6">
              ถ้าปัญหายังคงเกิดขึ้น กรุณาติดต่อแอดมิน
            </p>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}