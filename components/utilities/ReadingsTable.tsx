import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Droplets, Zap, Flame } from 'lucide-react';

const mockReadings = [
    { id: 1, type: 'WATER', property: 'Sunset Apartments', unit: '4B', value: '4,502 gal', date: '2025-05-15', status: 'Normal' },
    { id: 2, type: 'ELECTRIC', property: 'Downtown Lofts', unit: '12A', value: '840 kWh', date: '2025-05-15', status: 'High' },
    { id: 3, type: 'GAS', property: 'Sunset Apartments', unit: 'Common', value: '45 therms', date: '2025-05-14', status: 'Normal' },
    { id: 4, type: 'WATER', property: 'Sunset Apartments', unit: '2A', value: '3,200 gal', date: '2025-05-14', status: 'Normal' },
    { id: 5, type: 'ELECTRIC', property: 'Downtown Lofts', unit: 'PH', value: '1,200 kWh', date: '2025-05-13', status: 'Anomaly' },
];

export function ReadingsTable() {
    return (
        <Card className="bg-card/50 backdrop-blur-sm border-white/5 h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Recent Readings</CardTitle>
                    <CardDescription>Latest meter inputs from all properties</CardDescription>
                </div>
                <button className="text-sm text-primary hover:text-primary/80 transition-colors">
                    View All
                </button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {mockReadings.map((reading) => (
                        <div key={reading.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-full bg-opacity-10 
                                    ${reading.type === 'WATER' ? 'bg-blue-500 text-blue-500' :
                                        reading.type === 'ELECTRIC' ? 'bg-yellow-500 text-yellow-500' : 'bg-orange-500 text-orange-500'}`}>
                                    {reading.type === 'WATER' ? <Droplets className="w-4 h-4" /> :
                                        reading.type === 'ELECTRIC' ? <Zap className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-foreground">{reading.property}</p>
                                    <p className="text-xs text-muted-foreground">{reading.unit} • {reading.date}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-medium text-sm text-foreground">{reading.value}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${reading.status === 'Anomaly' ? 'bg-red-500/10 text-red-500' :
                                    reading.status === 'High' ? 'bg-yellow-500/10 text-yellow-500' :
                                        'bg-green-500/10 text-green-500'
                                    }`}>
                                    {reading.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
