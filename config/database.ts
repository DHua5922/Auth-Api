import { Mongoose } from "js-ts-kit";
import mongoosePkg from "mongoose";

const mongoose = new Mongoose(process.env.MONGO_URI || "", mongoosePkg);

export default mongoose;
