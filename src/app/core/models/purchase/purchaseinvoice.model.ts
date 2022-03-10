export class PurchaseInvoiceModel {
    _id: string;
    pinumber: number;
    vendorid: string;
    invoicedate: Date;
    billingaddress: string;
    items: any[];
    balance: number;
    paidamount: number;
    amount: number;
    taxamount: number;
    taxdetail: any;
    totalamount: number;
    discount: number;
    attachments: any[];
    property: object;
    branch: string;
    status: string;
}