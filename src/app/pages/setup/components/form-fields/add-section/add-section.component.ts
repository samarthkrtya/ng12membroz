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
  selector: 'app-add-section',
  templateUrl: './add-section.component.html'
})
export class AddSectionComponent extends BaseLiteComponemntComponent implements OnInit {

  
  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() item: any;
  @Input() formObj: any;
  @Output() onAddSectionData: EventEmitter<any> = new EventEmitter<any>();

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

  onSubmit(value: any, isValid: boolean) {
    this.submitted = true;
    if (!isValid) {
      return false;
    } else {
      
      
      this.isdisablesavebutton = true;

      var sectionname = "defaultsection-" + value.sectiondisplayname;
      
      this._formfieldModel.sectionname = sectionname.replace(/ /g, '_').toLowerCase() + '_' + Math.random().toString(36).slice(-4);
      this._formfieldModel.sectiondisplayname = value.sectiondisplayname;
      
      this._formfieldModel.formname = this.formObj.formname;
      this._formfieldModel.formid = this.formObj._id;
      this._formfieldModel.fieldtype = "text"
      this._formfieldModel.displayname = "Default"
      this._formfieldModel.fieldname = "defaultfield-" + this._formfieldModel.sectionname;
      this._formfieldModel.required = false;
      this._formfieldModel.colspan = "2";
      

      var url = "formfields";
      var method = "POST";
  
      this._commonService
        .commonServiceByUrlMethodData(url, method, this._formfieldModel)
        .subscribe( (data: any) => {
          if(data){
            this.isdisablesavebutton = false;
            $(".close").click();
            this.form.reset()
            this.onAddSectionData.emit({type: "success"});
            return;
          }
      }, (error) =>{
        console.error(error);
      });
    }
  }
}
