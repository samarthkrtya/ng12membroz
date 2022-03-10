import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CommonService } from 'src/app/core/services/common/common.service';

import { FileSaverService } from "ngx-filesaver";
import swal from 'sweetalert2';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { SubjectsService } from 'src/app/core/services/common/subjects.service';

declare var $: any;
@Component({
    selector: 'app-more-action-btn',
    templateUrl: './more-action-btn.component.html',
})

export class MoreActionBtnComponent extends BaseLiteComponemntComponent implements OnInit, AfterViewInit , OnDestroy {

    @Input('bindId') bindIdValue: any;
    @Input('formObj') formObjValue: any;
    @Input('formname') formnameValue: any;

    @Input('langResource') langResource: any;
    @Input('dataContent') dataContent: any;

    destroy$: Subject<boolean> = new Subject<boolean>();

    documentObj: any = {};
    isLoading: boolean = false;
    status: string = "";

    listUrl : any[] = [];
    communicationList : any[] = [];

    isSendPL : boolean = false;
    isSendFB : boolean = false;
    isRefund : object;
    
    constructor(
        private router: Router,
        private _commonService: CommonService,
        private _FileSaverService: FileSaverService,
        private _subjectsService: SubjectsService,
    ) {
        super();
    }

    async ngOnInit() {
        await super.ngOnInit();
   }


    ngAfterViewInit() {
        
        this.status = this.dataContent.status;
        // this.getById();
        
         

        if (this._loginUserRole && this._loginUserRole.permissions && this._loginUserRole.permissions.length > 0) {
            var foundrecord = this._loginUserRole.permissions.find(p => p.formname == this.formnameValue);
             let customgrid = null, staticgrid = null;
             this.listUrl = [];
            if (foundrecord && this.formObjValue.gridaction && this.formObjValue.gridaction.length > 0) {
                var foundprms = foundrecord.recordpermission.find(p => p.type == 'edit');
                customgrid = {...this.formObjValue.gridaction.find(p => p.type == 'custom' &&  p.action == 'edit')};
                staticgrid = {...this.formObjValue.gridaction.find(p => p.type == 'staticpage' &&  p.action == 'edit')};
                    if (foundprms && staticgrid && staticgrid.actionurl) {
                        this.listUrl.push({ 'url' : staticgrid.actionurl + '/' + this.bindIdValue , 'text' : staticgrid.title ?  staticgrid.title : 'Edit' });
                    }
                    if (foundprms && customgrid && customgrid.actionurl) {
                    var tmpthis = this;
                    var spltArray = [], final;
                    var shortcode_regex = /\[{(\w+)+\.?(\w+)\.?(\w+)\}]/mg;
                    customgrid.actionurl.replace(shortcode_regex, function (match, code) {
                          var replace_str = match.replace('[{', '');
                          replace_str = replace_str.replace('}]', '');
                          spltArray = [],final = null;
                          spltArray = replace_str.split(".");
                          final = spltArray.length == 2 ? tmpthis.dataContent[`${spltArray[0]}`][`${spltArray[1]}`] : tmpthis.dataContent[spltArray[0]];
                          customgrid.actionurl = customgrid.actionurl.replace("$[{" + replace_str + "}]", final);
                        });
                        this.listUrl.push({ 'url' : customgrid.actionurl , 'text' : customgrid.title ?  customgrid.title : 'Custom Edit' });
                }
            }
        }
        
        this.isSendPL = false;
        this.isSendFB = false;
        
        let schema = this.formObjValue.schemaname;
        
        if (schema === "bills"  || schema === "paymentschedules") {
            this.isSendPL = true;
        }
        if (schema === "bills"  || schema === "billpayments" || schema === "purchaseinvoices" || schema === "purchaseinvoicepayments" || schema === "payments" || schema === "paymentschedules") {
            this.isRefund = {};
            if(schema === "bills"){
                if(this.dataContent.status != 'Unpaid'){
                    this.isRefund['refundUrl'] = `/pages/payment-module/creditdebit-note/mode/bill-refund/${this.dataContent.customerid._id}/${this.bindIdValue}`;
                    this.isRefund['refund'] = true;
                    this.isRefund['title'] = "Make Credit Notes";
                }
            }else if(schema === "billpayments"){
               this.isRefund['refundUrl'] = `/pages/payment-module/creditdebit-note/mode/bill-refund/${this.dataContent.customerid._id}/${this.dataContent.billid._id}`;
               this.isRefund['refund'] = true;
               this.isRefund['title'] = "Make Credit Notes";
            }else if(schema === "paymentschedules"){
                if(this.dataContent.status != 'Unpaid'){
                    this.isRefund['refundUrl'] =  `/pages/payment-module/refund/mode/membership-refund/${this.dataContent.memberid._id}/${this.bindIdValue}`;
                    this.isRefund['refund'] = true;
                    this.isRefund['title'] = "Refund";
                }
             }else if(schema === "payments"){
               this.isRefund['refundUrl'] =  `/pages/payment-module/refund/mode/membership-refund/${this.dataContent.memberid._id}/${this.dataContent.item._id}`;
               this.isRefund['refund'] = true;
               this.isRefund['title'] = "Refund";
            }else if(schema === "purchaseinvoices"){
                if(this.dataContent.status != 'Unpaid'){
                    this.isRefund['refundUrl'] = `/pages/payment-module/creditdebit-note/mode/purchase-refund/${this.dataContent.vendorid._id}/${this.bindIdValue}`;
                    this.isRefund['refund'] = true;
                    this.isRefund['title'] = "Make Debit Notes";
                }
            }else if(schema === "purchaseinvoicepayments"){
                this.isRefund['refundUrl'] = `/pages/payment-module/creditdebit-note/mode/purchase-refund/${this.dataContent.vendorid._id}/${this.dataContent.purchasebill._id}`;
                this.isRefund['refund'] = true;
                this.isRefund['title'] = "Make Debit Notes";
            }
        }


        if ((schema === "appointments"  || schema === "facilitybookings" || schema === "bookings") && (this.status == 'checkout' || this.status == 'confirmed')) {
            this.isSendFB = true;
        }



    }

