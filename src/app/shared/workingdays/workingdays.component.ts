import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';

import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

declare var $: any;

@Component({
  selector: 'app-workingdays',
  templateUrl: './workingdays.component.html',
})
export class WorkingDaysComponent extends BaseLiteComponemntComponent implements OnInit, AfterViewInit {

  destroy$: Subject<boolean> = new Subject<boolean>();
 
  @Input() id: string;
  @Output() submitted = new EventEmitter<any>();

  starttime : string;
  endtime : string;

  branchdetail : any;
  
  wdoptions = [
    { value: "Monday", checked: false },
    { value: "Tuesday", checked: false },
    { value: "Wednesday", checked: false },
    { value: "Thursday", checked: false },
    { value: "Friday", checked: false },
    { value: "Saturday", checked: false },
    { value: "Sunday", checked: false },
  ];

  disableButton : boolean = false;


  
  constructor( 
    private  _commonService :CommonService
  ) {
    super()
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.onLoad();
    try { 
    } catch (error) {
    }
  }

  setTimers(time : string){
    return { hhmm : time , hh :parseInt(time.substring(0,2)) , mm : parseInt(time.substring(2,4)) };
  }
 
  setAllDays(checked: boolean){
    this.wdoptions.map(a => a.checked = checked);
  }

  isAllSelected(){
    return this.wdoptions.filter(a => a.checked == true).length == 7;
  }

  async onLoad(){
    this.branchdetail = this._authService.auth_user.branchid;
    if(this.branchdetail.workinghours.days && this.branchdetail.workinghours.days.length > 0){
      let ind;
      this.branchdetail.workinghours.days.forEach(workingday => {
        ind = this.wdoptions.findIndex(a=>a.value == workingday);
        if(ind != -1){ this.wdoptions[ind].checked = true } 
      });
    }
    this.starttime = this.branchdetail.workinghours.starttime;
    this.endtime =  this.branchdetail.workinghours.endtime;
    return;
  }

  async onSave(){
    var days = this.wdoptions.filter(a=>a.checked == true);
    if(!this.starttime || !this.endtime || days.length == 0 ){
      this.showNotification("top", "right", "Enter required fields !!", "danger");
      return;
    }
    var model  = {};
    model["workinghours"] = {};
    model["workinghours"] = {
      'starttime' : this.setTimers(this.starttime).hhmm,
      'endtime' : this.setTimers(this.endtime).hhmm,
      'days' : days.map(a=> a.value),
    };
    

    let url = 'branches';
    let method = "PATCH";

    console.log("model==>",model);
    
    this.disableButton = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, this.branchdetail._id)
      .then((data) => {
        this.branchdetail.workinghours = model["workinghours"];
        var localStoragetmp = JSON.parse(localStorage.getItem('currentUser'));
        var loginUser = localStoragetmp['user'];
        loginUser['branchid'] = this.branchdetail;
        localStoragetmp['user'] = loginUser;
        localStorage.removeItem('currentUser');
        localStorage.setItem('currentUser',JSON.stringify(localStoragetmp))
        $("#qtyClose").click();
        this.disableButton = false;
        this.showNotification("top", "right", "Working hours updated successfully !!", "success");
        setTimeout(() => {
          this.submitted.emit(localStoragetmp);  
        },200);
      }).catch((e) => {
        console.log("e==>",e);
        $("#qtyClose").click();
        this.disableButton = false;
        this.showNotification("top", "right", "Something went wrong !!", "danger");
      });

  }

  ngAfterViewInit() {
    
  }
 
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
 
}
