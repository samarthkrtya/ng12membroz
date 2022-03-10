export class BillModel {
    _id: string;
    docnumber: string;
    customerid: string;
    onModel: string;
    joborderid: string;
    type: string;
    items: any[];
    taxes: any[];
    services: any[];
    packages: any[];
    assets: any[];
    tasks: any[];
    billdate: Date;
    duedate: Date;
    amount: number;
    balance: number;
    paidamount : number;
    discount: number;
    taxamount: number;
    taxdetail : {};
    totalamount: number;
    outstandingamount: number;

    property: object;
    branchid: string;
    status: string;
}
