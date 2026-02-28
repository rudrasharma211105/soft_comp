import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

const PredictionResult = ({ result }) => {
    const { risk_score, risk_level, recommendation } = result;

    const data = [
        { name: 'Risk', value: risk_score, fill: risk_level === 'LOW' ? '#10b981' : risk_level === 'MEDIUM' ? '#f59e0b' : '#ef4444' }
    ];

    const getStatusIcon = () => {
        switch (risk_level) {
            case 'LOW': return <CheckCircle2 className="text-green-500 w-12 h-12" />;
            case 'MEDIUM': return <AlertTriangle className="text-yellow-500 w-12 h-12" />;
            case 'HIGH': return <AlertCircle className="text-red-500 w-12 h-12" />;
            default: return null;
        }
    };

    const getStatusColorClass = () => {
        switch (risk_level) {
            case 'LOW': return 'bg-green-100 text-green-800';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
            case 'HIGH': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-full h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="70%"
                        outerRadius="100%"
                        barSize={10}
                        data={data}
                        startAngle={180}
                        endAngle={0}
                    >
                        <PolarAngleAxis
                            type="number"
                            domain={[0, 100]}
                            angleAxisId={0}
                            tick={false}
                        />
                        <RadialBar
                            minAngle={15}
                            background
                            clockWise
                            dataKey="value"
                            cornerRadius={5}
                        />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                    <span className="text-4xl font-bold text-gray-800">{risk_score}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Score</span>
                </div>
            </div>

            <div className="mt-4 text-center">
                <div className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide mb-4 ${getStatusColorClass()}`}>
                    {risk_level} RISK
                </div>

                <div className="flex justify-center mb-4">
                    {getStatusIcon()}
                </div>

                <p className="text-gray-700 font-medium leading-relaxed italic">
                    "{recommendation}"
                </p>
            </div>

            <div className="mt-8 w-full pt-6 border-t border-gray-50 flex justify-between text-xs text-gray-400">
                <span>* Results based on fuzzy logic inference</span>
                <span>Mamdani Method</span>
            </div>
        </div>
    );
};

export default PredictionResult;
