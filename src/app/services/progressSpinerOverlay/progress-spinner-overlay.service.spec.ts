import { TestBed } from '@angular/core/testing';

import { ProgressSpinnerOverlayService } from './progress-spinner-overlay.service';

describe('ProgressSpinnerOverlayService', () => {
  let service: ProgressSpinnerOverlayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgressSpinnerOverlayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
