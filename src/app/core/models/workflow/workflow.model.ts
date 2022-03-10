export class WorkflowModel {
    _id:string;
    title: any;
    formid: any;
    description: string;
    scheduleaction: object;
    trigger: {};

    triggerprocess: string;
    triggerRules: string;
    
    approvers: any;
    reviewers: any;
    criteriaRules:string;
    action: {};  
    criteria: object[];
    criteria_pattern: string;
    status:string;

    subformid : string;
    feedbackformid : string;
    workflowtype: string;


}