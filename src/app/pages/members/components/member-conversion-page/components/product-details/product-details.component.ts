import { TmplAstTextAttribute } from '@angular/compiler';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { ActivatedRoute } from '@angular/router';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../../../shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styles: [
  ]
})
export class ProductDetailsComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface {

  
  @Output() updateRecord = new EventEmitter();

  isLoadingData: boolean;

  form: FormGroup;
  submitted: boolean;

  product = new FormControl();
  productLists: any[] = [];
  productisLoadingBox: boolean;
  prodictFilteredOptions: Observable<string[]>;

  // gst = new FormControl();
  gstLists: any[] = [];
  // gstisLoadingBox: boolean;
  // gstFilteredOptions: Observable<string[]>;

  year: any;
  season: any;
  apartment: any;
  price: any;
  paymenttype: any;
  discount: any;
  fullpaymentamount: any;

  paymenttypeLists: any [] = [];

  memberData: any = {};
  paymentTermDetails: any = {};

  paymentLists: any [] = [];

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
  ) {
    super()

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
    })

    this.pagename = "app-product-details";

    this.form = fb.group({
      'product': [this.product, { validators: [Validators.required] }],
      'year': [],
      'season': [],
      'apartment': [],
      'price': [],
      'paymenttype': [],
      'discount': [],
      'gst': [],
      'fullpaymentamount': [],
      'dpamount': [],
      'dppercentageamount': [],
      'emitenure': [],
      'emistartdate': [],
      'actualemiamount': [],
      'emiamount': [],
      'interest': [],
      'emiplanstatus': [],
      'discountamount': []
    });
   
   }

  async ngOnInit() {

    try {
      await super.ngOnInit();
      await this.initializeVariables()
      await this.LoadData()
    } catch(error) {
      console.error(error);
    } finally {
    }

    this.prodictFilteredOptions = this.product.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option?.membershipname),
        map(option => option ? this._filterProduct(option) : this.productLists.slice())
      );
    
    
  }

  
  Save() {}
  Update() {}
  Delete() {}
  ActionCall() {}

  async initializeVariables() {
    
    this.isLoadingData = false;
    this.productLists = [];

    this.form.get("price").setValue(0);
    this.form.get("emistartdate").setValue(new Date());
    this.form.get("paymenttype").setValue("full");
    this.form.get("actualemiamount").setValue(0);
    this.form.get("emiamount").setValue(0);
    
    this.paymenttypeLists = [];
    this.paymenttypeLists.push({"id": "full", "name": "Full Payment"});
    this.paymenttypeLists.push({"id": "emi", "name": "EMI"});

    this.memberData = {};
    this.paymentTermDetails = {};

    this.paymentLists = [];


    return;
  }

  async LoadData() {
    try {
      
      await this.LoadMembership()
      await this.loadTaxes()
      await this.getExistingData(this.bindId);
      await this.loadpayment(this.bindId);
    } catch(error) {
      console.error(error);
    } finally {
    }
  }

  

  async getExistingData(id: any) {

    let method = "POST";
    let url = "paymentterms/filter";

    let postData =  {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria":"eq" });
    postData["search"].push({ "searchfield": "memberid", "searchvalue": this.bindId, "criteria":"eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any)=>{
        
        if(data && data[0]) {

          if(data.length > 1) {

            this.paymentTermDetails = {};
            this.paymentTermDetails = data;

            this.form.controls['paymenttype'].setValue('emi');

            this.product.setValue(this.paymentTermDetails[0].membershipid);

            var month = this.product?.value?.property?.tenure;
            var years = Math.floor(month/12);
            this.form.controls['year'].setValue(years);

            var season = this.product?.value?.property?.season;
            this.form.controls['season'].setValue(season);

            var apartment = this.product?.value?.property?.apartment;
            this.form.controls['apartment'].setValue(apartment);

            var cost = this.product?.value?.property?.cost;
            this.form.controls['price'].setValue(cost);
            
            var dp = this.paymentTermDetails.find(p=>p.period == "Once");
            if(dp) {
              this.form.controls['dpamount'].setValue(dp.totalamount);
            }

            var emi = this.paymentTermDetails.find(p=>p.period == "Monthly");
            if(emi) {
              this.form.controls['emitenure'].setValue(emi.tenure);
              this.form.controls['actualemiamount'].setValue(emi.amount);
              this.form.controls['emiamount'].setValue(emi.totalamount);
              
              var taxes =  emi.taxes.map(choice => (choice._id));
              this.form.get("gst").setValue(taxes);
            }

            this.form.get("discount").setValue(this.paymentTermDetails[0].property.discount);
            this.form.get("interest").setValue(this.paymentTermDetails[0].property.interest);
            


          } else {

            this.paymentTermDetails = {};
            this.paymentTermDetails = data[0];

            this.product.setValue(this.paymentTermDetails.membershipid);

            var month = this.product?.value?.property?.tenure;
            var years = Math.floor(month/12);
            this.form.controls['year'].setValue(years);

            var season = this.product?.value?.property?.season;
            this.form.controls['season'].setValue(season);

            var apartment = this.product?.value?.property?.apartment;
            this.form.controls['apartment'].setValue(apartment);

            var cost = this.product?.value?.property?.cost;
            this.form.controls['price'].setValue(cost);

            this.form.get("fullpaymentamount").setValue(cost);

            var taxes =  this.paymentTermDetails.taxes.map(choice => (choice._id));
            this.form.get("gst").setValue(taxes);
            

            var discount = this.paymentTermDetails.discount;
            var amount = this.paymentTermDetails.amount;

            var percentage = discount / amount * 100;
            this.form.get("discount").setValue(this.paymentTermDetails.property.discount);
            this.form.get("interest").setValue(this.paymentTermDetails.property.interest);
              
          }
          return;
        }
      }, (error)=>{
        console.error(error);
    })

  }

  async loadpayment(id: any) { 

    let method = "POST";
    let url = "payments/filter";

    let postData =  {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "memberid", "searchvalue": this.bindId, "criteria":"eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any)=>{
        
        if(data) {

          this.paymentLists = [];
          this.paymentLists = data;

          return;
        }
      }, (error)=>{
        console.error(error);
    })

  }

  async onSubmit(value: any, valid: boolean) {
    
    this.submitted = true;

    if (!valid) {
      super.showNotification("top", "right", "Validation Failed !!", "danger");
      return;
    } else {

      if(this.paymentLists && this.paymentLists.length > 0) {
        this.showNotification('top', 'right', 'Change payment terms not possible as payment already paid!!!', 'danger');
        return;
      }


      if ((!value.product || !value.product.value)) {
        this.showNotification('top', 'right', 'Please select Product !!', 'danger');
        return;
      }

      

      let postData = {};
      postData["memberid"] = this.bindId;
      postData["membershipid"] = this.product.value._id;

      postData["paymentterm"] = [];

      if(value.paymenttype == "full") {
        
        let paymenttermObj = {}
        paymenttermObj["paymentitem"] = "62062993c3a13d28bd1c680f";
        paymenttermObj["period"] = "Once";
        paymenttermObj["tenure"] = 1;
        paymenttermObj["amount"] = value.price;
        paymenttermObj["totalamount"] = value.fullpaymentamount;
        paymenttermObj["discount"] = value.discountamount;
        paymenttermObj["taxes"] = value.gst;
        postData["paymentterm"].push(paymenttermObj);

      } else {

        if(value.dpamount !== 0) {

          let paymenttermObj = {}
          paymenttermObj["paymentitem"] = "62063e1bf6264036a1562731";
          paymenttermObj["period"] = "Once";
          paymenttermObj["tenure"] = 1;
          paymenttermObj["amount"] = value.dpamount;
          paymenttermObj["totalamount"] = value.dpamount;
          paymenttermObj["discount"] = 0;
          paymenttermObj["taxes"] = value.gst;
          postData["paymentterm"].push(paymenttermObj);

        } 

        let emiObj = {}
        emiObj["paymentitem"] = "62063e22f6264036a1562733";
        emiObj["period"] = "Monthly";
        emiObj["tenure"] = value.emitenure;
        emiObj["amount"] = value.actualemiamount;
        emiObj["totalamount"] = value.emiamount;
        emiObj["discount"] = Number(value.actualemiamount) - Number(value.emiamount); 
        emiObj["taxes"] = value.gst;
        postData["paymentterm"].push(emiObj);

      }

      postData["property"] = {};
      postData["property"] = value;
      postData["property"]["product"] = this.product.value._id;
      postData["property"]["discount"] = value.discount;
      postData["property"]["interest"] = value.interest;

      
      let method = "POST";
      let url = "members/payment";

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data: any)=>{
          if(data) {
            this.showNotification('top', 'right', `Payment Term has been updated successfully !!!`, 'success');
            //this.ngOnInit();
            this.updateRecord.emit();
            return;
          }
        }, (error)=>{
          console.error(error);
      })
      
    }
  }

  async LoadMembership() {

    let method = "POST";
    let url = "memberships/filter";

    let postData =  {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria":"eq" });
    
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any)=>{
        if(data) {
          this.productLists = [];
          this.productLists = data;
          return;
        }
      }, (error)=>{
        console.error(error);
    })

  }

  private _filterProduct(value: string): any[] {
    let results;
    if (value) {
      results = this.productLists
        .filter(option => {
          if(option.name) {
            return option.membershipname.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
        if (results.length < 1) {
          results = [];
        }
    } else {
      results = this.productLists.slice();
    }
    return results;
  }

  bankdisplayFn(bank: any): string {
    return bank && bank.membershipname ? bank.membershipname : '';
  }

  optionProductSelected(option: any) {
    
    this.product.setValue(option.value);


    var month = this.product?.value?.property?.tenure;
    var years = Math.floor(month/12);
    this.form.controls['year'].setValue(years);

    var season = this.product?.value?.property?.season;
    this.form.controls['season'].setValue(season);

    var apartment = this.product?.value?.property?.apartment;
    this.form.controls['apartment'].setValue(apartment);

    var cost = this.product?.value?.property?.cost;
    this.form.controls['price'].setValue(cost);

    this.form.get("fullpaymentamount").setValue(cost);
  }

  async loadTaxes() {

    let method = "POST";
    let url = "taxes/filter";

    let postData =  {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria":"eq" });
    
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any)=>{
        if(data) {
          this.gstLists = [];
          this.gstLists = data;
          return;
        }
      }, (error)=>{
        console.error(error);
    })

  }

  

  discountOnChange(discount: number): void {  

    var productPrice = this.form.get("price").value;
    const calculatePrice = Math.round( (productPrice / 100 ) * discount);
    var paymentAmunt = productPrice - calculatePrice;

    
    this.form.get("discountamount").setValue(calculatePrice);
    this.form.get("fullpaymentamount").setValue(paymentAmunt);
  }

  discountRestriction(e, input) {
    const keyValue = +e.key;
    const numberOnlyPattern = '[0-9]+';
    const newValue = input.value + (isNaN(keyValue) ? '' : keyValue.toString());
    const match = newValue.match(numberOnlyPattern);

    if (+newValue > 100 || !match || newValue === '') {
      e.preventDefault();
    }
  }

  paymenttypeChange(event: MatRadioChange) {

    this.form.get("discount").setValue(0);
    this.form.get("gst").setValue([]);
    // this.gst.setValue(null);

    if(event.value == "emi") {
      this.form.get("dpamount").setValue(0);
      this.form.get("emitenure").setValue(6);
      this.form.get("emistartdate").setValue(new Date());
      this.form.get("actualemiamount").setValue(0);
      this.form.get("discount").setValue(0);
      this.form.get("emiamount").setValue(0);
      this.form.get("interest").setValue(0);
      
      this.emiCalculator();
    }
  }
  
  emiCalculator() {

    // Extracting value in the amount 
    // section in the variable
    var  amount = Number(this.form.get("price").value) - Number(this.form.get("dpamount").value);
    // console.log("amount", amount);

    const discountPrice = Math.round( (amount / 100 ) * this.form.get("discount").value);
    this.form.get("discountamount").setValue(discountPrice);
    // console.log("discountPrice", discountPrice);

    var loanAmount = Number(amount) - Number(discountPrice);
    // console.log("loanAmount", loanAmount)
  
    // Extracting value in the interest
    // rate section in the variable
    var rateOfInterest = Number(this.form.get("interest").value);
    // console.log("rateOfInterest", rateOfInterest);
  
    // Extracting value in the months 
    // section in the variable
    var numberOfMonths = Number(this.form.get("emitenure").value);
    // console.log("numberOfMonths", numberOfMonths);

    var calculatePrice = amount / numberOfMonths;
    this.form.get("actualemiamount").setValue(calculatePrice.toFixed(2));

    if(rateOfInterest == 0) {
      this.form.get("emiamount").setValue(calculatePrice.toFixed(2));
    } else {
      var monthlyInterestRatio = (rateOfInterest / 100) / 12;
      //console.log("monthlyInterestRatio", monthlyInterestRatio);
      var top = Math.pow((1 + monthlyInterestRatio), numberOfMonths);
      //console.log("top", top);
      var bottom = top - 1;
      //console.log("bottom", bottom);
      var sp = top / bottom;
      //console.log("sp", sp);
      var emi = ((loanAmount * monthlyInterestRatio) * sp);
      //console.log("emi", emi);

      var full = numberOfMonths * emi;
      var interest = full - loanAmount;
      var int_pge = (interest / full) * 100;

      this.form.get("emiamount").setValue(emi.toFixed(2));

      //console.log("emi", emi.toFixed(2))
    }
  }
  
}
