export class ExpenseModel {
    _id: string;
    expenseaccount: string;
    vendorid: string;
    paidthrough: string; 
    date: Date;
    amount: number;
    attachments: any[];
    property: object;
    status: string;
}