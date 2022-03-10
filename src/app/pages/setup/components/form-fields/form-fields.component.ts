import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators, AbstractControl } from '@angular/forms';

import { Subscription } from 'rxjs';

import {  BaseComponemntComponent, BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';

import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {copyArrayItem} from '@angular/cdk/drag-drop';

import { Fields } from '../../../../core/models/fields/mock-fields';
import { SpecialFields } from '../../../../core/models/fields/mock-specialfields';
import { FormfieldModel } from '../../../../core/models/fields/formfield.model';


import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

declare var $: any;
import swal from 'sweetalert2';

@Component({
  selector: 'app-form-fields',
  templateUrl: './form-fields.component.html',
  styles: [`
    .example-list {
      border: solid 1px #ccc;
      min-height: 60px;
      background: white;
      border-radius: 4px;
      overflow: hidden;
      display: block;
    }
    .cdk-drop-list-dragging .cdk-drag {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    /* Animate an item that has been dropped. */
    .cdk-drag-animating {
      transition: transform 300ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drag-disabled {
      background: #ccc !important;
      cursor: default;
    }
`
  ]
})

export class FormFieldsComponent extends BaseComponemntComponent implements BaseComponemntInterface, OnInit {

  toppings = new FormControl();
  subs = new Subscription();

  _formfieldModel = new FormfieldModel();

  fieldLists: any [] = [];
  specialFieldLists: any [] = [];

  fields: any[] = [];

  form: FormGroup;
  submitted: boolean;
  isdisablesavebutton: boolean = false;

  lookupdata: FormArray;

  mylookupControl = new FormControl();
  lookupOptions: any[] = [];
  lookupFilteredOptions: Observable<string[]>;
  isLookupLoadingBox: boolean = false;

  myformControl = new FormControl();
  formsOptions: any[] = [];
  formsFilteredOptions: Observable<string[]>;
  isFormLoadingBox: boolean = false;

  myFormFieldControl = new FormControl();
  formfieldOptions: any[] = [];
  formfieldFilteredOptions: Observable<string[]>;
  isFormFieldLoadingBox: boolean = false;

  mydisplayFieldControl = new FormControl();
  displayfieldOptions: any[] = [];
  displayFieldFilteredOptions: Observable<string[]>;
  isDisplayFieldLoadingBox: boolean = false;

  myparentFieldControl = new FormControl();
  parentfieldOptions: any[] = [];
  parentFieldFilteredOptions: Observable<string[]>;
  isParentFieldLoadingBox: boolean = false;

  myfieldFilterControl = new FormControl();
  fieldfilterOptions: any[] = [];
  fieldFilterFilteredOptions: Observable<string[]>;
  isFieldFilterLoadingBox: boolean = false;

  myFieldFilterValueControl = new FormControl();

  myTemplateControl = new FormControl();

  onceUsedFieldLists: any [] = [];
  sectionLists: any [] = [];
  section: any [] = [];

  subscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
  ) {

    super();

    this._route.params.forEach((params) => {
      this._formName = params["formname"];
    })


    this.form = fb.group({
      '_id': [this._formfieldModel._id],
      'id': [this._formfieldModel.id],
      'sectionname': [this._formfieldModel.sectionname],
      'sectiondisplayname': [this._formfieldModel.sectiondisplayname],
      'fieldname': [this._formfieldModel.fieldname],
      'fieldtype': [this._formfieldModel.fieldtype],
      'multiselect': [this._formfieldModel.multiselect],
      'displayname': [this._formfieldModel.displayname, Validators.required],
      'defaultvalue': [this._formfieldModel.defaultvalue],
      'min': [this._formfieldModel.min],
      'max': [this._formfieldModel.max],
      'maxlength': [this._formfieldModel.maxlength],
      'required': [this._formfieldModel.required, Validators.required],
      'lookupdata': new FormArray([]),
      'colspan': [this._formfieldModel.colspan, Validators.required],
    });
  }

  createLookup(): FormGroup {
    return this.fb.group({
      key: ['', [Validators.required]],
      value: ['', [Validators.required]],
    });
  }

  async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.initializeVariables()
      await this.LoadData();
      await this.fieldsSettings()
      await this.loadLookups()
      await this.loadForms()
    } catch(error) {
      console.error(error)
    } finally {

      this.lookupFilteredOptions = this.mylookupControl.valueChanges
        .pipe(
          startWith(''),
          map(option => typeof option === 'string' ? option : option.lookup),
          map(option => option ? this._lookupfilter(option) : this.lookupOptions.slice())
      );

      this.formsFilteredOptions = this.myformControl.valueChanges
        .pipe(
          startWith(''),
          map(option => typeof option === 'string' ? option : option.formname),
          map(option => option ? this._formsfilter(option) : this.formsOptions.slice())
      );

      this.formfieldFilteredOptions = this.myFormFieldControl.valueChanges
        .pipe(
          startWith(''),
          map(option => typeof option === 'string' ? option : option.key),
          map(option => option ? this._formFieldfilter(option) : this.formfieldOptions.slice())
      );

      this.displayFieldFilteredOptions = this.mydisplayFieldControl.valueChanges
        .pipe(
          startWith(''),
          map(option => typeof option === 'string' ? option : option.key),
          map(option => option ? this._displayFieldfilter(option) : this.formfieldOptions.slice())
      );

      this.parentFieldFilteredOptions = this.myparentFieldControl.valueChanges
        .pipe(
          startWith(''),
          map(option => typeof option === 'string' ? option : option.key),
          map(option => option ? this._parentFieldfilter(option) : this.formfieldOptions.slice())
      );

      this.fieldFilterFilteredOptions = this.myfieldFilterControl.valueChanges
        .pipe(
          startWith(''),
          map(option => typeof option === 'string' ? option : option.key),
          map(option => option ? this._fieldFieldfilter(option) : this.formfieldOptions.slice())
      );
    }
  }

  Update() {}
  Delete() {}
  ActionCall() {}

  async initializeVariables() {

    this.fieldLists = [];
    if(Fields && Fields.length > 0) {
      Fields.forEach(element => {
        element.id = ""
        this.fieldLists.push(element);
      });
    }

    this.specialFieldLists = [];
    if(SpecialFields && SpecialFields.length > 0) {
      SpecialFields.forEach(element => {
        element.id = ""
        this.specialFieldLists.push(element);
      });
    }

    this.fields = [];
    this.isdisablesavebutton = false;
    this.isLookupLoadingBox = false;
    this.isFormLoadingBox = false;

    this.formfieldOptions = [];
    this.isFormFieldLoadingBox = false;

    this.parentfieldOptions = []
    this.isParentFieldLoadingBox = false;

    this.displayfieldOptions = []
    this.isDisplayFieldLoadingBox = false;

    this.fieldfilterOptions = [];
    this.isFieldFilterLoadingBox = false;

    this.onceUsedFieldLists = [ "fullname", "primaryemail", "secondaryemail", "mobile", "alternatenumber", "whatsappnumber" ];

    this.sectionLists = [];
    this.section = [];


    var template = `<div 
          class='media py-2 member-profile-item cursor-pointer'>
    
          <div class='media-body'>
    
              <div class='d-flex'>
                  <div class='flex-grow-1'>
                      <div class='font-500 mb-1'>
                          <span> $[{autocomplete_displayname}]</span>
                          <span> | $[{customerid.fullname}]</span>
                      </div>
                  </div>
                  <div class='fc-today-button font-500'>
                      <i class='material-icons'> face </i>
                  </div>
              </div>
    
              <div class='d-flex'>
                  <div class='flex-grow-1'>
                      $[{customerid.property.mobile}]
                  </div>
                  <div class='fc-today-button font-14'>
                      $[{customerid.property.primaryemail}]
                  </div>
              </div>
          </div>
      </div>`;

          this.myTemplateControl.setValue(template);

    return;
  }

  async LoadData() {

    var url = "formfields/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({"searchfield": "status", "searchvalue": "active", "criteria": "eq"});
    postData["search"].push({"searchfield": "formname", "searchvalue": this._formName, "criteria": "eq"});
    postData["sort"] = "formorder";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if(data){
          this.fields = [];
          this.fields = data;
          return;
        }
    }, (error) =>{
      console.error(error);
    });
  }

  async fieldsSettings() {

    this.fields.forEach(element => {
      if(element && element.fieldtype) {
        var fieldObject = this.onceUsedFieldLists.find(p=>p == element.fieldtype)
        if(fieldObject) {
          var specialFieldObj = this.specialFieldLists.find(p=>p.fieldtype == element.fieldtype);
          if(specialFieldObj) specialFieldObj.disabled = true;
        }
      }
    });

    this.sectionLists = [];
    this.sectionLists = this.groupBy(this.fields, 'sectionname');

    console.log("sectionLists", this.sectionLists);

    this.sectionLists.forEach(element => {
      this.section.push({ "sectionname": element[0]['sectionname'], "sectiondisplayname": element[0]['sectiondisplayname'] })
    });
    return;
  }

  drop(event: CdkDragDrop<any>) {

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else if(event.previousContainer.id == "specialfield" || event.previousContainer.id == "simplefield") {

      copyArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

      this.sectionLists.forEach(ele => {

        var fieldObj = ele.find(p=>p.id == "");
        if(fieldObj) {

          var sectionObj = this.section.find(p=>p.sectionname == event.container.id)
          fieldObj['id'] = this.uuid();
          fieldObj['sectionname'] = event.container.id;
          fieldObj['sectiondisplayname'] = sectionObj?.sectiondisplayname;
          this._formfieldModel = fieldObj;

          console.log("_formfieldModel", this._formfieldModel)

          this.form.get('id').setValue(this._formfieldModel.id);
          this.form.get('sectionname').setValue(this._formfieldModel.sectionname);
          this.form.get('sectiondisplayname').setValue(this._formfieldModel.sectiondisplayname);
          this.form.get('required').setValue(this._formfieldModel.required);
          this.form.get('fieldtype').setValue(this._formfieldModel.fieldtype);
          this.form.get('min').setValue(this._formfieldModel.min);
          this.form.get('max').setValue(this._formfieldModel.max);
          this.form.get('maxlength').setValue(this._formfieldModel.maxlength);
          this.form.get('multiselect').setValue(this._formfieldModel.multiselect);
          this.form.get('colspan').setValue(this._formfieldModel.colspan);

          this.myformControl = new FormControl();
          this.myFormFieldControl = new FormControl();
          this.mydisplayFieldControl = new FormControl();
          this.myparentFieldControl = new FormControl();
          this.myfieldFilterControl = new FormControl();
          this.myTemplateControl = new FormControl();

          var template = `<div 
          class='media py-2 member-profile-item cursor-pointer'>
    
          <div class='media-body'>
    
              <div class='d-flex'>
                  <div class='flex-grow-1'>
                      <div class='font-500 mb-1'>
                          <span> $[{autocomplete_displayname}]</span>
                          <span> | $[{customerid.fullname}]</span>
                      </div>
                  </div>
                  <div class='fc-today-button font-500'>
                      <i class='material-icons'> face </i>
                  </div>
              </div>
    
              <div class='d-flex'>
                  <div class='flex-grow-1'>
                      $[{customerid.property.mobile}]
                  </div>
                  <div class='fc-today-button font-14'>
                      $[{customerid.property.primaryemail}]
                  </div>
              </div>
          </div>
      </div>`;

          this.myTemplateControl.setValue(template);

          
  
          const defaultvalue = <FormControl>this.form.get('defaultvalue');
          const maxlength = <FormControl>this.form.get('maxlength');
          const min = <FormControl>this.form.get('min');
          const max = <FormControl>this.form.get('max');

          console.log("this._formfieldModel.fieldtype", this._formfieldModel.fieldtype)

          if (this._formfieldModel.fieldtype == "readonly" ) {
            defaultvalue.setValidators([Validators.required, ])
            maxlength.setValidators(null);
            min.setValidators(null);
            max.setValidators(null);
          } else if (this._formfieldModel.fieldtype == "number") {
            defaultvalue.setValidators(null);
            maxlength.setValidators(null);
            min.setValidators([Validators.required]);
            max.setValidators([Validators.required]);
          } else if (this._formfieldModel.fieldtype == "mobile" ||  this._formfieldModel.fieldtype == "alternatenumber") {
            defaultvalue.setValidators(null);
            maxlength.setValidators([Validators.required, ])
            min.setValidators(null);
            max.setValidators(null);
          } else {
            defaultvalue.setValidators(null);
            maxlength.setValidators(null);
            min.setValidators(null);
            max.setValidators(null);
          }

          defaultvalue.updateValueAndValidity();
          maxlength.updateValueAndValidity();
          min.updateValueAndValidity();
          max.updateValueAndValidity();

          $("#addFieldBtn").click();
        }

      });
    } else {

      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);

        var fieldSectionNameObj = this.fields.find(p=>p.sectionname == event.container.id)
        if(fieldSectionNameObj){
          var fieldObj = this.fields.find(p=>p._id == event.container.data[event.currentIndex]['_id'])
          if(fieldObj) {
            fieldObj.sectionname = event.container.id;
            fieldObj.sectiondisplayname = fieldSectionNameObj.sectiondisplayname;
            this.patchField(fieldObj);
          }
        }
        this.sectionLists = this.groupBy(this.fields, 'sectionname');
    }
  }

  noReturnPredicate() {
    return false;
  }

  onSubmit(value: any, isValid: boolean) {
    this.submitted = true;

    if (!isValid) {
      return false;
    } else {

      this.isdisablesavebutton = true;
      
      if(value && value.sectionname && value.sectionname.includes("default_group_")) {
        var fieldObj = this.fields.find(p=>p.sectionname == value.sectionname);

        if(fieldObj) {
          
          this._formfieldModel = fieldObj;

          let obj = {};
          obj = value;
          
          //obj["displayname"] = value.displayname.substring(0, 50),
          obj["displayname"] = value.displayname,
          obj["maxlength"] = value.maxlength,
          obj["min"] = value.min,
          obj["max"] = value.max,
          obj["fieldname"] = this.getFieldName(value.fieldtype, value.displayname),
          obj["lookupdata"] = this.lookupdata?.value;
          obj["form"] = undefined;
          obj["lookupfieldid"] = undefined;

          if(this.mylookupControl && this.mylookupControl.value)  {
            obj["lookupfieldid"] = this.mylookupControl?.value._id;
          }

          obj["defaultvalue"] = value.fieldtype == "readonly" ? value.defaultvalue : undefined;

          if(this.myformControl && this.myformControl.value) {
            obj["form"] = {};
            obj["form"]["formfield"] = this.myFormFieldControl.value.key;
            obj["form"]["displayvalue"] = this.mydisplayFieldControl.value.key;
            obj["form"]["parentvalue"] = this.myparentFieldControl.value.key;
            obj["form"]["fieldfilter"] = this.myfieldFilterControl.value.key;
            obj["form"]["template"] = this.myTemplateControl.value;
            obj["form"]["fieldfiltervalue"] = this.myFieldFilterValueControl.value;
            obj["form"]["formname"] = this.myformControl.value.formname;
            obj["form"]["apiurl"] = this.myformControl.value.schemaname + "/filter";
            obj["form"]["formid"] = this.myformControl.value._id;
          }

          if(!this._formfieldModel.fields) {
            this._formfieldModel.fields = [];
          }
          
          var foundField = fieldObj.fields.find(x => x._id == value._id);
          
          if(foundField) {
            foundField = obj;
          } else {
            obj["_id"] =  this.uuid();
            this._formfieldModel.fields.push(obj);
          }

          var url = "formfields/" + this._formfieldModel._id
          var method = "PATCH";

          let fieldPostData = {};
          fieldPostData["fields"] = [];
          
          if(value._id) {
            fieldPostData["fields"] = this._formfieldModel.fields;
          } else {
            fieldPostData["fields"] = obj;
            fieldPostData["fieldsadd"] = true;
          }

          var url = "formfields/" + this._formfieldModel._id
          var method = "PATCH";
          
          this._commonService
            .commonServiceByUrlMethodData(url, method, fieldPostData)
            .subscribe( (data: any) => {
              if(data){
                $(".close").click();
                // this.cancelAction();
                // this.isdisablesavebutton = false;
                //console.log("data 1", data);
                this.UpdateOrder(data);
                return;
              }
          }, (error) =>{
            console.error(error);
          });
        }
      } else {

        this._formfieldModel = value;
        this._formfieldModel.sectionname = value.sectionname ? value.sectionname : "defaultsection-" + Math.random().toString(36).slice(-4);
        this._formfieldModel.sectiondisplayname = value.sectiondisplayname;
        this._formfieldModel.formname = this.formObj.formname;
        this._formfieldModel.formid = this.formObj._id;
        //this._formfieldModel.displayname = value.displayname.substring(0, 50),
        this._formfieldModel.displayname = value.displayname,
        this._formfieldModel.fieldname = this.getFieldName(value.fieldtype, value.displayname)
        this._formfieldModel.lookupdata = this.lookupdata?.value;

        this._formfieldModel.form = undefined;
        this._formfieldModel.lookupfieldid = undefined;

        if(this.mylookupControl && this.mylookupControl.value)  {
          this._formfieldModel.lookupfieldid = this.mylookupControl?.value._id;
        }

        this._formfieldModel.defaultvalue = this._formfieldModel.fieldtype == "readonly" ? value.defaultvalue : undefined;

        if(this.myformControl && this.myformControl.value) {
          this._formfieldModel.form = {};
          this._formfieldModel.form["formfield"] = this.myFormFieldControl.value.key;
          this._formfieldModel.form["displayvalue"] = this.mydisplayFieldControl.value.key;
          this._formfieldModel.form["parentvalue"] = this.myparentFieldControl.value.key;
          this._formfieldModel.form["fieldfilter"] = this.myfieldFilterControl.value.key;
          this._formfieldModel.form["template"] = this.myTemplateControl.value;
          this._formfieldModel.form["fieldfiltervalue"] = this.myFieldFilterValueControl.value;
          this._formfieldModel.form["formname"] = this.myformControl.value.formname;
          this._formfieldModel.form["apiurl"] = this.myformControl.value.schemaname + "/filter";
          this._formfieldModel.form["formid"] = this.myformControl.value._id;
        }

        var foundField = this.fields.find(x => x.id == this._formfieldModel.id);
        if(foundField) foundField = this._formfieldModel;


        if(value._id) {

          var url = "formfields/" + this._formfieldModel._id
          var method = "PUT";

          this._commonService
            .commonServiceByUrlMethodData(url, method, this._formfieldModel)
            .subscribe( (data: any) => {
              if(data){
                $(".close").click();
                // this.cancelAction();
                // this.isdisablesavebutton = false;
                //console.log("data 2", data);
                this.UpdateOrder(data);
                return;
              }
          }, (error) =>{
            console.error(error);
          });

        } else {
          var url = "formfields"
          var method = "POST";

          this._commonService
            .commonServiceByUrlMethodData(url, method, this._formfieldModel)
            .subscribe( (data: any) => {
              if(data){

                $(".close").click();
                //  this.cancelAction()
                //  this.isdisablesavebutton = false;
                //console.log("data 3", data);
                this.UpdateOrder(data);
                return;
              }
          }, (error) =>{
            console.error(error);
          });
        }
      }
    }
  }

  UpdateOrder(data: any) {

    console.log("data", data._id);

    var fieldIds = [];
    this.sectionLists.forEach(element => {
      if(element && element.length > 0) {
        element.forEach(ele => {
          var id = ele._id && ele._id !== "" ? ele._id : data._id;
          fieldIds.push(id)
        });
      }
    });

    var url = "formfields/updateformorder";
    var method = "POST";

    var postData = {};
    postData["formfields"] = fieldIds;

    console.log("postData", postData);

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if(data){
          this.cancelAction()
          return;
        }
    }, (error) =>{
      console.error(error);
    });

    
  }

  uuid() {
    let uuid = '', i, random;
    for (i = 0; i < 32; i++) {
      random = Math.random() * 16 | 0;

      if (i == 8 || i == 12 || i == 16 || i == 20) {
        uuid += '-'
      }
      uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uuid;
  }

  async cancelAction() {
    this.form.reset();
    const control = <FormArray>this.form.controls['lookupdata'];
        for(let i = control.length-1; i >= 0; i--) {
            control.removeAt(i)
    }
    this.ngOnInit()
  }

  addLookup(): void {
    this.lookupdata = this.form.get('lookupdata') as FormArray;
    this.lookupdata.push(this.createLookup());
  }

  removeLookup(i: any) {
    this.lookupdata = this.form.get('lookupdata') as FormArray;
    this.lookupdata.removeAt(i);
  }

  checkMultiSelect(fieldtype: any) {
    if(fieldtype == "category_list" || fieldtype == "form" || fieldtype == "gallery" || fieldtype == "attachment") {
      return "d-block";
    } else {
      return "d-none";
    }
  }

  checkLookupData(fieldtype: any) {
    if(fieldtype == "checkbox" || fieldtype == "radio" || fieldtype == "list" || fieldtype == "multi_selected_list") {
      return "d-block";
    } else {
      return "d-none";
    }
  }

  async loadLookups() {

    this.isLookupLoadingBox = true;

    var url = "lookups/filter"
    var method = "POST";

    var postData = {};
    postData["search"] = [];
    postData["search"].push({"searchfield": "status", "searchvalue": "active", "criteria": "eq"});

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if(data){
          this.lookupOptions = [];
          this.lookupOptions = data;
          this.isLookupLoadingBox = false;
          return;
        }
    }, (error) =>{
      console.error(error);
    });
  }

  private _lookupfilter(value: string): string[] {
    let results;
    if (value) {
      results = this.lookupOptions
        .filter(option => {
          if(option.lookup) {
            return option.lookup.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
        if (results.length < 1) {
          results = [];
        }
    } else {
      results = this.lookupOptions.slice();
    }
    return results;
  }

  lookupdisplayFn(user: any): string {
    return user && user.lookup ? user.lookup : '';
  }

  async loadForms() {

    this.isFormLoadingBox = true;

    var postData = {};
    postData["search"] = [];
    postData["search"].push({"searchfield": "status", "searchvalue": "active", "criteria": "eq"});

    return this._formsService
      .GetByfilterAsync(postData)
      .then( (data: any) => {
        if(data) {
          this.formsOptions = [];
          this.formsOptions = data;
          this.isFormLoadingBox = false;
          return;
        }
    }, (error) =>{
      console.error(error);
    });
  }

  private _formsfilter(value: string): string[] {
    let results;
    if (value) {
      results = this.formsOptions
        .filter(option => {
          if(option.formname) {
            return option.formname.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
        if (results.length < 1) {
          results = [];
        }
    } else {
      results = this.formsOptions.slice();
    }
    return results;
  }

  formsdisplayFn(user: any): string {
    return user && user.formname ? user.formname : '';
  }

  async optionSelected(option) {
    this.myformControl.setValue(option.value);

    await this.getFormSchema()
  }

  async getFormSchema() {

    this.isFormFieldLoadingBox = true;
    this.isDisplayFieldLoadingBox = true;
    this.isFieldFilterLoadingBox = true;

    var url = "common/schemas/" + this.myformControl.value.formname;
    var method = "GET";
    var postData = {};

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if(data) {

          this.formfieldOptions = [];
          this.displayfieldOptions = [];
          this.parentfieldOptions = [];
          this.fieldfilterOptions = [];

          this.myFormFieldControl.setValue("")
          this.mydisplayFieldControl.setValue("")
          this.myparentFieldControl.setValue("")
          this.myfieldFilterControl.setValue("")
          this.myFieldFilterValueControl.setValue("")

          var template = `<div 
          class='media py-2 member-profile-item cursor-pointer'>
    
          <div class='media-body'>
    
              <div class='d-flex'>
                  <div class='flex-grow-1'>
                      <div class='font-500 mb-1'>
                          <span> $[{autocomplete_displayname}]</span>
                          <span> | $[{customerid.fullname}]</span>
                      </div>
                  </div>
                  <div class='fc-today-button font-500'>
                      <i class='material-icons'> face </i>
                  </div>
              </div>
    
              <div class='d-flex'>
                  <div class='flex-grow-1'>
                      $[{customerid.property.mobile}]
                  </div>
                  <div class='fc-today-button font-14'>
                      $[{customerid.property.primaryemail}]
                  </div>
              </div>
          </div>
      </div>`;

          this.myTemplateControl.setValue(template);

          if(data.length > 0 ) {

            data.forEach(element => {
              let obj = {key: element.fieldname, value: element.fieldname };
              this.formfieldOptions.push(obj);
              this.displayfieldOptions.push(obj);
              this.parentfieldOptions.push(obj);
              this.fieldfilterOptions.push(obj);
            });

            this.isFormFieldLoadingBox = false;
            this.isDisplayFieldLoadingBox = false;
            this.isParentFieldLoadingBox = false;
            this.isFieldFilterLoadingBox = false;
          }
          return;
        }
    }, (error) =>{
      console.error(error);
    });

  }

  private _formFieldfilter(value: string): string[] {
    let results;
    if (value) {
      results = this.formfieldOptions
        .filter(option => {
          if(option.key) {
            return option.key.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
        if (results.length < 1) {
          results = [];
        }
    } else {
      results = this.formfieldOptions.slice();
    }
    return results;
  }

  private _parentFieldfilter(value: string): string[] {
    let results;
    if (value) {
      results = this.parentfieldOptions
        .filter(option => {
          if(option.key) {
            return option.key.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
        if (results.length < 1) {
          results = [];
        }
    } else {
      results = this.parentfieldOptions.slice();
    }
    return results;
  }

  private _displayFieldfilter(value: string): string[] {
    let results;
    if (value) {
      results = this.displayfieldOptions
        .filter(option => {
          if(option.key) {
            return option.key.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
        if (results.length < 1) {
          results = [];
        }
    } else {
      results = this.displayfieldOptions.slice();
    }
    return results;
  }

  private _fieldFieldfilter(value: string): string[] {
    let results;
    if (value) {
      results = this.fieldfilterOptions
        .filter(option => {
          if(option.key) {
            return option.key.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
        if (results.length < 1) {
          results = [];
        }
    } else {
      results = this.fieldfilterOptions.slice();
    }
    return results;
  }

  formfielddisplayFn(user: any): string {
    return user && user.key ? user.key : '';
  }

  getFieldName(fieldtype: any, displayname: any) {
    var fieldObj = this.onceUsedFieldLists.find(p=>p == fieldtype)
    if(fieldObj) {
      return fieldtype;
    } else {
      var dname = displayname.replace(/[^a-zA-Z ]/g, "").substring(0, 10);
      return dname.replace(/ /g, '_').toLowerCase() + '_' + Math.random().toString(36).slice(-4);
    }

  }

  async edit(item: any) {

    this.form.get('_id').setValue(item._id);
    this.form.get('sectionname').setValue(item.sectionname);
    this.form.get('sectiondisplayname').setValue(item.sectiondisplayname);
    this.form.get('fieldname').setValue(item.fieldname);
    this.form.get('fieldtype').setValue(item.fieldtype);
    this.form.get('min').setValue(item.min);
    this.form.get('max').setValue(item.max);
    this.form.get('maxlength').setValue(item.maxlength);
    this.form.get('multiselect').setValue(item.multiselect);
    this.form.get('displayname').setValue(item.displayname);
    this.form.get('required').setValue(item.required);
    this.form.get('colspan').setValue(item.colspan);
    this._formfieldModel = item;

    if(this._formfieldModel.lookupdata && this._formfieldModel.lookupdata.length > 0) {

      const control = <FormArray>this.form.controls['lookupdata'];
      for(let i = control.length-1; i >= 0; i--) {
        control.removeAt(i)
      }

      this._formfieldModel.lookupdata.forEach(element => {
        const tmpDict = {};
        tmpDict['key'] = new FormControl(element.key);
        tmpDict['value'] = new FormControl(element.value);

        this.lookupdata = this.form.get('lookupdata') as FormArray;
        this.lookupdata.push(new FormGroup(tmpDict));
      });
    }

    if(this._formfieldModel.fieldtype == "lookup") {
      var lookupObj = this.lookupOptions.find(p=>p._id == item.lookupfieldid)
      if(lookupObj)  this.mylookupControl.setValue(lookupObj);
    }

    if(this._formfieldModel.fieldtype == "form" || this._formfieldModel.fieldtype == "category_list") {
      var formObj = this.formsOptions.find(p=>p._id == item.form.formid)
      console.log(formObj);
      
      if(formObj)  {
        this.myformControl.setValue(formObj);
        await this.getFormSchema()

        var formfieldObj = this.formfieldOptions.find(p=>p.key == item.form.formfield)
        if(formfieldObj) this.myFormFieldControl.setValue(formfieldObj);

        var displayfieldObj = this.displayfieldOptions.find(p=>p.key == item.form.displayvalue)
        if(displayfieldObj) this.mydisplayFieldControl.setValue(displayfieldObj);

        var parentfieldObj = this.parentfieldOptions.find(p=>p.key == item.form.parentvalue)
        if(parentfieldObj) this.myparentFieldControl.setValue(parentfieldObj);

        var fieldfilterObj = this.fieldfilterOptions.find(p=>p.key == item.form.fieldfilter)
        if(fieldfilterObj) this.myfieldFilterControl.setValue(fieldfilterObj);

        this.myFieldFilterValueControl.setValue(item.form.fieldfiltervalue);
        this.myTemplateControl.setValue(item.form.template);
      }
    }


    const defaultvalue = <FormControl>this.form.get('defaultvalue');
    const maxlength = <FormControl>this.form.get('maxlength');
    const min = <FormControl>this.form.get('min');
    const max = <FormControl>this.form.get('max');

    if (this._formfieldModel.fieldtype == "readonly" ) {
      defaultvalue.setValidators([Validators.required, ])
      maxlength.setValidators(null);
      min.setValidators(null);
      max.setValidators(null);
    } else if (this._formfieldModel.fieldtype == "number") {
      defaultvalue.setValidators(null);
      maxlength.setValidators(null)
      min.setValidators([Validators.required, ]);
      max.setValidators([Validators.required, ]);
    } else if (this._formfieldModel.fieldtype == "mobile" ||  this._formfieldModel.fieldtype == "alternatenumber") {
      defaultvalue.setValidators(null);
      maxlength.setValidators([Validators.required, ])
      min.setValidators(null);
      max.setValidators(null);
    } else {
      defaultvalue.setValidators(null);
      maxlength.setValidators(null);
      min.setValidators(null);
      max.setValidators(null);
    }

    defaultvalue.updateValueAndValidity();
    maxlength.updateValueAndValidity();
    min.updateValueAndValidity();
    max.updateValueAndValidity();

    $("#addFieldBtn").click();

  }

  async preloaddata() {

    if (this.formfieldOptions.length == 0) {
      await this.getFormSchema();
    }
  }

  groupBy(collection: any, property: any) {
    let i = 0, val, index, values = [], result = [];
    for (; i < collection.length; i++) {
      val = collection[i][property];
      index = values.indexOf(val);
      if (index > -1) {
        result[index].push(collection[i]);
      } else {
        values.push(val);
        result.push([collection[i]]);
      }
    }
    return result;
  }

  getSubmittedAddSectionData(submitData: any) {
    this.ngOnInit()
  }

  patchField(fieldObj: any) {

    var url = "formfields/" + fieldObj._id
    var method = "PATCH";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, fieldObj)
      .then( (data: any) => {
        if(data){
          this.ngOnInit()
          return;
        }
    }, (error) =>{
      console.error(error);
    });
  }

  delete(item: any) {

    var Temp = this;
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this filed!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass:{
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        Temp.remove(item);
      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your imaginary file is safe :)',
          icon: 'error',
          customClass:{
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })
  }

  async remove(item: any) {
    
    if(item && item.sectionname && item.sectionname.includes("default_group_")) {
      var fieldObj = this.fields.find(p=>p.sectionname == item.sectionname);
      if(fieldObj) {
        var foundField = fieldObj.fields.find(x => x._id == item._id);
        if(foundField) {

          await this.removefields(item._id, fieldObj.fields);

          var url = "formfields/" + fieldObj._id
          var method = "PATCH";

          let postData = {};
          postData["fields"] = [];
          postData["fields"] = fieldObj.fields;

          return this._commonService
            .commonServiceByUrlMethodDataAsync(url, method, postData)
            .then( (data: any) => {
              if(data) {
                
                if(fieldObj.fields.length == 0) {

                  var url = "formfields/"
                  var method = "DELETE";

                  return this._commonService
                    .commonServiceByUrlMethodIdOrDataAsync(url, method, fieldObj._id)
                    .then( (data: any) => {
                      if(data) {
                        this.ngOnInit();
                        return;
                      }
                  }, (error) =>{
                    console.error(error);
                  });
                } else {
                  this.ngOnInit();
                }
                return;
              }
          }, (error) =>{
            console.error(error);
          });
        } 
      }
    } else {
      var url = "formfields/"
      var method = "DELETE";

      return this._commonService
        .commonServiceByUrlMethodIdOrDataAsync(url, method, item._id)
        .then( (data: any) => {
          if(data) {
            this.ngOnInit();
            return;
          }
      }, (error) =>{
        console.error(error);
      });
    }
  }

  async removefields(id: any, array: any) {
    for (const i in array) {
      if (array[i]._id == id) {
        array.splice(i, 1);
        return;
      }
    }
  }

  Save() {

    this.isdisablesavebutton = true;

    var fieldIds = [];
    this.sectionLists.forEach(element => {
      if(element && element.length > 0) {
        element.forEach(ele => {
          fieldIds.push(ele._id)
        });
      }
    });

    var url = "formfields/updateformorder";
    var method = "POST";

    var postData = {};
    postData["formfields"] = fieldIds;

    console.log("postData", postData);

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if(data){
          super.showNotification("top", "right", "update made successfully !!", "success");
          //this.ngOnInit()
          this.cancelAction()
          return;
        }
    }, (error) =>{
      console.error(error);
    });
  }

  preview() {

    if(!this.addPermission) {
      swal.fire({
        title: "permission",
        text: "You have no add permission.",
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      this._router.navigate([`/pages/dynamic-forms/form/${this.formObj._id}`]);
    }

  }

  getSubmittedAddGroupData(submitData: any) {
    this.ngOnInit()
  }
}
