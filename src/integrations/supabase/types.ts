export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      backtest_results: {
        Row: {
          avg_holding_time: number | null
          backtest_end: string
          backtest_start: string
          created_at: string
          cumulative_return: number | null
          final_capital: number | null
          id: string
          initial_capital: number | null
          max_drawdown: number | null
          sharpe_ratio: number | null
          strategy_id: string | null
          total_trades: number | null
          trades_detail: Json | null
          user_id: string | null
          win_rate: number | null
        }
        Insert: {
          avg_holding_time?: number | null
          backtest_end: string
          backtest_start: string
          created_at?: string
          cumulative_return?: number | null
          final_capital?: number | null
          id?: string
          initial_capital?: number | null
          max_drawdown?: number | null
          sharpe_ratio?: number | null
          strategy_id?: string | null
          total_trades?: number | null
          trades_detail?: Json | null
          user_id?: string | null
          win_rate?: number | null
        }
        Update: {
          avg_holding_time?: number | null
          backtest_end?: string
          backtest_start?: string
          created_at?: string
          cumulative_return?: number | null
          final_capital?: number | null
          id?: string
          initial_capital?: number | null
          max_drawdown?: number | null
          sharpe_ratio?: number | null
          strategy_id?: string | null
          total_trades?: number | null
          trades_detail?: Json | null
          user_id?: string | null
          win_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "backtest_results_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "trading_strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      bidding_behavior_analysis: {
        Row: {
          analysis_month: string | null
          bid_count: number | null
          created_at: string
          id: string
          price_range: string
          province: string
          win_rate: number | null
        }
        Insert: {
          analysis_month?: string | null
          bid_count?: number | null
          created_at?: string
          id?: string
          price_range: string
          province?: string
          win_rate?: number | null
        }
        Update: {
          analysis_month?: string | null
          bid_count?: number | null
          created_at?: string
          id?: string
          price_range?: string
          province?: string
          win_rate?: number | null
        }
        Relationships: []
      }
      clearing_records: {
        Row: {
          bid_id: string | null
          clearing_date: string
          created_at: string
          day_ahead_clear_price: number | null
          day_ahead_clear_volume: number | null
          hour: number
          id: string
          realtime_clear_price: number | null
          realtime_clear_volume: number | null
          status: string
          trading_type: string
          trading_unit_id: string | null
        }
        Insert: {
          bid_id?: string | null
          clearing_date: string
          created_at?: string
          day_ahead_clear_price?: number | null
          day_ahead_clear_volume?: number | null
          hour: number
          id?: string
          realtime_clear_price?: number | null
          realtime_clear_volume?: number | null
          status?: string
          trading_type: string
          trading_unit_id?: string | null
        }
        Update: {
          bid_id?: string | null
          clearing_date?: string
          created_at?: string
          day_ahead_clear_price?: number | null
          day_ahead_clear_volume?: number | null
          hour?: number
          id?: string
          realtime_clear_price?: number | null
          realtime_clear_volume?: number | null
          status?: string
          trading_type?: string
          trading_unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clearing_records_bid_id_fkey"
            columns: ["bid_id"]
            isOneToOne: false
            referencedRelation: "trading_bids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clearing_records_trading_unit_id_fkey"
            columns: ["trading_unit_id"]
            isOneToOne: false
            referencedRelation: "trading_units"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_time_series: {
        Row: {
          contract_id: string | null
          created_at: string
          effective_date: string
          id: string
          price: number | null
          time_point: number
          volume: number | null
        }
        Insert: {
          contract_id?: string | null
          created_at?: string
          effective_date: string
          id?: string
          price?: number | null
          time_point: number
          volume?: number | null
        }
        Update: {
          contract_id?: string | null
          created_at?: string
          effective_date?: string
          id?: string
          price?: number | null
          time_point?: number
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_time_series_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          contract_name: string
          contract_no: string
          contract_type: string
          counterparty: string | null
          created_at: string
          direction: string
          end_date: string
          id: string
          start_date: string
          status: string
          total_amount: number | null
          total_volume: number | null
          trading_unit_id: string | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          contract_name: string
          contract_no: string
          contract_type: string
          counterparty?: string | null
          created_at?: string
          direction: string
          end_date: string
          id?: string
          start_date: string
          status?: string
          total_amount?: number | null
          total_volume?: number | null
          trading_unit_id?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          contract_name?: string
          contract_no?: string
          contract_type?: string
          counterparty?: string | null
          created_at?: string
          direction?: string
          end_date?: string
          id?: string
          start_date?: string
          status?: string
          total_amount?: number | null
          total_volume?: number | null
          trading_unit_id?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_trading_unit_id_fkey"
            columns: ["trading_unit_id"]
            isOneToOne: false
            referencedRelation: "trading_units"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          agent_name: string | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          contract_status: string
          created_at: string
          customer_code: string
          id: string
          industry_type: string | null
          intermediary_cost: number | null
          is_active: boolean
          name: string
          package_type: string
          price_mode: string | null
          total_capacity: number | null
          updated_at: string
          voltage_level: string
        }
        Insert: {
          address?: string | null
          agent_name?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          contract_status?: string
          created_at?: string
          customer_code: string
          id?: string
          industry_type?: string | null
          intermediary_cost?: number | null
          is_active?: boolean
          name: string
          package_type: string
          price_mode?: string | null
          total_capacity?: number | null
          updated_at?: string
          voltage_level: string
        }
        Update: {
          address?: string | null
          agent_name?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          contract_status?: string
          created_at?: string
          customer_code?: string
          id?: string
          industry_type?: string | null
          intermediary_cost?: number | null
          is_active?: boolean
          name?: string
          package_type?: string
          price_mode?: string | null
          total_capacity?: number | null
          updated_at?: string
          voltage_level?: string
        }
        Relationships: []
      }
      energy_crack_spreads: {
        Row: {
          change_percent: number | null
          change_value: number | null
          created_at: string
          id: string
          name: string
          price: number
          quote_date: string
          ytd: number | null
        }
        Insert: {
          change_percent?: number | null
          change_value?: number | null
          created_at?: string
          id?: string
          name: string
          price: number
          quote_date?: string
          ytd?: number | null
        }
        Update: {
          change_percent?: number | null
          change_value?: number | null
          created_at?: string
          id?: string
          name?: string
          price?: number
          quote_date?: string
          ytd?: number | null
        }
        Relationships: []
      }
      energy_crude_quotes: {
        Row: {
          category: string
          change_percent: number | null
          change_value: number | null
          contract: string | null
          created_at: string
          id: string
          name: string | null
          price: number
          quote_date: string
          quote_time: string | null
          ytd: number | null
        }
        Insert: {
          category: string
          change_percent?: number | null
          change_value?: number | null
          contract?: string | null
          created_at?: string
          id?: string
          name?: string | null
          price: number
          quote_date?: string
          quote_time?: string | null
          ytd?: number | null
        }
        Update: {
          category?: string
          change_percent?: number | null
          change_value?: number | null
          contract?: string | null
          created_at?: string
          id?: string
          name?: string | null
          price?: number
          quote_date?: string
          quote_time?: string | null
          ytd?: number | null
        }
        Relationships: []
      }
      energy_ine_intraday: {
        Row: {
          created_at: string
          id: string
          price: number
          quote_date: string
          time_point: string
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          quote_date?: string
          time_point: string
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          quote_date?: string
          time_point?: string
        }
        Relationships: []
      }
      energy_inventory: {
        Row: {
          change_percent: string | null
          change_text: string | null
          created_at: string
          id: string
          name: string
          quote_date: string
          status: string | null
          value: string
        }
        Insert: {
          change_percent?: string | null
          change_text?: string | null
          created_at?: string
          id?: string
          name: string
          quote_date?: string
          status?: string | null
          value: string
        }
        Update: {
          change_percent?: string | null
          change_text?: string | null
          created_at?: string
          id?: string
          name?: string
          quote_date?: string
          status?: string | null
          value?: string
        }
        Relationships: []
      }
      energy_market_indices: {
        Row: {
          change_percent: string | null
          change_value: string | null
          created_at: string
          id: string
          name: string
          quote_date: string
          value: string
        }
        Insert: {
          change_percent?: string | null
          change_value?: string | null
          created_at?: string
          id?: string
          name: string
          quote_date?: string
          value: string
        }
        Update: {
          change_percent?: string | null
          change_value?: string | null
          created_at?: string
          id?: string
          name?: string
          quote_date?: string
          value?: string
        }
        Relationships: []
      }
      energy_news: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_scrolling: boolean | null
          publish_date: string
          publish_time: string | null
          source: string | null
          title: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_scrolling?: boolean | null
          publish_date?: string
          publish_time?: string | null
          source?: string | null
          title: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_scrolling?: boolean | null
          publish_date?: string
          publish_time?: string | null
          source?: string | null
          title?: string
        }
        Relationships: []
      }
      energy_refined_quotes: {
        Row: {
          change_percent: number | null
          change_value: number | null
          created_at: string
          id: string
          name: string
          price: number
          quote_date: string
          ytd: number | null
        }
        Insert: {
          change_percent?: number | null
          change_value?: number | null
          created_at?: string
          id?: string
          name: string
          price: number
          quote_date?: string
          ytd?: number | null
        }
        Update: {
          change_percent?: number | null
          change_value?: number | null
          created_at?: string
          id?: string
          name?: string
          price?: number
          quote_date?: string
          ytd?: number | null
        }
        Relationships: []
      }
      energy_related_stocks: {
        Row: {
          change_percent: number | null
          change_value: number | null
          code: string
          created_at: string
          id: string
          price: number
          quote_date: string
          ytd: number | null
        }
        Insert: {
          change_percent?: number | null
          change_value?: number | null
          code: string
          created_at?: string
          id?: string
          price: number
          quote_date?: string
          ytd?: number | null
        }
        Update: {
          change_percent?: number | null
          change_value?: number | null
          code?: string
          created_at?: string
          id?: string
          price?: number
          quote_date?: string
          ytd?: number | null
        }
        Relationships: []
      }
      energy_usage: {
        Row: {
          actual_energy: number | null
          created_at: string
          customer_id: string | null
          deviation_rate: number | null
          flat_energy: number | null
          id: string
          peak_energy: number | null
          predicted_energy: number | null
          profit_loss: number | null
          total_energy: number
          usage_date: string
          valley_energy: number | null
        }
        Insert: {
          actual_energy?: number | null
          created_at?: string
          customer_id?: string | null
          deviation_rate?: number | null
          flat_energy?: number | null
          id?: string
          peak_energy?: number | null
          predicted_energy?: number | null
          profit_loss?: number | null
          total_energy: number
          usage_date: string
          valley_energy?: number | null
        }
        Update: {
          actual_energy?: number | null
          created_at?: string
          customer_id?: string | null
          deviation_rate?: number | null
          flat_energy?: number | null
          id?: string
          peak_energy?: number | null
          predicted_energy?: number | null
          profit_loss?: number | null
          total_energy?: number
          usage_date?: string
          valley_energy?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "energy_usage_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_records: {
        Row: {
          allocation_price: number | null
          created_at: string
          customer_id: string | null
          executed_price: number | null
          executed_revenue: number | null
          executed_volume: number
          execution_date: string
          execution_period: string | null
          execution_progress: number | null
          id: string
          predicted_volume: number | null
          status: string
          volume_deviation: number | null
          volume_deviation_rate: number | null
        }
        Insert: {
          allocation_price?: number | null
          created_at?: string
          customer_id?: string | null
          executed_price?: number | null
          executed_revenue?: number | null
          executed_volume: number
          execution_date: string
          execution_period?: string | null
          execution_progress?: number | null
          id?: string
          predicted_volume?: number | null
          status?: string
          volume_deviation?: number | null
          volume_deviation_rate?: number | null
        }
        Update: {
          allocation_price?: number | null
          created_at?: string
          customer_id?: string | null
          executed_price?: number | null
          executed_revenue?: number | null
          executed_volume?: number
          execution_date?: string
          execution_period?: string | null
          execution_progress?: number | null
          id?: string
          predicted_volume?: number | null
          status?: string
          volume_deviation?: number | null
          volume_deviation_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "execution_records_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      load_forecast: {
        Row: {
          created_at: string
          forecast_date: string
          historical: number | null
          id: string
          lower_bound: number | null
          predicted: number | null
          province: string
          upper_bound: number | null
        }
        Insert: {
          created_at?: string
          forecast_date: string
          historical?: number | null
          id?: string
          lower_bound?: number | null
          predicted?: number | null
          province?: string
          upper_bound?: number | null
        }
        Update: {
          created_at?: string
          forecast_date?: string
          historical?: number | null
          id?: string
          lower_bound?: number | null
          predicted?: number | null
          province?: string
          upper_bound?: number | null
        }
        Relationships: []
      }
      load_predictions: {
        Row: {
          actual_load: number | null
          confidence: number | null
          created_at: string
          hour: number
          id: string
          p10: number | null
          p50: number | null
          p90: number | null
          prediction_date: string
          prediction_type: string | null
          trading_unit_id: string | null
        }
        Insert: {
          actual_load?: number | null
          confidence?: number | null
          created_at?: string
          hour: number
          id?: string
          p10?: number | null
          p50?: number | null
          p90?: number | null
          prediction_date: string
          prediction_type?: string | null
          trading_unit_id?: string | null
        }
        Update: {
          actual_load?: number | null
          confidence?: number | null
          created_at?: string
          hour?: number
          id?: string
          p10?: number | null
          p50?: number | null
          p90?: number | null
          prediction_date?: string
          prediction_type?: string | null
          trading_unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "load_predictions_trading_unit_id_fkey"
            columns: ["trading_unit_id"]
            isOneToOne: false
            referencedRelation: "trading_units"
            referencedColumns: ["id"]
          },
        ]
      }
      market_clearing_prices: {
        Row: {
          created_at: string | null
          day_ahead_price: number | null
          hour: number
          id: string
          price_date: string
          province: string
          realtime_price: number | null
        }
        Insert: {
          created_at?: string | null
          day_ahead_price?: number | null
          hour: number
          id?: string
          price_date: string
          province?: string
          realtime_price?: number | null
        }
        Update: {
          created_at?: string | null
          day_ahead_price?: number | null
          hour?: number
          id?: string
          price_date?: string
          province?: string
          realtime_price?: number | null
        }
        Relationships: []
      }
      medium_long_term_prices: {
        Row: {
          avg_price: number | null
          buy_volume: number | null
          created_at: string
          id: string
          matched_volume: number | null
          max_price: number | null
          min_price: number | null
          participants: number | null
          province: string
          renewable_price: number | null
          sell_volume: number | null
          success_rate: number | null
          thermal_price: number | null
          trade_date: string
          trade_month: string
          transaction_type: string
          volume: number | null
        }
        Insert: {
          avg_price?: number | null
          buy_volume?: number | null
          created_at?: string
          id?: string
          matched_volume?: number | null
          max_price?: number | null
          min_price?: number | null
          participants?: number | null
          province?: string
          renewable_price?: number | null
          sell_volume?: number | null
          success_rate?: number | null
          thermal_price?: number | null
          trade_date: string
          trade_month: string
          transaction_type: string
          volume?: number | null
        }
        Update: {
          avg_price?: number | null
          buy_volume?: number | null
          created_at?: string
          id?: string
          matched_volume?: number | null
          max_price?: number | null
          min_price?: number | null
          participants?: number | null
          province?: string
          renewable_price?: number | null
          sell_volume?: number | null
          success_rate?: number | null
          thermal_price?: number | null
          trade_date?: string
          trade_month?: string
          transaction_type?: string
          volume?: number | null
        }
        Relationships: []
      }
      news_policies: {
        Row: {
          category: string
          content: string | null
          created_at: string
          file_path: string | null
          id: string
          issuer: string | null
          priority: string | null
          province: string | null
          publish_date: string
          publish_time: string | null
          source: string | null
          status: string | null
          summary: string | null
          title: string
          type: string
          updated_at: string
          url: string | null
          views: number | null
        }
        Insert: {
          category: string
          content?: string | null
          created_at?: string
          file_path?: string | null
          id?: string
          issuer?: string | null
          priority?: string | null
          province?: string | null
          publish_date: string
          publish_time?: string | null
          source?: string | null
          status?: string | null
          summary?: string | null
          title: string
          type?: string
          updated_at?: string
          url?: string | null
          views?: number | null
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          file_path?: string | null
          id?: string
          issuer?: string | null
          priority?: string | null
          province?: string | null
          publish_date?: string
          publish_time?: string | null
          source?: string | null
          status?: string | null
          summary?: string | null
          title?: string
          type?: string
          updated_at?: string
          url?: string | null
          views?: number | null
        }
        Relationships: []
      }
      package_simulations: {
        Row: {
          break_even_price: number | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          estimated_monthly_usage: number | null
          fixed_price: number | null
          flat_ratio: number | null
          floating_adjustment: number | null
          floating_base_price: number | null
          floating_price_type: string | null
          gross_profit: number | null
          id: string
          intermediary_cost: number | null
          other_costs: number | null
          package_type: string
          peak_ratio: number | null
          profit_margin: number | null
          purchase_cost: number | null
          scheme_name: string
          total_cost: number | null
          total_revenue: number | null
          transmission_cost: number | null
          valley_ratio: number | null
        }
        Insert: {
          break_even_price?: number | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          estimated_monthly_usage?: number | null
          fixed_price?: number | null
          flat_ratio?: number | null
          floating_adjustment?: number | null
          floating_base_price?: number | null
          floating_price_type?: string | null
          gross_profit?: number | null
          id?: string
          intermediary_cost?: number | null
          other_costs?: number | null
          package_type: string
          peak_ratio?: number | null
          profit_margin?: number | null
          purchase_cost?: number | null
          scheme_name: string
          total_cost?: number | null
          total_revenue?: number | null
          transmission_cost?: number | null
          valley_ratio?: number | null
        }
        Update: {
          break_even_price?: number | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          estimated_monthly_usage?: number | null
          fixed_price?: number | null
          flat_ratio?: number | null
          floating_adjustment?: number | null
          floating_base_price?: number | null
          floating_price_type?: string | null
          gross_profit?: number | null
          id?: string
          intermediary_cost?: number | null
          other_costs?: number | null
          package_type?: string
          peak_ratio?: number | null
          profit_margin?: number | null
          purchase_cost?: number | null
          scheme_name?: string
          total_cost?: number | null
          total_revenue?: number | null
          transmission_cost?: number | null
          valley_ratio?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "package_simulations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          can_approve: boolean
          can_delete: boolean
          can_edit: boolean
          can_view: boolean
          created_at: string
          id: string
          module: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_approve?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_approve?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      power_plan_time_series: {
        Row: {
          actual_power: number | null
          created_at: string
          effective_date: string
          id: string
          plan_id: string | null
          planned_power: number | null
          predicted_power: number | null
          time_granularity: string
          time_point: number
        }
        Insert: {
          actual_power?: number | null
          created_at?: string
          effective_date: string
          id?: string
          plan_id?: string | null
          planned_power?: number | null
          predicted_power?: number | null
          time_granularity?: string
          time_point: number
        }
        Update: {
          actual_power?: number | null
          created_at?: string
          effective_date?: string
          id?: string
          plan_id?: string | null
          planned_power?: number | null
          predicted_power?: number | null
          time_granularity?: string
          time_point?: number
        }
        Relationships: [
          {
            foreignKeyName: "power_plan_time_series_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "power_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      power_plans: {
        Row: {
          actual_volume: number | null
          completion_rate: number | null
          created_at: string
          created_by: string | null
          deviation_rate: number | null
          id: string
          plan_month: number | null
          plan_type: string
          plan_year: number
          planned_volume: number
          published_at: string | null
          reference_volume: number | null
          reference_year: number | null
          remarks: string | null
          settled_volume: number | null
          status: string
          trading_unit_id: string | null
          updated_at: string
        }
        Insert: {
          actual_volume?: number | null
          completion_rate?: number | null
          created_at?: string
          created_by?: string | null
          deviation_rate?: number | null
          id?: string
          plan_month?: number | null
          plan_type: string
          plan_year: number
          planned_volume?: number
          published_at?: string | null
          reference_volume?: number | null
          reference_year?: number | null
          remarks?: string | null
          settled_volume?: number | null
          status?: string
          trading_unit_id?: string | null
          updated_at?: string
        }
        Update: {
          actual_volume?: number | null
          completion_rate?: number | null
          created_at?: string
          created_by?: string | null
          deviation_rate?: number | null
          id?: string
          plan_month?: number | null
          plan_type?: string
          plan_year?: number
          planned_volume?: number
          published_at?: string | null
          reference_volume?: number | null
          reference_year?: number | null
          remarks?: string | null
          settled_volume?: number | null
          status?: string
          trading_unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "power_plans_trading_unit_id_fkey"
            columns: ["trading_unit_id"]
            isOneToOne: false
            referencedRelation: "trading_units"
            referencedColumns: ["id"]
          },
        ]
      }
      power_stations: {
        Row: {
          commission_date: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          grid_connection_voltage: string | null
          id: string
          installed_capacity: number
          is_active: boolean
          location_lat: number | null
          location_lng: number | null
          name: string
          province: string
          region: string | null
          station_type: string
          updated_at: string
        }
        Insert: {
          commission_date?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          grid_connection_voltage?: string | null
          id?: string
          installed_capacity: number
          is_active?: boolean
          location_lat?: number | null
          location_lng?: number | null
          name: string
          province?: string
          region?: string | null
          station_type: string
          updated_at?: string
        }
        Update: {
          commission_date?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          grid_connection_voltage?: string | null
          id?: string
          installed_capacity?: number
          is_active?: boolean
          location_lat?: number | null
          location_lng?: number | null
          name?: string
          province?: string
          region?: string | null
          station_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      price_distribution: {
        Row: {
          count: number
          created_at: string
          id: string
          price_range_end: number
          price_range_start: number
          province: string
          trade_month: string
          transaction_type: string
        }
        Insert: {
          count?: number
          created_at?: string
          id?: string
          price_range_end: number
          price_range_start: number
          province?: string
          trade_month: string
          transaction_type: string
        }
        Update: {
          count?: number
          created_at?: string
          id?: string
          price_range_end?: number
          price_range_start?: number
          province?: string
          trade_month?: string
          transaction_type?: string
        }
        Relationships: []
      }
      price_predictions: {
        Row: {
          actual_day_ahead: number | null
          actual_realtime: number | null
          confidence: number | null
          created_at: string
          hour: number
          id: string
          predicted_day_ahead: number | null
          predicted_realtime: number | null
          prediction_date: string
          province: string
        }
        Insert: {
          actual_day_ahead?: number | null
          actual_realtime?: number | null
          confidence?: number | null
          created_at?: string
          hour: number
          id?: string
          predicted_day_ahead?: number | null
          predicted_realtime?: number | null
          prediction_date: string
          province: string
        }
        Update: {
          actual_day_ahead?: number | null
          actual_realtime?: number | null
          confidence?: number | null
          created_at?: string
          hour?: number
          id?: string
          predicted_day_ahead?: number | null
          predicted_realtime?: number | null
          prediction_date?: string
          province?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          position: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      renewable_output_forecast: {
        Row: {
          created_at: string
          energy_type: string
          forecast_date: string
          id: string
          p10: number | null
          p50: number | null
          p90: number | null
          province: string
        }
        Insert: {
          created_at?: string
          energy_type: string
          forecast_date: string
          id?: string
          p10?: number | null
          p50?: number | null
          p90?: number | null
          province?: string
        }
        Update: {
          created_at?: string
          energy_type?: string
          forecast_date?: string
          id?: string
          p10?: number | null
          p50?: number | null
          p90?: number | null
          province?: string
        }
        Relationships: []
      }
      report_templates: {
        Row: {
          config: Json
          created_at: string
          description: string | null
          id: string
          is_preset: boolean
          is_shared: boolean
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          config: Json
          created_at?: string
          description?: string | null
          id?: string
          is_preset?: boolean
          is_shared?: boolean
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_preset?: boolean
          is_shared?: boolean
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      settlement_records: {
        Row: {
          amount: number
          category: string
          created_at: string
          id: string
          price: number | null
          remark: string | null
          settlement_month: string
          settlement_no: string
          side: string
          status: string
          sub_category: string | null
          trading_unit_id: string | null
          updated_at: string
          volume: number
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          id?: string
          price?: number | null
          remark?: string | null
          settlement_month: string
          settlement_no: string
          side: string
          status?: string
          sub_category?: string | null
          trading_unit_id?: string | null
          updated_at?: string
          volume: number
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          id?: string
          price?: number | null
          remark?: string | null
          settlement_month?: string
          settlement_no?: string
          side?: string
          status?: string
          sub_category?: string | null
          trading_unit_id?: string | null
          updated_at?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "settlement_records_trading_unit_id_fkey"
            columns: ["trading_unit_id"]
            isOneToOne: false
            referencedRelation: "trading_units"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_statements: {
        Row: {
          audited_at: string | null
          audited_by: string | null
          created_at: string
          file_path: string | null
          generated_at: string
          id: string
          period_end: string
          period_start: string
          statement_no: string
          statement_type: string
          status: string
          total_amount: number
          total_volume: number
          trading_unit_id: string | null
        }
        Insert: {
          audited_at?: string | null
          audited_by?: string | null
          created_at?: string
          file_path?: string | null
          generated_at?: string
          id?: string
          period_end: string
          period_start: string
          statement_no: string
          statement_type: string
          status?: string
          total_amount: number
          total_volume: number
          trading_unit_id?: string | null
        }
        Update: {
          audited_at?: string | null
          audited_by?: string | null
          created_at?: string
          file_path?: string | null
          generated_at?: string
          id?: string
          period_end?: string
          period_start?: string
          statement_no?: string
          statement_type?: string
          status?: string
          total_amount?: number
          total_volume?: number
          trading_unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settlement_statements_trading_unit_id_fkey"
            columns: ["trading_unit_id"]
            isOneToOne: false
            referencedRelation: "trading_units"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_recommendations: {
        Row: {
          applied_at: string | null
          confidence_level: number | null
          created_at: string
          expected_return: number | null
          id: string
          is_applied: boolean
          market_status: Json | null
          reasoning: string[] | null
          recommendation_time: string
          result_profit: number | null
          risk_score: number | null
          strategy_id: string | null
          suggested_actions: Json | null
          trading_unit_id: string | null
          user_id: string | null
        }
        Insert: {
          applied_at?: string | null
          confidence_level?: number | null
          created_at?: string
          expected_return?: number | null
          id?: string
          is_applied?: boolean
          market_status?: Json | null
          reasoning?: string[] | null
          recommendation_time?: string
          result_profit?: number | null
          risk_score?: number | null
          strategy_id?: string | null
          suggested_actions?: Json | null
          trading_unit_id?: string | null
          user_id?: string | null
        }
        Update: {
          applied_at?: string | null
          confidence_level?: number | null
          created_at?: string
          expected_return?: number | null
          id?: string
          is_applied?: boolean
          market_status?: Json | null
          reasoning?: string[] | null
          recommendation_time?: string
          result_profit?: number | null
          risk_score?: number | null
          strategy_id?: string | null
          suggested_actions?: Json | null
          trading_unit_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategy_recommendations_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "trading_strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategy_recommendations_trading_unit_id_fkey"
            columns: ["trading_unit_id"]
            isOneToOne: false
            referencedRelation: "trading_units"
            referencedColumns: ["id"]
          },
        ]
      }
      thermal_bidding_forecast: {
        Row: {
          bidding_space: number | null
          created_at: string
          forecast_date: string
          historical_avg: number | null
          id: string
          predicted: number | null
          province: string
        }
        Insert: {
          bidding_space?: number | null
          created_at?: string
          forecast_date: string
          historical_avg?: number | null
          id?: string
          predicted?: number | null
          province?: string
        }
        Update: {
          bidding_space?: number | null
          created_at?: string
          forecast_date?: string
          historical_avg?: number | null
          id?: string
          predicted?: number | null
          province?: string
        }
        Relationships: []
      }
      tie_line_forecast: {
        Row: {
          created_at: string
          forecast_date: string
          id: string
          inflow: number | null
          net_position: number | null
          outflow: number | null
          province: string
        }
        Insert: {
          created_at?: string
          forecast_date: string
          id?: string
          inflow?: number | null
          net_position?: number | null
          outflow?: number | null
          province?: string
        }
        Update: {
          created_at?: string
          forecast_date?: string
          id?: string
          inflow?: number | null
          net_position?: number | null
          outflow?: number | null
          province?: string
        }
        Relationships: []
      }
      trading_bids: {
        Row: {
          bid_no: string
          bid_price: number
          bid_type: string
          bid_volume: number
          calendar_id: string | null
          created_at: string
          id: string
          status: string
          submitted_at: string | null
          submitted_by: string | null
          time_period: string | null
          trading_unit_id: string | null
          updated_at: string
        }
        Insert: {
          bid_no: string
          bid_price: number
          bid_type: string
          bid_volume: number
          calendar_id?: string | null
          created_at?: string
          id?: string
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          time_period?: string | null
          trading_unit_id?: string | null
          updated_at?: string
        }
        Update: {
          bid_no?: string
          bid_price?: number
          bid_type?: string
          bid_volume?: number
          calendar_id?: string | null
          created_at?: string
          id?: string
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          time_period?: string | null
          trading_unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trading_bids_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "trading_calendar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trading_bids_trading_unit_id_fkey"
            columns: ["trading_unit_id"]
            isOneToOne: false
            referencedRelation: "trading_units"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_calendar: {
        Row: {
          announcement_time: string | null
          created_at: string
          execution_end: string | null
          execution_start: string | null
          id: string
          sequence_no: string
          status: string
          submission_deadline: string | null
          trading_center: string
          trading_date: string
          trading_type: string
        }
        Insert: {
          announcement_time?: string | null
          created_at?: string
          execution_end?: string | null
          execution_start?: string | null
          id?: string
          sequence_no: string
          status?: string
          submission_deadline?: string | null
          trading_center: string
          trading_date: string
          trading_type: string
        }
        Update: {
          announcement_time?: string | null
          created_at?: string
          execution_end?: string | null
          execution_start?: string | null
          id?: string
          sequence_no?: string
          status?: string
          submission_deadline?: string | null
          trading_center?: string
          trading_date?: string
          trading_type?: string
        }
        Relationships: []
      }
      trading_strategies: {
        Row: {
          created_at: string
          description: string | null
          expected_return: number | null
          id: string
          is_active: boolean
          is_preset: boolean
          name: string
          risk_control: Json | null
          risk_level: string
          strategy_type: string
          trading_params: Json | null
          trigger_conditions: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          expected_return?: number | null
          id?: string
          is_active?: boolean
          is_preset?: boolean
          name: string
          risk_control?: Json | null
          risk_level: string
          strategy_type: string
          trading_params?: Json | null
          trigger_conditions?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          expected_return?: number | null
          id?: string
          is_active?: boolean
          is_preset?: boolean
          name?: string
          risk_control?: Json | null
          risk_level?: string
          strategy_type?: string
          trading_params?: Json | null
          trigger_conditions?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      trading_units: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          registered_capacity: number | null
          station_id: string | null
          trading_category: string
          trading_center: string
          unit_code: string
          unit_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          registered_capacity?: number | null
          station_id?: string | null
          trading_category: string
          trading_center: string
          unit_code: string
          unit_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          registered_capacity?: number | null
          station_id?: string | null
          trading_category?: string
          trading_center?: string
          unit_code?: string
          unit_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trading_units_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "power_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_business_scope: {
        Row: {
          created_at: string
          id: string
          scope_id: string
          scope_name: string
          scope_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          scope_id: string
          scope_name: string
          scope_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          scope_id?: string
          scope_name?: string
          scope_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weather_alerts: {
        Row: {
          alert_level: string
          alert_type: string
          created_at: string
          description: string | null
          end_time: string | null
          id: string
          is_active: boolean | null
          province: string
          region: string | null
          start_time: string
          title: string
        }
        Insert: {
          alert_level: string
          alert_type: string
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          province?: string
          region?: string | null
          start_time: string
          title: string
        }
        Update: {
          alert_level?: string
          alert_type?: string
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          province?: string
          region?: string | null
          start_time?: string
          title?: string
        }
        Relationships: []
      }
      weather_data: {
        Row: {
          cloud_cover: number | null
          created_at: string
          data_source: string | null
          data_type: string | null
          forecast_radiation: number | null
          forecast_temperature: number | null
          forecast_wind_speed: number | null
          humidity: number | null
          id: string
          pressure: number | null
          province: string
          radiation: number | null
          rainfall: number | null
          record_date: string
          record_hour: number | null
          region: string | null
          snow_depth: number | null
          snowfall: number | null
          station_name: string | null
          temperature: number | null
          temperature_max: number | null
          temperature_min: number | null
          wind_direction: number | null
          wind_speed: number | null
        }
        Insert: {
          cloud_cover?: number | null
          created_at?: string
          data_source?: string | null
          data_type?: string | null
          forecast_radiation?: number | null
          forecast_temperature?: number | null
          forecast_wind_speed?: number | null
          humidity?: number | null
          id?: string
          pressure?: number | null
          province?: string
          radiation?: number | null
          rainfall?: number | null
          record_date: string
          record_hour?: number | null
          region?: string | null
          snow_depth?: number | null
          snowfall?: number | null
          station_name?: string | null
          temperature?: number | null
          temperature_max?: number | null
          temperature_min?: number | null
          wind_direction?: number | null
          wind_speed?: number | null
        }
        Update: {
          cloud_cover?: number | null
          created_at?: string
          data_source?: string | null
          data_type?: string | null
          forecast_radiation?: number | null
          forecast_temperature?: number | null
          forecast_wind_speed?: number | null
          humidity?: number | null
          id?: string
          pressure?: number | null
          province?: string
          radiation?: number | null
          rainfall?: number | null
          record_date?: string
          record_hour?: number | null
          region?: string | null
          snow_depth?: number | null
          snowfall?: number | null
          station_name?: string | null
          temperature?: number | null
          temperature_max?: number | null
          temperature_min?: number | null
          wind_direction?: number | null
          wind_speed?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "renewable_generation" | "retail_business"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "renewable_generation", "retail_business"],
    },
  },
} as const
