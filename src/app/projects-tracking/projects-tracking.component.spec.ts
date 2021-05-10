import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsTrackingComponent } from './projects-tracking.component';

describe('ProjectsTrackingComponent', () => {
  let component: ProjectsTrackingComponent;
  let fixture: ComponentFixture<ProjectsTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectsTrackingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
