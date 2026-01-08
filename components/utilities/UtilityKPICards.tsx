import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DollarSign, Droplets, Zap, Flame, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';

interface UtilityMetrics {
    totalCost: number;
    recoveryRate: number;
    anomalies: number;
    waterUsage: number;
    electricUsage: number;
    gasUsage: number;
}

export function UtilityKPICards({ metrics }: { metrics: UtilityMetrics }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card/50 backdrop-blur-sm border-white/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Utility Cost (Mo)</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${metrics.totalCost.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                        <span className="text-red-500 flex items-center mr-1">
                            <ArrowUpRight className="h-3 w-3" /> 2.1%
                        </span>
                        vs last month
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-white/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">RUBS Recovery Rate</CardTitle>
                    <div className="h-4 w-4 text-green-500 font-bold">%</div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.recoveryRate}%</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                        <span className="text-green-500 flex items-center mr-1">
                            <ArrowUpRight className="h-3 w-3" /> 4.5%
                        </span>
                        efficiency
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-white/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Anomalies</CardTitle>
                    <AlertCircle className={`h-4 w-4 ${metrics.anomalies > 0 ? "text-red-500" : "text-muted-foreground"}`} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.anomalies}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {metrics.anomalies > 0 ? "Leaks or spikes detected" : "System running normally"}
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-white/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Usage Breakdown</CardTitle>
                    <Zap className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-end text-xs text-muted-foreground h-[44px]">
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-2 bg-blue-500/50 rounded-t h-6"></div>
                            <Droplets className="w-3 h-3" />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-2 bg-yellow-500/50 rounded-t h-10"></div>
                            <Zap className="w-3 h-3" />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-2 bg-orange-500/50 rounded-t h-4"></div>
                            <Flame className="w-3 h-3" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
