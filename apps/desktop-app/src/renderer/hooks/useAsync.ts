import { useState, useCallback } from 'react';
import { useToast } from '../components/ui/toast';

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseAsyncOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  onSuccess?: <T>(data: T) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for handling async operations with loading/error states
 */
export function useAsync<T = any>(options: UseAsyncOptions = {}) {
  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const toast = useToast();

  const execute = useCallback(
    async (asyncFunction: () => Promise<T>, customSuccessMessage?: string): Promise<T | null> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await asyncFunction();
        setState({ data: result, isLoading: false, error: null });

        if (showSuccessToast) {
          toast.success(customSuccessMessage || successMessage);
        }

        onSuccess?.(result);
        return result;
      } catch (err: any) {
        const errorMessage = err.message || 'An error occurred';
        setState({ data: null, isLoading: false, error: errorMessage });

        if (showErrorToast) {
          toast.error('Error', errorMessage);
        }

        onError?.(err);
        return null;
      }
    },
    [showSuccessToast, showErrorToast, successMessage, onSuccess, onError, toast]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData: (data: T | null) => setState(prev => ({ ...prev, data })),
  };
}

/**
 * Hook for handling form submissions with async operations
 */
export function useFormSubmit<T = any>(options: UseAsyncOptions = {}) {
  const async = useAsync<T>(options);

  const handleSubmit = useCallback(
    (asyncFunction: () => Promise<T>) => async (e?: React.FormEvent) => {
      e?.preventDefault();
      return async.execute(asyncFunction);
    },
    [async]
  );

  return {
    ...async,
    handleSubmit,
  };
}

/**
 * Hook for fetching data on mount
 */
export function useFetch<T = any>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch data';
      setError(errorMessage);
      toast.error('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, toast]);

  // Initial fetch
  useState(() => {
    refetch();
  });

  return { data, isLoading, error, refetch };
}

/**
 * Hook for handling mutations (create, update, delete)
 */
export function useMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseAsyncOptions & {
    onSettled?: () => void;
  } = {}
) {
  const { onSettled, ...asyncOptions } = options;
  const async = useAsync<TData>(asyncOptions);

  const mutate = useCallback(
    async (variables: TVariables) => {
      const result = await async.execute(() => mutationFn(variables));
      onSettled?.();
      return result;
    },
    [async, mutationFn, onSettled]
  );

  return {
    ...async,
    mutate,
  };
}
