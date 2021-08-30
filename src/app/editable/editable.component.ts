import { Component, ContentChild, ElementRef, EventEmitter, OnInit, Output } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { filter, switchMapTo, take } from 'rxjs/operators';
import { EditModeDirective } from '../directives/editMode';
import { ViewModeDirective } from '../directives/viewMode';

@Component({
  selector: 'editable',
  templateUrl: './editable.component.html',
  styleUrls: ['./editable.component.scss']
})
export class EditableComponent implements OnInit {

  @Output() update = new EventEmitter();
  @ContentChild(ViewModeDirective) viewModeTpl!: ViewModeDirective;
  @ContentChild(EditModeDirective) editModeTpl!: EditModeDirective;

  mode: 'view' | 'edit' = 'view';
  editMode = new Subject();
  editMode$ = this.editMode.asObservable();

  constructor(private host: ElementRef) {
  }

  get currentView() {
    return this.mode === 'view' ? this.viewModeTpl.tpl : this.editModeTpl.tpl ?? null;
  }

  ngOnInit() {
    this.viewModeHandler();
    this.editModeHandler();
  }

  private get element() {
    return this.host.nativeElement;
  }

  private viewModeHandler() {
    fromEvent(this.element, 'dblclick').pipe().subscribe(() => {
      this.mode = 'edit';
      this.editMode.next(true);
    });
  }

  private editModeHandler() {
    const clickOutside$ = fromEvent(document, 'click').pipe(
      filter(({ target }) => this.element.contains(target) === false),
      take(1)
    )
    this.editMode$.pipe(
      switchMapTo(clickOutside$)
    ).subscribe(() => {
      // this.update.next();
      this.mode = 'view';
    });
  }

  clicked(){
    this.update.next();
    this.mode = 'view';
  }

}


