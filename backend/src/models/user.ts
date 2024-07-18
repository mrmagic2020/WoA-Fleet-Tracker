import mongoose, { Schema, Document } from "mongoose";
import { UserRole } from "@mrmagic2020/shared/dist/enums";

interface IUser extends Document {
  username: string;
  password: string;
  role: UserRole;
}

const userSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), required: true }
});

export default mongoose.model<IUser>("User", userSchema);
