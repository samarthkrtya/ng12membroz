
import { Component, OnInit, Input, AfterViewInit } from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'app-doc-table',
  templateUrl: './doc-table.component.html',
})
export class DocTableComponent implements OnInit, AfterViewInit {

  constructor(

  ) {

  }

  @Input('dataSource') dataSource: any[];
  @Input('displayedColumns') displayedColumns: string[];
  @Input('displayedColumnsX') displayedColumnsX: object[];

   
  async ngOnInit() {


  }



  ngAfterViewInit() {
  }






}
