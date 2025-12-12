import { useState, useEffect } from 'react';
import apiClient from '../services/api';

export function useProviderStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProviderStats();
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
}

export function useProviders(params?: { page?: number; limit?: number; validated?: boolean }) {
  const [providers, setProviders] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProviders(params);
      setProviders(response.data);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [params?.page, params?.limit, params?.validated]);

  return { providers, pagination, loading, error, refetch: fetchProviders };
}

export function useProvider(id: string | null) {
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProvider = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getProviderById(id);
        setProvider(response.data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [id]);

  return { provider, loading, error };
}

export function useTrustScores() {
  const [trustScores, setTrustScores] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getTrustScores();
        setTrustScores(response.data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  return { trustScores, loading, error };
}
