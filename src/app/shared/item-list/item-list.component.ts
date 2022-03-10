import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

import { CommonService } from '../../core/services/common/common.service';
import { Subject } from 'rxjs';

import { BaseLiteComponemntComponent } from '../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { BaseComponemntInterface } from '../base-componemnt/base-componemnt.component';

import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { MyCurrencyPipe } from './../../shared/components/currency.pipe';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
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
export class ItemListComponent extends BaseLiteComponemntComponent implements OnInit, BaseComponemntInterface {


  @Input() dataHtml: any;
  @Input() dataContent: any;
  @Input() schema: any;
  @Input() formObj: any;
  @Input() search: any
  @Output() onItemListsData: EventEmitter<any> = new EventEmitter<any>();

  bindId: any;

  totalPages = 0;
  totalCount = 0;
  isLoadingResults = false;
  pageSize = 10;
  currentPage: number = 1;

  destroy$: Subject<boolean> = new Subject<boolean>();
  data$: any [] = [];

  sortData: any;

  contentVisibility: boolean;

  gDateFormat: any = 'dd/MM/yyyy';

  constructor(
    private _commonService: CommonService,
    private _route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    private myCurrencyPipe: MyCurrencyPipe,
  ) {
    super()
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
    })
  }

  async ngOnInit() {
    await super.ngOnInit();
    try {
      await this.initializeVariables();
      await this.LoadData();
      
    } catch {
    } finally {
    }
  }

  async initializeVariables() {
    this.data$ = [];
    this.totalPages = 0;
    this.totalCount = 0;
    this.isLoadingResults = false;
    this.pageSize = 10;
    this.currentPage = 1;
    this.contentVisibility = false;
    this.sortData = {}
    return;
  }

  Save() {}
  Update() {}
  Delete() {}
  ActionCall() {}

  async LoadData() {
    
    this.isLoadingResults = true;
    this.contentVisibility = false;
    let method = "POST";
    let url = this.formObj.listurl.url;
    let postData = {};
    
    if(this.search) {
      postData["search"] = [];
      postData["search"] = this.search;
    }
    else if (this.formObj.searchfields) {
      postData["search"] = [];

      var shortcode_regex = /\[{(\w+)+\.?(\w+)\.?(\w+)\}]/mg;
     
      if(this.isMemberLogin){
        var tmpthis = this;
        var spltArray = [], final;

        this.formObj.searchfields.forEach(element => { 
          element.fieldvalue.replace(shortcode_regex, function (match, code) {
            var replace_str = match.replace('[{', '');
            replace_str = replace_str.replace('}]', '');
            spltArray = [],final = null;
            spltArray = replace_str.split(".");
            final = spltArray.length == 2 ? tmpthis.dataContent[`${spltArray[0]}`][`${spltArray[1]}`] : tmpthis.dataContent[spltArray[0]];
            element.fieldvalue = element.fieldvalue.replace("$[{" + replace_str + "}]", final);
          }); 
          postData["search"].push({ searchfield: element.fieldname, searchvalue: element.fieldvalue, datatype: element.fieldtype, criteria: element.criteria });
        });  
      }else{
        this.formObj.searchfields.forEach(element => {
          postData["search"].push({ searchfield: element.fieldname, searchvalue: element.fieldvalue, datatype: element.fieldtype, criteria: element.criteria });
        });
      }
    }


    if(this.sortData) {
      postData["sort"] = this.sortData;
    }
    if (this.formObj.formtype)
      postData["formtype"] = this.formObj.formtype;

    postData["pageNo"] = this.currentPage;
    postData["size"] = this.pageSize;
    postData["schemaname"] = this.formObj.schemaname;
    postData["viewname"] = this.formObj.viewname
    postData["formname"] = this.formObj.formname

    


    
    return this._commonService
      .commonServiceByUrlMethodDataPagination(url, method, postData)
      .then((data: any) => {
        if (data) {
         try{
          this.data$ = [];
          if(data && data.body && data.body.length !== 0)  {
            var i = 0;
            data.body.forEach(element => {
              if(i == 0 && this.currentPage == 1){
                let obj = this.dataContent;
                obj.dataHtml = this.parseHTMl(obj);
                this.data$.push(obj);
              }
              if(this.dataContent._id !== element._id) {
                element.dataHtml = this.parseHTMl(element);
                this.data$.push(element);
              } 
              i++;
            });
          }
          this.totalPages = data.headers.get('totalPages');
          this.totalCount = data.headers.get('totalCount');
          this.isLoadingResults = false;
          this.contentVisibility = true;
          
        }catch(e){
          console.error("e ", e); 
        }
          return;
        }
      }, (err) =>{
        this.isLoadingResults = false;
        console.error("err", err);
      });
  }

  parseHTMl(element) {
    
    if(!element['dataHtml']) element['dataHtml'] = "";
    element['dataHtml'] = this.formObj.displaycontent ? this.formObj.displaycontent : this.dataHtml;
    
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
          db_fieldValue = element[fieldnameSplit[0]] == 0 ? 0 : '';
        }

      }
      if (datatype && datatype == "Currency") {
        db_fieldValue = th.myCurrencyPipe.transform(db_fieldValue);
      }
      else if (datatype && datatype == "Date") {
        // db_fieldValue = th.datePipe.transform(db_fieldValue, th.gDateFormat);
        db_fieldValue = new Date(db_fieldValue).toLocaleDateString(th._commonService.currentLocale());
      }
      
      element.dataHtml = element.dataHtml.replace("$[{" + original + "}]", db_fieldValue ? db_fieldValue : '---');
    });

    element.dataHtml = element.dataHtml.replace("src=---", "src='./assets/img/default-avatar.png'");
    element.dataHtml = element.dataHtml.replace("src='---'", "src='./assets/img/default-avatar.png'");

    return element.dataHtml;
  }

  loadMore() {
    this.currentPage = this.currentPage + 1;
    this.LoadData();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  redirect(item: any) {
    
    // console.log("item", item);

    var postData = {
      bindData: item
    }
    this.bindId = item._id;
    this.onItemListsData.emit(postData);
    // var res = this.router.url.replace(this.bindId, item._id);
    // this.router.navigate([res]);
  }

  logAnimation(_event) {

  }

  filter(item: any) {
    this.search = [];
    if(item != 'All') {
      this.search = [item];
    }
    this.currentPage = 1;
    this.LoadData()
  }

  sort(item: any) {
    this.sortData = {};
    this.sortData[item.fieldname] = 1;
    this.currentPage = 1;
    this.LoadData()
  }
}
