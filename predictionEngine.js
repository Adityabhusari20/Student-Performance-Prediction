/**
 * Calculates predicted student performance score, grade, and risk level
 * based on study hours, attendance percentage, assignment completion, and practice tests.
 */
function calculatePrediction(studyHours, attendancePct, assignmentPct, practiceTests) {
  const study = Math.max(0, Number(studyHours) || 0);
  const attendance = Math.max(0, Math.min(100, Number(attendancePct) || 0));
  const assignment = Math.max(0, Math.min(100, Number(assignmentPct) || 0));
  const tests = Math.max(0, Number(practiceTests) || 0);

  // Model Intercept & Weights derived from historical training data
  const baseIntercept = 15.0;
  const wStudy = 2.5;
  const wAttendance = 0.30;
  const wAssignment = 0.25;
  const wTests = 1.5;

  const rawScore = baseIntercept + 
    (study * wStudy) + 
    (attendance * wAttendance) + 
    (assignment * wAssignment) + 
    (tests * wTests);

  const predictedScore = Math.min(100, Math.max(0, Math.round(rawScore * 10) / 10));

  // Grade Mapping
  let grade = 'F';
  if (predictedScore >= 90) grade = 'A+';
  else if (predictedScore >= 85) grade = 'A';
  else if (predictedScore >= 78) grade = 'B+';
  else if (predictedScore >= 70) grade = 'B';
  else if (predictedScore >= 60) grade = 'C';
  else if (predictedScore >= 50) grade = 'D';

  // Risk Classification
  let riskLevel = 'Low Risk';
  if (predictedScore < 60 || attendance < 75) {
    riskLevel = 'High Risk';
  } else if (predictedScore < 72 || attendance < 82) {
    riskLevel = 'Medium Risk';
  }

  return { predictedScore, grade, riskLevel };
}

/**
 * Calculates required study adjustments to bridge the score gap to a user's target score.
 */
function calculateGoalRequirements(currentMetrics = {}, targetScore = 85) {
  const studyHours = Number(currentMetrics?.study_hours ?? currentMetrics?.studyHours ?? 5.2);
  const attendancePct = Number(currentMetrics?.attendance_pct ?? currentMetrics?.attendance ?? 87.0);
  const assignmentPct = Number(currentMetrics?.assignment_pct ?? currentMetrics?.assignmentCompletion ?? 80.0);
  const practiceTests = Number(currentMetrics?.practice_tests ?? currentMetrics?.practiceTests ?? 2);

  const target = Number(targetScore) || 85;
  const currentPred = calculatePrediction(studyHours, attendancePct, assignmentPct, practiceTests).predictedScore;
  const scoreGap = target - currentPred;

  if (scoreGap <= 0) {
    return { 
      achievable: true, 
      message: 'Target score is already met or exceeded under your current routine!' 
    };
  }

  const additionalStudyHours = Math.round((scoreGap / 2.5) * 10) / 10;
  const neededTests = Math.ceil(scoreGap / 1.5);

  return {
    achievable: target <= 98,
    requiredStudyHours: Math.min(12, Math.round((studyHours + additionalStudyHours) * 10) / 10),
    additionalHoursNeeded: additionalStudyHours,
    suggestedTestsPerWeek: Math.min(10, practiceTests + neededTests),
    requiredAttendancePct: Math.min(100, Math.max(attendancePct, 90))
  };
}

module.exports = { calculatePrediction, calculateGoalRequirements };