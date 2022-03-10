import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import { MatTab } from '@angular/material/tabs';
import { LookupsService } from 'src/app/core/services/lookups/lookup.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from 'src/app/core/services/common/common.service';

declare var $: any;

@Component({
  selector: 'app-internal-notifications',
  templateUrl: './internal-notifications.component.html',
  styles: []
})
export class InternalNotificationsComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();
  isChecked = true;
  isLoading: boolean;
  internalnotificationList: any;
  roleList: any;


  constructor(private _route: ActivatedRoute,
    private fb: FormBuilder,
    private _lookupService: LookupsService,
    private _commonService: CommonService,    
  ) {
    super();
  }

  async ngOnInit() {
    try {
      this.isLoading = true;

      await super.ngOnInit();
      await this.initializeVariables();
      await this.getInternalNotification();
      await this.getrole();
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
          this.internalnotificationList = data[0];
          this.isLoading = false;
        }
      }, (error) => {
        console.error(error);
      })
  }

  async getrole() {
    let method = "POST";
    let url = "roles/filter";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        if (data) { 
          this.roleList = data;
          this.isLoading = false;
        }
      }, (error) => {
        console.error(error);
      })
  }

}
