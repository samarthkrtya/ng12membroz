import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { CommonService } from '../../../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-member-shared-document-list',
  templateUrl: './member-shared-document-list.component.html',
  styles: [
  ]
})
export class MemberSharedDocumentListComponent extends BaseLiteComponemntComponent implements OnInit  {

  @Input() bindId: any;
  @Input() dataContent: any;
  @Output() updateRecord = new EventEmitter();

  dataSource = new MatTableDataSource;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ELEMENT_DATA: any[] = []; 
  displayedColumns : string[] = ['formname' , 'category' , 'action' ]; 

  userid: any;


  constructor(
    public _commonService: CommonService,
  ) {
    super();
    this.pagename = "app-member-shared-document-list";
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.loaddata();
  }

  async loaddata() {
    this.userid = this.dataContent._id;
    
    this.ELEMENT_DATA = [];
    this.ELEMENT_DATA =  this.dataContent.documents ? this.dataContent.documents : [];

    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });
    this.dataSource.sort = this.sort;
 
  }

  onView(formname: any, id: any) {
    this._router.navigate([`/pages/document-module/form/${formname}/${this.userid}`])
  }
  
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


}
