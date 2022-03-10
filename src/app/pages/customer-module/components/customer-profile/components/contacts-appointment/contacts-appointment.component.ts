import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from 'src/app/core/services/common/common.service';

declare var $: any;
@Component({
  selector: 'app-contacts-appointment',
  templateUrl: './contacts-appointment.component.html'
})
export class ContactsAappointment extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  form: FormGroup;
  submitted: boolean;

  appointmentLists: any [] = [];

  @Input() dataContent: any;
  @Output() addedApp = new EventEmitter();

  constructor(
    private _commonService: CommonService,
    private fb: FormBuilder,
    private _route: ActivatedRoute,
  ) { 
    
    super()
    this.pagename="app-contacts-appointment";
  }

  async ngOnInit() {

    try {
      await super.ngOnInit()
      await this.getAppointment()
    } catch (error) {
      console.error("error", error)
    } finally {
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async getAppointment() {
    this.appointmentLists = this.dataContent?.upcomingappointment;
    console.log("this.appointmentLists", this.appointmentLists)
    return;
  }

  getSubmittedData(submitData: any) {
    
    $("#appointmentClose").click();
    if(submitData == "success") {
      setTimeout(() => {
        this.addedApp.emit("success")  
      }, 500);
    }
  }

  advcQtyClose() {
    $("#appointmentClose").click();
    setTimeout(() => {
      this.addedApp.emit("success")  
    }, 500);
  }

}
