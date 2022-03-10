import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';


declare var $: any;
@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html'
})
export class TicketsComponent extends BaseLiteComponemntComponent implements OnInit,OnChanges,OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() dataContent: any;
  @Input() bindId: any;
  @Input() reloadingStr: string;
  
  @Output() onAdded = new EventEmitter();
  

  taxesList: any[] = [];
  ticketType: any[] = [];
  mainticketType: any[] = [];
  ticketList : any[] = [];

  isLoading : boolean = false;
  btnDisable: boolean = false;

  constructor(
    private _commonService : CommonService,
  ) {
    super();
    this.pagename = "app-tickets";
  }

  async ngOnInit() {
    try {
      await super.ngOnInit();
      this.isLoading = true;
      this.getTaxes();
      await this.gettickettype(); 
      await this.setData();
      this.isLoading = false;
    } catch (error) {
      console.error(error);
    } finally {
    }
  }


  async ngOnChanges() {
    if(this.reloadingStr && this.reloadingStr == 'tickets'){
      this.setData();
    }
  }

 async setData(){
  this.ticketList = [];
    if(this.dataContent.tickets && this.dataContent.tickets.length > 0){
      this.dataContent.tickets.forEach(element => {
          element['isedit'] = false;
          element['taxes'] = element.taxes ?  element.taxes.map(a=>a._id) : [];
          this.ticketList.push(element);
        });
    }
    this.updateType(this.dataContent);
    return;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  addOffer(item : any) {
    let obj = item;
    obj['isedit'] = true;
    obj['tickettype'] = item.name;
    obj['cost'] = 0;
    obj['taxes'] = [];
    obj['noofperson'] = 0;
    this.ticketList.push(obj);
 
  }

  getTaxes(){
 
    let url = "taxes/filter";
    let method = "POST";
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "datatype": "text", "criteria": "eq" });
    
     this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data : any[]) => {
        this.taxesList = [];
        this.taxesList = data;
      });
 }
 
 async gettickettype(){
 
    let url = "lookups/filter";
    let method = "POST";
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "lookup", "searchvalue": "tickettype", "datatype": "text", "criteria": "eq" });
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "datatype": "text", "criteria": "eq" });
    
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data : any[]) => { 
        this.ticketType = [];
        this.mainticketType = [];
        
        if(data.length > 0 )
          this.ticketType = data[0].data;
          this.mainticketType = data[0].data;
      });
 }

 async update(item : any , type : string){
   
    var model  = {};
    let method = "PUT";
    model = this.dataContent;
    if(type == 'delete'){
      this.ticketList.splice(item,1);
    }
    model['tickets'] = this.ticketList;

    let url = "events";
 
    this.btnDisable = true;
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, this.bindId)
      .then((data : any) => { 
        this.btnDisable = false;
        super.showNotification("top", "right", "Tickets updated successfully !!", "success");
        this.updateType(data);
        this.onAdded.emit(data);
      }).catch((e)=>{ 
        super.showNotification("top", "right", "Something went wrong !!", "danger");
        this.btnDisable = false;
      });
  }
  

  updateType(data : any){
    this.ticketType = [...this.mainticketType];
    if(data.tickets && data.tickets.length > 0){
      let ind;
      data.tickets.forEach(tck => {
        ind = this.ticketType.findIndex(a=>a.name == tck.tickettype);
        if(ind != -1){
          this.ticketType.splice(ind,1);
        }
      });
      
    }

  }

}
