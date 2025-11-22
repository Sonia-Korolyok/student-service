import mongoose from "mongoose";


const studentSchema = new mongoose.Schema({
    _id: {type: Number, required: true},
    name: {type: String, required: true},
    password: {type: String, required: true},
    scores: {
        type: Map,
        key: String,
        of: Number,
        default: {}
    }
}, {
        versionKey: false,
        toJSON: {
            transform: (doc, ret) => {
                const id = ret._id.toString();
                delete ret._id;
                return { id, ...ret };
            }
        }
    }
)

const Student = mongoose.model('Student', studentSchema, 'students');
export default Student;