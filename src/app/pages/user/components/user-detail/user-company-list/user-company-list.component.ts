import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-user-company-list',
  templateUrl: './user-company-list.component.html',
  //  styleUrls: ['./user-company-list.component.css']
})
export class UserCompanyListComponent extends BaseComponemntComponent implements OnInit {

  @Input() bindId: any;
  @Input() dataContent: any;
  @Output() updateRecord = new EventEmitter();


  dataSource = new MatTableDataSource;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ELEMENT_DATA: any[] = [];
  displayedColumns: string[] = ['branchname', 'address', 'city', 'country'];

  constructor(
    public _commonService: CommonService,

  ) {

    super();
    this.pagename = "app-user-company-list";

  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.LoadData();
  }

  async LoadData() {
    this.ELEMENT_DATA = [];
    this.ELEMENT_DATA = this.dataContent.companies;

    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });
    this.dataSource.sort = this.sort;
    return;
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