    private getById() {

        var postDate = {
            search: [{ 
                 "searchfield": "_id",
                 "searchvalue": this.bindIdValue,
                 "datatype": "ObjectId",
                "criteria": "eq"}]
        }
        this.isLoading = true; 
        this._commonService
        .commonServiceByUrlMethodData(`${this.formObjValue.schemaname}/filter`, "POST", postDate)
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: any) => {  
                this.documentObj = data;
                this.isLoading = false;
            }, (e) => {
                this.isLoading = false;
            });

    }

    public onClickpdf() {
        if (this.formObjValue && this.formObjValue._id) {
            let printContent = document.getElementById('printid').innerHTML;

            let postData = {
                'formid': this.formObjValue._id,
                'document': printContent,
            }
            this._commonService
                .generatepdf(postData)
                .pipe(takeUntil(this.destroy$))
                .subscribe((data) => {
                    this._FileSaverService.save(data, "downloaded.pdf");
                });
        }
    }


   async onClickRF(){
        let postData = {};
        postData['search'] = [];
        postData['search'].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });
        let ids = [];
        if (this.formObjValue.schemaname === "facilitybookings") {
            ids = ["60a6271ddc5391107c658aec"];
        } else if (this.formObjValue.schemaname === "appointments") {
            ids = ["603e5b0499e17f26bc2ce93e" ,"616024c9d87b5c059c8fc586"];
        }  else if (this.formObjValue.schemaname === "bookings") {
            ids = ["60a627c4dc5391107c658af0"];
        } 
        postData['search'].push({ "searchfield": "_id", "searchvalue": ids, "criteria": "in", "datatype": "ObjectId" });
        
        this.communicationList = [];
        this.communicationList = await this.getTemplates(postData);

        // console.log("this.communicationList",this.communicationList); 

        this._subjectsService.behavioursubjectsArray.next(this.communicationList);
        $("#btbsendrf").click();
    }
    
    async onClickSendPayment() {
        var len = await  this.getPaymentLen();
        console.log("len",len);
        if(len > 0){ 
        let postData = {};
        postData['search'] = [];
        postData['search'].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });
        let ids = [];
        if (this.formObjValue.schemaname === "bills") {
            ids =  ["615430f15ce5be1c8eca64ce" , "615432575ce5be1c8eca64cf" ,"615432675ce5be1c8eca64d0", "615432755ce5be1c8eca64d1"];
        } else if (this.formObjValue.schemaname === "paymentschedules") {
            ids =  ["61542fc65ce5be1c8eca64b7" , "6154302b5ce5be1c8eca64b8" ,"615430455ce5be1c8eca64b9", "615430f15ce5be1c8eca64ce"];
        } 
        postData['search'].push({ "searchfield": "_id", "searchvalue": ids, "criteria": "in", "datatype": "ObjectId" });
       
            
        this.communicationList = [];
        this.communicationList = await this.getTemplates(postData);

        this.communicationList.map((item)=>{
            if (this.formObjValue.schemaname === "bills") {
                item.viewBtn = `/pages/purchase-module/email-preview/${this.formObjValue._id}/${this.bindIdValue}/600fc86399e17f26fc90a105`;
            } else if (this.formObjValue.schemaname === "paymentschedules") {
                item.viewBtn = `/pages/purchase-module/email-preview/${this.formObjValue._id}/${this.bindIdValue}/600c006a99e17f46c018e361`;
            }
        }); 
        this._subjectsService.behavioursubjectsArray.next(this.communicationList);
        $("#btbsendpllnk").click();
        }else{
        swal.fire({
            title: 'Are you sure?',
            text: 'You need to configure you Payment gateways !',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Configure it!',
            cancelButtonText: 'No',
            customClass: {
                confirmButton: "btn btn-success",
                cancelButton: "btn btn-danger",
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                this._router.navigate([`pages/integration-module/lists/paymentgateway`]);
            }
        });
        }


        // if (this.formObjValue.schemaname === "bills") {
        //     this._router.navigate([`pages/purchase-module/email-preview/${this.formObjValue._id}/${this.bindIdValue}/609e7ddd99e17f4da8a387f6`]);
        // } else if (this.formObjValue.schemaname === "paymentschedules") {
        //     this._router.navigate([`pages/purchase-module/email-preview/${this.formObjValue._id}/${this.bindIdValue}/609e64e399e17f4da8a387d3`]);
        // }
    }



 
    async  getPaymentLen() {
        let url = "forms/filter/view";
        let postData = {};
        postData['search'] = [];
        postData['search'].push({ "searchfield": "formtype", "searchvalue": "integration", "criteria": "eq", "datatype": "text" });
        let cnt = 0;
        var res : any  = await this._commonService.commonServiceByUrlMethodDataAsync(url,"POST",postData);
        res.forEach((form: any) => { 
            if (form.formdata && form.formdata._id && form.property["paymentgateway"]) {
                cnt++;
            }
        }); 
        return cnt;
    }

    async  getTemplates(postData) {
        let url = "communications/filter";
        
        // console.log("postData",postData);
        var res =  await this._commonService.commonServiceByUrlMethodDataAsync(url,"POST",postData) as any; 
        
        //   res = [
        //     { 
        //         "_id" : "60a6271ddc5391107c658aec", 
        //         "content" : "<meta content='text/html; charset=utf-8'> <meta content='width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1'> <meta content='IE=Edge'> <style>  body,  p,  div {  font-family: inherit;  font-size: 15px;  }   body {  color: #707B8E;  margin: 0;  padding: 0;  -webkit-text-size-adjust: none;  -ms-text-size-adjust: none;  }   body a {  color: #F29015;  text-decoration: none;  }   p {  margin: 0;  padding: 0;  }   table.wrapper {  width: 100% !important;  table-layout: fixed;  -webkit-font-smoothing: antialiased;  -webkit-text-size-adjust: 100%;  -moz-text-size-adjust: 100%;  -ms-text-size-adjust: 100%;  }   img.max-width {  max-width: 100% !important;  }   .column.of-2 {  width: 50%;  }   .column.of-3 {  width: 33.333%;  }   .column.of-4 {  width: 25%;  }   @media screen and (max-width:480px) {   .preheader .rightColumnContent,  .footer .rightColumnContent {  text-align: left !important;  }   .preheader .rightColumnContent div,  .preheader .rightColumnContent span,  .footer .rightColumnContent div,  .footer .rightColumnContent span {  text-align: left !important;  }   .preheader .rightColumnContent,  .preheader .leftColumnContent {  font-size: 80% !important;  padding: 5px 0;  }   table.wrapper-mobile {  width: 100% !important;  table-layout: fixed;  }   img.max-width {  height: auto !important;  max-width: 100% !important;  }   a.bulletproof-button {  display: block !important;  width: auto !important;  font-size: 80%;  padding-left: 0 !important;  padding-right: 0 !important;  }   .columns {  width: 100% !important;  }   .column {  display: block !important;  width: 100% !important;  padding-left: 0 !important;  padding-right: 0 !important;  margin-left: 0 !important;  margin-right: 0 !important;  }  } </style> <link> <style>  body {  font-family: 'Poppins', sans-serif;  } </style> <center class='wrapper' data-link-color='#F29015' data-body-style='font-size:15px; font-family:inherit; color:#707B8E; background-color:#F0F4F9;'>  <div class='webkit'>  <table class='wrapper' width='100%' cellspacing='0' cellpadding='0' border='0' bgcolor='#F0F4F9'>  <tbody>  <tr>  <td width='100%' valign='top' bgcolor='#F0F4F9'>  <table class='outer' width='100%' cellspacing='0' cellpadding='0' border='0' align='center'>  <tbody>  <tr>  <td width='100%'>  <table width='100%' cellspacing='0' cellpadding='0' border='0'>  <tbody>  <tr>  <td>  <table class='module' data-type='spacer' style='table-layout: fixed;' width='100%' cellspacing='0' cellpadding='0' border='0' bgcolor='#F0F4F9'>  <tbody>  <tr>  <td style='padding:0px 0px 40px 0px;' bgcolor='#F0F4F9'></td>  </tr>  </tbody>  </table>  <table style='width:100%; max-width:600px;' width='100%' cellspacing='0' cellpadding='0' border='0' align='center'>  <tbody>  <tr>  <td style='padding:0px 0px 0px 0px; color:#000000; text-align:left;' width='100%' bgcolor='#FFFFFF' align='left'>  <table data-type='columns' style='padding:16px 0px 16px 0px;' width='100%' cellspacing='0' cellpadding='0' border='0' bgcolor='#2F408F' align='center'>  <tbody>  <tr>  <td valign='top' height='100%'>  <table class='column' style='width:600px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 0px;' width='600' cellspacing='0' cellpadding='0' border='0' bgcolor='' align='left'>  <tbody>  <tr>  <td style='padding:0px;margin:0px;border-spacing:0;'>  <table class='wrapper' data-type='image' style='table-layout: fixed;' width='100%' cellspacing='0' cellpadding='0' border='0'>  <tbody>  <tr>  <td style='padding:0px 0px 0px 0px;' valign='top' align='center'><img class='max-width' style='display:block; text-decoration:none;' alt='' data-proportionally-constrained='true' data-responsive='false' src='$[{branchid.branchlogo}]' border='0'></td>  </tr>  </tbody>  </table>  </td>  </tr>  </tbody>  </table>  </td>  </tr>  </tbody>  </table>  <table class='module' data-type='text' style='table-layout: fixed;' width='100%' cellspacing='0' cellpadding='0' border='0'>  <tbody>  <tr>  <td style='padding:20px 50px 10px 20px; text-align:inherit;' valign='top' height='100%' bgcolor=''>  <div style='font-family: inherit; text-align: center'><span style='font-family: inherit;color: #273C63; font-size: 22px;'></span>  </div>  </td>  </tr>  </tbody>  </table>  <table class='module' data-type='text' style='table-layout: fixed;' width='100%' cellspacing='0' cellpadding='0' border='0'>  <tbody>  <tr> <td style='padding: 40px 40px 60px 40px; line-height: 30px; text-align: inherit;' role='module-content' valign='top' height='100%' bgcolor=''> <div style='font-family: inherit; text-align: center;'><span style='font-family: inherit; color: #273c63; font-size: 22px;'><strong>Your Feedback Highly Appreciated<br></strong></span></div> </td> </tr>  <tr> <td style='padding: 0px 40px 10px 40px; line-height: 22px; text-align: inherit;' role='module-content' valign='top' height='100%' bgcolor=''> <div style='font-family: inherit; text-align: inherit;'><span style='color: #707b8e; font-size: 15px;'>Dear $[{customerid.fullname}],</span></div>   <div style='font-family: inherit; text-align: inherit;'>&nbsp;</div> <div style='font-family: inherit; text-align: inherit;'><span style='color: #707b8e; font-size: 15px;'>Thanks for using service.</span></div> </td> </tr>  <tr> <td style='padding: 0px 40px 40px 40px; line-height: 22px; text-align: inherit;' role='module-content' valign='top' height='100%' bgcolor=''> <div style='font-family: inherit; text-align: inherit;'><span style='color: #707b8e; font-size: 15px;'>To help us improve, we'd like to ask you a few questions about your experience so far. It'll only take 3 minutes, and your answers will help us make service even better for you and other guests.</span></div></td> </tr>  </tbody>  </table>   <table class='module' data-role='module-button' data-type='button' style='table-layout:fixed;' width='100%' cellspacing='0' cellpadding='0' border='0'>  <tbody>  <tr>  <td class='outer-td' style='padding:0px 0px 0px 0px;' bgcolor='' align='center'>  <table class='wrapper-mobile' style='text-align:center;' cellspacing='0' cellpadding='0' border='0'>  <tbody>  <tr>  <td class='inner-td' style='border-radius:5px; font-size:16px; text-align:center; background-color:inherit;' bgcolor='#F29015' align='center'>  <a href='https://form.membroz.com/#/dynamic-forms/form/60a1fc5799e17f50f8b5987f?domain=app.membroz.com&https=true' style='background-color:#F29015; border:none; border-radius:5px; color:#ffffff; display:inline-block; font-size:16px; font-weight:400; letter-spacing:0px; line-height:normal; padding:12px 25px 12px 25px; text-align:center; text-decoration:none; font-family:inherit;' target='_blank'>Take the Survey</a></td>  </tr>  </tbody>  </table>  </td>  </tr>  </tbody>  </table>  <table class='module' data-type='spacer' style='table-layout: fixed;' width='100%' cellspacing='0' cellpadding='0' border='0'>  <tbody>  <tr>  <td style='padding:0px 0px 20px 0px;' bgcolor=''></td>  </tr>  </tbody>  </table>  <table class='module' data-type='spacer' style='table-layout: fixed;' width='100%' cellspacing='0' cellpadding='0' border='0'>  <tbody>  <tr>  <td style='padding:0px 0px 20px 0px;' bgcolor=''></td>  </tr>  </tbody>  </table>  <table class='module' data-type='text' style='table-layout: fixed;' width='100%' cellspacing='0' cellpadding='0' border='0'>  <tbody>  <tr>  <td style='padding:0px 40px 40px 40px; line-height:22px; text-align:inherit;' valign='top' height='100%' bgcolor=''>  <div style='font-family: inherit; text-align: inherit'><span style='color: #707B8E; font-size: 15px'>Thanks,</span></div>  <div style='font-family: inherit; text-align: inherit'><span style='color: #707B8E; font-size: 15px'>$[{branchid.branchname}] Team</span></div>  </td>  </tr></tbody>  </table>  <table class='module' data-type='text' style='table-layout: fixed;' width='100%' cellspacing='0' cellpadding='0' border='0'>  <tbody>  <tr>  <td style='padding:0px 40px 0px 40px; line-height:22px; text-align:inherit;' valign='top' height='100%' bgcolor=''>  <div style='font-family: inherit; text-align: center'><span style='color: #707B8E; font-size: 13px'><strong>$[{branchid.branchname}]</strong></span></div>  </td>  </tr>  </tbody>  </table>  <table class='module' data-type='text' style='table-layout: fixed;' width='100%' cellspacing='0' cellpadding='0' border='0'>  <tbody>  <tr>  <td style='padding:0px 40px 5px 40px; line-height:22px; text-align:inherit;' valign='top' height='100%' bgcolor=''>  <div style='font-family: inherit; text-align: center'><span style='color: #707B8E; font-size: 13px'>$[{branchid.address}], $[{branchid.city}] - $[{branchid.postcode}]  $[{branchid.country}]</span></div>  </td>  </tr>  </tbody>  </table>  <table class='module' data-type='spacer' style='table-layout: fixed;' width='100%' cellspacing='0' cellpadding='0' border='0'>  <tbody>  <tr>  <td style='padding:0px 0px 10px 0px;' bgcolor=''></td>  </tr>  </tbody>  </table>  </td>  </tr>  </tbody>  </table>  </td>  </tr>  </tbody>  </table>  <table class='module' data-type='spacer' style='table-layout: fixed;' width='100%' cellspacing='0' cellpadding='0' border='0' bgcolor='#F0F4F9'>  <tbody>  <tr>  <td style='padding:0px 0px 40px 0px;' bgcolor='#F0F4F9'></td>  </tr>  </tbody>  </table>  </td>  </tr>  </tbody>  </table>  </td>  </tr>  </tbody>  </table>  </div> </center>", 
        //         "formid" : "5bcf069ff6955e2764bd8928", 
        //         "mappingfield" : "customerid", 
        //         "messagetype" : "EMAIL", 
        //         "subject" : "Facility Feedback", 
        //         "title" : "Facility Feedback", 
        //         "status" : "active"
        //     }
        //   ]
        return res
    }


    public onClickPayment(){
        if (this.formObjValue.schemaname === "bills") {
            this._router.navigate([`/pages/sale-module/multiple-bill/${this.formnameValue}/${this.bindIdValue}`]);
        } else if (this.formObjValue.schemaname === "paymentschedules") {
            this._router.navigate([`/pages/payment-module/make-payment/${this.bindIdValue}`]);
        }
    }
    
    public onClickemail() {
        this._router.navigate([`pages/purchase-module/email-preview/${this.formObjValue._id}/${this.bindIdValue}`]);
    }

    //#region Purchase Order
    public issuePurchaseOrder(status: string) {
        const varTemp = this;
        swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to revert this !',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Issued it!',
            cancelButtonText: 'No',
            customClass: {
                confirmButton: "btn btn-success",
                cancelButton: "btn btn-danger",
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                let postData = {
                    "schemaname": this.formObjValue.schemaname,
                    "ids": [this.bindIdValue],
                    "value": status
                };
                this._commonService
                    .updatestatus(postData)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe((data: any) => {

                        varTemp.showNotification('top', 'right', 'Document issued successfully !!', 'success');
                        swal.fire({
                            title: 'Issued !',
                            text: 'Your document has been issued.',
                            icon: 'success',
                            customClass: {
                                confirmButton: "btn btn-success",
                            },
                            buttonsStyling: false
                        });
                    });
            }
        });



    }

    // public convertToInward() {
    //     let postData = {
    //         "customerid": this.documentObj.vendorid._id,
    //         "onModel": 'Vendor',
    //         "type": 'inward',
    //         "challandate": new Date()
    //     };


    //     this._commonService
    //         .commonServiceByUrlMethodData('challans/', 'POST', postData)
    //         .pipe(takeUntil(this.destroy$))
    //         .subscribe((data: any) => {

    //             this.router.navigate([`/pages/purchase-module/challan/${data._id}`]);
    //             this.showNotification('top', 'right', 'Inward challan made successfully !', 'success');
    //         });
    // }

    public convertPurchaseInvoice() {  // api(pb-_id edit)

        let url = this.formObjValue.schemaname + '/converttopurchaseinvoice/';
        let method = 'GET';

        this._commonService
            .commonServiceByUrlMethodIdOrData(url, method, this.bindIdValue)
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: any) => {

                this.router.navigate([`/pages/purchase-module/purchase-invoice/${data._id}`])
                this.showNotification('top', 'right', 'Document converted to purchase invoice !', 'success');
            });
    }

    public cancelledPurchaseOrder(status: string) {
        const varTemp = this;
        swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to revert this !',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Cancelled it!',
            cancelButtonText: 'No',
            customClass: {
                confirmButton: "btn btn-success",
                cancelButton: "btn btn-danger",
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                let postData = {
                    "schemaname": this.formObjValue.schemaname,
                    "ids": [this.bindIdValue],
                    "value": status
                };
                varTemp._commonService
                    .updatestatus(postData)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe((data: any) => {
                        varTemp.showNotification('top', 'right', 'Document cancelled successfully !!', 'success');
                        swal.fire({
                            title: 'Cancelled !',
                            text: 'Your document has been cancelled.',
                            icon: 'success',
                            customClass: {
                                confirmButton: "btn btn-success",
                            },
                            buttonsStyling: false
                        });
                    });

            }
        });
    }

    //#endregion

    //#region
    public recordpayment() {
        this.router.navigate([`/pages/purchase-module/multiple-purchasepayment/${this.bindIdValue}`]);
    }
    //#endregion
 
    //#region Purchase Request START
    public convertpo() {  // api(pb-_id edit)

        let url = this.formObjValue.schemaname + '/converttopurchaseorder/';
        let method = 'GET';

        this._commonService
            .commonServiceByUrlMethodIdOrData(url, method, this.bindIdValue)
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: any) => {
                this.router.navigate([`/pages/purchase-module/purchase-order/${data._id}`])
                this.showNotification('top', 'right', 'Document converted to purchase order !', 'success');
            });
    }
    //#region Purchase Request END


    //#region Qutation - Convert SO START
    convertbill(){
        
        let url = this.formObjValue.schemaname + '/converttobill/';
        let method = 'GET';

        this._commonService
            .commonServiceByUrlMethodIdOrData(url, method, this.bindIdValue)
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: any) => {
                this.updatestatus('confirmed');
                this.showNotification('top', 'right', 'Converted to bill successfully !!', 'success');
                this.router.navigate(['/pages/dynamic-preview-list/bill/'+ data._id]);
            });
    }
    

    //#region Qutation Request END

    updatestatus(status : string){
        let postData = {
            "schemaname": this.formObjValue.schemaname,
            "ids": [this.bindIdValue],
            "value": status
        };
        this._commonService
            .updatestatus(postData)
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: any) => {
            });
    }

    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

}
