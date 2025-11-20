import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal } from "lucide-react";

const Console = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">交易操作台</h1>
        <p className="text-muted-foreground mt-2">
          中长期、日前、实时交易申报与执行
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            交易执行中心
          </CardTitle>
          <CardDescription>
            统一的交易申报与监控平台
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="centralized" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="centralized">集中竞价申报</TabsTrigger>
              <TabsTrigger value="rolling">日滚动交易申报</TabsTrigger>
              <TabsTrigger value="inter-provincial">省间现货申报</TabsTrigger>
              <TabsTrigger value="intra-provincial">省内现货申报</TabsTrigger>
            </TabsList>
            
            <TabsContent value="centralized" className="space-y-4">
              <div className="text-center py-12 text-muted-foreground">
                集中竞价申报功能开发中...
              </div>
            </TabsContent>
            
            <TabsContent value="rolling" className="space-y-4">
              <div className="text-center py-12 text-muted-foreground">
                日滚动交易申报功能开发中...
              </div>
            </TabsContent>
            
            <TabsContent value="inter-provincial" className="space-y-4">
              <div className="text-center py-12 text-muted-foreground">
                省间现货申报功能开发中...
              </div>
            </TabsContent>
            
            <TabsContent value="intra-provincial" className="space-y-4">
              <div className="text-center py-12 text-muted-foreground">
                省内现货申报功能开发中...
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Console;
