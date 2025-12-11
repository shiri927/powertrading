import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PriceRecord {
  province: string;
  price_date: string;
  hour: number;
  day_ahead_price: number | null;
  realtime_price: number | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { dayAheadCsv, realtimeCsv, province = '山东' } = await req.json();

    console.log(`Processing import for province: ${province}`);
    console.log(`Day ahead CSV lines: ${dayAheadCsv ? dayAheadCsv.split('\n').length : 0}`);
    console.log(`Realtime CSV lines: ${realtimeCsv ? realtimeCsv.split('\n').length : 0}`);

    const priceMap = new Map<string, PriceRecord>();

    // Parse day ahead prices
    if (dayAheadCsv) {
      const lines = dayAheadCsv.trim().split('\n');
      console.log(`Parsing ${lines.length - 1} day ahead price records`);
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split(',');
        if (parts.length < 3) continue;
        
        const dateStr = parts[0].trim();
        const hourStr = parts[1].trim();
        const price = parseFloat(parts[2].trim());
        
        // Extract hour from "01:00" format
        const hourMatch = hourStr.match(/(\d+):/);
        if (!hourMatch) continue;
        
        let hour = parseInt(hourMatch[1]);
        // Handle "24:00" as hour 24
        if (hour === 0 && hourStr === '24:00') hour = 24;
        if (hour === 0) hour = 24; // Convert 00:00 to hour 24
        
        const key = `${dateStr}-${hour}`;
        const existing = priceMap.get(key);
        if (existing) {
          existing.day_ahead_price = isNaN(price) ? null : price;
        } else {
          priceMap.set(key, {
            province,
            price_date: dateStr,
            hour,
            day_ahead_price: isNaN(price) ? null : price,
            realtime_price: null,
          });
        }
      }
    }

    // Parse realtime prices
    if (realtimeCsv) {
      const lines = realtimeCsv.trim().split('\n');
      console.log(`Parsing ${lines.length - 1} realtime price records`);
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split(',');
        if (parts.length < 3) continue;
        
        const dateStr = parts[0].trim();
        const hourStr = parts[1].trim();
        const price = parseFloat(parts[2].trim());
        
        const hourMatch = hourStr.match(/(\d+):/);
        if (!hourMatch) continue;
        
        let hour = parseInt(hourMatch[1]);
        if (hour === 0 && hourStr === '24:00') hour = 24;
        if (hour === 0) hour = 24;
        
        const key = `${dateStr}-${hour}`;
        const existing = priceMap.get(key);
        if (existing) {
          existing.realtime_price = isNaN(price) ? null : price;
        } else {
          priceMap.set(key, {
            province,
            price_date: dateStr,
            hour,
            day_ahead_price: null,
            realtime_price: isNaN(price) ? null : price,
          });
        }
      }
    }

    const records = Array.from(priceMap.values());
    console.log(`Total records to upsert: ${records.length}`);

    if (records.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'No valid records found in CSV' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Batch upsert in chunks of 1000
    const chunkSize = 1000;
    let totalInserted = 0;
    const errors: string[] = [];

    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      console.log(`Upserting chunk ${Math.floor(i / chunkSize) + 1} with ${chunk.length} records`);
      
      const { error } = await supabase
        .from('market_clearing_prices')
        .upsert(chunk, { 
          onConflict: 'province,price_date,hour',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error(`Error upserting chunk: ${error.message}`);
        errors.push(error.message);
      } else {
        totalInserted += chunk.length;
      }
    }

    console.log(`Import completed. Total records: ${totalInserted}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({ 
        success: errors.length === 0,
        message: `Successfully imported ${totalInserted} records`,
        totalRecords: totalInserted,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Import error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
