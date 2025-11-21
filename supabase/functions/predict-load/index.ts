import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { historicalData, weatherData, customerType, voltage } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // 构建用于AI预测的上下文
    const systemPrompt = `你是一个专业的电力负荷预测分析师。基于提供的历史用电数据、气象数据、客户类型和电压等级，预测未来24小时的用电负荷。

分析时考虑以下因素：
1. 历史用电模式和趋势
2. 气象条件（温度、湿度等）对用电的影响
3. 不同客户类型的用电特征
4. 不同电压等级的负荷特点
5. 时段特征（工作日/周末、峰谷平时段）

返回24小时分时段的预测结果，每个时段包含：预测电量、置信区间（上下界）、预测依据。`;

    const userPrompt = `请根据以下数据预测未来24小时的用电负荷：

历史数据摘要：
- 过去7天平均日用电量: ${historicalData.avgDailyLoad} MWh
- 峰值负荷: ${historicalData.peakLoad} MW
- 谷值负荷: ${historicalData.valleyLoad} MW
- 负荷率: ${historicalData.loadFactor}%

气象预测：
- 平均温度: ${weatherData.avgTemp}°C
- 最高温度: ${weatherData.maxTemp}°C
- 最低温度: ${weatherData.minTemp}°C
- 湿度: ${weatherData.humidity}%
- 天气: ${weatherData.condition}

客户信息：
- 客户类型: ${customerType}
- 电压等级: ${voltage}

请预测明天各时段的用电负荷。`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "predict_hourly_load",
              description: "返回24小时分时段负荷预测结果",
              parameters: {
                type: "object",
                properties: {
                  predictions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        hour: { type: "string", description: "小时，格式：00:00-23:00" },
                        predictedLoad: { type: "number", description: "预测负荷，单位MW" },
                        upperBound: { type: "number", description: "置信上界，单位MW" },
                        lowerBound: { type: "number", description: "置信下界，单位MW" },
                        confidence: { type: "number", description: "置信度，0-100" },
                        reasoning: { type: "string", description: "预测依据简述" },
                      },
                      required: ["hour", "predictedLoad", "upperBound", "lowerBound", "confidence", "reasoning"],
                      additionalProperties: false,
                    },
                  },
                  summary: {
                    type: "object",
                    properties: {
                      totalPredictedLoad: { type: "number", description: "预测总电量MWh" },
                      peakHour: { type: "string", description: "预测峰值时段" },
                      peakLoad: { type: "number", description: "预测峰值负荷MW" },
                      valleyHour: { type: "string", description: "预测谷值时段" },
                      valleyLoad: { type: "number", description: "预测谷值负荷MW" },
                      overallConfidence: { type: "number", description: "整体预测置信度0-100" },
                      keyFactors: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "影响预测的关键因素列表"
                      },
                    },
                    required: ["totalPredictedLoad", "peakHour", "peakLoad", "valleyHour", "valleyLoad", "overallConfidence", "keyFactors"],
                    additionalProperties: false,
                  },
                },
                required: ["predictions", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "predict_hourly_load" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI服务请求过于频繁，请稍后再试" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI服务额度不足，请联系管理员充值" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI预测服务异常" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    
    // 提取工具调用结果
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("AI未返回预测结果");
    }

    const predictionData = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        success: true,
        data: predictionData,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("predict-load error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "未知错误",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
