import { Component, OnInit, ElementRef, Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import * as myGlobals from './globals';
import { AuthService } from '../../core/services/common/auth.service';

@Pipe({
    name: "myCurrencyPipe"
})
export class MyCurrencyPipe implements PipeTransform, OnInit {

    currencyCode: string = '';
    isAppCurr = false;
    currentuserBranch: any;

    constructor(
        private currencyPipe: CurrencyPipe,
        private authService: AuthService,
    ) {
        if (this.authService.currentUser) {
            this.currencyCode = this.authService.currentUser.currency;
        }
    }

    ngOnInit() {

    }

    transform(value: any): string {
        if (this.currencyCode == 'Indian rupee') {
            this.currencyCode = 'INR';
        }
        var symbolDisplay;
        var digits = myGlobals.gdigits;

        let transformed = this.currencyPipe.transform(value, this.currencyCode, 'symbol-narrow');
        // let myTransformed: string[] = [];
        // for (var i = 0; i < transformed.length; i++) {
        //     if (!this.isLetter(transformed[i])) {
        //         myTransformed.push(transformed[i])
        //     }
        // }
        // return myTransformed.join("");
        return transformed;
    }

    isLetter(c: any) {
        return c.toLowerCase() != c.toUpperCase();
    }
}