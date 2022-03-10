import { Component, OnInit, AfterViewInit } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

declare const $: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  
  forms: any [] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    //private _formsService: FormsService
  ) { }

  public ngOnInit() {

    

    // this._formsService
    //   .getAll()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((data: any[])=>{
    //     if(data) {
    
    //       this.forms = data;
    //     }
    // })

    // this._formsService
    //   .GetById('5eaba8254e0f3dc9bce28b48')
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((data: any[])=>{
    //     if(data) {
    
    //       //this.forms = data;
    //     }
    // })

    // let postData = {};
    // postData["search"] = [];
    // postData["search"].push({"searchfield": "status", "searchvalue": "active", "criteria": "eq"});

    // this._formsService
    //   .GetByfilter(postData)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((data: any[])=>{
    //     if(data) {
    
    //       //this.forms = data;
    //     }
    // })
    
  }

  ngAfterViewInit() {
       
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }
}
