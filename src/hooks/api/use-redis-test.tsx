import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import API from '@/lib/axios-client';

export interface RedisTestResult {
  success: boolean;
  message: string;
  timestamp: string;
  latency?: number;
}

export interface RedisTestResponse {
  success: boolean;
  message: string;
  data: {
    channelId?: string;
    result?: RedisTestResult;
    summary?: {
      total: number;
      successful: number;
      failed: number;
      successRate: string;
      averageLatency?: string;
    };
    results?: Record<string, RedisTestResult>;
    timestamp: string;
    latency?: number;
  };
}

export const useRedisConnectionTest = () => {
  return useMutation<RedisTestResponse>({
    mutationFn: async () => {
      const response = await API.get('/redis-test/connection');
      return response.data;
    },
  });
};

export const useRedisSingleChannelTest = () => {
  return useMutation<RedisTestResponse, Error, string>({
    mutationFn: async (channelId: string) => {
      const response = await API.get(`/redis-test/channel/${channelId}`);
      return response.data;
    },
  });
};

export const useRedisMultipleChannelsTest = () => {
  return useMutation<RedisTestResponse, Error, string[]>({
    mutationFn: async (channels: string[]) => {
      const response = await API.post('/redis-test/channels', { channels });
      return response.data;
    },
  });
};

export const useRedisBulkTest = () => {
  return useMutation<RedisTestResponse, Error, number>({
    mutationFn: async (count: number = 20) => {
      const response = await API.get(`/redis-test/bulk?count=${count}`);
      return response.data;
    },
  });
};

export const useRedisTestResults = () => {
  return useQuery<RedisTestResponse>({
    queryKey: ['redis-test-results'],
    queryFn: async () => {
      const response = await API.get('/redis-test/results');
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
};

export const useClearRedisTestResults = () => {
  const queryClient = useQueryClient();
  
  return useMutation<RedisTestResponse>({
    mutationFn: async () => {
      const response = await API.delete('/redis-test/results');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redis-test-results'] });
    },
  });
};