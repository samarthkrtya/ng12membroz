import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { element } from 'protractor';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
declare var $: any;

@Component({
  selector: 'app-ownerships',
  templateUrl: './ownerships.component.html',
})
export class OwnershipsComponent extends BaseComponemntComponent implements OnInit {

  @Input() bindId: any;
  @Input() dataContent: any;
  @Output() updateRecord = new EventEmitter();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource;


  ownerform:FormGroup;
  btnDisable:boolean = false;
  displayedColumns: string[] = ['invester','investment','percentage'];
  ownerdata:any[] = []
  ELEMENT_DATA:any[] = [];
  userList:any[] = [];

  constructor(
    public fb:FormBuilder
  ) {
    super();
    this.ownerform = this.fb.group({

    })
   }

  async ngOnInit() {
    super.ngOnInit();
   await this.getAsset();
   await this.getowner();
  }

  async getAsset()
  {
    console.log(this.dataContent);    
  }

  async getowner()
  {
    var url = "formdatas/filter";
    var method = "POST";
    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "property.facilityid", "searchvalue": this.dataContent._id, "criteria": "eq","datatype": "ObjectId" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.ownerdata = data;     
          console.log("this.ownerdata", this.ownerdata);

          this.ownerdata.forEach(ele => {
            let obj = {
              invester: ele.property.contextid,
              investment: ele.property.investment,
              percentage: ele.property.percentage              
            }
            this.ELEMENT_DATA.push(obj);
            console.log(this.ELEMENT_DATA);
            
          });
          this.dataSource = new MatTableDataSource();
          this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          return;
        }
      })     
    }

    onFormSubmit(value:any)
    {

    }
 

    applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();

      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }

}
