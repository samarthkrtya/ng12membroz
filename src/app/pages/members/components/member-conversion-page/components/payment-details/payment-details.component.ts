import { Component, OnInit } from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../../../shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-payment-details',
  templateUrl: './payment-details.component.html',
  styles: [
  ]
})
export class PaymentDetailsComponent  extends BaseComponemntComponent implements OnInit, BaseComponemntInterface {

  isLoadingData: boolean;

  form: FormGroup;
  submitted: boolean;

  dpamountpaid: any;
  instrumentnumber: any;
  instrumentdate: any;
  bankdepositaccount: any;
  collectionsource: any;

  bankname = new FormControl();
  bankLists: any[] = [];
  bankisLoadingBox: boolean;
  bankfilteredOptions: Observable<string[]>;

  paymentmode = new FormControl();
  paymentmodeLists: any[] = [];
  paymentmodeisLoadingBox: boolean;
  paymentmodefilteredOptions: Observable<string[]>;


  paymentscheduleLists: any [] = [];
  paymentLists: any [] = [];
  addPaymentLists: any []= [];

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
  ) {
    super();

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
    })

    this.pagename = "app-payment-details";

    this.form = this.fb.group({
      payment: this.fb.array([]) ,
    })

  }

  payment(): FormArray {
    return this.form.get("payment") as FormArray
  }

  async ngOnInit() {

    
    try {
      await super.ngOnInit();
      await this.initializeVariables()
      await this.LoadData();
    } catch(error) {
      console.error(error);
    } finally {
    }

    

    this.bankfilteredOptions = this.bankname.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option?.name),
        map(option => option ? this._filterBank(option) : this.bankLists.slice())
      );


    this.paymentmodefilteredOptions = this.paymentmode.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option?.name),
        map(option => option ? this._filterPaymentMode(option) : this.paymentmodeLists.slice())
    );

  }

  async LoadData() {
    try {
      await this.loadBank();
      await this.loadPaymentMode();
      await this.getPaymentSchedulesData();
      await this.getPayments()
    } catch(error) {
      console.error(error);
    } finally {
    } 
  }

  Save() {}
  Update() {}
  Delete() {}
  ActionCall() {}

  async initializeVariables() {

    this.isLoadingData = false;

    this.bankLists = [];
    this.paymentmodeLists = [];
    this.paymentscheduleLists = [];
    this.addPaymentLists = [];
    this.paymentLists = [];

    let frmArray = this.form.get('payment') as FormArray;
    frmArray.clear();

    return;

  }

  async getPaymentSchedulesData() {

    let method = "POST";
    let url = "paymentschedules/filter";

    let postData =  {};
    postData["search"] = [];
    //postData["search"].push({ "searchfield": "status", "searchvalue": "Paid", "criteria":"ne" });
    postData["search"].push({ "searchfield": "memberid", "searchvalue": this.bindId, "criteria":"eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any)=>{
        
        if(data && data[0]) {

          this.paymentscheduleLists = [];
          this.addPaymentLists = [];
          this.paymentscheduleLists = data;

          
          return;
        }
      }, (error)=>{
        console.error(error);
    })

  }

  async getPayments() {

    let method = "POST";
    let url = "payments/filter";

    var items = this.paymentscheduleLists.map(choice => (choice._id));

    let postData =  {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "item", "searchvalue": items, "criteria":"in" });
    postData["search"].push({ "searchfield": "memberid", "searchvalue": this.bindId, "criteria":"eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any)=>{
        
        if(data) {

          this.paymentLists = [];
          this.paymentLists = data;

          if(this.paymentLists.length == 0) {

            if(this.paymentscheduleLists && this.paymentscheduleLists.length !== 1) {

              this.paymentscheduleLists.forEach(element => {
                this.addPaymentLists.push(element);
                if(element.paymentterms && element.paymentterms.paymentitem &&  element.paymentterms.paymentitem._id == "62063e1bf6264036a1562731") {
                  this.addPayment(element);
                }
              });

            } else {
              
              this.addPaymentLists.push(this.paymentscheduleLists[0]);
              this.addPayment(this.paymentscheduleLists[0]);
            }
          } else {

            let patchData = {};
            patchData["payment"] = [];

            this.paymentscheduleLists.forEach(async element => {
              
              

              this.addPaymentLists.push(element);
              var paymentObj = this.paymentLists.find(p=>p.item._id == element._id);
              if(paymentObj) {

                
                element.paymentid = paymentObj._id;
                await this.addPayment(element);


                var mode;
                var paymentmodeObj = this.paymentmodeLists.find(p=>p.name == paymentObj.mode)
                if(paymentmodeObj) {
                  mode = paymentmodeObj
                }
                

                var bankname;
                var banknameObj = this.bankLists.find(p=>p.name == paymentObj.property.bankname)
                if(banknameObj) {
                  bankname = banknameObj
                }
                

                let obj = {};
                obj["id"] = element.paymentid;
                obj["paymentscheduleid"] = element._id;
                obj["paymenttermid"] = element.paymentterms._id;
                obj["paymentitemid"] = element.paymentterms.paymentitem._id;
                obj["docnumber"] = element.docnumber;
                obj["bankname"] = bankname;
                obj["paymentmode"] = mode;
                obj["amountpaid"] = paymentObj.paidamount;
                obj["instrumentnumber"] = paymentObj.property.instrumentnumber;
                obj["instrumentdate"] = paymentObj.paymentdate;
                obj["bankdepositaccount"] = paymentObj.property.bankdepositaccount;
                obj["collectionsource"] = paymentObj.property.collectionsource;
                patchData["payment"].push(obj);

              }
            });


            setTimeout(() => {
              
              this.form.patchValue(patchData);  
            });

          }
          
          return;
        }
      }, (error)=>{
        console.error(error);
    })

    //this.paymentLists = [];

    
  }

  async onSubmit(value: any, valid: boolean) {
    
    this.submitted = true;

    if (!valid) {
      super.showNotification("top", "right", "Validation Failed !!", "danger");
      return;
    } else {
      
      let method =  "POST";
      let url = "payments";

      var items = value.payment.map(choice => (choice.paymentscheduleid));

      let postData = {};
      postData["multiple"] = true;
      postData["items"] = items;
      postData["paidamount"] = value.payment.reduce((accumulator, current) => accumulator + current.amountpaid, 0);;
      
      postData["memberid"] = this.bindId;
      postData["onModel"] = "Member";

      postData["payment"] = [];
      
      
      if(value.payment && value.payment.length > 0) {

        value.payment.forEach(element => {

          let paymentscheduleObj = {};
          var paymentdate = new Date();

          if(element.instrumentdate) {
            paymentdate = new Date(element.instrumentdate)
          }

          paymentscheduleObj["paymentscheduleid"] = element.paymentscheduleid;
          paymentscheduleObj["amountpaid"] = element.amountpaid;
          paymentscheduleObj["mode"] = element.paymentmode.name;
          paymentscheduleObj["paymentdate"] = paymentdate;
          paymentscheduleObj["property"] = {};
          paymentscheduleObj["property"]["instrumentnumber"] = element.instrumentnumber;
          paymentscheduleObj["property"]["bankdepositaccount"] = element.bankdepositaccount;
          paymentscheduleObj["property"]["collectionsource"] = element.collectionsource;
          paymentscheduleObj["property"]["bankname"] = element.bankname.name;

          postData["payment"].push(paymentscheduleObj);

        });
      }

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then(data=>{
          if(data) {
            this.showNotification('top', 'right', `Membership offer has been added successfully !!!`, 'success');
            this._router.navigate(["/pages/members/profile/" + this.bindId]);
            //this.ngOnInit();
            return;
          }
        }, (error)=>{
          console.error(error);
      })


    }
  }

  async loadBank() {

    let method = "POST";
    let url = "lookups/filter";

    let postData =  {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria":"eq" });
    postData["search"].push({ "searchfield": "lookup", "searchvalue": "bank", "criteria":"eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data=>{
        if(data) {
          this.bankLists = [];
          this.bankLists = data[0]['data'];
          return;
        }
      }, (error)=>{
        console.error(error);
    })

  }

  async loadPaymentMode() {

    let method = "POST";
    let url = "lookups/filter";

    let postData =  {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria":"eq" });
    postData["search"].push({ "searchfield": "lookup", "searchvalue": "paymentmode", "criteria":"eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data=>{
        if(data) {
          this.paymentmodeLists = [];
          this.paymentmodeLists = data[0]['data'];
          return;
        }
      }, (error)=>{
        console.error(error);
    })

  }

  private _filterBank(value: string): any[] {
    let results;
    if (value) {
      results = this.bankLists
        .filter(option => {
          if(option.name) {
            return option.name.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
        if (results.length < 1) {
          results = [];
        }
    } else {
      results = this.bankLists.slice();
    }
    return results;
  }

  bankdisplayFn(bank: any): string {
    return bank && bank.name ? bank.name : '';
  }

  private _filterPaymentMode(value: string): any[] {
    let results;
    if (value) {
      results = this.paymentmodeLists
        .filter(option => {
          if(option.name) {
            return option.name.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
        if (results.length < 1) {
          results = [];
        }
    } else {
      results = this.paymentmodeLists.slice();
    }
    return results;
  }

  paymentModedisplayFn(paymentmode: any): string {
    return paymentmode && paymentmode.name ? paymentmode.name : '';
  }

  newPayment(item: any): FormGroup {

    return this.fb.group({
      id: [item.paymentid ? item.paymentid : ''],
      paymentscheduleid: [item._id],
      paymenttermid: [item.paymentterms._id],
      paymentitemid: [item.paymentterms.paymentitem._id],
      docnumber: [item.docnumber],
      bankname: ['',{ validators: [Validators.required] }],
      paymentmode: ['', { validators: [Validators.required] }],
      amountpaid: [item.balance, { validators: [Validators.required] }],
      instrumentnumber: [],
      instrumentdate: [],
      bankdepositaccount: [],
      collectionsource: []
    })
  }

  async addPayment(item: any) {
    this.payment().push(this.newPayment(item));
    var index = this.addPaymentLists.findIndex(x => x._id === item._id);
    if (index !== -1) this.addPaymentLists.splice(index, 1);
  }

  removePayment(paymentIndex:number) {
    var paymentscheduleid = ((this.form.get('payment') as FormArray).at(paymentIndex) as FormGroup).get('paymentscheduleid').value;
    var paymentscheduleObj = this.paymentscheduleLists.find(p=>p._id == paymentscheduleid);
    if(paymentscheduleObj) {
      this.addPaymentLists.push(paymentscheduleObj);
    }
    this.payment().removeAt(paymentIndex);
  }

}
