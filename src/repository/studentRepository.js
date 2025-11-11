import {Student} from "../model/students.js";

const students = new Map();

export const addStudent = ({id, name, password}) => {
    if (students.has(id)) {
        return false;
    }
    students.set(+id, new Student(+id, name, password));
    return true;
}

export const findStudent = id => students.get(id);

export const deleteStudent = id => students.delete(id);

export const updateStudent = (id, newData) => {
    const student = students.get(id);
    if (!student) return false;
    if (newData.password) student.password = newData.password;
    students.set(id, student);
    return true;
}
export const addScore = (id, newData) => {
    const student = students.get(id);
    if (!student) return false;
    if (!student.exams) {
        student.exams = {};
    }
    student.exams[newData.examName] = newData.score;
    students.set(id, student);
    return true;
};

export const findByName = (name) => {
    const result = [];
    for (const student of students.values()) {
        if (student.name === name) {
            result.push(student);
        }
    }
    return result;
};
export const countByNames = () => {
    const counts = {};
    for (const student of students.values()) {
        counts[student.name] = (counts[student.name] || 0) + 1;
    }
    return counts;
};
export const findByMinScore = (minScore) => {
    const result = [];
    for (const student of students.values()) {
        if (!student.exams) continue;
        const hasMinScore = Object.values(student.exams).some(score => score >= minScore);
        if (hasMinScore) {
            result.push(student);
        }
    }
    return result;
};