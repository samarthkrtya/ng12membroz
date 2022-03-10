import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { BasicValidators } from 'src/app/shared/components/basicValidators';

import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-make-event',
  templateUrl: './make-event.component.html'
})
export class MakeEventComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface {

  destroy$: Subject<boolean> = new Subject<boolean>();

  form: FormGroup;
  submitted: boolean;
  isLoadingdata: boolean;
  bindid: any;

  today: Date = new Date();

  taxesList: any[] = [];

  submitVisibility: boolean = false;


  type_fields = {
    fieldname: "location",
    fieldtype: "formdata",
    search: [
      { searchfield: "status", searchvalue: "active", criteria: "eq" },
      { searchfield: "formid", searchvalue: "607d1008b849721088623fce", criteria: "eq" },
    ],
    formname: "eventlocation",
    form: {
      formfield: "_id",
      displayvalue: "property.name",
    },
    select: [
      { fieldname: "_id", value: 1 },
      { fieldname: "property.name", value: 1 },
      { fieldname: "property.image", value: 1 },
      { fieldname: "property.type", value: 1 },
    ],
    dbvalue: "",
    autocomplete : true,
  }

  

  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,
  ) {
    super();

    this.form = fb.group({
      'title': [, Validators.required],
      'description': [],
      'location': [, Validators.compose([Validators.required])],
      'capacity': [],
      'eventtype': ['singleday', Validators.required],
      // 'chargable': [false],
      'startdate': [],
      'enddate': [],
      'starttime': [],
      'endtime': [],
      // 'cost': [, OnlyPositiveNumberValidator.insertonlypositivenumber],
      // 'taxes': [],
      'attachments': [],
    });

    this._route.params.forEach((params) => {
      this.bindid = params["id"];
    });

    this._formName = "event";
  }

  async ngOnInit() {
    try {
      this.isLoadingdata = true;
      await super.ngOnInit();
      await this.initializeVariables();
      await this.getTaxes();
      if (this.bindid) {
        await this.LoadData();
      }
      this.isLoadingdata = false;
    } catch (error) {
      this.isLoadingdata = false;
      console.error(error);
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    return;
  }

  async getTaxes() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    let method = "POST";
    let url = "taxes/filter";

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any[]) => {
        this.taxesList = data;
      });
  }

  inputModelChangeValue(event: any) {
  }

  Save() { }
  Update() { }
  Delete() { }
  ActionCall() { }

  async LoadData() {

    let method = "POST";
    let url = "events/filter";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });
    postData['search'].push({ "searchfield": '_id', "searchvalue": this.bindid, "criteria": "eq" });

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((responsedata: any) => {
        if(responsedata && responsedata[0]) {

          var data = responsedata[0];

          this.form.controls['title'].setValue(data.title);
          this.form.controls['location'].setValue(data.location);
          this.type_fields.dbvalue = data.location;

          this.form.controls['description'].setValue(data.property.description);
          this.form.controls['capacity'].setValue(data.property.capacity);
          this.form.controls['eventtype'].setValue(data.property.eventtype);
          this.form.controls['startdate'].setValue(data.property.startdate);
          this.form.controls['enddate'].setValue(data.property.enddate);
          this.form.controls['starttime'].setValue(data.property.starttime);
          this.form.controls['endtime'].setValue(data.property.endtime);
        }
      });

  }

  public async onSubmit(value: any, valid: boolean) {
    this.submitted = true;
    if (!valid) {
      this.showNotification("top", "right", "Validation failed !!", "danger");
      return;
    }

    let method = this.bindid ? "PUT" : "POST";
    let url = "events/";
    var model = {};
    model['formname'] = "event";
    model['title'] = value.title;
    model['location'] = value.location ? value.location._id : null;
    // model['chargable'] = value.chargable;

    model['property'] = {};
    model['property']['capacity'] = value.capacity;
    model['property']['description'] = value.description;
    model['property']['eventtype'] = value.eventtype;
    model['property']['startdate'] = new Date(value.startdate);
    model['property']['enddate'] = new Date(value.enddate);

    if (value.starttime) {
      model['property']['starttime'] = value.starttime;
    }
    if (value.endtime) {
      model['property']['endtime'] = value.endtime;
    }

    this.submitVisibility = true;
    // console.log("model", model);
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, this.bindid)
      .then(data => {
        console.log("data", data)
        if (data) {
          this.showNotification('top', 'right', 'Event added successfully!!!', 'success');
          this._router.navigate(['/pages/dynamic-list/list/event']);
          this.submitVisibility = false;
        }
      }).catch((e) => {
        console.error(e);
        this.submitVisibility = false;
      });
  }

  getSubmittedData(submit_data: any) {
    this.type_fields.autocomplete = false;
    this.type_fields.dbvalue = submit_data.value;
    setTimeout(() => {
      this.type_fields.autocomplete = true;
    });
  }



  setdigit(val: number) {
    var ret;
    if (val <= 9) {
      ret = `0${val}`;
    } else {
      ret = `${val}`;
    }
    return ret;
  }

}
