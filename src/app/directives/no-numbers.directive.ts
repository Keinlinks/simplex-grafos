import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appNoNumbers]',
  standalone: true,
})
export class NoNumbersDirective {
  constructor() {}
  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    if (
      (event.key >= '0' && event.key <= '9') ||
      (event.keyCode >= 96 && event.keyCode <= 105)
    ) {
      event.preventDefault();
    }
  }
}
