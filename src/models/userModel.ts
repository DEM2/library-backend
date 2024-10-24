import { model, Schema } from "mongoose";
import { type } from "os";

type userType = {
    name : string,
    lastName : string,
    email : string,
    password : string,
    register_date : Date,
    role : string,
}

const UserSchema = new Schema<userType>({
   name : {type: String, required: true},
   lastName : {type: String},
   email : {type: String, required: true, unique: true},
   password : {type: String, required: true, unique: true},
   register_date : {type: Date, required: true},
   role : {type: String,}
})

const UserModel = model<userType>("User", UserSchema)

export { UserModel, UserSchema, userType } 