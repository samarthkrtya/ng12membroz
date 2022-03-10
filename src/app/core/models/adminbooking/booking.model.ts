export class BookingModel {
    _id: string;
    memberid: string;
    membershipid: string;
    onModel: string;
    guestname: string;
    reservationtype: string;
    bookingdate: Date;
    checkin: Date;
    checkout: Date;
    resortid: string;
    locationid: string;
    location: string;
    totalrooms: number;
    cancellationdate: Date;
    cancellationnotes: String;
    property: object;
    status: string;
    bookingcost: Number;  
    costperroom: Number;  
    fullname: string;
    resortname: string;
    eligiblenights: number;
    usednights: number;
    membernumber: number;
    membershipname: string;
    joiningdate: Date;
    nights: number;
    totalroomnights: number;
    vourchernights: number;
    totalvouchernights: number;
    effectivenights: number;
    vendor: string;
    bookingnotes: string;
    signby: string;
    checkinseason: string;
    checkoutseason: string;
    membershipseason: string;
    occupants: any[];
    consumednights: object;
    advancenights: number;

    roomtype: string;
    totaladults: number;

    noofpersons: number;
    noofadults: number;
    noofchild: number;

    totalchildrens: number;
    meals: string;
    foodandservice: string;
    note: string;
    hotelconfirmationcode: string;
    vendorid: string;
    reservationdate: Date;
    attachmenturl: string;
    tmpattachmenturl: string;
    attachmenturleligible: string;
    tmpeligibleattachmenturl: string;
    addedby: string;
    bookedbyname: string;
}

export class occupantModel {
    totalRoom: number;
    adults: number;
    childrens: number;
    extrabed: number;
    extracost: number;
    isAdd: boolean;
    
}