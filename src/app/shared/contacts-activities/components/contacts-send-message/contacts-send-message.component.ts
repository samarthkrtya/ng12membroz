import { Component, OnInit,  Input, Output, EventEmitter } from '@angular/core';
import { FormGroup,  FormBuilder, Validators } from '@angular/forms';

import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { BaseLiteComponemntComponent } from '../../../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../core/services/common/common.service';

import 'rxjs/add/operator/debounceTime';

@Component({
  selector: 'app-contacts-send-message',
  templateUrl: './contacts-send-message.component.html'
})
export class ContactsSendMessageComponent extends BaseLiteComponemntComponent implements OnInit {

  optionsTemplatetype: string[] = ["EMAIL", "SMS", "WHATSAPP", "Pushalert"];
  filteredOptionsTemplatetype: Observable<string[]>;

  optionsMailAlert: any[] = [];
  filteroptionsMailAlert: Observable<string[]>;

  mailalertList: any[] = [];
  form: FormGroup;
  submitted: boolean;
  isLoadingBox: boolean = false;
  isLoading: boolean = false;
  btnDisable: boolean = false;


  constructor(
    private fb: FormBuilder,
    private _commonService: CommonService
  ) {
    super();

    this.form = fb.group({
      'templatetype': ['EMAIL', Validators.required],
      'mailalert': [''],
      'subject': [''],
      'message': ['', Validators.required],
    });

  }

  @Input() dataContent: any;
  @Input() formid: any;
  @Input() formname: any;
  @Output() onCloseMessageData: EventEmitter<any> = new EventEmitter<any>();

  async ngOnInit() {
    try {
      this.isLoading = true;
      await super.ngOnInit()
      await this.initializeVariables()
      await this.getAlltemplates()
      this.ChangeCommunicationType();
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      console.error(error);
    } finally {

    }

    this.filteredOptionsTemplatetype = this.form.controls['templatetype'].valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option),
        map(option => option ? this._filterTemplatetype(option) : this.optionsTemplatetype.slice())
      );

    this.filteroptionsMailAlert = this.form.controls['mailalert'].valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option?.title),
        map(option => option ? this.filter(option) : this.optionsMailAlert.slice())
      );

  }

  async initializeVariables() {
    this.mailalertList = [];
    this.filteredOptionsTemplatetype = of(this.optionsTemplatetype);
  }


  optionSelected(option: any) {
    this.form.get("message").setValue("");
    this.ChangeCommunicationType();
  }

  optionMailAlertSelected(value: any) { 
    this.form.get("mailalert").setValue(value);
    if (value.commtype == 'EMAIL') {
      this.form.get("subject").setValue(value.subjt);
    }
    this.form.get("message").setValue(value.content);
  }

  private filter(value: string): string[] {
    let results;
    if (value) {
      results = this.optionsMailAlert
        .filter(option => {
          if (option && option.title) {
            return option.title.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
      if (results.length < 1) {
        results = [];
      }
    } else {
      results = this.optionsMailAlert.slice();
    }
    return results;
  }

  displayFn(user: any): string {
    return user && user.title ? user.title : '';
  }


  async getAlltemplates() {

    this.mailalertList = [];


    let postData = {}
    postData["search"] = [];
    postData["select"] = [];
    postData["search"].push({ "searchfield": "formid", "searchvalue": this.formid, "criteria": "eq", "datatype": "ObjectId" });

    let method = "POST";
    let url = "communications/filter";
 
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
         
        if (data) {
          this.mailalertList = data;
          this.mailalertList.map(a => a.commtype = a.messagetype);
          this.mailalertList.map(a => a.subjt = a.subject); 
        }
      });
  }

  ChangeCommunicationType() {
    var templatetype = this.form.get('templatetype').value;
    if (templatetype) {
      this.isLoadingBox = true;
      this.optionsMailAlert = [];
      this.optionsMailAlert = this.mailalertList.filter(a => a.commtype == templatetype);
      this.filteroptionsMailAlert = of(this.optionsMailAlert)
      this.isLoadingBox = false;
    }
  }

  private _filterTemplatetype(value: string): string[] {
    if (value) {
      this.form.get("mailalert").setValue("");
      this.form.get("subject").setValue("");
      this.optionsMailAlert = [];
      const filterValue = value.toLowerCase();
      return this.optionsTemplatetype.filter(option => option.toLowerCase().includes(filterValue));
    }
  }

  async onSubmit(value: any, isValid: boolean) {
    this.submitted = true;
    if (!isValid) {
      // super.showNotification("top", "right", "Fill required fields !!", "danger");
      return;
    } else {

      let method = "POST";
      let url = "communications/send";

      let postData = {};

      postData["receiver"] = [this.dataContent._id];
      postData["messagetype"] = value.templatetype;
      postData["message"] = {};
      postData["message"]["content"] = value.message;

      if (value.templatetype == 'EMAIL') {
        postData["message"]["to"] = this.dataContent.property.primaryemail;
        postData["message"]["subject"] = value.subject;
      } else if (value.templatetype == 'SMS'){
        postData["message"]["to"] = this.dataContent.property.mobile;
      } else if (value.templatetype == 'WHATSAPP'){
        postData["message"]["to"] = this.dataContent.property.whatsapp;
      }
      else {
        postData["message"]["to"] = this.dataContent.property.primaryemail;
      }

      if (value.mailalert && value.mailalert._id) {
        postData["mailalertid"] = value.mailalert._id;
      }

      //console.log("postData", postData);
      this.btnDisable = true;
      this.isLoading = true;

      await this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then(data => {
          if (data) {
            this.btnDisable = false;
            this.isLoading = false;
            this.onCloseMessageData.emit({ type: "success" });
            this.showNotification('top', 'right', 'Notification has been sent successfully!!!', 'success');

          }
        }, (error) => {
          this.btnDisable = false;
          this.isLoading = false;
          console.error(error);
        });
    }
  }

  reset() {
    this.form.reset();
    this.form.get("templatetype").setValue('EMAIL');
    this.ChangeCommunicationType();
  }

}
