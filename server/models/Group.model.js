import mongoose from "mongoose";
import i18next from "i18next";

const groupSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, i18next.t("groupAdminIsRequired")],
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        default: [],
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Messages",
        default: [],
      },
    ],
    avatar: {
      type: Object,
      default: {
        filePath: "",
        type: "",
      },
    },
    name: {
      type: String,
      default: "",
      required: [true, i18next.t("groupNameIsRequired")],
    },
    rgb: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Groups", groupSchema);
