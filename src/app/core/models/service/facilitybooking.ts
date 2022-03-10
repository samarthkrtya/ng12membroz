export class FacilityBookingModel {
    _id: string;
    prefix: string;
    bookingnumber: number;
    totalrooms: number;
    charges: number;
    cost: number;
    customerid: string;
    refid: string;
    onModel: string;
    bookingdate: any;
    checkin: Date;
    checkout: Date;
    timeslot: object;
    //locationid: string;
    //resortid: string;
    bookingdetail: object;
    confirmationdetail: object;
    reservation: string;
    guest: string;
    status: string;
    property : object;
}
