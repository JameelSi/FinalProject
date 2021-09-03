import { TestBed } from '@angular/core/testing';

import { AdminOrManagerGuard } from './admin-or-manager.guard';

describe('AdminOrManagerGuard', () => {
  let guard: AdminOrManagerGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AdminOrManagerGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
