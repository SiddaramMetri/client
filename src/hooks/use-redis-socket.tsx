import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { RedisTestResult } from './api/use-redis-test';

interface RedisTestStatus {
  channelId: string;
  status: 'pending' | 'testing' | 'success' | 'error';
  message?: string;
  timestamp: string;
}

interface RedisTestResultEvent {
  channelId: string;
  result: RedisTestResult;
}

interface RedisConnectionResult {
  result: RedisTestResult;
  timestamp: string;
}

interface UseRedisSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  testChannel: (channelId: string) => void;
  testChannels: (channels: string[]) => void;
  testConnection: () => void;
  clearResults: () => void;
  getResults: () => void;
  onTestStatus: (callback: (status: RedisTestStatus) => void) => void;
  onTestResult: (callback: (result: RedisTestResultEvent) => void) => void;
  onConnectionResult: (callback: (result: RedisConnectionResult) => void) => void;
  onResultsCleared: (callback: () => void) => void;
  onBatchComplete: (callback: (data: { totalChannels: number; timestamp: string }) => void) => void;
  onError: (callback: (error: { message: string; timestamp: string }) => void) => void;
}

export const useRedisSocket = (): UseRedisSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const callbacksRef = useRef<{
    onTestStatus?: (status: RedisTestStatus) => void;
    onTestResult?: (result: RedisTestResultEvent) => void;
    onConnectionResult?: (result: RedisConnectionResult) => void;
    onResultsCleared?: () => void;
    onBatchComplete?: (data: { totalChannels: number; timestamp: string }) => void;
    onError?: (error: { message: string; timestamp: string }) => void;
  }>({});

  useEffect(() => {
    // Create socket connection
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('🔌 Connected to Redis test socket');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('🔌 Disconnected from Redis test socket');
    });

    // Redis test events
    socket.on('redis-test-connected', (data) => {
      console.log('✅ Redis test service connected:', data);
    });

    socket.on('redis-test-status', (status: RedisTestStatus) => {
      console.log('📊 Redis test status:', status);
      if (callbacksRef.current.onTestStatus) {
        callbacksRef.current.onTestStatus(status);
      }
    });

    socket.on('redis-test-result', (result: RedisTestResultEvent) => {
      console.log('📋 Redis test result:', result);
      if (callbacksRef.current.onTestResult) {
        callbacksRef.current.onTestResult(result);
      }
    });

    socket.on('redis-connection-result', (result: RedisConnectionResult) => {
      console.log('🔗 Redis connection result:', result);
      if (callbacksRef.current.onConnectionResult) {
        callbacksRef.current.onConnectionResult(result);
      }
    });

    socket.on('redis-results-cleared', () => {
      console.log('🧹 Redis results cleared');
      if (callbacksRef.current.onResultsCleared) {
        callbacksRef.current.onResultsCleared();
      }
    });

    socket.on('redis-test-batch-complete', (data: { totalChannels: number; timestamp: string }) => {
      console.log('✅ Redis batch test complete:', data);
      if (callbacksRef.current.onBatchComplete) {
        callbacksRef.current.onBatchComplete(data);
      }
    });

    socket.on('redis-test-error', (error: { message: string; timestamp: string }) => {
      console.error('❌ Redis test error:', error);
      if (callbacksRef.current.onError) {
        callbacksRef.current.onError(error);
      }
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const testChannel = useCallback((channelId: string) => {
    if (socketRef.current?.connected) {
      console.log(`🧪 Testing channel: ${channelId}`);
      socketRef.current.emit('test-redis-channel', { channelId });
    } else {
      console.warn('Socket not connected');
    }
  }, []);

  const testChannels = useCallback((channels: string[]) => {
    if (socketRef.current?.connected) {
      console.log(`🧪 Testing ${channels.length} channels:`, channels);
      socketRef.current.emit('test-redis-channels', { channels });
    } else {
      console.warn('Socket not connected');
    }
  }, []);

  const testConnection = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('🔗 Testing Redis connection');
      socketRef.current.emit('test-redis-connection');
    } else {
      console.warn('Socket not connected');
    }
  }, []);

  const clearResults = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('🧹 Clearing Redis results');
      socketRef.current.emit('clear-redis-results');
    } else {
      console.warn('Socket not connected');
    }
  }, []);

  const getResults = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('📋 Getting Redis results');
      socketRef.current.emit('get-redis-results');
    } else {
      console.warn('Socket not connected');
    }
  }, []);

  const onTestStatus = useCallback((callback: (status: RedisTestStatus) => void) => {
    callbacksRef.current.onTestStatus = callback;
  }, []);

  const onTestResult = useCallback((callback: (result: RedisTestResultEvent) => void) => {
    callbacksRef.current.onTestResult = callback;
  }, []);

  const onConnectionResult = useCallback((callback: (result: RedisConnectionResult) => void) => {
    callbacksRef.current.onConnectionResult = callback;
  }, []);

  const onResultsCleared = useCallback((callback: () => void) => {
    callbacksRef.current.onResultsCleared = callback;
  }, []);

  const onBatchComplete = useCallback((callback: (data: { totalChannels: number; timestamp: string }) => void) => {
    callbacksRef.current.onBatchComplete = callback;
  }, []);

  const onError = useCallback((callback: (error: { message: string; timestamp: string }) => void) => {
    callbacksRef.current.onError = callback;
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    testChannel,
    testChannels,
    testConnection,
    clearResults,
    getResults,
    onTestStatus,
    onTestResult,
    onConnectionResult,
    onResultsCleared,
    onBatchComplete,
    onError,
  };
};