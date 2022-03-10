
import { Component, OnInit } from '@angular/core';
import { LookupsService } from '../../../../../../../core/services/lookups/lookup.service';
import { SeasonCalendarService } from './../../../../../../../core/services/adminbooking/season-calendar.service';
import { ResortLocationService } from './../../../../../../../core/services/propertis/resortlocation.service';
import { SeasonCalendarModel } from './../../../../../../../core/models/adminbooking/seasoncalender.model';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../../../core/services/common/auth.service';
import { LangresourceService } from '../../../../../../../core/services/langresource/langresource.service';
import swal from 'sweetalert2'

declare var $: any;

@Component({
    moduleId: module.id,
    selector: 'seasonCalendarView-cmp',
    templateUrl: 'season-calendarView.component.html',
    styleUrls: ['./season-calendarView.component.scss']
})

export class SeasonCalendarViewComponent implements OnInit {

    lookupParams: any = {};
    filterParams: any = {};

    zoneOptionsList: any[] = [];
    locationList: any[] = [];
    weekList: any[] = [];
    seasoncalendarupdatedList: any[] = [];
    seasoncalendarToUpdateList: any[] = [];

    seasoncalendarList: {
        week: string,
        seasonLocations: any[]
    }[] = [];

    selectedZone: string = '';
    selectedSeason: string = '';
    selectedbgColor: string = '';
    selectedhoverbgColor: string = '';
    tempbgColor: string = '';

    todayDate: Date = new Date();
    currentSelectedYear: number = 0;
    nextSelectedYear: number = 0;
    prevSelectedYear: number = 0;

    isLoading = false;
    isEdit = false;
    isLoadingdata = false;
    listFilterParams: any = {};

    langResource: any;
    defaultLanguage: any;
    langVisibility = false;

    constructor(
        private _lookupsService: LookupsService,
        private _seasonCalendarService: SeasonCalendarService,
        private _resortLocationService: ResortLocationService,
        private _router: Router,
        private _authService: AuthService,
    ) {
        this.langVisibility = false;
        this._authService.isLoggedIn();

        this.listFilterParams.search = [];
        this.listFilterParams.searchref = [];
        this.listFilterParams.select = [];
        this.listFilterParams.sort = "";

        this.todayDate = new Date(Date.now());
        this.currentSelectedYear = this.todayDate.getFullYear();
        this.nextSelectedYear = this.currentSelectedYear + 1;
        this.prevSelectedYear = this.currentSelectedYear - 1;


        this.selectedSeason = '';
        this.selectedbgColor = 'redbg';
        this.selectedhoverbgColor = '';

        this.lookupParams.search = [];
        this.lookupParams.select = [{ "fieldname": "data", "value": "1" }];
        this.filterParams.search = [];
        this.filterParams.select = [];

        this.getZoneList();
        this.getResortLocationList();
    }
    ngOnInit() {
        this.defaultLanguage = 'ENG';
        this.defaultLanguage = this._authService.auth_language;
        this.langVisibility = false;
    }

    onPrevYearClick() {
        this.nextSelectedYear = this.currentSelectedYear;
        this.currentSelectedYear = this.prevSelectedYear;
        this.prevSelectedYear = this.prevSelectedYear - 1;
        if (this.locationList.length > 0) {
            this.getWeekList();
        }
    }

    onNextYearClick() {
        this.prevSelectedYear = this.currentSelectedYear;
        this.currentSelectedYear = this.nextSelectedYear;
        this.nextSelectedYear = this.currentSelectedYear + 1;
        if (this.locationList.length > 0) {
            this.getWeekList();
        }
    }

    getZoneList() {
        this.lookupParams.search.push({ "searchfield": 'lookup', "searchvalue": "Resort Zone", "criteria": "eq" });

        this._lookupsService.GetByfilterLookupName(this.lookupParams).subscribe(data => {
            if (data) {
                this.zoneOptionsList = data[0].data;
                if (this.zoneOptionsList.length > 0) {
                    this.selectedZone = this.zoneOptionsList[0].name;
                }
                this.onZoneChange();
            }
        });
    }

    getResortLocationList() {
        this.filterParams.search = [];
        this.filterParams.search.push({ "searchfield": 'property.zone', "searchvalue": this.selectedZone, "criteria": "eq" });
        this._resortLocationService.GetByfilter(this.filterParams).subscribe(data => {
            if (data) {
                this.locationList = [];
                this.locationList = data;
                if (this.locationList.length > 0) {
                    this.getWeekList();
                } else {
                    this.weekList = [];
                    this.seasoncalendarList = [];
                }
            }
        });
    }

    onZoneChange() {
        this.getResortLocationList();
    }

    getWeekList() {
        this.isLoading = true;
        this._seasonCalendarService.GetWeekListByYear(this.currentSelectedYear).subscribe(data => {
            if (data) {
                this.weekList = data;
                this.seasoncalendarList = [];
                this.weekList.forEach(ele => {
                    let tmp: any[] = [];
                    this.locationList.forEach(ele2 => {
                        let seasonCal = new SeasonCalendarModel();
                        seasonCal.startperiod = ele;
                        seasonCal.location = ele2._id;
                        seasonCal.locationname = ele2.property.locationname;
                        seasonCal.seasoncolor = "graybg";
                        tmp.push(seasonCal);
                    });
                    if (tmp.length == this.locationList.length) {
                        let tempO: any = {};
                        tempO.week = ele;
                        tempO.seasonLocations = tmp;
                        this.seasoncalendarList.push(tempO);
                    }
                    if (this.seasoncalendarList.length == this.weekList.length) {
                        this.getAllSeasonCalendar();
                        this.isLoading = false;
                    }
                });
            }
        })
    }

