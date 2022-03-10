import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { CommonService } from '../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { of, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Subject } from 'rxjs';

import {MatTableDataSource} from '@angular/material/table';
import { MatPaginator } from "@angular/material/paginator";

@Component({
  selector: 'app-dynamic-dispositiondata',
  templateUrl: './dynamic-dispositiondata.component.html',
  styles: [
  ],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [ // each time the binding value changes
        query(':leave', [
          stagger(300, [
            animate('0.5s', style({ opacity: 0 }))
          ])
        ], { optional: true }),
        query(':enter', [
          style({ opacity: 0 }),
          stagger(300, [
            animate('0.5s', style({ opacity: 1 }))
          ])
        ], { optional: true })
      ])
    ])
  ],
})
export class DynamicDispositiondataComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  data$: any [] = [];
  searchText: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  obs: Observable<any>;
  dataSource = new MatTableDataSource;

  public hideRuleContent:boolean[] = [];

  
  constructor(
    private _commonService: CommonService
  ) {
    super()
  }

  @Input('dispositiondata') dispositiondata: any;
  @Output() onDispositionHistoryData: EventEmitter<any> = new EventEmitter<any>();

  async ngOnInit() {
    try {
      await super.ngOnInit()
      await this.initializeVariables()
      await this.loadData()
    } catch(error) {
      console.log(error)
    }
    
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  ngOnChanges() {
    
  }

  ngDoCheck() {
  }

  ngAfterViewInit() {
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  toggle(index) {
    
    // toggle based on index
    this.hideRuleContent[index] = !this.hideRuleContent[index];
  }

  async initializeVariables() {
    this.data$ = [];
    
    if(this.dispositiondata && this.dispositiondata.length > 0) {
      this.dispositiondata.forEach(element => {
        
        if(element.status = "close") {

          let obj = {
            id: element._id._id,
            disposition: element && element._id && element._id.dispositionid && element._id.dispositionid.disposition ? element._id.dispositionid.disposition : '',
            type: element.type,
            status: element.status,
            property: element.property,
            addedby: element && element._id && element._id.addedby && element._id.addedby.fullname ? element._id.addedby.fullname : "",
            updatedAt: element.updatedAt,
          }
  
          obj["fields"] = {};

          var fields = element && element._id && element._id.dispositionid && element._id.dispositionid.fields ? element._id.dispositionid.fields : element && element.dispositionid && element.dispositionid.fields ? element.dispositionid.fields : [];
  
          if( fields.length > 0) {
            fields.forEach(Fieldelement => {
              obj["fields"][Fieldelement.displayname ? Fieldelement.displayname : Fieldelement.fieldname] = element && element.property && element.property[Fieldelement.fieldname] ? element.property[Fieldelement.fieldname] : ""
            });
          }
  
          this.data$.push(obj);
        }
        
      });
      
    }
    return;
  }

  async loadData() {
    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.data$);
    this.dataSource.paginator = this.paginator;
    this.obs = this.dataSource.connect();
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
