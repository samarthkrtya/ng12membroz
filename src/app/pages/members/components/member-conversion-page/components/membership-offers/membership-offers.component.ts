import { Component, OnInit } from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../../../shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-membership-offers',
  templateUrl: './membership-offers.component.html',
  styles: [
  ]
})
export class MembershipOffersComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface {

  isLoadingData: boolean;

  form: FormGroup;
  submitted: boolean;


  offername = new FormControl();
  membershipOfferLists: any[] = [];
  filteredOptions: Observable<string[]>;

  offeramount: any;
  offerutilizationperiod: Date;
  exception: any;
  remark: any;


  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
  ) { 

    super()

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
    })

    this.pagename = "app-membership-offers";

    this.form = this.fb.group({
      membershipoffer: this.fb.array([]) ,
    })

  }

  membershipoffer(): FormArray {
    return this.form.get("membershipoffer") as FormArray
  }

  async ngOnInit() {

    try {
      await super.ngOnInit();
      await this.initializeVariables()
      await this.getMembershipOffers()
      await this.LoadData()
      await this.getExistingData(this.bindId);
    } catch(error) {
      console.error(error);
    } finally {
    }

    this.filteredOptions = this.offername.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option?.title),
        map(option => option ? this._filter(option) : this.membershipOfferLists.slice())
      );

  }

  
  Save() {}
  Update() {}
  Delete() {}
  ActionCall() {}

  async initializeVariables() {
    this.isLoadingData = false;

    let frmArray = this.form.get('membershipoffer') as FormArray;
    frmArray.clear();
    
    //this.form.get("exception").setValue("yes");
    return;

  }

  async getMembershipOffers() {

    let method = "POST";
    let url = "formdatas/filter";

    let postData =  {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria":"eq" });
    postData["search"].push({ "searchfield": "formid", "searchvalue": "60deb6f4761d7a1cbf5df0e8", "criteria":"eq" });
    postData["search"].push({ "searchfield": "contextid", "searchvalue": false, "criteria": "exists", "datatype": "boolean" });
    
    //console.log("postData", postData);

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any)=>{
        if(data && data[0]) {
          //console.log("data", data);
          
          this.membershipOfferLists = [];
          this.membershipOfferLists = data;
          this.membershipOfferLists.map(p=>p.title = p.property.title)
          return;
        }
      }, (error)=>{
        console.error(error);
    })

  }

  private _filter(value: string): any[] {
    let results;
    if (value) {
      results = this.membershipOfferLists
        .filter(option => {
          if(option.title) {
            return option.title.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
        if (results.length < 1) {
          results = [];
        }
    } else {
      results = this.membershipOfferLists.slice();
    }
    return results;
  }

  displayFn(offer: any): string {
    return offer && offer.title ? offer.title : '';
  }

  optionSelected(option: any) {
  }
  
  async onSubmit(value: any, valid: boolean) {
    
    this.submitted = true;

    if (!valid) {
      super.showNotification("top", "right", "Validation Failed !!", "danger");
      return;
    } else {

      // console.log("value", value);
      // return;

      if(value && value.membershipoffer && value.membershipoffer.length > 0) {
        value.membershipoffer.forEach(async element => {

          let postData = {};
          postData["onModel"] = "Member";
          postData["onModelAddedby"] = "User";
          postData["formid"] = "60deb6f4761d7a1cbf5df0e8";
          postData["property"] = {};
          postData["property"]["offerid"] = element && element.offername && element.offername._id ? element.offername._id : element.offername;
          postData["property"]["title"] = value && element.offername && element.offername.title ? element.offername.title : element.offername;
          postData["property"]["type"] =  value && element.offername && element.offername.property && element.offername.property.type ? element.offername.property.type : element.offername;;
          postData["property"]["cost"] = element.offeramount;
          postData["property"]["quantity"] = 1;
          postData["property"]["date"] = new Date();
          postData["property"]["expirydate"] = new Date(element.offerutilizationperiod);
          postData["property"]["consumed"] = false;
          postData["property"]["exception"] = element.exception;
          postData["property"]["remark"] = element.remark;

          postData["contextid"] = this.bindId;
          postData["addedby"] = this._loginUserId;

          let method,url;
          
          if(element.id) {
            method = "PUT";
            url = "formdatas/"+element.id;

          } else {

            method = "POST";
            url = "formdatas";
          }

          

          await this.saveFormdata(url, method, postData);
          
        });  
      }

      setTimeout(() => {
        this.showNotification('top', 'right', `Membership offer has been added successfully !!!`, 'success');
        this.ngOnInit();  
      }, 1000);
      
    }
  }

  saveFormdata(url: any, method: any, postData: any) {

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any)=>{
        if(data) {
          // console.log("data", data);
          
          return;
        }
      }, (error)=>{
        console.error(error);
    })
  }

  newMembershipOffer(): FormGroup {
    return this.fb.group({
      id: [],
      offername: ['',{ validators: [Validators.required] }],
      offeramount: ['', { validators: [Validators.required] }],
      offerutilizationperiod: ['', { validators: [Validators.required] }],
      exception: [],
      remark: []
    })
  }
  
  async addMore() {
    // console.log("Adding a MembershipOffer");
    this.membershipoffer().push(this.newMembershipOffer());
  }

  removeembershipOffer(memberOfferIndex:number) {
    this.membershipoffer().removeAt(memberOfferIndex);
  }

  async LoadData() {

  }

  async getExistingData(id: any) {

    let method = "POST";
    let url = "formdatas/filter";

    let postData =  {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria":"eq" });
    postData["search"].push({ "searchfield": "contextid", "searchvalue": this.bindId, "criteria":"eq" });
    postData["search"].push({ "searchfield": "formid", "searchvalue": "60deb6f4761d7a1cbf5df0e8", "criteria":"eq" });
    

    // console.log("postData", postData);
    // console.log("method", method);
    // console.log("url", url);

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(async (data: any)=>{
        
        // console.log("data", data);

        if(data && data[0]) {

          let postData = {};
          postData["membershipoffer"] = [];

          data.forEach(async x => {
            
            await this.addMore();
            var membershipoffer = this.membershipOfferLists.find(p=>p._id == x.property.offerid);

            let obj = {};
            obj["id"] = x._id;
            obj["offername"] = membershipoffer;
            obj["offeramount"] = x.property.cost;
            obj["offerutilizationperiod"] = new Date(x.property.expirydate);
            obj["exception"] = x.property.exception;
            obj["remark"] = x.property.remark;
            postData["membershipoffer"].push(obj);
          })

          setTimeout(() => {
            // console.log("postData", postData);
            this.form.patchValue(postData);  
          });

          

          return;
        } else {
          await this.addMore();
        }
      }, (error)=>{
        console.error(error);
    })

  }
}
