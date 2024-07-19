import mongoose, { Document, Schema } from "mongoose";

interface IInvitation extends Document {
  code: string;
  remainingUses: number;
}

const invitationSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true },
  remainingUses: { type: Number, required: true }
});

export default mongoose.model<IInvitation>("Invitation", invitationSchema);
