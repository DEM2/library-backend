import { model, Schema } from "mongoose";
import { type } from "os";

type bookType ={
    title: string,
    author: string,
    category : [string],
    ISBN: string,
    publicationYear: Number,
    publisher: string,
    availability: string,
}

const bookScchema = new Schema<bookType>({
    title: {type: String, required: true},
    author: {type: String, required: true},
    category : {type: [String], required: true},
    ISBN: {type: String, unique: true, required: true},
    publicationYear: {type: Number, required: true},
    publisher: {type: String, required: true},
    availability: {type: String, required: true},
})


const BookModel = model<bookType>("Book", bookScchema)

export { BookModel, bookScchema, bookType } 