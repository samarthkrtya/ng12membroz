import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';
import { CommonDataService } from '../../../../core/services/common/common-data.service';

import { VehicleBookingListsComponent } from './components/vehicle-booking-lists/vehicle-booking-lists.component';

import swal from 'sweetalert2';
declare var $: any;


@Component({
  selector: 'app-vehicle-profile',
  templateUrl: './vehicle-profile.component.html',
  styles: [
  ]
})
export class VehicleProfileComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface {

  @ViewChild(VehicleBookingListsComponent, { static: false }) VehicleBooking: VehicleBookingListsComponent;

  dataContent: any = {};
  form: FormGroup;
  _id: any;
  insuranceno: any;
  company: any;
  expirydate: Date;
  submitted: boolean;
  disableBtn: boolean = false;
  functionPermission: any[] = [];
  tabPermission: any[] = [];

  contentVisibility: boolean = false;
  itemVisbility: boolean = false;
  sendMessageVisibility: boolean = false;

  bookingexpansion: boolean = false;


  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _commonDataService: CommonDataService,
  ) {

    super();

    this.pagename = "app-vehicle-profile";

    this.form = fb.group({
      '_id': [this._id],
      'insuranceno': [this.insuranceno, Validators.required],
      'company': [this.company, Validators.required],
      'expirydate': [this.expirydate],
    });

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this._formId = params["formid"] ? params["formid"] : "6119e76cdf4bcd2a04ecab1d";
      this.contentVisibility = false;
      this.itemVisbility = false;
    })
  }


  async ngOnInit() {

    this._route.params.forEach(async (params) => {
      await super.ngOnInit();
      try {
        await this.initializeVariables();
        await this.LoadData();
      } catch (err) {
        console.error(err);
      } finally {
      }
    })
  }

  async sendBooking() {
    this.bookingexpansion = false;
    setTimeout(() => {
      this.bookingexpansion = true;
      this.VehicleBooking.Addbooking();
    });
  }

  async initializeVariables() {
    this.dataContent = {};
    this.contentVisibility = false;

    if (this._loginUserRole && this._loginUserRole.permissions && this._loginUserRole.permissions.length !== 0) {
      var paymentObj = this._loginUserRole.permissions.find(p => p.formname == "customerasset")
      if (paymentObj && paymentObj.tabpermission) {
        this.tabPermission = paymentObj.tabpermission;
      }
      var permissionObj = this._loginUserRole.permissions.find(p => p.formname == "customerasset")
      if (permissionObj && permissionObj.functionpermission) {
        this.functionPermission = permissionObj.functionpermission;
      }
    }
    return;
  }

  Save() { }
  Update() { }
  Delete() { }
  ActionCall() { }

  async LoadData() {

    this.contentVisibility = false;

    let method = "POST";
    let url = "assets/filter/vehicle/view";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "datatype": "ObjectId", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {

        if (data) {
          this.dataContent = data[0];
          this.contentVisibility = true;
          this.itemVisbility = true;
          return;
        }
      }, (error) => {
        console.error(error);
      })
  }

  setInsurance() {
    this.form.controls['insuranceno'].setValue(this.dataContent.insurance[0].property.insuranceno);
    this.form.controls['company'].setValue(this.dataContent.insurance[0].property.company);
    this.form.controls['expirydate'].setValue(this.dataContent.insurance[0].property.expirydate);
    this.form.controls['_id'].setValue(this.dataContent.insurance[0]._id);
  }

  onSubmit(value: any, isValid: boolean) {
    this.submitted = true;
    if (!isValid) {
      this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
      return;
    } else {

      let postData = {};

      postData["onModel"] = "Asset";
      postData["onModelAddedby"] = "User";
      postData["formid"] = "61bac0b4a3756d5f6a2803f7";
      postData["contextid"] = this.dataContent._id;
      postData["property"] = {};
      postData["property"]["insuranceno"] = value.insuranceno;
      postData["property"]["company"] = value.company;
      postData["property"]["expirydate"] = value.expirydate;
      postData["property"]["description"] = value.description;
      postData["property"]["attachment"] = [];
      postData["property"]["contextid"] = this.dataContent._id;


      var url = "formdatas/" + value._id;
      var method = "PUT";

      this.disableBtn = true;

      if (value._id) {
        method = "PUT"
        this._commonService
          .commonServiceByUrlMethodDataAsync(url, method, postData)
          .then((data: any) => {
            if (data) {
              this.disableBtn = false;
              this.showNotification('top', 'right', 'Insurance has been updated successfully', 'success');

              $("#closeInsurance").click();
              this.form.reset();
              this.ngOnInit();

            }
          }, (error) => {
            this.disableBtn = false;
            console.error(error);
          });

      } else {

        var url = "formdatas"
        var method = "POST";

        this.disableBtn = true;
        this._commonService
          .commonServiceByUrlMethodDataAsync(url, method, postData)
          .then((data: any) => {

            if (data) {
              this.disableBtn = false;
              this.showNotification('top', 'right', 'Insurance has been added successfully', 'success');

              $("#closeInsurance").click();
              this.form.reset();
              this.ngOnInit();

            }
          }, (error) => {
            this.disableBtn = false;
            console.error(error);
          });
      }
    }
  }

  ngAfterViewInit() {

  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async getAvailabilityConfigurationData(submitData: any) {
    this.ngOnInit();
  }

  getSubmittedBookingData(submitData: any) {
    this.ngOnInit();
  }

  getSubmittedWarrentyData(submitData: any) {
    this.ngOnInit();
  }


}
