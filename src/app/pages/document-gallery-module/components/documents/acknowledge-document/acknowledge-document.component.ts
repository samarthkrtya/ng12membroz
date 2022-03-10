import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component'
import { CommonService } from '../../../../../core/services/common/common.service';

import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatPaginator } from "@angular/material/paginator";
import {SelectionModel} from '@angular/cdk/collections';

import { DomSanitizer } from '@angular/platform-browser';

import swal from 'sweetalert2';
declare var $: any;
@Component({
  selector: 'app-acknowledge-document',
  templateUrl: './acknowledge-document.component.html',
  styles: [
  ]
})
export class AcknowledgeDocumentComponent extends BaseLiteComponemntComponent implements OnInit   {

  destroy$: Subject<boolean> = new Subject<boolean>();

  displayedColumns: string[] = [];

  ELEMENT_DATA: any [] = [];
  dataSource = new MatTableDataSource;

  @Input() formsData: any;
  @Output() formsubmitData: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort = {} as MatSort;
  
  constructor(
    public sanitizer: DomSanitizer,
    private _commonService: CommonService
  ) {
    super()
  }

  async ngOnInit() {
    try {
      super.ngOnInit()
      await this.initializeVariables()
      await this.loadData()
    } catch (error) {
      console.error(error)
    } finally {
      
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async initializeVariables() {
    this.ELEMENT_DATA = [];
    this.displayedColumns = ['formname', 'category', 'action'];
    return;
  }

  async loadData() {
    this.formsData.forEach(element => {
      this.ELEMENT_DATA.push(element)
    });
    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    return;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

}
