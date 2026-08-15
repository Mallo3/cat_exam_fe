export function parseLooseJSON(input) {
  // Mock MongoDB shell types so they parse correctly
  const ObjectId = (id) => id;
  const NumberInt = (num) => parseInt(num, 10);
  const NumberLong = (num) => parseInt(num, 10);
  const NumberDecimal = (num) => parseFloat(num);
  const ISODate = (d) => new Date(d).toISOString();
  
  try {
    // This allows unquoted keys, single quotes, and Mongo types
    const parse = new Function('ObjectId', 'NumberInt', 'NumberLong', 'NumberDecimal', 'ISODate', `return ${input};`);
    return parse(ObjectId, NumberInt, NumberLong, NumberDecimal, ISODate);
  } catch (err) {
    throw new Error('Syntax error in payload: ' + err.message);
  }
}

export function validateExamJSON(jsonString) {
  let exam;
  try {
    exam = parseLooseJSON(jsonString);
    // Strip _id so MongoDB can auto-generate a fresh one
    if (exam && exam._id) {
      delete exam._id;
    }
  } catch (err) {
    return { isValid: false, errors: ['Invalid format: ' + err.message] };
  }

  const errors = [];

  if (!exam || typeof exam !== 'object') {
    return { isValid: false, errors: ['Root must be an object'] };
  }

  if (!exam.examId || typeof exam.examId !== 'string') errors.push('Root: missing or invalid "examId"');
  if (!exam.title || typeof exam.title !== 'string') errors.push('Root: missing or invalid "title"');
  
  if (!Array.isArray(exam.sections)) {
    errors.push('Root: "sections" must be an array');
    return { isValid: false, errors }; // Cannot proceed without sections array
  }

  if (exam.sections.length === 0) {
    errors.push('Root: "sections" cannot be empty');
  }

  exam.sections.forEach((sec, sIndex) => {
    const sPath = `sections[${sIndex}]`;
    if (!sec || typeof sec !== 'object') {
      errors.push(`${sPath}: must be an object`);
      return;
    }
    
    if (!sec.sectionId || typeof sec.sectionId !== 'string') errors.push(`${sPath}: missing or invalid "sectionId"`);
    if (!sec.title || typeof sec.title !== 'string') errors.push(`${sPath}: missing or invalid "title"`);
    if (typeof sec.durationSeconds !== 'number') errors.push(`${sPath}: missing or invalid "durationSeconds" (must be number)`);
    
    if (!Array.isArray(sec.questionGroups)) {
      errors.push(`${sPath}: "questionGroups" must be an array`);
      return;
    }

    sec.questionGroups.forEach((group, gIndex) => {
      const gPath = `${sPath}.questionGroups[${gIndex}]`;
      if (!group || typeof group !== 'object') {
        errors.push(`${gPath}: must be an object`);
        return;
      }
      
      if (group.sharedContext !== null && typeof group.sharedContext !== 'string') {
        errors.push(`${gPath}: "sharedContext" must be a string or null`);
      }

      if (!Array.isArray(group.questions)) {
        errors.push(`${gPath}: "questions" must be an array`);
        return;
      }

      if (group.questions.length === 0) {
        errors.push(`${gPath}: "questions" array cannot be empty`);
      }

      group.questions.forEach((q, qIndex) => {
        const qPath = `${gPath}.questions[${qIndex}]`;
        if (!q || typeof q !== 'object') {
          errors.push(`${qPath}: must be an object`);
          return;
        }

        if (!q.questionId || typeof q.questionId !== 'string') errors.push(`${qPath}: missing or invalid "questionId"`);
        if (typeof q.questionNumber !== 'number') errors.push(`${qPath}: missing or invalid "questionNumber" (must be number)`);
        
        if (q.type !== 'MCQ' && q.type !== 'TITA') {
          errors.push(`${qPath}: "type" must be exactly "MCQ" or "TITA"`);
        }

        if (typeof q.positiveMarks !== 'number') errors.push(`${qPath}: missing or invalid "positiveMarks" (must be number)`);
        if (typeof q.negativeMarks !== 'number') errors.push(`${qPath}: missing or invalid "negativeMarks" (must be number)`);
        if (!q.questionText || typeof q.questionText !== 'string') errors.push(`${qPath}: missing or invalid "questionText"`);
        if (!q.correctAnswer || typeof q.correctAnswer !== 'string') errors.push(`${qPath}: missing or invalid "correctAnswer"`);

        if (q.type === 'MCQ') {
          if (!Array.isArray(q.options)) {
            errors.push(`${qPath}: MCQ questions must have an "options" array`);
          } else if (q.options.length < 2) {
            errors.push(`${qPath}: "options" array must have at least 2 items`);
          } else {
            q.options.forEach((opt, oIndex) => {
              const oPath = `${qPath}.options[${oIndex}]`;
              if (!opt || typeof opt !== 'object') {
                errors.push(`${oPath}: must be an object`);
                return;
              }
              if (!opt.id || typeof opt.id !== 'string') errors.push(`${oPath}: missing or invalid "id"`);
              if (!opt.text || typeof opt.text !== 'string') errors.push(`${oPath}: missing or invalid "text"`);
            });
            
            // Validate correctAnswer matches one of the option ids
            if (!q.options.some(opt => opt.id === q.correctAnswer)) {
              errors.push(`${qPath}: "correctAnswer" ("${q.correctAnswer}") does not match any option id`);
            }
          }
        }
      });
    });
  });

  return { isValid: errors.length === 0, errors, parsedExam: exam };
}
