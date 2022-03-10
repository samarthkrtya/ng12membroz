import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
@Component({
  selector: 'app-signed-document',
  templateUrl: './signed-document.component.html',
})
export class SignedDocumentComponent extends BaseComponemntComponent implements OnInit {
  @Input() bindId: any;
  @Input() dataContent: any;
  @Output() updateRecord = new EventEmitter();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource = new MatTableDataSource;
  ELEMENT_DATA: any[] = [];
  displayedColumns: string[] = ['Formname','Category', 'Action'];
  userid: any;

  constructor(
    public _route: ActivatedRoute,
    public _router: Router
  ) {
    super();
    this.pagename = "app-signed-document";

  }

  async ngOnInit(){
    await super.ngOnInit();
    await this.getsigneddoc();
  }

  async getsigneddoc()
  {
    this.userid = this.dataContent._id;
    if (this.dataContent.signeddocuments && this.dataContent.signeddocuments.length > 0) {
      this.dataContent.signeddocuments.forEach(ele => {
        let obj = {
          formname: ele.formname ? ele.formname : '---',
          category: ele.category ? ele.category : '---',
          signed: ele.signed ? ele.signed : '---',
          acknowledged: ele.acknowledged ? ele.acknowledged : '---',
          _id: ele._id
        }
        this.ELEMENT_DATA.push(obj);
      });
    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });
    this.dataSource.sort = this.sort;
    return;
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  onView(formname: any, id: any) {
    this._router.navigate([`/pages/document-module/form/${formname}/${this.userid}`])
  }

}
