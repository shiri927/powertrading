import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types for energy quotes data
interface CrudeQuote {
  contract?: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  ytd: number;
}

interface RefinedQuote {
  name: string;
  price: number;
  change: number;
  changePercent: number;
  ytd: number;
}

interface CrackSpread {
  name: string;
  price: number;
  change: number;
  changePercent: number;
  ytd: number;
}

interface InventoryData {
  name: string;
  value: string;
  change: string;
  changePercent: string;
  status: string;
}

interface StockData {
  code: string;
  price: number;
  change: number;
  changePercent: number;
  ytd: number;
}

interface NewsItem {
  time: string;
  title: string;
}

interface IndexData {
  name: string;
  value: string;
  change: string;
  changePercent: string;
}

interface InePriceTrend {
  time: string;
  price: number;
}

// Fetch ICE Brent crude quotes
export const useIceBrentData = () => {
  return useQuery({
    queryKey: ['energy-crude-quotes', 'ice_brent'],
    queryFn: async (): Promise<CrudeQuote[]> => {
      const { data, error } = await supabase
        .from('energy_crude_quotes')
        .select('*')
        .eq('category', 'ice_brent')
        .order('contract', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        contract: item.contract || '',
        price: Number(item.price),
        change: Number(item.change_value),
        changePercent: Number(item.change_percent),
        ytd: Number(item.ytd),
      }));
    },
  });
};

// Fetch WTI crude quotes
export const useWtiData = () => {
  return useQuery({
    queryKey: ['energy-crude-quotes', 'wti'],
    queryFn: async (): Promise<CrudeQuote[]> => {
      const { data, error } = await supabase
        .from('energy_crude_quotes')
        .select('*')
        .eq('category', 'wti')
        .order('contract', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        contract: item.contract || '',
        price: Number(item.price),
        change: Number(item.change_value),
        changePercent: Number(item.change_percent),
        ytd: Number(item.ytd),
      }));
    },
  });
};

// Fetch spot crude quotes
export const useSpotCrudeData = () => {
  return useQuery({
    queryKey: ['energy-crude-quotes', 'spot_crude'],
    queryFn: async (): Promise<CrudeQuote[]> => {
      const { data, error } = await supabase
        .from('energy_crude_quotes')
        .select('*')
        .eq('category', 'spot_crude')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        name: item.name || '',
        price: Number(item.price),
        change: Number(item.change_value),
        changePercent: Number(item.change_percent),
        ytd: Number(item.ytd),
      }));
    },
  });
};

// Fetch INE Shanghai crude quotes
export const useIneData = () => {
  return useQuery({
    queryKey: ['energy-crude-quotes', 'ine_shanghai'],
    queryFn: async (): Promise<CrudeQuote[]> => {
      const { data, error } = await supabase
        .from('energy_crude_quotes')
        .select('*')
        .eq('category', 'ine_shanghai')
        .order('contract', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        contract: item.contract || '',
        price: Number(item.price),
        change: Number(item.change_value),
        changePercent: Number(item.change_percent),
        ytd: Number(item.ytd),
      }));
    },
  });
};

// Fetch INE intraday price trend
export const useInePriceTrend = () => {
  return useQuery({
    queryKey: ['energy-ine-intraday'],
    queryFn: async (): Promise<InePriceTrend[]> => {
      const { data, error } = await supabase
        .from('energy_ine_intraday')
        .select('*')
        .order('time_point', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        time: item.time_point ? String(item.time_point).substring(0, 5) : '',
        price: Number(item.price),
      }));
    },
  });
};

// Fetch refined oil quotes
export const useRefinedOilData = () => {
  return useQuery({
    queryKey: ['energy-refined-quotes'],
    queryFn: async (): Promise<RefinedQuote[]> => {
      const { data, error } = await supabase
        .from('energy_refined_quotes')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        name: item.name,
        price: Number(item.price),
        change: Number(item.change_value),
        changePercent: Number(item.change_percent),
        ytd: Number(item.ytd),
      }));
    },
  });
};

// Fetch crack spread data
export const useCrackSpreadData = () => {
  return useQuery({
    queryKey: ['energy-crack-spreads'],
    queryFn: async (): Promise<CrackSpread[]> => {
      const { data, error } = await supabase
        .from('energy_crack_spreads')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        name: item.name,
        price: Number(item.price),
        change: Number(item.change_value),
        changePercent: Number(item.change_percent),
        ytd: Number(item.ytd),
      }));
    },
  });
};

// Fetch inventory data
export const useInventoryData = () => {
  return useQuery({
    queryKey: ['energy-inventory'],
    queryFn: async (): Promise<InventoryData[]> => {
      const { data, error } = await supabase
        .from('energy_inventory')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        name: item.name,
        value: item.value,
        change: item.change_text || '',
        changePercent: item.change_percent || '',
        status: item.status || 'up',
      }));
    },
  });
};

// Fetch related stocks
export const useRelatedStocksData = () => {
  return useQuery({
    queryKey: ['energy-related-stocks'],
    queryFn: async (): Promise<StockData[]> => {
      const { data, error } = await supabase
        .from('energy_related_stocks')
        .select('*')
        .order('code', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        code: item.code,
        price: Number(item.price),
        change: Number(item.change_value),
        changePercent: Number(item.change_percent),
        ytd: Number(item.ytd),
      }));
    },
  });
};

// Fetch news data
export const useEnergyNewsData = () => {
  return useQuery({
    queryKey: ['energy-news'],
    queryFn: async (): Promise<NewsItem[]> => {
      const { data, error } = await supabase
        .from('energy_news')
        .select('*')
        .eq('is_scrolling', false)
        .order('publish_time', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        time: item.publish_time ? String(item.publish_time).substring(0, 5) : '',
        title: item.title,
      }));
    },
  });
};

// Fetch scrolling news
export const useScrollingNews = () => {
  return useQuery({
    queryKey: ['energy-scrolling-news'],
    queryFn: async (): Promise<string> => {
      const { data, error } = await supabase
        .from('energy_news')
        .select('title')
        .eq('is_scrolling', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(item => item.title).join(' · ');
    },
  });
};

// Fetch market indices
export const useMarketIndicesData = () => {
  return useQuery({
    queryKey: ['energy-market-indices'],
    queryFn: async (): Promise<IndexData[]> => {
      const { data, error } = await supabase
        .from('energy_market_indices')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        name: item.name,
        value: item.value,
        change: item.change_value || '',
        changePercent: item.change_percent || '',
      }));
    },
  });
};
