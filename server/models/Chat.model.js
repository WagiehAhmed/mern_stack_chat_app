import mongoose from "mongoose";
import i18next from "i18next";

const chatSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, i18next.t("senderIsRequired")],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, i18next.t("receiverIsRequired")],
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Messages",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);
