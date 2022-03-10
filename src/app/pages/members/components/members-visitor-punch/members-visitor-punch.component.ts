import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';


import { Observable } from 'rxjs';
import {MatTableDataSource} from '@angular/material/table';
import { MatPaginator } from "@angular/material/paginator";

import swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-members-visitor-punch',
  templateUrl: './members-visitor-punch.component.html',
  styles: [
  ],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [ // each time the binding value changes
        query(':leave', [
          stagger(300, [
            animate('0.5s', style({ opacity: 0 }))
          ])
        ], { optional: true }),
        query(':enter', [
          style({ opacity: 0 }),
          stagger(300, [
            animate('0.5s', style({ opacity: 1 }))
          ])
        ], { optional: true })
      ])
    ])
  ],
})
export class MembersVisitorPunchComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface  {

  destroy$: Subject<boolean> = new Subject<boolean>();

  cardVisibility: boolean;
  mobileVisibility: boolean;

  cardEnabled: boolean;
  mobileEnabled: boolean;

  data$: any [] = [];

  searchText: string;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  obs: Observable<any>;
  dataSource = new MatTableDataSource;

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute
  ) {
    super()
    this.pagename = "app-wallet-debit";
  }

  async ngOnInit() {

    this._route.params.forEach(async (params) => {
      await super.ngOnInit();
      try {
        await this.initializeVariables();
        await this.LoadData();
        await this.getAllCheckInLists()
      } catch (err) {
        console.error(err);
      } finally {
      }
    })

  }

  async initializeVariables() {
    this.data$ = [];
    this.cardEnabled = false;
    this.mobileEnabled = false;
    return;
  }

  Save() { }
  Update() { }
  Delete() { }
  ActionCall() { }

  async LoadData() {


    this.cardEnabled = true;
    $("#cardClick").click();
    $('#cardClick a').addClass('active');
    this.randomValueClick('card');

    this.mobileEnabled = true;
    return;

  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }


  randomValueClick(val: any) {
    if(val == 'card') {
      this.cardVisibility = true;
      this.mobileVisibility = false;

    } else {
      this.cardVisibility = false;
      this.mobileVisibility = true;

    }
  }

  getAllCheckInLists() {

    let method = "POST";
    let url = "attendances/filter";

    let startDateTime = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0)
    let endDateTime = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59)

    let postData = {};
    postData["search"] = [];
    postData["search"].push(
      { "searchfield": "checkin", "searchvalue": startDateTime, "criteria": "gte", "datatype": "Date", "cond": "and" },
      { "searchfield": "checkin", "searchvalue": endDateTime, "criteria": "lte", "datatype": "Date", "cond": "and" },
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" }
    );


    // console.log("getAllCheckInLists postData", postData);

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.data$ = [];
          this.data$ = data.filter(p => p.membrozid);
          this.dataSource = new MatTableDataSource();
          this.dataSource = new MatTableDataSource(this.data$);
          this.dataSource.paginator = this.paginator;
          this.obs = this.dataSource.connect();
          return;
        }
      }, (error) => {
        console.error(error);
      })
  }

  getSubmittedData(data: any ){
    this.ngOnInit();
  }

  checkout(item: any) {
    let method = "PATCH";
    let url = "attendances/" + item._id;

    let postData = {};

    postData["property"] = {};
    postData["property"]["checkin"] = new Date(item.checkin);
    postData["property"]["checkout"] = new Date();
    postData["status"] = "checkout";


    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {

          this.showNotification('top', 'right', 'Check out done successfully!!', 'success');
          this.ngOnInit();
          return;
        }
      }, (error) => {
        console.error(error);
      })



  }

}
