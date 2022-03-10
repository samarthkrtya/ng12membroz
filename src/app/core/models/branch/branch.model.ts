export class BranchModel {
    _id: string;
    branchname: string;
    branchlogo: String;
    billingemail: String;
    currency: string;
    membershipidformat: String;
    startingnumber: String;
    billformat: any;
    supportemail: String;
    supportnumber: number;
    iswalletenable: boolean;
    isqrenable: boolean;
    iswebqrenable: boolean;
    qrcode: string;
    webqrcode: string;
    workinghours: any;
    breaktime : any[];
    vatnumber: String;
    companyphone: String;
    contactperson: String;
    address: String;
    postcode: String;
    city: String;
    state: String;
    country: String;
    timezone: String;
    locale: String;
    walletsetting: object;
    property: object;  
    status: string
}
