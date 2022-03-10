import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import { ActivatedRoute, Router } from '@angular/router';

import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-vehicle-joborder-lists',
  templateUrl: './vehicle-joborder-lists.component.html',
  styles: [
  ]
})
export class VehicleJoborderListsComponent extends BaseLiteComponemntComponent implements OnInit  {

  @Input() dataContent: any;

  displayedColumns3: string[];
  dataSource3: any [] = [];

  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource<Element>();

  constructor(
    public _router: Router
  ) {
    super()
    this.pagename="app-vehicle-joborder-lists";
  }

  async ngOnInit() {

    try {
      await super.ngOnInit();
      await this.initializeVariables()
      await this.loadBookingLists()
    } catch(error) {
      console.error(error);
    } finally {
    }
  }
 
  async initializeVariables() {
    this.displayedColumns3 = [];
    this.displayedColumns3 = [  'number', 'date', 'action' ];
    this.dataSource3 = [];
  }

  async loadBookingLists() {

    if (this.dataContent && this.dataContent.joborders && this.dataContent.joborders.length > 0) {

      this.dataContent.joborders.forEach(element => {

        this.dataSource3.push( {
          _id: element._id,
          number: element.prefix + '-' + element.jobnumber,
          date: element.date
        });
      });

      this.dataSource = new MatTableDataSource<Element>(this.dataSource3);
      this.dataSource.paginator = this.paginator;

    }
    return;
  }

  gotoJoborder() {
    this._router.navigate(['/pages/job-order/joborder-info/'+this.dataContent._id]);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

}
