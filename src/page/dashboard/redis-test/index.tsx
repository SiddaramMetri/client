import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Separator } from '../../../components/ui/separator';
import { RedisTestResult } from '../../../hooks/api/use-redis-test';
import { useRedisSocket } from '../../../hooks/use-redis-socket';
import { CheckCircle, XCircle, Clock, Zap, RefreshCw, Trash2, Wifi, WifiOff } from 'lucide-react';

interface CheckboxTestItem {
  id: string;
  label: string;
  channelId: string;
  status: 'pending' | 'testing' | 'success' | 'error';
  result?: RedisTestResult;
}

const RedisTestPage: React.FC = () => {
  const [testItems, setTestItems] = useState<CheckboxTestItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [testProgress, setTestProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [connectionResult, setConnectionResult] = useState<RedisTestResult | null>(null);
  const [completedTests, setCompletedTests] = useState(0);
  const [totalTests, setTotalTests] = useState(0);

  const redisSocket = useRedisSocket();

  // Initialize 20 checkbox items
  useEffect(() => {
    const items = Array.from({ length: 20 }, (_, i) => ({
      id: `checkbox-${i + 1}`,
      label: `Redis Channel ${i + 1}`,
      channelId: `channel-${i + 1}`,
      status: 'pending' as const
    }));
    setTestItems(items);
    setSelectedItems(items.map(item => item.id));
  }, []);

  // Setup socket event listeners
  useEffect(() => {
    if (!redisSocket) return;

    // Listen for test status updates
    redisSocket.onTestStatus((status) => {
      setTestItems(prev => prev.map(item => 
        item.channelId === status.channelId 
          ? { ...item, status: status.status }
          : item
      ));
    });

    // Listen for test results
    redisSocket.onTestResult((data) => {
      setTestItems(prev => prev.map(item => 
        item.channelId === data.channelId 
          ? { 
              ...item, 
              status: data.result.success ? 'success' : 'error',
              result: data.result 
            }
          : item
      ));
      
      setCompletedTests(prev => prev + 1);
    });

    // Listen for connection test results
    redisSocket.onConnectionResult((data) => {
      setConnectionResult(data.result);
    });

    // Listen for batch completion
    redisSocket.onBatchComplete((data) => {
      setIsRunning(false);
      setTestProgress(100);
      console.log(`✅ Batch test completed: ${data.totalChannels} channels`);
    });

    // Listen for results cleared
    redisSocket.onResultsCleared(() => {
      setTestItems(prev => prev.map(item => ({
        ...item,
        status: 'pending',
        result: undefined
      })));
      setTestProgress(0);
      setCompletedTests(0);
      setTotalTests(0);
      setConnectionResult(null);
    });

    // Listen for errors
    redisSocket.onError((error) => {
      console.error('Redis test error:', error);
      setIsRunning(false);
    });

  }, [redisSocket]);

  // Update progress when completed tests change
  useEffect(() => {
    if (totalTests > 0) {
      const progress = (completedTests / totalTests) * 100;
      setTestProgress(progress);
    }
  }, [completedTests, totalTests]);

  const handleItemToggle = (itemId: string) => {
    if (isRunning) return;
    
    const item = testItems.find(item => item.id === itemId);
    if (!item) return;

    // If clicking on a checkbox, test that single channel immediately
    if (!selectedItems.includes(itemId)) {
      // Add to selection and test immediately
      setSelectedItems(prev => [...prev, itemId]);
      
      // Test the channel immediately
      setTestItems(prev => prev.map(i => 
        i.id === itemId ? { ...i, status: 'testing' } : i
      ));
      
      redisSocket.testChannel(item.channelId);
    } else {
      // Remove from selection
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleSelectAll = () => {
    if (isRunning) return;
    
    if (selectedItems.length === testItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(testItems.map(item => item.id));
    }
  };

  const runConnectionTest = () => {
    redisSocket.testConnection();
  };

  const runSelectedTests = () => {
    if (selectedItems.length === 0) return;
    
    setIsRunning(true);
    setTestProgress(0);
    setCompletedTests(0);
    setTotalTests(selectedItems.length);

    // Reset selected items status
    setTestItems(prev => prev.map(item => 
      selectedItems.includes(item.id) 
        ? { ...item, status: 'testing', result: undefined }
        : item
    ));

    // Get selected channels
    const selectedChannels = testItems
      .filter(item => selectedItems.includes(item.id))
      .map(item => item.channelId);

    // Test channels via socket
    redisSocket.testChannels(selectedChannels);
  };

  const clearAllResults = () => {
    redisSocket.clearResults();
  };

  const getStatusIcon = (status: CheckboxTestItem['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'testing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: CheckboxTestItem['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'testing':
        return <Badge variant="secondary">Testing...</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const successCount = testItems.filter(item => item.status === 'success').length;
  const errorCount = testItems.filter(item => item.status === 'error').length;
  const testingCount = testItems.filter(item => item.status === 'testing').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Redis Pub/Sub Test</h1>
          <p className="text-muted-foreground">
            Test Redis publish/subscribe functionality with multiple channels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {redisSocket.isConnected ? (
              <div className="flex items-center gap-1 text-green-600">
                <Wifi className="h-4 w-4" />
                <span className="text-sm">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm">Disconnected</span>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            onClick={runConnectionTest}
            disabled={!redisSocket.isConnected}
          >
            <Zap className="h-4 w-4 mr-2" />
            Test Connection
          </Button>
          <Button
            variant="outline"
            onClick={clearAllResults}
            disabled={!redisSocket.isConnected}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Results
          </Button>
        </div>
      </div>

      {/* Connection Test Result */}
      {connectionResult && (
        <Alert className={connectionResult.success ? "border-green-500" : "border-red-500"}>
          <AlertDescription>
            <div className="flex items-center gap-2">
              {connectionResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              {connectionResult.message}
              {connectionResult.latency && (
                <Badge variant="secondary">{connectionResult.latency}ms</Badge>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Test Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedItems.length}/20</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Success</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Testing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{testingCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Test Progress */}
      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={testProgress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Testing {selectedItems.length} channels...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Channels</CardTitle>
          <CardDescription>
            Select the Redis channels to test pub/sub functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedItems.length === testItems.length}
                onCheckedChange={handleSelectAll}
                disabled={isRunning}
              />
              <label htmlFor="select-all" className="font-medium">
                Select All ({selectedItems.length}/{testItems.length})
              </label>
            </div>
            <Button
              onClick={runSelectedTests}
              disabled={selectedItems.length === 0 || isRunning || !redisSocket.isConnected}
              className="ml-auto"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Test Selected ({selectedItems.length})
            </Button>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={item.id}
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => handleItemToggle(item.id)}
                      disabled={isRunning}
                    />
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(item.status)}
                      <label htmlFor={item.id} className="font-medium">
                        {item.label}
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.result?.latency && (
                      <Badge variant="outline" className="text-xs">
                        {item.result.latency}ms
                      </Badge>
                    )}
                    {getStatusBadge(item.status)}
                  </div>
                </div>
                {item.result && item.status === 'error' && (
                  <div className="mt-2 text-sm text-red-600 truncate">
                    {item.result.message}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Results Summary */}
      {(successCount > 0 || errorCount > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Real-time Test Results</CardTitle>
            <CardDescription>
              Live results from socket-based Redis pub/sub testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Tested</p>
                <p className="text-2xl font-bold">{successCount + errorCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {successCount + errorCount > 0 
                    ? `${((successCount / (successCount + errorCount)) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold text-green-600">{successCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{errorCount}</p>
              </div>
              {testItems.some(item => item.result?.latency) && (
                <div className="col-span-2 md:col-span-4">
                  <p className="text-sm text-muted-foreground">Average Latency</p>
                  <p className="text-xl font-bold">
                    {(() => {
                      const latencies = testItems
                        .filter(item => item.result?.latency)
                        .map(item => item.result!.latency!);
                      return latencies.length > 0 
                        ? `${(latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2)}ms`
                        : 'N/A';
                    })()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RedisTestPage;