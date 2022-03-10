export class SchedulerModel {
    _id: string;
    title: string;
    schedule: {};
    repeats :string;
    recurs : object;
    sendtime :string;
    startdatetime :Date;
    enddatetime :Date;
    formid: any;
    filter: object;
    subject: string;
    messagetemplate: any;
    membershipids: any;
    classids: any;
    memberids: any;
    prospectids: any;
    userids: any;

    message: [string];
    to: {};
    cc: {};
    bcc: {};
    property : Object;
    status: string;
    attachment:string;
    
    sentto:  string;  
    senttoall: boolean;
    schemaname: string;  

    senttovalue:boolean;
    senttocontext:string;
    dynamic:any[];
    fromemail:string;

}