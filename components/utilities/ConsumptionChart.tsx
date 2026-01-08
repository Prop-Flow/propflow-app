'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Jan', water: 4000, electric: 2400, gas: 2400 },
    { name: 'Feb', water: 3000, electric: 1398, gas: 2210 },
    { name: 'Mar', water: 2000, electric: 9800, gas: 2290 },
    { name: 'Apr', water: 2780, electric: 3908, gas: 2000 },
    { name: 'May', water: 1890, electric: 4800, gas: 2181 },
    { name: 'Jun', water: 2390, electric: 3800, gas: 2500 },
    { name: 'Jul', water: 3490, electric: 4300, gas: 2100 },
];

export function ConsumptionChart() {
    return (
        <Card className="bg-card/50 backdrop-blur-sm border-white/5 h-full">
            <CardHeader>
                <CardTitle>Utility Consumption Trends</CardTitle>
                <CardDescription>Monthly usage breakdown by utility type</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="electric" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.2} name="Electric" />
                            <Area type="monotone" dataKey="water" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="Water" />
                            <Area type="monotone" dataKey="gas" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.2} name="Gas" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
