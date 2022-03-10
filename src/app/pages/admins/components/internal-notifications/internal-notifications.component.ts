import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import { MatTab } from '@angular/material/tabs';
import { LookupsService } from 'src/app/core/services/lookups/lookup.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-internal-notifications',
  templateUrl: './internal-notifications.component.html',
  styles: []
})
export class InternalNotificationsComponent extends BaseComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();
  isChecked = true;
  isLoading: boolean;
  internalnotification: any;

  constructor(private _route: ActivatedRoute,
    private fb: FormBuilder,
    private _lookupService: LookupsService,
  ) {
    super();
  }

  async ngOnInit() {
    try {
      this.isLoading = true;

      await super.ngOnInit();
      await this.initializeVariables();
      await this.getInternalNotification();
      this.isLoading = false;

    } catch (error) {
      console.error(error);
      this.isLoading = false;

    } finally {
    }
  }

  async initializeVariables() {
    return;
  }

  async getInternalNotification() {
    let method = "POST";
    let url = "workflows/filter";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "property.workflowtype", "searchvalue": "internal", "criteria": "eq" });
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        if (data) {
          this.internalnotification = data[0];
          this.isLoading = false;
        }
      }, (error) => {
        console.error(error);
      })
  }

}
