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
        res.json(studentWithoutPassword);
    }else {
        res.status(404).send();
    }
}

export const deleteStudent = (req, res) => {
    const success = repo.deleteStudent(+req.params.id);
    if (success) {
        res.status(204).send("Student deleted");
    }else {
        res.status(404).send("Student not found");
    }
}

export const updateStudent = (req, res) => {
    const id = Number(req.params.id);
    const { password } = req.body; //const password = req.body.password;
    if (!password) {
        return res.status(400).send({ error: "No password provided" });
    }
    const success = repo.updateStudent(id, {password});
    if (!success) {
        return res.status(404).send({ error: "Student not found" });
    }
    const student = repo.findStudent(id);
    if (student) {
        const { password, ...studentWithoutPassword } = student;
        return res.status(200).json(studentWithoutPassword);
    }
    res.status(200).send();
}
export const addScore = (req, res) => {
    const id = Number(req.params.id);
    const { examName, score } = req.body;
    const success = repo.addScore(id, { examName, score });
    if (!success) {
        return res.status(404).send({ error: "Student not found" });
    }
    const student = repo.findStudent(id);
    const { password, ...studentWithoutPassword } = student;
    res.status(200).json(studentWithoutPassword);
};

export const findByName = (req, res) => {
    const name = req.params.name;
    const students = repo.findByName(name);
    if (students.length === 0) {
        return res.status(404).send({ error: "No students found" });
    }
    const studentsWithoutPassword = students.map(({password, ...rest}) => rest);
    res.status(200).json(studentsWithoutPassword);
};
export const countByNames = (req, res) => {
    const counts = repo.countByNames();
    res.status(200).json(counts);
};
export const findByMinScore = (req, res) => {
    const minScore = Number(req.params.minScore);
    if (isNaN(minScore)) {
        return res.status(400).send({ error: "minScore query parameter must be a number" });
    }
    const students = repo.findByMinScore(minScore);
    if (students.length === 0) {
        return res.status(404).send({ error: "No students found with required score" });
    }
    const studentsWithoutPassword = students.map(({password, ...rest}) => rest);
    res.status(200).json(studentsWithoutPassword);
}