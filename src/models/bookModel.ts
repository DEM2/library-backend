import { model, Schema } from "mongoose";
import { type } from "os";

type bookType ={
    id: string,
    title: string,
    author: string,
    categorie: string,
    ISBN: string,
    publication_date: Date,
    state: string,
}

const bookScchema = new Schema<bookType>({
    id: {type: String, required: true},
    title: {type: String, required: true},
    author: {type: String, required: true},
    categorie: {type: String, required: true},
    ISBN: {type: String},
    publication_date: {type: Date},
    state: {type: String, required: true},
})


const BookModel = model<bookType>("Book", bookScchema)

export { BookModel, bookScchema, bookType } 