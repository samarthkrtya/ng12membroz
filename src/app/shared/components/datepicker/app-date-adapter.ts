import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from "@angular/material/core";

export class AppDateAdapter extends NativeDateAdapter {
    
    parse(value: any): Date | null {
        if ((typeof value === 'string') && (value.indexOf('/') > -1)) {
            const str = value.split('/');
            const year = Number(str[2]);
            const month = Number(str[1]) - 1;
            const date = Number(str[0]);
            return new Date(year, month, date);
        }
        const timestamp = typeof value === 'number' ? value : Date.parse(value);
        return isNaN(timestamp) ? null : new Date(timestamp);
    }

   format(date: Date, displayFormat: Object): string {
       if (displayFormat == "input") {
           let day = date.getDate();
           let month = date.getMonth() + 1;
           let year = date.getFullYear();
           return this._to2digit(day) + '/' + this._to2digit(month) + '/' + year;
            
       } else {
           return date.toDateString();
       }
   }

   private _to2digit(n: number) {
       return ('00' + n).slice(-2);
   } 
}