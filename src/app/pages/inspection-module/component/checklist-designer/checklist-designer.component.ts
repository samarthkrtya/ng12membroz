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
  selector: 'app-checklist-designer',
  templateUrl: './checklist-designer.component.html',
  styles: [
    `
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
export class ChecklistDesignerComponent  extends BaseComponemntComponent implements BaseComponemntInterface, OnInit  {

  @ViewChild('groupAddBtn') groupAddBtn : ElementRef;

  _formfieldModel = new FormfieldModel();

  fieldLists: any [] = [];
  
  fields: any[] = [];

  formfieldForm: FormGroup;
  formsubmitted: boolean;
  
  form: FormGroup;
  submitted: boolean;
  isdisablesavebutton: boolean = false;

  sectionLists: any [] = [];
  section: any [] = [];
  onceUsedFieldLists: any [] = [];


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
      'sectionname': [this._formfieldModel.sectionname],
      'sectiondisplayname': [this._formfieldModel.sectiondisplayname],
      'colspan': [this._formfieldModel.colspan]
    });


    this.formfieldForm = fb.group({
      '_id': [this._formfieldModel._id],
      'id': [this._formfieldModel.id],
      'sectionname': [this._formfieldModel.sectionname],
      'sectiondisplayname': [this._formfieldModel.sectiondisplayname],
      'fieldname': [this._formfieldModel.fieldname],
      'fieldtype': [this._formfieldModel.fieldtype],
      'multiselect': [this._formfieldModel.multiselect],
      'displayname': [this._formfieldModel.displayname, Validators.required],
      'defaultvalue': [this._formfieldModel.defaultvalue],
      'form': [this._formfieldModel.form],
      'min': [this._formfieldModel.min],
      'max': [this._formfieldModel.max],
      'maxlength': [this._formfieldModel.maxlength],
      'required': [this._formfieldModel.required, Validators.required],
      'colspan': [this._formfieldModel.colspan],
      'checklist': [this._formfieldModel.checklist]
    });

   }

   async ngOnInit() {

    this._route.params.forEach(async (params) => {
      try {
        await super.ngOnInit();
        
        await this.initializeVariables()
        await this.getFormDetails()
        await this.LoadData();
        await this.fieldsSettings()
      } catch(error) {
        console.error(error)
      } finally {
      }
      
    })

    
  }

  Update() {}
  Delete() {}
  ActionCall() {}
  
  Save() {}

  async initializeVariables() {

    this.fieldLists = [];
    if(Fields && Fields.length > 0) {
      Fields.forEach(element => {
        element.id = ""
        this.fieldLists.push(element);
      });
      
      let productObj = {
        checklist: false,
        colspan: "1",
        defaultvalue: undefined,
        disabled: false,
        displayname: "",
        fieldname: "",
        fields: undefined,
        fieldtype: "form",
        form : {
          formfield : "_id", 
          displayvalue : "itemname", 
          fieldfilter : "status", 
          fieldfiltervalue : "active", 
          apiurl : "billitems/filter/view", 
        },
        formid: "",
        formname: "",
        formorder: undefined,
        id: "",
        lookupdata: undefined,
        lookupfieldid: undefined,
        max: undefined,
        maxlength: undefined,
        min: undefined,
        multiselect: true,
        name: "Product",
        required: false,
        sectiondisplayname: "",
        sectionname: "",
        src: "../assets/img/text-editor-fb-icon.svg",
        status: "",
        _id: "",
        
      }
      this.fieldLists.push(productObj);

      let serviceObj = {
        checklist: false,
        colspan: "1",
        defaultvalue: undefined,
        disabled: false,
        displayname: "",
        fieldname: "",
        fields: undefined,
        fieldtype: "form",
        form : {
          formfield : "_id", 
          displayvalue : "title", 
          fieldfilter : "type", 
          fieldfiltervalue : "jobservice", 
          apiurl : "services/filter", 
        },
        formid: "",
        formname: "",
        formorder: undefined,
        id: "",
        lookupdata: undefined,
        lookupfieldid: undefined,
        max: undefined,
        maxlength: undefined,
        min: undefined,
        multiselect: true,
        name: "Service",
        required: false,
        sectiondisplayname: "",
        sectionname: "",
        src: "../assets/img/text-editor-fb-icon.svg",
        status: "",
        _id: ""
      }
      this.fieldLists.push(serviceObj);

    }


    this.fields = [];
    this.isdisablesavebutton = false;

    this.sectionLists = [];
    this.section = [];

    this.onceUsedFieldLists = [ "fullname", "primaryemail", "secondaryemail", "mobile", "alternatenumber", "whatsappnumber" ];

    return;
  }

  async getFormDetails() {

    var url = "forms/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({"searchfield": "status", "searchvalue": "active", "criteria": "eq"});
    postData["search"].push({"searchfield": "formname", "searchvalue": this._formName, "criteria": "eq"});
    postData["sort"] = "formorder";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {

        if(data && data[0]){
          this.formObj = {};
          this.formObj = data[0];
          return;
        }
    }, (error) =>{
      console.error(error);
    });
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

    this.sectionLists = [];
    this.sectionLists = this.groupBy(this.fields, 'sectionname');

    this.sectionLists.forEach(element => {
      this.section.push({ "sectionname": element[0]['sectionname'], "sectiondisplayname": element[0]['sectiondisplayname'] })
    });

    return;
  }

  drop(event: CdkDragDrop<any>) {

    if (event.previousContainer === event.container) {

      moveItemInArray(event.container.data[0]['fields'], event.previousIndex, event.currentIndex);

      this.updateGroupOrder(event.container.data)

    } else if(event.previousContainer.id == "specialfield" || event.previousContainer.id == "simplefield") {

      copyArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

      this.formfieldForm.reset()

      this.sectionLists.forEach(ele => {

        var fieldObj = ele.find(p=>p.id == "");
        if(fieldObj) {

          var sectionObj = this.fields.find(p=>p.sectionname == event.container.id)
          fieldObj['id'] = this.uuid();
          fieldObj['sectionname'] = event.container.id;
          fieldObj['sectiondisplayname'] = sectionObj?.sectiondisplayname;

          this._formfieldModel = fieldObj;

          this.formfieldForm.get('id').setValue(this._formfieldModel.id);
          this.formfieldForm.get('sectionname').setValue(this._formfieldModel.sectionname);
          this.formfieldForm.get('sectiondisplayname').setValue(this._formfieldModel.sectiondisplayname);
          this.formfieldForm.get('required').setValue(this._formfieldModel.required);
          this.formfieldForm.get('checklist').setValue(this._formfieldModel.checklist);
          this.formfieldForm.get('fieldtype').setValue(this._formfieldModel.fieldtype);
          this.formfieldForm.get('form').setValue(this._formfieldModel.form);
          this.formfieldForm.get('min').setValue(this._formfieldModel.min);
          this.formfieldForm.get('max').setValue(this._formfieldModel.max);
          this.formfieldForm.get('maxlength').setValue(this._formfieldModel.maxlength);
          this.formfieldForm.get('multiselect').setValue(this._formfieldModel.multiselect);
          this.formfieldForm.get('colspan').setValue(sectionObj.colspan);
  
          const defaultvalue = <FormControl>this.formfieldForm.get('defaultvalue');
          const maxlength = <FormControl>this.formfieldForm.get('maxlength');
          const min = <FormControl>this.formfieldForm.get('min');
          const max = <FormControl>this.formfieldForm.get('max');

          
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

  updateGroupOrder(data: any) {

    this.sectionLists.forEach(element => {
      var fieldObj = element.find(p=>p.sectionname.toLowerCase() == data[0]["sectionname"].toLowerCase());
      if(fieldObj && fieldObj.fields && fieldObj.fields.length > 0) {

        let i = 0;
        fieldObj.fields.map(m=>m.index = i++)

        var url = "formfields/" + fieldObj._id
        var method = "PATCH";

        this._commonService
          .commonServiceByUrlMethodData(url, method, fieldObj)
          .subscribe( (data: any) => {
            if(data){
            }
        }, (error) =>{
          console.error(error);
        });


      }
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

  noReturnPredicate() {
    return false;
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

  async insertGroup(colspan: any) {
    this.form.get("colspan").setValue(colspan);
    let el: HTMLElement = this.groupAddBtn.nativeElement as HTMLElement;
    el.click()
  }

  onGroupSubmit(value: any, isValid: boolean) {
    this.submitted = true;
    if (!isValid) {
      return false;
    } else {
      
      this.isdisablesavebutton = true;

      var sectionname = "default_group_" + value.sectiondisplayname;
      
      this._formfieldModel.sectionname = sectionname.replace(/ /g, '_').toLowerCase() + '_' + Math.random().toString(36).slice(-4);
      this._formfieldModel.sectiondisplayname = value.sectiondisplayname;
      
      this._formfieldModel.formname = this.formObj.formname;
      this._formfieldModel.formid = this.formObj._id;
      this._formfieldModel.fieldtype = "group"
      this._formfieldModel.displayname = "Default"
      this._formfieldModel.fieldname = "defaultfield-" + this._formfieldModel.sectionname;
      this._formfieldModel.required = false;
      this._formfieldModel.colspan = value.colspan.toString();
      this._formfieldModel.fields = [];

      let obj = {
        _id: this.uuid(),
        sectionname: this._formfieldModel.sectionname,
        sectiondisplayname: this._formfieldModel.sectiondisplayname,
        fieldtype: "text",
        displayname: "Default",
        fieldname: "defaultgroupfield-" + sectionname,
        required: false,
        colspan: value.colspan.toString()
      }
      this._formfieldModel.fields.push(obj);
      

      var url = "formfields";
      var method = "POST";

      this._commonService
        .commonServiceByUrlMethodData(url, method, this._formfieldModel)
        .subscribe( (data: any) => {
          if(data){
            this.isdisablesavebutton = false;
            $(".close").click();
            this.form.reset()
            return;
          }
      }, (error) =>{
        console.error(error);
      });
    }
  }

  onformFieldSubmit(value: any, isValid: boolean) {
    
    this.formsubmitted = true;
    
    if (!isValid) {
      return false;
    } else {

      this.isdisablesavebutton = true;
      var fieldObj = this.fields.find(p=>p.sectionname == value.sectionname);

      if(fieldObj) {
        
        this._formfieldModel = fieldObj;

        let obj = {};
        obj = value;
        
        obj["displayname"] = value.displayname,
        obj["colspan"] = 1,
        obj["maxlength"] = value.maxlength,
        obj["min"] = value.min,
        obj["max"] = value.max,
        obj["fieldname"] = this.getFieldName(value.fieldtype, value.displayname),
        obj["checklist"] = value.checklist,
        obj["defaultvalue"] = value.fieldtype == "readonly" ? value.defaultvalue : undefined;
        obj["form"] = value.form ? value.form : undefined;

        
        if(!this._formfieldModel.fields) {
          this._formfieldModel.fields = [];
        }
        
        var foundField = this._formfieldModel.fields.find(x => x._id == value._id);

        if(foundField) {
          this.removefields(foundField._id, this._formfieldModel.fields);
        }

        obj["_id"] =  this.uuid();
        this._formfieldModel.fields.push(obj);

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
              this.UpdateOrder(data);
              return;
            }
        }, (error) =>{
          console.error(error);
        });
      }
      
    }
  }

  UpdateOrder(data: any) {

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

  async cancelAction() {
    this.form.reset();
    this.ngOnInit()
  }

  checkMultiSelect(fieldtype: any) {
    if(fieldtype == "category_list" || fieldtype == "form" || fieldtype == "gallery" || fieldtype == "attachment") {
      return "d-block";
    } else {
      return "d-none";
    }
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

    this.formfieldForm.get('_id').setValue(item._id);
    this.formfieldForm.get('sectionname').setValue(item.sectionname);
    this.formfieldForm.get('sectiondisplayname').setValue(item.sectiondisplayname);
    this.formfieldForm.get('fieldname').setValue(item.fieldname);
    this.formfieldForm.get('fieldtype').setValue(item.fieldtype);
    this.formfieldForm.get('min').setValue(item.min);
    this.formfieldForm.get('max').setValue(item.max);
    this.formfieldForm.get('maxlength').setValue(item.maxlength);
    this.formfieldForm.get('multiselect').setValue(item.multiselect);
    this.formfieldForm.get('displayname').setValue(item.displayname);
    this.formfieldForm.get('required').setValue(item.required);
    this.formfieldForm.get('checklist').setValue(item.checklist);
    this._formfieldModel = item;

    
    const defaultvalue = <FormControl>this.formfieldForm.get('defaultvalue');
    const maxlength = <FormControl>this.formfieldForm.get('maxlength');
    const min = <FormControl>this.formfieldForm.get('min');
    const max = <FormControl>this.formfieldForm.get('max');

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

  saveCost(value: any) {

    this.formObj.dispalyformname = value;

    var url = "forms/" + this.formObj._id;
    var method = "PATCH";

    let postData = {};
    postData["dispalyformname"] = this.formObj.dispalyformname; 

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if(data) {
          return;
        }
    }, (error) =>{
      console.error(error);
    });

  }

}
