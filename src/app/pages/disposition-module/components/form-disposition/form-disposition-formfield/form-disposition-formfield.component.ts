import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators, AbstractControl } from '@angular/forms';

import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import { DesignerFormDispositionModel } from '../../../../../core/models/designer-form-disposition/designer-form-disposition.model';

import { Fields } from '../../../../../core/models/fields/mock-fields';
import { SpecialFields } from '../../../../../core/models/fields/mock-specialfields';

import { CommonService } from '../../../../../core/services/common/common.service';
import { FormsService } from '../../../../../core/services/forms/forms.service';

declare var $: any;
import swal from 'sweetalert2';

@Component({
  selector: 'app-form-disposition-formfield',
  templateUrl: './form-disposition-formfield.component.html',
  styles: [
  ]
})
export class FormDispositionFormfieldComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();
  @Input() dispositionModel: any;
  @Input() formfieldEditData: any;

  _designerFormDispositionModel = new DesignerFormDispositionModel();

  form: FormGroup;
  submitted: boolean;
  isdisablesavebutton: boolean = false;

  fieldtype = new FormControl();
  fieldtypeLists: any [] = [];
  fieldtypeFilteredOptions: Observable<string[]>;
  fieldtypeIsLoadingBox: boolean = false;

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

  myfieldFilterControl = new FormControl();
  fieldfilterOptions: any[] = [];
  fieldFilterFilteredOptions: Observable<string[]>;
  isFieldFilterLoadingBox: boolean = false;

  lookupdata: FormArray;

  myFieldFilterValueControl = new FormControl();

  constructor(
    private fb: FormBuilder,
    private _commonService: CommonService,
    private _formsService: FormsService,
  ) {

    super()

    this.form = fb.group({
      '_id': [this._designerFormDispositionModel._id],
      'fieldname': [this._designerFormDispositionModel.fieldname],
      'fieldtype': [this._designerFormDispositionModel.fieldtype, Validators.required],
      'displayname': [this._designerFormDispositionModel.displayname, Validators.required],
      'defaultvalue': [this._designerFormDispositionModel.defaultvalue],
      'required': [this._designerFormDispositionModel.required],
      'lookupdata': new FormArray([]),
    });
  }

  async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.initializeVariables()
      await this.getAllFields()
      await this.loadLookups()
      await this.loadForms()

    } catch (error) {
      console.error(error)
    } finally {

      if(this.formfieldEditData && this.formfieldEditData._id) {
        this.editMode(this.formfieldEditData)
      }
    }

    this.fieldtypeFilteredOptions = this.fieldtype.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.name),
        map(option => option ? this._fieldtypefilter(option) : this.fieldtypeLists.slice())
    );

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

    this.fieldFilterFilteredOptions = this.myfieldFilterControl.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.key),
        map(option => option ? this._fieldFieldfilter(option) : this.formfieldOptions.slice())
    );
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {

    this.fieldtypeLists = [];
    this.fieldtypeIsLoadingBox = false;

    this.isdisablesavebutton = false;
    return;
  }

  async getAllFields() {

    this.fieldtypeLists = [];
    this.fieldtypeIsLoadingBox = false;

    if(Fields && Fields.length > 0) {
      Fields.forEach(element => {
        this.fieldtypeLists.push(element);
      });
    }

    if(SpecialFields && SpecialFields.length > 0) {
      SpecialFields.forEach(element => {
        this.fieldtypeLists.push(element);
      });
    }

    return;
  }

  fieldtypeEnter() {
    const controlValue = this.fieldtype.value;
    this.fieldtype.setValue(controlValue);
  }

  async fieldtypePreloaddata() {
    if (this.fieldtypeLists.length == 0) {
      await this.getAllFields()
    }
  }

  fieldtypeHandleEmptyInput(event: any){
    if(event.target.value === '') {
      this.fieldtype.setValue("");
      this.fieldtypeLists = [];
      this._designerFormDispositionModel.fieldtype = "";
      this.form.get('fieldtype').setValue("");
    }
  }

  fieldtypeDisplayFn(user: any): string {
    return user && user.name ? user.name : '';
  }

  async fieldtypeOptionSelected(option: any) {
    this.fieldtype.setValue(option.value);
    this.form.get('fieldtype').setValue(this.fieldtype.value.fieldtype)
    this._designerFormDispositionModel.fieldtype = this.fieldtype.value.fieldtype;
  }

  _fieldtypefilter(value: string): string[] {
    let results;
    if (value) {
      results = this.fieldtypeLists
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
      results = this.fieldtypeLists.slice();
    }
    return results;
  }

  checkLookupData(ftype: any) {
    if(ftype.value && ftype.value.fieldtype) {
      let fieldtype = ftype.value.fieldtype;
      if(fieldtype == "checkbox" || fieldtype == "radio" || fieldtype == "list" || fieldtype == "multi_selected_list") {
        return "d-block";
      } else {
        return "d-none";
      }
    } else {
      return "d-none";
    }
  }

  addLookup(): void {
    this.lookupdata = this.form.get('lookupdata') as FormArray;
    this.lookupdata.push(this.createLookup());
  }

  createLookup(): FormGroup {
    return this.fb.group({
      key: ['', [Validators.required]],
      value: ['', [Validators.required]],
    });
  }

  removeLookup(i: any) {
    this.lookupdata = this.form.get('lookupdata') as FormArray;
    this.lookupdata.removeAt(i);
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

  lookupdisplayFn(user: any): string {
    return user && user.lookup ? user.lookup : '';
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
          this.fieldfilterOptions = [];

          this.myFormFieldControl.setValue("")
          this.mydisplayFieldControl.setValue("")
          this.myfieldFilterControl.setValue("")
          this.myFieldFilterValueControl.setValue("")

          if(data.length > 0 ) {

            data.forEach(element => {
              let obj = {key: element.fieldname, value: element.fieldname };
              this.formfieldOptions.push(obj);
              this.displayfieldOptions.push(obj);
              this.fieldfilterOptions.push(obj);
            });

            this.isFormFieldLoadingBox = false;
            this.isDisplayFieldLoadingBox = false;
            this.isFieldFilterLoadingBox = false;
          }
          return;
        }
    }, (error) =>{
      console.error(error);
    });

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

  formsdisplayFn(user: any): string {
    return user && user.formname ? user.formname : '';
  }

  async optionSelected(option) {
    this.myformControl.setValue(option.value);
    await this.getFormSchema()
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

  formfielddisplayFn(user: any): string {
    return user && user.key ? user.key : '';
  }

  async preloaddata() {
    if (this.formfieldOptions.length == 0) {
      await this.getFormSchema();
    }
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

  getFieldName(fieldtype: any, displayname: any) {
    return displayname.replace(/ /g, '_').toLowerCase() + '_' + Math.random().toString(36).slice(-4);
  }

  onSubmit(value: any, isValid: boolean) {
    this.submitted = true;
    if (!isValid) {
      return false;
    } else {
      this.isdisablesavebutton = true;
      this._designerFormDispositionModel = value;

      this._designerFormDispositionModel.fieldname = this.getFieldName(value.fieldtype, value.displayname)
      this._designerFormDispositionModel.lookupdata = this.lookupdata?.value;

      this._designerFormDispositionModel.form = undefined;
      this._designerFormDispositionModel.lookupfieldid = undefined;

      if(this.mylookupControl && this.mylookupControl.value)  {
        this._designerFormDispositionModel.lookupfieldid = this.mylookupControl?.value._id;
      }

      this._designerFormDispositionModel.defaultvalue = this._designerFormDispositionModel.fieldtype == "readonly" ? value.defaultvalue : undefined;

      if(this.myformControl && this.myformControl.value) {
        this._designerFormDispositionModel.form = {};
        this._designerFormDispositionModel.form["formfield"] = this.myFormFieldControl.value.key;
        this._designerFormDispositionModel.form["displayvalue"] = this.mydisplayFieldControl.value.key;
        this._designerFormDispositionModel.form["fieldfilter"] = this.myfieldFilterControl.value.key;
        this._designerFormDispositionModel.form["fieldfiltervalue"] = this.myFieldFilterValueControl.value;
        this._designerFormDispositionModel.form["apiurl"] = this.myformControl.value.schemaname + "/filter";
        this._designerFormDispositionModel.form["formid"] = this.myformControl.value._id;
      }

      //console.log("_designerFormDispositionModel", this._designerFormDispositionModel);

      if(this.dispositionModel.fields && this.dispositionModel.fields && this.dispositionModel.fields.length > 0) {

        if(!this._designerFormDispositionModel._id) {
          this._designerFormDispositionModel._id = this.uuid()
          this.dispositionModel.fields.push(this._designerFormDispositionModel);
        } else {
          var foundField =this.dispositionModel.fields.find(x => x._id == this._designerFormDispositionModel._id);
          if(foundField) {
            foundField._id = this._designerFormDispositionModel._id
            foundField.fieldtype = this._designerFormDispositionModel.fieldtype
            foundField.fieldname = this._designerFormDispositionModel.fieldname
            foundField.displayname = this._designerFormDispositionModel.displayname
            foundField.required = this._designerFormDispositionModel.required
            foundField.lookupdata = this._designerFormDispositionModel.lookupdata
            foundField.defaultvalue = this._designerFormDispositionModel.defaultvalue
            foundField.form = this._designerFormDispositionModel.form
            foundField.lookupfieldid = this._designerFormDispositionModel.lookupfieldid
            foundField.formorder = this._designerFormDispositionModel.formorder
            foundField.value = this._designerFormDispositionModel.value
            foundField.editable = this._designerFormDispositionModel.editable
          }
        }
      } else {
        this.dispositionModel.fields = [];
        this._designerFormDispositionModel._id = this.uuid()
        this.dispositionModel.fields.push(this._designerFormDispositionModel);
      }

      var url = "dispositions/" + this.dispositionModel._id
      var method = "PUT";

      //console.log("dispositionModel", this.dispositionModel);


      this._commonService
        .commonServiceByUrlMethodData(url, method, this.dispositionModel)
        .subscribe( (data: any) => {
          if(data){
            $(".close").click();
            this.isdisablesavebutton = false;
            return;
          }
      }, (error) =>{
        console.error(error);
      });
    }
  }

  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  async editMode(item: any) {

    //console.log("editMode Called", item);

    this.form.get('_id').setValue(item._id);
    this.form.get('fieldname').setValue(item.fieldname);
    this.form.get('fieldtype').setValue(item.fieldtype);
    this.form.get('displayname').setValue(item.displayname);
    this.form.get('required').setValue(item.required);

    this._designerFormDispositionModel = item;

    var fieldtypeObj = this.fieldtypeLists.find(p=>p.fieldtype == item.fieldtype);
    if(fieldtypeObj) {
      this.fieldtype.setValue(fieldtypeObj);
    }


    if(this._designerFormDispositionModel.lookupdata && this._designerFormDispositionModel.lookupdata.length > 0) {

      const control = <FormArray>this.form.controls['lookupdata'];
      for(let i = control.length-1; i >= 0; i--) {
        control.removeAt(i)
      }

      this._designerFormDispositionModel.lookupdata.forEach(element => {
        const tmpDict = {};
        tmpDict['key'] = new FormControl(element["key"]);
        tmpDict['value'] = new FormControl(element["value"]);

        this.lookupdata = this.form.get('lookupdata') as FormArray;
        this.lookupdata.push(new FormGroup(tmpDict));
      });
    }

    if(this._designerFormDispositionModel.fieldtype == "lookup") {
      var lookupObj = this.lookupOptions.find(p=>p._id == item.lookupfieldid)
      if(lookupObj)  this.mylookupControl.setValue(lookupObj);
    }

    if(this._designerFormDispositionModel.fieldtype == "form") {
      var formObj = this.formsOptions.find(p=>p._id == item.form.formid)
      if(formObj)  {
        this.myformControl.setValue(formObj);
        await this.getFormSchema()

        var formfieldObj = this.formfieldOptions.find(p=>p.key == item.form.formfield)
        if(formfieldObj) this.myFormFieldControl.setValue(formfieldObj);

        var displayfieldObj = this.displayfieldOptions.find(p=>p.key == item.form.displayvalue)
        if(displayfieldObj) this.mydisplayFieldControl.setValue(displayfieldObj);

        var fieldfilterObj = this.fieldfilterOptions.find(p=>p.key == item.form.fieldfilter)
        if(fieldfilterObj) this.myfieldFilterControl.setValue(fieldfilterObj);

        this.myFieldFilterValueControl.setValue(item.form.fieldfiltervalue);
      }
    }
  }
}
