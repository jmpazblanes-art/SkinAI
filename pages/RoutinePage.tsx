import React, { useReducer, useEffect, useMemo } from 'react';
import { DailyRoutineStep } from '../types';
import Card from '../components/ui/Card';
import { useAnalysis } from '../context/AnalysisContext';

type RoutineAction =
  | { type: 'SET_ROUTINE'; payload: DailyRoutineStep[] }
  | { type: 'TOGGLE_STEP'; payload: { id: string } };

interface RoutineState {
  steps: DailyRoutineStep[];
}

const routineReducer = (state: RoutineState, action: RoutineAction): RoutineState => {
  switch (action.type) {
    case 'SET_ROUTINE':
      return { ...state, steps: action.payload };
    case 'TOGGLE_STEP':
      return {
        ...state,
        steps: state.steps.map(step =>
          step.id === action.payload.id ? { ...step, completed: !step.completed } : step
        ),
      };
    default:
      return state;
  }
};

const isToday = (someDate: Date) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
           someDate.getMonth() === today.getMonth() &&
           someDate.getFullYear() === today.getFullYear();
}

const isYesterday = (someDate: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return someDate.getDate() === yesterday.getDate() &&
           someDate.getMonth() === yesterday.getMonth() &&
           someDate.getFullYear() === yesterday.getFullYear();
}


const RoutinePage = () => {
  const { getRoutine, latestAnalysis } = useAnalysis();
  const [state, dispatch] = useReducer(routineReducer, { steps: [] });
  const [streak, setStreak] = React.useState(0);

  useEffect(() => {
    const initialRoutine = getRoutine();
    const storedCompletion = JSON.parse(localStorage.getItem('routineCompletion') || '{}');

    // Only restore completion status if the routine hasn't changed
    const storedRoutineSignature = storedCompletion.routineSignature;
    const currentRoutineSignature = initialRoutine.map(s => s.id).join(',');

    if (isToday(new Date(storedCompletion.date)) && storedRoutineSignature === currentRoutineSignature) {
      const restoredRoutine = initialRoutine.map(step => ({
        ...step,
        completed: storedCompletion.completedSteps.includes(step.id)
      }));
      dispatch({ type: 'SET_ROUTINE', payload: restoredRoutine });
    } else {
        dispatch({ type: 'SET_ROUTINE', payload: initialRoutine });
        localStorage.removeItem('routineCompletion');
    }
    
    // Streak logic
    const streakData = JSON.parse(localStorage.getItem('streakData') || '{"count": 0, "lastCompleted": null}');
    if (streakData.lastCompleted && !isYesterday(new Date(streakData.lastCompleted)) && !isToday(new Date(streakData.lastCompleted))) {
      // Streak is broken
      setStreak(0);
      localStorage.setItem('streakData', JSON.stringify({ count: 0, lastCompleted: null }));
    } else {
      setStreak(streakData.count);
    }
  }, [getRoutine, latestAnalysis]);


  const allStepsCompleted = useMemo(() => state.steps.length > 0 && state.steps.every(step => step.completed), [state.steps]);

  useEffect(() => {
    if (state.steps.length === 0) return;

    const completedStepIds = state.steps.filter(s => s.completed).map(s => s.id);
    const routineSignature = state.steps.map(s => s.id).join(',');
    const completionState = {
        date: new Date().toISOString(),
        completedSteps: completedStepIds,
        routineSignature, // Store a signature of the current routine
    };
    localStorage.setItem('routineCompletion', JSON.stringify(completionState));

    if (allStepsCompleted) {
      const streakData = JSON.parse(localStorage.getItem('streakData') || '{"count": 0, "lastCompleted": null}');
      const lastCompletedDate = streakData.lastCompleted ? new Date(streakData.lastCompleted) : null;

      if (!lastCompletedDate || !isToday(lastCompletedDate)) {
        let newStreak = 1;
        if(lastCompletedDate && isYesterday(lastCompletedDate)) {
            newStreak = streakData.count + 1;
        }
        setStreak(newStreak);
        localStorage.setItem('streakData', JSON.stringify({ count: newStreak, lastCompleted: new Date().toISOString() }));
      }
    }
  }, [state.steps, allStepsCompleted]);

  const handleToggleStep = (id: string) => {
    dispatch({ type: 'TOGGLE_STEP', payload: { id } });
  };
  
  const morningRoutine = state.steps.filter(step => step.time === 'morning');
  const eveningRoutine = state.steps.filter(step => step.time === 'evening');

  const RoutineList: React.FC<{ title: string; steps: DailyRoutineStep[] }> = ({ title, steps }) => (
    <Card className="flex-1">
      <h2 className="text-xl font-bold mb-4 flex items-center text-base-content">
        <i className={title === 'Mañana' ? 'iconoir-sun-light mr-2 text-yellow-500' : 'iconoir-moon-sat mr-2 text-indigo-500'}></i>
        {title}
      </h2>
      {steps.length > 0 ? (
        <ul className="space-y-4">
        {steps.map(step => (
          <li key={step.id} className="flex items-center">
            <input
              type="checkbox"
              id={step.id}
              checked={step.completed}
              onChange={() => handleToggleStep(step.id)}
              className="h-6 w-6 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor={step.id} className={`ml-3 flex-1 cursor-pointer ${step.completed ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-base-content'}`}>
              <span className="font-semibold">{step.productType}:</span> {step.instructions}
            </label>
          </li>
        ))}
      </ul>
      ) : (
        <p className="text-gray-500">No hay pasos para la rutina de {title.toLowerCase()}.</p>
      )}
    </Card>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-base-content mb-2">Tu Rutina Diaria Personalizada</h1>
          <p className="text-gray-600 dark:text-gray-400">Esta rutina ha sido generada por la IA basándose en tu último análisis de piel.</p>
        </div>
        {streak > 0 && (
            <div className="flex items-center space-x-2 mt-4 sm:mt-0 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-300 font-semibold px-4 py-2 rounded-lg">
                <span className="text-2xl">🔥</span>
                <span>Racha de {streak} día{streak > 1 ? 's' : ''}</span>
            </div>
        )}
      </div>

      
      {state.steps.length > 0 ? (
         <div className="flex flex-col md:flex-row gap-6">
            <RoutineList title="Mañana" steps={morningRoutine} />
            <RoutineList title="Noche" steps={eveningRoutine} />
        </div>
      ) : (
          <Card>
              <div className="text-center py-12 text-gray-500">
                  <i className="iconoir-calendar-plus text-4xl mb-3"></i>
                  <p className="font-semibold mb-2">Aún no se ha generado una rutina.</p>
                  <p>Realiza un análisis en la página principal para comenzar.</p>
              </div>
          </Card>
      )}
    </div>
  );
};

export default RoutinePage;