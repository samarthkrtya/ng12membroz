import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';


declare var $: any;
@Component({
  selector: 'app-tariff',
  templateUrl: './tariff.component.html'
})
export class TariffComponent extends BaseLiteComponemntComponent implements OnInit, OnChanges,OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() dataContent: any;
  @Input() bindId: any;
  @Input() reloadingStr: string;
  @Output() onAdded = new EventEmitter();
  

  taxesList: any[] = [];
  roomList: any[] = [];
  mainroomList: any[] = [];
  tariffList : any[] = [];

  isLoading : boolean = false;
  btnDisable: boolean = false;

  constructor(
    private _commonService : CommonService,
  ) {
    super();
    this.pagename = "app-tariff";
  }

  async ngOnInit() {
    try {
      await super.ngOnInit();
      this.isLoading = true;
      this.getTaxes();
      await this.getMembershipoffers(); 
      await this.setData();
      this.isLoading = false;
    } catch (error) {
      console.error(error);
    } finally {
    }
  }

  async ngOnChanges() {
    if(this.reloadingStr && this.reloadingStr == 'tariff'){
      this.setData();
    }
  }



 async setData(){
  this.tariffList = [];
    if(this.dataContent.tariff && this.dataContent.tariff.length > 0){
      this.dataContent.tariff.forEach(element => {
          element['isedit'] = false;
          element['taxes'] = element.taxes.map(a=>a._id);
          this.tariffList.push(element);
        });
    }
    this.updateType(this.dataContent);
    return;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  addOffer(item : any) {
    let obj = item;
    obj['isedit'] = true;
    obj['roomtype'] = item.name;
    obj['cost'] = 0;
    obj['taxes'] = [];
    obj['adults'] = 0;
    obj['childrens'] = 0;
    this.tariffList.push(obj);
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
 
 async getMembershipoffers(){
 
    let url = "lookups/filter";
    let method = "POST";
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "lookup", "searchvalue": "roomtypes", "datatype": "text", "criteria": "eq" });
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "datatype": "text", "criteria": "eq" });
    
    this.roomList = [];
    this.mainroomList = [];

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data : any[]) => {
        if(data.length > 0){
          this.roomList = data[0].data; 
          this.mainroomList = data[0].data; 
        }
      });
 }

 async update(item : any , type : string){
   
    var model  = {};
    let method = "PUT";
    model = this.dataContent;
    if(type == 'delete'){
      this.tariffList.splice(item,1);
    }
    model['tariff'] = this.tariffList;

    let url = "resorts"; 

    this.btnDisable = true;
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, this.bindId)
      .then((data : any) => {
        // console.log("data",data);
        this.btnDisable = false;
        super.showNotification("top", "right", "Tariff updated successfully !!", "success");
        this.updateType(data);
        this.onAdded.emit(data);
      }).catch((e)=>{
        console.log("e",e);
        super.showNotification("top", "right", "Something went wrong !!", "danger");
        this.btnDisable = false;
      });
  }


  updateType(data : any){
    this.roomList = [...this.mainroomList];
    if(data.tariff && data.tariff.length > 0){
      let ind;
      data.tariff.forEach(tck => {
        ind = this.roomList.findIndex(a=>a.name == tck.roomtype);
        if(ind != -1){
          this.roomList.splice(ind,1);
        }
      });
      
    }

  }



}
