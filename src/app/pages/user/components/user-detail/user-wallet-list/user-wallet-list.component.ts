import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-user-wallet-list',
  templateUrl: './user-wallet-list.component.html'
})
export class UserWalletListComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  transcationLists: any [] = [];
  filterTransactionLists: any [] = [];

  isLoading: boolean = false;
  disableBtn: boolean = false;

  walletsymbol: string;

  constructor(
    private _commonService: CommonService,
  ) {
      super();
      this.pagename="app-user-wallet-list";
   }

  @Input() dataContent: any;

  async ngOnInit() {

    await super.ngOnInit();
    try {
      await this.initializeVariables();
      await this.getWalletTransactionLists();
    } catch(error) {
    } finally {
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    this.transcationLists = [];
    this.filterTransactionLists = [];
    this.isLoading = false;
    this.disableBtn = false;
    this.walletsymbol = 'Pt.';
    return;
  }

  async getWalletTransactionLists() {

    var postData = {};
    postData["search"] = [];
    postData["search"].push({ searchfield: "customerid", searchvalue: this.dataContent._id, datatype: "ObjectId", criteria:"eq"  });
    postData["sort"] = { "txndate": 1 };

    var method = "POST";
    var url = "wallettxns/filter";

    

    this.isLoading = true;
    this.disableBtn = true;

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          
          this.transcationLists = data;

          if(this.transcationLists.length > 0){
            this.transcationLists.forEach(element => {
              element.isocreatedAt = new Date(element.createdAt);
              element.formattedDate = this.formatedDate(element.isocreatedAt);
              element.date = element.isocreatedAt.getFullYear()+'-' + (element.isocreatedAt.getMonth()+1) + '-'+element.isocreatedAt.getDate();
            });
          }

          this.sortFunction();

          this.isLoading = false;
          this.disableBtn = false;
          return;
        }
      }, (error)=>{
        console.error(error);
    });

  }

  sortFunction() {
    this.transcationLists.sort(function(a: any, b: any) {
      let dateA : any;
      dateA= new Date(a.createdAt);
      let dateB: any;
      dateB = new Date(b.createdAt);
      return dateB - dateA;
    });
    setTimeout(() => {
      this.filterTransactionLists = this.group(this.transcationLists);
       
      this.isLoading = true;
    }, 200);
    
  }

  group(arr: any) {
    return arr.reduce((r: any, o: any) => {
      if(o.date) {
        var p = o.date.split("-");
        var week = Math.floor(p.pop() / 7) + 1;
        //var month = p.reduce((o: any, p: any) => o[p] = o[p] || {}, r);
        var month = p.reduce((o: any, p: any) => o[p] = o[p] || [], r);
        // if(month[week]) month[week].push(o);
        // else month[week] = [o];
        month.push(o);
        return r;
      }
    }, {});
  }

  getMonthName(monthNumber: any) {

    var Month = new Array("January", "February", "March", 
    "April", "May", "June", "July", "August", "September", 
    "October", "November", "December");

    return Month[parseInt(monthNumber)-1];
  }

  formatedDate(currentTime: any) {
    var Month = new Array("January", "February", "March", 
    "April", "May", "June", "July", "August", "September", 
    "October", "November", "December");
    var Suffix=new Array("th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th");
    var day = currentTime.getDate();
    var month = currentTime.getMonth();
    var today;
    if (day % 100 >= 11 && day % 100 <= 13)
      today = day + "th";
    else
      today = day + Suffix[day % 10];
    return Month[month]+" "+ today;
  }


}
