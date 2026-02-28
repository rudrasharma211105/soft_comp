import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { X, BrainCircuit } from 'lucide-react';

const trapmf = (x, [a, b, c, d]) => {
    const left = (a === b) ? (x >= a ? 1 : 0) : ((x - a) / (b - a));
    const right = (c === d) ? (x <= c ? 1 : 0) : ((d - x) / (d - c));
    return Math.max(Math.min(left, 1, right), 0);
};

const trimf = (x, [a, b, c]) => {
    const left = (a === b) ? (x >= a ? 1 : 0) : ((x - a) / (b - a));
    const right = (b === c) ? (x <= c ? 1 : 0) : ((c - x) / (c - b));
    return Math.max(Math.min(left, right), 0);
};

const getFuzzyMemberships = (record) => {
    return [
        {
            category: 'BMI',
            value: record.bmi,
            data: [
                { name: 'Underweight', val: trapmf(record.bmi, [10, 10, 15, 18]) },
                { name: 'Normal', val: trimf(record.bmi, [18, 22, 25]) },
                { name: 'Overweight', val: trimf(record.bmi, [25, 27, 30]) },
                { name: 'Obese', val: trapmf(record.bmi, [30, 35, 40, 40]) }
            ]
        },
        {
            category: 'Heart Rate',
            value: record.heart_rate,
            data: [
                { name: 'Low', val: trapmf(record.heart_rate, [40, 40, 50, 60]) },
                { name: 'Normal', val: trimf(record.heart_rate, [60, 80, 100]) },
                { name: 'High', val: trimf(record.heart_rate, [100, 120, 140]) },
                { name: 'Dangerous', val: trapmf(record.heart_rate, [140, 160, 180, 180]) }
            ]
        },
        {
            category: 'Sleep Hours',
            value: record.sleep_hours,
            data: [
                { name: 'Poor', val: trapmf(record.sleep_hours, [0, 0, 2, 4]) },
                { name: 'Moderate', val: trimf(record.sleep_hours, [4, 5, 6]) },
                { name: 'Good', val: trimf(record.sleep_hours, [6, 7, 8]) },
                { name: 'Excellent', val: trapmf(record.sleep_hours, [8, 10, 12, 12]) }
            ]
        },
        {
            category: 'Exercise Level',
            value: record.exercise_level,
            data: [
                { name: 'None', val: trimf(record.exercise_level, [0, 0, 0.5]) },
                { name: 'Low', val: trimf(record.exercise_level, [0.5, 1.5, 2.5]) },
                { name: 'Medium', val: trimf(record.exercise_level, [2.5, 4, 5.5]) },
                { name: 'High', val: trapmf(record.exercise_level, [5.5, 6.5, 7, 7]) }
            ]
        }
    ];
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-2 border shadow-sm rounded-md text-xs">
                <p className="font-bold">{payload[0].payload.name}</p>
                <p>Membership: {(payload[0].value * 100).toFixed(1)}%</p>
            </div>
        );
    }
    return null;
};

const FuzzyVisualizer = ({ record, onClose }) => {
    if (!record) return null;

    const fuzzyData = getFuzzyMemberships(record);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                    <div className="flex items-center text-blue-800">
                        <BrainCircuit className="mr-2" />
                        <h2 className="text-xl font-bold">Fuzzy Logic Visualization</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-600 mb-6">
                        This visualization breaks down how the Mamdani Inference Engine interpreted your raw inputs into fuzzy linguistic sets.
                        A value of 1.0 (100%) means full membership in that category.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {fuzzyData.map((chart, idx) => (
                            <div key={idx} className="bg-gray-50 p-4 border rounded-xl">
                                <h3 className="font-bold text-gray-700 mb-1 flex justify-between">
                                    <span>{chart.category}</span>
                                    <span className="text-blue-600 font-black">{chart.value}</span>
                                </h3>
                                <div className="h-48 mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={chart.data}
                                            margin={{ top: 5, right: 5, bottom: 20, left: -20 }}
                                        >
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                                interval={0}
                                                angle={-25}
                                                textAnchor="end"
                                                height={50}
                                            />
                                            <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                                                {chart.data.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.val > 0.5 ? '#2563eb' : (entry.val > 0 ? '#60a5fa' : '#e5e7eb')} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 bg-blue-50 border border-blue-100 p-6 rounded-xl">
                        <h3 className="font-bold text-blue-900 mb-2">Defuzzification Result</h3>
                        <div className="flex justify-between items-center">
                            <span className="text-blue-800">Computed Fuzzy Risk Score:</span>
                            <span className="text-2xl font-black text-blue-700">{record.risk_score}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FuzzyVisualizer;
