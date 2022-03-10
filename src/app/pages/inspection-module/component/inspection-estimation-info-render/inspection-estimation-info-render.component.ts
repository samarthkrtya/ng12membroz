import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import swal from 'sweetalert2';
import {
  BasicValidators, ValidUrlValidator, OnlyNumberValidator, ValidMobileNumberValidator, OnlyNumberOrDecimalValidator,
  ValidPercValidator, equalValidator, matchingPasswords
} from '../../../../shared/components/basicValidators';

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import * as moment from 'moment';

import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';
import { BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


function autocompleteObjectValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (typeof control.value === 'string') {
      return { 'invalidAutocompleteObject': { value: control.value } }
    }
    return null  /* valid option selected */
  }
}


@Component({
  selector: 'app-inspection-estimation-info-render',
  templateUrl: './inspection-estimation-info-render.component.html',
  styles: [
    `

    `
  ]
})
export class InspectionEstimationInfoRenderComponent extends BaseComponemntComponent implements BaseComponemntInterface, OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  form: FormGroup;
  submitted: boolean;
  disableBtn: boolean = false;

  isLoading: boolean = false;

  _id: any;

  // customerid = new FormControl();
  // customeroptions: string[] = [];
  // filteredCustomerOptions: Observable<string[]>;
  // customerisLoadingBox: boolean = false;

  allCustomerLists: any[] = [];
  assetVisible: boolean = true;
  assetid = new FormControl();
  assetoptions: string[] = [];
  filteredAssetOptions: Observable<string[]>;
  allAssetLists: any[] = [];
  // customerWiseAssetLists: any[] = [];
  assetisLoadingBox: boolean = false;


  date: Date = new Date();
  mindate: Date = new Date();


  advisorid = new FormControl();
  adviceroptions: string[] = [];
  filteredAdvicerOptions: Observable<string[]>;
  allAdvicerLists: any[] = [];
  advicerisLoadingBox: boolean = false;


  inspectionid = new FormControl();
  inspectionoptions: string[] = [];
  filteredInspectionOptions: Observable<string[]>;
  allInspectionLists: any[] = [];
  customerWiseInspection: any[] = [];
  inspectionisLoadingBox: boolean = false;

  bindid: any;
  custId: any;
  estimationDetails: any = {};

  workinghours: any = {};
  holidayLists: any[] = [];


  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
  ) {
    super()

    this.form = fb.group({
      '_id': [this._id],
      // 'customerid': [this.customerid, { validators: [autocompleteObjectValidator(), Validators.required] }],
      'assetid': [this.assetid, { validators: [autocompleteObjectValidator(), Validators.required] }],
      'date': [this.date, Validators.required],
      'advisorid': [this.advisorid, { validators: [autocompleteObjectValidator(), Validators.required] }],
      'inspectionid': [this.inspectionid],
    });

    this._route.params.forEach((params) => {
      this.bindid = params["id"];
      this.custId = params["cid"];
      this.pagename = 'app-inspection-estimation-info-render';
    });

  }

  public validation_msgs = {

    // 'customerid': [
    //   { type: 'invalidAutocompleteObject', message: 'Customer name not recognized. Click one of the autocomplete options.' },
    //   { type: 'required', message: 'Customer is required.' }
    // ],

    'assetid': [
      { type: 'invalidAutocompleteObject', message: 'Asset name not recognized. Click one of the autocomplete options.' },
      { type: 'required', message: 'Asset is required.' }
    ],

    'advisorid': [
      { type: 'invalidAutocompleteObject', message: 'Advicer name not recognized. Click one of the autocomplete options.' },
      { type: 'required', message: 'Advicer is required.' }
    ],

    // 'inspectionid': [
    //   { type: 'invalidAutocompleteObject', message: 'Inspection name not recognized. Click one of the autocomplete options.' },
    //   { type: 'required', message: 'Inspection is required.' }
    // ],


  }

  async ngOnInit() {
    try {
      await super.ngOnInit()
      await this.initializeVariables()
      await this.getAllCustomer()
      await this.getAllVehicle()
      await this.getAllAdvicer()
      await this.getAllInspection()
      await this.getAllHolidays()


    } catch (error) {
      console.error(error);
    } finally {


      if (this.custId) {
        var assetObj = this.allAssetLists.find(p => p.customerid._id == this.custId);
        if (assetObj) {
          this.assetid.setValue(assetObj);
        }
        
      }

      this.isLoading = false;

      if (this.bindid) {
        await this.getvehicleDetails(this.bindid)
        await this.getEstimationById(this.bindid)
      }

     

      this.filteredAssetOptions = this.assetid.valueChanges
        .pipe(
          startWith(''),
          map(option => typeof option === 'string' ? option : option.title),
          map(option => option ? this._assetfilter(option) : this.allAssetLists.slice())
        );


      this.filteredAdvicerOptions = this.advisorid.valueChanges
        .pipe(
          startWith(''),
          map(option => typeof option === 'string' ? option : option.fullname),
          map(option => option ? this._advicerfilter(option) : this.allAdvicerLists.slice())
        );


      this.filteredInspectionOptions = this.inspectionid.valueChanges
        .pipe(
          startWith(''),
          map(option => typeof option === 'string' ? option : option.formname),
          map(option => option ? this._inspectionfilter(option) : this.customerWiseInspection.slice())
        );
    }

  }

  async LoadData() { }
  async Save() { }
  async Update() { }
  async Delete() { }
  async ActionCall() { }

  myFilter = (d: Date): boolean => {

    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dayName = days[new Date(d).getDay()];

    return this.isInArray(this.holidayLists, d) && this.workinghours.days.includes(dayName);
  }

  isInArray(array: any, value: Date) {
    var check = array.find(item => new Date(item.date).toDateString() == new Date(value).toDateString())
    if (check) {
      return false
    } else {
      return true
    }
  }

  async initializeVariables() {


    this.isLoading = true;

    this.allCustomerLists = [];
    this.allAssetLists = [];
    // this.customerWiseAssetLists = [];
    this.allAdvicerLists = [];
    this.allInspectionLists = [];
    this.customerWiseInspection = [];
    this.estimationDetails = {};

    this.workinghours = {};
    this.workinghours = this._loginUserBranch.workinghours;
    this.holidayLists = [];

    this.form.controls['date'].setValue(new Date());

    this.assetVisible = true;

    return;
  }

  async getAllHolidays() {

    var url = "common/viewcalendar/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    //postData["search"].push({ "searchfield": "branchid", "searchvalue": this._loginUserBranchId, "criteria": "eq", "datatype": "ObjectId" });
    postData["search"].push({ "searchfield": "date", "searchvalue": new Date(this.date.getFullYear(), 0, 1), "criteria": "gte", "datatype": "Date", "cond": "and" });
    postData["search"].push({ "searchfield": "date", "searchvalue": new Date(this.date.getFullYear() + 1, 0, 1), "criteria": "lte", "datatype": "Date", "cond": "and" });
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });
    postData["search"].push({ "searchfield": "type", "searchvalue": "holiday", "criteria": "eq", "datatype": "text" });



    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {

          this.holidayLists = [];
          this.holidayLists = data;
          return;
        }
      }, (error) => {
        console.error(error);
      });

  }

  async getvehicleDetails(id: any) {

    var url = "assets/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindid, "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data && data[0]) {

          this.assetid.setValue(data[0]);

          this.disableBtn = false;

          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  async getEstimationById(id: any) {

    var url = "quotations/filter";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": '_id', "searchvalue": id, "criteria": "eq" });

    

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {

        

        if (data && data[0]) {

          this.estimationDetails = {};
          this.estimationDetails = data[0];

          

          this.form.controls['_id'].setValue(this.estimationDetails._id);


          if (this.estimationDetails && this.estimationDetails.property && this.estimationDetails.property.assetid) {
            var assetObj = this.allAssetLists.find(p => p._id == this.estimationDetails.property.assetid);
            if (assetObj) {
              this.assetid.setValue(assetObj);
              this.customerWiseInspection = this.allInspectionLists.filter(p => p.assetid == assetObj._id);
            }

          }

          this.form.controls['date'].setValue(new Date(this.estimationDetails.date));

          if (this.estimationDetails && this.estimationDetails.advisorid) {
            this.advisorid.setValue(this.estimationDetails.advisorid);
          }

          if (this.estimationDetails && this.estimationDetails.property && this.estimationDetails.property.inspectionid) {
            var inspectionObj = this.customerWiseInspection.find(p => p._id == this.estimationDetails.property.inspectionid);
            if (inspectionObj) {
              this.inspectionid.setValue(inspectionObj);
            }

          }


          return;
        }
      }, (error) => {
        console.error(error);
      });


  }


  async onDelete() {
    
    if (!this.bindid) {
      swal.fire({
        title: 'Not able to delete ',
        text: 'Delete payment first !',
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: 'Got it!',
        customClass: {
          confirmButton: "btn btn-success",
        },
        buttonsStyling: false
      }).then(async (result) => {
        if (result) {
          this._router.navigate(['/pages/inspection-module/inspection-estimation-info']);
        }
      });
    } 
    else {
      let method = "DELETE";
      let url = "quotations/";

      swal.fire({
        title: 'Are you sure ?',
        text: 'You will not be able to revert this !',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete it!',
        cancelButtonText: 'No',
        customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger",
        },
        buttonsStyling: false
      }).then(async (result) => {
        if (result.value) {

          this.disableBtn = true;
          await this._commonService
            .commonServiceByUrlMethodIdOrDataAsync(url, method, this.bindid)
            .then(data => {
              if (data) {
                this.showNotification('top', 'right', 'Schedule deleted successfully !!', 'success');
                this._router.navigate(['/pages/dynamic-list/list/estimate']);
                this.disableBtn = false;
              }
            }).catch((error) => {
              console.error(error);
              this.disableBtn = false;
              this.showNotification('top', 'right', 'Something went wrong !!', 'danger');
            });
        }
      });
      
    }
  }

  async getAllCustomer() {

    var url = "prospects/filter";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.allCustomerLists = [];
          this.allCustomerLists = data;
          return;
        }
      }, (error) => {
        console.error(error);
      });

  }

  async getAllVehicle() {

    var url = "assets/filter";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {

          this.allAssetLists = [];
          this.allAssetLists = data;
          this.allAssetLists.map(p => p.src = p.profilepic ? p.profilepic : '../../assets/img/default-avatar.png')

          
          //this.customerWiseAssetLists = [];

          return;
        }
      }, (error) => {
        console.error(error);
      });

  }

  async getAllAdvicer() {

    var url = "users/filter";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.allAdvicerLists = [];
          this.allAdvicerLists = data;
          return;
        }
      }, (error) => {
        console.error(error);
      });

  }

  async getAllInspection() {

    var url = "formdatas/view/filter";
    var method = "POST";

    let postData = {};
    postData['viewname'] = "inspectionviews";
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {

          this.allInspectionLists = [];
          this.customerWiseInspection = [];
          this.allInspectionLists = data;

          if (this.assetid.value) {
            this.customerWiseInspection = this.allInspectionLists.filter(p => p.assetid == this.assetid.value._id);
          }

          return;
        }
      }, (error) => {
        console.error(error);
      });

  }

  onSubmit(value: any, isValid: boolean) {
    this.submitted = true;
    if (!isValid) {
      this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
      return false;
    } else {

      this.disableBtn = true;

      let postData = {};
      postData['advisorid'] = value.advisorid.value._id;
      postData['customerid'] = value.assetid.value.customerid._id;
      postData['onModel'] = "Prospect";
      postData['date'] = value.date;
      postData['type'] = "service";
      postData['property'] = {}
      postData['property']['assetid'] = value.assetid.value._id;

      if (value.inspectionid.value) {
        postData['property']['inspectionid'] = value.inspectionid.value._id;
      }

      if (value._id) {

        postData['_id'] = value._id;


        postData['items'] = this.estimationDetails.items;
        postData['services'] = this.estimationDetails.services;
        postData['prefix'] = this.estimationDetails.prefix;
        postData['amount'] = this.estimationDetails.amount;
        postData['totalamount'] = this.estimationDetails.totalamount;
        postData['taxamount'] = this.estimationDetails.taxamount;
        postData['taxdetail'] = this.estimationDetails.taxdetail;
        postData['discount'] = this.estimationDetails.discount;


        var url = "quotations/" + value._id
        var method = "PUT";

        return this._commonService
          .commonServiceByUrlMethodDataAsync(url, method, postData)
          .then((data: any) => {
            if (data) {

              super.showNotification("top", "right", "Estimation has been updated successfully !!", "success");
              this._router.navigate(['/pages/inspection-module/estimation/' + data._id]);

              return;
            }
          }, (error) => {
            console.error(error);
          });


      } else {
        var url = "quotations";
        var method = "POST";

        return this._commonService
          .commonServiceByUrlMethodDataAsync(url, method, postData)
          .then((data: any) => {
            if (data) {

              super.showNotification("top", "right", "Estimation has been added successfully !!", "success");
              this._router.navigate(['/pages/inspection-module/estimation/' + data._id]);

              return;
            }
          }, (error) => {
            console.error(error);
          });

      }





    }

  }

  
  enterAsset() {
    const controlValue = this.assetid.value;
    this.assetid.setValue(controlValue);
  }

  preloadAssetdata() {
    if (this.allAssetLists && this.allAssetLists.length == 0) {
      this.getAllVehicle()
    }
  }

  handleEmptyAssetInput(event: any) {
    if (event.target.value === '') {
      this.assetid.setValue("");
      this.allAssetLists = [];
      //this.customerWiseAssetLists = [];
    }
  }

  displayAssetFn(user: any): string {
    return user && user.title ? user.title : '';
  }

  optionAssetSelected(option: any) {
    this.assetid.setValue(option.value);
    this.customerWiseInspection = this.allInspectionLists.filter(p => p.assetid == option.value._id);
  }

  private _assetfilter(value: string): string[] {
    let results;
    if (value) {
      results = this.allAssetLists
        .filter(option => {

          if (option.title && option.customerid && option.customerid.fullname) {
            return (option.title.toLowerCase().indexOf(value.toLowerCase()) > -1) || (option.customerid.fullname.toLowerCase().indexOf(value.toLowerCase()) > -1)
          } else if (option.title) {
            return option.title.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
      if (results.length < 1) {
        results = [];
      }
    } else {
      results = this.allAssetLists.slice();
    }
    return results;
  }

  enterAdvicer() {
    const controlValue = this.advisorid.value;
    this.advisorid.setValue(controlValue);
  }

  preloadAdvicerdata() {
    if (this.allAdvicerLists && this.allAdvicerLists.length == 0) {
      this.getAllAdvicer()
    }
  }

  handleEmptyAdvicerInput(event: any) {
    if (event.target.value === '') {
      this.advisorid.setValue("");
      this.allAdvicerLists = [];
    }
  }

  displayAdvicerFn(user: any): string {
    return user && user.fullname ? user.fullname : '';
  }

  optionAdvicerSelected(option: any) {
    this.advisorid.setValue(option.value);
  }

  private _advicerfilter(value: string): string[] {
    let results;
    if (value) {
      results = this.allAdvicerLists
        .filter(option => {
          if (option.fullname) {
            return option.fullname.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
      if (results.length < 1) {
        results = [];
      }
    } else {
      results = this.allAdvicerLists.slice();
    }
    return results;
  }

  enterInspection() {
    const controlValue = this.inspectionid.value;
    this.inspectionid.setValue(controlValue);
  }

  preloadInspectiondata() {
    if (this.customerWiseInspection && this.customerWiseInspection.length == 0) {
      this.getAllInspection()
    }
  }

  handleEmptyInspectionInput(event: any) {
    if (event.target.value === '') {
      this.inspectionid.setValue("");
      this.customerWiseInspection = [];
    }
  }

  displayInspectionFn(user: any): string {
    return user && user.formname ? user.formname : '';
  }

  optionInspectionSelected(option: any) {
    this.inspectionid.setValue(option.value);
  }

  private _inspectionfilter(value: string): string[] {
    let results;
    if (value) {
      results = this.customerWiseInspection
        .filter(option => {
          if (option.formname) {
            return option.formname.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
      if (results.length < 1) {
        results = [];
      }
    } else {
      results = this.customerWiseInspection.slice();
    }
    return results;
  }

  async getSubmittedData(submit_data: any) {
    try {
      await this.getAllVehicle();
      await this.fillAsset(submit_data);
    } catch(error) {
      console.error(error)
    }
  }

  async fillAsset(data: any) {
    this.assetVisible = false;
    setTimeout(() => {
      var assetObj = this.allAssetLists.find(p=>p._id == data.value);
      if(assetObj) {
        this.assetid.setValue(assetObj);
      }
      this.assetVisible = true;  
    });
  }

  onEvent(option: any, event: any) {
    event.stopPropagation();
    this._router.navigate([]).then(result => {  window.open( `/pages/inspection-module/inspection-view/${option._id}`, '_blank'); });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

}

