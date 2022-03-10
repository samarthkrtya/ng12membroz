import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';
import { BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';

import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-job-activity-view',
  templateUrl: './job-activity-view.component.html',
  styles: [
  ]
})
export class JobActivityViewComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface   {

  destroy$: Subject<boolean> = new Subject<boolean>();
  

  constructor(
    private _route: ActivatedRoute,
  ) {
    super();

    this._route.params.forEach((params) => {
      this.bindId = params["id"]; 
    }); 
   }

   async ngOnInit() {
    this._route.params.forEach(async (params) => {
      try {
        await super.ngOnInit()
        await this.initializeVariables()
      } catch(error) {
        console.error(error)
      } finally {

      }
    });
  }

  LoadData() {}
  Save() {}
  Update() {}
  Delete() {}
  ActionCall() {}

  async initializeVariables() {
    return
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
