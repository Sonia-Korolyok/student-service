import * as repo from "../repository/studentRepository.js";

export const addStudent = (req, res) => {
    const success = repo.addStudent(req.body);
    if (success) {
        res.status(204).send();
    }else {
        res.status(409).send();
    }
}

export const findStudent = (req, res) => {
    const student = repo.findStudent(+req.params.id);
    if (student) {
        const {password, ...studentWithoutPassword} = student
        res.json(studentWithoutPassword); // res.status(200).send(student);
    }else {
        res.status(404).send();
    }
}

export const deleteStudent = (req, res) => {
    //todo delete student
}

export const updateStudent = (req, res) => {
    //todo update student name or password
}

export const addScore = (req, res) => {
    //todo add score to student
}
export const findByName = (req, res) => {
    //todo find students by name
}
export const countByNames = (req, res) => {
    //todo count students by names
}
export const findByMinScore = (req, res) => {
    //todo find students by score
}