    changeSeason(locObj: SeasonCalendarModel) {
        if (this.selectedSeason == '') {
            return;
        }
        locObj.endperiod = new Date(new Date(locObj.startperiod).setDate(new Date(locObj.startperiod).getDate() + 6));
        locObj.seasoncolor = this.selectedbgColor;
        locObj.season = this.selectedSeason;
        if (this.selectedSeason == 'Gray') {
            if (locObj.seasoncalendarid != undefined && locObj.seasoncalendarid != null && locObj.seasoncalendarid != '') {
                locObj._id = locObj.seasoncalendarid;
                this._seasonCalendarService.Delete(locObj.seasoncalendarid).subscribe(data => {
                    if (data) {
                        locObj._id = '';
                        locObj.seasoncalendarid = '';
                    }
                });
            }

        } else {
            if (locObj.seasoncalendarid != undefined && locObj.seasoncalendarid != null && locObj.seasoncalendarid != '') {
                locObj._id = locObj.seasoncalendarid;
                this._seasonCalendarService.Update(locObj.seasoncalendarid, locObj).subscribe(data => {
                    if (data) {
                    }
                });
            } else {
                this._seasonCalendarService.Add(locObj).subscribe(data => {
                    if (data) {
                        if (data._id) {
                            locObj._id = data._id;
                            locObj.seasoncalendarid = data._id;
                        }
                    }
                });
            }
        }
    }

    setSeasonBG(bgcolor: string, season: string, hovercolorbg: string) {
        this.selectedbgColor = bgcolor;
        this.selectedSeason = season;
        this.selectedhoverbgColor = hovercolorbg;
    }

    changeStyle(element: any) {
        this.tempbgColor = element.target.style.backgroundColor;
        element.target.style.backgroundColor = this.selectedhoverbgColor;
    }

    resetStyle(element: any) {
        element.target.style.backgroundColor = this.tempbgColor;
    }

    clearSeasonsByYear() {
        var temp = this;
        swal.fire({
            title: 'Are you sure to Clear Seasons?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, clear it!',
            customClass: {
                confirmButton: "btn btn-success",
                cancelButton: "btn btn-danger",
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {

                temp._seasonCalendarService.ClearSeasonByYear(temp.currentSelectedYear)
                    .subscribe(data => {
                        if (data) {
                            temp.getWeekList();
                        }
                    });
                swal.fire({
                    title: 'Cleared!',
                    text: 'All Season has been cleared.',
                    icon: 'success',
                    customClass: {
                        confirmButton: "btn btn-success",
                    },
                    buttonsStyling: false
                })
            }
            else {
                swal.fire({
                    title: 'Cancelled',
                    text: 'Season Detail Record is safe :)',
                    icon: 'error',
                    customClass: {
                        confirmButton: "btn btn-info",
                    },
                    buttonsStyling: false
                });
            }
        })
    }

    getAllSeasonCalendar() {
        this.isLoadingdata = true;
        this.listFilterParams.select.push({ "value": 1, "fieldname": "season" });
        this.listFilterParams.select.push({ "value": 1, "fieldname": "location" });
        this.listFilterParams.select.push({ "value": 1, "fieldname": "startperiod" });
        this.listFilterParams.select.push({ "value": 1, "fieldname": "endperiod" });

        this._seasonCalendarService.GetByfilter(this.listFilterParams).subscribe(data => {
            if (data) {
                this.seasoncalendarupdatedList = data;
                let len = data.length;
                let cnt = 0;
                if (this.seasoncalendarupdatedList.length > 0) {
                    this.seasoncalendarupdatedList.forEach(ele => {
                        this.seasoncalendarList.forEach(ele2 => {
                            if (new Date(ele.startperiod).getDate() == new Date(ele2.week).getDate()) {
                                if (new Date(ele.startperiod).getMonth() == new Date(ele2.week).getMonth()) {
                                    if (new Date(ele.startperiod).getFullYear() == new Date(ele2.week).getFullYear()) {

                                        if (ele2.seasonLocations.length > 0) {
                                            ele2.seasonLocations.forEach(ele3 => {
                                                if (ele3.location == ele.location) {
                                                    ele3.season = ele.season;
                                                    ele3.seasoncalendarid = ele._id;
                                                    ele3._id = ele._id;
                                                    if (ele.season == 'Red') {
                                                        ele3.seasoncolor = 'redbg';
                                                    } else if (ele.season == 'Blue') {
                                                        ele3.seasoncolor = 'bluebg';
                                                    } else if (ele.season == 'White') {
                                                        ele3.seasoncolor = 'whitebg';
                                                    } else if (ele.season == 'Gray') {
                                                        ele3.seasoncolor = 'graybg';
                                                    }
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                        });

                        cnt++;
                        if (cnt == len) {
                            this.isLoadingdata = false;
                        }
                    });
                }
            }
        });
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



}
