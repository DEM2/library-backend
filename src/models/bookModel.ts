import { model, Schema } from "mongoose";
import { type } from "os";

type bookType ={
    title: string,
    author: string,
    categorie: string,
    ISBN: string,
    publication_date: Date,
    state: string,
}

const bookScchema = new Schema<bookType>({
    title: {type: String, required: true},
    author: {type: String, required: true},
    categorie: {type: String, required: true},
    ISBN: {type: String, unique: true},
    publication_date: {type: Date},
    state: {type: String, required: true},
})


const BookModel = model<bookType>("Book", bookScchema)

export { BookModel, bookScchema, bookType } 