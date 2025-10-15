
export const getProblemIcon = (issue: string): string => {
    const lowerIssue = issue.toLowerCase();
    if (lowerIssue.includes('acné') || lowerIssue.includes('puntos negros') || lowerIssue.includes('espinillas')) return 'iconoir-head-acne';
    if (lowerIssue.includes('arrugas') || lowerIssue.includes('líneas finas')) return 'iconoir-wrinkle';
    if (lowerIssue.includes('enrojecimiento') || lowerIssue.includes('irritación')) return 'iconoir-droplet-half-2';
    if (lowerIssue.includes('manchas') || lowerIssue.includes('hiperpigmentación')) return 'iconoir-ev-spot';
    if (lowerIssue.includes('grasa') || lowerIssue.includes('brillo') || lowerIssue.includes('oleosidad')) return 'iconoir-brightness';
    if (lowerIssue.includes('sequedad') || lowerIssue.includes('resequedad') || lowerIssue.includes('deshidratación')) return 'iconoir-sea-waves';
    if (lowerIssue.includes('sensibilidad')) return 'iconoir-feather';
    if (lowerIssue.includes('poros')) return 'iconoir-view-grid';
    if (lowerIssue.includes('tono desigual')) return 'iconoir-color-filter';
    return 'iconoir-health-shield'; // Default icon for any other issue
};
