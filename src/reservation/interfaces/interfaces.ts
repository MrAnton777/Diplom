import { ID } from "src/types/types";
import { ReservationDocument } from "../schemas/reservation.schema";

export interface ReservationDto {
    userId: ID;
    hotelId: ID;
    roomId: ID;
    dateStart: Date;
    dateEnd: Date;
  }
  
export interface ReservationSearchOptions {
    userId: ID;
    dateStart: Date;
    dateEnd: Date;
}
export interface IReservation {
    addReservation(data: ReservationDto): Promise<ReservationDocument>;
    removeReservation(id: ID): Promise<void>;
    getReservations(
      filter: ReservationSearchOptions
    ): Promise<Array<ReservationDocument>>;
}