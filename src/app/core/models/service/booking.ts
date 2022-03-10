export class BookingModel {
    _id: string;
    prefix: string;
    bookingnumber: number;
    totalrooms: number;
    customerid: string;
    onModel: string;
    bookingdate: Date;
    checkin: Date;
    checkout: Date;
    locationid: string;
    resortid: string;
    bookingdetail: object;
    confirmationdetail: object;
    reservation: string;
    guest: string;
    charges : number;
    property : Object;
    status: string;
}