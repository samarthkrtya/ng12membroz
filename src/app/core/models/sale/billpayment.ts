export class BillPaymentModel {
    _id: string;
    customerid: string;
    onModel: string;
    prefix: string;
    receiptnumber: string;
    paymentdate : Date;
    billid: string;
    paidamount: number;
    payamount: number;
    billamount: number;
    outstandingamount: number;
    walletamount: number;
    couponamount: number;
    receivedby: string;
    sellby: string;
    couponcode : string;

    bill: object;
    property: object;
    branchid: string;
    status: string;

    creditnotes : object;
    gifts : object;
}
