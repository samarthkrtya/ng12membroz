import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-send-questionnaire',
  templateUrl: './send-questionnaire.component.html',
  styles: [
  ]
})
export class SendQuestionnaireComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface {

  destroy$: Subject<boolean> = new Subject<boolean>();

  isLoading: boolean = true;

  isDynamicForm: boolean =false;
  isDocument: boolean = false;

  formid: any;

  form_fields = {
    fieldname : "formid", 
    fieldtype : "form", 
    search: [
      { searchfield: "status", searchvalue: "active", criteria: "eq"},
      { searchfield: "formtype", searchvalue: ["surveyform", "document"], criteria: "in"},
    ],
    select: [],
    form: { apiurl : "forms/filter", method : "POST", formfield : "_id", displayvalue : "dispalyformname"},
  }
  
  urlValue: any;

  constructor() { 
    super()
  }

  async ngOnInit() {
    try {
      await super.ngOnInit()
      await this.initializeVariables()
      await this.LoadData()
    } catch(error) {
      console.log("error", error)
    } finally {
    }
  }

  async initializeVariables() {
    this.isDynamicForm = false;
    this.isDocument =  false;
    this.isLoading = true;
    this.urlValue = "";
    return;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async LoadData() {
    this.isLoading = false;
  }

  selectedForm(formid: any) {
    
    this.isDynamicForm = false;
    this.isDocument =  false;
    this.urlValue = "";

    if(formid) {
      
      this.formid = formid;

      if(this.formid && this.formid.doctemplate) {
        this.isDynamicForm = false;
        this.isDocument =  true;
        this.urlValue = "https://form.membroz.com/#/dynamic-forms/form/" + this.formid._id + "?domain=app.membroz.com&https=true";
      } else {
        this.isDynamicForm = true;
        this.isDocument =  false;
        this.urlValue = "https://form.membroz.com/#/document-module/form/" + this.formid._id + "?domain=app.membroz.com&https=true";
      }
    }
  }

  Save() { }
  Update() { }
  Delete() { }
  ActionCall() { }

  copyUrlFun() {
    if(this.formid) {
      var type = this.formid.formtype == "Document" ? "document" : "Form";
      this.showNotification('top', 'right', type + ' Link has been Copied!!', 'success');
    }
  }
}
