import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { CommonService } from '../../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-earning',
  templateUrl: './earning.component.html',
})
export class EarningComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() bindId: any;
  @Input() dataContent: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  displayedColumns: string[] = ["client", "duration", "commissionpercentage", "earning", "netearning", "grossearning", "date"];
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
    if (this.dataContent.earnings && this.dataContent.earnings.length > 0) {
      this.dataContent.earnings.forEach(txn => {

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
