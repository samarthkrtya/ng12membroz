import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { ActivatedRoute, Router } from '@angular/router';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

import { CommonService } from '../../../../../../core/services/common/common.service';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-vehicle-inspection-lists',
  templateUrl: './vehicle-inspection-lists.component.html',
  styles: [
  ]
})
export class VehicleInspectionListsComponent extends BaseLiteComponemntComponent implements OnInit  {

  @Input() dataContent: any;

  displayedColumns3: string[];
  dataSource3: any [] = [];

  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource<Element>();

  userLists: any [] = [];

  constructor(
    public _router: Router,
    private _commonService: CommonService,
  ) {
    super()
    this.pagename="app-vehicle-booking-lists";
  }

  async ngOnInit() {

    try {
      await super.ngOnInit();
      await this.initializeVariables()
      await this.getAllUsers()
      await this.loadBookingLists()
    } catch(error) {
      console.error(error);
    } finally {
    }
  }
  
 
  async initializeVariables() {
    this.displayedColumns3 = [];
    this.displayedColumns3 = [  'title', 'inspectionby', 'inspectiondate', 'status', 'action' ];
    this.dataSource3 = [];
    this.userLists = [];
  }

  async getAllUsers() {

    let method = "POST";
    let url = "users/filter";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {

          this.userLists = [];
          this.userLists = data;

          
          return;
        }
      }, (error) => {
        console.error(error);
      })

  }

  async loadBookingLists() {

    if (this.dataContent && this.dataContent.inspections && this.dataContent.inspections.length > 0) {

      this.dataContent.inspections.forEach(element => {

        var inspectionby = '---';
        var userObj = this.userLists.find(p=>p._id == element.addedby);
        if(userObj) {
          inspectionby = userObj.fullname;
        }

        this.dataSource3.push( {
          _id: element._id,
          title: element.form && element.form.formname ? element.form.formname : '---',
          inspectionby: inspectionby,
          inspectiondate: element.property && element.property.date ? element.property.date : null,
          status: element.status
        });
      
      });

      this.dataSource = new MatTableDataSource<Element>(this.dataSource3);
      this.dataSource.paginator = this.paginator;
    }
    return;
  }

  AddInspection() {
    this._router.navigate(['/pages/inspection-module/inspection/'+this.dataContent._id]);
  }

  gotoInspection(element: any) {
    var id = element && element._id && element._id._id ? element._id._id : element._id;
    this._router.navigate(['/pages/inspection-module/inspection/'+ id]);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

}
