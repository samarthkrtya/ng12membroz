import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-user-earnings',
  templateUrl: './user-earnings.component.html'
})
export class UserEarningsComponent extends BaseLiteComponemntComponent implements OnInit {
  @Input() bindId: any;
  @Input() dataContent: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @ViewChild('content', {static: false}) content: ElementRef;
  displayedColumns: string[] = ["Month", "Salary", "Earnings", "Action"];
  ELEMENT_DATA: any[] = [];
  dataSource = new MatTableDataSource;
  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  selectedMonth: any;
  onModalShow: boolean = false;
  constructor(private _commonService : CommonService) { 
    super();
  }

  async ngOnInit(){
    await super.ngOnInit();
    await this.salaryData();
  }

  async salaryData() {
    this.ELEMENT_DATA = [];
    let payrolls
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "paid", "criteria": "eq"});

    var url = "payrolls/filter"
    var method = "POST"

    return this._commonService.commonServiceByUrlMethodData(url, method, postData)
      .subscribe((data : any) => {
        if(data){
        payrolls = data;

        payrolls.forEach(element => {
          element.employeesalary.forEach(ele => {
            if(ele?._id == this.dataContent._id){
              element.earning = ele.netonhand;
              element.salary = ele.actualsalary
              element.salaryComponent = ele.salarycomponents
              element.netonhand = ele.netonhand
              element.bonus = ele.bonus
            }
          });
          if(element.earning){
            this.ELEMENT_DATA.push(element);
          }
        });
        this.dataSource = new MatTableDataSource();
          this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
          });
          this.dataSource.sort = this.sort;
          return;
        }
      })
 
  }

  onModal(element){
    this.onModalShow = true
    this.selectedMonth = element
  }

 
}
