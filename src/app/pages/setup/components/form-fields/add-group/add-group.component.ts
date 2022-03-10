import { Component, OnInit, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators, AbstractControl } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { FormfieldModel } from '../../../../../core/models/fields/formfield.model';

import { CommonService } from '../../../../../core/services/common/common.service';

import swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-add-group',
  templateUrl: './add-group.component.html',
  styles: [
  ]
})
export class AddGroupComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() formObj: any;
  @Output() onAddGroupData: EventEmitter<any> = new EventEmitter<any>();

  _formfieldModel = new FormfieldModel();

  form: FormGroup;
  submitted: boolean;
  isdisablesavebutton: boolean = false;

  constructor(
    private fb: FormBuilder,
    private _commonService: CommonService,
  ) { 
    super()

    this.form = fb.group({
      '_id': [this._formfieldModel._id],
      'sectionname': [this._formfieldModel.sectionname],
      'sectiondisplayname': [this._formfieldModel.sectiondisplayname],
    });

  }

  async ngOnInit() {
    try {
      await super.ngOnInit()
    } catch (error) {
      console.error(error)
    } finally {
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  onSubmit(value: any, isValid: boolean) {
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
      this._formfieldModel.colspan = "2";
      this._formfieldModel.fields = [];
      let obj = {
        _id: this.uuid(),
        sectionname: this._formfieldModel.sectionname,
        sectiondisplayname: this._formfieldModel.sectiondisplayname,
        fieldtype: "text",
        displayname: "Default",
        fieldname: "defaultgroupfield-" + sectionname,
        required: false,
        colspan: "2"
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
            this.onAddGroupData.emit({type: "success"});
            return;
          }
      }, (error) =>{
        console.error(error);
      });
    }
  }

}
