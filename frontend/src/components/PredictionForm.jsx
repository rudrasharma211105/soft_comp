import React from 'react';
import { useForm } from 'react-hook-form';
import { healthService } from '../services/api';
import { Activity, Heart, Moon, Dumbbell } from 'lucide-react';
import toast from 'react-hot-toast';

const PredictionForm = ({ onPredict }) => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            bmi: 22,
            heart_rate: 75,
            sleep_hours: 8,
            exercise_level: 3
        }
    });

    const values = watch();

    const onSubmit = async (data) => {
        try {
            const response = await healthService.predictRisk(data);
            onPredict(response.data);
        } catch (error) {
            console.error('Prediction failed', error);
            toast.error('Failed to get prediction. Please try again.');
        }
    };

    const inputFields = [
        { name: 'bmi', label: 'BMI', icon: Activity, min: 10, max: 40, unit: '' },
        { name: 'heart_rate', label: 'Heart Rate', icon: Heart, min: 40, max: 180, unit: 'bpm' },
        { name: 'sleep_hours', label: 'Sleep Hours', icon: Moon, min: 0, max: 12, unit: 'hrs' },
        { name: 'exercise_level', label: 'Exercise Level', icon: Dumbbell, min: 0, max: 7, unit: 'hrs/wk' },
    ];

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {inputFields.map((field) => (
                    <div key={field.name}>
                        <div className="flex justify-between items-center mb-2">
                            <label className="flex items-center text-sm font-medium text-gray-700">
                                <field.icon className="w-4 h-4 mr-2 text-blue-500" />
                                {field.label}
                            </label>
                            <span className="text-xs font-semibold text-gray-500">
                                {field.min} - {field.max} {field.unit}
                            </span>
                        </div>
                        <input
                            type="range"
                            {...register(field.name, { required: true, min: field.min, max: field.max })}
                            min={field.min}
                            max={field.max}
                            step={field.name === 'exercise_level' || field.name === 'sleep_hours' ? 0.5 : 1}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="mt-1 flex justify-center">
                            <span className="text-lg font-extrabold text-blue-700 bg-blue-50 px-3 py-0.5 rounded-full border border-blue-100">
                                {values[field.name]} <span className="text-xs font-medium text-blue-500 ml-1">{field.unit}</span>
                            </span>
                        </div>
                    </div>
                ))}

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-blue-200"
                >
                    Predict Risk
                </button>
            </form>
        </div>
    );
};

export default PredictionForm;
