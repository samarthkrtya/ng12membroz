export class FormfieldModel {
    id: string;
    _id: string;
    src: string;
    name: string;
    sectionname: string;
    sectiondisplayname: string;
    formname: string;
    formid: string;
    fieldtype: string;
    min: number;
    max: number;
    maxlength: number;
    multiselect: boolean;
    displayname: string;
    fieldname: string;
    required: boolean;
    colspan: string;
    defaultvalue: string;
    formorder: number;
    lookupdata: any[];
    lookupfieldid: string;
    form: Object;
    disabled: boolean;
    fields: any[];
    status: string;
    checklist: boolean;
}
