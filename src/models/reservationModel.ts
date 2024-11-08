import { model, Schema, Types } from "mongoose";

type reservationType = {
    user: Types.ObjectId,      
    book: Types.ObjectId,       
    reservationDate: Date,     
    deliveryDate?: Date        
};

const ReservationSchema = new Schema<reservationType>({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    reservationDate: { type: Date, required: true, default: Date.now },
    deliveryDate: { type: Date }
});

const ReservationModel = model<reservationType>("Reservation", ReservationSchema);

export { ReservationModel, reservationType };