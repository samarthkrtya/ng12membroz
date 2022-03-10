import { Component, OnInit,Input,Output,EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { UserModel } from 'src/app/core/models/auth/user.model';
import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';

declare var $: any;

@Component({
  selector: 'app-user-timesheet',
  templateUrl: './user-timesheet.component.html',
})
export class UserTimesheetComponent extends BaseComponemntComponent implements OnInit {

  @Input() bindId: any;
  @Input() dataContent: any;
  @Output() updateRecord = new EventEmitter();
  dataSource = new MatTableDataSource;


  userModel = new UserModel();
  ELEMENT_DATA: any [] = [];
  selectedfield:any [] =[];
  //displayedColumns: string[] = ["fromdate", "todate", "minutes", "status"];
  
  constructor(
    public _commonService: CommonService,
  ) {
    super();
    this.pagename = "app-user-timesheet";
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.loaddata();
   
  }

  async loaddata()
  {
   this.ELEMENT_DATA.push(this.dataContent)
    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    
    this.selectedfield = this.ELEMENT_DATA.filter(x=>x.timesheets)
    
  }
}