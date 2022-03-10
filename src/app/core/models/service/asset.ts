export class AssetModel {
    _id: string;
    title: string;
    quantity : number;
    unitdetail: any[];
    category: string;
    bookingtype: string;
    duration: number;
    charges: number;
    advancecharges: any[];
    availability: object;
    advanceavailability: any[];
    breaktime: any[];
    gallery: any[];
    property: object;
    branchid: string;
    status: string;
}