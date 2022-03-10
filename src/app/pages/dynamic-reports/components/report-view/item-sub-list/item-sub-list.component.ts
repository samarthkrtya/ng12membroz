import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from 'src/app/core/services/common/common.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-item-sub-list',
  templateUrl: './item-sub-list.component.html',
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', style({ opacity: 0 }),{ optional: true }),
        query(':enter', stagger('100ms', [
          animate('1s', style({ opacity: 1 }))
        ]),{ optional: true })
      ])
    ])
  ],
})
export class ItemSubListComponent extends BaseLiteComponemntComponent implements OnInit {


  @Input() htmlContent: any;
  @Input() bindId: any;
  @Output() onItemListsData: EventEmitter<any> = new EventEmitter<any>();
 
  isLoadingResults = false;
  
  destroy$: Subject<boolean> = new Subject<boolean>();
  data$: any [] = [];

  constructor(
    private _commonService: CommonService,
  ) {
    super();
  }

  async ngOnInit() {
    await super.ngOnInit();
    try {
      await this.initializeVariables();
      this.getAllReports();
    } catch {
    } finally {
    }
  }

  async initializeVariables() {
    this.data$ = [];
    this.isLoadingResults = false; 
    return;
  }
 
  getAllReports(){

    let apiurl = 'reports/filter/all';
    let apimethod = 'POST';
    let listFilterParams = {};

    this.isLoadingResults = true;
    
    this._commonService
        .commonServiceByUrlMethodData(apiurl, apimethod, listFilterParams)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
            data.map((a)=>{
              a.isChartEnabled = a.selectfields.filter(b=>b.ishorizontal  ==  true).length > 0;
            });
            this.data$ = [];
            this.data$ = this.parseHTMl(this.htmlContent,data);
            this.isLoadingResults = false;
        });
  }

  redirect(item : any){
    this.onItemListsData.emit(item);
  }

 parseHTMl(dataHtml , listData) {
  var finalDataList = [] , tmpList = [] ,ind;
  for (let i = 0; i < listData.length; i++) {
      const element = listData[i];
      element.dataHtml = dataHtml;
      var shortcode_regex = /\[{(\w+)+\@?\.?(\w+)\@?\.?(\w+)\}]/mg;
      var th: any = this;
      element.dataHtml.replace(shortcode_regex, function (match, code) {
  
      var replace_str = match.replace('[{', '');
      replace_str = replace_str.replace('}]', '');
      var original = replace_str;
      var datatype;
  
      if(replace_str.startsWith("DATE@")) {
          datatype = "Date";
          replace_str = replace_str.substring("DATE@".length)
      } else if(replace_str.startsWith("CURRENCY@")) {
          datatype = "Currency"
          replace_str = replace_str.substring("CURRENCY@".length)
      }
  
      var db_fieldValue;
      var fieldnameSplit = replace_str.split('.');
  
      if (fieldnameSplit[3]) {
          if (element[fieldnameSplit[0]]) {
          var obj = element[fieldnameSplit[0]][fieldnameSplit[1]]
          db_fieldValue = obj[fieldnameSplit[2]][fieldnameSplit[3]];
          } else {
          db_fieldValue ='';
          }
  
      } else if (fieldnameSplit[2]) {
          if (element[fieldnameSplit[0]]) {
          var obj = element[fieldnameSplit[0]][fieldnameSplit[1]]
          db_fieldValue = obj[fieldnameSplit[2]];
          } else {
          db_fieldValue ='';
          }
  
      } else if (fieldnameSplit[1]) {
          if (element[fieldnameSplit[0]]) {
          db_fieldValue = element[fieldnameSplit[0]][fieldnameSplit[1]];
          } else {
          db_fieldValue ='';
          }
  
      } else if (fieldnameSplit[0]) {
          if (element[fieldnameSplit[0]]) {
          db_fieldValue = element[fieldnameSplit[0]];
          } else {
          db_fieldValue ='';
          }
  
      }

      

      element.dataHtml = element.dataHtml.replace("$[{" + original + "}]", db_fieldValue ? db_fieldValue : '---');
      if("@[{"+ original + "}]"){
        element.dataHtml = element.dataHtml.replace("@[{" + original + "}]", db_fieldValue ? 'd-block' : 'd-none');
      }
      });
      
      ind = tmpList.findIndex(a=> a == element.category);
      if(ind == -1){
          if(!finalDataList[tmpList.length]){
              finalDataList[tmpList.length] = [];
          }
          finalDataList[tmpList.length].push(element);
          tmpList.push(element.category);
      }else{
          finalDataList[ind].push(element);
      }
 }
 return finalDataList;
}


  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
 
}
