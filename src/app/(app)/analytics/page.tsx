'use client';

import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { mockOpportunities } from '@/lib/mock-data';
import { Opportunity } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Users, PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
                {payload.name}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 6}
                outerRadius={outerRadius + 10}
                fill={fill}
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value} projects`}</text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                {`(Rate ${(percent * 100).toFixed(2)}%)`}
            </text>
        </g>
    );
};


export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        setOpportunities(mockOpportunities);
        setLoading(false);
    }, []);

    const teamSizeData = useMemo(() => {
        return opportunities.map(op => ({
            name: op.title.length > 15 ? `${op.title.substring(0, 15)}...` : op.title,
            members: op.teamMembers.length + 1, // owner + team members
        }));
    }, [opportunities]);

    const popularSkillsData = useMemo(() => {
        const skillCount = new Map<string, number>();
        opportunities.forEach(op => {
            op.requiredSkills.forEach(skill => {
                skillCount.set(skill, (skillCount.get(skill) || 0) + 1);
            });
        });
        return Array.from(skillCount.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0,6);
    }, [opportunities]);
    
    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    return (
        <div className="space-y-8">
            <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                    <CardTitle className="text-4xl font-bold tracking-tight flex items-center gap-3">
                        <TrendingUp className="w-10 h-10 text-primary" />
                        Project Analytics
                    </CardTitle>
                    <CardDescription className="text-lg text-muted-foreground">
                        An overview of the project landscape.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid gap-8 md:grid-cols-2">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-6 h-6 text-primary"/>
                            Team Size Distribution
                        </CardTitle>
                        <CardDescription>Number of members per project.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-[300px] w-full" /> : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={teamSizeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} interval={0} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <Tooltip
                                        cursor={{ fill: 'hsla(var(--primary), 0.1)' }}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--background))',
                                            borderColor: 'hsl(var(--border))',
                                            borderRadius: 'var(--radius)',
                                        }}
                                    />
                                    <Legend wrapperStyle={{fontSize: "14px"}} />
                                    <Bar dataKey="members" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieIcon className="w-6 h-6 text-primary"/>
                            Most In-Demand Skills
                        </CardTitle>
                         <CardDescription>Top 6 skills required by projects.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-[300px] w-full" /> : (
                             <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        activeIndex={activeIndex}
                                        activeShape={renderActiveShape}
                                        data={popularSkillsData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="hsl(var(--primary))"
                                        dataKey="value"
                                        onMouseEnter={onPieEnter}
                                    >
                                        {popularSkillsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
