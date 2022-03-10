export class PurchaseOrderModel {
    _id: string;
    ponumber: number;
    vendorid: string;
    billingaddress: string;
    shippingaddress: string;
    orderdate: Date;
    shippingdate: Date;
    receivedate: Date;
    items: any[];
    amount: number;
    taxamount: number;
    taxdetail: any;
    totalamount: number;
    attachments: any[];
    property: object;
    branch: string;
    status: string;
}