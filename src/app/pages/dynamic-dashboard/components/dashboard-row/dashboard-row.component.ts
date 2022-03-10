import { Component, OnInit, AfterViewInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Subject } from 'rxjs';
import * as Chartist from 'chartist';
import * as moment from 'moment';

import 'chartist-plugin-legend';

import { AuthService } from '../../../../core/services/common/auth.service';
import { AdminDashboardService } from '../../../../core/services/admin/adminDashboard.service';
import { CommonDataService } from './../../../../core/services/common/common-data.service';
import { CommonService } from '../../../../core/services/common/common.service';
import { MyCurrencyPipe } from '../../../../shared/components/currency.pipe';
import { takeUntil } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDatepicker } from '@angular/material/datepicker';
import { Moment } from 'moment';
import { IBarChartOptions, IPieChartOptions } from 'chartist';

declare var $: any;

@Component({
  selector: 'app-dashboard-row',
  templateUrl: './dashboard-row.component.html',
})

export class DashboardRowComponent implements OnInit, AfterViewInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

  selectMonthYearArray: any[] = [];

  defaultLabelArr: any[] = [];
  defaultseriesArr: any[] = [];
  defaultPLabelArr: any[] = [];
  defaultPseriesArr: any[] = [];

  isLoadForms = false;

  formList: any[] = [];

  currentuser: string;
  currentusermembership: string;
  LoginUserObj: any = {};
  currentuserDashboard: any;
  currentuserDashboardId: string;
  displayContent: string;
  currentDashboardRows: any = [];

  @Input('rows') rowsValue: any[] = [];
  @Input('dataparam') dataparamValue: any = {};

  dbid: any;

  constructor(
    private sanitizer: DomSanitizer,
    private _router: Router,
    private datePipe: DatePipe,
    private _myCurrencyPipe: MyCurrencyPipe,
    private  route : ActivatedRoute,
    private _adminDashboardService: AdminDashboardService,
    private _commonDataService: CommonDataService,
    private _commonService: CommonService,
    private _authService: AuthService,

  ) {


    this.route.params.forEach(params => {
      this.dbid = params['dbid']
    });

    this.currentuser = this._authService.currentUser.user._id;

    if (this._authService.currentUser.user.membershipid) {
      this.currentusermembership = this._authService.currentUser.user.membershipid._id;
    }
 

    this.LoginUserObj = this._authService.currentUser;
    if (this.rowsValue && this.rowsValue.length > 0) {
      this.getrowData2();
    } else if (this.LoginUserObj && this.LoginUserObj.role && this.LoginUserObj.role.dashboard) {
      if (this.LoginUserObj.role.dashboard._id) {
        this.currentuserDashboardId = this.LoginUserObj.role.dashboard._id;
        this.currentuserDashboard = this.LoginUserObj.role.dashboard;
        if (this.currentuserDashboard.rows) {
          this.currentDashboardRows = this.currentuserDashboard.rows;
          this.rowsValue = this.currentuserDashboard.rows;
          this.getrowData2();
        }
      } else {
        this.currentuserDashboardId = this.LoginUserObj.role.dashboard;
      }
    }

    // if (this.LoginUserObj && this.LoginUserObj.user && this.LoginUserObj.user.branchid && this.LoginUserObj.user.branchid.dateformat) {
    //   this.gDateFormat = this.LoginUserObj.user.branchid.dateformat;
    //   this.gDateTimeFormat = this.LoginUserObj.user.branchid.dateformat + ', h:mm a';
    // }
    this.defaultLabelArr = this._adminDashboardService.defaultLabelArr;
    this.defaultseriesArr = this._adminDashboardService.defaultseriesArr;
    this.defaultPLabelArr = this._adminDashboardService.defaultLabelArr;
    //this.defaultPLabelArr = ['nodata'];
    this.defaultPseriesArr = [0];
  }


  ngOnInit() {
    this.selectMonthYearArray = this._adminDashboardService.selectMonthYearArray;
    // sl 
  }

  getrowData2() {
    let filterobj: any = {};
    filterobj.matches = [];
    // filterobj.matches.push( { "searchfield": "date", "searchvalue": { "$gte": "2019-02-04T20:28:30.397Z", "$lte": "2020-12-04T20:28:30.397Z"	}, "criteria": "eq", "datatype": "Date" });

    if ((this.dataparamValue.fromdate != undefined) && (this.dataparamValue.todate != undefined)) {
      filterobj.matches.push({ "searchfield": "date", "searchvalue": { "$gte": this.dataparamValue.fromdate, "$lte": this.dataparamValue.todate }, "criteria": "eq", "datatype": "Date" });
    } else {
      filterobj.matches.push({ "searchfield": "date", "searchvalue": { "$gte": new Date(-8640000000000000), "$lte": new Date(8640000000000000) }, "criteria": "eq", "datatype": "Date" });
    }


    var url = this.dbid ? this.dbid : this.currentuserDashboardId

    this._commonService
      .commonServiceByUrlMethodData('dashboard/' + url, "POST", filterobj)
      .pipe(takeUntil(this.destroy$))
      .subscribe((alldata: any) => {
        if (alldata) {
          let data: any;
          if (this.rowsValue.length > 0) {
            this.rowsValue.forEach(ele => {
              if (ele.webparts != undefined && ele.webparts.length > 0) {
                let webpartList: any[] = [];
                webpartList = ele.webparts;

                webpartList.forEach(ele2 => {
                  ele2.modeldata = '';
                  ele2.headerfields = [];
                  ele2.headerdisplayfields = [];
                  ele2.datarows = [];
                  ele2.isLoading = true;
                  let wdatobj: any = alldata.find(ele85 => ele85.webpartid == ele2._id);
                  if (wdatobj != undefined && wdatobj.data != undefined) {
                    data = wdatobj.data;
                  }

                  if (ele2.webparttype != undefined && data != undefined) {
                    if (ele2.webparttype == 'single-data') {
                      if (ele2.subwebparttype && ele2.subwebparttype == 'content-single-data') {
                        ele2.modeldata = [];

                        if (ele2.modeldata != []) {
                          ele2.modeldata = [];
                        }
                        if (ele2.fields && data) {
                          let tempHeader: any[] = ele2.fields;
                          if (tempHeader) {
                            let prop = tempHeader[0].fieldname;
                            let prop2 = tempHeader[1].fieldname;
                            data.forEach(element => {
                              if (element) {
                                let url: any;
                                if (element[prop2] != null && element[prop2].length > 0) {
                                  url = element[prop2][0];
                                }
                                let DisplayData = {
                                  cont: element[prop],
                                  urls: url
                                }
                                ele2.modeldata.push(DisplayData)
                              }
                            });
                          }
                        }
                      } else {
                        ele2.modeldata = 0;
                        if(ele2.iconcontent){
                          ele2.iconcontent =  this.sanitizer.bypassSecurityTrustHtml(ele2.iconcontent);
                        }
                        if (ele2.fields != undefined) {
                          if (data[0] != undefined) {
                            let tempHeader: any[] = ele2.fields;
                            if (tempHeader[0] != undefined && tempHeader[0].fieldname != undefined) {
                              let prop = tempHeader[0].fieldname;
                              let proptype = tempHeader[0].fieldtype;
                              if (data[0][prop] != undefined) {
                                if (proptype) {
                                  if (proptype == 'currency') {
                                    ele2.modeldata = this._myCurrencyPipe.transform(data[0][prop]);
                                  } else {
                                    ele2.modeldata = data[0][prop];
                                  }
                                } else {
                                  ele2.modeldata = data[0][prop];
                                }
                                ele2.linkurl = ele2.linkurl;
                              }
                            }
                          }
                        }
                      }
                    }
                    if (ele2.webparttype == 'grid') {
                      ele2.headerfields = [];
                      ele2.headerdisplayfields = [];
                      ele2.datarows = [];
                      ele2.detailList = [];
                      if (ele2.fields != undefined) {
                        let tempHeader: any[] = ele2.fields;
                        tempHeader.map(a => a.display = a.isshow == false ? false : true);

                        if (tempHeader.length > 0) {
                          tempHeader = tempHeader.sort((n1, n2) => { if (n1.displayOrder > n2.displayOrder) { return 1; } if (n1.displayOrder < n2.displayOrder) { return -1; } return 0; });
                          tempHeader.forEach(headele => {
                            if (headele.display == false) {
                              return;
                            }
                            if (headele.fieldname != undefined) {
                              ele2.headerfields.push(headele.fieldname);
                            }
                            if (headele.displayname != undefined) {
                              ele2.headerdisplayfields.push(headele.displayname);
                            }
                          });
                          if (ele2.gridaction && ele2.gridaction.length > 0) {
                            ele2.headerdisplayfields.push('Action');
                          }

                          let detailList: any[] = data;
                          ele2.detailList = data;

                          if (detailList.length > 0) {
                            detailList.forEach(element => {
                              const tempdata: any[] = [];
                              ele2.headerfields.forEach(element2 => {
                                if (element2.indexOf('.') != -1) {
                                  let prop = element2.split('.');
                                  if (prop.length > 0) {

                                    if (prop.length == 2) {
                                      let prop0: string = prop[0];
                                      let prop1: string = prop[1];
                                      if (element[prop0]) {
                                        let tempObj: any = element[prop0];
                                        if (tempObj != undefined) {
                                          if (tempObj[prop1] != undefined) {
                                            if (tempHeader != undefined) {
                                              let objToP = tempHeader.find(eleF => eleF.fieldname == element2);
                                              if (objToP != undefined) {
                                                if (objToP.fieldtype != undefined && (objToP.fieldtype.toLowerCase() == 'date' || objToP.fieldtype == 'datepicker')) {
                                                  // tempdata.push(this.datePipe.transform(tempObj[prop1], this.gDateFormat));
                                                  tempdata.push(new Date(tempObj[prop1]).toLocaleDateString(this._commonService.currentLocale()));
                                                } else if (objToP.fieldtype != undefined && (objToP.fieldtype.toLowerCase() == 'datetime')) {
                                                  // tempdata.push(this.datePipe.transform(tempObj[prop1], this.gDateTimeFormat));
                                                  tempdata.push(new Date(tempObj[prop1]).toLocaleString(this._commonService.currentLocale()));
                                                } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'Currency')) {
                                                  tempdata.push(this._myCurrencyPipe.transform(tempObj[prop1]));
                                                } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'html')) {
                                                  tempdata.push(this.sanitizer.bypassSecurityTrustHtml(element[element2]));
                                                } else {
                                                  tempdata.push(tempObj[prop1]);
                                                }
                                              } else {
                                                tempdata.push(tempObj[prop1]);
                                              }
                                            } else {
                                              tempdata.push(tempObj[prop1]);
                                            }


                                          } else {
                                            tempdata.push('---');
                                          }
                                        }
                                      } else {
                                        tempdata.push('---');
                                      }
                                    }
                                    if (prop.length == 3) {
                                      let prop0: string = prop[0];
                                      let prop1: string = prop[1];
                                      let prop2: string = prop[2];
                                      if (element[prop0] != undefined) {
                                        let tempObj: any = element[prop0];
                                        if (tempObj != undefined) {
                                          if (tempObj[prop1] != undefined) {
                                            let tempObj2: any = tempObj[prop1];
                                            if (tempObj2[prop2] != undefined) {
                                              if (tempHeader != undefined) {
                                                let objToP = tempHeader.find(eleF => eleF.fieldname == element2);
                                                if (objToP != undefined) {
                                                  if (objToP.fieldtype != undefined && (objToP.fieldtype.toLowerCase() == 'date' || objToP.fieldtype == 'datepicker')) {
                                                    // tempdata.push(this.datePipe.transform(tempObj2[prop2], this.gDateFormat));
                                                    tempdata.push(new Date(tempObj2[prop2]).toLocaleDateString(this._commonService.currentLocale()));
                                                  } else if (objToP.fieldtype != undefined && (objToP.fieldtype.toLowerCase() == 'datetime')) {
                                                    // tempdata.push(this.datePipe.transform(tempObj2[prop2], this.gDateTimeFormat));
                                                    tempdata.push(new Date(tempObj2[prop2]).toLocaleString(this._commonService.currentLocale()));
                                                  } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'Currency')) {
                                                    tempdata.push(this._myCurrencyPipe.transform(tempObj2[prop2]));
                                                  } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'html')) {
                                                    tempdata.push(this.sanitizer.bypassSecurityTrustHtml(element[element2]));
                                                  } else {
                                                    tempdata.push(tempObj2[prop2]);
                                                  }
                                                } else {
                                                  tempdata.push(tempObj2[prop2]);
                                                }
                                              } else {
                                                tempdata.push(tempObj2[prop2]);
                                              }

                                            } else {
                                              tempdata.push('---');
                                            }
                                          } else {
                                            tempdata.push('---');
                                          }
                                        }
                                      } else {
                                        tempdata.push('---');
                                      }
                                    }
                                  }
                                } else {

                                  if (element[element2] != undefined) {
                                    if (tempHeader != undefined) {
                                      let objToP = tempHeader.find(eleF => eleF.fieldname == element2);
                                      if (objToP != undefined) {
                                        if (objToP.fieldtype != undefined && (objToP.fieldtype.toLowerCase() == 'date' || objToP.fieldtype == 'datepicker')) {
                                          // tempdata.push(this.datePipe.transform(element[element2], this.gDateFormat));
                                          tempdata.push(new Date(element[element2]).toLocaleDateString(this._commonService.currentLocale()));
                                        } else if (objToP.fieldtype != undefined && (objToP.fieldtype.toLowerCase() == 'datetime')) {
                                          // tempdata.push(this.datePipe.transform(element[element2], this.gDateTimeFormat));
                                          tempdata.push(new Date(element[element2]).toLocaleString(this._commonService.currentLocale()));
                                        } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'Currency')) {
                                          tempdata.push(this._myCurrencyPipe.transform(element[element2]));
                                        } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'html')) {
                                          tempdata.push(this.sanitizer.bypassSecurityTrustHtml(element[element2]));
                                        }
                                        else {
                                          tempdata.push(element[element2]);
                                        }
                                      } else {
                                        tempdata.push(element[element2]);
                                      }
                                    } else {
                                      tempdata.push(element[element2]);
                                    }

                                  } else {
                                    tempdata.push('---');
                                  }
                                }
                              });
                              if (ele2.gridaction && ele2.gridaction.length > 0) {
                                tempdata.push(element._id);
                              }

                              if (tempdata.length > 0) {
                                ele2.datarows.push(tempdata);
                              }
                            });


                          }
                        }

                      }
                    }
                    if (ele2.webparttype == 'getting-started') {
                      if (ele2.fields != undefined) {
                        let tempHeader: any[] = ele2.fields;
                        if (tempHeader.length > 0) {
                          tempHeader = tempHeader.sort((n1, n2) => { if (n1.displayOrder > n2.displayOrder) { return 1; } if (n1.displayOrder < n2.displayOrder) { return -1; } return 0; });
                          let detailList: any[] = data;
                          if (detailList.length > 0) {
                            detailList.forEach(element => {

                              var shortcode_regex = /\[{(\w+)+\.?(\w+)\.?(\w+)\}]/mg;
                              ele2.content.replace(shortcode_regex, function (match, code) {

                                var replace_str = match.replace('[{', '');
                                replace_str = replace_str.replace('}]', '');

                                var db_fieldValue;
                                var fieldnameSplit = replace_str.split('.');

                                if (fieldnameSplit[1] == undefined || fieldnameSplit[1] == null) {
                                  var fieldname1 = fieldnameSplit[0];
                                  if (element[fieldname1]) {
                                      db_fieldValue = element[fieldname1];
                                  } else {
                                    if (element[fieldname1] == '0') {
                                      db_fieldValue = '0';
                                    } else {
                                      db_fieldValue = '---';
                                    }
                                  }
                                }
                                if (db_fieldValue) {
                                    ele2.content = ele2.content.replace("$[{" + replace_str + "}]", db_fieldValue);
                                }
                              });
                            });
                          }
                        }
                      }
                    }
                    if (ele2.webparttype == 'grid-template') {

                      if (ele2.fields != undefined) {
                        let tempHeader: any[] = ele2.fields;
                        if (tempHeader.length > 0) {
                          tempHeader = tempHeader.sort((n1, n2) => { if (n1.displayOrder > n2.displayOrder) { return 1; } if (n1.displayOrder < n2.displayOrder) { return -1; } return 0; });
                          let detailList: any[] = data;
                          if (detailList.length > 0) {
                            detailList.forEach(element => {

                              var shortcode_regex = /\[{(\w+)+\.?(\w+)\.?(\w+)\}]/mg;
                              var th: any = this;
                              ele2.content.replace(shortcode_regex, function (match, code) {

                                var replace_str = match.replace('[{', '');
                                replace_str = replace_str.replace('}]', '');

                                var db_fieldValue;
                                var fieldnameSplit = replace_str.split('.');

                                if (fieldnameSplit[1] == undefined || fieldnameSplit[1] == null) {
                                  var fieldname1 = fieldnameSplit[0];
                                  if (element[fieldname1]) {
                                    if (fieldname1 == 'membershipstart' || fieldname1 == 'membershipend' || fieldname1 == 'createdAt' || fieldname1 == 'paymentdate' || fieldname1 == 'scheduledate' || fieldname1 == 'billingdate') {
                                      db_fieldValue = th.datePipe.transform(element[fieldname1], th.gDateFormat);
                                    } else {
                                      db_fieldValue = element[fieldname1];
                                    }
                                  } else {
                                    if (element[fieldname1] == '0') {
                                      db_fieldValue = '0';
                                    } else {
                                      db_fieldValue = '---';
                                    }
                                  }
                                }
                                if (db_fieldValue) {
                                  if (replace_str == 'qrcode') {
                                    ele2.content = ele2.content.replace("$[{" + replace_str + "}]", '<img src=\"' + db_fieldValue + '\"  class=\"img\" title=\"QR CODE\">');
                                  } else {
                                    ele2.content = ele2.content.replace("$[{" + replace_str + "}]", db_fieldValue);
                                  }

                                }
                              });
                            });
                          } else {
                            var shortcode_regex = /\[{(\w+)+\.?(\w+)\.?(\w+)\}]/mg;
                            ele2.content.replace(shortcode_regex, function (match, code) {
                              var replace_str = match.replace('[{', '');
                              replace_str = replace_str.replace('}]', '');
                              ele2.content = ele2.content.replace("$[{" + replace_str + "}]", '---');
                            });
                          }
                        }
                      }
                    }
                    if (ele2.webparttype == 'table-template') {
                      if (ele2.fields != undefined) {
                        let tempHeader: any[] = ele2.fields;
                        if (tempHeader.length > 0) {
                          tempHeader = tempHeader.sort((n1, n2) => { if (n1.displayOrder > n2.displayOrder) { return 1; } if (n1.displayOrder < n2.displayOrder) { return -1; } return 0; });

                          let detailList: any[] = data;
                          ele2.datarows = [];
                          ele2.maincontent = '';
                          if (detailList.length > 0) {
                            detailList.forEach(element => {
                              var shortcode_regex = /\[{(\w+)+\.?(\w+)\.?(\w+)\}]/mg;
                              var th: any = this;
                              ele2.maincontent = ele2.content;
                              ele2.maincontent.replace(shortcode_regex, function (match, code) {

                                var replace_str = match.replace('[{', '');
                                replace_str = replace_str.replace('}]', '');

                                var db_fieldValue;
                                var fieldnameSplit = replace_str.split('.');
                                if (fieldnameSplit[1] == undefined || fieldnameSplit[1] == null) {
                                  var fieldname1 = fieldnameSplit[0];
                                  var fields = tempHeader.find(a => a.fieldname == fieldname1);

                                  if (element[fieldname1]) {
                                    if (fields.fieldtype.toLowerCase() == 'date' || fields.fieldtype.toLowerCase() == 'datepicker') {
                                      db_fieldValue = th.datePipe.transform(element[fieldname1], th.gDateFormat);
                                    } else if (fields.fieldtype.toLowerCase() == 'datetime') {
                                      db_fieldValue = th.datePipe.transform(element[fieldname1], th.gDateTimeFormat);
                                    } else if (fields.fieldtype.toLowerCase() == 'currency') {
                                      db_fieldValue = th._myCurrencyPipe.transform(element[fieldname1]);
                                    } else {
                                      db_fieldValue = element[fieldname1];
                                    }
                                  } else {
                                    if (element[fieldname1] == '0') {
                                      db_fieldValue = '0';
                                    } else {
                                      db_fieldValue = '---';
                                    }
                                  }
                                }
                                if (db_fieldValue) {
                                  ele2.maincontent = ele2.maincontent.replace("$[{" + replace_str + "}]", db_fieldValue);
                                }
                              });
                              ele2.datarows.push(ele2.maincontent);
                            });
                          }
                        }
                      }
                    }
                    if(ele2.webparttype == 'bar-chart'){
                      let fields =  ele2.fields[0];
                      let displayName =  [];
                      let displatValue =  [];

                      if(ele2.webpartfilter && ele2.webpartfilter.length > 0){
                        ele2.webpartfilter.forEach(match => {
                          match.selectedVal = moment();
                        }); 
                      }

                      ele2.CountDataBCH = {};
                      ele2.CountDataBCH['labels'] = [];
                      ele2.CountDataBCH['series'] = [];
                      
                      data.forEach(ele => {
                        displayName.push(ele[fields.displayname]);
                        displatValue.push(ele[fields.fieldname]);
                      });
                      ele2.CountDataBCH['labels'] = displayName;
                      ele2.CountDataBCH['series'] = [displatValue];
                      
                      setTimeout(() => {
                        var chart = new Chartist.Bar('#barchart' + ele2._id, ele2.CountDataBCH ,{ 
                          seriesBarDistance: 10,
                          axisX: {
                            offset: 40
                          },
                          axisY: {
                            offset: 60
                            }
                         });
                      //    chart.on('created', function(context) {
                          
                      //    if(context.type  ==  "label"){
                      //     console.log("context",context);
                      //   //    context.element.attr({
                      //   //     //  style: 'font-size: 10px;'
                      //   //    });
                      //    }
                      //  });
                      }, 500);
                    }
                    if(ele2.webparttype == 'pie-chart'){

                      let fields =  ele2.fields;
                      ele2.CountDataBCH = {};
                      ele2.CountDataBCH['labels'] = [];
                      ele2.CountDataBCH['series'] = [];
                      
                      let displayName =  [];
                      let displatValue =  [];

                      fields.forEach(field => {
                        
                        if(field.isheader){
                          data.forEach((ele , i) => {
                            displayName.push(ele[field.fieldname]);
                          });
                        }else{
                          data.forEach(ele => {
                           displatValue.push(ele[field.fieldname]);
                          });
                        }
                      });
                      if(displayName.length == 0 && displatValue.length == 0){ 
                          ele2.CountDataBCH['labels'] = [ 'No Data' ];
                          ele2.CountDataBCH['series'] = [ 100 ];
                          var options : IPieChartOptions = {
                            height : 300,
                            width  : 300,
                            showLabel : false,
                            plugins : [
                              Chartist.plugins.legend()
                            ]
                          };
                      }else{
                        ele2.CountDataBCH['labels'] = displayName;
                        ele2.CountDataBCH['series'] = displatValue;
                        var options : IPieChartOptions = {
                          height : 300,
                          width  : 300,
                          showLabel : false,
                          plugins : [
                            Chartist.plugins.legend()
                          ]
                        };
                    }
                      setTimeout(() => {
                        var chart =  new Chartist.Pie('#piechart' + ele2._id, ele2.CountDataBCH, options);
                        chart.on('draw', function(context) {
                          if(context.type  ==  "label"){
                            context.element.attr({
                              // style: 'fill: hsl(' + Math.floor(context.index * 50) + ', 50%, 50%);'
                              style: 'fill: white;'
                            });
                          }
                        }); 
                      }, 500);
                    }
                  }
                  ele2.isLoading = false;
                });
              }
            })
          }
        }
      }, data => {

      });
  }

  gridFilter(webpart: any, num: number) {
    const currentDate: Date = new Date(Date.now());
    var fromday = new Date();
    fromday = new Date(new Date().setDate((currentDate.getDate() - num)));

    let postData = {};
    postData['webpartid'] = webpart._id;
    postData['matches'] = [];
    if (num) {
      postData['matches'].push({ "searchfield": "date", "searchvalue": { "$gte": fromday, "$lte": currentDate }, "criteria": "eq", "datatype": "Date" });
    }

    let url = 'dashboard/webpart/filter';
    let method = 'POST';

    webpart.isLoading = true;
    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {

        webpart.datarows = [];
        webpart.detailList = [];

        let tempHeader: any[] = webpart.fields;

        if (tempHeader.length > 0) {
          let detailList: any[] = data.data;
          webpart.detailList = data.data;

          if (detailList.length > 0) {
            detailList.forEach(element => {
              const tempdata: any[] = [];
              webpart.headerfields.forEach(element2 => {
                if (element2.indexOf('.') != -1) {
                  let prop = element2.split('.');
                  if (prop.length > 0) {
                    if (prop.length == 2) {
                      let prop0: string = prop[0];
                      let prop1: string = prop[1];
                      if (element[prop0]) {
                        let tempObj: any = element[prop0];
                        if (tempObj != undefined) {
                          if (tempObj[prop1] != undefined) {
                            if (tempHeader != undefined) {
                              let objToP = tempHeader.find(eleF => eleF.fieldname == element2);
                              if (objToP != undefined) {
                                if (objToP.fieldtype != undefined && (objToP.fieldtype.toLowerCase() == 'date' || objToP.fieldtype == 'datepicker')) {
                                  // tempdata.push(this.datePipe.transform(tempObj[prop1], this.gDateFormat));
                                  tempdata.push(new Date(tempObj[prop1]).toLocaleDateString(this._commonService.currentLocale()));
                                } else if (objToP.fieldtype != undefined && (objToP.fieldtype.toLowerCase() == 'datetime')) {
                                  // tempdata.push(this.datePipe.transform(tempObj[prop1], this.gDateTimeFormat));
                                  tempdata.push(new Date(tempObj[prop1]).toLocaleString(this._commonService.currentLocale()));
                                } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'Currency')) {
                                  tempdata.push(this._myCurrencyPipe.transform(tempObj[prop1]));
                                } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'html')) {
                                  tempdata.push(this.sanitizer.bypassSecurityTrustHtml(element[element2]));
                                } else {
                                  tempdata.push(tempObj[prop1]);
                                }
                              } else {
                                tempdata.push(tempObj[prop1]);
                              }
                            } else {
                              tempdata.push(tempObj[prop1]);
                            }


                          } else {
                            tempdata.push('---');
                          }
                        }
                      } else {
                        tempdata.push('---');
                      }
                    }
                    if (prop.length == 3) {
                      let prop0: string = prop[0];
                      let prop1: string = prop[1];
                      let prop2: string = prop[2];
                      if (element[prop0] != undefined) {
                        let tempObj: any = element[prop0];
                        if (tempObj != undefined) {
                          if (tempObj[prop1] != undefined) {
                            let tempObj2: any = tempObj[prop1];
                            if (tempObj2[prop2] != undefined) {
                              if (tempHeader != undefined) {
                                let objToP = tempHeader.find(eleF => eleF.fieldname == element2);
                                if (objToP != undefined) {
                                  if (objToP.fieldtype != undefined && (objToP.fieldtype.toLowerCase() == 'date' || objToP.fieldtype == 'datepicker')) {
                                    // tempdata.push(this.datePipe.transform(tempObj2[prop2], this.gDateFormat));
                                    tempdata.push(new Date(tempObj2[prop2]).toLocaleDateString(this._commonService.currentLocale()));
                                  } else if (objToP.fieldtype != undefined && (objToP.fieldtype.toLowerCase() == 'datetime')) {
                                    // tempdata.push(this.datePipe.transform(tempObj2[prop2], this.gDateTimeFormat));
                                    tempdata.push(new Date(tempObj2[prop2]).toLocaleString(this._commonService.currentLocale()));
                                  } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'Currency')) {
                                    tempdata.push(this._myCurrencyPipe.transform(tempObj2[prop2]));
                                  } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'html')) {
                                    tempdata.push(this.sanitizer.bypassSecurityTrustHtml(element[element2]));
                                  } else {
                                    tempdata.push(tempObj2[prop2]);
                                  }
                                } else {
                                  tempdata.push(tempObj2[prop2]);
                                }
                              } else {
                                tempdata.push(tempObj2[prop2]);
                              }

                            } else {
                              tempdata.push('---');
                            }
                          } else {
                            tempdata.push('---');
                          }
                        }
                      } else {
                        tempdata.push('---');
                      }
                    }
                  }
                } else {

                  if (element[element2] != undefined) {
                    if (tempHeader != undefined) {
                      let objToP = tempHeader.find(eleF => eleF.fieldname == element2);
                      if (objToP != undefined) {
                        if (objToP.fieldtype != undefined && (objToP.fieldtype.toLowerCase() == 'date' || objToP.fieldtype == 'datepicker')) {
                          // tempdata.push(this.datePipe.transform(element[element2], this.gDateFormat));
                          tempdata.push(new Date(element[element2]).toLocaleDateString(this._commonService.currentLocale()));
                        } else if (objToP.fieldtype != undefined && (objToP.fieldtype.toLowerCase() == 'datetime')) {
                          // tempdata.push(this.datePipe.transform(element[element2], this.gDateTimeFormat));
                          tempdata.push(new Date(element[element2]).toLocaleString(this._commonService.currentLocale()));
                        } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'Currency')) {
                          tempdata.push(this._myCurrencyPipe.transform(element[element2]));
                        } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'html')) {
                          tempdata.push(this.sanitizer.bypassSecurityTrustHtml(element[element2]));
                        }
                        else {
                          tempdata.push(element[element2]);
                        }
                      } else {
                        tempdata.push(element[element2]);
                      }
                    } else {
                      tempdata.push(element[element2]);
                    }

                  } else {
                    tempdata.push('---');
                  }
                }
              });

              if (webpart.gridaction && webpart.gridaction.length > 0) {
                tempdata.push(element._id);
              }
              if (tempdata.length > 0) {
                webpart.datarows.push(tempdata);
              }
            });
          }
          webpart.isLoading = false;
        }
      }, (e) => {
        webpart.isLoading = false;

      });
  }

  listactiontodo(listO: any, id: any, row: any, obj: any) {


    if (listO.action != undefined) {
      if (listO.formname != undefined) {
        if (this.formList.length > 0) {
          this.formList.forEach(eleform => {
            if (eleform.formname == listO.formname) {
              listO.formid = eleform._id;
            }
          })
        }
      }

      if (listO.action == 'externalurl') {
        listO.actionurl = listO.actionurl.replace('{:_id}', id);
        window.location.href = listO.actionurl;
      }
      else if (listO.action == 'edit') {
        if (listO.type != undefined && listO.type == 'redirect') {
          if (listO.formid != undefined && listO.formid != '') {
            this._router.navigate(['/pages/dynamic-forms/form/' + listO.formid + '/' + id]);
          }

        } else if (listO.type != undefined && listO.type == 'custom') {
          this._router.navigate([listO.actionurl + '/' + id]);
        } else {
          if (listO.formid != undefined && listO.formid != '') {
            this._router.navigate(['/pages/dynamic-forms/form/' + listO.formid + '/' + id]);
          }
        }

      } else if (listO.action == 'cancel') {
        if (listO.type != undefined && listO.type == 'redirect') {
          this._router.navigate([listO.actionurl + id]);
        }
      } else if (listO.action == 'isredirect') {
        if (listO.type != undefined && listO.type == 'recharge' && id.memberid) {
          var actionurl = listO.actionurl.replace("id", id.memberid);

          this._router.navigate([actionurl]);
        } else if (listO.type != undefined && listO.type == 'redirect') {
          this._router.navigate([listO.actionurl]);
        } else if (listO.type != undefined && listO.type == 'custom') {
          var url = listO.actionurl;

          if (url.indexOf(":") > 0) {
            var str = url.substring(url.indexOf(":"));
            var ind = str.indexOf("/");
            url = url.replace(":_id", id);
          }
          this._router.navigate([url]);
        } else if (listO.type != undefined && listO.type == 'customreplace') {
          var actnurl = listO.actionurl;
          var res = actnurl.substring(actnurl.indexOf(":"));
          var ary = res.split('/');
          var newary = ary.map(str => str.replace(":", ""));
          newary.forEach(a => {
            listO.actionurl = listO.actionurl.replace(`:${a}`, obj[a])
          });
          var url = listO.actionurl;
          this._router.navigate([url]);
        } else if (listO.type != undefined && listO.type == 'customwithformid') {
          if (listO.formid != undefined && listO.formid != '') {
            this._router.navigate([listO.actionurl + '/' + listO.formid + '/' + id]);
          }
        }
      }
    }
  }


  renderText(content : any){
    this.displayContent = null;
    if(content) this.displayContent = content;
  }


  goToList(wpart: any) {

    if (wpart.linkurl != undefined) {

      if (wpart.inputfields != undefined) {

        let inputfieldsarr: any[] = wpart.inputfields;
        if (inputfieldsarr.length > 0) {
          inputfieldsarr.forEach(elearr => {
            if (elearr.datatype != undefined && elearr.datatype == 'Date') {
              if (elearr.searchvalue != undefined) {
                if ((this.dataparamValue.fromdate != undefined) && (this.dataparamValue.todate != undefined)) {

                  if (elearr.searchvalue['$gte'] != undefined) {
                    elearr.searchvalue['$gte'] = this.dataparamValue.fromdate;
                  }
                  if (elearr.searchvalue['$lte'] != undefined) {
                    elearr.searchvalue['$lte'] = this.dataparamValue.todate;
                  }

                } else {
                  if (elearr.searchvalue['$gte'] != undefined) {
                    elearr.searchvalue['$gte'] = new Date(-8640000000000000);
                  }
                  if (elearr.searchvalue['$lte'] != undefined) {
                    elearr.searchvalue['$lte'] = new Date(8640000000000000);
                  }
                }
              }
            }
            this._commonDataService.filterDataparams['search'].push(elearr);
            this._commonDataService.isfilterData = true;
          });
        }
      }
      if (wpart.filter != undefined) {
        if (wpart.filter.stages != undefined) {
          let stagearry: any[] = wpart.filter.stages;
          stagearry.forEach(ele => {
            if (ele['$match'] != undefined) {
              let matcharr: any[] = ele['$match'];
              if (matcharr.length > 0) {
                matcharr.forEach(ele2 => {
                  this._commonDataService.filterDataparams['search'].push(ele2);
                  this._commonDataService.isfilterData = true;
                });
              }
            }
          });
        }
      }
      this._router.navigate([wpart.linkurl]);
    } else {
      this.showNotification('top', 'right', 'No link url', 'danger');
      return;
    }

  }

  ngAfterViewInit() {
    var breakCards = true;
    if (breakCards == true) {

      $('[data-header-animation="true"]').each(function () {
        var $fix_button = $(this);
        var $card = $(this).parent('.card');
        $card.find('.fix-broken-card').click(function () {
          var $header = $(this).parent().parent().siblings('.card-header, .card-image');
          $header.removeClass('hinge').addClass('fadeInDown');

          $card.attr('data-count', 0);

          setTimeout(function () {
            $header.removeClass('fadeInDown animate');
          }, 480);
        });

        $card.mouseenter(function () {
          var $this = $(this);
          var hover_count = parseInt($this.attr('data-count'), 10) + 1 || 0;
          $this.attr("data-count", hover_count);
          if (hover_count >= 20) {
            $(this).children('.card-header, .card-image').addClass('hinge animated');
          }
        });
      });
    }

    $('[rel="tooltip"]').tooltip();

  }


  startAnimationForLineChart(chart) {
    var seq, delays, durations;
    seq = 0;
    delays = 80;
    durations = 500;
    chart.on('draw', function (data) {

      if (data.type === 'line' || data.type === 'area') {
        data.element.animate({
          d: {
            begin: 600,
            dur: 700,
            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
            to: data.path.clone().stringify(),
            easing: Chartist.Svg.Easing.easeOutQuint
          }
        });
      } else if (data.type === 'point') {
        seq++;
        data.element.animate({
          opacity: {
            begin: seq * delays,
            dur: durations,
            from: 0,
            to: 1,
            easing: 'ease'
          }
        });
      }
    });

    seq = 0;

  }

  startAnimationForBarChart(chart: any) {
    let seq2: number, delays2: number, durations2: number;
    seq2 = 0;
    delays2 = 80;
    durations2 = 500;
    chart.on('draw', function (data: any) {
      if (data.type === 'bar') {
        seq2++;
        data.element.animate({
          opacity: {
            begin: seq2 * delays2,
            dur: durations2,
            from: 0,
            to: 1,
            easing: 'ease'
          }
        });
      }
    });

    seq2 = 0;
  }


  goToSummaryFilter(wpart: any, field: any) {
    let fields: any;
    let currfield: any;
    let summaryRec: any;
    if (wpart.fields != undefined) {
      fields = wpart.fields;
    }
    if (wpart.modeldata != undefined) {
      summaryRec = wpart.modeldata;
    }
    this._commonDataService.summaryfilterDataparams = {};

    if (wpart.webparttype == 'single-data') {
      currfield = fields[0];
    } else {
      currfield = field;
    }

    if (currfield != undefined) {
      if (currfield.hyperlinkinput != undefined) {
        let tmplinkArr: any[] = currfield.hyperlinkinput;
        if (tmplinkArr.length > 0) {
          tmplinkArr.forEach(ele => {
            if (ele.fieldname != undefined) {
              let fieldvaluedata: any;
              if (ele.fieldvalue != undefined) {
                let tmpdata: string = ele.fieldvalue;
                if (tmpdata.includes('#')) {
                  tmpdata = tmpdata.replace('#', '');
                  if (summaryRec != undefined && summaryRec[tmpdata] != undefined) {
                    fieldvaluedata = summaryRec[tmpdata];
                  } else if (currfield.dynamic == true) {
                    fieldvaluedata = currfield.fieldname;
                  }
                } else {
                  fieldvaluedata = ele.fieldvalue;
                }
              }
              if (fieldvaluedata != undefined) {
                let filterobj: any = {};
                filterobj = JSON.parse(JSON.stringify(wpart.filter));

                if (filterobj.matches != undefined) {
                  let inputfieldsarr: any[] = filterobj.matches;
                  if (inputfieldsarr.length > 0) {
                    let tmpobj: any = inputfieldsarr.find(el45 => (el45.searchfield == ele.fieldname && el45.datatype != undefined && el45.datatype == 'Date'));
                    if (tmpobj != undefined) {
                      if (tmpobj.searchvalue != undefined) {
                        if ((this.dataparamValue.fromdate != undefined) && (this.dataparamValue.todate != undefined)) {

                          if (tmpobj.searchvalue['$gte'] != undefined) {
                            tmpobj.searchvalue['$gte'] = this.dataparamValue.fromdate;
                          }
                          if (tmpobj.searchvalue['$lte'] != undefined) {
                            tmpobj.searchvalue['$lte'] = this.dataparamValue.todate;
                          }

                          this._commonDataService.summaryfilterDataparams[ele.fieldname] = tmpobj.searchvalue;

                        } else {
                          if (tmpobj.searchvalue['$gte'] != undefined) {
                            tmpobj.searchvalue['$gte'] = new Date(-8640000000000000);
                          }
                          if (tmpobj.searchvalue['$lte'] != undefined) {
                            tmpobj.searchvalue['$lte'] = new Date(8640000000000000);
                          }

                          this._commonDataService.summaryfilterDataparams[ele.fieldname] = tmpobj.searchvalue;

                        }
                      } else {
                        this._commonDataService.summaryfilterDataparams[ele.fieldname] = fieldvaluedata;
                      }
                    } else {
                      this._commonDataService.summaryfilterDataparams[ele.fieldname] = fieldvaluedata;
                    }
                  } else {
                    this._commonDataService.summaryfilterDataparams[ele.fieldname] = fieldvaluedata;
                  }


                } else {
                  this._commonDataService.summaryfilterDataparams[ele.fieldname] = fieldvaluedata;
                }


                //this._commonDataService.summaryfilterDataparams[ele.fieldname] = fieldvaluedata;
              }

            }
          });


        }
      }
      if (currfield.subqueryid != undefined) {
        this._commonDataService.summaryfilterDataparams.subqueryid = currfield.subqueryid;
      }
    }
    this._router.navigate(['/pages/summary-filter']);
  }

  redirectUrl(webpart: any) {
    this._commonDataService.summaryfilterDataIds = webpart._id;
    var redirecturl = webpart.linkurl;

    this._router.navigate([redirecturl]);
  }

  onOperation(event: any) {
    if (event) {
      this.getrowData2();
      this.showNotification('top', 'right', 'Status updated successfully !!', 'success');
    }
  }

  showNotification(from: any, align: any, msg: any, type: any) {

    $.notify({
      icon: "notifications",
      message: msg
    }, {
      type: type,
      timer: 3000,
      placement: {
        from: from,
        align: align
      }
    });
  }
 

  closeDatePicker(eventData: any, match: any ,webpart : any , dp?:MatDatepicker<Moment>) {

    match.selectedVal = eventData;
    dp.close();
    let postData = {};
    postData['webpartid'] = webpart._id;
    postData['matches'] = [];
    postData['matches'].push({ "searchfield": "year", "searchvalue": eventData._i.year, "criteria": "eq", "datatype": "number" });
    postData['matches'].push({ "searchfield": "month", "searchvalue": eventData._i.month + 1, "criteria": "eq", "datatype": "number" });

    let url = 'dashboard/webpart/filter';
    let method = 'POST';
    webpart.isLoading = true;
    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {

        let fields =  webpart.fields[0];
        let displayName =  [];
        let displatValue =  [];
        
        webpart.CountDataBCH = {};
        webpart.CountDataBCH['labels'] = [];
        webpart.CountDataBCH['series'] = [];
        
        data.data.forEach(ele => {
          displayName.push(ele[fields.displayname]);
          displatValue.push(ele[fields.fieldname]);
        });
        webpart.CountDataBCH['labels'] = displayName;
        webpart.CountDataBCH['series'] = [displatValue];
        setTimeout(() => {
            new Chartist.Bar('#barchart' + webpart._id, webpart.CountDataBCH);
            webpart.isLoading = false;
        }, 500);

      }, (e) => {
        webpart.isLoading = false;

      });

  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
