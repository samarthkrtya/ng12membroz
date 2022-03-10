import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/core/services/common/common.service';
import { UserModel } from 'src/app/core/models/auth/user.model';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
@Component({
  selector: 'app-shared-document',
  templateUrl: './shared-document.component.html',
})
export class SharedDocumentComponent extends BaseComponemntComponent implements OnInit {
  @Input() bindId: any;
  @Input() dataContent: any;
  @Output() updateRecord = new EventEmitter();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource;
  ELEMENT_DATA: any[] = [];
  displayedColumns: string[] = ['Document', 'Date', 'Action'];


  constructor(
    public _route: ActivatedRoute,
    public _router: Router
  ) {
    super();
    this.pagename = "app-shared-document";
  }

  async ngOnInit(){
    await super.ngOnInit();
    this.getshareddata();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getshareddata()
  {
      //console.log(this.dataContent);
      if (this.dataContent.shareddocuments && this.dataContent.shareddocuments.length > 0) {
        this.dataContent.shareddocuments.forEach(ele => {
          let obj = {
           /*  fullname: ele.fullname ? ele.fullname : '---',
            designation: ele.designation ? ele.designation : '---',
            status: ele.status ? ele.status : '---',
            joiningdate: ele.joiningdate ? ele.joiningdate : '---',
            location: ele.location ? ele.location : '---',
            _id: ele._id */
          }
          this.ELEMENT_DATA.push(obj);
        });
      this.dataSource = new MatTableDataSource();
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
      this.dataSource.paginator = this.paginator;
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


}
