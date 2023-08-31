import { Schema, model } from "mongoose";

const RoleSchema = new Schema({
    rol: {
        type: String,
        enum: ['ROLE_USER', 'ROLE_ADMIN']
    }
});

export default model('Role', RoleSchema);