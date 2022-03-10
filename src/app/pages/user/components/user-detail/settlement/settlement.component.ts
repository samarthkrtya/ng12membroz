import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { CommonService } from '../../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

declare var $: any;

@Component({
  selector: 'app-settlement',
  templateUrl: './settlement.component.html',
})
export class SettlementComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() bindId: any;
  @Input() dataContent: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  
  displayedColumns: string[] = ["date", "note","bank", "ac", "netearnings", "tds", "payoutamount"];
  ELEMENT_DATA: any[] = [];
  dataSource = new MatTableDataSource;


  constructor(
    public _commonService: CommonService,
  ) {
    super();
    this.pagename = "app-earning";
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.setData();
  }
  async setData() {

    this.ELEMENT_DATA = [];
    if (this.dataContent.settlements && this.dataContent.settlements.length > 0) {
      this.dataContent.settlements.forEach(txn => {
      
        this.ELEMENT_DATA.push(txn);
      });
    }
    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });
    this.dataSource.sort = this.sort;
    return;
  }


}
