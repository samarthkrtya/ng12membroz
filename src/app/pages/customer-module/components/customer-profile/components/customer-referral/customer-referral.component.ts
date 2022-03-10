import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, finalize, switchMap, tap } from 'rxjs/operators';

import { CommonService } from '../../../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';


@Component({
  selector: 'app-customer-referral',
  templateUrl: './customer-referral.component.html',
  styles: [
  ]
})
export class CustomerReferralComponent extends BaseLiteComponemntComponent implements OnInit {
  form: FormGroup;

  type: any;
  bindId: any;
  attendee = new FormControl();
  allAttendeeLists: any[] = [];
  filteredAttendeeOptions: any[];
  attendeeisLoadingBox: boolean = false;
  @Input() dataContent: any;

  @Output() onReferraleData = new EventEmitter();
  submitted: boolean;
  referralLists: any;
  isLoadingPage: boolean;

  constructor(private fb: FormBuilder, private _commonService: CommonService, private _route: ActivatedRoute,
  ) {
    super();
    this.pagename = "app-customer-referral";
    this.form = this.fb.group({
      attendee: [],
      attendeechk: [],
      // 'referredby': ['', Validators.required],
      // 'customerorigin': ['', Validators.required]
    })
  }

  customerorigin_fields = {
    "fieldname": "customerorigin",
    "fieldtype": "lookup",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "lookup", "searchvalue": "customerorigin", "criteria": "eq" }
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "data", "value": 1 },
    ],
    "value": "",
    "dbvalue": "",
  };

  async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.initializeVariables()
    }
    catch (error) {
      console.error("error", error)
    }
    this.attendee.valueChanges
      .pipe(
        debounceTime(500),
        tap((item: any) => {
          this.filteredAttendeeOptions = [];
          if (item.length == 0) {
            this.attendeeisLoadingBox = false;
          } else {
            this.attendeeisLoadingBox = true;
          }
        }),
        switchMap((value: any) =>
          value.length > 2
            ? this._commonService.searchContact(value, 1)
              .pipe(
                finalize(() => {
                  this.attendeeisLoadingBox = false
                }),
              )
            : []
        )
      )
      .subscribe(data => {
        this.filteredAttendeeOptions = [];
        this.filteredAttendeeOptions = data;
     
      });
      this.isLoadingPage = false;
  }

  async initializeVariables() {

    console.log("this.dataContent", this.dataContent);

    this.allAttendeeLists = []; 
    this.form.get('attendeechk').setValue(true); 

    if (!this.dataContent.property.referral && this.dataContent.property.customerorigin && this.dataContent.property.customerorigin !== "") {
      this.form.get('attendeechk').setValue(false);
      this.customerorigin_fields.dbvalue = this.dataContent.property.customerorigin;
    } else if (this.dataContent.property.referral && this.dataContent.property.referredby && this.dataContent.property.referredby !== "") {
      this.form.get('attendeechk').setValue(true);
      await this.getCustomerDetails(this.dataContent.property.referredby);
    }

  }

  showOptions(event: MatCheckboxChange): void {
    if (event.checked = true) {
      this.form.get('attendeechk').setValidators([Validators.required]);
    }
  }

  optionAttendeeSelected(option: any) {
    
    this.attendee.setValue(option.value);
  }

  handleEmptyAttendeeInput(event: any) {
    if (event.target.value === '') {
      this.attendee.setValue("");
      this.allAttendeeLists = [];
    }
  }

  displayAttendeeFn(user: any): string {
    return user && user.nickname ? user.nickname : '';
  }

  reset() {
    this.form.reset();

  }

  getCustomerDetails(customerid: any) {

    var url = "common/contacts/filter";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": '_id', "searchvalue": customerid, "criteria": "eq" });
    console.log("postData", postData)

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        console.log("data", data);

        if (data) {
          this.referralLists = data;
          this.filteredAttendeeOptions = [];
          this.filteredAttendeeOptions = data;
       
          // var custobj = this.referralLists.find(p => p._id == this.bindId);
          // if (custobj) {
          this.attendee.setValue(this.filteredAttendeeOptions[0]);
          console.log()
          // }

        }
      }, (error) => {
        console.error(error);
      });

  }

  onSubmit(value: any, isValid: boolean) {
    this.submitted = true;

    if (!isValid) {
      super.showNotification('top', 'right', 'Fill required fields !!', 'danger');
      return;
    } else {


      let postData = {};
      postData["property"] = {};
      postData["property"] = this.dataContent.property;
      postData["property"]["referral"] = value.attendeechk;
      postData["property"]["referredby"] = value.attendeechk ? this.attendee.value._id : undefined;
      postData["property"]["customerorigin"] = !value.attendeechk ? this.customerorigin_fields["modelValue"].autocomplete_id : undefined;

      console.log("postData", postData);

      let method = "PATCH";
      let url = "prospects/";

      console.log("this.dataContent._id", this.dataContent._id)


      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData, this.dataContent._id)
        .then((data: any) => {
          if (data) {
            this.onReferraleData.emit()            
            this.showNotification('top', 'right', 'Referral added successfully!!!', 'success');
            return;
          }
        }, (error) => {
          console.error(error);
        })


    }
  }



}


