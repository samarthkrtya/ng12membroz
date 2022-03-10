import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';

import { CommonService } from '../../../../app/core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { OnlyNumberValidator, OnlyPositiveNumberValidator } from '../../../../app/shared/components/basicValidators';

import swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-myaccountdetail',
  templateUrl: './myaccountdetail.component.html',
})

export class MyAccountDetailComponent extends BaseLiteComponemntComponent implements OnInit {

  isLoadingData: boolean;
  btnDisable: boolean = true;
  btnDisable2: boolean = false;
  

  cardForm: FormGroup
  submitted: boolean;
  cardDetail: any[] = [];

  today : Date = new Date();

  dataContent : any;
 

  @ViewChild(MatDatepicker) picker;

  constructor(
    protected _commonService: CommonService,
    protected fb: FormBuilder
  ) {
    super();

    this.cardForm = fb.group({
      'number': [, Validators.compose([OnlyPositiveNumberValidator.insertonlypositivenumber, OnlyNumberValidator.insertonlycardnumber, Validators.required])],
      'expiry': [, Validators.required],
      'csv': [, Validators.compose([OnlyPositiveNumberValidator.insertonlypositivenumber, OnlyNumberValidator.insertonlythreenumber, Validators.required])],
      'holdername': ['', Validators.required],
      'terms': [false],
      'status': ['valid'],
    }); 

      this.cardForm
      .get('terms')
      .valueChanges.subscribe((num) => { 
         this.btnDisable = !num;
      });
      
   }

  async ngOnInit() {
    try {
      this.isLoadingData = true;
      super.ngOnInit();
      await this.initVariable();
      this.isLoadingData = false;
    } catch (error) {
    } finally {
    } 
  }

 async getMemberDetails(){

  let url = "members/";
  let method = "GET";
   
  await this._commonService
    .commonServiceByUrlMethodIdOrDataAsync(url, method, this._loginUserId)
    .then((data: any) => {
      this.dataContent = data;
    }).catch((e) => {
      super.showNotification("top", "right", "Error Occured !!", "danger");
    });
  }

  

  async initVariable() {
    await this.getMemberDetails();

    this.cardDetail = [];
    
    if(this.dataContent.property.credit_card_no && this.dataContent.property.exp_month && this.dataContent.property.exp_year){
      let obj = {
        'holdername' : this.dataContent.property.name_on_account,
        'sourceid' : this.dataContent.property.sourceid,
        'magpiecustomerid' : this.dataContent.property.magpiecustomerid,
        'cardnumber' : Number(this.dataContent.property.credit_card_no).toString().replace(/\w(?=\w{4})/g, "*"),
        'expiry' : new Date(parseInt(this.dataContent.property.exp_year), parseInt(this.dataContent.property.exp_month)),
      };
      this.cardDetail.push(obj);
    }
    return;
  }
 

  onSubmitMethod(value: any, valid: boolean , formDirective: FormGroupDirective) {

    let url;
    let method;

    if(this._loginUserBranch.property &&  this._loginUserBranch.property.paymentintergations && this._loginUserBranch.property.paymentintergations == 'magpie'){
      url = "public/createmagpietoken";
      method = "POST";
    }else{
      super.showNotification("top", "right", "Payment gateway not supported !!", "danger");
      return;
    }
    this.submitted = true;
    if (!valid) {
      super.showNotification("top", "right", "Validation failed !!", "danger");
      return;
    } else if (!value['terms']) {
      super.showNotification("top", "right", "Accept terms & conditions !!", "danger");
      return;
    }
    value['expiry'] = value['expiry'] && value['expiry']['_d'] ? value['expiry']['_d'] : value['expiry'];
 
    var expdate = new Date(value.expiry);
    let model = {};
    model['cvv']  = value.csv;
    model['email']  = this._loginUser.property.primaryemail;
    model['memberid']  = this._loginUserId;
    model['number']  = value.number;
    model['card_name']  = value.holdername;
    model['expiry']  = value.expiry;
    model['exp_month']  = expdate.getMonth() + 1;
    model['exp_year']  = expdate.getFullYear();
    
    // console.log("model==>",model);
    this.btnDisable = true;
    this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model)
      .then(async (data: any) => {
        console.log("data==>",data);
        this.btnDisable = false;
        super.showNotification("top", "right", "Card Detail added successfully !!", "success");
        $("#methodClose").click();
        this.cardForm.reset();
        formDirective.resetForm();
        await this.initVariable();
      }).catch((e) => {
        console.error("e==>",e);
        this.btnDisable = false;
        if(e.error && e.error.message){
          super.showNotification("top", "right", e.error.message, "danger");
        }else{
          super.showNotification("top", "right", 'Something went wrong !!', "danger");
        }
        $("#methodClose").click();
        this.cardForm.reset();
        formDirective.resetForm();
        this.submitted = false;
      });
  }

  updateCard(item: any) {
 
    const varTemp = this;
    swal.fire({
      title: 'Are you sure?',
      text: "You want to delete ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Confirm it!',
      cancelButtonText: 'No',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result && result.value) {
        

        let model = {};
        
        model['sourceid']  = item.sourceid;
        model['magpiecustomerid']  = item.magpiecustomerid;
        model['memberid']  = this._loginUserId;

        let url = "public/deletemagpietoken";
        let method = "POST";

        varTemp.btnDisable2 = true;
        varTemp._commonService
          .commonServiceByUrlMethodDataAsync(url, method, model)
          .then( async (data: any) => {
            varTemp.btnDisable2 = false;
            varTemp.showNotification("top", "right", "Card deleted successfully !!", "success");
            await this.initVariable();
          }).catch((e) => {
            console.error("e",e);
            varTemp.btnDisable2 = false;
          });
       
      }  
    });

  }

  
  chargeCard(item: any) {

    
    const varTemp = this;
    swal.fire({
      title: 'Are you sure ?',
      text: "You want to test charge autodebit ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Confirm it!',
      cancelButtonText: 'No',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result && result.value) {
        

        let model = {};
        
        model['sourceid']  = item.sourceid;
        model['magpiecustomerid']  = item.magpiecustomerid;
        model['memberid']  = this._loginUserId;

        let url = "public/chargemagpiecarde";
        let method = "POST";

        varTemp.btnDisable2 = true;
        varTemp._commonService
          .commonServiceByUrlMethodDataAsync(url, method, model)
          .then( async (data: any) => {
            varTemp.btnDisable2 = false;
            varTemp.showNotification("top", "right", "Card Charged successfully !!", "success");
            await this.initVariable();
          }).catch((e) => {
            console.error("e",e);
            varTemp.btnDisable2 = false;
          });
       
      }  
    });

  }
 


  monthSelected(params) {
    var date = params._d ? params._d : params;
    this.cardForm.controls['expiry'].setValue(date);
    this.picker.close();
  }
 

}


