export class BillItemModel {
    _id: string;
    itemname: string;
    category: string
    categoryid: string
    barcode: string;
    unit: string;
    enableinventory: Boolean = false;
    sale: object;
    purchase: object;
    rent: object;
    imagegallery: any[];
    property: object;
    branchid: string;
    status: string;
}
