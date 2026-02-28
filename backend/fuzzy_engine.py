import numpy as np
import skfuzzy as fuzzy
from skfuzzy import control as ctrl

def get_health_prediction(bmi_val, hr_val, sleep_val, exercise_val):
    # Antecedents (Inputs)
    bmi = ctrl.Antecedent(np.arange(10, 41, 1), 'bmi')
    heart_rate = ctrl.Antecedent(np.arange(40, 181, 1), 'heart_rate')
    sleep_hours = ctrl.Antecedent(np.arange(0, 13, 1), 'sleep_hours')
    exercise_level = ctrl.Antecedent(np.arange(0, 8, 1), 'exercise_level')

    # Consequent (Output)
    health_risk = ctrl.Consequent(np.arange(0, 101, 1), 'health_risk')

    # BMI Membership Functions
    bmi['underweight'] = fuzzy.trapmf(bmi.universe, [10, 10, 15, 18])
    bmi['normal'] = fuzzy.trimf(bmi.universe, [18, 22, 25])
    bmi['overweight'] = fuzzy.trimf(bmi.universe, [25, 27, 30])
    bmi['obese'] = fuzzy.trapmf(bmi.universe, [30, 35, 40, 40])

    # Heart Rate Membership Functions
    heart_rate['low'] = fuzzy.trapmf(heart_rate.universe, [40, 40, 50, 60])
    heart_rate['normal'] = fuzzy.trimf(heart_rate.universe, [60, 80, 100])
    heart_rate['high'] = fuzzy.trimf(heart_rate.universe, [100, 120, 140])
    heart_rate['dangerous'] = fuzzy.trapmf(heart_rate.universe, [140, 160, 180, 180])

    # Sleep Hours Membership Functions
    sleep_hours['poor'] = fuzzy.trapmf(sleep_hours.universe, [0, 0, 2, 4])
    sleep_hours['moderate'] = fuzzy.trimf(sleep_hours.universe, [4, 5, 6])
    sleep_hours['good'] = fuzzy.trimf(sleep_hours.universe, [6, 7, 8])
    sleep_hours['excellent'] = fuzzy.trapmf(sleep_hours.universe, [8, 10, 12, 12])

    # Exercise Level Membership Functions
    exercise_level['none'] = fuzzy.trimf(exercise_level.universe, [0, 0, 0.5])
    exercise_level['low'] = fuzzy.trimf(exercise_level.universe, [0.5, 1.5, 2.5])
    exercise_level['medium'] = fuzzy.trimf(exercise_level.universe, [2.5, 4, 5.5])
    exercise_level['high'] = fuzzy.trapmf(exercise_level.universe, [5.5, 6.5, 7, 7])

    # Health Risk Membership Functions
    health_risk['low'] = fuzzy.trapmf(health_risk.universe, [0, 0, 20, 33])
    health_risk['medium'] = fuzzy.trimf(health_risk.universe, [33, 50, 66])
    health_risk['high'] = fuzzy.trapmf(health_risk.universe, [66, 80, 100, 100])

    # Fuzzy Rules (20 rules)
    rules = [
        ctrl.Rule(bmi['obese'] & heart_rate['dangerous'] & sleep_hours['poor'], health_risk['high']),
        ctrl.Rule(bmi['normal'] & heart_rate['normal'] & sleep_hours['good'] & exercise_level['high'], health_risk['low']),
        ctrl.Rule(bmi['underweight'] & heart_rate['low'] & sleep_hours['poor'], health_risk['medium']),
        ctrl.Rule(bmi['overweight'] & heart_rate['high'] & exercise_level['none'], health_risk['high']),
        ctrl.Rule(bmi['obese'] & sleep_hours['poor'], health_risk['high']),
        ctrl.Rule(heart_rate['dangerous'] | bmi['obese'], health_risk['high']),
        ctrl.Rule(sleep_hours['excellent'] & exercise_level['high'] & heart_rate['normal'], health_risk['low']),
        ctrl.Rule(bmi['normal'] & exercise_level['medium'], health_risk['low']),
        ctrl.Rule(bmi['overweight'] & heart_rate['normal'], health_risk['medium']),
        ctrl.Rule(sleep_hours['moderate'] & exercise_level['low'], health_risk['medium']),
        ctrl.Rule(bmi['obese'] & heart_rate['high'], health_risk['high']),
        ctrl.Rule(heart_rate['normal'] & sleep_hours['good'] & exercise_level['medium'], health_risk['low']),
        ctrl.Rule(bmi['underweight'] & exercise_level['none'], health_risk['medium']),
        ctrl.Rule(heart_rate['high'] & sleep_hours['poor'], health_risk['high']),
        ctrl.Rule(bmi['normal'] & heart_rate['low'] & sleep_hours['excellent'], health_risk['low']),
        ctrl.Rule(bmi['overweight'] & sleep_hours['moderate'], health_risk['medium']),
        ctrl.Rule(exercise_level['none'] & sleep_hours['poor'], health_risk['high']),
        ctrl.Rule(bmi['normal'] & heart_rate['normal'] & sleep_hours['moderate'], health_risk['low']),
        ctrl.Rule(bmi['obese'] & exercise_level['low'], health_risk['high']),
        ctrl.Rule(heart_rate['dangerous'] & exercise_level['none'], health_risk['high'])
    ]

    # Control System
    risk_ctrl = ctrl.ControlSystem(rules)
    risk_sim = ctrl.ControlSystemSimulation(risk_ctrl)

    # Inputs
    risk_sim.input['bmi'] = bmi_val
    risk_sim.input['heart_rate'] = hr_val
    risk_sim.input['sleep_hours'] = sleep_val
    risk_sim.input['exercise_level'] = exercise_val

    # Computation
    try:
        risk_sim.compute()
        risk_score = risk_sim.output['health_risk']
    except Exception:
        # Fallback if no fuzzy rules match the specific input combination or gaps exist
        print(f"Warning: No fuzzy rules matched for inputs (BMI:{bmi_val}, HR:{hr_val}, Sleep:{sleep_val}, Exercise:{exercise_val}). Using fallback.")
        base = 30
        if bmi_val > 25: base += 15
        if hr_val > 100 or hr_val < 60: base += 15
        if sleep_val < 6: base += 15
        if exercise_val < 3: base += 15
        risk_score = float(min(100, base))
    
    if risk_score <= 33:
        risk_level = "LOW"
        recommendation = "You're in good health! Maintain your current lifestyle."
    elif risk_score <= 66:
        risk_level = "MEDIUM"
        recommendation = "Moderate risk detected. Consider improving your exercise routine and sleep quality."
    else:
        risk_level = "HIGH"
        recommendation = "High risk detected! Please consult a health professional, improve your diet, and exercise regularly."

    return {
        "risk_score": round(risk_score, 2),
        "risk_level": risk_level,
        "recommendation": recommendation
    }
