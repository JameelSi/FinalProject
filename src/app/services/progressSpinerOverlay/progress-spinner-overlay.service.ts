import { Injectable } from '@angular/core';
//cdk
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { MatSpinner } from '@angular/material/progress-spinner';
//rxjs
import { mapTo, scan, map, distinctUntilChanged } from 'rxjs/operators'
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProgressSpinnerOverlayService {

  private spinnerTopRef: OverlayRef;

  private spin$: Subject<number> = new Subject()

  constructor(
    private overlay: Overlay,
  ) {

    this.spinnerTopRef = this.overlay.create({
      hasBackdrop: true,
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically()
    });

    this.spin$
      .asObservable()
      .pipe(
        scan((acc, next) => {
          if(!next) return 0;
          return (acc + next) >= 0 ? acc + next : 0;
        }, 0),
        map(val => val > 0),
        distinctUntilChanged()
      )
      .subscribe(
        (res) => {
          if (res) {
    this.spinnerTopRef.attach(new ComponentPortal(MatSpinner))
          }
          else if (this.spinnerTopRef.hasAttached()) {
            this.spinnerTopRef.detach();
          }
        }
      )
  }
  show() {
    this.spin$.next(1);
  }
  hide() {
    this.spin$.next(-1);
  }
  reset() {
    this.spin$.next(0);
  }


}
